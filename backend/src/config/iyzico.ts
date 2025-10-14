import Iyzipay from 'iyzipay';
import { log } from './logger';

/**
 * iyzico Payment Gateway Configuration
 * Türkiye'nin en yaygın ödeme altyapısı
 * - 3D Secure zorunlu desteği
 * - Taksit seçenekleri
 * - Komisyon: %1.75 + 0.25 TL
 * - API Docs: https://dev.iyzipay.com/tr/api
 */

interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  uri: string;
}

class IyzicoClient {
  private client: any;
  private config: IyzicoConfig;

  constructor() {
    this.config = {
      apiKey: process.env.IYZICO_API_KEY || '',
      secretKey: process.env.IYZICO_SECRET_KEY || '',
      uri: process.env.NODE_ENV === 'production'
        ? 'https://api.iyzipay.com'
        : 'https://sandbox-api.iyzipay.com',
    };

    this.client = new Iyzipay({
      apiKey: this.config.apiKey,
      secretKey: this.config.secretKey,
      uri: this.config.uri,
    });

    log.info('iyzico Client initialized:', {
      environment: process.env.NODE_ENV,
      uri: this.config.uri,
    });
  }

  /**
   * 3D Secure Ödeme Başlatma
   * @param params Ödeme parametreleri
   * @returns 3D Secure HTML formu
   */
  async initiate3DSecurePayment(params: {
    conversationId: string;
    price: number;
    paidPrice: number;
    installment: number;
    basketId: string;
    paymentCard: {
      cardHolderName: string;
      cardNumber: string;
      expireMonth: string;
      expireYear: string;
      cvc: string;
      registerCard?: number;
    };
    buyer: {
      id: string;
      name: string;
      surname: string;
      email: string;
      identityNumber: string;
      registrationAddress: string;
      city: string;
      country: string;
      ip: string;
    };
    shippingAddress: {
      contactName: string;
      city: string;
      country: string;
      address: string;
    };
    billingAddress: {
      contactName: string;
      city: string;
      country: string;
      address: string;
    };
    basketItems: Array<{
      id: string;
      name: string;
      category1: string;
      itemType: string;
      price: string;
    }>;
    callbackUrl: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: params.conversationId,
        price: params.price.toFixed(2),
        paidPrice: params.paidPrice.toFixed(2),
        currency: Iyzipay.CURRENCY.TRY,
        installment: params.installment,
        basketId: params.basketId,
        paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        paymentCard: params.paymentCard,
        buyer: params.buyer,
        shippingAddress: params.shippingAddress,
        billingAddress: params.billingAddress,
        basketItems: params.basketItems,
        callbackUrl: params.callbackUrl,
      };

      log.info('iyzico: 3D Secure payment initiating...', {
        conversationId: params.conversationId,
        amount: params.paidPrice,
      });

      this.client.threedsInitialize.create(request, (err: any, result: any) => {
        if (err) {
          log.error('iyzico: 3D Secure initialization failed:', err);
          reject(err);
        } else {
          log.info('iyzico: 3D Secure initialized successfully', {
            status: result.status,
            threeDSHtmlContent: result.threeDSHtmlContent ? 'exists' : 'missing',
          });
          resolve(result);
        }
      });
    });
  }

  /**
   * 3D Secure Callback İşleme
   * @param conversationId Conversation ID
   * @param paymentId Payment ID
   * @returns Ödeme sonucu
   */
  async complete3DSecurePayment(
    conversationId: string,
    paymentId: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: conversationId,
        paymentId: paymentId,
      };

      log.info('iyzico: Completing 3D Secure payment...', {
        conversationId,
        paymentId,
      });

      this.client.threedsPayment.create(request, (err: any, result: any) => {
        if (err) {
          log.error('iyzico: 3D Secure completion failed:', err);
          reject(err);
        } else {
          log.info('iyzico: 3D Secure payment completed', {
            status: result.status,
            paymentStatus: result.paymentStatus,
          });
          resolve(result);
        }
      });
    });
  }

  /**
   * Direkt Ödeme (3D Secure olmadan - Sandbox için)
   * @param params Ödeme parametreleri
   * @returns Ödeme sonucu
   */
  async createDirectPayment(params: {
    conversationId: string;
    price: number;
    paidPrice: number;
    installment: number;
    basketId: string;
    paymentCard: {
      cardHolderName: string;
      cardNumber: string;
      expireMonth: string;
      expireYear: string;
      cvc: string;
    };
    buyer: any;
    shippingAddress: any;
    billingAddress: any;
    basketItems: any[];
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: params.conversationId,
        price: params.price.toFixed(2),
        paidPrice: params.paidPrice.toFixed(2),
        currency: Iyzipay.CURRENCY.TRY,
        installment: params.installment,
        basketId: params.basketId,
        paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        paymentCard: params.paymentCard,
        buyer: params.buyer,
        shippingAddress: params.shippingAddress,
        billingAddress: params.billingAddress,
        basketItems: params.basketItems,
      };

      log.info('iyzico: Direct payment creating...', {
        conversationId: params.conversationId,
        amount: params.paidPrice,
      });

      this.client.payment.create(request, (err: any, result: any) => {
        if (err) {
          log.error('iyzico: Direct payment failed:', err);
          reject(err);
        } else {
          log.info('iyzico: Direct payment completed', {
            status: result.status,
            paymentId: result.paymentId,
          });
          resolve(result);
        }
      });
    });
  }

  /**
   * İade İşlemi
   * @param paymentTransactionId İşlem ID
   * @param price İade tutarı
   * @param ip IP adresi
   * @returns İade sonucu
   */
  async refund(
    paymentTransactionId: string,
    price: number,
    ip: string,
    conversationId?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: conversationId || `refund-${Date.now()}`,
        paymentTransactionId: paymentTransactionId,
        price: price.toFixed(2),
        currency: Iyzipay.CURRENCY.TRY,
        ip: ip,
      };

      log.info('iyzico: Refund processing...', {
        paymentTransactionId,
        amount: price,
      });

      this.client.refund.create(request, (err: any, result: any) => {
        if (err) {
          log.error('iyzico: Refund failed:', err);
          reject(err);
        } else {
          log.info('iyzico: Refund completed', {
            status: result.status,
            paymentId: result.paymentId,
          });
          resolve(result);
        }
      });
    });
  }

  /**
   * İptal İşlemi (Henüz bankalara gitmemiş işlemler için)
   * @param paymentId Payment ID
   * @param ip IP adresi
   * @returns İptal sonucu
   */
  async cancel(
    paymentId: string,
    ip: string,
    conversationId?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: conversationId || `cancel-${Date.now()}`,
        paymentId: paymentId,
        ip: ip,
      };

      log.info('iyzico: Cancel processing...', {
        paymentId,
      });

      this.client.cancel.create(request, (err: any, result: any) => {
        if (err) {
          log.error('iyzico: Cancel failed:', err);
          reject(err);
        } else {
          log.info('iyzico: Cancel completed', {
            status: result.status,
          });
          resolve(result);
        }
      });
    });
  }

  /**
   * Taksit Bilgilerini Sorgulama
   * @param binNumber BIN numarası (kartın ilk 6 hanesi)
   * @param price Tutar
   * @returns Taksit seçenekleri
   */
  async getInstallmentInfo(
    binNumber: string,
    price: number,
    conversationId?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: conversationId || `installment-${Date.now()}`,
        binNumber: binNumber,
        price: price.toFixed(2),
      };

      log.info('iyzico: Getting installment info...', {
        binNumber: binNumber.substring(0, 4) + '**',
      });

      this.client.installmentInfo.retrieve(request, (err: any, result: any) => {
        if (err) {
          log.error('iyzico: Installment info failed:', err);
          reject(err);
        } else {
          log.info('iyzico: Installment info retrieved');
          resolve(result);
        }
      });
    });
  }

  /**
   * BIN Numarasını Sorgulama (Kart bilgisi alma)
   * @param binNumber BIN numarası
   * @returns Kart bilgileri
   */
  async retrieveBinNumber(
    binNumber: string,
    conversationId?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: conversationId || `bin-${Date.now()}`,
        binNumber: binNumber,
      };

      log.info('iyzico: Retrieving BIN info...', {
        binNumber: binNumber.substring(0, 4) + '**',
      });

      this.client.binNumber.retrieve(request, (err: any, result: any) => {
        if (err) {
          log.error('iyzico: BIN retrieval failed:', err);
          reject(err);
        } else {
          log.info('iyzico: BIN info retrieved', {
            cardType: result.cardType,
            cardAssociation: result.cardAssociation,
          });
          resolve(result);
        }
      });
    });
  }

  /**
   * Ödeme Sorgulama
   * @param paymentId Payment ID
   * @param conversationId Conversation ID (opsiyonel)
   * @returns Ödeme detayları
   */
  async retrievePayment(
    paymentId: string,
    conversationId?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: conversationId || `retrieve-${Date.now()}`,
        paymentId: paymentId,
      };

      log.info('iyzico: Retrieving payment...', {
        paymentId,
      });

      this.client.payment.retrieve(request, (err: any, result: any) => {
        if (err) {
          log.error('iyzico: Payment retrieval failed:', err);
          reject(err);
        } else {
          log.info('iyzico: Payment retrieved', {
            status: result.status,
            paymentStatus: result.paymentStatus,
          });
          resolve(result);
        }
      });
    });
  }

  /**
   * iyzico yapılandırma durumunu kontrol et
   * @returns Yapılandırma durumu
   */
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.secretKey);
  }

  /**
   * Test ödeme bilgileri (Sandbox için)
   */
  static getTestCards() {
    return {
      success: {
        cardNumber: '5528790000000008',
        expireMonth: '12',
        expireYear: '2030',
        cvc: '123',
        cardHolderName: 'Test User',
      },
      insufficientFunds: {
        cardNumber: '5406670000000009',
        expireMonth: '12',
        expireYear: '2030',
        cvc: '123',
        cardHolderName: 'Test User',
      },
      doNotHonor: {
        cardNumber: '4157920000000002',
        expireMonth: '12',
        expireYear: '2030',
        cvc: '123',
        cardHolderName: 'Test User',
      },
    };
  }

  /**
   * Callback URL oluştur
   */
  static getCallbackUrl(): string {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return `${baseUrl}/api/payment/callback`;
  }
}

// Singleton instance
export const iyzicoClient = new IyzicoClient();

// Export Iyzipay constants
export const IyzicoConstants = {
  LOCALE: Iyzipay.LOCALE,
  CURRENCY: Iyzipay.CURRENCY,
  BASKET_ITEM_TYPE: Iyzipay.BASKET_ITEM_TYPE,
  PAYMENT_CHANNEL: Iyzipay.PAYMENT_CHANNEL,
  PAYMENT_GROUP: Iyzipay.PAYMENT_GROUP,
};

// Utility functions
export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 10) return '****';
  return cardNumber.substring(0, 4) + '******' + cardNumber.substring(cardNumber.length - 4);
};

export const validateCardNumber = (cardNumber: string): boolean => {
  // Luhn algoritması ile kart numarası validasyonu
  const sanitized = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(sanitized)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const validateCVC = (cvc: string): boolean => {
  return /^\d{3,4}$/.test(cvc);
};

export const validateExpiry = (month: string, year: string): boolean => {
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expMonth < 1 || expMonth > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
};

export default iyzicoClient;
