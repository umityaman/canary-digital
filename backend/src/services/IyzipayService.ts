import Iyzipay from 'iyzipay';
import { Payment, PaymentStatus } from '@prisma/client';
import { prisma } from '../database';

export interface IyzipayConfig {
  apiKey: string;
  secretKey: string;
  uri: string;
}

export interface PaymentRequest {
  price: string;
  paidPrice: string;
  currency: string;
  basketId: string;
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    registerCard?: string;
  };
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  shippingAddress?: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    category2?: string;
    itemType: string;
    price: string;
  }>;
}

export interface RefundRequest {
  paymentTransactionId: string;
  price: string;
  currency: string;
  ip: string;
  reason?: string;
}

export interface InstallmentRequest {
  price: string;
  binNumber: string;
}

export class IyzipayService {
  private iyzipay: any;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = this.initializeIyzipay();
  }

  private initializeIyzipay(): boolean {
    const apiKey = process.env.IYZIPAY_API_KEY;
    const secretKey = process.env.IYZIPAY_SECRET_KEY;
    const uri = process.env.IYZIPAY_URI || 'https://sandbox-api.iyzipay.com';

    if (!apiKey || !secretKey) {
      console.warn('⚠️  Iyzico credentials not found. Payment features disabled.');
      return false;
    }

    this.iyzipay = new Iyzipay({
      apiKey,
      secretKey,
      uri
    });

    console.log('✅ Iyzico payment gateway initialized');
    return true;
  }

  public isIyzipayEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Create a payment
   */
  async createPayment(request: PaymentRequest): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Iyzipay is not configured');
    }

    return new Promise((resolve, reject) => {
      this.iyzipay.payment.create(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Create a 3D secure payment
   */
  async create3DPayment(request: PaymentRequest & { callbackUrl: string }): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Iyzipay is not configured');
    }

    return new Promise((resolve, reject) => {
      this.iyzipay.threedsPayment.create(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Complete 3D secure payment
   */
  async complete3DPayment(request: { conversationId: string; paymentId: string }): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Iyzipay is not configured');
    }

    return new Promise((resolve, reject) => {
      this.iyzipay.threedsPayment.retrieve(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Refund a payment
   */
  async refundPayment(request: RefundRequest): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Iyzipay is not configured');
    }

    return new Promise((resolve, reject) => {
      this.iyzipay.refund.create(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(request: { paymentId: string; ip: string }): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Iyzipay is not configured');
    }

    return new Promise((resolve, reject) => {
      this.iyzipay.cancel.create(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Get installment information
   */
  async getInstallmentInfo(request: InstallmentRequest): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Iyzipay is not configured');
    }

    return new Promise((resolve, reject) => {
      this.iyzipay.installmentInfo.retrieve(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Retrieve payment details
   */
  async getPayment(request: { paymentId: string }): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Iyzipay is not configured');
    }

    return new Promise((resolve, reject) => {
      this.iyzipay.payment.retrieve(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Save payment to database
   */
  async savePaymentRecord(data: {
    contractId: number;
    companyId: number;
    amount: number;
    currency: string;
    iyzipayPaymentId?: string;
    conversationId?: string;
    status: PaymentStatus;
    paymentMethod: string;
    description?: string;
    metadata?: any;
  }): Promise<Payment> {
    return await prisma.payment.create({
      data: {
        contractId: data.contractId,
        companyId: data.companyId,
        amount: data.amount,
        currency: data.currency,
        iyzipayPaymentId: data.iyzipayPaymentId,
        conversationId: data.conversationId,
        status: data.status,
        paymentMethod: data.paymentMethod,
        description: data.description,
        metadata: data.metadata,
        paidAt: data.status === PaymentStatus.COMPLETED ? new Date() : null
      }
    });
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId: number, status: PaymentStatus, metadata?: any): Promise<Payment> {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        metadata: metadata ? { ...metadata } : undefined,
        paidAt: status === PaymentStatus.COMPLETED ? new Date() : undefined,
        failedAt: status === PaymentStatus.FAILED ? new Date() : undefined
      }
    });
  }

  /**
   * Get payments for a contract
   */
  async getContractPayments(contractId: number, companyId: number): Promise<Payment[]> {
    return await prisma.payment.findMany({
      where: {
        contractId,
        companyId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Generate conversation ID
   */
  generateConversationId(contractId: number): string {
    return `contract_${contractId}_${Date.now()}`;
  }

  /**
   * Generate basket ID
   */
  generateBasketId(contractId: number): string {
    return `basket_${contractId}_${Date.now()}`;
  }

  /**
   * Format payment card data
   */
  formatPaymentCard(card: {
    holderName: string;
    number: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  }) {
    return {
      cardHolderName: card.holderName,
      cardNumber: card.number.replace(/\s/g, ''),
      expireMonth: card.expireMonth.padStart(2, '0'),
      expireYear: card.expireYear,
      cvc: card.cvc,
      registerCard: '0'
    };
  }

  /**
   * Format buyer information
   */
  formatBuyer(user: any, ip: string) {
    return {
      id: user.id.toString(),
      name: user.name.split(' ')[0] || 'Ad',
      surname: user.name.split(' ').slice(1).join(' ') || 'Soyad',
      gsmNumber: user.phone || '+905555555555',
      email: user.email,
      identityNumber: user.identityNumber || '11111111111',
      registrationAddress: user.address || 'İstanbul, Türkiye',
      ip,
      city: 'İstanbul',
      country: 'Turkey',
      zipCode: '34000'
    };
  }

  /**
   * Format address information
   */
  formatAddress(user: any) {
    return {
      contactName: user.name,
      city: 'İstanbul',
      country: 'Turkey',
      address: user.address || 'İstanbul, Türkiye',
      zipCode: '34000'
    };
  }

  /**
   * Format basket items from contract
   */
  formatBasketItems(contract: any) {
    return contract.contractItems?.map((item: any, index: number) => ({
      id: `item_${index + 1}`,
      name: item.equipment?.name || 'Ekipman',
      category1: item.equipment?.category?.name || 'Ekipman',
      category2: 'Kiralama',
      itemType: 'VIRTUAL',
      price: (item.unitPrice || 0).toString()
    })) || [];
  }
}

export const iyzipayService = new IyzipayService();