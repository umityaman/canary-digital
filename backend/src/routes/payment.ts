import express, { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { authenticateToken } from '../middleware/auth';
import { log } from '../config/logger';

const router = express.Router();

// Middleware: Tüm route'lar için authentication gerekli
router.use(authenticateToken);

/**
 * POST /api/payment/initiate
 * 3D Secure Ödeme Başlatma
 * 
 * Body:
 * {
 *   orderId: number,
 *   customerId: number,
 *   amount: number,
 *   installment?: number,
 *   cardHolderName: string,
 *   cardNumber: string,
 *   expireMonth: string,
 *   expireYear: string,
 *   cvc: string,
 *   saveCard?: boolean
 * }
 */
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      customerId,
      amount,
      installment,
      cardHolderName,
      cardNumber,
      expireMonth,
      expireYear,
      cvc,
      saveCard,
    } = req.body;

    // Validasyon
    if (!orderId || !customerId || !amount || !cardHolderName || !cardNumber || !expireMonth || !expireYear || !cvc) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Kart numarasını temizle (boşluklar ve tireler)
    const cleanCardNumber = cardNumber.replace(/[\s-]/g, '');

    // Ödeme başlat
    const result = await paymentService.initiatePayment({
      orderId: parseInt(orderId),
      customerId: parseInt(customerId),
      amount: parseFloat(amount),
      installment: installment ? parseInt(installment) : 1,
      cardHolderName,
      cardNumber: cleanCardNumber,
      expireMonth,
      expireYear,
      cvc,
      saveCard: saveCard === true || saveCard === 'true',
    });

    res.json(result);
  } catch (error: any) {
    log.error('Payment initiate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment',
    });
  }
});

/**
 * POST /api/payment/callback
 * 3D Secure Callback İşleme
 * 
 * Body: iyzico'dan gelen POST parametreleri
 * {
 *   conversationData: string,
 *   paymentId: string,
 *   mdStatus: string,
 *   ...
 * }
 */
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { conversationData, paymentId, mdStatus } = req.body;

    if (!conversationData || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing callback parameters',
      });
    }

    const result = await paymentService.processCallback({
      conversationData,
      paymentId,
      mdStatus: mdStatus || '1',
    });

    // Başarılı ödeme sonrası redirect
    if (result.success) {
      // Frontend'e success sayfasına yönlendir
      return res.redirect(`/payment/success?orderId=${result.orderId}&transactionId=${result.transactionId}`);
    } else {
      // Hata sayfasına yönlendir
      return res.redirect(`/payment/failed?orderId=${result.orderId || ''}`);
    }
  } catch (error: any) {
    log.error('Payment callback error:', error);
    return res.redirect(`/payment/failed?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * POST /api/payment/:id/refund
 * İade İşlemi
 * 
 * Params:
 * - id: Transaction ID
 * 
 * Body:
 * {
 *   amount?: number,  // Kısmi iade için. Belirtilmezse tam iade
 *   reason?: string
 * }
 */
router.post('/:id/refund', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const result = await paymentService.refundPayment(
      parseInt(id),
      amount ? parseFloat(amount) : undefined,
      reason
    );

    res.json(result);
  } catch (error: any) {
    log.error('Payment refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to refund payment',
    });
  }
});

/**
 * POST /api/payment/:id/cancel
 * İptal İşlemi (Henüz bankaya gitmemiş ödemeler)
 * 
 * Params:
 * - id: Transaction ID
 * 
 * Body:
 * {
 *   reason?: string
 * }
 */
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await paymentService.cancelPayment(parseInt(id), reason);

    res.json(result);
  } catch (error: any) {
    log.error('Payment cancel error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel payment',
    });
  }
});

/**
 * GET /api/payment/:id
 * Ödeme Detayları Sorgulama
 * 
 * Params:
 * - id: Transaction ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await paymentService.getPaymentDetails(parseInt(id));

    res.json({
      success: true,
      transaction,
    });
  } catch (error: any) {
    log.error('Payment details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment details',
    });
  }
});

/**
 * GET /api/payment/customer/:customerId
 * Müşterinin Tüm Ödemelerini Listele
 * 
 * Params:
 * - customerId: Customer ID
 * 
 * Query:
 * - status?: string
 * - startDate?: ISO date string
 * - endDate?: ISO date string
 */
router.get('/customer/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { status, startDate, endDate } = req.query;

    const filters: any = {};
    if (status) filters.status = status as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const transactions = await paymentService.getCustomerPayments(
      parseInt(customerId),
      filters
    );

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error: any) {
    log.error('Customer payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get customer payments',
    });
  }
});

/**
 * POST /api/payment/installments
 * Taksit Bilgilerini Getir
 * 
 * Body:
 * {
 *   binNumber: string,  // Kartın ilk 6 hanesi
 *   price: number
 * }
 */
router.post('/installments', async (req: Request, res: Response) => {
  try {
    const { binNumber, price } = req.body;

    if (!binNumber || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: binNumber, price',
      });
    }

    const result = await paymentService.getInstallmentOptions(
      binNumber,
      parseFloat(price)
    );

    res.json(result);
  } catch (error: any) {
    log.error('Installment info error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get installment info',
    });
  }
});

/**
 * POST /api/payment/card-info
 * Kart Bilgilerini Getir (BIN sorgulaması)
 * 
 * Body:
 * {
 *   binNumber: string  // Kartın ilk 6 hanesi
 * }
 */
router.post('/card-info', async (req: Request, res: Response) => {
  try {
    const { binNumber } = req.body;

    if (!binNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: binNumber',
      });
    }

    const result = await paymentService.getCardInfo(binNumber);

    res.json(result);
  } catch (error: any) {
    log.error('Card info error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get card info',
    });
  }
});

/**
 * GET /api/payment/stats/summary
 * Ödeme İstatistikleri
 * 
 * Query:
 * - startDate: ISO date string
 * - endDate: ISO date string
 */
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required query params: startDate, endDate',
      });
    }

    const stats = await paymentService.getPaymentStats(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    log.error('Payment stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment stats',
    });
  }
});

/**
 * POST /api/payment/webhook
 * iyzico Webhook Handler
 * 
 * Body: iyzico'dan gelen webhook payloadu
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    log.info('iyzico webhook received:', payload);

    // Webhook imza doğrulama (iyzico signature verification)
    // TODO: İmza doğrulama eklenecek

    // Webhook tipine göre işlem yap
    const { iyziEventType, status, paymentId } = payload;

    if (iyziEventType === 'PAYMENT_SUCCESS') {
      // Ödeme başarılı webhook
      log.info('Payment success webhook:', { paymentId, status });
      // İşlem zaten callback'te yapıldı, log tutmak yeterli
    } else if (iyziEventType === 'REFUND_SUCCESS') {
      // İade başarılı webhook
      log.info('Refund success webhook:', { paymentId, status });
    } else if (iyziEventType === 'PAYMENT_FAILED') {
      // Ödeme başarısız webhook
      log.warn('Payment failed webhook:', { paymentId, status });
    }

    // iyzico'ya başarılı yanıt dön
    res.status(200).json({ success: true });
  } catch (error: any) {
    log.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
