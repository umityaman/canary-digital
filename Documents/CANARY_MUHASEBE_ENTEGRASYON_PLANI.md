# CANARY Rental Software - Muhasebe ve Finans Entegrasyon Planı

**Hazırlayan:** GitHub Copilot  
**Tarih:** 13 Ekim 2025  
**Versiyon:** 1.0

---

## 📊 Executive Summary

Bu doküman, CANARY Rental Software için kapsamlı bir muhasebe, ödeme ve finans entegrasyon planı sunmaktadır. Analiz edilen dokümanlar ve pazar araştırması sonucunda, kiralama işi için özelleştirilmiş çözümler önerilmektedir.

---

## 🎯 Temel İhtiyaçlar

### Kiralama İşi İçin Kritik Özellikler:
1. **Fatura Kesimi**: e-Fatura, e-Arşiv (müşteriye göre otomatik seçim)
2. **Taksitli Ödeme**: Uzun dönem kiralamalarda taksit planı
3. **Depozito Yönetimi**: Güvenlik teminatı takibi
4. **Periyodik Faturalama**: Aylık/yıllık abonelik faturaları
5. **Gecikme Cezası**: Otomatik hesaplama ve faturalama
6. **İade/İptal**: Kısmi/tam iade süreçleri
7. **Raporlama**: Gelir-gider, karlılık, tahsilat analizleri
8. **Muhasebe Entegrasyonu**: Otomatik kayıt aktarımı

---

## 🏗️ Önerilen Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                     CANARY Frontend/Mobile                   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  CANARY Backend API                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Financial Service Layer                      │   │
│  │  - Invoice Management                                │   │
│  │  - Payment Processing                                │   │
│  │  - Accounting Integration                            │   │
│  │  - Deposit Tracking                                  │   │
│  │  - Late Fee Calculation                              │   │
│  └──────────────────────────────────────────────────────┘   │
└────────┬──────────┬──────────┬──────────┬──────────┬────────┘
         │          │          │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐ ┌──▼──────┐
    │e-Belge │ │ Ödeme  │ │Muhasebe│ │  Banka │ │ Dijital │
    │Sağlayıcı│ │Gateway │ │Programı│ │   API  │ │ Cüzdan  │
    └────────┘ └────────┘ └────────┘ └────────┘ └─────────┘
```

---

## 💼 Faz 1: e-Belge Entegrasyonu (Priority: 🔥 VERY HIGH)

### Önerilen Sağlayıcı: **Paraşüt**
**Neden Paraşüt?**
- KOBİ odaklı, uygun fiyat (150-300 TL/ay)
- Kolay REST API entegrasyonu
- e-Fatura, e-Arşiv, e-Defter tam desteği
- Banka entegrasyonu ile otomatik mutabakat
- Webhook desteği (anlık bildirimler)
- Türkçe 7/24 destek

**Alternatif:** Logo e-Fatura (daha büyük ölçek için)

### Entegrasyon Adımları

#### 1.1 Paraşüt API Setup
```bash
# Backend dependencies
npm install axios dotenv
```

#### 1.2 Configuration File
**Dosya:** `backend/src/config/parasut.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

interface ParasutConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  companyId: string;
}

interface ParasutTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class ParasutClient {
  private config: ParasutConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private client: AxiosInstance;

  constructor() {
    this.config = {
      clientId: process.env.PARASUT_CLIENT_ID || '',
      clientSecret: process.env.PARASUT_CLIENT_SECRET || '',
      username: process.env.PARASUT_USERNAME || '',
      password: process.env.PARASUT_PASSWORD || '',
      companyId: process.env.PARASUT_COMPANY_ID || '',
    };

    this.client = axios.create({
      baseURL: 'https://api.parasut.com',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // OAuth 2.0 token alımı
  async getAccessToken(): Promise<string> {
    // Token hala geçerliyse yeniden alma
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post<ParasutTokenResponse>(
        'https://api.parasut.com/oauth/token',
        {
          grant_type: 'password',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          username: this.config.username,
          password: this.config.password,
          redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Paraşüt token alınamadı:', error);
      throw new Error('Authentication failed with Paraşüt');
    }
  }

  // Authenticated request helper
  private async makeRequest(method: string, endpoint: string, data?: any) {
    const token = await this.getAccessToken();
    
    return this.client.request({
      method,
      url: endpoint,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Müşteri (contact) oluşturma
  async createContact(contactData: {
    name: string;
    email?: string;
    phone?: string;
    taxOffice?: string;
    taxNumber?: string;
    address?: string;
  }) {
    const response = await this.makeRequest('POST', `/v4/${this.config.companyId}/contacts`, {
      data: {
        type: 'contacts',
        attributes: {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          tax_office: contactData.taxOffice,
          tax_number: contactData.taxNumber,
          address: contactData.address,
          contact_type: 'person',
        },
      },
    });

    return response.data;
  }

  // Fatura oluşturma
  async createInvoice(invoiceData: {
    contactId: string;
    invoiceDate: string;
    dueDate: string;
    description: string;
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      vatRate?: number;
    }>;
    invoiceType?: 'sales_invoice' | 'e_archive';
  }) {
    const response = await this.makeRequest('POST', `/v4/${this.config.companyId}/sales_invoices`, {
      data: {
        type: 'sales_invoices',
        attributes: {
          item_type: invoiceData.invoiceType || 'sales_invoice',
          invoice_date: invoiceData.invoiceDate,
          due_date: invoiceData.dueDate,
          description: invoiceData.description,
          currency: 'TRY',
        },
        relationships: {
          contact: {
            data: {
              id: invoiceData.contactId,
              type: 'contacts',
            },
          },
          details: {
            data: invoiceData.items.map((item) => ({
              type: 'sales_invoice_details',
              attributes: {
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                vat_rate: item.vatRate || 18,
              },
            })),
          },
        },
      },
    });

    return response.data;
  }

  // Fatura durumu sorgulama
  async getInvoiceStatus(invoiceId: string) {
    const response = await this.makeRequest(
      'GET',
      `/v4/${this.config.companyId}/sales_invoices/${invoiceId}`
    );

    return response.data;
  }

  // e-Arşiv/e-Fatura gönderme
  async sendInvoice(invoiceId: string, email?: string) {
    const response = await this.makeRequest(
      'POST',
      `/v4/${this.config.companyId}/sales_invoices/${invoiceId}/e_document`,
      {
        data: {
          type: 'e_document',
          attributes: {
            scenario: 'basic',
            note: email ? `Email: ${email}` : undefined,
          },
        },
      }
    );

    return response.data;
  }

  // Ödeme kaydetme
  async recordPayment(paymentData: {
    invoiceId: string;
    amount: number;
    date: string;
    description?: string;
    accountId: string;
  }) {
    const response = await this.makeRequest('POST', `/v4/${this.config.companyId}/payments`, {
      data: {
        type: 'payments',
        attributes: {
          date: paymentData.date,
          amount: paymentData.amount,
          description: paymentData.description,
        },
        relationships: {
          payable: {
            data: {
              id: paymentData.invoiceId,
              type: 'sales_invoices',
            },
          },
          account: {
            data: {
              id: paymentData.accountId,
              type: 'accounts',
            },
          },
        },
      },
    });

    return response.data;
  }
}

export const parasutClient = new ParasutClient();
```

#### 1.3 Invoice Service
**Dosya:** `backend/src/services/invoice.service.ts`

```typescript
import { parasutClient } from '../config/parasut';
import { prisma } from '../config/database';

interface CreateInvoiceParams {
  orderId: number;
  customerId: number;
  items: Array<{
    equipmentId: number;
    description: string;
    quantity: number;
    unitPrice: number;
    days: number;
  }>;
  startDate: Date;
  endDate: Date;
}

export class InvoiceService {
  // Kiralama için fatura oluşturma
  async createRentalInvoice(params: CreateInvoiceParams) {
    const { orderId, customerId, items, startDate, endDate } = params;

    // Müşteri bilgilerini al
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Paraşüt'te müşteri var mı kontrol et veya oluştur
    let parasutContact;
    if (customer.parasutContactId) {
      // Var olan contact'ı kullan
      parasutContact = { id: customer.parasutContactId };
    } else {
      // Yeni contact oluştur
      parasutContact = await parasutClient.createContact({
        name: customer.fullName || customer.email,
        email: customer.email,
        phone: customer.phone,
        taxOffice: customer.taxOffice,
        taxNumber: customer.taxNumber,
        address: customer.address,
      });

      // Contact ID'yi kaydet
      await prisma.user.update({
        where: { id: customerId },
        data: { parasutContactId: parasutContact.data.id },
      });
    }

    // Fatura kalemlerini hazırla
    const invoiceItems = items.map((item) => ({
      name: `${item.description} Kiralama (${item.days} gün)`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatRate: 18, // KDV oranı
    }));

    // Fatura oluştur
    const invoice = await parasutClient.createInvoice({
      contactId: parasutContact.data?.id || parasutContact.id,
      invoiceDate: startDate.toISOString().split('T')[0],
      dueDate: endDate.toISOString().split('T')[0],
      description: `Kiralama Faturası - Sipariş #${orderId}`,
      items: invoiceItems,
      invoiceType: customer.taxNumber ? 'sales_invoice' : 'e_archive',
    });

    // Veritabanına kaydet
    const dbInvoice = await prisma.invoice.create({
      data: {
        orderId,
        customerId,
        parasutInvoiceId: invoice.data.id,
        invoiceNumber: invoice.data.attributes.invoice_no,
        invoiceDate: new Date(invoice.data.attributes.invoice_date),
        dueDate: new Date(invoice.data.attributes.due_date),
        totalAmount: invoice.data.attributes.net_total,
        vatAmount: invoice.data.attributes.total_vat,
        grandTotal: invoice.data.attributes.gross_total,
        status: 'draft',
        type: invoice.data.attributes.item_type,
      },
    });

    // e-Fatura/e-Arşiv gönder
    await parasutClient.sendInvoice(invoice.data.id, customer.email);

    // Durumu güncelle
    await prisma.invoice.update({
      where: { id: dbInvoice.id },
      data: { status: 'sent' },
    });

    return dbInvoice;
  }

  // Ödeme kaydı
  async recordPayment(invoiceId: number, paymentData: {
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    transactionId?: string;
  }) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || !invoice.parasutInvoiceId) {
      throw new Error('Invoice not found');
    }

    // Paraşüt'te ödeme kaydet (varsayılan hesap ID'si kullanılmalı)
    const parasutPayment = await parasutClient.recordPayment({
      invoiceId: invoice.parasutInvoiceId,
      amount: paymentData.amount,
      date: paymentData.paymentDate.toISOString().split('T')[0],
      description: `${paymentData.paymentMethod} ile ödeme`,
      accountId: process.env.PARASUT_DEFAULT_ACCOUNT_ID || '',
    });

    // Veritabanına kaydet
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: paymentData.amount,
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        parasutPaymentId: parasutPayment.data.id,
      },
    });

    // Fatura durumunu güncelle
    const totalPaid = await prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true },
    });

    const isPaid = (totalPaid._sum.amount || 0) >= invoice.grandTotal;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { 
        status: isPaid ? 'paid' : 'partial_paid',
        paidAmount: totalPaid._sum.amount || 0,
      },
    });

    return payment;
  }

  // Gecikme cezası faturası
  async createLateFeeInvoice(orderId: number, lateDays: number, dailyFee: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const totalFee = lateDays * dailyFee;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 gün ödeme vadesi

    const invoice = await parasutClient.createInvoice({
      contactId: order.customer.parasutContactId!,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Gecikme Cezası - Sipariş #${orderId}`,
      items: [
        {
          name: `Gecikme Ücreti (${lateDays} gün)`,
          quantity: 1,
          unitPrice: totalFee,
          vatRate: 18,
        },
      ],
      invoiceType: 'e_archive',
    });

    const dbInvoice = await prisma.invoice.create({
      data: {
        orderId,
        customerId: order.customerId,
        parasutInvoiceId: invoice.data.id,
        invoiceNumber: invoice.data.attributes.invoice_no,
        invoiceDate: new Date(invoice.data.attributes.invoice_date),
        dueDate: new Date(invoice.data.attributes.due_date),
        totalAmount: invoice.data.attributes.net_total,
        vatAmount: invoice.data.attributes.total_vat,
        grandTotal: invoice.data.attributes.gross_total,
        status: 'sent',
        type: 'late_fee',
      },
    });

    await parasutClient.sendInvoice(invoice.data.id, order.customer.email);

    return dbInvoice;
  }
}

export const invoiceService = new InvoiceService();
```

#### 1.4 Environment Variables
`.env` dosyasına ekle:

```env
# Paraşüt API Configuration
PARASUT_CLIENT_ID=your_client_id
PARASUT_CLIENT_SECRET=your_client_secret
PARASUT_USERNAME=your_username
PARASUT_PASSWORD=your_password
PARASUT_COMPANY_ID=your_company_id
PARASUT_DEFAULT_ACCOUNT_ID=your_default_bank_account_id
```

#### 1.5 Database Schema Updates
**Dosya:** `backend/prisma/schema.prisma`

```prisma
model Invoice {
  id                Int       @id @default(autoincrement())
  orderId           Int
  customerId        Int
  parasutInvoiceId  String?   @unique
  invoiceNumber     String?
  invoiceDate       DateTime
  dueDate           DateTime
  totalAmount       Float
  vatAmount         Float
  grandTotal        Float
  paidAmount        Float     @default(0)
  status            String    @default("draft") // draft, sent, paid, partial_paid, cancelled
  type              String    @default("rental") // rental, late_fee, deposit_refund
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  order             Order     @relation(fields: [orderId], references: [id])
  customer          User      @relation(fields: [customerId], references: [id])
  payments          Payment[]
  
  @@index([orderId])
  @@index([customerId])
  @@index([status])
}

model Payment {
  id               Int       @id @default(autoincrement())
  invoiceId        Int
  amount           Float
  paymentDate      DateTime
  paymentMethod    String    // credit_card, bank_transfer, cash, etc.
  transactionId    String?
  parasutPaymentId String?   @unique
  
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  invoice          Invoice   @relation(fields: [invoiceId], references: [id])
  
  @@index([invoiceId])
}

model User {
  // ... existing fields ...
  parasutContactId String?   @unique
  taxOffice        String?
  taxNumber        String?
  fullName         String?
  phone            String?
  address          String?
  
  invoices         Invoice[]
}
```

#### 1.6 Migration
```bash
cd backend
npx prisma migrate dev --name add_invoice_payment_models
npx prisma generate
```

---

## 💳 Faz 2: Ödeme Gateway Entegrasyonu (Priority: 🔥 HIGH)

### Önerilen Sağlayıcı: **iyzico**
**Neden iyzico?**
- Türkiye'nin en yaygın ödeme altyapısı
- 3D Secure zorunlu desteği
- Taksit seçenekleri (kiralama için kritik)
- Webhook desteği
- %1.75 + 0.25 TL komisyon
- Kolay API entegrasyonu

**Alternatif:** PayTR (KOBİ'ler için uygun)

### Entegrasyon Adımları

#### 2.1 iyzico Setup
```bash
npm install iyzipay
```

#### 2.2 Configuration
**Dosya:** `backend/src/config/iyzico.ts`

```typescript
import Iyzipay from 'iyzipay';

const iyzico = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || '',
  secretKey: process.env.IYZICO_SECRET_KEY || '',
  uri: process.env.NODE_ENV === 'production' 
    ? 'https://api.iyzipay.com' 
    : 'https://sandbox-api.iyzipay.com',
});

export default iyzico;
```

#### 2.3 Payment Service
**Dosya:** `backend/src/services/payment.service.ts`

```typescript
import iyzico from '../config/iyzico';
import { prisma } from '../config/database';
import { invoiceService } from './invoice.service';

interface CreatePaymentParams {
  orderId: number;
  amount: number;
  installment?: number;
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  customerId: number;
}

export class PaymentService {
  // 3D Secure ödeme başlatma
  async initiate3DSecurePayment(params: CreatePaymentParams) {
    const { orderId, amount, installment = 1, customerId } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, equipment: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `order-${orderId}-${Date.now()}`,
      price: amount.toFixed(2),
      paidPrice: amount.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      installment: installment,
      basketId: `basket-${orderId}`,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      
      paymentCard: {
        cardHolderName: params.cardHolderName,
        cardNumber: params.cardNumber,
        expireMonth: params.expireMonth,
        expireYear: params.expireYear,
        cvc: params.cvc,
        registerCard: 0,
      },
      
      buyer: {
        id: `customer-${order.customer.id}`,
        name: order.customer.fullName?.split(' ')[0] || 'Ad',
        surname: order.customer.fullName?.split(' ')[1] || 'Soyad',
        email: order.customer.email,
        identityNumber: order.customer.taxNumber || '11111111111',
        registrationAddress: order.customer.address || 'Adres bilgisi yok',
        city: 'İstanbul',
        country: 'Turkey',
        ip: order.customer.lastLoginIp || '85.34.78.112',
      },
      
      shippingAddress: {
        contactName: order.customer.fullName || 'Müşteri',
        city: 'İstanbul',
        country: 'Turkey',
        address: order.customer.address || 'Adres bilgisi yok',
      },
      
      billingAddress: {
        contactName: order.customer.fullName || 'Müşteri',
        city: 'İstanbul',
        country: 'Turkey',
        address: order.customer.address || 'Adres bilgisi yok',
      },
      
      basketItems: [
        {
          id: `item-${order.equipment.id}`,
          name: order.equipment.name,
          category1: order.equipment.category,
          itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
          price: amount.toFixed(2),
        },
      ],
      
      callbackUrl: `${process.env.BACKEND_URL}/api/payment/callback`,
    };

    return new Promise((resolve, reject) => {
      iyzico.threedsInitialize.create(request, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  // 3D Secure callback işleme
  async handle3DSecureCallback(conversationData: string, paymentId: string) {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationData,
      paymentId: paymentId,
    };

    return new Promise((resolve, reject) => {
      iyzico.threedsPayment.create(request, async (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          // Ödeme başarılı ise fatura oluştur ve kaydet
          if (result.status === 'success') {
            const orderId = parseInt(conversationData.split('-')[1]);
            
            // Fatura oluştur
            const invoice = await prisma.invoice.findFirst({
              where: { orderId },
            });

            if (invoice) {
              // Ödeme kaydı oluştur
              await invoiceService.recordPayment(invoice.id, {
                amount: parseFloat(result.paidPrice),
                paymentDate: new Date(),
                paymentMethod: 'credit_card',
                transactionId: result.paymentId,
              });
            }

            // Sipariş durumunu güncelle
            await prisma.order.update({
              where: { id: orderId },
              data: { status: 'paid' },
            });
          }
          
          resolve(result);
        }
      });
    });
  }

  // Depozito iadesi
  async refundDeposit(orderId: number, amount: number, reason: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // İlk ödemenin transaction ID'sini al
    const originalPayment = order.payments[0];
    if (!originalPayment?.transactionId) {
      throw new Error('Original payment not found');
    }

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `refund-${orderId}-${Date.now()}`,
      paymentTransactionId: originalPayment.transactionId,
      price: amount.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      ip: '85.34.78.112',
    };

    return new Promise((resolve, reject) => {
      iyzico.refund.create(request, async (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          // İade kaydı oluştur
          await prisma.refund.create({
            data: {
              orderId,
              amount,
              reason,
              transactionId: result.paymentTransactionId,
              status: result.status,
            },
          });
          
          resolve(result);
        }
      });
    });
  }
}

export const paymentService = new PaymentService();
```

#### 2.4 Payment Routes
**Dosya:** `backend/src/routes/payment.ts`

```typescript
import express from 'express';
import { paymentService } from '../services/payment.service';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 3D Secure ödeme başlat
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const result = await paymentService.initiate3DSecurePayment(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// 3D Secure callback
router.post('/callback', async (req, res) => {
  try {
    const { conversationData, paymentId } = req.body;
    const result = await paymentService.handle3DSecureCallback(
      conversationData,
      paymentId
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Payment callback failed' });
  }
});

// İade işlemi
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;
    const result = await paymentService.refundDeposit(orderId, amount, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Refund failed' });
  }
});

export default router;
```

#### 2.5 Environment Variables
```env
# iyzico Configuration
IYZICO_API_KEY=your_api_key
IYZICO_SECRET_KEY=your_secret_key
BACKEND_URL=https://your-backend-url.com
```

---

## 📊 Faz 3: Finansal Raporlama (Priority: HIGH)

### Özellikler:
- Gelir-gider raporu
- Tahsilat analizi
- Ekipman karlılık raporu
- Müşteri bazlı analiz
- Vergi raporları
- Excel/PDF export

### Implementation
**Dosya:** `backend/src/services/report.service.ts`

```typescript
import { prisma } from '../config/database';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export class ReportService {
  // Gelir-gider raporu
  async getIncomeExpenseReport(startDate: Date, endDate: Date) {
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['paid', 'partial_paid'] },
      },
      include: {
        payments: true,
      },
    });

    const totalIncome = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalExpenses = 0; // Gider hesaplaması yapılacak

    return {
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      invoiceCount: invoices.length,
      averageInvoiceAmount: totalIncome / invoices.length,
    };
  }

  // Excel rapor oluşturma
  async generateExcelReport(data: any, filename: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rapor');

    // Başlıklar
    worksheet.columns = [
      { header: 'Fatura No', key: 'invoiceNumber', width: 15 },
      { header: 'Tarih', key: 'date', width: 12 },
      { header: 'Müşteri', key: 'customer', width: 25 },
      { header: 'Tutar', key: 'amount', width: 12 },
      { header: 'Durum', key: 'status', width: 12 },
    ];

    // Veriler
    data.forEach((row: any) => {
      worksheet.addRow(row);
    });

    // Stil
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Dosyaya yaz
    await workbook.xlsx.writeFile(filename);
    return filename;
  }
}

export const reportService = new ReportService();
```

---

## 🔄 Faz 4: Banka Entegrasyonu (Priority: MEDIUM)

### Önerilen Bankalar:
1. **İş Bankası** - En gelişmiş API
2. **Garanti BBVA** - Geniş dokümantasyon
3. **Akbank** - KOBİ dostu

### Use Cases:
- Otomatik havale talimatı
- Tahsilat kontrolü
- Hesap hareketleri senkronizasyonu
- Ödeme mutabakatı

**Not:** Banka API'leri kurumsal müşteriler için açılıyor, başvuru süreci gerekli.

---

## 💰 Maliyet Analizi

| Hizmet | Sağlayıcı | Aylık Maliyet | İşlem Başı |
|--------|-----------|---------------|------------|
| e-Belge | Paraşüt | 150-300 TL | - |
| Ödeme Gateway | iyzico | 0 TL | %1.75 + 0.25 TL |
| Banka API | İş Bankası | Değişken | - |
| SMS/Email | Twilio | ~500 TL | $0.05/SMS |
| **TOPLAM** | - | **~1,000-1,500 TL/ay** | **~%2 işlem ücreti** |

---

## ⏱️ Implementasyon Takvimi

| Faz | Süre | Çalışma Saati |
|-----|------|---------------|
| Faz 1: e-Belge | 4-6 saat | 1 gün |
| Faz 2: Ödeme Gateway | 3-4 saat | 1 gün |
| Faz 3: Raporlama | 3-4 saat | 1 gün |
| Faz 4: Banka API | 6-8 saat | 2 gün |
| **Test & Debug** | 4-6 saat | 1 gün |
| **TOPLAM** | **20-28 saat** | **5-6 gün** |

---

## ✅ Checklist

### Hazırlık
- [ ] Paraşüt hesabı aç ve API credentials al
- [ ] iyzico merchant başvurusu yap
- [ ] Test ortamı credentials al
- [ ] Database schema güncelle
- [ ] Environment variables ekle

### Development
- [ ] Paraşüt client oluştur
- [ ] Invoice service implement et
- [ ] iyzico payment service implement et
- [ ] Payment routes ekle
- [ ] Webhook handlers ekle
- [ ] Error handling ekle

### Testing
- [ ] Unit tests yaz
- [ ] Integration tests yaz
- [ ] Sandbox ortamda test et
- [ ] 3D Secure flow test et
- [ ] İade/iptal senaryolarını test et

### Production
- [ ] Production credentials ekle
- [ ] Rate limiting ekle
- [ ] Logging ekle (Winston)
- [ ] Monitoring ekle (Sentry)
- [ ] Backup stratejisi belirle
- [ ] Dokümantasyon tamamla

---

## 🔐 Güvenlik Önlemleri

1. **PCI DSS Compliance**
   - Kart bilgilerini asla saklamayın
   - iyzico tokenization kullanın

2. **API Security**
   - API keys'i environment variables'da tutun
   - Rate limiting uygulayın
   - HTTPS zorunlu

3. **Data Protection**
   - Finansal verileri şifreleyin
   - KVKK uyumluluğunu sağlayın
   - Audit log tutun

4. **Fraud Prevention**
   - Şüpheli işlemleri flagle
   - IP tracking yapın
   - Velocity checks uygulayın

---

## 📚 Ek Kaynaklar

- [Paraşüt API Docs](https://api.parasut.com.tr/)
- [iyzico API Docs](https://dev.iyzipay.com/tr/api)
- [İş Bankası API](https://developer.isbank.com.tr)
- [GİB e-Fatura Portal](https://portal.efatura.gov.tr)

---

## 🎯 Sonuç

Bu entegrasyon planı ile CANARY Rental Software:
- ✅ Yasal zorunlulukları karşılar (e-Fatura, e-Arşiv)
- ✅ Güvenli ödeme altyapısı kurar (3D Secure)
- ✅ Muhasebe süreçlerini otomatikleştirir
- ✅ Finansal raporlama sağlar
- ✅ Müşteri deneyimini iyileştirir

**Önerilen Başlangıç:** Faz 1 (e-Belge) + Faz 2 (Ödeme Gateway)  
**Toplam Süre:** 7-10 saat (2 gün)  
**Maliyet:** ~1,000-1,500 TL/ay + %2 işlem ücreti

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 13 Ekim 2025  
**Durum:** Ready for Implementation
