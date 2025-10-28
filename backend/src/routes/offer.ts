import express from 'express';
import { offerService } from '../services/offer.service';
import { authenticateToken } from './auth';
import { log } from '../config/logger';

const router = express.Router();

/**
 * @route   GET /api/offers
 * @desc    Tüm teklifleri listele
 * @access  Private
 * @query   status, customerId, search, startDate, endDate, page, limit
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      customerId,
      search,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;

    const result = await offerService.getAllOffers({
      status: status as string,
      customerId: customerId ? parseInt(customerId as string) : undefined,
      search: search as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.json({
      success: true,
      data: result.offers,
      pagination: result.pagination,
    });
  } catch (error: any) {
    log.error('Failed to get offers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get offers',
    });
  }
});

/**
 * @route   GET /api/offers/stats
 * @desc    Teklif istatistikleri
 * @access  Private
 * @query   startDate, endDate
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await offerService.getOfferStats({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    log.error('Failed to get offer stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get offer stats',
    });
  }
});

/**
 * @route   GET /api/offers/:id
 * @desc    Teklif detayını getir
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await offerService.getOfferById(parseInt(id));

    res.json({
      success: true,
      data: offer,
    });
  } catch (error: any) {
    log.error('Failed to get offer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get offer',
    });
  }
});

/**
 * @route   POST /api/offers
 * @desc    Yeni teklif oluştur
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { customerId, items, validityDays, notes } = req.body;

    // Validation
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerId and items',
      });
    }

    const offer = await offerService.createOffer({
      customerId: parseInt(customerId),
      items: items.map((item: any) => ({
        equipmentId: parseInt(item.equipmentId),
        description: item.description,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        days: parseInt(item.days),
        discountPercentage: item.discountPercentage 
          ? parseFloat(item.discountPercentage) 
          : undefined,
      })),
      validityDays: validityDays ? parseInt(validityDays) : 30,
      notes,
    });

    log.info('Offer created:', { offerId: offer.id });

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: offer,
    });
  } catch (error: any) {
    log.error('Failed to create offer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create offer',
    });
  }
});

/**
 * @route   PUT /api/offers/:id
 * @desc    Teklifi güncelle
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { items, validUntil, status, notes } = req.body;

    const updateData: any = {};

    if (items) {
      updateData.items = items.map((item: any) => ({
        equipmentId: parseInt(item.equipmentId),
        description: item.description,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        days: parseInt(item.days),
        discountPercentage: item.discountPercentage 
          ? parseFloat(item.discountPercentage) 
          : undefined,
      }));
    }

    if (validUntil) {
      updateData.validUntil = new Date(validUntil);
    }

    if (status) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const offer = await offerService.updateOffer(parseInt(id), updateData);

    log.info('Offer updated:', { offerId: id });

    res.json({
      success: true,
      message: 'Offer updated successfully',
      data: offer,
    });
  } catch (error: any) {
    log.error('Failed to update offer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update offer',
    });
  }
});

/**
 * @route   DELETE /api/offers/:id
 * @desc    Teklifi sil
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await offerService.deleteOffer(parseInt(id));

    log.info('Offer deleted:', { offerId: id });

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    log.error('Failed to delete offer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete offer',
    });
  }
});

/**
 * @route   POST /api/offers/:id/convert-to-invoice
 * @desc    Teklifi faturaya dönüştür
 * @access  Private
 */
router.post('/:id/convert-to-invoice', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId, startDate, endDate, notes } = req.body;

    // Validation
    if (!orderId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, startDate, endDate',
      });
    }

    const result = await offerService.convertToInvoice(parseInt(id), {
      orderId: parseInt(orderId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes,
    });

    log.info('Offer converted to invoice:', {
      offerId: id,
      invoiceId: result.invoice.id,
    });

    res.json({
      success: true,
      message: 'Offer converted to invoice successfully',
      data: result,
    });
  } catch (error: any) {
    log.error('Failed to convert offer to invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to convert offer to invoice',
    });
  }
});

/**
 * @route   PATCH /api/offers/:id/status
 * @desc    Teklif durumunu güncelle (sent, accepted, rejected)
 * @access  Private
 */
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const offer = await offerService.updateOffer(parseInt(id), { status });

    log.info('Offer status updated:', { offerId: id, status });

    res.json({
      success: true,
      message: 'Offer status updated successfully',
      data: offer,
    });
  } catch (error: any) {
    log.error('Failed to update offer status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update offer status',
    });
  }
});

export default router;
