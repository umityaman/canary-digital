import express from 'express';
import { authenticateToken } from '../middleware/auth';
import deliveryNoteService from '../services/deliveryNoteService';
import deliveryNotePDFService from '../services/deliveryNotePDFService';

const router = express.Router();

/**
 * Get all delivery notes
 * GET /api/delivery-notes
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      customerId,
      orderId,
      status,
      deliveryType,
      startDate,
      endDate,
      page,
      limit
    } = req.query;

    const result = await deliveryNoteService.findAll({
      customerId: customerId ? parseInt(customerId as string) : undefined,
      orderId: orderId ? parseInt(orderId as string) : undefined,
      status: status as string,
      deliveryType: deliveryType as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Fetch delivery notes failed',
      error: error.message
    });
  }
});

/**
 * Get delivery note by ID
 * GET /api/delivery-notes/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryNote = await deliveryNoteService.findById(parseInt(id));

    res.json({
      success: true,
      data: deliveryNote
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Create delivery note
 * POST /api/delivery-notes
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    
    const deliveryNote = await deliveryNoteService.create({
      ...req.body,
      createdById: userId
    });

    res.status(201).json({
      success: true,
      message: 'Delivery note created successfully',
      data: deliveryNote
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create delivery note',
      error: error.message
    });
  }
});

/**
 * Update delivery note
 * PATCH /api/delivery-notes/:id
 */
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryNote = await deliveryNoteService.update(
      parseInt(id),
      req.body
    );

    res.json({
      success: true,
      message: 'Delivery note updated successfully',
      data: deliveryNote
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery note',
      error: error.message
    });
  }
});

/**
 * Delete delivery note
 * DELETE /api/delivery-notes/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deliveryNoteService.delete(parseInt(id));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Cancel delivery note
 * POST /api/delivery-notes/:id/cancel
 */
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryNote = await deliveryNoteService.cancel(parseInt(id));

    res.json({
      success: true,
      message: 'Delivery note cancelled',
      data: deliveryNote
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel delivery note',
      error: error.message
    });
  }
});

/**
 * Mark delivery note as delivered
 * POST /api/delivery-notes/:id/deliver
 */
router.post('/:id/deliver', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryNote = await deliveryNoteService.markAsDelivered(parseInt(id));

    res.json({
      success: true,
      message: 'Delivery note marked as delivered',
      data: deliveryNote
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark as delivered',
      error: error.message
    });
  }
});

/**
 * Get delivery note statistics
 * GET /api/delivery-notes/stats
 */
router.get('/statistics/summary', authenticateToken, async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;

    const stats = await deliveryNoteService.getStatistics({
      customerId: customerId ? parseInt(customerId as string) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

/**
 * Convert delivery note to invoice
 * POST /api/delivery-notes/:id/convert-to-invoice
 */
router.post('/:id/convert-to-invoice', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { invoiceDate, dueDate, paymentMethod, notes } = req.body;

    const result = await deliveryNoteService.convertToInvoice(parseInt(id), {
      invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      paymentMethod,
      notes
    });

    res.json({
      success: true,
      message: 'Delivery note converted to invoice successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to convert to invoice',
      error: error.message
    });
  }
});

/**
 * Generate delivery note PDF
 * GET /api/delivery-notes/:id/pdf
 */
router.get('/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const pdfBuffer = await deliveryNotePDFService.generatePDF(parseInt(id));
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=irsaliye-${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
});

export default router;
