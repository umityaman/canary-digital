import express from 'express';
import { authenticateToken } from '../middleware/auth';
import eArchiveService from '../services/eArchiveService';

const router = express.Router();

/**
 * E-Arşiv fatura HTML oluştur
 * POST /api/earchive/generate/:invoiceId
 */
router.post('/generate/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const html = await eArchiveService.generateHTML(parseInt(invoiceId));
    
    res.json({
      success: true,
      message: 'E-Arşiv fatura HTML oluşturuldu',
      data: {
        preview: html.substring(0, 500) + '...',
        length: html.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'E-Arşiv HTML oluşturulamadı',
      error: error.message
    });
  }
});

/**
 * E-Arşiv fatura PDF oluştur ve indir
 * GET /api/earchive/pdf/:invoiceId
 */
router.get('/pdf/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const pdfBuffer = await eArchiveService.generatePDF(parseInt(invoiceId));
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=earchive-${invoiceId}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'E-Arşiv PDF oluşturulamadı',
      error: error.message
    });
  }
});

/**
 * E-Arşiv fatura HTML görüntüle
 * GET /api/earchive/html/:invoiceId
 */
router.get('/html/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    // Önce HTML oluştur (yoksa)
    const html = await eArchiveService.generateHTML(parseInt(invoiceId));
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'E-Arşiv HTML görüntülenemedi',
      error: error.message
    });
  }
});

/**
 * E-Arşiv fatura portal'a gönder
 * POST /api/earchive/send/:invoiceId
 */
router.post('/send/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const result = await eArchiveService.sendToPortal(parseInt(invoiceId));
    
    res.json({
      success: true,
      message: 'E-Arşiv fatura portal\'a gönderildi',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'E-Arşiv fatura gönderilemedi',
      error: error.message
    });
  }
});

/**
 * E-Arşiv fatura durumu sorgula
 * GET /api/earchive/status/:invoiceId
 */
router.get('/status/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const status = await eArchiveService.checkStatus(parseInt(invoiceId));
    
    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Durum sorgulanamadı',
      error: error.message
    });
  }
});

export default router;
