import { prisma } from '../index';
import { log } from '../config/logger';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

/**
 * Delivery Note interface (temporary until Prisma model is added)
 */
interface DeliveryNote {
  id: number;
  companyId: number;
  orderId: number;
  customerId: number;
  deliveryNoteNumber: string;
  deliveryDate: Date;
  type: string; // 'inbound' | 'outbound'
  status: string; // 'draft' | 'confirmed' | 'cancelled'
  waybillNumber?: string;
  vehicleInfo?: any;
  notes?: string;
  items: any[];
  linkedInvoiceId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for delivery notes (temporary until DB model is added)
const deliveryNotesStore: Map<number, DeliveryNote> = new Map();
let deliveryNoteIdCounter = 1;

/**
 * Stock Movement interface (temporary until Prisma model is added)
 */
interface StockMovement {
  id: number;
  companyId: number;
  equipmentId: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  balanceAfter: number;
  notes?: string;
  userId?: number;
  orderId?: number;
  date: Date;
  createdAt: Date;
}

// In-memory storage for stock movements (temporary until DB model is added)
const stockMovementsStore: Map<number, StockMovement> = new Map();
let stockMovementIdCounter = 1;

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
          name: true,
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
          customerName: customer.name,
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
   * Dashboard 6-Month Trends
   * Last N months income/expense trends
   */
  async getDashboardTrends(companyId: number, months: number = 6) {
    try {
      log.info('Accounting Service: Dashboard trends hesaplanıyor...', { months });

      const trends = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        // Income from paid invoices
        const monthlyIncome = await prisma.invoice.aggregate({
          where: {
            invoiceDate: {
              gte: monthStart,
              lte: monthEnd,
            },
            status: {
              in: ['paid', 'partial_paid'],
            },
          },
          _sum: {
            paidAmount: true,
          },
        });

        // Expenses
        const monthlyExpense = await prisma.expense.aggregate({
          where: {
            companyId,
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const income = monthlyIncome._sum.paidAmount || 0;
        const expense = monthlyExpense._sum.amount || 0;

        trends.push({
          month: monthStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
          monthKey: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
          income: Math.round(income * 100) / 100,
          expense: Math.round(expense * 100) / 100,
          profit: Math.round((income - expense) * 100) / 100,
        });
      }

      log.info('Accounting Service: Dashboard trends hesaplandı', { trendsCount: trends.length });
      return trends;
    } catch (error) {
      log.error('Accounting Service: Dashboard trends hesaplanamadı:', error);
      throw error;
    }
  }

  /**
   * Category Breakdown
   * Income or Expense by category
   */
  async getCategoryBreakdown(
    companyId: number,
    type: 'income' | 'expense',
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      log.info('Accounting Service: Category breakdown hesaplanıyor...', { type });

      const start = startDate || startOfMonth(new Date());
      const end = endDate || endOfMonth(new Date());

      if (type === 'income') {
        // Group invoices by type
        const invoices = await prisma.invoice.groupBy({
          by: ['type'],
          where: {
            invoiceDate: {
              gte: start,
              lte: end,
            },
            status: {
              in: ['paid', 'partial_paid'],
            },
          },
          _sum: {
            paidAmount: true,
          },
          _count: true,
        });

        const total = invoices.reduce((sum, item) => sum + (item._sum.paidAmount || 0), 0);

        return invoices.map(item => ({
          category: item.type,
          amount: Math.round((item._sum.paidAmount || 0) * 100) / 100,
          count: item._count,
          percentage: total > 0 ? Math.round((item._sum.paidAmount || 0) / total * 100) : 0,
        }));
      } else {
        // Group expenses by category
        const expenses = await prisma.expense.groupBy({
          by: ['category'],
          where: {
            companyId,
            date: {
              gte: start,
              lte: end,
            },
          },
          _sum: {
            amount: true,
          },
          _count: true,
        });

        const total = expenses.reduce((sum, item) => sum + (item._sum.amount || 0), 0);

        return expenses.map(item => ({
          category: item.category,
          amount: Math.round((item._sum.amount || 0) * 100) / 100,
          count: item._count,
          percentage: total > 0 ? Math.round((item._sum.amount || 0) / total * 100) : 0,
        }));
      }
    } catch (error) {
      log.error('Accounting Service: Category breakdown hesaplanamadı:', error);
      throw error;
    }
  }

  /**
   * ADVANCED REPORTS
   */

  /**
   * Cashflow Report - 3 Activity Types
   * Operating, Investing, Financing activities
   */
  async getCashflowReport(companyId: number, months: number = 6) {
    try {
      log.info('Accounting Service: Cashflow report hazırlanıyor...', { months });

      const cashflowData = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        // Operating Activities (Business operations)
        const operatingInflows = await prisma.payment.aggregate({
          where: {
            paymentDate: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        });

        const operatingOutflows = await prisma.expense.aggregate({
          where: {
            companyId,
            date: { gte: monthStart, lte: monthEnd },
            category: { in: ['Personel Maaşları', 'Kira', 'Elektrik/Su/Doğalgaz', 'İnternet/Telefon', 'Pazarlama/Reklam'] },
          },
          _sum: { amount: true },
        });

        // Investing Activities (Equipment purchases, etc.)
        const investingOutflows = await prisma.expense.aggregate({
          where: {
            companyId,
            date: { gte: monthStart, lte: monthEnd },
            category: { in: ['Malzeme Alımı', 'Ekipman Bakım/Onarım'] },
          },
          _sum: { amount: true },
        });

        // Financing Activities (Loans, etc.)
        const financingInflows = await prisma.expense.aggregate({
          where: {
            companyId,
            date: { gte: monthStart, lte: monthEnd },
            category: 'Finansman Geliri',
          },
          _sum: { amount: true },
        });

        const financingOutflows = await prisma.expense.aggregate({
          where: {
            companyId,
            date: { gte: monthStart, lte: monthEnd },
            category: { in: ['Kredi Ödemesi', 'Faiz Ödemesi'] },
          },
          _sum: { amount: true },
        });

        const operatingIn = operatingInflows._sum.amount || 0;
        const operatingOut = operatingOutflows._sum.amount || 0;
        const investingOut = investingOutflows._sum.amount || 0;
        const financingIn = financingInflows._sum.amount || 0;
        const financingOut = financingOutflows._sum.amount || 0;

        const netChange = operatingIn - operatingOut - investingOut + financingIn - financingOut;

        cashflowData.push({
          period: monthStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
          monthKey: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
          operatingInflow: Math.round(operatingIn * 100) / 100,
          operatingOutflow: Math.round(operatingOut * 100) / 100,
          investingInflow: 0,
          investingOutflow: Math.round(investingOut * 100) / 100,
          financingInflow: Math.round(financingIn * 100) / 100,
          financingOutflow: Math.round(financingOut * 100) / 100,
          netChange: Math.round(netChange * 100) / 100,
        });
      }

      log.info('Accounting Service: Cashflow report hazırlandı');
      return cashflowData;
    } catch (error) {
      log.error('Accounting Service: Cashflow report hazırlanamadı:', error);
      throw error;
    }
  }

  /**
   * Profit & Loss Report (P&L Statement)
   */
  async getProfitLossReport(companyId: number, startDate: Date, endDate: Date) {
    try {
      log.info('Accounting Service: P&L report hazırlanıyor...');

      // Revenue breakdown by type
      const revenueByType = await prisma.invoice.groupBy({
        by: ['type'],
        where: {
          invoiceDate: { gte: startDate, lte: endDate },
          status: { in: ['paid', 'partial_paid'] },
        },
        _sum: { paidAmount: true },
      });

      const revenueData = revenueByType.map(item => ({
        category: item.type === 'rental' ? 'Kiralama Geliri' : 
                  item.type === 'sale' ? 'Satış Geliri' : 
                  item.type === 'late_fee' ? 'Gecikme Cezası' : 'Diğer Gelir',
        amount: Math.round((item._sum.paidAmount || 0) * 100) / 100,
      }));

      const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);

      // Calculate percentages
      revenueData.forEach(item => {
        (item as any).percentage = totalRevenue > 0 ? Math.round((item.amount / totalRevenue) * 100) : 0;
      });

      // Expense breakdown by category
      const expenseByCategory = await prisma.expense.groupBy({
        by: ['category'],
        where: {
          companyId,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      const expenseData = expenseByCategory.map(item => ({
        category: item.category,
        amount: Math.round((item._sum.amount || 0) * 100) / 100,
      }));

      const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);

      // Calculate percentages
      expenseData.forEach(item => {
        (item as any).percentage = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
      });

      const netProfit = totalRevenue - totalExpense;

      log.info('Accounting Service: P&L report hazırlandı');

      return {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalExpense: Math.round(totalExpense * 100) / 100,
          netProfit: Math.round(netProfit * 100) / 100,
          profitMargin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0,
        },
        revenue: revenueData,
        expenses: expenseData,
      };
    } catch (error) {
      log.error('Accounting Service: P&L report hazırlanamadı:', error);
      throw error;
    }
  }

  /**
   * Balance Sheet Report
   */
  async getBalanceSheetReport(companyId: number, asOfDate: Date) {
    try {
      log.info('Accounting Service: Balance sheet hazırlanıyor...');

      // Assets - Current Assets
      const cashBalance = await prisma.payment.aggregate({
        where: { paymentDate: { lte: asOfDate } },
        _sum: { amount: true },
      });

      const receivables = await prisma.invoice.aggregate({
        where: {
          invoiceDate: { lte: asOfDate },
          status: { in: ['draft', 'sent', 'partial_paid'] },
        },
        _sum: { grandTotal: true, paidAmount: true },
      });

      const totalReceivables = (receivables._sum.grandTotal || 0) - (receivables._sum.paidAmount || 0);

      // Assets - Fixed Assets (from expenses - equipment purchases)
      const equipmentPurchases = await prisma.expense.aggregate({
        where: {
          companyId,
          date: { lte: asOfDate },
          category: 'Malzeme Alımı',
        },
        _sum: { amount: true },
      });

      // Liabilities - Current Liabilities
      const payables = await prisma.expense.aggregate({
        where: {
          companyId,
          date: { lte: asOfDate },
          status: 'pending',
        },
        _sum: { amount: true },
      });

      // Calculate totals
      const currentAssets = (cashBalance._sum.amount || 0) + totalReceivables;
      const fixedAssets = equipmentPurchases._sum.amount || 0;
      const totalAssets = currentAssets + fixedAssets;

      const currentLiabilities = payables._sum.amount || 0;
      const longTermLiabilities = 0; // TODO: Add when loan tracking is implemented
      const totalLiabilities = currentLiabilities + longTermLiabilities;

      const equity = totalAssets - totalLiabilities;

      log.info('Accounting Service: Balance sheet hazırlandı');

      return {
        asOfDate: asOfDate.toISOString(),
        assets: {
          currentAssets: {
            cash: Math.round((cashBalance._sum.amount || 0) * 100) / 100,
            receivables: Math.round(totalReceivables * 100) / 100,
            inventory: 0, // TODO: Add when inventory valuation is implemented
            total: Math.round(currentAssets * 100) / 100,
          },
          fixedAssets: {
            equipment: Math.round((equipmentPurchases._sum.amount || 0) * 100) / 100,
            accumulated_depreciation: 0, // TODO: Add depreciation tracking
            total: Math.round(fixedAssets * 100) / 100,
          },
          totalAssets: Math.round(totalAssets * 100) / 100,
        },
        liabilities: {
          currentLiabilities: {
            payables: Math.round((payables._sum.amount || 0) * 100) / 100,
            shortTermLoans: 0,
            total: Math.round(currentLiabilities * 100) / 100,
          },
          longTermLiabilities: {
            longTermLoans: 0,
            total: 0,
          },
          totalLiabilities: Math.round(totalLiabilities * 100) / 100,
        },
        equity: {
          capital: Math.round(equity * 100) / 100,
          retainedEarnings: 0,
          totalEquity: Math.round(equity * 100) / 100,
        },
        balanceCheck: {
          assetsEqualsLiabilitiesPlusEquity: Math.abs(totalAssets - (totalLiabilities + equity)) < 0.01,
          difference: Math.round((totalAssets - (totalLiabilities + equity)) * 100) / 100,
        },
      };
    } catch (error) {
      log.error('Accounting Service: Balance sheet hazırlanamadı:', error);
      throw error;
    }
  }

  /**
   * VAT Declaration Report
   */
  async getVATDeclarationReport(companyId: number, months: number = 6) {
    try {
      log.info('Accounting Service: VAT declaration hazırlanıyor...', { months });

      const vatData = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        // Output VAT (Sales)
        const salesVAT = await prisma.invoice.aggregate({
          where: {
            invoiceDate: { gte: monthStart, lte: monthEnd },
            status: { not: 'cancelled' },
          },
          _sum: { totalAmount: true, vatAmount: true },
        });

        // Input VAT (Purchases)
        const purchasesVAT = await prisma.expense.aggregate({
          where: {
            companyId,
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        });

        // Estimate 20% VAT on purchases (TODO: Add vatRate field to Expense model)
        const estimatedInputVAT = (purchasesVAT._sum.amount || 0) * 0.20;

        const outputVAT = salesVAT._sum.vatAmount || 0;
        const inputVAT = estimatedInputVAT;
        const netVAT = outputVAT - inputVAT;

        vatData.push({
          period: monthStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
          monthKey: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
          sales: Math.round((salesVAT._sum.totalAmount || 0) * 100) / 100,
          outputVAT: Math.round(outputVAT * 100) / 100,
          purchases: Math.round((purchasesVAT._sum.amount || 0) * 100) / 100,
          inputVAT: Math.round(inputVAT * 100) / 100,
          netVAT: Math.round(netVAT * 100) / 100,
        });
      }

      log.info('Accounting Service: VAT declaration hazırlandı');
      return vatData;
    } catch (error) {
      log.error('Accounting Service: VAT declaration hazırlanamadı:', error);
      throw error;
    }
  }

  /**
   * KDV Raporu
   * Dönemsel KDV hesaplaması - Deprecated, use getVATDeclarationReport
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
              name: true,
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
          customer: inv.customer.name,
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

  /**
   * INCOME MANAGEMENT
   */

  /**
   * Get incomes with pagination and filters
   */
  async getIncomes(params: {
    page: number;
    limit: number;
    category?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }) {
    try {
      const { page, limit, category, status, startDate, endDate, search } = params;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (category) {
        where.category = category;
      }

      if (status) {
        where.status = status;
      }

      if (startDate && endDate) {
        where.date = {
          gte: startDate,
          lte: endDate,
        };
      }

      if (search) {
        where.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, data] = await Promise.all([
        prisma.expense.count({ where }), // Note: Using Expense model as Income model doesn't exist yet
        prisma.expense.findMany({
          where,
          skip,
          take: limit,
          orderBy: { date: 'desc' },
        }),
      ]);

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      log.error('Failed to get incomes:', error);
      throw error;
    }
  }

  /**
   * Get income by ID
   */
  async getIncomeById(id: number) {
    try {
      // Note: Using Expense model as Income model doesn't exist yet
      const income = await prisma.expense.findUnique({
        where: { id },
      });

      return income;
    } catch (error) {
      log.error('Failed to get income by ID:', error);
      throw error;
    }
  }

  /**
   * Create income
   */
  async createIncome(data: {
    companyId: number;
    description: string;
    amount: number;
    category: string;
    date: Date;
    status: string;
    paymentMethod: string;
    notes?: string;
    invoiceId?: number;
  }) {
    try {
      // Note: Using Expense model for now
      // TODO: Create Income model in schema
      const income = await prisma.expense.create({
        data: {
          companyId: data.companyId,
          description: data.description,
          amount: data.amount,
          category: data.category,
          date: data.date,
          status: data.status,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
        },
      });

      log.info('Income created:', income.id);
      return income;
    } catch (error) {
      log.error('Failed to create income:', error);
      throw error;
    }
  }

  /**
   * Update income
   */
  async updateIncome(id: number, data: Partial<{
    description: string;
    amount: number;
    category: string;
    date: Date;
    status: string;
    paymentMethod: string;
    notes: string;
    invoiceId: number;
  }>) {
    try {
      const income = await prisma.expense.update({
        where: { id },
        data: {
          ...data,
        },
      });

      log.info('Income updated:', income.id);
      return income;
    } catch (error) {
      log.error('Failed to update income:', error);
      throw error;
    }
  }

  /**
   * Delete income
   */
  async deleteIncome(id: number) {
    try {
      await prisma.expense.delete({
        where: { id },
      });

      log.info('Income deleted:', id);
    } catch (error) {
      log.error('Failed to delete income:', error);
      throw error;
    }
  }

  /**
   * ACCOUNT CARDS (CARI HESAP) MANAGEMENT
   */

  /**
   * Get accounts list with filters and pagination
   */
  async getAccountsList(params: {
    companyId: number;
    page: number;
    limit: number;
    search?: string;
    type?: 'customer' | 'supplier';
    minDebt?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const { companyId, page, limit, search, type, minDebt, sortBy, sortOrder } = params;
      const skip = (page - 1) * limit;

      // Get all customers with their invoices
      const customers = await prisma.user.findMany({
        where: {
          role: 'customer',
          ...(search && {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
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

      // Calculate debt for each customer
      const accountsWithDebt = customers.map(customer => {
        const totalDebt = customer.invoices.reduce((sum, inv) => {
          return sum + (inv.grandTotal - inv.paidAmount);
        }, 0);

        const overdueDebt = customer.invoices
          .filter(inv => inv.dueDate < new Date() && inv.status !== 'paid')
          .reduce((sum, inv) => {
            return sum + (inv.grandTotal - inv.paidAmount);
          }, 0);

        const totalInvoiced = customer.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
        const totalPaid = customer.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          taxNumber: customer.taxNumber,
          totalDebt: Math.round(totalDebt * 100) / 100,
          overdueDebt: Math.round(overdueDebt * 100) / 100,
          totalInvoiced: Math.round(totalInvoiced * 100) / 100,
          totalPaid: Math.round(totalPaid * 100) / 100,
          invoiceCount: customer.invoices.length,
          status: overdueDebt > 0 ? 'overdue' : totalDebt > 0 ? 'active' : 'clear',
          riskLevel: overdueDebt > 10000 ? 'high' : overdueDebt > 5000 ? 'medium' : 'low',
        };
      });

      // Filter by minDebt
      let filteredAccounts = accountsWithDebt;
      if (minDebt) {
        filteredAccounts = filteredAccounts.filter(acc => acc.totalDebt >= minDebt);
      }

      // Sort
      filteredAccounts.sort((a, b) => {
        const field = sortBy || 'totalDebt';
        const order = sortOrder === 'asc' ? 1 : -1;
        return ((a as any)[field] - (b as any)[field]) * order;
      });

      // Paginate
      const total = filteredAccounts.length;
      const data = filteredAccounts.slice(skip, skip + limit);

      log.info('Accounts list fetched:', { total, page, limit });

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      log.error('Failed to get accounts list:', error);
      throw error;
    }
  }

  /**
   * Get account detail with all data
   */
  async getAccountDetail(customerId: number) {
    try {
      const customer = await prisma.user.findUnique({
        where: { id: customerId },
        include: {
          invoices: {
            include: {
              payments: true,
            },
            orderBy: {
              invoiceDate: 'desc',
            },
          },
        },
      });

      if (!customer) {
        return null;
      }

      // Calculate summary
      const totalDebt = customer.invoices.reduce((sum, inv) => {
        return sum + (inv.grandTotal - inv.paidAmount);
      }, 0);

      const overdueDebt = customer.invoices
        .filter(inv => inv.dueDate < new Date() && inv.status !== 'paid')
        .reduce((sum, inv) => {
          return sum + (inv.grandTotal - inv.paidAmount);
        }, 0);

      const totalInvoiced = customer.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
      const totalPaid = customer.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

      // Monthly trend (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
        const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 0);

        const monthInvoices = customer.invoices.filter(
          inv => inv.invoiceDate >= monthStart && inv.invoiceDate <= monthEnd
        );

        monthlyTrend.push({
          month: monthStart.toLocaleDateString('tr-TR', { month: 'long' }),
          invoiced: monthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
          paid: monthInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
        });
      }

      return {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          taxNumber: customer.taxNumber,
          address: customer.address,
        },
        summary: {
          totalDebt: Math.round(totalDebt * 100) / 100,
          overdueDebt: Math.round(overdueDebt * 100) / 100,
          totalInvoiced: Math.round(totalInvoiced * 100) / 100,
          totalPaid: Math.round(totalPaid * 100) / 100,
          invoiceCount: customer.invoices.length,
          paymentCount: customer.invoices.reduce((sum, inv) => sum + inv.payments.length, 0),
        },
        invoices: customer.invoices.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          grandTotal: inv.grandTotal,
          paidAmount: inv.paidAmount,
          remainingAmount: inv.grandTotal - inv.paidAmount,
          status: inv.status,
        })),
        monthlyTrend,
      };
    } catch (error) {
      log.error('Failed to get account detail:', error);
      throw error;
    }
  }

  /**
   * Get account aging analysis (30/60/90 days)
   */
  async getAccountAging(customerId: number) {
    try {
      const customer = await prisma.user.findUnique({
        where: { id: customerId },
        include: {
          invoices: {
            where: {
              status: {
                not: 'paid',
              },
            },
          },
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const now = new Date();
      const aging = {
        current: 0, // 0-30 days
        days30: 0, // 31-60 days
        days60: 0, // 61-90 days
        days90Plus: 0, // 90+ days
      };

      customer.invoices.forEach(inv => {
        const remainingAmount = inv.grandTotal - inv.paidAmount;
        const daysOverdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOverdue <= 30) {
          aging.current += remainingAmount;
        } else if (daysOverdue <= 60) {
          aging.days30 += remainingAmount;
        } else if (daysOverdue <= 90) {
          aging.days60 += remainingAmount;
        } else {
          aging.days90Plus += remainingAmount;
        }
      });

      const total = aging.current + aging.days30 + aging.days60 + aging.days90Plus;

      return {
        customerId,
        customerName: customer.name,
        aging: {
          current: Math.round(aging.current * 100) / 100,
          days30: Math.round(aging.days30 * 100) / 100,
          days60: Math.round(aging.days60 * 100) / 100,
          days90Plus: Math.round(aging.days90Plus * 100) / 100,
        },
        total: Math.round(total * 100) / 100,
        percentages: {
          current: total > 0 ? Math.round((aging.current / total) * 100) : 0,
          days30: total > 0 ? Math.round((aging.days30 / total) * 100) : 0,
          days60: total > 0 ? Math.round((aging.days60 / total) * 100) : 0,
          days90Plus: total > 0 ? Math.round((aging.days90Plus / total) * 100) : 0,
        },
      };
    } catch (error) {
      log.error('Failed to get account aging:', error);
      throw error;
    }
  }

  /**
   * Get account statement (all transactions)
   */
  async getAccountStatement(
    customerId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      const customer = await prisma.user.findUnique({
        where: { id: customerId },
        include: {
          invoices: {
            where: {
              ...(startDate && endDate && {
                invoiceDate: {
                  gte: startDate,
                  lte: endDate,
                },
              }),
            },
            include: {
              payments: true,
            },
            orderBy: {
              invoiceDate: 'asc',
            },
          },
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Build transaction list (invoices + payments)
      const transactions: any[] = [];
      let runningBalance = 0;

      customer.invoices.forEach(inv => {
        // Invoice (debit - borç artar)
        runningBalance += inv.grandTotal;
        transactions.push({
          date: inv.invoiceDate,
          type: 'invoice',
          description: `Fatura: ${inv.invoiceNumber}`,
          invoiceNumber: inv.invoiceNumber,
          debit: inv.grandTotal,
          credit: 0,
          balance: runningBalance,
        });

        // Payments (credit - borç azalır)
        inv.payments.forEach(payment => {
          runningBalance -= payment.amount;
          transactions.push({
            date: payment.paymentDate,
            type: 'payment',
            description: `Ödeme: ${payment.paymentMethod}`,
            invoiceNumber: inv.invoiceNumber,
            debit: 0,
            credit: payment.amount,
            balance: runningBalance,
          });
        });
      });

      // Sort by date
      transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Recalculate running balance after sort
      runningBalance = 0;
      transactions.forEach(t => {
        runningBalance += t.debit - t.credit;
        t.balance = Math.round(runningBalance * 100) / 100;
      });

      return {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
        },
        period: {
          start: startDate?.toISOString(),
          end: endDate?.toISOString(),
        },
        summary: {
          totalDebit: Math.round(transactions.reduce((sum, t) => sum + t.debit, 0) * 100) / 100,
          totalCredit: Math.round(transactions.reduce((sum, t) => sum + t.credit, 0) * 100) / 100,
          finalBalance: Math.round(runningBalance * 100) / 100,
        },
        transactions,
      };
    } catch (error) {
      log.error('Failed to get account statement:', error);
      throw error;
    }
  }

  /**
   * EXPENSE MANAGEMENT
   */

  /**
   * Get expenses with pagination and filters
   */
  async getExpenses(params: {
    page: number;
    limit: number;
    category?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }) {
    try {
      const { page, limit, category, status, startDate, endDate, search } = params;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (category) {
        where.category = category;
      }

      if (status) {
        where.status = status;
      }

      if (startDate && endDate) {
        where.date = {
          gte: startDate,
          lte: endDate,
        };
      }

      if (search) {
        where.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, data] = await Promise.all([
        prisma.expense.count({ where }),
        prisma.expense.findMany({
          where,
          skip,
          take: limit,
          orderBy: { date: 'desc' },
        }),
      ]);

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      log.error('Failed to get expenses:', error);
      throw error;
    }
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id: number) {
    try {
      const expense = await prisma.expense.findUnique({
        where: { id },
      });

      return expense;
    } catch (error) {
      log.error('Failed to get expense by ID:', error);
      throw error;
    }
  }

  /**
   * Create expense
   */
  async createExpense(data: {
    companyId: number;
    description: string;
    amount: number;
    category: string;
    date: Date;
    status: string;
    paymentMethod: string;
    notes?: string;
    receiptUrl?: string;
  }) {
    try {
      const expense = await prisma.expense.create({
        data: {
          companyId: data.companyId,
          description: data.description,
          amount: data.amount,
          category: data.category,
          date: data.date,
          status: data.status,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
        },
      });

      log.info('Expense created:', expense.id);
      return expense;
    } catch (error) {
      log.error('Failed to create expense:', error);
      throw error;
    }
  }

  /**
   * Update expense
   */
  async updateExpense(id: number, data: Partial<{
    description: string;
    amount: number;
    category: string;
    date: Date;
    status: string;
    paymentMethod: string;
    notes: string;
    receiptUrl: string;
  }>) {
    try {
      const expense = await prisma.expense.update({
        where: { id },
        data: {
          ...data,
        },
      });

      log.info('Expense updated:', expense.id);
      return expense;
    } catch (error) {
      log.error('Failed to update expense:', error);
      throw error;
    }
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: number) {
    try {
      await prisma.expense.delete({
        where: { id },
      });

      log.info('Expense deleted:', id);
    } catch (error) {
      log.error('Failed to delete expense:', error);
      throw error;
    }
  }

  /**
   * E-INVOICE CRUD OPERATIONS
   */

  /**
   * Create E-Invoice with smart type detection
   * Auto-detects e-fatura vs e-archive based on customer tax info
   */
  async createEInvoice(data: {
    companyId: number;
    orderId: number;
    customerId: number;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      vatRate?: number;
    }>;
    type?: string;
    notes?: string;
  }) {
    try {
      log.info('Creating e-invoice...', { orderId: data.orderId });

      // Get customer info to determine invoice type
      const customer = await prisma.user.findUnique({
        where: { id: data.customerId },
        select: {
          id: true,
          name: true,
          email: true,
          taxNumber: true,
          taxOffice: true,
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Smart type detection: e-fatura if customer has tax number, otherwise e-archive
      let invoiceType = data.type;
      if (!invoiceType) {
        invoiceType = customer.taxNumber && customer.taxNumber.length >= 10 
          ? 'e-fatura' 
          : 'e-archive';
      }

      // Calculate invoice totals
      let totalAmount = 0;
      let vatAmount = 0;

      data.items.forEach(item => {
        const lineTotal = item.quantity * item.unitPrice;
        const vatRate = item.vatRate || 0.20; // Default 20% KDV
        const lineVat = lineTotal * vatRate;

        totalAmount += lineTotal;
        vatAmount += lineVat;
      });

      const grandTotal = totalAmount + vatAmount;

      // Generate invoice number
      const today = new Date();
      const year = today.getFullYear();
      const count = await prisma.invoice.count({
        where: {
          invoiceDate: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31),
          },
        },
      });

      const invoiceNumber = `${invoiceType === 'e-fatura' ? 'EFA' : 'EAR'}${year}${String(count + 1).padStart(6, '0')}`;

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          orderId: data.orderId,
          customerId: data.customerId,
          invoiceNumber,
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          totalAmount,
          vatAmount,
          grandTotal,
          paidAmount: 0,
          status: 'draft',
          type: invoiceType,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              taxNumber: true,
              taxOffice: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
        },
      });

      log.info('E-invoice created:', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        type: invoiceType,
      });

      return {
        ...invoice,
        items: data.items,
        detectedType: invoiceType,
      };
    } catch (error) {
      log.error('Failed to create e-invoice:', error);
      throw error;
    }
  }

  /**
   * Get E-Invoice detail with full information
   */
  async getEInvoiceDetail(id: number) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              taxNumber: true,
              taxOffice: true,
              address: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              startDate: true,
              endDate: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentDate: true,
              paymentMethod: true,
              status: true,
            },
          },
        },
      });

      return invoice;
    } catch (error) {
      log.error('Failed to get e-invoice detail:', error);
      throw error;
    }
  }

  /**
   * Update E-Invoice (only if status = draft)
   */
  async updateEInvoice(
    id: number,
    data: {
      items?: Array<any>;
      notes?: string;
      dueDate?: Date;
    }
  ) {
    try {
      // Check if invoice is still in draft
      const existing = await prisma.invoice.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Invoice not found');
      }

      if (existing.status !== 'draft') {
        throw new Error('Cannot update invoice that is not in draft status');
      }

      // Recalculate totals if items are updated
      let updateData: any = {};

      if (data.items) {
        let totalAmount = 0;
        let vatAmount = 0;

        data.items.forEach(item => {
          const lineTotal = item.quantity * item.unitPrice;
          const vatRate = item.vatRate || 0.20;
          const lineVat = lineTotal * vatRate;

          totalAmount += lineTotal;
          vatAmount += lineVat;
        });

        updateData.totalAmount = totalAmount;
        updateData.vatAmount = vatAmount;
        updateData.grandTotal = totalAmount + vatAmount;
      }

      if (data.dueDate) {
        updateData.dueDate = data.dueDate;
      }

      const invoice = await prisma.invoice.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          order: true,
        },
      });

      log.info('E-invoice updated:', id);

      return {
        ...invoice,
        items: data.items,
      };
    } catch (error) {
      log.error('Failed to update e-invoice:', error);
      throw error;
    }
  }

  /**
   * Send E-Invoice to GIB (change status from draft to sent)
   * In production, this will call GIB SOAP API
   */
  async sendEInvoice(id: number) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { customer: true },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status !== 'draft') {
        throw new Error('Only draft invoices can be sent');
      }

      // TODO: Call GIB SOAP API here
      // For now, just update status

      const updated = await prisma.invoice.update({
        where: { id },
        data: {
          status: 'sent',
        },
        include: {
          customer: true,
          order: true,
        },
      });

      log.info('E-invoice sent to GIB (simulated):', {
        invoiceId: id,
        invoiceNumber: updated.invoiceNumber,
      });

      return updated;
    } catch (error) {
      log.error('Failed to send e-invoice:', error);
      throw error;
    }
  }

  /**
   * Cancel E-Invoice (soft delete)
   */
  async cancelEInvoice(id: number, reason?: string) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // TODO: If already sent to GIB, call GIB cancel API

      const updated = await prisma.invoice.update({
        where: { id },
        data: {
          status: 'cancelled',
        },
      });

      log.info('E-invoice cancelled:', {
        invoiceId: id,
        reason: reason || 'No reason provided',
      });

      return updated;
    } catch (error) {
      log.error('Failed to cancel e-invoice:', error);
      throw error;
    }
  }

  /**
   * List E-Invoices with filters and pagination
   */
  async listEInvoices(
    filters: {
      status?: string;
      type?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.startDate || filters.endDate) {
        where.invoiceDate = {};
        if (filters.startDate) {
          where.invoiceDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.invoiceDate.lte = filters.endDate;
        }
      }

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                taxNumber: true,
              },
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
          },
          orderBy: {
            invoiceDate: 'desc',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.invoice.count({ where }),
      ]);

      log.info('E-invoices listed:', { count: invoices.length, total });

      return {
        invoices,
        total,
        page,
        limit,
      };
    } catch (error) {
      log.error('Failed to list e-invoices:', error);
      throw error;
    }
  }

  /**
   * Generate E-Invoice PDF
   * TODO: Implement PDF generation library (pdfkit or puppeteer)
   */
  async generateEInvoicePDF(id: number): Promise<Buffer> {
    try {
      const invoice = await this.getEInvoiceDetail(id);

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // TODO: Implement PDF generation
      // For now, return a placeholder

      const placeholder = Buffer.from(`
        E-FATURA / E-ARCHIVE INVOICE
        
        Invoice Number: ${invoice.invoiceNumber}
        Date: ${invoice.invoiceDate.toLocaleDateString('tr-TR')}
        
        Customer: ${invoice.customer.name}
        Tax Number: ${invoice.customer.taxNumber || 'N/A'}
        
        Total Amount: ${invoice.totalAmount.toFixed(2)} TL
        VAT Amount: ${invoice.vatAmount.toFixed(2)} TL
        Grand Total: ${invoice.grandTotal.toFixed(2)} TL
        
        Status: ${invoice.status.toUpperCase()}
      `);

      log.info('E-invoice PDF generated (placeholder):', id);

      return placeholder;
    } catch (error) {
      log.error('Failed to generate e-invoice PDF:', error);
      throw error;
    }
  }

  /**
   * Generate E-Invoice XML (UBL-TR format)
   * TODO: Implement UBL-TR XML generation for GIB
   */
  async generateEInvoiceXML(id: number): Promise<string> {
    try {
      const invoice = await this.getEInvoiceDetail(id);

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // TODO: Implement proper UBL-TR XML generation
      // For now, return a basic XML structure

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <ID>${invoice.invoiceNumber}</ID>
  <IssueDate>${invoice.invoiceDate.toISOString().split('T')[0]}</IssueDate>
  <InvoiceTypeCode>${invoice.type === 'e-fatura' ? 'SATIS' : 'EARSIVFATURA'}</InvoiceTypeCode>
  
  <AccountingSupplierParty>
    <Party>
      <PartyName>
        <Name>CANARY Digital</Name>
      </PartyName>
    </Party>
  </AccountingSupplierParty>
  
  <AccountingCustomerParty>
    <Party>
      <PartyName>
        <Name>${invoice.customer.name}</Name>
      </PartyName>
      <PartyTaxScheme>
        <TaxScheme>
          <TaxTypeCode>VKN</TaxTypeCode>
          <TaxIdentificationNumber>${invoice.customer.taxNumber || ''}</TaxIdentificationNumber>
        </TaxScheme>
      </PartyTaxScheme>
    </Party>
  </AccountingCustomerParty>
  
  <LegalMonetaryTotal>
    <LineExtensionAmount currencyID="TRY">${invoice.totalAmount.toFixed(2)}</LineExtensionAmount>
    <TaxExclusiveAmount currencyID="TRY">${invoice.totalAmount.toFixed(2)}</TaxExclusiveAmount>
    <TaxInclusiveAmount currencyID="TRY">${invoice.grandTotal.toFixed(2)}</TaxInclusiveAmount>
    <PayableAmount currencyID="TRY">${invoice.grandTotal.toFixed(2)}</PayableAmount>
  </LegalMonetaryTotal>
  
  <TaxTotal>
    <TaxAmount currencyID="TRY">${invoice.vatAmount.toFixed(2)}</TaxAmount>
  </TaxTotal>
</Invoice>`;

      log.info('E-invoice XML generated (placeholder):', id);

      return xml;
    } catch (error) {
      log.error('Failed to generate e-invoice XML:', error);
      throw error;
    }
  }

  /**
   * DELIVERY NOTES (İRSALİYE) CRUD OPERATIONS
   */

  /**
   * Create Delivery Note
   * Creates inbound or outbound delivery note
   */
  async createDeliveryNote(data: {
    companyId: number;
    orderId: number;
    customerId: number;
    items: Array<{
      description: string;
      quantity: number;
      unit: string;
    }>;
    type: 'inbound' | 'outbound';
    waybillNumber?: string;
    notes?: string;
    vehicleInfo?: any;
  }) {
    try {
      log.info('Creating delivery note...', { orderId: data.orderId, type: data.type });

      // Verify order and customer exist
      const [order, customer] = await Promise.all([
        prisma.order.findUnique({ where: { id: data.orderId } }),
        prisma.user.findUnique({ where: { id: data.customerId } }),
      ]);

      if (!order) {
        throw new Error('Order not found');
      }

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Generate delivery note number
      const today = new Date();
      const year = today.getFullYear();
      const prefix = data.type === 'inbound' ? 'IRSG' : 'IRSC'; // Giriş/Çıkış

      const deliveryNoteNumber = `${prefix}${year}${String(deliveryNoteIdCounter).padStart(6, '0')}`;

      // Create delivery note
      const deliveryNote: DeliveryNote = {
        id: deliveryNoteIdCounter++,
        companyId: data.companyId,
        orderId: data.orderId,
        customerId: data.customerId,
        deliveryNoteNumber,
        deliveryDate: new Date(),
        type: data.type,
        status: 'draft',
        waybillNumber: data.waybillNumber,
        vehicleInfo: data.vehicleInfo,
        notes: data.notes,
        items: data.items,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      deliveryNotesStore.set(deliveryNote.id, deliveryNote);

      log.info('Delivery note created:', {
        id: deliveryNote.id,
        deliveryNoteNumber: deliveryNote.deliveryNoteNumber,
        type: data.type,
      });

      return {
        ...deliveryNote,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
        },
        customer: {
          id: customer.id,
          fullName: customer.name,
        },
      };
    } catch (error) {
      log.error('Failed to create delivery note:', error);
      throw error;
    }
  }

  /**
   * Get Delivery Note detail
   */
  async getDeliveryNoteDetail(id: number) {
    try {
      const deliveryNote = deliveryNotesStore.get(id);

      if (!deliveryNote) {
        return null;
      }

      // Get related order and customer info
      const [order, customer] = await Promise.all([
        prisma.order.findUnique({
          where: { id: deliveryNote.orderId },
          select: {
            id: true,
            orderNumber: true,
            startDate: true,
            endDate: true,
          },
        }),
        prisma.user.findUnique({
          where: { id: deliveryNote.customerId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        }),
      ]);

      return {
        ...deliveryNote,
        order,
        customer,
      };
    } catch (error) {
      log.error('Failed to get delivery note detail:', error);
      throw error;
    }
  }

  /**
   * Update Delivery Note (only if status = draft)
   */
  async updateDeliveryNote(
    id: number,
    data: {
      items?: Array<any>;
      notes?: string;
      vehicleInfo?: any;
      waybillNumber?: string;
    }
  ) {
    try {
      const deliveryNote = deliveryNotesStore.get(id);

      if (!deliveryNote) {
        throw new Error('Delivery note not found');
      }

      if (deliveryNote.status !== 'draft') {
        throw new Error('Cannot update delivery note that is not in draft status');
      }

      // Update fields
      if (data.items) deliveryNote.items = data.items;
      if (data.notes !== undefined) deliveryNote.notes = data.notes;
      if (data.vehicleInfo) deliveryNote.vehicleInfo = data.vehicleInfo;
      if (data.waybillNumber !== undefined) deliveryNote.waybillNumber = data.waybillNumber;

      deliveryNote.updatedAt = new Date();

      deliveryNotesStore.set(id, deliveryNote);

      log.info('Delivery note updated:', id);

      return deliveryNote;
    } catch (error) {
      log.error('Failed to update delivery note:', error);
      throw error;
    }
  }

  /**
   * Confirm Delivery Note (change status from draft to confirmed)
   */
  async confirmDeliveryNote(id: number) {
    try {
      const deliveryNote = deliveryNotesStore.get(id);

      if (!deliveryNote) {
        throw new Error('Delivery note not found');
      }

      if (deliveryNote.status !== 'draft') {
        throw new Error('Only draft delivery notes can be confirmed');
      }

      deliveryNote.status = 'confirmed';
      deliveryNote.updatedAt = new Date();

      deliveryNotesStore.set(id, deliveryNote);

      log.info('Delivery note confirmed:', {
        id,
        deliveryNoteNumber: deliveryNote.deliveryNoteNumber,
      });

      return deliveryNote;
    } catch (error) {
      log.error('Failed to confirm delivery note:', error);
      throw error;
    }
  }

  /**
   * Cancel Delivery Note
   */
  async cancelDeliveryNote(id: number, reason?: string) {
    try {
      const deliveryNote = deliveryNotesStore.get(id);

      if (!deliveryNote) {
        throw new Error('Delivery note not found');
      }

      deliveryNote.status = 'cancelled';
      deliveryNote.notes = reason
        ? `${deliveryNote.notes || ''}\n\nCancellation reason: ${reason}`
        : deliveryNote.notes;
      deliveryNote.updatedAt = new Date();

      deliveryNotesStore.set(id, deliveryNote);

      log.info('Delivery note cancelled:', {
        id,
        reason: reason || 'No reason provided',
      });

      return deliveryNote;
    } catch (error) {
      log.error('Failed to cancel delivery note:', error);
      throw error;
    }
  }

  /**
   * List Delivery Notes with filters and pagination
   */
  async listDeliveryNotes(
    filters: {
      status?: string;
      type?: string;
      orderId?: number;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 20
  ) {
    try {
      let deliveryNotes = Array.from(deliveryNotesStore.values());

      // Apply filters
      if (filters.status) {
        deliveryNotes = deliveryNotes.filter(dn => dn.status === filters.status);
      }

      if (filters.type) {
        deliveryNotes = deliveryNotes.filter(dn => dn.type === filters.type);
      }

      if (filters.orderId) {
        deliveryNotes = deliveryNotes.filter(dn => dn.orderId === filters.orderId);
      }

      if (filters.startDate) {
        deliveryNotes = deliveryNotes.filter(
          dn => dn.deliveryDate >= filters.startDate!
        );
      }

      if (filters.endDate) {
        deliveryNotes = deliveryNotes.filter(
          dn => dn.deliveryDate <= filters.endDate!
        );
      }

      // Sort by date desc
      deliveryNotes.sort((a, b) => b.deliveryDate.getTime() - a.deliveryDate.getTime());

      const total = deliveryNotes.length;
      const start = (page - 1) * limit;
      const paginatedNotes = deliveryNotes.slice(start, start + limit);

      // Enrich with customer and order info
      const enrichedNotes = await Promise.all(
        paginatedNotes.map(async dn => {
          const [order, customer] = await Promise.all([
            prisma.order.findUnique({
              where: { id: dn.orderId },
              select: { id: true, orderNumber: true },
            }),
            prisma.user.findUnique({
              where: { id: dn.customerId },
              select: { id: true, fullName: true },
            }),
          ]);

          return {
            ...dn,
            order,
            customer,
          };
        })
      );

      log.info('Delivery notes listed:', { count: enrichedNotes.length, total });

      return {
        deliveryNotes: enrichedNotes,
        total,
        page,
        limit,
      };
    } catch (error) {
      log.error('Failed to list delivery notes:', error);
      throw error;
    }
  }

  /**
   * Generate Delivery Note PDF
   * TODO: Implement PDF generation
   */
  async generateDeliveryNotePDF(id: number): Promise<Buffer> {
    try {
      const deliveryNote = deliveryNotesStore.get(id);

      if (!deliveryNote) {
        throw new Error('Delivery note not found');
      }

      const [order, customer] = await Promise.all([
        prisma.order.findUnique({ where: { id: deliveryNote.orderId } }),
        prisma.user.findUnique({ where: { id: deliveryNote.customerId } }),
      ]);

      // TODO: Implement PDF generation
      const placeholder = Buffer.from(`
        İRSALİYE / DELIVERY NOTE
        
        İrsaliye No: ${deliveryNote.deliveryNoteNumber}
        Tarih: ${deliveryNote.deliveryDate.toLocaleDateString('tr-TR')}
        Tip: ${deliveryNote.type === 'inbound' ? 'Giriş' : 'Çıkış'}
        
        Müşteri: ${customer?.fullName || 'N/A'}
        Sipariş No: ${order?.orderNumber || 'N/A'}
        
        Sevk İrsaliyesi: ${deliveryNote.waybillNumber || 'N/A'}
        
        Ürünler:
        ${deliveryNote.items.map((item, i) => `${i + 1}. ${item.description} - ${item.quantity} ${item.unit}`).join('\n        ')}
        
        Notlar: ${deliveryNote.notes || '-'}
        
        Durum: ${deliveryNote.status.toUpperCase()}
      `);

      log.info('Delivery note PDF generated (placeholder):', id);

      return placeholder;
    } catch (error) {
      log.error('Failed to generate delivery note PDF:', error);
      throw error;
    }
  }

  /**
   * Link Delivery Note to Invoice
   */
  async linkDeliveryNoteToInvoice(deliveryNoteId: number, invoiceId: number) {
    try {
      const deliveryNote = deliveryNotesStore.get(deliveryNoteId);

      if (!deliveryNote) {
        throw new Error('Delivery note not found');
      }

      // Verify invoice exists
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Link them
      deliveryNote.linkedInvoiceId = invoiceId;
      deliveryNote.updatedAt = new Date();

      deliveryNotesStore.set(deliveryNoteId, deliveryNote);

      log.info('Delivery note linked to invoice:', {
        deliveryNoteId,
        invoiceId,
      });

      return deliveryNote;
    } catch (error) {
      log.error('Failed to link delivery note to invoice:', error);
      throw error;
    }
  }

  /**
   * BANK & CASH OPERATIONS
   */

  /**
   * List all bank accounts for company
   */
  async listBankAccounts(companyId: number) {
    try {
      const accounts = await prisma.bankAccount.findMany({
        where: { companyId, isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      log.info('Bank accounts listed:', { count: accounts.length });

      return accounts;
    } catch (error) {
      log.error('Failed to list bank accounts:', error);
      throw error;
    }
  }

  /**
   * Create new bank account
   */
  async createBankAccount(data: {
    companyId: number;
    bankName: string;
    accountType: string;
    iban: string;
    branch?: string;
    balance?: number;
    currency?: string;
  }) {
    try {
      const account = await prisma.bankAccount.create({
        data: {
          companyId: data.companyId,
          bankName: data.bankName,
          accountType: data.accountType,
          iban: data.iban,
          branch: data.branch,
          balance: data.balance || 0,
          currency: data.currency || 'TRY',
          isActive: true,
        },
      });

      log.info('Bank account created:', {
        id: account.id,
        bankName: account.bankName,
        iban: account.iban,
      });

      return account;
    } catch (error) {
      log.error('Failed to create bank account:', error);
      throw error;
    }
  }

  /**
   * Get bank transactions with pagination
   */
  async getBankTransactions(
    accountId: number,
    filters: {
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 50
  ) {
    try {
      const where: any = { accountId };

      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = filters.startDate;
        if (filters.endDate) where.date.lte = filters.endDate;
      }

      const [transactions, total] = await Promise.all([
        prisma.bankTransaction.findMany({
          where,
          orderBy: { date: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.bankTransaction.count({ where }),
      ]);

      log.info('Bank transactions listed:', { count: transactions.length, total });

      return {
        transactions,
        total,
        page,
        limit,
      };
    } catch (error) {
      log.error('Failed to get bank transactions:', error);
      throw error;
    }
  }

  /**
   * Create bank transaction and update account balance
   */
  async createBankTransaction(data: {
    accountId: number;
    type: 'deposit' | 'withdrawal';
    amount: number;
    description?: string;
    date: Date;
  }) {
    try {
      // Get current account balance
      const account = await prisma.bankAccount.findUnique({
        where: { id: data.accountId },
      });

      if (!account) {
        throw new Error('Bank account not found');
      }

      // Calculate new balance
      const newBalance =
        data.type === 'deposit'
          ? account.balance + data.amount
          : account.balance - data.amount;

      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }

      // Create transaction and update account balance in a transaction
      const [transaction] = await prisma.$transaction([
        prisma.bankTransaction.create({
          data: {
            accountId: data.accountId,
            type: data.type,
            amount: data.amount,
            description: data.description,
            balanceAfter: newBalance,
            date: data.date,
          },
        }),
        prisma.bankAccount.update({
          where: { id: data.accountId },
          data: { balance: newBalance },
        }),
      ]);

      log.info('Bank transaction created:', {
        id: transaction.id,
        type: data.type,
        amount: data.amount,
        newBalance,
      });

      return transaction;
    } catch (error) {
      log.error('Failed to create bank transaction:', error);
      throw error;
    }
  }

  /**
   * Reconcile bank account with statement
   */
  async reconcileBankAccount(
    accountId: number,
    statementBalance: number,
    statementDate: Date
  ) {
    try {
      const account = await prisma.bankAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new Error('Bank account not found');
      }

      const difference = statementBalance - account.balance;
      const isReconciled = Math.abs(difference) < 0.01; // Within 1 kuruş tolerance

      log.info('Bank reconciliation result:', {
        accountId,
        systemBalance: account.balance,
        statementBalance,
        difference,
        isReconciled,
      });

      return {
        accountId,
        accountName: account.bankName,
        systemBalance: account.balance,
        statementBalance,
        difference,
        isReconciled,
        statementDate,
        message: isReconciled
          ? 'Account is reconciled'
          : `Difference of ${Math.abs(difference).toFixed(2)} TL found`,
      };
    } catch (error) {
      log.error('Failed to reconcile bank account:', error);
      throw error;
    }
  }

  /**
   * List cash transactions
   */
  async listCashTransactions(
    companyId: number,
    filters: {
      startDate?: Date;
      endDate?: Date;
      type?: string;
    },
    page: number = 1,
    limit: number = 50
  ) {
    try {
      const where: any = { companyId };

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = filters.startDate;
        if (filters.endDate) where.date.lte = filters.endDate;
      }

      const [transactions, total] = await Promise.all([
        prisma.cashTransaction.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.cashTransaction.count({ where }),
      ]);

      log.info('Cash transactions listed:', { count: transactions.length, total });

      return {
        transactions,
        total,
        page,
        limit,
      };
    } catch (error) {
      log.error('Failed to list cash transactions:', error);
      throw error;
    }
  }

  /**
   * Create cash transaction
   */
  async createCashTransaction(data: {
    companyId: number;
    userId?: number;
    type: 'in' | 'out';
    amount: number;
    description?: string;
    date: Date;
  }) {
    try {
      const transaction = await prisma.cashTransaction.create({
        data: {
          companyId: data.companyId,
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      log.info('Cash transaction created:', {
        id: transaction.id,
        type: data.type,
        amount: data.amount,
      });

      return transaction;
    } catch (error) {
      log.error('Failed to create cash transaction:', error);
      throw error;
    }
  }

  /**
   * Get current cash balance
   */
  async getCashBalance(companyId: number) {
    try {
      const result = await prisma.cashTransaction.groupBy({
        by: ['type'],
        where: { companyId },
        _sum: { amount: true },
      });

      const inflows = result.find(r => r.type === 'in')?._sum.amount || 0;
      const outflows = result.find(r => r.type === 'out')?._sum.amount || 0;
      const balance = inflows - outflows;

      log.info('Cash balance calculated:', {
        companyId,
        inflows,
        outflows,
        balance,
      });

      return Math.round(balance * 100) / 100;
    } catch (error) {
      log.error('Failed to get cash balance:', error);
      throw error;
    }
  }

  /**
   * Parse MT940 bank statement (basic implementation)
   * TODO: Implement full MT940 parser with all tags
   */
  async parseMT940Statement(fileContent: string) {
    try {
      log.info('Parsing MT940 statement...');

      const lines = fileContent.split('\n').map(line => line.trim());
      const transactions: any[] = [];

      let currentTransaction: any = null;

      for (const line of lines) {
        // :20: Transaction Reference
        if (line.startsWith(':20:')) {
          currentTransaction = {
            reference: line.substring(4),
          };
        }

        // :25: Account Identification
        if (line.startsWith(':25:') && currentTransaction) {
          currentTransaction.accountNumber = line.substring(4);
        }

        // :60F: Opening Balance
        if (line.startsWith(':60F:')) {
          // Format: :60F:C230915EUR1234,56
          // C/D = Credit/Debit, Date (YYMMDD), Currency, Amount
        }

        // :61: Statement Line (Transaction)
        if (line.startsWith(':61:')) {
          if (currentTransaction && currentTransaction.amount) {
            transactions.push({ ...currentTransaction });
          }

          // Format: :61:2309150915DR50,00NTRFNONREF
          const parts = line.substring(4);
          const debitCredit = parts.includes('DR') ? 'withdrawal' : 'deposit';
          
          // Extract amount (simplified parsing)
          const amountMatch = parts.match(/(\d+[,\.]\d+)/);
          const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;

          currentTransaction = {
            ...currentTransaction,
            type: debitCredit,
            amount,
            rawLine: line,
          };
        }

        // :86: Transaction Details
        if (line.startsWith(':86:') && currentTransaction) {
          currentTransaction.description = line.substring(4);
        }

        // :62F: Closing Balance
        if (line.startsWith(':62F:')) {
          // Format similar to :60F:
          if (currentTransaction && currentTransaction.amount) {
            transactions.push({ ...currentTransaction });
            currentTransaction = null;
          }
        }
      }

      // Add last transaction if exists
      if (currentTransaction && currentTransaction.amount) {
        transactions.push(currentTransaction);
      }

      log.info('MT940 statement parsed:', {
        transactionCount: transactions.length,
      });

      return {
        parsed: true,
        transactionCount: transactions.length,
        transactions,
        warning: 'This is a basic MT940 parser. Full implementation needed for production.',
      };
    } catch (error) {
      log.error('Failed to parse MT940 statement:', error);
      throw error;
    }
  }

  /**
   * STOCK MOVEMENTS OPERATIONS
   */

  /**
   * Create stock movement and update equipment quantity
   */
  async createStockMovement(data: {
    companyId: number;
    userId?: number;
    equipmentId: number;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    unitCost?: number;
    notes?: string;
    orderId?: number;
  }) {
    try {
      log.info('Creating stock movement...', {
        equipmentId: data.equipmentId,
        type: data.type,
        quantity: data.quantity,
      });

      // Get equipment
      const equipment = await prisma.equipment.findUnique({
        where: { id: data.equipmentId },
      });

      if (!equipment) {
        throw new Error('Equipment not found');
      }

      // Calculate new balance
      const currentBalance = equipment.quantity || 0;
      let newBalance = currentBalance;

      if (data.type === 'in') {
        newBalance = currentBalance + data.quantity;
      } else if (data.type === 'out') {
        newBalance = currentBalance - data.quantity;
        if (newBalance < 0) {
          throw new Error('Insufficient stock quantity');
        }
      } else if (data.type === 'adjustment') {
        newBalance = data.quantity; // Direct set
      }

      // Calculate cost
      const totalCost = data.unitCost ? data.unitCost * Math.abs(data.quantity) : undefined;

      // Create movement
      const movement: StockMovement = {
        id: stockMovementIdCounter++,
        companyId: data.companyId,
        equipmentId: data.equipmentId,
        type: data.type,
        quantity: data.quantity,
        unitCost: data.unitCost,
        totalCost,
        balanceAfter: newBalance,
        notes: data.notes,
        userId: data.userId,
        orderId: data.orderId,
        date: new Date(),
        createdAt: new Date(),
      };

      stockMovementsStore.set(movement.id, movement);

      // Update equipment quantity
      await prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { quantity: newBalance },
      });

      log.info('Stock movement created:', {
        id: movement.id,
        equipmentId: data.equipmentId,
        type: data.type,
        balanceAfter: newBalance,
      });

      return {
        ...movement,
        equipment: {
          id: equipment.id,
          name: equipment.name,
          previousBalance: currentBalance,
          newBalance,
        },
      };
    } catch (error) {
      log.error('Failed to create stock movement:', error);
      throw error;
    }
  }

  /**
   * List stock movements with filters
   */
  async listStockMovements(
    companyId: number,
    filters: {
      equipmentId?: number;
      type?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 50
  ) {
    try {
      let movements = Array.from(stockMovementsStore.values()).filter(
        m => m.companyId === companyId
      );

      // Apply filters
      if (filters.equipmentId) {
        movements = movements.filter(m => m.equipmentId === filters.equipmentId);
      }

      if (filters.type) {
        movements = movements.filter(m => m.type === filters.type);
      }

      if (filters.startDate) {
        movements = movements.filter(m => m.date >= filters.startDate!);
      }

      if (filters.endDate) {
        movements = movements.filter(m => m.date <= filters.endDate!);
      }

      // Sort by date desc
      movements.sort((a, b) => b.date.getTime() - a.date.getTime());

      const total = movements.length;
      const start = (page - 1) * limit;
      const paginatedMovements = movements.slice(start, start + limit);

      // Enrich with equipment and user info
      const enrichedMovements = await Promise.all(
        paginatedMovements.map(async m => {
          const [equipment, user] = await Promise.all([
            prisma.equipment.findUnique({
              where: { id: m.equipmentId },
              select: {
                id: true,
                name: true,
                serialNumber: true,
              },
            }),
            m.userId
              ? prisma.user.findUnique({
                  where: { id: m.userId },
                  select: { id: true, fullName: true },
                })
              : null,
          ]);

          return {
            ...m,
            equipment,
            user,
          };
        })
      );

      log.info('Stock movements listed:', { count: enrichedMovements.length, total });

      return {
        movements: enrichedMovements,
        total,
        page,
        limit,
      };
    } catch (error) {
      log.error('Failed to list stock movements:', error);
      throw error;
    }
  }

  /**
   * Get stock valuation using FIFO or LIFO method
   */
  async getStockValuation(
    companyId: number,
    method: 'fifo' | 'lifo',
    equipmentId?: number
  ) {
    try {
      log.info('Calculating stock valuation...', { method, equipmentId });

      // Get all stock movements
      let movements = Array.from(stockMovementsStore.values()).filter(
        m => m.companyId === companyId && m.unitCost !== undefined
      );

      if (equipmentId) {
        movements = movements.filter(m => m.equipmentId === equipmentId);
      }

      // Group by equipment
      const equipmentMap = new Map<number, any>();

      for (const movement of movements) {
        if (!equipmentMap.has(movement.equipmentId)) {
          const equipment = await prisma.equipment.findUnique({
            where: { id: movement.equipmentId },
          });

          equipmentMap.set(movement.equipmentId, {
            equipmentId: movement.equipmentId,
            equipmentName: equipment?.name || 'Unknown',
            currentQuantity: equipment?.quantity || 0,
            movements: [],
            totalValue: 0,
            averageCost: 0,
          });
        }

        const item = equipmentMap.get(movement.equipmentId)!;
        if (movement.type === 'in' && movement.unitCost) {
          item.movements.push({
            date: movement.date,
            quantity: movement.quantity,
            unitCost: movement.unitCost,
            totalCost: movement.totalCost,
          });
        }
      }

      // Calculate valuation for each equipment
      const valuations = Array.from(equipmentMap.values()).map(item => {
        if (item.movements.length === 0) {
          return {
            ...item,
            totalValue: 0,
            averageCost: 0,
            method,
          };
        }

        // Sort movements
        if (method === 'fifo') {
          // First In First Out - oldest first
          item.movements.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
        } else {
          // Last In First Out - newest first
          item.movements.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
        }

        // Calculate value based on current quantity
        let remainingQty = item.currentQuantity;
        let totalValue = 0;

        for (const movement of item.movements) {
          if (remainingQty <= 0) break;

          const qtyToUse = Math.min(remainingQty, movement.quantity);
          totalValue += qtyToUse * movement.unitCost;
          remainingQty -= qtyToUse;
        }

        const averageCost = item.currentQuantity > 0 ? totalValue / item.currentQuantity : 0;

        return {
          equipmentId: item.equipmentId,
          equipmentName: item.equipmentName,
          currentQuantity: item.currentQuantity,
          totalValue: Math.round(totalValue * 100) / 100,
          averageCost: Math.round(averageCost * 100) / 100,
          method,
        };
      });

      const totalInventoryValue = valuations.reduce((sum, v) => sum + v.totalValue, 0);

      log.info('Stock valuation calculated:', {
        method,
        itemCount: valuations.length,
        totalValue: totalInventoryValue,
      });

      return {
        method,
        valuations,
        summary: {
          totalItems: valuations.length,
          totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        },
      };
    } catch (error) {
      log.error('Failed to calculate stock valuation:', error);
      throw error;
    }
  }

  /**
   * Get current stock balance for equipment
   */
  async getStockBalance(equipmentId: number) {
    try {
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
        select: {
          id: true,
          name: true,
          serialNumber: true,
          quantity: true,
        },
      });

      if (!equipment) {
        throw new Error('Equipment not found');
      }

      // Get movements for this equipment
      const movements = Array.from(stockMovementsStore.values())
        .filter(m => m.equipmentId === equipmentId)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10); // Last 10 movements

      // Calculate total in/out
      const allMovements = Array.from(stockMovementsStore.values()).filter(
        m => m.equipmentId === equipmentId
      );

      const totalIn = allMovements
        .filter(m => m.type === 'in')
        .reduce((sum, m) => sum + m.quantity, 0);

      const totalOut = allMovements
        .filter(m => m.type === 'out')
        .reduce((sum, m) => sum + m.quantity, 0);

      log.info('Stock balance retrieved:', {
        equipmentId,
        currentQuantity: equipment.quantity,
      });

      return {
        equipment: {
          id: equipment.id,
          name: equipment.name,
          serialNumber: equipment.serialNumber,
        },
        currentQuantity: equipment.quantity || 0,
        totalIn,
        totalOut,
        recentMovements: movements,
      };
    } catch (error) {
      log.error('Failed to get stock balance:', error);
      throw error;
    }
  }

  /**
   * Get low stock alert - equipment with quantity below threshold
   */
  async getLowStockAlert(companyId: number, threshold: number = 5) {
    try {
      const equipment = await prisma.equipment.findMany({
        where: {
          companyId,
          quantity: {
            lte: threshold,
          },
        },
        select: {
          id: true,
          name: true,
          serialNumber: true,
          quantity: true,
          category: true,
        },
        orderBy: {
          quantity: 'asc',
        },
      });

      log.info('Low stock alert retrieved:', {
        threshold,
        itemCount: equipment.length,
      });

      return {
        threshold,
        itemCount: equipment.length,
        items: equipment.map(eq => ({
          id: eq.id,
          name: eq.name,
          serialNumber: eq.serialNumber,
          currentQuantity: eq.quantity || 0,
          category: eq.category,
          status: eq.quantity === 0 ? 'out_of_stock' : 'low_stock',
        })),
      };
    } catch (error) {
      log.error('Failed to get low stock alert:', error);
      throw error;
    }
  }

  /**
   * CHECKS & PROMISSORY NOTES OPERATIONS
   */

  /**
   * Create new check
   */
  async createCheck(data: {
    companyId: number;
    checkNumber: string;
    type: 'received' | 'issued';
    drawer: string;
    bank: string;
    branch?: string;
    accountNumber?: string;
    amount: number;
    issueDate: Date;
    dueDate: Date;
    customerId?: number;
    orderId?: number;
    notes?: string;
  }) {
    try {
      const check = await prisma.check.create({
        data: {
          companyId: data.companyId,
          checkNumber: data.checkNumber,
          type: data.type,
          drawer: data.drawer,
          bank: data.bank,
          branch: data.branch,
          accountNumber: data.accountNumber,
          amount: data.amount,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          status: 'portfolio', // Initial status
          customerId: data.customerId,
          orderId: data.orderId,
          notes: data.notes,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      log.info('Check created:', {
        id: check.id,
        checkNumber: check.checkNumber,
        type: data.type,
        amount: data.amount,
      });

      return check;
    } catch (error) {
      log.error('Failed to create check:', error);
      throw error;
    }
  }

  /**
   * List checks with filters
   */
  async listChecks(
    companyId: number,
    filters: {
      type?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 50
  ) {
    try {
      const where: any = { companyId };

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        where.dueDate = {};
        if (filters.startDate) where.dueDate.gte = filters.startDate;
        if (filters.endDate) where.dueDate.lte = filters.endDate;
      }

      const [checks, total] = await Promise.all([
        prisma.check.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.check.count({ where }),
      ]);

      log.info('Checks listed:', { count: checks.length, total });

      return {
        checks,
        total,
        page,
        limit,
      };
    } catch (error) {
      log.error('Failed to list checks:', error);
      throw error;
    }
  }

  /**
   * Endorse check to another party
   */
  async endorseCheck(checkId: number, endorsedTo: string, notes?: string) {
    try {
      const check = await prisma.check.findUnique({
        where: { id: checkId },
      });

      if (!check) {
        throw new Error('Check not found');
      }

      if (check.status !== 'portfolio') {
        throw new Error('Only portfolio checks can be endorsed');
      }

      const updated = await prisma.check.update({
        where: { id: checkId },
        data: {
          status: 'endorsed',
          notes: notes
            ? `${check.notes || ''}\n\nEndorsed to: ${endorsedTo}. ${notes}`
            : `${check.notes || ''}\n\nEndorsed to: ${endorsedTo}`,
        },
      });

      log.info('Check endorsed:', {
        checkId,
        endorsedTo,
      });

      return updated;
    } catch (error) {
      log.error('Failed to endorse check:', error);
      throw error;
    }
  }

  /**
   * Collect check
   */
  async collectCheck(checkId: number) {
    try {
      const check = await prisma.check.findUnique({
        where: { id: checkId },
      });

      if (!check) {
        throw new Error('Check not found');
      }

      if (!['portfolio', 'endorsed'].includes(check.status)) {
        throw new Error('Only portfolio or endorsed checks can be collected');
      }

      const updated = await prisma.check.update({
        where: { id: checkId },
        data: {
          status: 'collected',
        },
      });

      log.info('Check collected:', { checkId });

      return updated;
    } catch (error) {
      log.error('Failed to collect check:', error);
      throw error;
    }
  }

  /**
   * Mark check as bounced
   */
  async bounceCheck(checkId: number, reason?: string) {
    try {
      const check = await prisma.check.findUnique({
        where: { id: checkId },
      });

      if (!check) {
        throw new Error('Check not found');
      }

      const updated = await prisma.check.update({
        where: { id: checkId },
        data: {
          status: 'bounced',
          notes: reason
            ? `${check.notes || ''}\n\nBounced: ${reason}`
            : `${check.notes || ''}\n\nBounced`,
        },
      });

      log.info('Check bounced:', { checkId, reason });

      return updated;
    } catch (error) {
      log.error('Failed to bounce check:', error);
      throw error;
    }
  }

  /**
   * Create promissory note
   */
  async createPromissoryNote(data: {
    companyId: number;
    noteNumber: string;
    type: 'received' | 'issued';
    drawer: string;
    amount: number;
    issueDate: Date;
    dueDate: Date;
    aval?: string;
    customerId?: number;
    notes?: string;
  }) {
    try {
      const note = await prisma.promissoryNote.create({
        data: {
          companyId: data.companyId,
          noteNumber: data.noteNumber,
          type: data.type,
          drawer: data.drawer,
          amount: data.amount,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          status: 'portfolio', // Initial status
          aval: data.aval,
          customerId: data.customerId,
          notes: data.notes,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      log.info('Promissory note created:', {
        id: note.id,
        noteNumber: note.noteNumber,
        type: data.type,
        amount: data.amount,
      });

      return note;
    } catch (error) {
      log.error('Failed to create promissory note:', error);
      throw error;
    }
  }

  /**
   * List promissory notes with filters
   */
  async listPromissoryNotes(
    companyId: number,
    filters: {
      type?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 50
  ) {
    try {
      const where: any = { companyId };

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        where.dueDate = {};
        if (filters.startDate) where.dueDate.gte = filters.startDate;
        if (filters.endDate) where.dueDate.lte = filters.endDate;
      }

      const [notes, total] = await Promise.all([
        prisma.promissoryNote.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.promissoryNote.count({ where }),
      ]);

      log.info('Promissory notes listed:', { count: notes.length, total });

      return {
        notes,
        total,
        page,
        limit,
      };
    } catch (error) {
      log.error('Failed to list promissory notes:', error);
      throw error;
    }
  }

  /**
   * Get checks and promissory notes due soon
   */
  async getDueSoon(companyId: number, days: number = 30) {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const [checks, notes] = await Promise.all([
        prisma.check.findMany({
          where: {
            companyId,
            dueDate: {
              gte: today,
              lte: futureDate,
            },
            status: {
              in: ['portfolio', 'endorsed'],
            },
          },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
        }),
        prisma.promissoryNote.findMany({
          where: {
            companyId,
            dueDate: {
              gte: today,
              lte: futureDate,
            },
            status: {
              in: ['portfolio'],
            },
          },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
        }),
      ]);

      const totalAmount =
        checks.reduce((sum, c) => sum + c.amount, 0) +
        notes.reduce((sum, n) => sum + n.amount, 0);

      log.info('Due soon items retrieved:', {
        checkCount: checks.length,
        noteCount: notes.length,
        totalAmount,
      });

      return {
        checks: checks.map(c => ({
          id: c.id,
          type: 'check',
          number: c.checkNumber,
          drawer: c.drawer,
          bank: c.bank,
          amount: c.amount,
          dueDate: c.dueDate,
          daysUntilDue: Math.ceil(
            (c.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          ),
          status: c.status,
          customer: c.customer,
        })),
        promissoryNotes: notes.map(n => ({
          id: n.id,
          type: 'promissory_note',
          number: n.noteNumber,
          drawer: n.drawer,
          amount: n.amount,
          dueDate: n.dueDate,
          daysUntilDue: Math.ceil(
            (n.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          ),
          status: n.status,
          customer: n.customer,
        })),
        summary: {
          totalChecks: checks.length,
          totalNotes: notes.length,
          totalAmount: Math.round(totalAmount * 100) / 100,
        },
      };
    } catch (error) {
      log.error('Failed to get due soon items:', error);
      throw error;
    }
  }
}

export const accountingService = new AccountingService();
