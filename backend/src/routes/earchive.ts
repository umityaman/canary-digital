import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { eArchiveService } from '../services/eArchiveService';

const router = Router();

/**
 * POST /api/earchive/generate/:invoiceId
 * E-Arşiv Fatura HTML'i oluşturur
 */
router.post('/generate/:invoiceId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    
    if (isNaN(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz fatura ID'
      });
    }

    const html = await eArchiveService.generateHTML(invoiceId);

    res.json({
      success: true,
      message: 'E-Arşiv Fatura HTML başarıyla oluşturuldu',
      data: {
        preview: html.substring(0, 500) + '...' // İlk 500 karakter
      }
    });
  } catch (error: any) {
    console.error('E-Arşiv HTML oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'E-Arşiv Fatura oluşturulurken hata oluştu'
    });
  }
});

/**
 * POST /api/earchive/send/:invoiceId
 * E-Arşiv Faturayı portala gönderir
 */
router.post('/send/:invoiceId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    
    if (isNaN(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz fatura ID'
      });
    }

    const result = await eArchiveService.sendToPortal(invoiceId);

    res.json({
      success: true,
      message: 'E-Arşiv Fatura portala gönderildi',
      data: result
    });
  } catch (error: any) {
    console.error('E-Arşiv gönderme hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'E-Arşiv Fatura gönderilirken hata oluştu'
    });
  }
});

/**
 * GET /api/earchive/status/:invoiceId
 * E-Arşiv Fatura durumunu sorgular
 */
router.get('/status/:invoiceId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    
    if (isNaN(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz fatura ID'
      });
    }

    const status = await eArchiveService.checkStatus(invoiceId);

    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error('E-Arşiv durum sorgulama hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'E-Arşiv durumu sorgulanırken hata oluştu'
    });
  }
});

/**
 * GET /api/earchive/html/:invoiceId
 * E-Arşiv Fatura HTML içeriğini getirir
 */
router.get('/html/:invoiceId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    
    if (isNaN(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz fatura ID'
      });
    }

    const html = await eArchiveService.getHTML(invoiceId);

    // HTML olarak döndür
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error: any) {
    console.error('E-Arşiv HTML getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'E-Arşiv HTML getirilirken hata oluştu'
    });
  }
});

export default router;
