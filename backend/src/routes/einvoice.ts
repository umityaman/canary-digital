import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { eInvoiceService } from '../services/eInvoiceService';

const router = Router();

/**
 * POST /api/einvoice/generate/:invoiceId
 * E-Fatura XML'i oluşturur
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

    const xml = await eInvoiceService.generateXML(invoiceId);

    res.json({
      success: true,
      message: 'E-Fatura XML başarıyla oluşturuldu',
      data: {
        xml,
        preview: xml.substring(0, 500) + '...' // İlk 500 karakter
      }
    });
  } catch (error: any) {
    console.error('E-Fatura XML oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'E-Fatura XML oluşturulurken hata oluştu'
    });
  }
});

/**
 * POST /api/einvoice/send/:invoiceId
 * E-Faturayı GİB'e gönderir
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

    const result = await eInvoiceService.sendToGIB(invoiceId);

    res.json({
      success: true,
      message: 'E-Fatura GİB\'e gönderildi',
      data: result
    });
  } catch (error: any) {
    console.error('E-Fatura gönderme hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'E-Fatura gönderilirken hata oluştu'
    });
  }
});

/**
 * GET /api/einvoice/status/:invoiceId
 * E-Fatura durumunu sorgular
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

    const status = await eInvoiceService.checkStatus(invoiceId);

    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error('E-Fatura durum sorgulama hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'E-Fatura durumu sorgulanırken hata oluştu'
    });
  }
});

/**
 * GET /api/einvoice/xml/:invoiceId
 * E-Fatura XML içeriğini getirir
 */
router.get('/xml/:invoiceId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    
    if (isNaN(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz fatura ID'
      });
    }

    const xml = await eInvoiceService.getXML(invoiceId);

    // XML olarak döndür
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error: any) {
    console.error('E-Fatura XML getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'E-Fatura XML getirilirken hata oluştu'
    });
  }
});

export default router;
