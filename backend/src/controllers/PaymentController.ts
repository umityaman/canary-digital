import { Request, Response } from 'express';
import { PaymentStatus } from '@prisma/client';
import { iyzipayService } from '../services/IyzipayService';
import { prisma } from '../database';

export class PaymentController {
  
  /**
   * Create a payment for contract
   */
  async createPayment(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      const { 
        amount, 
        currency = 'TRY',
        paymentCard,
        use3D = false,
        callbackUrl,
        description
      } = req.body;

      const companyId = req.user?.companyId;
      const userId = req.user?.id;

      if (!companyId) {
        return res.status(401).json({ error: 'Yetkisiz erişim' });
      }

      // Get contract
      const contract = await prisma.contract.findFirst({
        where: {
          id: parseInt(contractId),
          companyId
        },
        include: {
          customer: true,
          contractItems: {
            include: {
              equipment: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      if (!contract) {
        return res.status(404).json({ error: 'Sözleşme bulunamadı' });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      // Generate IDs
      const conversationId = iyzipayService.generateConversationId(contract.id);
      const basketId = iyzipayService.generateBasketId(contract.id);

      // Get client IP
      const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

      // Prepare payment request
      const paymentRequest = {
        price: amount.toString(),
        paidPrice: amount.toString(),
        currency,
        basketId,
        conversationId,
        paymentCard: iyzipayService.formatPaymentCard(paymentCard),
        buyer: iyzipayService.formatBuyer(contract.customer, clientIp),
        shippingAddress: iyzipayService.formatAddress(contract.customer),
        billingAddress: iyzipayService.formatAddress(contract.customer),
        basketItems: iyzipayService.formatBasketItems(contract)
      };

      let result;

      if (use3D) {
        // 3D Secure payment
        result = await iyzipayService.create3DPayment({
          ...paymentRequest,
          callbackUrl: callbackUrl || `${process.env.FRONTEND_URL}/payments/callback`
        });
      } else {
        // Direct payment
        result = await iyzipayService.createPayment(paymentRequest);
      }

      // Save payment record
      const payment = await iyzipayService.savePaymentRecord({
        contractId: contract.id,
        companyId,
        amount: parseFloat(amount),
        currency,
        iyzipayPaymentId: result.paymentId,
        conversationId,
        status: result.status === 'success' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        paymentMethod: 'CREDIT_CARD',
        description,
        metadata: {
          iyzipayResult: result,
          use3D,
          basketId
        }
      });

      res.json({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency
        },
        iyzipay: {
          status: result.status,
          paymentId: result.paymentId,
          conversationId: result.conversationId,
          threeDSHtmlContent: result.threeDSHtmlContent || null
        }
      });

    } catch (error) {
      console.error('Payment creation error:', error);
      res.status(500).json({ 
        error: 'Ödeme işlemi başlatılamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  /**
   * Complete 3D Secure payment
   */
  async complete3DPayment(req: Request, res: Response) {
    try {
      const { conversationId, paymentId } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Yetkisiz erişim' });
      }

      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: {
          conversationId,
          companyId
        }
      });

      if (!payment) {
        return res.status(404).json({ error: 'Ödeme kaydı bulunamadı' });
      }

      // Complete 3D payment
      const result = await iyzipayService.complete3DPayment({
        conversationId,
        paymentId
      });

      // Update payment status
      const updatedPayment = await iyzipayService.updatePaymentStatus(
        payment.id,
        result.status === 'success' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        {
          ...payment.metadata,
          completionResult: result
        }
      );

      res.json({
        success: true,
        payment: {
          id: updatedPayment.id,
          status: updatedPayment.status,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency
        },
        iyzipay: result
      });

    } catch (error) {
      console.error('3D payment completion error:', error);
      res.status(500).json({ 
        error: '3D ödeme tamamlanamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Yetkisiz erişim' });
      }

      // Get payment
      const payment = await prisma.payment.findFirst({
        where: {
          id: parseInt(paymentId),
          companyId,
          status: PaymentStatus.COMPLETED
        }
      });

      if (!payment) {
        return res.status(404).json({ error: 'Ödeme bulunamadı veya iade edilebilir durumda değil' });
      }

      if (!payment.iyzipayPaymentId) {
        return res.status(400).json({ error: 'Iyzipay ödeme ID bulunamadı' });
      }

      // Get client IP
      const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

      // Create refund request
      const refundRequest = {
        paymentTransactionId: payment.iyzipayPaymentId,
        price: (amount || payment.amount).toString(),
        currency: payment.currency,
        ip: clientIp,
        reason: reason || 'Müşteri talebi'
      };

      const result = await iyzipayService.refundPayment(refundRequest);

      // Update payment status
      const updatedPayment = await iyzipayService.updatePaymentStatus(
        payment.id,
        PaymentStatus.REFUNDED,
        {
          ...payment.metadata,
          refundResult: result,
          refundReason: reason
        }
      );

      res.json({
        success: true,
        payment: updatedPayment,
        refund: result
      });

    } catch (error) {
      console.error('Payment refund error:', error);
      res.status(500).json({ 
        error: 'Ödeme iadesi başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  /**
   * Get contract payments
   */
  async getContractPayments(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Yetkisiz erişim' });
      }

      const payments = await iyzipayService.getContractPayments(
        parseInt(contractId),
        companyId
      );

      res.json({
        success: true,
        payments
      });

    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({ 
        error: 'Ödemeler getirilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  /**
   * Get installment information
   */
  async getInstallmentInfo(req: Request, res: Response) {
    try {
      const { price, binNumber } = req.query;

      if (!price || !binNumber) {
        return res.status(400).json({ error: 'Fiyat ve BIN numarası gerekli' });
      }

      const result = await iyzipayService.getInstallmentInfo({
        price: price as string,
        binNumber: binNumber as string
      });

      res.json({
        success: true,
        installments: result
      });

    } catch (error) {
      console.error('Get installment info error:', error);
      res.status(500).json({ 
        error: 'Taksit bilgileri alınamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Yetkisiz erişim' });
      }

      const payment = await prisma.payment.findFirst({
        where: {
          id: parseInt(paymentId),
          companyId
        },
        include: {
          contract: {
            select: {
              id: true,
              contractNumber: true,
              customer: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!payment) {
        return res.status(404).json({ error: 'Ödeme bulunamadı' });
      }

      // If Iyzipay payment ID exists, get latest status from Iyzipay
      let iyzipayStatus = null;
      if (payment.iyzipayPaymentId) {
        try {
          iyzipayStatus = await iyzipayService.getPayment({
            paymentId: payment.iyzipayPaymentId
          });
        } catch (error) {
          console.warn('Could not fetch Iyzipay status:', error);
        }
      }

      res.json({
        success: true,
        payment: {
          ...payment,
          iyzipayStatus
        }
      });

    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({ 
        error: 'Ödeme durumu alınamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  /**
   * Webhook handler for Iyzipay notifications
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const { status, paymentId, conversationId } = req.body;

      // Find payment by conversation ID
      const payment = await prisma.payment.findFirst({
        where: {
          conversationId
        }
      });

      if (!payment) {
        console.warn('Webhook: Payment not found for conversationId:', conversationId);
        return res.status(200).json({ received: true });
      }

      // Update payment status based on webhook
      let newStatus: PaymentStatus;
      switch (status) {
        case 'success':
          newStatus = PaymentStatus.COMPLETED;
          break;
        case 'failure':
          newStatus = PaymentStatus.FAILED;
          break;
        default:
          newStatus = PaymentStatus.PENDING;
      }

      await iyzipayService.updatePaymentStatus(
        payment.id,
        newStatus,
        {
          ...payment.metadata,
          webhookData: req.body,
          webhookReceivedAt: new Date().toISOString()
        }
      );

      console.log(`Webhook: Payment ${payment.id} status updated to ${newStatus}`);

      res.status(200).json({ received: true });

    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook işleme hatası' });
    }
  }
}

export const paymentController = new PaymentController();