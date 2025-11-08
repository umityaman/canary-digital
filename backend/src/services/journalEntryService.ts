import { PrismaClient } from '@prisma/client';
import { log } from '../config/logger';

const prisma = new PrismaClient();

/**
 * Hesap Kodları Mapping
 * Türk Muhasebe Sistemi (Tekdüzen Hesap Planı)
 */
export const ACCOUNT_CODES = {
  // 100 - KASA
  CASH: '100.001',
  
  // 102 - BANKALAR
  BANK: '102.001',
  
  // 120 - ALICILAR (Müşteriler)
  ACCOUNTS_RECEIVABLE: '120.001',
  
  // 320 - SATICILAR (Tedarikçiler)
  ACCOUNTS_PAYABLE: '320.001',
  
  // 600 - YURTİÇİ SATIŞLAR
  SALES_REVENUE: '600.001',
  
  // 620 - DİĞER GELİRLER
  OTHER_INCOME: '620.001',
  
  // 770 - GENEL YÖNETİM GİDERLERİ
  GENERAL_EXPENSES: '770.001',
  
  // 391 - HESAPLANAN KDV
  VAT_PAYABLE: '391.001',
  
  // 391.02 - İNDİRİLECEK KDV
  VAT_RECEIVABLE: '391.002',
};

interface JournalEntryItem {
  accountCode: string;
  accountId?: number;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  customerId?: number;
  supplierId?: number;
}

interface CreateJournalEntryParams {
  companyId: number;
  entryDate: Date;
  entryType: 'manual' | 'auto_invoice' | 'auto_payment' | 'auto_expense';
  description: string;
  items: JournalEntryItem[];
  reference?: string;
  referenceId?: number;
  createdBy?: number;
}

/**
 * Journal Entry Service
 * Otomatik ve manuel muhasebe fişi oluşturma
 */
export class JournalEntryService {
  /**
   * Yevmiye fişi oluştur
   */
  async createJournalEntry(params: CreateJournalEntryParams) {
    try {
      log.info('JournalEntry Service: Yevmiye fişi oluşturuluyor...', {
        type: params.entryType,
        itemCount: params.items.length,
      });

      // Debit/Credit dengesi kontrolü
      const totalDebit = params.items.reduce((sum, item) => sum + item.debitAmount, 0);
      const totalCredit = params.items.reduce((sum, item) => sum + item.creditAmount, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(
          `Journal entry not balanced! Debit: ${totalDebit}, Credit: ${totalCredit}`
        );
      }

      // Hesap kodlarından account ID'leri bul
      const itemsWithAccountIds = await Promise.all(
        params.items.map(async (item) => {
          if (item.accountId) {
            return item;
          }

          // Hesap kodundan account ID bul
          const account = await prisma.chartOfAccounts.findFirst({
            where: {
              code: item.accountCode,
              companyId: params.companyId,
            },
          });

          if (!account) {
            // Hesap yoksa oluştur (otomatik)
            log.warn('JournalEntry Service: Hesap bulunamadı, oluşturuluyor:', item.accountCode);
            const newAccount = await this.createAccountIfNotExists(
              params.companyId,
              item.accountCode
            );
            return { ...item, accountId: newAccount.id };
          }

          return { ...item, accountId: account.id };
        })
      );

      // Entry number oluştur
      const lastEntry = await prisma.journalEntry.findFirst({
        where: { companyId: params.companyId },
        orderBy: { entryNumber: 'desc' },
      });

      const entryNumber = lastEntry
        ? `YF-${(parseInt(lastEntry.entryNumber.split('-')[1]) + 1).toString().padStart(6, '0')}`
        : 'YF-000001';

      // Yevmiye fişini oluştur
      const journalEntry = await prisma.journalEntry.create({
        data: {
          companyId: params.companyId,
          entryNumber,
          entryDate: params.entryDate,
          entryType: params.entryType,
          description: params.description,
          totalDebit: totalDebit,
          totalCredit: totalCredit,
          reference: params.reference,
          referenceId: params.referenceId,
          createdBy: params.createdBy,
          journalEntryItems: {
            create: itemsWithAccountIds.map((item) => ({
              accountId: item.accountId!,
              debitAmount: item.debitAmount,
              creditAmount: item.creditAmount,
              description: item.description || params.description,
              customerId: item.customerId,
              supplierId: item.supplierId,
            })),
          },
        },
        include: {
          journalEntryItems: {
            include: {
              account: true,
            },
          },
        },
      });

      // ChartOfAccounts bakiyelerini güncelle
      for (const item of itemsWithAccountIds) {
        await this.updateAccountBalance(item.accountId!, item.debitAmount, item.creditAmount);
      }

      log.info('JournalEntry Service: Yevmiye fişi oluşturuldu:', {
        entryNumber: journalEntry.entryNumber,
        totalDebit,
        totalCredit,
      });

      return journalEntry;
    } catch (error) {
      log.error('JournalEntry Service: Yevmiye fişi oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Fatura için otomatik yevmiye fişi
   */
  async createInvoiceEntry(
    invoiceId: number,
    companyId: number,
    customerId: number,
    totalAmount: number,
    vatAmount: number,
    invoiceNumber: string
  ) {
    try {
      log.info('JournalEntry Service: Fatura için yevmiye fişi oluşturuluyor...', {
        invoiceId,
        totalAmount,
      });

      const netAmount = totalAmount - vatAmount;

      return await this.createJournalEntry({
        companyId,
        entryDate: new Date(),
        entryType: 'auto_invoice',
        description: `Satış Faturası - ${invoiceNumber}`,
        reference: `INV-${invoiceNumber}`,
        referenceId: invoiceId,
        items: [
          {
            // Borç: Alıcılar (Müşteri borçlandı)
            accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
            debitAmount: totalAmount,
            creditAmount: 0,
            description: `Satış faturası ${invoiceNumber}`,
            customerId,
          },
          {
            // Alacak: Satışlar (Satış geliri)
            accountCode: ACCOUNT_CODES.SALES_REVENUE,
            debitAmount: 0,
            creditAmount: netAmount,
            description: `Satış geliri ${invoiceNumber}`,
          },
          {
            // Alacak: Hesaplanan KDV
            accountCode: ACCOUNT_CODES.VAT_PAYABLE,
            debitAmount: 0,
            creditAmount: vatAmount,
            description: `KDV ${invoiceNumber}`,
          },
        ],
      });
    } catch (error) {
      log.error('JournalEntry Service: Fatura yevmiye fişi oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Ödeme için otomatik yevmiye fişi
   */
  async createPaymentEntry(
    paymentId: number,
    invoiceId: number,
    companyId: number,
    customerId: number,
    amount: number,
    paymentMethod: string,
    invoiceNumber: string
  ) {
    try {
      log.info('JournalEntry Service: Ödeme için yevmiye fişi oluşturuluyor...', {
        paymentId,
        amount,
        method: paymentMethod,
      });

      // Ödeme metoduna göre hesap kodu belirle
      const cashAccountCode =
        paymentMethod === 'cash' ? ACCOUNT_CODES.CASH : ACCOUNT_CODES.BANK;

      return await this.createJournalEntry({
        companyId,
        entryDate: new Date(),
        entryType: 'auto_payment',
        description: `Ödeme Alındı - Fatura ${invoiceNumber}`,
        reference: `PAY-${paymentId}`,
        referenceId: paymentId,
        items: [
          {
            // Borç: Kasa veya Banka (Para alındı)
            accountCode: cashAccountCode,
            debitAmount: amount,
            creditAmount: 0,
            description: `${paymentMethod === 'cash' ? 'Kasa' : 'Banka'} ödeme alındı`,
          },
          {
            // Alacak: Alıcılar (Müşteri borcu azaldı)
            accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
            debitAmount: 0,
            creditAmount: amount,
            description: `Müşteri ödemesi - Fatura ${invoiceNumber}`,
            customerId,
          },
        ],
      });
    } catch (error) {
      log.error('JournalEntry Service: Ödeme yevmiye fişi oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Gider için otomatik yevmiye fişi
   */
  async createExpenseEntry(
    expenseId: number,
    companyId: number,
    supplierId: number | undefined,
    amount: number,
    vatAmount: number,
    description: string
  ) {
    try {
      log.info('JournalEntry Service: Gider için yevmiye fişi oluşturuluyor...', {
        expenseId,
        amount,
      });

      const netAmount = amount - vatAmount;

      return await this.createJournalEntry({
        companyId,
        entryDate: new Date(),
        entryType: 'auto_expense',
        description: `Gider Kaydı - ${description}`,
        reference: `EXP-${expenseId}`,
        referenceId: expenseId,
        items: [
          {
            // Borç: Giderler
            accountCode: ACCOUNT_CODES.GENERAL_EXPENSES,
            debitAmount: netAmount,
            creditAmount: 0,
            description: `Gider - ${description}`,
          },
          {
            // Borç: İndirilecek KDV
            accountCode: ACCOUNT_CODES.VAT_RECEIVABLE,
            debitAmount: vatAmount,
            creditAmount: 0,
            description: `İndirilecek KDV - ${description}`,
          },
          {
            // Alacak: Satıcılar veya Kasa
            accountCode: supplierId ? ACCOUNT_CODES.ACCOUNTS_PAYABLE : ACCOUNT_CODES.CASH,
            debitAmount: 0,
            creditAmount: amount,
            description: supplierId ? `Tedarikçi borcu` : `Nakit ödeme`,
            supplierId,
          },
        ],
      });
    } catch (error) {
      log.error('JournalEntry Service: Gider yevmiye fişi oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Hesap bakiyesini güncelle
   */
  private async updateAccountBalance(accountId: number, debitAmount: number, creditAmount: number) {
    try {
      const account = await prisma.chartOfAccounts.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return;
      }

      const newTotalDebit = account.totalDebit + debitAmount;
      const newTotalCredit = account.totalCredit + creditAmount;
      const newBalance = newTotalDebit - newTotalCredit;

      await prisma.chartOfAccounts.update({
        where: { id: accountId },
        data: {
          totalDebit: newTotalDebit,
          totalCredit: newTotalCredit,
          balance: newBalance,
        },
      });

      log.info('JournalEntry Service: Hesap bakiyesi güncellendi:', {
        accountId,
        accountCode: account.code,
        newBalance,
      });
    } catch (error) {
      log.error('JournalEntry Service: Hesap bakiyesi güncellenemedi:', error);
    }
  }

  /**
   * Hesap yoksa oluştur (otomatik)
   */
  private async createAccountIfNotExists(companyId: number, accountCode: string) {
    try {
      // Hesap adı ve tipini koda göre belirle
      const accountInfo = this.getAccountInfo(accountCode);

      const account = await prisma.chartOfAccounts.create({
        data: {
          companyId,
          code: accountCode,
          name: accountInfo.name,
          accountType: accountInfo.type,
          currency: 'TRY',
          isActive: true,
          totalDebit: 0,
          totalCredit: 0,
          balance: 0,
        },
      });

      log.info('JournalEntry Service: Yeni hesap oluşturuldu:', {
        code: accountCode,
        name: accountInfo.name,
      });

      return account;
    } catch (error) {
      log.error('JournalEntry Service: Hesap oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Hesap kodu bilgilerini getir
   */
  private getAccountInfo(code: string): { name: string; type: string } {
    const accountMap: Record<string, { name: string; type: string }> = {
      [ACCOUNT_CODES.CASH]: { name: 'Kasa', type: 'asset' },
      [ACCOUNT_CODES.BANK]: { name: 'Bankalar', type: 'asset' },
      [ACCOUNT_CODES.ACCOUNTS_RECEIVABLE]: { name: 'Alıcılar', type: 'asset' },
      [ACCOUNT_CODES.ACCOUNTS_PAYABLE]: { name: 'Satıcılar', type: 'liability' },
      [ACCOUNT_CODES.SALES_REVENUE]: { name: 'Yurtiçi Satışlar', type: 'income' },
      [ACCOUNT_CODES.OTHER_INCOME]: { name: 'Diğer Gelirler', type: 'income' },
      [ACCOUNT_CODES.GENERAL_EXPENSES]: { name: 'Genel Yönetim Giderleri', type: 'expense' },
      [ACCOUNT_CODES.VAT_PAYABLE]: { name: 'Hesaplanan KDV', type: 'liability' },
      [ACCOUNT_CODES.VAT_RECEIVABLE]: { name: 'İndirilecek KDV', type: 'asset' },
    };

    return (
      accountMap[code] || {
        name: `Hesap ${code}`,
        type: 'asset',
      }
    );
  }
}

export default new JournalEntryService();
