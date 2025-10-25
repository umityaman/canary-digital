import { prisma } from '../index';
import { log } from '../config/logger';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

/**
 * Accounting Service
 * Muhasebe istatistikleri ve raporlama servisi
 */
export class AccountingService {
  /**
   * Dashboard Quick Stats
   * Bu ay gelir, gider, kâr, tahsilat hesaplar
   */
  async getDashboardStats(startDate?: Date, endDate?: Date) {
    try {
      // Eğer tarih belirtilmemişse bu ayın başı-sonu
      const start = startDate || startOfMonth(new Date());
      const end = endDate || endOfMonth(new Date());

      log.info('Accounting Service: Dashboard stats hesaplanıyor...', {
        startDate: start,
        endDate: end,
      });

      // Debug: Check prisma object
      log.info('Prisma object check:', {
        hasPrisma: !!prisma,
        prismaKeys: prisma ? Object.keys(prisma).slice(0, 10) : [],
        hasInvoice: prisma ? typeof prisma.invoice : 'undefined',
        hasPayment: prisma ? typeof prisma.payment : 'undefined',
      });

      // 1. BU AY GELİR - Ödenen faturalar toplamı
      const paidInvoices = await prisma.invoice.findMany({
        where: {
          invoiceDate: {
            gte: start,
            lte: end,
          },
          status: {
            in: ['paid', 'partial_paid'],
          },
        },
        select: {
          paidAmount: true,
          grandTotal: true,
          status: true,
        },
      });

      const totalRevenue = paidInvoices.reduce((sum, invoice) => {
        return sum + invoice.paidAmount;
      }, 0);

      // 2. BU AY TAHSİLAT - Ödeme kayıtları toplamı
      const payments = await prisma.payment.findMany({
        where: {
          paymentDate: {
            gte: start,
            lte: end,
          },
        },
        select: {
          amount: true,
        },
      });

      const totalCollections = payments.reduce((sum, payment) => {
        return sum + payment.amount;
      }, 0);

      // 3. BU AY GİDER - TODO: Expense model oluşturulduğunda güncellenecek
      // Şimdilik gecikme cezası ve depozito iadeleri dahil edilebilir
      const expenses = await prisma.invoice.findMany({
        where: {
          invoiceDate: {
            gte: start,
            lte: end,
          },
          type: {
            in: ['deposit_refund'], // Depozito iadesi gider sayılır
          },
        },
        select: {
          grandTotal: true,
        },
      });

      const totalExpenses = expenses.reduce((sum, expense) => {
        return sum + Math.abs(expense.grandTotal); // Negatif değerler olabilir
      }, 0);

      // 4. NET KÂR
      const netProfit = totalRevenue - totalExpenses;

      // 5. Bekleyen Tahsilatlar (vade geçmiş)
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          dueDate: {
            lt: new Date(),
          },
          status: {
            in: ['draft', 'sent', 'partial_paid'],
          },
        },
        select: {
          grandTotal: true,
          paidAmount: true,
        },
      });

      const totalOverdue = overdueInvoices.reduce((sum, invoice) => {
        return sum + (invoice.grandTotal - invoice.paidAmount);
      }, 0);

      // 6. Bu ay oluşturulan fatura sayısı
      const invoiceCount = await prisma.invoice.count({
        where: {
          invoiceDate: {
            gte: start,
            lte: end,
          },
        },
      });

      const stats = {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        totalCollections: Math.round(totalCollections * 100) / 100,
        totalOverdue: Math.round(totalOverdue * 100) / 100,
        invoiceCount,
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      };

      log.info('Accounting Service: Dashboard stats hesaplandı:', stats);

      return stats;
    } catch (error) {
      log.error('Accounting Service: Dashboard stats hesaplanamadı:', error);
      throw error;
    }
  }

  /**
   * Gelir-Gider Detaylı Analiz
   * Günlük/haftalık breakdown
   */
  async getIncomeExpenseAnalysis(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
    try {
      log.info('Accounting Service: Gelir-gider analizi yapılıyor...', {
        startDate,
        endDate,
        groupBy,
      });

      // Gelir verileri
      const invoices = await prisma.invoice.findMany({
        where: {
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            not: 'cancelled',
          },
        },
        select: {
          invoiceDate: true,
          paidAmount: true,
          type: true,
        },
        orderBy: {
          invoiceDate: 'asc',
        },
      });

      // TODO: Gider modeli oluşturulunca burası güncellenecek
      const analysis = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy,
        data: invoices.map(inv => ({
          date: inv.invoiceDate.toISOString(),
          income: inv.type === 'rental' ? inv.paidAmount : 0,
          expense: inv.type === 'deposit_refund' ? Math.abs(inv.paidAmount) : 0,
        })),
      };

      return analysis;
    } catch (error) {
      log.error('Accounting Service: Gelir-gider analizi başarısız:', error);
      throw error;
    }
  }

  /**
   * Cari Hesap Özeti
   * Müşteri bazlı alacak-borç listesi
   */
  async getCariAccountSummary() {
    try {
      log.info('Accounting Service: Cari hesap özeti hazırlanıyor...');

      const customers = await prisma.user.findMany({
        where: {
          role: 'customer',
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          invoices: {
            select: {
              grandTotal: true,
              paidAmount: true,
              status: true,
              dueDate: true,
            },
          },
        },
      });

      const cariSummary = customers.map(customer => {
        const totalDebt = customer.invoices.reduce((sum, inv) => {
          return sum + (inv.grandTotal - inv.paidAmount);
        }, 0);

        const overdueDebt = customer.invoices
          .filter(inv => inv.dueDate < new Date() && inv.status !== 'paid')
          .reduce((sum, inv) => {
            return sum + (inv.grandTotal - inv.paidAmount);
          }, 0);

        return {
          customerId: customer.id,
          customerName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          totalDebt: Math.round(totalDebt * 100) / 100,
          overdueDebt: Math.round(overdueDebt * 100) / 100,
          invoiceCount: customer.invoices.length,
        };
      }).filter(c => c.totalDebt > 0); // Sadece borcu olanları göster

      log.info('Accounting Service: Cari hesap özeti hazırlandı');

      return cariSummary;
    } catch (error) {
      log.error('Accounting Service: Cari hesap özeti hazırlanamadı:', error);
      throw error;
    }
  }

  /**
   * Nakit Yönetimi Özeti
   * Kasa ve banka bakiyeleri (TODO: Cash model gerekli)
   */
  async getCashManagementSummary() {
    try {
      log.info('Accounting Service: Nakit yönetimi özeti hazırlanıyor...');

      // Bu ay tahsilat ve ödemeleri hesapla
      const thisMonth = {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      };

      const collections = await prisma.payment.findMany({
        where: {
          paymentDate: {
            gte: thisMonth.start,
            lte: thisMonth.end,
          },
        },
        select: {
          amount: true,
          paymentMethod: true,
        },
      });

      // Ödeme yöntemine göre grupla
      const byMethod = collections.reduce((acc, payment) => {
        const method = payment.paymentMethod || 'other';
        if (!acc[method]) {
          acc[method] = 0;
        }
        acc[method] += payment.amount;
        return acc;
      }, {} as Record<string, number>);

      const summary = {
        totalCash: Math.round((byMethod['cash'] || 0) * 100) / 100,
        totalBank: Math.round((byMethod['bank_transfer'] || 0) * 100) / 100,
        totalCreditCard: Math.round((byMethod['credit_card'] || 0) * 100) / 100,
        totalOther: Math.round((byMethod['other'] || 0) * 100) / 100,
        thisMonthCollections: Math.round(collections.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
        // TODO: Gerçek kasa/banka bakiyeleri için Cash model gerekli
        message: 'Cash model oluşturulunca gerçek bakiyeler gösterilecek',
      };

      log.info('Accounting Service: Nakit yönetimi özeti hazırlandı');

      return summary;
    } catch (error) {
      log.error('Accounting Service: Nakit yönetimi özeti hazırlanamadı:', error);
      throw error;
    }
  }

  /**
   * KDV Raporu
   * Dönemsel KDV hesaplaması
   */
  async getVATReport(startDate: Date, endDate: Date) {
    try {
      log.info('Accounting Service: KDV raporu hazırlanıyor...', {
        startDate,
        endDate,
      });

      const invoices = await prisma.invoice.findMany({
        where: {
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            not: 'cancelled',
          },
        },
        select: {
          invoiceNumber: true,
          invoiceDate: true,
          totalAmount: true,
          vatAmount: true,
          grandTotal: true,
          type: true,
          customer: {
            select: {
              fullName: true,
              taxNumber: true,
            },
          },
        },
        orderBy: {
          invoiceDate: 'asc',
        },
      });

      const totalVAT = invoices.reduce((sum, inv) => sum + inv.vatAmount, 0);
      const totalBase = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

      const report = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        summary: {
          totalBase: Math.round(totalBase * 100) / 100,
          totalVAT: Math.round(totalVAT * 100) / 100,
          invoiceCount: invoices.length,
        },
        invoices: invoices.map(inv => ({
          invoiceNumber: inv.invoiceNumber,
          date: inv.invoiceDate.toISOString(),
          customer: inv.customer.fullName,
          taxNumber: inv.customer.taxNumber,
          base: inv.totalAmount,
          vat: inv.vatAmount,
          total: inv.grandTotal,
          type: inv.type,
        })),
      };

      log.info('Accounting Service: KDV raporu hazırlandı');

      return report;
    } catch (error) {
      log.error('Accounting Service: KDV raporu hazırlanamadı:', error);
      throw error;
    }
  }
}

export const accountingService = new AccountingService();
