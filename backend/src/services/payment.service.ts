import { iyzicoClient, IyzicoConstants, maskCardNumber } from '../config/iyzico';
import { invoiceService } from './invoice.service';
import { prisma } from '../index';
import { log } from '../config/logger';

interface InitiatePaymentParams {
  orderId: number;
  customerId: number;
  amount: number;
  installment?: number;
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  saveCard?: boolean;
}

interface ProcessCallbackParams {
  conversationData: string;
  paymentId: string;
  mdStatus: string;
}

/**
 * Payment Service
 * iyzico entegrasyonu ile ödeme işlemleri
 */
export class PaymentService {
  /**
   * 3D Secure Ödeme Başlatma
   * @param params Ödeme parametreleri
   * @returns 3D Secure HTML formu
   */
  async initiatePayment(params: InitiatePaymentParams) {
    try {
      log.info('Payment Service: Ödeme başlatılıyor...', {
        orderId: params.orderId,
        amount: params.amount,
        installment: params.installment || 1,
      });

      // Sipariş bilgilerini al
      const order = await prisma.order.findUnique({
        where: { id: params.orderId },
        include: {
          customer: true,
          equipment: true,
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Müşteri bilgilerini al
      const customer = await prisma.user.findUnique({
        where: { id: params.customerId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Conversation ID oluştur
      const conversationId = `order-${params.orderId}-${Date.now()}`;

      // Buyer bilgileri hazırla
      const buyer = {
        id: `customer-${customer.id}`,
        name: customer.fullName?.split(' ')[0] || 'Ad',
        surname: customer.fullName?.split(' ').slice(1).join(' ') || 'Soyad',
        email: customer.email,
        identityNumber: customer.taxNumber || '11111111111',
        registrationAddress: customer.address || 'Adres bilgisi yok',
        city: 'İstanbul',
        country: 'Turkey',
        ip: customer.lastLoginIp || '85.34.78.112',
      };

      // Shipping ve Billing address
      const address = {
        contactName: customer.fullName || 'Müşteri',
        city: 'İstanbul',
        country: 'Turkey',
        address: customer.address || 'Adres bilgisi yok',
      };

      // Basket items
      const basketItems = [
        {
          id: `equipment-${order.equipment.id}`,
          name: order.equipment.name,
          category1: order.equipment.category || 'Genel',
          itemType: IyzicoConstants.BASKET_ITEM_TYPE.PHYSICAL,
          price: params.amount.toFixed(2),
        },
      ];

      // 3D Secure ödeme başlat
      const result = await iyzicoClient.initiate3DSecurePayment({
        conversationId,
        price: params.amount,
        paidPrice: params.amount,
        installment: params.installment || 1,
        basketId: `basket-${params.orderId}`,
        paymentCard: {
          cardHolderName: params.cardHolderName,
          cardNumber: params.cardNumber,
          expireMonth: params.expireMonth,
          expireYear: params.expireYear,
          cvc: params.cvc,
          registerCard: params.saveCard ? 1 : 0,
        },
        buyer,
        shippingAddress: address,
        billingAddress: address,
        basketItems,
        callbackUrl: `${process.env.BACKEND_URL}/api/payment/callback`,
      });

      if (result.status !== 'success') {
        throw new Error(result.errorMessage || 'Payment initiation failed');
      }

      // Transaction kaydı oluştur
      const transaction = await prisma.transaction.create({
        data: {
          orderId: params.orderId,
          customerId: params.customerId,
          amount: params.amount,
          currency: 'TRY',
          conversationId,
          status: 'pending',
          type: '3d_secure',
          installment: params.installment || 1,
          cardNumber: maskCardNumber(params.cardNumber),
        },
      });

      log.info('Payment Service: 3D Secure başlatıldı', {
        transactionId: transaction.id,
        conversationId,
      });

      return {
        success: true,
        transactionId: transaction.id,
        threeDSHtmlContent: result.threeDSHtmlContent,
        conversationId,
      };
    } catch (error: any) {
      log.error('Payment Service: Ödeme başlatılamadı:', error);
      throw error;
    }
  }

  /**
   * 3D Secure Callback İşleme
   * @param params Callback parametreleri
   * @returns İşlem sonucu
   */
  async processCallback(params: ProcessCallbackParams) {
    try {
      log.info('Payment Service: Callback işleniyor...', {
        conversationData: params.conversationData,
        mdStatus: params.mdStatus,
      });

      // Conversation ID'den order ID'yi çıkar
      const orderId = parseInt(params.conversationData.split('-')[1]);

      // Transaction kaydını bul
      const transaction = await prisma.transaction.findFirst({
        where: {
          conversationId: params.conversationData,
          orderId,
        },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // 3D Secure'yi tamamla
      const result = await iyzicoClient.complete3DSecurePayment(
        params.conversationData,
        params.paymentId
      );

      if (result.status === 'success') {
        // Transaction'ı güncelle
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'completed',
            iyzicoPaymentId: result.paymentId,
            iyzicoPaymentStatus: result.paymentStatus,
            responseData: JSON.stringify(result),
            completedAt: new Date(),
          },
        });

        // Sipariş durumunu güncelle
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
        });

        // Fatura varsa ödeme kaydet
        const invoice = await prisma.invoice.findFirst({
          where: { orderId },
        });

        if (invoice) {
          await invoiceService.recordPayment(invoice.id, {
            amount: transaction.amount,
            paymentDate: new Date(),
            paymentMethod: 'credit_card',
            transactionId: result.paymentId,
            notes: `iyzico ödeme - ${transaction.installment} taksit`,
          });
        }

        log.info('Payment Service: Ödeme başarılı', {
          transactionId: transaction.id,
          orderId,
          amount: transaction.amount,
        });

        return {
          success: true,
          message: 'Payment completed successfully',
          transactionId: transaction.id,
          orderId,
        };
      } else {
        // Ödeme başarısız
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'failed',
            errorMessage: result.errorMessage,
            responseData: JSON.stringify(result),
          },
        });

        log.error('Payment Service: Ödeme başarısız', {
          transactionId: transaction.id,
          errorMessage: result.errorMessage,
        });

        throw new Error(result.errorMessage || 'Payment failed');
      }
    } catch (error: any) {
      log.error('Payment Service: Callback işlenemedi:', error);
      throw error;
    }
  }

  /**
   * İade İşlemi
   * @param transactionId Transaction ID
   * @param amount İade tutarı (tam iade için belirtilmezse tamamı)
   * @param reason İade nedeni
   * @returns İade sonucu
   */
  async refundPayment(
    transactionId: number,
    amount?: number,
    reason?: string
  ) {
    try {
      log.info('Payment Service: İade işlemi başlatılıyor...', {
        transactionId,
        amount,
      });

      // Transaction kaydını bul
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          order: true,
        },
      });

      if (!transaction || !transaction.iyzicoPaymentId) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'completed') {
        throw new Error('Only completed transactions can be refunded');
      }

      // İade tutarı belirtilmemişse tam iade
      const refundAmount = amount || transaction.amount;

      if (refundAmount > transaction.amount) {
        throw new Error('Refund amount cannot exceed transaction amount');
      }

      // iyzico'da iade işlemi
      const result = await iyzicoClient.refund(
        transaction.iyzicoPaymentId,
        refundAmount,
        '85.34.78.112',
        `refund-${transactionId}-${Date.now()}`
      );

      if (result.status === 'success') {
        // Refund kaydı oluştur
        const refund = await prisma.refund.create({
          data: {
            orderId: transaction.orderId,
            amount: refundAmount,
            reason: reason || 'Müşteri talebi',
            transactionId: transaction.iyzicoPaymentId,
            status: 'completed',
          },
        });

        // Transaction durumunu güncelle
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'refunded',
            refundedAmount: refundAmount,
          },
        });

        log.info('Payment Service: İade başarılı', {
          refundId: refund.id,
          amount: refundAmount,
        });

        return {
          success: true,
          message: 'Refund completed successfully',
          refundId: refund.id,
          amount: refundAmount,
        };
      } else {
        throw new Error(result.errorMessage || 'Refund failed');
      }
    } catch (error: any) {
      log.error('Payment Service: İade başarısız:', error);
      throw error;
    }
  }

  /**
   * İptal İşlemi (Henüz bankalara gitmemiş işlemler)
   * @param transactionId Transaction ID
   * @param reason İptal nedeni
   * @returns İptal sonucu
   */
  async cancelPayment(transactionId: number, reason?: string) {
    try {
      log.info('Payment Service: İptal işlemi başlatılıyor...', {
        transactionId,
      });

      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction || !transaction.iyzicoPaymentId) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'completed') {
        throw new Error('Only completed transactions can be cancelled');
      }

      // iyzico'da iptal işlemi
      const result = await iyzicoClient.cancel(
        transaction.iyzicoPaymentId,
        '85.34.78.112',
        `cancel-${transactionId}-${Date.now()}`
      );

      if (result.status === 'success') {
        // Transaction durumunu güncelle
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'cancelled',
            errorMessage: reason || 'İşlem iptal edildi',
          },
        });

        log.info('Payment Service: İptal başarılı', {
          transactionId,
        });

        return {
          success: true,
          message: 'Payment cancelled successfully',
        };
      } else {
        throw new Error(result.errorMessage || 'Cancel failed');
      }
    } catch (error: any) {
      log.error('Payment Service: İptal başarısız:', error);
      throw error;
    }
  }

  /**
   * Taksit Bilgilerini Getir
   * @param binNumber Kartın ilk 6 hanesi
   * @param price Tutar
   * @returns Taksit seçenekleri
   */
  async getInstallmentOptions(binNumber: string, price: number) {
    try {
      log.info('Payment Service: Taksit bilgileri alınıyor...', {
        binNumber: binNumber.substring(0, 4) + '**',
        price,
      });

      const result = await iyzicoClient.getInstallmentInfo(binNumber, price);

      if (result.status === 'success') {
        return {
          success: true,
          installmentOptions: result.installmentDetails,
        };
      } else {
        throw new Error(result.errorMessage || 'Failed to get installment info');
      }
    } catch (error: any) {
      log.error('Payment Service: Taksit bilgileri alınamadı:', error);
      throw error;
    }
  }

  /**
   * Kart Bilgilerini Getir (BIN sorgulaması)
   * @param binNumber Kartın ilk 6 hanesi
   * @returns Kart bilgileri
   */
  async getCardInfo(binNumber: string) {
    try {
      log.info('Payment Service: Kart bilgileri alınıyor...');

      const result = await iyzicoClient.retrieveBinNumber(binNumber);

      if (result.status === 'success') {
        return {
          success: true,
          cardType: result.cardType,
          cardAssociation: result.cardAssociation,
          cardFamily: result.cardFamily,
          bankName: result.bankName,
          commercial: result.commercial,
        };
      } else {
        throw new Error(result.errorMessage || 'Failed to get card info');
      }
    } catch (error: any) {
      log.error('Payment Service: Kart bilgileri alınamadı:', error);
      throw error;
    }
  }

  /**
   * Ödeme Sorgulama
   * @param transactionId Transaction ID
   * @returns Ödeme detayları
   */
  async getPaymentDetails(transactionId: number) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          order: {
            include: {
              equipment: true,
              customer: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // iyzico'dan güncel durumu al
      if (transaction.iyzicoPaymentId) {
        try {
          const iyzicoResult = await iyzicoClient.retrievePayment(
            transaction.iyzicoPaymentId
          );
          
          // Durum farklıysa güncelle
          if (iyzicoResult.status === 'success' && 
              iyzicoResult.paymentStatus !== transaction.iyzicoPaymentStatus) {
            await prisma.transaction.update({
              where: { id: transactionId },
              data: {
                iyzicoPaymentStatus: iyzicoResult.paymentStatus,
              },
            });
            transaction.iyzicoPaymentStatus = iyzicoResult.paymentStatus;
          }
        } catch (error) {
          log.warn('Payment Service: iyzico sorgulama başarısız:', error);
        }
      }

      return transaction;
    } catch (error: any) {
      log.error('Payment Service: Ödeme detayları alınamadı:', error);
      throw error;
    }
  }

  /**
   * Müşterinin Tüm Ödemelerini Listele
   * @param customerId Müşteri ID
   * @param filters Filtreleme parametreleri
   * @returns Ödeme listesi
   */
  async getCustomerPayments(
    customerId: number,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    try {
      const where: any = { customerId };

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.createdAt.lte = filters.endDate;
        }
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          order: {
            include: {
              equipment: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return transactions;
    } catch (error: any) {
      log.error('Payment Service: Müşteri ödemeleri alınamadı:', error);
      throw error;
    }
  }

  /**
   * Ödeme İstatistikleri
   * @param startDate Başlangıç tarihi
   * @param endDate Bitiş tarihi
   * @returns İstatistikler
   */
  async getPaymentStats(startDate: Date, endDate: Date) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'completed',
        },
      });

      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      const totalRefunded = transactions.reduce(
        (sum, t) => sum + (t.refundedAmount || 0),
        0
      );
      const netAmount = totalAmount - totalRefunded;

      return {
        totalTransactions: transactions.length,
        totalAmount,
        totalRefunded,
        netAmount,
        averageAmount: totalAmount / transactions.length || 0,
        byInstallment: this.groupByInstallment(transactions),
      };
    } catch (error: any) {
      log.error('Payment Service: İstatistikler alınamadı:', error);
      throw error;
    }
  }

  /**
   * Taksit bazında gruplama helper
   */
  private groupByInstallment(transactions: any[]) {
    const grouped: { [key: number]: { count: number; amount: number } } = {};

    transactions.forEach((t) => {
      const installment = t.installment || 1;
      if (!grouped[installment]) {
        grouped[installment] = { count: 0, amount: 0 };
      }
      grouped[installment].count++;
      grouped[installment].amount += t.amount;
    });

    return grouped;
  }
}

export const paymentService = new PaymentService();
