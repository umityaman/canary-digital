import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from './auth'
import { AuthRequest } from '../middleware/auth'
import { GoogleCalendarService } from '../services/googleCalendar'
import { sendOrderConfirmation, sendEmail } from '../utils/emailService'
import PDFDocument from 'pdfkit'
import { sendOrderConfirmationWhatsApp } from '../services/whatsapp.service'
import notificationService from '../services/notification.service'

const router = Router()
const prisma = new PrismaClient() as any
const p = prisma as any

/**
 * Helper function to sync order with Canary Calendar System
 */
async function syncOrderToCanaryCalendar(order: any, companyId: number, action: 'create' | 'update' | 'delete') {
  try {
    if (action === 'create') {
      // Create calendar event for order
  await p.calendarEvent.create({
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
  await p.calendarEvent.create({
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
  await p.calendarEvent.create({
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
  await p.calendarEvent.updateMany({
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

  await p.calendarEvent.updateMany({
        where: { orderId: order.id },
        data: { status: eventStatus },
      });
    } else if (action === 'delete') {
      // Delete all calendar events for this order
  await p.calendarEvent.deleteMany({
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
  const user = await p.user.findUnique({
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

/**
 * Send notification to accounting team when order is completed
 */
async function notifyAccountingOnOrderComplete(order: any, companyId: number) {
  try {
    // Get users with 'accounting' or 'admin' role
    const accountingUsers = await prisma.user.findMany({
      where: {
        companyId,
        role: {
          in: ['accounting', 'admin', 'accountant']
        }
      },
      select: { id: true, email: true, name: true }
    });

    if (accountingUsers.length === 0) {
      console.log('No accounting users found to notify');
      return;
    }

    // Prepare notification details
    const customerName = order.customer?.name || 'Müşteri';
    const orderNumber = order.orderNumber || `#${order.id}`;
    const equipmentNames = order.orderItems?.map((item: any) => item.equipment?.name).filter(Boolean).join(', ') || 'Ekipman';
    const totalAmount = order.totalAmount ? `₺${order.totalAmount.toLocaleString('tr-TR')}` : '';

    // Send notification to each accounting user
    for (const user of accountingUsers) {
      try {
        // Send push notification
        await notificationService.sendNotification({
          userId: user.id,
          title: '📦 Sipariş Tamamlandı',
          body: `${customerName} - ${orderNumber}\n${equipmentNames}${totalAmount ? ` - ${totalAmount}` : ''}`,
          data: {
            type: 'order_completed',
            orderId: order.id,
            orderNumber,
            customerId: order.customerId,
            customerName,
            totalAmount: order.totalAmount,
            screen: 'Accounting',
            tab: 'invoice'
          },
          type: 'order_completed',
          priority: 'high'
        });

        // Also send email notification
        await sendEmail({
          to: user.email,
          subject: `Sipariş Tamamlandı - ${orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #059669;">🎉 Sipariş Tamamlandı</h2>
              <p>Merhaba ${user.name || 'Değerli Kullanıcı'},</p>
              <p>Aşağıdaki sipariş tamamlandı ve faturalama için hazır:</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Sipariş No:</strong> ${orderNumber}</p>
                <p style="margin: 5px 0;"><strong>Müşteri:</strong> ${customerName}</p>
                <p style="margin: 5px 0;"><strong>Ekipman:</strong> ${equipmentNames}</p>
                ${totalAmount ? `<p style="margin: 5px 0;"><strong>Tutar:</strong> ${totalAmount}</p>` : ''}
              </div>
              <p>Muhasebe sisteminden fatura oluşturabilirsiniz.</p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                Bu otomatik bir bildirimdir. Lütfen yanıtlamayın.
              </p>
            </div>
          `
        }).catch(err => console.error('Email send failed:', err));

        console.log(`Notification sent to accounting user: ${user.email}`);
      } catch (error) {
        console.error(`Failed to notify user ${user.id}:`, error);
      }
    }

    console.log(`Order completion notifications sent to ${accountingUsers.length} accounting users`);
  } catch (error) {
    console.error('Failed to notify accounting team:', error);
    // Don't throw error - notification failure shouldn't break order update
  }
}

// Tüm siparişleri getir (with advanced filtering & sorting)
router.get('/', authenticateToken, async (req: any, res) => {
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
  const total = await p.order.count({ where });

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'customer') {
      orderBy.customer = { name: sortOrder };
    } else if (sortBy === 'amount') {
      orderBy.totalAmount = sortOrder;
    } else {
      orderBy[sortBy as string] = sortOrder;
    }

  const orders = await p.order.findMany({
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
    }) as any

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
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
  const order = await p.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        items: {
          include: {
            equipment: true,
          },
        },
      },
    }) as any

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
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { customerId, startDate, endDate, items, notes } = req.body

    // Sipariş numarası oluştur
  const orderCount = await p.order.count()
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`

    // Toplam tutarı hesapla
    let totalAmount = 0
    for (const item of items) {
      totalAmount += item.totalPrice
    }

  const order = await p.order.create({
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
  }) as any

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
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const { status, startDate, endDate, notes, totalAmount } = req.body

    // Get old order to check status change
    const oldOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      select: { status: true }
    });

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
  }) as any

    // Sync to Canary Calendar System (always)
    await syncOrderToCanaryCalendar(order, req.companyId, 'update');

    // Sync to Google Calendar (if enabled)
    await syncOrderToCalendar(order, req.userId, 'update');

    // Send notification to accounting if order is completed
    if (status && oldOrder && oldOrder.status !== 'completed' && status === 'completed') {
      await notifyAccountingOnOrderComplete(order, req.companyId);
    }

    res.json(order)
  } catch (error) {
    console.error('Sipariş güncellenemedi:', error)
    res.status(500).json({ message: 'Sipariş güncellenemedi' })
  }
})

// Sipariş sil
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params

    // Get order with Google event ID before deletion
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      select: { googleEventId: true }
    }) as any;

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
router.post('/bulk/update-status', authenticateToken, async (req: any, res) => {
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
router.post('/bulk/delete', authenticateToken, async (req: any, res) => {
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
router.post('/:id/email', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { recipient, subject, body, template } = req.body;

    if (!recipient || !subject || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient, subject, and body are required' 
      });
    }

    const order = await (prisma.order.findFirst as any)({
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

    // Send email using emailService (direct send)
    await sendEmail({
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
router.get('/:id/tags', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const order = await (prisma.order.findFirst as any)({
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
router.post('/:id/tags', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tag name and color are required' 
      });
    }

    const order = await (prisma.order.findFirst as any)({
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
    await (prisma.order.update as any)({
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
router.delete('/:id/tags/:tagId', authenticateToken, async (req: any, res) => {
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
router.get('/:id/documents', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const order = await (prisma.order.findFirst as any)({
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
router.post('/:id/documents', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, size, type, url } = req.body;

    if (!name || !size || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Document name, size, and type are required' 
      });
    }

    const order = await (prisma.order.findFirst as any)({
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
    await (prisma.order.update as any)({
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
router.delete('/:id/documents/:docId', authenticateToken, async (req: any, res) => {
  try {
    const { id, docId } = req.params;

    const order = await (prisma.order.findFirst as any)({
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
    await (prisma.order.update as any)({
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

// ============================================
// PAYMENT ENDPOINTS
// ============================================

// Process payment for an order (simplified version - production would use actual Iyzico SDK)
router.post('/:id/payment', authenticateToken, async (req: any, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { cardHolderName, cardNumber, expireMonth, expireYear, cvc, amount } = req.body;

    // Validation
    if (!cardHolderName || !cardNumber || !expireMonth || !expireYear || !cvc) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment card information' 
      });
    }

    // Get order
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId: req.user?.userId
      },
      include: {
        customer: true
      }
    }) as any;

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order is already paid' 
      });
    }

    // In production, integrate with Iyzico SDK here
    // For now, simulate successful payment
    const paymentAmount = amount || order.totalAmount;
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update order payment status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        updatedAt: new Date()
      }
    }) as any;

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        paymentStatus: updatedOrder.paymentStatus,
        paidAmount: paymentAmount,
        paymentDate: new Date().toISOString(),
        transactionId: `TXN_${Date.now()}_${orderId}` // Simulated transaction ID
      }
    });
  } catch (error: any) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed', 
      error: error.message 
    });
  }
});

// Get payment status for an order
router.get('/:id/payment/status', authenticateToken, async (req: any, res) => {
  try {
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId: req.user?.userId
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentStatus: true,
        updatedAt: true
      }
    }) as any;

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        lastUpdated: order.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Payment status check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check payment status', 
      error: error.message 
    });
  }
});

// ============================================
// INVOICE GENERATION ENDPOINT
// ============================================

// Generate PDF invoice for an order
router.get('/:id/invoice', authenticateToken, async (req: any, res) => {
  try {
    const orderId = parseInt(req.params.id);

    // Get order with all details
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId: req.user?.userId
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            equipment: true
          }
        }
      }
    }) as any;

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order.orderNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header - Company Info
    doc.fontSize(20).text('CANARY DIGITAL', 50, 50, { align: 'left' });
    doc.fontSize(10).text('Equipment Rental Services', 50, 75);
    doc.text('Address Line 1, City, Country', 50, 90);
    doc.text('Phone: +123 456 7890', 50, 105);
    doc.text('Email: info@canarydigital.com', 50, 120);

    // Invoice Title
    doc.fontSize(24).text('INVOICE', 400, 50, { align: 'right' });
    doc.fontSize(10);
    doc.text(`Invoice #: ${order.orderNumber}`, 400, 80, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 95, { align: 'right' });
    doc.text(`Status: ${order.status}`, 400, 110, { align: 'right' });

    // Line separator
    doc.moveTo(50, 150).lineTo(550, 150).stroke();

    // Customer Information
    doc.fontSize(12).text('Bill To:', 50, 170);
    doc.fontSize(10);
    doc.text(order.customer.name, 50, 190);
    if (order.customer.company) {
      doc.text(order.customer.company, 50, 205);
    }
    doc.text(order.customer.email, 50, 220);
    doc.text(order.customer.phone, 50, 235);
    if (order.customer.address) {
      doc.text(order.customer.address, 50, 250);
    }

    // Rental Period
    doc.fontSize(12).text('Rental Period:', 350, 170);
    doc.fontSize(10);
    doc.text(`From: ${new Date(order.startDate).toLocaleDateString()}`, 350, 190);
    doc.text(`To: ${new Date(order.endDate).toLocaleDateString()}`, 350, 205);
    const duration = Math.ceil(
      (new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    doc.text(`Duration: ${duration} days`, 350, 220);

    // Line separator
    doc.moveTo(50, 280).lineTo(550, 280).stroke();

    // Table Header
    let yPosition = 300;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item', 50, yPosition);
    doc.text('Qty', 300, yPosition, { width: 50, align: 'center' });
    doc.text('Unit Price', 360, yPosition, { width: 90, align: 'right' });
    doc.text('Total', 460, yPosition, { width: 90, align: 'right' });
    
    // Line under header
    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();

    // Table Body
    doc.font('Helvetica');
    yPosition += 15;

    for (const item of order.orderItems) {
      // Check if we need a new page
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      const itemName = item.description || (item.equipment?.name) || 'Item';
      doc.text(itemName, 50, yPosition, { width: 240 });
      doc.text(item.quantity.toString(), 300, yPosition, { width: 50, align: 'center' });
      doc.text(`£${item.unitPrice.toFixed(2)}`, 360, yPosition, { width: 90, align: 'right' });
      doc.text(`£${item.totalPrice.toFixed(2)}`, 460, yPosition, { width: 90, align: 'right' });
      
      yPosition += 25;
    }

    // Line before totals
    yPosition += 10;
    doc.moveTo(350, yPosition).lineTo(550, yPosition).stroke();

    // Totals
    yPosition += 20;
    doc.font('Helvetica');
    doc.text('Subtotal:', 350, yPosition);
    doc.text(`£${order.subtotal.toFixed(2)}`, 460, yPosition, { width: 90, align: 'right' });

    if (order.discountAmount && order.discountAmount > 0) {
      yPosition += 20;
      doc.text('Discount:', 350, yPosition);
      doc.text(`-£${order.discountAmount.toFixed(2)}`, 460, yPosition, { width: 90, align: 'right' });
    }

    if (order.taxAmount && order.taxAmount > 0) {
      yPosition += 20;
      doc.text('Tax (VAT):', 350, yPosition);
      doc.text(`£${order.taxAmount.toFixed(2)}`, 460, yPosition, { width: 90, align: 'right' });
    }

    // Bold line before total
    yPosition += 15;
    doc.moveTo(350, yPosition).lineTo(550, yPosition).lineWidth(2).stroke();
    doc.lineWidth(1);

    // Total
    yPosition += 20;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('TOTAL:', 350, yPosition);
    doc.text(`£${order.totalAmount.toFixed(2)}`, 460, yPosition, { width: 90, align: 'right' });

    // Payment Status
    yPosition += 30;
    doc.fontSize(10).font('Helvetica');
    const paymentStatusText = order.paymentStatus === 'paid' ? 'PAID' : 
                              order.paymentStatus === 'partially_paid' ? 'PARTIALLY PAID' : 
                              'PAYMENT DUE';
    const paymentColor = order.paymentStatus === 'paid' ? 'green' : 'red';
    doc.fillColor(paymentColor);
    doc.text(`Payment Status: ${paymentStatusText}`, 350, yPosition);
    doc.fillColor('black');

    // Footer
    const footerY = 750;
    doc.fontSize(8).fillColor('gray');
    doc.text('Thank you for your business!', 50, footerY, { align: 'center', width: 500 });
    doc.text('For questions about this invoice, please contact info@canarydigital.com', 50, footerY + 15, { 
      align: 'center', 
      width: 500 
    });

    // Finalize PDF
    doc.end();

  } catch (error: any) {
    console.error('Invoice generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate invoice', 
        error: error.message 
      });
    }
  }
});

export default router
