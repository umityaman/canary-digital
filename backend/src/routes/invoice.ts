import express from 'express';
import { invoiceService } from '../services/invoice.service';
import { authenticateToken } from './auth';
import { log } from '../config/logger';

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
    const where: any = {};

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
              fullName: true,
              email: true,
              phone: true,
              taxNumber: true,
              taxOffice: true,
              address: true,
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
          eInvoice: {
            select: {
              id: true,
              uuid: true,
              ettn: true,
              // status: true, // TODO: Add migration for Cloud SQL
              gibStatus: true,
              sentAt: true,
              receivedAt: true,
              errorMessage: true,
            },
          },
          eArchiveInvoice: {
            select: {
              id: true,
              archiveId: true,
              portalStatus: true,
              pdfUrl: true,
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
