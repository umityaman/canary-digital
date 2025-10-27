import express from 'express';
import { authenticateToken } from '../middleware/auth';
import deliveryNoteService from '../services/deliveryNoteService';

const router = express.Router();

/**
 * GET /api/delivery-notes
 * Tüm irsaliyeleri listele
 */
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const { status, customerId, startDate, endDate } = req.query;

    const filters: any = {};
    
    if (status) filters.status = status as string;
    if (customerId) filters.customerId = parseInt(customerId as string);
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const deliveryNotes = await deliveryNoteService.list(companyId, filters);

    res.json({
      success: true,
      data: deliveryNotes
    });
  } catch (error: any) {
    console.error('Error listing delivery notes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'İrsaliyeler listelenemedi'
    });
  }
});

/**
 * GET /api/delivery-notes/stats
 * İstatistikleri getir
 */
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const stats = await deliveryNoteService.getStats(companyId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error getting delivery note stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'İstatistikler alınamadı'
    });
  }
});

/**
 * GET /api/delivery-notes/:id
 * İrsaliye detayı getir
 */
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz irsaliye ID'
      });
    }

    const deliveryNote = await deliveryNoteService.getById(id, companyId);

    res.json({
      success: true,
      data: deliveryNote
    });
  } catch (error: any) {
    console.error('Error getting delivery note:', error);
    res.status(error.message === 'İrsaliye bulunamadı' ? 404 : 500).json({
      success: false,
      message: error.message || 'İrsaliye detayı getirilemedi'
    });
  }
});

/**
 * POST /api/delivery-notes
 * Yeni irsaliye oluştur
 */
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const { customerId, deliveryDate, notes, status, items } = req.body;

    // Validation
    if (!customerId || !deliveryDate || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Müşteri, tarih ve ürünler zorunludur'
      });
    }

    const deliveryNote = await deliveryNoteService.create({
      customerId: parseInt(customerId),
      deliveryDate: new Date(deliveryDate),
      notes,
      status,
      items
    }, companyId, userId);

    res.status(201).json({
      success: true,
      message: 'İrsaliye başarıyla oluşturuldu',
      data: deliveryNote
    });
  } catch (error: any) {
    console.error('Error creating delivery note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'İrsaliye oluşturulamadı'
    });
  }
});

/**
 * PUT /api/delivery-notes/:id
 * İrsaliye güncelle
 */
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz irsaliye ID'
      });
    }

    const { deliveryDate, notes, status, items } = req.body;

    const deliveryNote = await deliveryNoteService.update(id, {
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      notes,
      status,
      items
    }, companyId);

    res.json({
      success: true,
      message: 'İrsaliye başarıyla güncellendi',
      data: deliveryNote
    });
  } catch (error: any) {
    console.error('Error updating delivery note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'İrsaliye güncellenemedi'
    });
  }
});

/**
 * DELETE /api/delivery-notes/:id
 * İrsaliye sil
 */
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz irsaliye ID'
      });
    }

    await deliveryNoteService.delete(id, companyId);

    res.json({
      success: true,
      message: 'İrsaliye başarıyla silindi'
    });
  } catch (error: any) {
    console.error('Error deleting delivery note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'İrsaliye silinemedi'
    });
  }
});

/**
 * POST /api/delivery-notes/:id/convert-to-invoice
 * İrsaliyeyi faturaya dönüştür
 */
router.post('/:id/convert-to-invoice', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz irsaliye ID'
      });
    }

    const invoice = await deliveryNoteService.convertToInvoice(id, companyId, userId);

    res.json({
      success: true,
      message: 'İrsaliye başarıyla faturaya dönüştürüldü',
      data: invoice
    });
  } catch (error: any) {
    console.error('Error converting delivery note to invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'İrsaliye faturaya dönüştürülemedi'
    });
  }
});

/**
 * PATCH /api/delivery-notes/:id/status
 * İrsaliye durumunu güncelle
 */
router.patch('/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz irsaliye ID'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Durum belirtilmedi'
      });
    }

    const deliveryNote = await deliveryNoteService.updateStatus(id, status, companyId);

    res.json({
      success: true,
      message: 'İrsaliye durumu güncellendi',
      data: deliveryNote
    });
  } catch (error: any) {
    console.error('Error updating delivery note status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Durum güncellenemedi'
    });
  }
});

export default router;
