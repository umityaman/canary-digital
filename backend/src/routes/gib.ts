import { Router } from 'express';
import { gibIntegrationService } from '../services/gibIntegrationService';
import { prisma } from '../database';
import logger from '../config/logger';

const router = Router();

/**
 * GIB e-Invoice Integration API Routes
 * 
 * Endpoints:
 * POST   /api/gib/invoices/:id/send        - Send invoice to GIB
 * GET    /api/gib/invoices/:id/status      - Check invoice status
 * POST   /api/gib/invoices/:id/cancel      - Cancel invoice
 * GET    /api/gib/invoices/:id/report      - Get invoice report (PDF/HTML)
 * GET    /api/gib/invoices/incoming         - Get incoming invoices
 * POST   /api/gib/invoices/:uuid/response  - Send invoice response (accept/reject)
 * GET    /api/gib/invoices                  - List all e-Invoices
 */

// Send invoice to GIB Portal
router.post('/invoices/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(id);

    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    logger.info(`API: Sending invoice ${invoiceId} to GIB`);

    const result = await gibIntegrationService.sendEInvoice(invoiceId);

    if (result.success) {
      return res.json({
        success: true,
        message: 'Invoice sent successfully to GIB',
        data: result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to send invoice to GIB',
        error: result.errorMessage,
        data: result,
      });
    }

  } catch (error: any) {
    logger.error(`Failed to send invoice to GIB: ${error.message}`, { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to send invoice to GIB',
      message: error.message,
    });
  }
});

// Check invoice status on GIB Portal
router.get('/invoices/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(id);

    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    // Get e-Invoice UUID
    const eInvoice = await prisma.eInvoice.findUnique({
      where: { invoiceId },
    });

    if (!eInvoice) {
      return res.status(404).json({ error: 'e-Invoice not found' });
    }

    logger.info(`API: Checking status for invoice ${invoiceId}`);

    const status = await gibIntegrationService.checkInvoiceStatus(eInvoice.uuid);

    res.json({
      success: true,
      data: status,
    });

  } catch (error: any) {
    logger.error(`Failed to check invoice status: ${error.message}`, { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to check invoice status',
      message: error.message,
    });
  }
});

// Cancel invoice on GIB Portal
router.post('/invoices/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const invoiceId = parseInt(id);

    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Cancellation reason is required' });
    }

    logger.info(`API: Cancelling invoice ${invoiceId}`);

    const success = await gibIntegrationService.cancelInvoice(invoiceId, reason);

    if (success) {
      res.json({
        success: true,
        message: 'Invoice cancelled successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to cancel invoice',
      });
    }

  } catch (error: any) {
    logger.error(`Failed to cancel invoice: ${error.message}`, { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to cancel invoice',
      message: error.message,
    });
  }
});

// Get invoice report (PDF/HTML)
router.get('/invoices/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'PDF' } = req.query;
    const invoiceId = parseInt(id);

    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    if (format !== 'PDF' && format !== 'HTML') {
      return res.status(400).json({ error: 'Invalid format. Use PDF or HTML' });
    }

    // Get e-Invoice UUID
    const eInvoice = await prisma.eInvoice.findUnique({
      where: { invoiceId },
    });

    if (!eInvoice) {
      return res.status(404).json({ error: 'e-Invoice not found' });
    }

    logger.info(`API: Getting report for invoice ${invoiceId} in ${format} format`);

    const report = await gibIntegrationService.getInvoiceReport(eInvoice.uuid, format as 'HTML' | 'PDF');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const contentType = format === 'PDF' 
      ? 'application/pdf' 
      : 'text/html; charset=utf-8';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.${format.toLowerCase()}"`);
    res.send(report);

  } catch (error: any) {
    logger.error(`Failed to get invoice report: ${error.message}`, { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to get invoice report',
      message: error.message,
    });
  }
});

// Get incoming invoices from GIB Portal
router.get('/invoices/incoming', async (req, res) => {
  try {
    logger.info('API: Fetching incoming invoices from GIB');

    const invoices = await gibIntegrationService.receiveIncomingInvoices();

    res.json({
      success: true,
      count: invoices.length,
      data: invoices,
    });

  } catch (error: any) {
    logger.error(`Failed to get incoming invoices: ${error.message}`, { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to get incoming invoices',
      message: error.message,
    });
  }
});

// Send invoice response (accept/reject)
router.post('/invoices/:uuid/response', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { status, reason } = req.body;

    if (!status || (status !== 'ACCEPTED' && status !== 'REJECTED')) {
      return res.status(400).json({ error: 'Invalid status. Use ACCEPTED or REJECTED' });
    }

    if (status === 'REJECTED' && !reason) {
      return res.status(400).json({ error: 'Reason is required for rejection' });
    }

    logger.info(`API: Sending response for invoice ${uuid}: ${status}`);

    const success = await gibIntegrationService.sendInvoiceResponse(uuid, status, reason);

    if (success) {
      res.json({
        success: true,
        message: `Invoice ${status.toLowerCase()} successfully`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Failed to send invoice response`,
      });
    }

  } catch (error: any) {
    logger.error(`Failed to send invoice response: ${error.message}`, { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to send invoice response',
      message: error.message,
    });
  }
});

// List all e-Invoices with filtering
router.get('/invoices', async (req, res) => {
  try {
    const { 
      status, 
      gibStatus,
      startDate, 
      endDate,
      page = '1',
      limit = '50',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (gibStatus) {
      where.gibStatus = gibStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [eInvoices, total] = await Promise.all([
      prisma.eInvoice.findMany({
        where,
        include: {
          invoice: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.eInvoice.count({ where }),
    ]);

    res.json({
      success: true,
      data: eInvoices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });

  } catch (error: any) {
    logger.error(`Failed to list e-Invoices: ${error.message}`, { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to list e-Invoices',
      message: error.message,
    });
  }
});

// Batch send invoices
router.post('/invoices/batch-send', async (req, res) => {
  try {
    const { invoiceIds } = req.body;

    if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res.status(400).json({ error: 'invoiceIds array is required' });
    }

    logger.info(`API: Batch sending ${invoiceIds.length} invoices to GIB`);

    const results = await Promise.all(
      invoiceIds.map(id => gibIntegrationService.sendEInvoice(id))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Sent ${successful} invoices successfully, ${failed} failed`,
      data: {
        successful,
        failed,
        results,
      },
    });

  } catch (error: any) {
    logger.error(`Failed to batch send invoices: ${error.message}`, { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to batch send invoices',
      message: error.message,
    });
  }
});

// Retry failed invoices
router.post('/invoices/retry-failed', async (req, res) => {
  try {
    logger.info('API: Retrying failed invoices');

    // Get all failed e-Invoices
    const failedInvoices = await prisma.eInvoice.findMany({
      where: {
        status: { in: ['PENDING', 'REJECTED'] },
      },
      select: { invoiceId: true },
    });

    if (failedInvoices.length === 0) {
      return res.json({
        success: true,
        message: 'No failed invoices to retry',
        data: { count: 0 },
      });
    }

    const results = await Promise.all(
      failedInvoices.map(ei => gibIntegrationService.sendEInvoice(ei.invoiceId))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Retried ${failedInvoices.length} invoices: ${successful} successful, ${failed} failed`,
      data: {
        total: failedInvoices.length,
        successful,
        failed,
        results,
      },
    });

  } catch (error: any) {
    logger.error(`Failed to retry invoices: ${error.message}`, { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to retry invoices',
      message: error.message,
    });
  }
});

export default router;
