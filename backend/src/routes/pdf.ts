import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { InvoicePDFGenerator } from '../services/pdfGenerators/invoicePDF';
import { OrderPDFGenerator } from '../services/pdfGenerators/orderPDF';
import { EquipmentPDFGenerator } from '../services/pdfGenerators/equipmentPDF';

const router = Router();
const prisma = new PrismaClient();

/**
 * Generate Invoice PDF
 * POST /api/pdf/invoice/:id
 */
router.post('/invoice/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Fetch order data. Use select to avoid Prisma `include` validation errors
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        orderNumber: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        totalAmount: true,
        status: true,
        notes: true,
        customerId: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    // Fetch customer separately to avoid runtime include issues
    const customer = await prisma.user.findUnique({ where: { id: order.customerId } });

    // Fetch order items separately (and include equipment)
    const orderItems = await (prisma as any).orderItem.findMany({
      where: { orderId: order.id },
      include: { equipment: true }
    });

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber: `INV-${order.orderNumber}`,
      date: order.createdAt,
      dueDate: order.endDate,
      
      companyName: 'CANARY Equipment Rental',
      companyAddress: 'İstanbul, Türkiye',
      companyPhone: '+90 555 123 4567',
      companyEmail: 'info@canary.com',
      companyTaxNo: '1234567890',
      
  customerName: customer?.name || undefined,
  customerPhone: customer?.phone || undefined,
  customerEmail: customer?.email || undefined,
  customerAddress: customer?.address || undefined,
  customerTaxNo: customer?.taxNumber || undefined,
      
      items: orderItems.map((item: any) => ({
        description: item.equipment?.name || item.equipmentId,
        quantity: item.quantity,
        unitPrice: item.dailyRate || undefined,
        totalPrice: item.totalAmount
      })),
      
      subtotal: order.totalAmount,
      taxRate: 18,
      taxAmount: order.totalAmount * 0.18,
      discountAmount: 0,
      total: order.totalAmount * 1.18,
      
      status: order.status,
      notes: order.notes || undefined
    };
    
    // Generate PDF
    const pdfBuffer = await InvoicePDFGenerator.generate(invoiceData);
    
    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Invoice PDF generation error:', error);
    res.status(500).json({ error: 'PDF oluşturulamadı' });
  }
});

/**
 * Generate Order Summary PDF
 * POST /api/pdf/order/:id
 */
router.post('/order/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        orderNumber: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        totalAmount: true,
        status: true,
        notes: true,
        customerId: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    // Calculate duration
    const duration = Math.ceil(
      (order.endDate.getTime() - order.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Fetch customer separately
    const customer = await prisma.user.findUnique({ where: { id: order.customerId } });

    // Fetch order items separately (and include equipment)
    const orderItems = await (prisma as any).orderItem.findMany({
      where: { orderId: order.id },
      include: { equipment: true }
    });

    // Prepare order data
    const orderData = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      startDate: order.startDate,
      endDate: order.endDate,
      status: order.status,

      customerName: customer?.name || undefined,
      customerPhone: customer?.phone || undefined,
      customerEmail: customer?.email || undefined,
      customerAddress: customer?.address || undefined,

      equipment: orderItems.map((item: any) => ({
        name: item.equipment?.name || item.equipmentId,
        quantity: item.quantity,
        dailyRate: item.dailyRate || item.pricePerDay,
        duration: duration,
        totalPrice: item.totalAmount
      })),

  subtotal: order.totalAmount,
      taxAmount: order.totalAmount * 0.18,
      discountAmount: 0,
      total: order.totalAmount * 1.18,
      paidAmount: 0,

      notes: order.notes || undefined
    };
    
    // Generate PDF
    const pdfBuffer = await OrderPDFGenerator.generate(orderData);
    
    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="order-${order.orderNumber}.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Order PDF generation error:', error);
    res.status(500).json({ error: 'PDF oluşturulamadı' });
  }
});

/**
 * Generate Equipment List PDF
 * POST /api/pdf/equipment
 */
router.post('/equipment', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, search } = req.body;
    
    // Build where clause
    const where: any = {};
    
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Fetch equipment
    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    
    // Count by status
    const statusCounts = await prisma.equipment.groupBy({
      by: ['status'],
      _count: true,
      where: category ? { category } : undefined
    });
    
    const availableCount = statusCounts.find((s: any) => s.status === 'AVAILABLE')?._count || 0;
    const rentedCount = statusCounts.find((s: any) => s.status === 'RENTED')?._count || 0;
    const maintenanceCount = statusCounts.find((s: any) => s.status === 'MAINTENANCE')?._count || 0;
    
    // Prepare data
    const equipmentData = {
      equipment: equipment.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        model: item.model,
        category: item.category,
        serialNumber: item.serialNumber,
        status: item.status,
        dailyPrice: item.dailyPrice,
        location: item.location
      })),
      filters: { category, status, search },
      totalCount: equipment.length,
      availableCount,
      rentedCount,
      maintenanceCount
    };
    
    // Generate PDF
    const pdfBuffer = await EquipmentPDFGenerator.generate(equipmentData);
    
    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="equipment-list.pdf"');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Equipment PDF generation error:', error);
    res.status(500).json({ error: 'PDF oluşturulamadı' });
  }
});

/**
 * Bulk export orders
 * POST /api/pdf/orders/bulk
 */
router.post('/orders/bulk', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'Geçerli sipariş ID\'leri gerekli' });
    }
    
    // For bulk export, you might want to create a ZIP file with multiple PDFs
    // For now, we'll return an error suggesting to use individual exports
    
    return res.status(501).json({ 
      error: 'Toplu PDF export henüz desteklenmiyor',
      suggestion: 'Lütfen siparişleri tek tek indirin'
    });
    
  } catch (error) {
    console.error('Bulk PDF export error:', error);
    res.status(500).json({ error: 'Toplu export başarısız' });
  }
});

export default router;
