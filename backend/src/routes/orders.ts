import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from './auth'
import { AuthRequest } from '../middleware/auth'
import { GoogleCalendarService } from '../services/googleCalendar'
import { sendOrderConfirmation } from '../utils/emailService'
import { sendOrderConfirmationWhatsApp } from '../services/whatsapp.service'

const router = Router()
const prisma = new PrismaClient()

/**
 * Helper function to sync order with Canary Calendar System
 */
async function syncOrderToCanaryCalendar(order: any, companyId: number, action: 'create' | 'update' | 'delete') {
  try {
    if (action === 'create') {
      // Create calendar event for order
      await prisma.calendarEvent.create({
        data: {
          title: `Order: ${order.orderNumber}`,
          description: `Customer: ${order.customer?.name || 'Unknown'}\nStatus: ${order.status}`,
          eventType: 'ORDER',
          startDate: order.startDate,
          endDate: order.endDate,
          status: 'SCHEDULED',
          priority: 'HIGH',
          color: '#10b981', // Green for orders
          orderId: order.id,
          customerId: order.customerId,
          companyId: companyId,
          notes: order.notes,
        },
      });

      // Create delivery event (day before end date)
      const deliveryDate = new Date(order.startDate);
      await prisma.calendarEvent.create({
        data: {
          title: `Delivery: ${order.orderNumber}`,
          description: `Deliver equipment to ${order.customer?.name || 'Unknown'}`,
          eventType: 'DELIVERY',
          startDate: deliveryDate,
          endDate: new Date(deliveryDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours
          allDay: false,
          status: 'SCHEDULED',
          priority: 'HIGH',
          color: '#3b82f6', // Blue for deliveries
          orderId: order.id,
          customerId: order.customerId,
          companyId: companyId,
          location: order.customer?.address || '',
        },
      });

      // Create pickup event (on end date)
      const pickupDate = new Date(order.endDate);
      await prisma.calendarEvent.create({
        data: {
          title: `Pickup: ${order.orderNumber}`,
          description: `Pick up equipment from ${order.customer?.name || 'Unknown'}`,
          eventType: 'PICKUP',
          startDate: pickupDate,
          endDate: new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours
          allDay: false,
          status: 'SCHEDULED',
          priority: 'HIGH',
          color: '#f59e0b', // Orange for pickups
          orderId: order.id,
          customerId: order.customerId,
          companyId: companyId,
          location: order.customer?.address || '',
        },
      });
    } else if (action === 'update') {
      // Update all events related to this order
      await prisma.calendarEvent.updateMany({
        where: { orderId: order.id },
        data: {
          description: `Customer: ${order.customer?.name || 'Unknown'}\nStatus: ${order.status}`,
          startDate: order.startDate,
          endDate: order.endDate,
          notes: order.notes,
        },
      });

      // Update status based on order status
      const eventStatus = order.status === 'COMPLETED' ? 'COMPLETED' : 
                         order.status === 'CANCELLED' ? 'CANCELLED' : 
                         order.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 
                         'SCHEDULED';

      await prisma.calendarEvent.updateMany({
        where: { orderId: order.id },
        data: { status: eventStatus },
      });
    } else if (action === 'delete') {
      // Delete all calendar events for this order
      await prisma.calendarEvent.deleteMany({
        where: { orderId: order.id },
      });
    }
  } catch (error) {
    console.error('Canary Calendar sync error:', error);
    // Log error but don't fail the order operation
  }
}

/**
 * Helper function to sync order with Google Calendar
 */
async function syncOrderToCalendar(order: any, userId: number, action: 'create' | 'update' | 'delete') {
  try {
    // Get user's Google Calendar tokens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleCalendarEnabled: true
      }
    });

    // Skip if calendar not enabled
    if (!user?.googleCalendarEnabled || !user.googleAccessToken) {
      return;
    }

    const calendarService = new GoogleCalendarService(
      user.googleAccessToken,
      user.googleRefreshToken || undefined
    );

    if (action === 'create') {
      // Create calendar event
      const event = await calendarService.createEvent({
        id: order.id,
        orderNumber: order.orderNumber,
        startDate: order.startDate,
        endDate: order.endDate,
        equipment: order.orderItems?.map((item: any) => ({
          name: item.equipment?.name || 'Unknown',
          id: item.equipmentId
        })) || [],
        customer: {
          name: order.customer?.name || 'Unknown',
          email: order.customer?.email
        },
        notes: order.notes,
        deliveryAddress: order.customer?.address
      });

      // Update order with event ID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          googleEventId: event.id!,
          googleEventLink: event.htmlLink!,
          calendarSynced: true,
          calendarSyncedAt: new Date()
        }
      });
    } else if (action === 'update' && order.googleEventId) {
      // Update existing calendar event
      await calendarService.updateEvent(order.googleEventId, {
        orderNumber: order.orderNumber,
        startDate: order.startDate,
        endDate: order.endDate,
        equipment: order.orderItems?.map((item: any) => ({
          name: item.equipment?.name || 'Unknown'
        })) || [],
        customer: {
          name: order.customer?.name || 'Unknown',
          email: order.customer?.email
        },
        notes: order.notes,
        deliveryAddress: order.customer?.address,
        status: order.status
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          calendarSynced: true,
          calendarSyncedAt: new Date()
        }
      });
    } else if (action === 'delete' && order.googleEventId) {
      // Delete calendar event
      await calendarService.deleteEvent(order.googleEventId);
    }
  } catch (error) {
    console.error('Calendar sync error:', error);
    // Log error but don't fail the order operation
  }
}

// Tüm siparişleri getir (with advanced filtering & sorting)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { 
      status, 
      customerId, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '50'
    } = req.query;

    // Build where clause
    const where: any = {
      companyId: req.companyId
    };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = parseInt(customerId as string);
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) {
        where.startDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate as string);
      }
    }

    if (minAmount || maxAmount) {
      where.totalAmount = {};
      if (minAmount) {
        where.totalAmount.gte = parseFloat(minAmount as string);
      }
      if (maxAmount) {
        where.totalAmount.lte = parseFloat(maxAmount as string);
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { notes: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await prisma.order.count({ where });

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'customer') {
      orderBy.customer = { name: sortOrder };
    } else if (sortBy === 'amount') {
      orderBy.totalAmount = sortOrder;
    } else {
      orderBy[sortBy as string] = sortOrder;
    }

    const orders = await prisma.order.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                model: true,
                qrCode: true,
              },
            },
          },
        },
      },
    })

    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Siparişler getirilemedi:', error)
    res.status(500).json({ message: 'Siparişler getirilemedi' })
  }
})

// Tek sipariş getir
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        items: {
          include: {
            equipment: true,
          },
        },
      },
    })

    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' })
    }

    res.json(order)
  } catch (error) {
    console.error('Sipariş getirilemedi:', error)
    res.status(500).json({ message: 'Sipariş getirilemedi' })
  }
})

// Yeni sipariş oluştur
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { customerId, startDate, endDate, items, notes } = req.body

    // Sipariş numarası oluştur
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`

    // Toplam tutarı hesapla
    let totalAmount = 0
    for (const item of items) {
      totalAmount += item.totalPrice
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: parseInt(customerId),
        companyId: req.companyId, // Add company relation
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount,
        status: 'PENDING',
        notes,
        orderItems: {
          create: items.map((item: any) => ({
            equipmentId: parseInt(item.equipmentId),
            quantity: parseInt(item.quantity),
            dailyRate: parseFloat(item.pricePerDay || item.dailyRate),
            totalAmount: parseFloat(item.totalPrice || item.totalAmount),
          })),
        },
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            equipment: true,
          },
        },
      },
    })

    // Sync to Canary Calendar System (always)
    await syncOrderToCanaryCalendar(order, req.companyId, 'create');

    // Sync to Google Calendar (if enabled)
    await syncOrderToCalendar(order, req.userId, 'create');

    // Send order confirmation email
    try {
      if (order.customer?.email) {
        const equipment = order.orderItems.map(item => ({
          name: item.equipment.name,
          quantity: item.quantity,
          price: `${item.totalAmount} TL`
        }));

        const startDateFormatted = new Date(order.startDate).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const endDateFormatted = new Date(order.endDate).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const duration = Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24));

        await sendOrderConfirmation(order.customer.email, {
          customerName: order.customer.name,
          orderNumber: order.orderNumber,
          startDate: startDateFormatted,
          endDate: endDateFormatted,
          duration,
          equipment,
          totalAmount: `${order.totalAmount} TL`,
          deliveryMethod: 'Ofisten Teslim', // Bu bilgiyi order'a ekleyebilirsiniz
          orderUrl: `${process.env.FRONTEND_URL || 'https://frontend-5a3yqvtgp-umityamans-projects.vercel.app'}/orders/${order.id}`,
          notes: order.notes || undefined
        });

        console.log(`✅ Order confirmation email sent to ${order.customer.email}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send order confirmation email:', emailError);
      // Email hatası olsa bile sipariş başarılı oldu
    }

    // Send WhatsApp order confirmation
    try {
      if (order.customer?.phone) {
        const startDateFormatted = new Date(order.startDate).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const endDateFormatted = new Date(order.endDate).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const whatsappResult = await sendOrderConfirmationWhatsApp({
          customerName: order.customer.name,
          customerPhone: order.customer.phone,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          pickupDate: startDateFormatted,
          returnDate: endDateFormatted,
        });

        if (whatsappResult.success) {
          console.log(`✅ WhatsApp order confirmation sent to ${order.customer.phone}`);
        } else {
          console.warn(`⚠️  WhatsApp failed: ${whatsappResult.error}`);
        }
      }
    } catch (whatsappError) {
      console.error('❌ Failed to send WhatsApp order confirmation:', whatsappError);
      // WhatsApp hatası olsa bile sipariş başarılı oldu
    }

    res.status(201).json(order)
  } catch (error) {
    console.error('Sipariş oluşturulamadı:', error)
    res.status(500).json({ message: 'Sipariş oluşturulamadı' })
  }
})

// Sipariş güncelle
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { status, startDate, endDate, notes, totalAmount } = req.body

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && { status }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(notes && { notes }),
        ...(totalAmount && { totalAmount: parseFloat(totalAmount) }),
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            equipment: true,
          },
        },
      },
    })

    // Sync to Canary Calendar System (always)
    await syncOrderToCanaryCalendar(order, req.companyId, 'update');

    // Sync to Google Calendar (if enabled)
    await syncOrderToCalendar(order, req.userId, 'update');

    res.json(order)
  } catch (error) {
    console.error('Sipariş güncellenemedi:', error)
    res.status(500).json({ message: 'Sipariş güncellenemedi' })
  }
})

// Sipariş sil
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Get order with Google event ID before deletion
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      select: { googleEventId: true }
    });

    // Sync to Canary Calendar System (delete events)
    await syncOrderToCanaryCalendar({ id: parseInt(id) }, req.companyId, 'delete');

    // Sync to Google Calendar (delete event if enabled)
    if (order) {
      await syncOrderToCalendar(order, req.userId, 'delete');
    }

    // Önce order items'ları sil
    await prisma.orderItem.deleteMany({
      where: { orderId: parseInt(id) },
    })

    // Sonra order'ı sil
    await prisma.order.delete({
      where: { id: parseInt(id) },
    })

    res.json({ message: 'Sipariş silindi' })
  } catch (error) {
    console.error('Sipariş silinemedi:', error)
    res.status(500).json({ message: 'Sipariş silinemedi' })
  }
})

// Bulk update status
router.post('/bulk/update-status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { orderIds, status } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Order IDs are required' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const result = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        companyId: req.companyId
      },
      data: { status }
    });

    res.json({
      message: `${result.count} orders updated successfully`,
      count: result.count
    });
  } catch (error) {
    console.error('Bulk update failed:', error);
    res.status(500).json({ message: 'Bulk update failed' });
  }
});

// Bulk delete
router.post('/bulk/delete', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Order IDs are required' });
    }

    // Delete order items first
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: orderIds } }
    });

    // Delete calendar events
    await prisma.calendarEvent.deleteMany({
      where: { orderId: { in: orderIds } }
    });

    // Delete orders
    const result = await prisma.order.deleteMany({
      where: {
        id: { in: orderIds },
        companyId: req.companyId
      }
    });

    res.json({
      message: `${result.count} orders deleted successfully`,
      count: result.count
    });
  } catch (error) {
    console.error('Bulk delete failed:', error);
    res.status(500).json({ message: 'Bulk delete failed' });
  }
});

// Send order email
router.post('/:id/email', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { recipient, subject, body, template } = req.body;

    if (!recipient || !subject || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient, subject, and body are required' 
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            equipment: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Replace variables in subject and body
    const replacedSubject = subject
      .replace(/#{ORDER_ID}/g, order.orderNumber || order.id.toString())
      .replace(/#{CUSTOMER_NAME}/g, order.customer?.name || 'Customer')
      .replace(/#{PICKUP_DATE}/g, order.startDate ? new Date(order.startDate).toLocaleDateString() : 'N/A')
      .replace(/#{RETURN_DATE}/g, order.endDate ? new Date(order.endDate).toLocaleDateString() : 'N/A')
      .replace(/#{TOTAL_AMOUNT}/g, `£${order.totalAmount?.toFixed(2) || '0.00'}`);

    const replacedBody = body
      .replace(/#{ORDER_ID}/g, order.orderNumber || order.id.toString())
      .replace(/#{CUSTOMER_NAME}/g, order.customer?.name || 'Customer')
      .replace(/#{PICKUP_DATE}/g, order.startDate ? new Date(order.startDate).toLocaleDateString() : 'N/A')
      .replace(/#{RETURN_DATE}/g, order.endDate ? new Date(order.endDate).toLocaleDateString() : 'N/A')
      .replace(/#{TOTAL_AMOUNT}/g, `£${order.totalAmount?.toFixed(2) || '0.00'}`);

    // Send email using emailService
    await sendOrderConfirmation({
      to: recipient,
      subject: replacedSubject,
      html: replacedBody.replace(/\n/g, '<br>')
    });

    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email', 
      error: error.message 
    });
  }
});

// Get order tags
router.get('/:id/tags', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId
      },
      select: {
        tags: true
      }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Parse tags JSON if stored as JSON
    const tags = order.tags ? (typeof order.tags === 'string' ? JSON.parse(order.tags) : order.tags) : [];

    res.json({
      success: true,
      data: tags
    });
  } catch (error: any) {
    console.error('Get tags error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get tags', 
      error: error.message 
    });
  }
});

// Add order tag
router.post('/:id/tags', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tag name and color are required' 
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId
      }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Get existing tags
    let existingTags = [];
    if (order.tags) {
      existingTags = typeof order.tags === 'string' ? JSON.parse(order.tags) : order.tags;
    }

    // Add new tag
    const newTag = {
      id: Date.now().toString(),
      name,
      color,
      createdAt: new Date().toISOString()
    };

    existingTags.push(newTag);

    // Update order with new tags
    await prisma.order.update({
      where: { id: parseInt(id) },
      data: { 
        tags: JSON.stringify(existingTags)
      }
    });

    res.json({
      success: true,
      data: newTag
    });
  } catch (error: any) {
    console.error('Add tag error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add tag', 
      error: error.message 
    });
  }
});

// Remove order tag
router.delete('/:id/tags/:tagId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id, tagId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId
      }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Get existing tags
    let existingTags = [];
    if (order.tags) {
      existingTags = typeof order.tags === 'string' ? JSON.parse(order.tags) : order.tags;
    }

    // Remove tag
    const updatedTags = existingTags.filter((tag: any) => tag.id !== tagId);

    // Update order
    await prisma.order.update({
      where: { id: parseInt(id) },
      data: { 
        tags: JSON.stringify(updatedTags)
      }
    });

    res.json({
      success: true,
      message: 'Tag removed successfully'
    });
  } catch (error: any) {
    console.error('Remove tag error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove tag', 
      error: error.message 
    });
  }
});

// Get order documents
router.get('/:id/documents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId
      },
      select: {
        documents: true
      }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Parse documents JSON if stored as JSON
    const documents = order.documents ? (typeof order.documents === 'string' ? JSON.parse(order.documents) : order.documents) : [];

    res.json({
      success: true,
      data: documents
    });
  } catch (error: any) {
    console.error('Get documents error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get documents', 
      error: error.message 
    });
  }
});

// Upload order document (simulated - in production would handle file upload)
router.post('/:id/documents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, size, type, url } = req.body;

    if (!name || !size || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Document name, size, and type are required' 
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId
      }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Get existing documents
    let existingDocuments = [];
    if (order.documents) {
      existingDocuments = typeof order.documents === 'string' ? JSON.parse(order.documents) : order.documents;
    }

    // Add new document
    const newDocument = {
      id: Date.now().toString(),
      name,
      size,
      type,
      url: url || `/uploads/orders/${id}/${name}`,
      uploadedAt: new Date().toISOString()
    };

    existingDocuments.push(newDocument);

    // Update order with new documents
    await prisma.order.update({
      where: { id: parseInt(id) },
      data: { 
        documents: JSON.stringify(existingDocuments)
      }
    });

    res.json({
      success: true,
      data: newDocument
    });
  } catch (error: any) {
    console.error('Upload document error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload document', 
      error: error.message 
    });
  }
});

// Remove order document
router.delete('/:id/documents/:docId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id, docId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId
      }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Get existing documents
    let existingDocuments = [];
    if (order.documents) {
      existingDocuments = typeof order.documents === 'string' ? JSON.parse(order.documents) : order.documents;
    }

    // Remove document
    const updatedDocuments = existingDocuments.filter((doc: any) => doc.id !== docId);

    // Update order
    await prisma.order.update({
      where: { id: parseInt(id) },
      data: { 
        documents: JSON.stringify(updatedDocuments)
      }
    });

    res.json({
      success: true,
      message: 'Document removed successfully'
    });
  } catch (error: any) {
    console.error('Remove document error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove document', 
      error: error.message 
    });
  }
});

export default router
