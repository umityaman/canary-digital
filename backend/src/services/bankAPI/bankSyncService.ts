import { prisma } from '../../database';
import { bankManager, BankCode } from './bankManager';
import { BankAccount, BankTransaction } from './baseBankService';
import logger from '../../config/logger';

/**
 * Bank Synchronization Service
 * 
 * Automatically syncs bank data to database:
 * - Account balances
 * - Transaction history
 * - Scheduled sync jobs
 */

interface SyncResult {
  success: boolean;
  bankCode: string;
  accountsSynced: number;
  transactionsSynced: number;
  errors: string[];
  duration: number;
}

export class BankSyncService {
  /**
   * Sync all accounts for a bank
   */
  async syncAccounts(bankCode: BankCode, companyId: number): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let accountsSynced = 0;

    try {
      logger.info(`Starting account sync for ${bankCode}`);

      // Get bank service
      const bankService = bankManager.getBank(bankCode);

      // Fetch accounts from bank
      const response = await bankService.getAccounts();

      if (!response.success || !response.accounts) {
        throw new Error(response.errorMessage || 'Failed to fetch accounts');
      }

      // Sync each account to database
      for (const account of response.accounts) {
        try {
          await this.syncAccount(account, bankCode, companyId);
          accountsSynced++;
        } catch (error: any) {
          logger.error(`Failed to sync account ${account.accountNumber}`, { error });
          errors.push(`Account ${account.accountNumber}: ${error.message}`);
        }
      }

      const duration = Date.now() - startTime;

      logger.info(`Account sync completed for ${bankCode}`, {
        accountsSynced,
        duration,
        errors: errors.length,
      });

      return {
        success: errors.length === 0,
        bankCode,
        accountsSynced,
        transactionsSynced: 0,
        errors,
        duration,
      };
    } catch (error: any) {
      logger.error(`Account sync failed for ${bankCode}`, { error });
      
      return {
        success: false,
        bankCode,
        accountsSynced,
        transactionsSynced: 0,
        errors: [error.message],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Sync single account to database
   */
  private async syncAccount(
    account: BankAccount,
    bankCode: string,
    companyId: number
  ): Promise<void> {
    await prisma.bankAccount.upsert({
      where: {
        iban: account.iban,
      },
      update: {
        accountNumber: account.accountNumber,
        // accountName: account.accountName, // FIXED: Field doesn't exist in BankAccount schema
        accountType: account.accountType,
        currency: account.currency || 'TRY', // FIXED: Field exists in schema
        balance: account.balance,
        availableBalance: account.availableBalance,
        // blockedAmount: account.blockedAmount, // FIXED: Field doesn't exist in BankAccount schema
        branchCode: account.branchCode,
        branch: account.branchName, // FIXED: Field is 'branch' not 'branchName'
        isActive: account.status === 'ACTIVE',
        // lastSyncAt: new Date(), // FIXED: Field doesn't exist in BankAccount schema
      },
      create: {
        companyId,
        bankName: bankCode,
        accountNumber: account.accountNumber,
        iban: account.iban,
        // accountName: account.accountName, // FIXED: Field doesn't exist in BankAccount schema
        accountType: account.accountType,
        currency: account.currency || 'TRY', // FIXED: Field exists in schema
        balance: account.balance,
        availableBalance: account.availableBalance,
        // blockedAmount: account.blockedAmount, // FIXED: Field doesn't exist in BankAccount schema
        branchCode: account.branchCode,
        branch: account.branchName, // FIXED: Field is 'branch' not 'branchName'
        isActive: account.status === 'ACTIVE',
        // lastSyncAt: new Date(), // FIXED: Field doesn't exist in BankAccount schema
      },
    });
  }

  /**
   * Sync transactions for an account
   */
  async syncTransactions(
    bankCode: BankCode,
    accountId: string,
    startDate: Date,
    endDate: Date,
    companyId: number
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let transactionsSynced = 0;

    try {
      logger.info(`Starting transaction sync for ${bankCode} - Account ${accountId}`, {
        startDate,
        endDate,
      });

      // Get bank service
      const bankService = bankManager.getBank(bankCode);

      // Get our database account
      const dbAccount = await prisma.bankAccount.findFirst({
        where: {
          accountNumber: accountId,
          companyId,
        },
      });

      if (!dbAccount) {
        throw new Error(`Account not found in database: ${accountId}`);
      }

      // Fetch transactions from bank
      const response = await bankService.getTransactionHistory({
        accountId,
        startDate,
        endDate,
        page: 1,
        limit: 1000, // Max per request
      });

      if (!response.success || !response.transactions) {
        throw new Error(response.errorMessage || 'Failed to fetch transactions');
      }

      // Sync each transaction
      for (const transaction of response.transactions) {
        try {
          await this.syncTransaction(transaction, dbAccount.id, companyId);
          transactionsSynced++;
        } catch (error: any) {
          logger.error(`Failed to sync transaction ${transaction.transactionId}`, { error });
          errors.push(`Transaction ${transaction.transactionId}: ${error.message}`);
        }
      }

      const duration = Date.now() - startTime;

      logger.info(`Transaction sync completed for ${bankCode}`, {
        transactionsSynced,
        duration,
        errors: errors.length,
      });

      return {
        success: errors.length === 0,
        bankCode,
        accountsSynced: 0,
        transactionsSynced,
        errors,
        duration,
      };
    } catch (error: any) {
      logger.error(`Transaction sync failed for ${bankCode}`, { error });
      
      return {
        success: false,
        bankCode,
        accountsSynced: 0,
        transactionsSynced,
        errors: [error.message],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Sync single transaction to database
   */
  private async syncTransaction(
    transaction: BankTransaction,
    bankAccountId: number,
    companyId: number
  ): Promise<void> {
    // Check if transaction already exists
    const existing = await prisma.bankTransaction.findFirst({
      where: {
        transactionNumber: transaction.transactionId,
        accountId: bankAccountId,
      },
    });

    if (existing) {
      logger.debug(`Transaction already exists: ${transaction.transactionId}`);
      return;
    }

    // Create new transaction
    await prisma.bankTransaction.create({
      data: {
        accountId: bankAccountId,
        transactionNumber: transaction.transactionId,
        date: transaction.transactionDate,
        valueDate: transaction.valueDate,
        description: transaction.description,
        amount: transaction.amount,
        // currency: transaction.currency, // FIXED: Field doesn't exist in BankTransaction schema
        type: transaction.transactionType,
        category: transaction.category,
        reference: transaction.reference,
        // balance: transaction.balance, // FIXED: Field doesn't exist in BankTransaction schema
        counterParty: transaction.counterpartyName, // FIXED: Field name is counterParty not counterpartyName
        // counterpartyAccount: transaction.counterpartyAccount, // FIXED: Field doesn't exist
        // counterpartyIban: transaction.counterpartyIban, // FIXED: Field doesn't exist
        // channel: transaction.channel, // FIXED: Field doesn't exist in BankTransaction schema
        status: 'COMPLETED',
        isReconciled: false,
      },
    });
  }

  /**
   * Sync all registered banks
   */
  async syncAllBanks(companyId: number): Promise<SyncResult[]> {
    const banks = bankManager.getRegisteredBanks();
    const results: SyncResult[] = [];

    logger.info(`Starting sync for all banks`, { banks, companyId });

    for (const bankCode of banks) {
      try {
        const result = await this.syncAccounts(bankCode, companyId);
        results.push(result);
      } catch (error: any) {
        logger.error(`Failed to sync ${bankCode}`, { error });
        results.push({
          success: false,
          bankCode,
          accountsSynced: 0,
          transactionsSynced: 0,
          errors: [error.message],
          duration: 0,
        });
      }
    }

    logger.info(`All banks sync completed`, {
      totalBanks: banks.length,
      successful: results.filter(r => r.success).length,
    });

    return results;
  }

  /**
   * Sync transactions for all accounts (last 7 days)
   */
  async syncAllTransactions(companyId: number, days: number = 7): Promise<SyncResult[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    logger.info(`Starting transaction sync for all accounts`, {
      companyId,
      startDate,
      endDate,
    });

    // Get all active accounts
    const accounts = await prisma.bankAccount.findMany({
      where: {
        companyId,
        isActive: true,
      },
    });

    const results: SyncResult[] = [];

    for (const account of accounts) {
      try {
        const result = await this.syncTransactions(
          account.bankName as BankCode,
          account.accountNumber,
          startDate,
          endDate,
          companyId
        );
        results.push(result);
      } catch (error: any) {
        logger.error(`Failed to sync transactions for ${account.accountNumber}`, { error });
        results.push({
          success: false,
          bankCode: account.bankName,
          accountsSynced: 0,
          transactionsSynced: 0,
          errors: [error.message],
          duration: 0,
        });
      }
    }

    logger.info(`All transactions sync completed`, {
      totalAccounts: accounts.length,
      successful: results.filter(r => r.success).length,
    });

    return results;
  }

  /**
   * Schedule automatic sync (call this from cron job)
   */
  async scheduledSync(companyId: number): Promise<void> {
    logger.info(`Running scheduled sync for company ${companyId}`);

    try {
      // Sync accounts first
      const accountResults = await this.syncAllBanks(companyId);
      
      // Then sync transactions (last 7 days)
      const transactionResults = await this.syncAllTransactions(companyId, 7);

      // Log summary
      const totalAccountsSynced = accountResults.reduce((sum, r) => sum + r.accountsSynced, 0);
      const totalTransactionsSynced = transactionResults.reduce((sum, r) => sum + r.transactionsSynced, 0);
      const totalErrors = [...accountResults, ...transactionResults].reduce(
        (sum, r) => sum + r.errors.length, 
        0
      );

      logger.info(`Scheduled sync completed`, {
        companyId,
        accountsSynced: totalAccountsSynced,
        transactionsSynced: totalTransactionsSynced,
        errors: totalErrors,
      });

      // Update last sync timestamp
      await prisma.company.update({
        where: { id: companyId },
        data: {
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      logger.error(`Scheduled sync failed`, { companyId, error });
      throw error;
    }
  }
}

export const bankSyncService = new BankSyncService();
export default bankSyncService;
