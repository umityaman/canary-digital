import { prisma } from '../index';

/**
 * Account Card Service
 * Cari hesap kartları yönetimi - müşteri/tedarikçi borç-alacak takibi
 */

interface AccountCardInput {
  name: string;
  type: 'customer' | 'supplier' | 'both';
  code?: string;
  taxNumber?: string;
  taxOffice?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  notes?: string;
  creditLimit?: number;
  paymentTerm?: number; // days
  discountRate?: number;
  isActive?: boolean;
}

interface TransactionInput {
  accountCardId: number;
  type: 'debit' | 'credit'; // Borç/Alacak
  amount: number;
  date: Date;
  description: string;
  referenceType?: 'invoice' | 'payment' | 'expense' | 'manual';
  referenceId?: number;
  dueDate?: Date;
}

interface AgeAnalysisResult {
  current: number;      // 0-30 gün
  days30: number;       // 31-60 gün
  days60: number;       // 61-90 gün
  days90: number;       // 90+ gün
  total: number;
}

export class AccountCardService {
  
  /**
   * Cari hesap kartı oluştur
   */
  async create(data: AccountCardInput, companyId: number, userId: number) {
    try {
      // Otomatik cari kodu oluştur (eğer yoksa)
      if (!data.code) {
        const lastCard = await prisma.accountCard.findFirst({
          where: { companyId },
          orderBy: { id: 'desc' }
        });

        const nextNumber = lastCard ? lastCard.id + 1 : 1;
        const prefix = data.type === 'customer' ? 'M' : data.type === 'supplier' ? 'T' : 'C';
        data.code = `${prefix}-${String(nextNumber).padStart(5, '0')}`;
      }

      const accountCard = await prisma.accountCard.create({
        data: {
          ...data,
          companyId,
          createdBy: userId,
          balance: 0, // Başlangıç bakiyesi
        },
      });

      return accountCard;
    } catch (error) {
      console.error('Error creating account card:', error);
      throw new Error('Cari hesap kartı oluşturulamadı');
    }
  }

  /**
   * Cari hesap kartlarını listele
   */
  async list(companyId: number, filters?: {
    type?: string;
    search?: string;
    isActive?: boolean;
    hasBalance?: boolean;
  }) {
    try {
      const where: any = { companyId };

      if (filters?.type) {
        where.type = filters.type;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { code: { contains: filters.search, mode: 'insensitive' } },
          { taxNumber: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters?.hasBalance) {
        where.NOT = { balance: 0 };
      }

      const accountCards = await prisma.accountCard.findMany({
        where,
        include: {
          _count: {
            select: {
              transactions: true,
              invoices: true,
              expenses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return accountCards;
    } catch (error) {
      console.error('Error listing account cards:', error);
      throw new Error('Cari hesap kartları listelenemedi');
    }
  }

  /**
   * Cari hesap kartı detayı
   */
  async getById(id: number, companyId: number) {
    try {
      const accountCard = await prisma.accountCard.findFirst({
        where: { id, companyId },
        include: {
          transactions: {
            orderBy: { date: 'desc' },
            take: 50, // Son 50 işlem
          },
          invoices: {
            orderBy: { invoiceDate: 'desc' },
            take: 20,
          },
          expenses: {
            orderBy: { date: 'desc' },
            take: 20,
          },
          _count: {
            select: {
              transactions: true,
              invoices: true,
              expenses: true,
            },
          },
        },
      });

      if (!accountCard) {
        throw new Error('Cari hesap kartı bulunamadı');
      }

      return accountCard;
    } catch (error) {
      console.error('Error getting account card:', error);
      throw error;
    }
  }

  /**
   * Cari hesap kartı güncelle
   */
  async update(id: number, data: Partial<AccountCardInput>, companyId: number) {
    try {
      const existing = await prisma.accountCard.findFirst({
        where: { id, companyId },
      });

      if (!existing) {
        throw new Error('Cari hesap kartı bulunamadı');
      }

      const updated = await prisma.accountCard.update({
        where: { id },
        data,
      });

      return updated;
    } catch (error) {
      console.error('Error updating account card:', error);
      throw error;
    }
  }

  /**
   * Cari hesap kartı sil
   */
  async delete(id: number, companyId: number) {
    try {
      const existing = await prisma.accountCard.findFirst({
        where: { id, companyId },
        include: {
          _count: {
            select: {
              transactions: true,
              invoices: true,
              expenses: true,
            },
          },
        },
      });

      if (!existing) {
        throw new Error('Cari hesap kartı bulunamadı');
      }

      // İşlem varsa silme
      const hasTransactions = 
        existing._count.transactions > 0 || 
        existing._count.invoices > 0 || 
        existing._count.expenses > 0;

      if (hasTransactions) {
        throw new Error('İşlem geçmişi olan cari hesap kartı silinemez. Pasif yapabilirsiniz.');
      }

      await prisma.accountCard.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting account card:', error);
      throw error;
    }
  }

  /**
   * Manuel işlem kaydet (borç/alacak)
   */
  async addTransaction(data: TransactionInput, companyId: number, userId: number) {
    try {
      const accountCard = await prisma.accountCard.findFirst({
        where: { id: data.accountCardId, companyId },
      });

      if (!accountCard) {
        throw new Error('Cari hesap kartı bulunamadı');
      }

      // İşlem oluştur
      const transaction = await prisma.accountCardTransaction.create({
        data: {
          accountCardId: data.accountCardId,
          type: data.type,
          amount: data.amount,
          date: data.date,
          description: data.description,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          dueDate: data.dueDate,
          createdBy: userId,
        },
      });

      // Bakiye güncelle
      const newBalance = data.type === 'debit' 
        ? accountCard.balance + data.amount  // Borç artırır
        : accountCard.balance - data.amount; // Alacak azaltır

      await prisma.accountCard.update({
        where: { id: data.accountCardId },
        data: { balance: newBalance },
      });

      return transaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  /**
   * Bakiye hesapla (güncel)
   */
  async calculateBalance(accountCardId: number, companyId: number) {
    try {
      const accountCard = await prisma.accountCard.findFirst({
        where: { id: accountCardId, companyId },
      });

      if (!accountCard) {
        throw new Error('Cari hesap kartı bulunamadı');
      }

      // Tüm işlemleri topla
      const transactions = await prisma.accountCardTransaction.findMany({
        where: { accountCardId },
      });

      let balance = 0;
      transactions.forEach(t => {
        if (t.type === 'debit') {
          balance += t.amount;
        } else {
          balance -= t.amount;
        }
      });

      // Bakiye güncelle
      await prisma.accountCard.update({
        where: { id: accountCardId },
        data: { balance },
      });

      return { balance, transactionCount: transactions.length };
    } catch (error) {
      console.error('Error calculating balance:', error);
      throw error;
    }
  }

  /**
   * Yaşlandırma analizi (Aging Analysis)
   * Vadeleri geçmiş alacakları 30-60-90 gün dilimleriyle gösterir
   */
  async getAgeAnalysis(accountCardId: number, companyId: number): Promise<AgeAnalysisResult> {
    try {
      const accountCard = await prisma.accountCard.findFirst({
        where: { id: accountCardId, companyId },
      });

      if (!accountCard) {
        throw new Error('Cari hesap kartı bulunamadı');
      }

      const today = new Date();
      
      // Vadesi geçmiş borçları getir
      const overdueTransactions = await prisma.accountCardTransaction.findMany({
        where: {
          accountCardId,
          type: 'debit', // Sadece borçlar
          dueDate: { lt: today }, // Vadesi geçmiş
        },
      });

      const analysis: AgeAnalysisResult = {
        current: 0,
        days30: 0,
        days60: 0,
        days90: 0,
        total: 0,
      };

      overdueTransactions.forEach(t => {
        if (!t.dueDate) return;

        const daysDiff = Math.floor((today.getTime() - t.dueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 30) {
          analysis.current += t.amount;
        } else if (daysDiff <= 60) {
          analysis.days30 += t.amount;
        } else if (daysDiff <= 90) {
          analysis.days60 += t.amount;
        } else {
          analysis.days90 += t.amount;
        }

        analysis.total += t.amount;
      });

      return analysis;
    } catch (error) {
      console.error('Error getting age analysis:', error);
      throw error;
    }
  }

  /**
   * Tüm cariler için yaşlandırma özeti
   */
  async getAgeAnalysisSummary(companyId: number) {
    try {
      const accountCards = await prisma.accountCard.findMany({
        where: { 
          companyId,
          isActive: true,
          balance: { gt: 0 }, // Borcu olanlar
        },
      });

      const summary = {
        current: 0,
        days30: 0,
        days60: 0,
        days90: 0,
        total: 0,
        accountCount: 0,
      };

      for (const card of accountCards) {
        const analysis = await this.getAgeAnalysis(card.id, companyId);
        summary.current += analysis.current;
        summary.days30 += analysis.days30;
        summary.days60 += analysis.days60;
        summary.days90 += analysis.days90;
        summary.total += analysis.total;
        if (analysis.total > 0) summary.accountCount++;
      }

      return summary;
    } catch (error) {
      console.error('Error getting age analysis summary:', error);
      throw error;
    }
  }

  /**
   * İstatistikler
   */
  async getStats(companyId: number) {
    try {
      const total = await prisma.accountCard.count({ where: { companyId } });
      
      const customers = await prisma.accountCard.count({ 
        where: { companyId, type: { in: ['customer', 'both'] } } 
      });
      
      const suppliers = await prisma.accountCard.count({ 
        where: { companyId, type: { in: ['supplier', 'both'] } } 
      });

      const active = await prisma.accountCard.count({ 
        where: { companyId, isActive: true } 
      });

      // Toplam borç-alacak
      const allCards = await prisma.accountCard.findMany({
        where: { companyId },
        select: { balance: true },
      });

      const totalDebit = allCards
        .filter(c => c.balance > 0)
        .reduce((sum, c) => sum + c.balance, 0);

      const totalCredit = allCards
        .filter(c => c.balance < 0)
        .reduce((sum, c) => sum + Math.abs(c.balance), 0);

      return {
        total,
        customers,
        suppliers,
        active,
        totalDebit,
        totalCredit,
        netBalance: totalDebit - totalCredit,
      };
    } catch (error) {
      console.error('Error getting account card stats:', error);
      throw new Error('İstatistikler alınamadı');
    }
  }

  /**
   * En çok borçlu cariler (Top 10)
   */
  async getTopDebtors(companyId: number, limit: number = 10) {
    try {
      const debtors = await prisma.accountCard.findMany({
        where: {
          companyId,
          balance: { gt: 0 },
        },
        orderBy: { balance: 'desc' },
        take: limit,
      });

      return debtors;
    } catch (error) {
      console.error('Error getting top debtors:', error);
      throw error;
    }
  }

  /**
   * İşlem geçmişi raporu
   */
  async getTransactionReport(accountCardId: number, companyId: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    type?: 'debit' | 'credit';
  }) {
    try {
      const accountCard = await prisma.accountCard.findFirst({
        where: { id: accountCardId, companyId },
      });

      if (!accountCard) {
        throw new Error('Cari hesap kartı bulunamadı');
      }

      const where: any = { accountCardId };

      if (filters?.startDate && filters?.endDate) {
        where.date = {
          gte: filters.startDate,
          lte: filters.endDate,
        };
      }

      if (filters?.type) {
        where.type = filters.type;
      }

      const transactions = await prisma.accountCardTransaction.findMany({
        where,
        orderBy: { date: 'asc' },
      });

      // Running balance hesapla
      let runningBalance = 0;
      const transactionsWithBalance = transactions.map(t => {
        if (t.type === 'debit') {
          runningBalance += t.amount;
        } else {
          runningBalance -= t.amount;
        }

        return {
          ...t,
          runningBalance,
        };
      });

      return {
        accountCard,
        transactions: transactionsWithBalance,
        summary: {
          totalDebit: transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
          totalCredit: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
          currentBalance: runningBalance,
        },
      };
    } catch (error) {
      console.error('Error getting transaction report:', error);
      throw error;
    }
  }
}

export const accountCardService = new AccountCardService();
