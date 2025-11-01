import { parasutClient, formatDate } from '../config/parasut';
import { prisma } from '../index';
import { log } from '../config/logger';

// Use the generated Prisma client types (avoid broad `as any` casts)
const p = prisma;

interface CreateInvoiceParams {
  orderId: number;
  customerId: number;
  items: Array<{
    equipmentId: number;
    description: string;
    quantity: number;
    unitPrice: number;
    days: number;
    discountPercentage?: number;
  }>;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

interface RecordPaymentParams {
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

/**
 * Invoice Service
 * Fatura yönetimi ve Paraşüt entegrasyonu
 */
export class InvoiceService {
  /**
   * Kiralama için fatura oluşturma
   * Paraşüt'te otomatik olarak e-Fatura veya e-Arşiv oluşturur
   */
  async createRentalInvoice(params: CreateInvoiceParams) {
    const { orderId, customerId, items, startDate, endDate, notes } = params;

    try {
      log.info('Invoice Service: Kiralama faturası oluşturuluyor...', { orderId });

      // Müşteri bilgilerini al
      const customer = await p.user.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Sipariş bilgilerini al (equipment relation is via orderItems -> equipment)
      const order = await p.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: { include: { equipment: true } },
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Paraşüt'te müşteri var mı kontrol et veya oluştur
      let parasutContactId = customer.parasutContactId;

      if (!parasutContactId) {
        log.info('Invoice Service: Müşteri Paraşüt\'te yok, oluşturuluyor...');
        
        const parasutContact = await parasutClient.createContact({
          name: customer.fullName || customer.email,
          email: customer.email,
          phone: customer.phone || undefined,
          taxOffice: customer.taxOffice || undefined,
          taxNumber: customer.taxNumber || undefined,
          address: customer.address || undefined,
          contactType: customer.taxNumber ? 'company' : 'person',
        });

        // Contact ID'yi veritabanına kaydet
        parasutContactId = parasutContact.id;
        await p.user.update({
          where: { id: customerId },
          data: { parasutContactId: parasutContact.id },
        });

        log.info('Invoice Service: Müşteri Paraşüt\'te oluşturuldu:', parasutContactId);
      }

      // Fatura kalemlerini hazırla
      const invoiceItems = items.map((item) => ({
        productName: `${item.description} (${item.days} gün kiralama)`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: 18, // KDV oranı - TODO: Configurable yapılabilir
        discountType: item.discountPercentage ? 'percentage' as const : undefined,
        discountValue: item.discountPercentage || 0,
      }));

      // Toplam tutarı hesapla
      const totalAmount = items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        const discount = item.discountPercentage 
          ? (itemTotal * item.discountPercentage) / 100 
          : 0;
        return sum + (itemTotal - discount);
      }, 0);

      const vatAmount = (totalAmount * 18) / 100;
      const grandTotal = totalAmount + vatAmount;

      // Fatura tipini belirle (Vergi numarası varsa e-Fatura, yoksa e-Arşiv)
      const invoiceType = customer.taxNumber ? 'sales_invoice' : 'e_archive';

      log.info('Invoice Service: Paraşüt\'te fatura oluşturuluyor...', {
        type: invoiceType,
        total: grandTotal,
      });

      // Paraşüt'te fatura oluştur
      const parasutInvoice = await parasutClient.createInvoice({
        contactId: parasutContactId,
        invoiceDate: formatDate(startDate),
        dueDate: formatDate(endDate),
        description: notes || `Kiralama Faturası - Sipariş #${orderId}`,
        items: invoiceItems,
        invoiceType,
        currency: 'TRY',
      });

      // Veritabanına kaydet
      const dbInvoice = await p.invoice.create({
        data: {
          orderId,
          customerId,
          parasutInvoiceId: parasutInvoice.id,
          invoiceNumber: parasutInvoice.attributes.invoice_no,
          invoiceDate: new Date(parasutInvoice.attributes.invoice_date),
          dueDate: new Date(parasutInvoice.attributes.due_date),
          totalAmount: parseFloat(parasutInvoice.attributes.net_total),
          vatAmount: parseFloat(parasutInvoice.attributes.total_vat),
          grandTotal: parseFloat(parasutInvoice.attributes.gross_total),
          paidAmount: 0,
          status: 'draft',
          type: 'rental',
        },
      });

      log.info('Invoice Service: Fatura veritabanına kaydedildi:', dbInvoice.id);

      // e-Fatura/e-Arşiv gönder
      try {
        await parasutClient.sendInvoice(parasutInvoice.id, customer.email);
        
        // Durumu güncelle
        await p.invoice.update({
          where: { id: dbInvoice.id },
          data: { status: 'sent' },
        });

        log.info('Invoice Service: e-Fatura/e-Arşiv başarıyla gönderildi');
      } catch (sendError) {
        log.error('Invoice Service: e-Fatura/e-Arşiv gönderilemedi:', sendError);
        // Fatura oluşturuldu ama gönderilemedi, hata logla ama devam et
      }

      return dbInvoice;
    } catch (error) {
      log.error('Invoice Service: Fatura oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Ödeme Kaydı
   * Hem Paraşüt'e hem de veritabanına ödeme kaydeder
   */
  async recordPayment(invoiceId: number, paymentData: RecordPaymentParams) {
    try {
      log.info('Invoice Service: Ödeme kaydediliyor...', { invoiceId });

      const invoice = await p.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice || !invoice.parasutInvoiceId) {
        throw new Error('Invoice not found');
      }

      // Paraşüt'te ödeme kaydet
      const parasutPayment = await parasutClient.recordPayment({
        invoiceId: invoice.parasutInvoiceId,
        amount: paymentData.amount,
        date: formatDate(paymentData.paymentDate),
        description: `${paymentData.paymentMethod} ile ödeme${paymentData.notes ? ` - ${paymentData.notes}` : ''}`,
      });

      // Veritabanına kaydet
      const payment = await p.payment.create({
        data: {
          invoiceId,
          amount: paymentData.amount,
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMethod,
          transactionId: paymentData.transactionId,
          parasutPaymentId: parasutPayment.id,
        },
      });

      // Fatura durumunu güncelle
      const totalPaid = await p.payment.aggregate({
        where: { invoiceId },
        _sum: { amount: true },
      });

      const paidAmount = totalPaid._sum.amount || 0;
      const isPaid = paidAmount >= invoice.grandTotal;

      await p.invoice.update({
        where: { id: invoiceId },
        data: {
          status: isPaid ? 'paid' : 'partial_paid',
          paidAmount,
        },
      });

      log.info('Invoice Service: Ödeme başarıyla kaydedildi', {
        paymentId: payment.id,
        totalPaid: paidAmount,
        status: isPaid ? 'paid' : 'partial_paid',
      });

      return payment;
    } catch (error) {
      log.error('Invoice Service: Ödeme kaydedilemedi:', error);
      throw error;
    }
  }

  /**
   * Gecikme Cezası Faturası Oluşturma
   * Kiralama süresi geçmiş siparişler için gecikme cezası keser
   */
  async createLateFeeInvoice(
    orderId: number,
    lateDays: number,
    dailyFee: number,
    notes?: string
  ) {
    try {
      log.info('Invoice Service: Gecikme cezası faturası oluşturuluyor...', {
        orderId,
        lateDays,
        dailyFee,
      });

      const order = await p.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          orderItems: { include: { equipment: true } },
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const parasutContactIdFromCustomer = (order as any).customer?.parasutContactId
        ?? (await p.user.findUnique({ where: { id: order.customerId } }))?.parasutContactId;

      if (!parasutContactIdFromCustomer) {
        throw new Error('Customer not found in Paraşüt');
      }

      const totalFee = lateDays * dailyFee;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 gün ödeme vadesi

      const description = notes || `Gecikme Cezası - Sipariş #${orderId} (${lateDays} gün gecikme)`;

      // Paraşüt'te fatura oluştur
      const parasutInvoice = await parasutClient.createInvoice({
  contactId: parasutContactIdFromCustomer,
        invoiceDate: formatDate(new Date()),
        dueDate: formatDate(dueDate),
        description,
        items: [
          {
            productName: `${order.orderItems?.[0]?.equipment?.name || 'Ekipman'} - Gecikme Ücreti`,
            quantity: lateDays,
            unitPrice: dailyFee,
            vatRate: 18,
          },
        ],
        invoiceType: 'e_archive',
        currency: 'TRY',
      });

      // Veritabanına kaydet
      const dbInvoice = await p.invoice.create({
        data: {
          orderId,
          customerId: order.customerId,
          parasutInvoiceId: parasutInvoice.id,
          invoiceNumber: parasutInvoice.attributes.invoice_no,
          invoiceDate: new Date(parasutInvoice.attributes.invoice_date),
          dueDate: new Date(parasutInvoice.attributes.due_date),
          totalAmount: parseFloat(parasutInvoice.attributes.net_total),
          vatAmount: parseFloat(parasutInvoice.attributes.total_vat),
          grandTotal: parseFloat(parasutInvoice.attributes.gross_total),
          paidAmount: 0,
          status: 'sent',
          type: 'late_fee',
        },
      });

      // e-Arşiv gönder
  await parasutClient.sendInvoice(parasutInvoice.id, order.customer.email);

      log.info('Invoice Service: Gecikme cezası faturası oluşturuldu:', dbInvoice.id);

      return dbInvoice;
    } catch (error) {
      log.error('Invoice Service: Gecikme cezası faturası oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Depozito İade Faturası
   * Ekipman hasarsız teslim edildiğinde depozito iadesi için negatif fatura
   */
  async createDepositRefundInvoice(
    orderId: number,
    depositAmount: number,
    notes?: string
  ) {
    try {
      log.info('Invoice Service: Depozito iade faturası oluşturuluyor...', {
        orderId,
        depositAmount,
      });

  const order = await p.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          orderItems: { include: { equipment: true } },
        },
      }) as any;

      if (!order) {
        throw new Error('Order not found');
      }

      const parasutContactIdForDeposit = (order as any).customer?.parasutContactId
        ?? (await p.user.findUnique({ where: { id: order.customerId } }))?.parasutContactId;

      if (!parasutContactIdForDeposit) {
        throw new Error('Customer not found in Paraşüt');
      }

      const description = notes || `Depozito İadesi - Sipariş #${orderId}`;

      // Paraşüt'te fatura oluştur (negatif tutar için)
      const parasutInvoice = await parasutClient.createInvoice({
  contactId: parasutContactIdForDeposit,
        invoiceDate: formatDate(new Date()),
        dueDate: formatDate(new Date()),
        description,
        items: [
          {
            productName: `${order.orderItems?.[0]?.equipment?.name || 'Ekipman'} - Depozito İadesi`,
            quantity: 1,
            unitPrice: -depositAmount, // Negatif tutar
            vatRate: 0, // Depozito iadesi KDV'siz
          },
        ],
        invoiceType: 'e_archive',
        currency: 'TRY',
      });

      // Veritabanına kaydet
      const dbInvoice = await p.invoice.create({
        data: {
          orderId,
          customerId: order.customerId,
          parasutInvoiceId: parasutInvoice.id,
          invoiceNumber: parasutInvoice.attributes.invoice_no,
          invoiceDate: new Date(parasutInvoice.attributes.invoice_date),
          dueDate: new Date(parasutInvoice.attributes.due_date),
          totalAmount: parseFloat(parasutInvoice.attributes.net_total),
          vatAmount: parseFloat(parasutInvoice.attributes.total_vat),
          grandTotal: parseFloat(parasutInvoice.attributes.gross_total),
          paidAmount: parseFloat(parasutInvoice.attributes.gross_total), // İade olduğu için otomatik "paid"
          status: 'paid',
          type: 'deposit_refund',
        },
      });

      await parasutClient.sendInvoice(parasutInvoice.id, order.customer.email);

      log.info('Invoice Service: Depozito iade faturası oluşturuldu:', dbInvoice.id);

      return dbInvoice;
    } catch (error) {
      log.error('Invoice Service: Depozito iade faturası oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Fatura Detaylarını Getir
   */
  async getInvoiceDetails(invoiceId: number) {
    try {
      const invoice = await p.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          order: {
            include: {
              orderItems: { include: { equipment: true } },
            },
          },
          customer: true,
          payments: true,
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Paraşüt'ten güncel durumu al
      if (invoice.parasutInvoiceId) {
        try {
          const parasutInvoice = await parasutClient.getInvoice(invoice.parasutInvoiceId);
          
          // Durum farklıysa güncelle
          const parasutStatus = parasutInvoice.attributes.payment_status;
            if (parasutStatus && parasutStatus !== invoice.status) {
            await p.invoice.update({
              where: { id: invoiceId },
              data: { status: parasutStatus },
            });
            invoice.status = parasutStatus;
          }
        } catch (error) {
          log.warn('Invoice Service: Paraşüt\'ten fatura durumu alınamadı:', error);
        }
      }

      return invoice;
    } catch (error) {
      log.error('Invoice Service: Fatura detayları alınamadı:', error);
      throw error;
    }
  }

  /**
   * Müşterinin Tüm Faturalarını Listele
   */
  async getCustomerInvoices(customerId: number, filters?: {
    status?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const where: any = { customerId };

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.type) {
        where.type = filters.type;
      }

      if (filters?.startDate || filters?.endDate) {
        where.invoiceDate = {};
        if (filters.startDate) {
          where.invoiceDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.invoiceDate.lte = filters.endDate;
        }
      }

  const invoices = await p.invoice.findMany({
        where,
        include: {
          order: {
            include: {
              orderItems: { include: { equipment: true } },
            },
          },
          payments: true,
        },
        orderBy: {
          invoiceDate: 'desc',
        },
      });

      return invoices;
    } catch (error) {
      log.error('Invoice Service: Müşteri faturaları alınamadı:', error);
      throw error;
    }
  }

  /**
   * Fatura İptal Etme
   */
  async cancelInvoice(invoiceId: number, reason: string) {
    try {
      log.info('Invoice Service: Fatura iptal ediliyor...', { invoiceId, reason });

  const invoice = await p.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === 'paid') {
        throw new Error('Paid invoices cannot be cancelled');
      }

      // Veritabanında iptal et
  await p.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'cancelled',
        },
      });

      // TODO: Paraşüt'te iptal işlemi gerekiyorsa eklenecek

      log.info('Invoice Service: Fatura iptal edildi');

      return { success: true, message: 'Invoice cancelled successfully' };
    } catch (error) {
      log.error('Invoice Service: Fatura iptal edilemedi:', error);
      throw error;
    }
  }

  /**
   * Ödeme Planı Oluşturma (Taksitli Ödemeler için)
   */
  async createPaymentPlan(
    orderId: number,
    totalAmount: number,
    installments: number,
    startDate: Date
  ) {
    try {
      log.info('Invoice Service: Ödeme planı oluşturuluyor...', {
        orderId,
        installments,
      });

      const installmentAmount = totalAmount / installments;
      const plan = [];

      for (let i = 0; i < installments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        plan.push({
          installmentNumber: i + 1,
          amount: installmentAmount,
          dueDate: dueDate,
          status: 'pending',
        });
      }

      // TODO: Ödeme planını veritabanına kaydet

      log.info('Invoice Service: Ödeme planı oluşturuldu');

      return plan;
    } catch (error) {
      log.error('Invoice Service: Ödeme planı oluşturulamadı:', error);
      throw error;
    }
  }
}

export const invoiceService = new InvoiceService();
