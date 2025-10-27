import express from 'express';
import { invoiceService } from '../services/invoice.service';
import { authenticateToken } from './auth';
import { log } from '../config/logger';
import { emailService } from '../services/EmailService';

const router = express.Router();

/**
 * @route   GET /api/invoices
 * @desc    Tüm faturaları listele (pagination, filtering, search)
 * @access  Private
 * @query   status, type, search, page, limit, sortBy, sortOrder
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      type,
      search,
      page = '1',
      limit = '20',
      sortBy = 'invoiceDate',
      sortOrder = 'desc',
    } = req.query;

    // Build where clause
    const where: any = {
      companyId: (req as any).user.companyId, // Filter by user's company
    };

    if (status) {
      where.status = status as string;
    }

    if (type) {
      where.type = type as string;
    }

    if (search) {
      // Search in invoice number or customer name
      where.OR = [
        {
          invoiceNumber: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          customer: {
            name: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get invoices with pagination
    const { prisma } = require('../index');
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              taxNumber: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              orderItems: {
                select: {
                  equipment: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentDate: true,
              paymentMethod: true,
            },
          },
        },
        orderBy: {
          [sortBy as string]: sortOrder as string,
        },
        skip,
        take: limitNum,
      }),
      prisma.invoice.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error: any) {
    log.error('Failed to get invoices:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get invoices',
    });
  }
});

/**
 * @route   POST /api/invoices
 * @desc    Genel fatura oluştur (Manuel giriş)
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { prisma } = require('../index');
    const userId = (req as any).user.id;
    const companyId = (req as any).user.companyId;

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      customerTaxNumber,
      invoiceNumber,
      invoiceDate,
      dueDate,
      type,
      items,
      totalAmount,
      vatAmount,
      grandTotal,
      notes,
    } = req.body;

    // Validation
    if (!customerName || !invoiceDate || !dueDate || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Müşteri adı, fatura tarihi, vade tarihi ve kalemler gerekli',
      });
    }

    // WORKAROUND: Production DB requires orderId and customerId (NOT NULL)
    // Create dummy customer and order for manual invoices
    
    // 1. Create dummy customer (or find existing)
    let customer = await prisma.user.findFirst({
      where: {
        email: customerEmail || `manual-${Date.now()}@invoice.local`,
        role: 'customer',
      },
    });

    if (!customer) {
      // Get user's companyId for the customer
      const userCompanyId = (req as any).user?.companyId || 1; // Fallback to 1 if not available
      
      customer = await prisma.user.create({
        data: {
          email: customerEmail || `manual-${Date.now()}@invoice.local`,
          name: customerName,
          password: 'dummy', // Won't be used
          role: 'customer',
          phone: customerPhone || '',
          taxNumber: customerTaxNumber || '',
          company: {
            connect: { id: userCompanyId }, // Use connect for relation
          },
        },
      });
    }

    // 2. Create dummy order
    const userCompanyId = (req as any).user?.companyId || 1;
    
    const order = await prisma.order.create({
      data: {
        orderNumber: `MAN-${Date.now()}`,
        customerId: customer.id,
        company: {
          connect: { id: userCompanyId }, // Use connect for relation
        },
        startDate: new Date(invoiceDate),
        endDate: new Date(dueDate),
        status: 'completed',
        totalAmount: grandTotal,
        notes: 'Manual invoice',
      },
    });

    // Generate invoice number if not provided
    let finalInvoiceNumber = invoiceNumber;
    if (!finalInvoiceNumber) {
      const year = new Date().getFullYear();
      const count = await prisma.invoice.count({
        where: {
          invoiceNumber: {
            startsWith: `INV-${year}-`,
          },
        },
      });
      finalInvoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
    }

    // Create invoice - Use only existing columns in production DB
    const invoiceData: any = {
      // Required fields that definitely exist
      orderId: order.id,
      customerId: customer.id,
      invoiceDate: new Date(invoiceDate),
      dueDate: new Date(dueDate),
      invoiceNumber: finalInvoiceNumber,
      totalAmount: totalAmount,
      vatAmount: vatAmount,
      grandTotal: grandTotal,
      paidAmount: 0,
      status: 'PENDING',
      type: type || 'SALES',
    };

    const invoice = await prisma.invoice.create({
      data: invoiceData,
    });

    log.info(`Invoice created: ${finalInvoiceNumber}`);

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Fatura başarıyla oluşturuldu',
    });
  } catch (error: any) {
    log.error('Failed to create invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Fatura oluşturulamadı',
    });
  }
});

/**
 * @route   POST /api/invoices/rental
 * @desc    Kiralama için fatura oluştur
 * @access  Private
 */
router.post('/rental', authenticateToken, async (req, res) => {
  try {
    const { orderId, customerId, items, startDate, endDate, notes } = req.body;

    // Validation
    if (!orderId || !customerId || !items || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items must be a non-empty array',
      });
    }

    const invoice = await invoiceService.createRentalInvoice({
      orderId: parseInt(orderId),
      customerId: parseInt(customerId),
      items: items.map((item: any) => ({
        equipmentId: parseInt(item.equipmentId),
        description: item.description,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        days: parseInt(item.days),
        discountPercentage: item.discountPercentage ? parseFloat(item.discountPercentage) : undefined,
      })),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes,
    });

    log.info('Invoice created:', { invoiceId: invoice.id, orderId });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error: any) {
    log.error('Failed to create invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create invoice',
    });
  }
});

/**
 * @route   POST /api/invoices/:id/payment
 * @desc    Faturaya ödeme kaydet
 * @access  Private
 */
router.post('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate, paymentMethod, transactionId, notes } = req.body;

    // Validation
    if (!amount || !paymentDate || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const payment = await invoiceService.recordPayment(
      parseInt(id),
      {
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        paymentMethod,
        transactionId,
        notes,
      }
    );

    log.info('Payment recorded:', { paymentId: payment.id, invoiceId: id });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (error: any) {
    log.error('Failed to record payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record payment',
    });
  }
});

/**
 * @route   POST /api/invoices/late-fee
 * @desc    Gecikme cezası faturası oluştur
 * @access  Private
 */
router.post('/late-fee', authenticateToken, async (req, res) => {
  try {
    const { orderId, lateDays, dailyFee, notes } = req.body;

    // Validation
    if (!orderId || !lateDays || !dailyFee) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const invoice = await invoiceService.createLateFeeInvoice(
      parseInt(orderId),
      parseInt(lateDays),
      parseFloat(dailyFee),
      notes
    );

    log.info('Late fee invoice created:', { invoiceId: invoice.id, orderId });

    res.status(201).json({
      success: true,
      message: 'Late fee invoice created successfully',
      data: invoice,
    });
  } catch (error: any) {
    log.error('Failed to create late fee invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create late fee invoice',
    });
  }
});

/**
 * @route   POST /api/invoices/deposit-refund
 * @desc    Depozito iade faturası oluştur
 * @access  Private
 */
router.post('/deposit-refund', authenticateToken, async (req, res) => {
  try {
    const { orderId, depositAmount, notes } = req.body;

    // Validation
    if (!orderId || !depositAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const invoice = await invoiceService.createDepositRefundInvoice(
      parseInt(orderId),
      parseFloat(depositAmount),
      notes
    );

    log.info('Deposit refund invoice created:', { invoiceId: invoice.id, orderId });

    res.status(201).json({
      success: true,
      message: 'Deposit refund invoice created successfully',
      data: invoice,
    });
  } catch (error: any) {
    log.error('Failed to create deposit refund invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create deposit refund invoice',
    });
  }
});

/**
 * @route   GET /api/invoices/:id
 * @desc    Fatura detaylarını getir
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await invoiceService.getInvoiceDetails(parseInt(id));

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    log.error('Failed to get invoice details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get invoice details',
    });
  }
});

/**
 * @route   GET /api/invoices/customer/:customerId
 * @desc    Müşterinin tüm faturalarını listele
 * @access  Private
 */
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, type, startDate, endDate } = req.query;

    const filters: any = {};
    if (status) filters.status = status as string;
    if (type) filters.type = type as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const invoices = await invoiceService.getCustomerInvoices(
      parseInt(customerId),
      filters
    );

    res.json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error: any) {
    log.error('Failed to get customer invoices:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get customer invoices',
    });
  }
});

/**
 * @route   PUT /api/invoices/:id
 * @desc    Faturayı güncelle
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { prisma } = require('../index');
    const { id } = req.params;
    const userId = (req as any).user.id;

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      customerTaxNumber,
      invoiceDate,
      dueDate,
      type,
      items,
      totalAmount,
      vatAmount,
      grandTotal,
      notes,
    } = req.body;

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Fatura bulunamadı',
      });
    }

    // Update invoice
    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        type: type || undefined,
        
        // Customer info
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        customerCompany: customerCompany || undefined,
        customerTaxNumber: customerTaxNumber || undefined,
        
        // Amounts
        subtotal: totalAmount || undefined,
        taxAmount: vatAmount || undefined,
        grandTotal: grandTotal || undefined,
        
        notes: notes || undefined,
        
        // Items (store as JSON)
        description: items ? JSON.stringify(items) : undefined,
      },
    });

    log.info(`Invoice updated: ${invoice.invoiceNumber}`);

    res.json({
      success: true,
      data: invoice,
      message: 'Fatura başarıyla güncellendi',
    });
  } catch (error: any) {
    log.error('Failed to update invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Fatura güncellenemedi',
    });
  }
});

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Faturayı iptal et
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required',
      });
    }

    const result = await invoiceService.cancelInvoice(parseInt(id), reason);

    log.info('Invoice cancelled:', { invoiceId: id, reason });

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    log.error('Failed to cancel invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel invoice',
    });
  }
});

/**
 * @route   POST /api/invoices/payment-plan
 * @desc    Ödeme planı oluştur (taksitli ödemeler için)
 * @access  Private
 */
router.post('/payment-plan', authenticateToken, async (req, res) => {
  try {
    const { orderId, totalAmount, installments, startDate } = req.body;

    // Validation
    if (!orderId || !totalAmount || !installments || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (installments < 2 || installments > 12) {
      return res.status(400).json({
        success: false,
        message: 'Installments must be between 2 and 12',
      });
    }

    const plan = await invoiceService.createPaymentPlan(
      parseInt(orderId),
      parseFloat(totalAmount),
      parseInt(installments),
      new Date(startDate)
    );

    log.info('Payment plan created:', { orderId, installments });

    res.status(201).json({
      success: true,
      message: 'Payment plan created successfully',
      data: plan,
    });
  } catch (error: any) {
    log.error('Failed to create payment plan:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment plan',
    });
  }
});

/**
 * @route   POST /api/invoices/:id/send-email
 * @desc    Faturayı e-posta ile gönder
 * @access  Private
 */
router.post('/:id/send-email', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientEmail, message, pdfBuffer } = req.body;

    // Get invoice details
    const invoice = await invoiceService.getInvoiceDetails(parseInt(id));

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Prepare email
    const to = recipientEmail || invoice.customer?.email;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required',
      });
    }

    const subject = `Fatura #${invoice.invoiceNumber} - Canary Digital`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Fatura Gönderimi</h2>
        <p>Sayın ${invoice.customerName},</p>
        <p>Faturanız ektedir. Detaylar aşağıdaki gibidir:</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Fatura No:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Fatura Tarihi:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}</p>
          <p><strong>Vade Tarihi:</strong> ${new Date(invoice.dueDate).toLocaleDateString('tr-TR')}</p>
          <p><strong>Toplam Tutar:</strong> ${invoice.grandTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
          <p><strong>Durum:</strong> ${invoice.status === 'paid' ? 'Ödendi' : invoice.status === 'pending' ? 'Beklemede' : 'Gecikmiş'}</p>
        </div>
        
        ${message ? `<p><strong>Not:</strong> ${message}</p>` : ''}
        
        <p>İyi günler dileriz.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Bu e-posta otomatik olarak gönderilmiştir.<br>
          Canary Digital © ${new Date().getFullYear()}
        </p>
      </div>
    `;

    // Prepare attachments
    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `Fatura-${invoice.invoiceNumber}.pdf`,
        content: Buffer.from(pdfBuffer, 'base64'),
        contentType: 'application/pdf',
      });
    }

    // Send email
    await emailService.sendEmail({
      to,
      subject,
      html,
      attachments,
    });

    log.info('Invoice email sent:', { invoiceId: id, to });

    res.json({
      success: true,
      message: 'Invoice email sent successfully',
    });
  } catch (error: any) {
    log.error('Failed to send invoice email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send invoice email',
    });
  }
});

/**
 * @route   GET /api/invoices/stats/summary
 * @desc    Fatura istatistikleri özeti
 * @access  Private
 */
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // TODO: İstatistik servisi implement edilecek
    // Şimdilik basit bir özet döndürelim

    res.json({
      success: true,
      data: {
        message: 'Invoice statistics endpoint - Coming soon',
      },
    });
  } catch (error: any) {
    log.error('Failed to get invoice stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get invoice stats',
    });
  }
});

export default router;
