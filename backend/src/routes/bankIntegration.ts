import { Router } from 'express';
import { bankManager, BankCode } from '../services/bankAPI/bankManager';
import { bankSyncService } from '../services/bankAPI/bankSyncService';
import { prisma } from '../database';
import logger from '../config/logger';

const router = Router();

/**
 * Bank API Integration Routes
 * 
 * Endpoints:
 * GET    /api/bank/accounts           - Get all bank accounts
 * GET    /api/bank/accounts/:id       - Get account details
 * GET    /api/bank/transactions       - Get transactions
 * POST   /api/bank/transfer           - Initiate transfer
 * POST   /api/bank/sync/accounts      - Sync accounts from bank
 * POST   /api/bank/sync/transactions  - Sync transactions from bank
 * POST   /api/bank/sync/all           - Sync everything
 * GET    /api/bank/banks              - List registered banks
 * POST   /api/bank/register           - Register a bank
 */

// Get all bank accounts
router.get('/accounts', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const accounts = await prisma.bankAccount.findMany({
      where: {
        companyId: parseInt(companyId as string),
        isActive: true,
      },
      orderBy: { accountName: 'asc' },
    });

    res.json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error: any) {
    logger.error('Failed to fetch bank accounts', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bank accounts',
      message: error.message,
    });
  }
});

// Get account details with recent transactions
router.get('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = '10' } = req.query;

    const account = await prisma.bankAccount.findUnique({
      where: { id: parseInt(id) },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Get recent transactions
    const transactions = await prisma.bankTransaction.findMany({
      where: { accountId: parseInt(id) },
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: {
        account,
        transactions,
      },
    });
  } catch (error: any) {
    logger.error('Failed to fetch account details', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch account details',
      message: error.message,
    });
  }
});

// Get transactions with filtering
router.get('/transactions', async (req, res) => {
  try {
    const {
      accountId,
      companyId,
      startDate,
      endDate,
      type,
      status,
      isReconciled,
      page = '1',
      limit = '50',
    } = req.query;

    const where: any = {};

    if (accountId) {
      where.accountId = parseInt(accountId as string);
    }

    if (companyId) {
      where.account = {
        companyId: parseInt(companyId as string),
      };
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (isReconciled !== undefined) {
      where.isReconciled = isReconciled === 'true';
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      prisma.bankTransaction.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              accountName: true,
              accountNumber: true,
              iban: true,
              bankName: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.bankTransaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    logger.error('Failed to fetch transactions', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message,
    });
  }
});

// Initiate money transfer
router.post('/transfer', async (req, res) => {
  try {
    const {
      bankCode,
      fromAccount,
      toAccount,
      toIban,
      amount,
      currency = 'TRY',
      description,
      transferType = 'EFT',
      beneficiaryName,
    } = req.body;

    if (!bankCode || !fromAccount || (!toAccount && !toIban) || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: bankCode, fromAccount, toAccount/toIban, amount',
      });
    }

    logger.info('Initiating transfer', { bankCode, fromAccount, toAccount, amount });

    // Get bank service
    const bankService = bankManager.getBank(bankCode as BankCode);

    // Execute transfer
    const result = await bankService.transfer({
      fromAccount,
      toAccount,
      toIban,
      amount,
      currency,
      description,
      transferType,
      beneficiaryName,
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Transfer completed successfully',
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Transfer failed',
        error: result.errorMessage,
        errorCode: result.errorCode,
      });
    }
  } catch (error: any) {
    logger.error('Transfer failed', { error });
    res.status(500).json({
      success: false,
      error: 'Transfer failed',
      message: error.message,
    });
  }
});

// Sync accounts from bank
router.post('/sync/accounts', async (req, res) => {
  try {
    const { bankCode, companyId } = req.body;

    if (!bankCode || !companyId) {
      return res.status(400).json({
        error: 'Missing required fields: bankCode, companyId',
      });
    }

    logger.info('Syncing accounts', { bankCode, companyId });

    const result = await bankSyncService.syncAccounts(
      bankCode as BankCode,
      parseInt(companyId)
    );

    res.json({
      success: result.success,
      message: `Synced ${result.accountsSynced} accounts`,
      data: result,
    });
  } catch (error: any) {
    logger.error('Account sync failed', { error });
    res.status(500).json({
      success: false,
      error: 'Account sync failed',
      message: error.message,
    });
  }
});

// Sync transactions from bank
router.post('/sync/transactions', async (req, res) => {
  try {
    const { bankCode, accountId, startDate, endDate, companyId } = req.body;

    if (!bankCode || !accountId || !companyId) {
      return res.status(400).json({
        error: 'Missing required fields: bankCode, accountId, companyId',
      });
    }

    logger.info('Syncing transactions', { bankCode, accountId });

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await bankSyncService.syncTransactions(
      bankCode as BankCode,
      accountId,
      start,
      end,
      parseInt(companyId)
    );

    res.json({
      success: result.success,
      message: `Synced ${result.transactionsSynced} transactions`,
      data: result,
    });
  } catch (error: any) {
    logger.error('Transaction sync failed', { error });
    res.status(500).json({
      success: false,
      error: 'Transaction sync failed',
      message: error.message,
    });
  }
});

// Sync everything (accounts + transactions for all banks)
router.post('/sync/all', async (req, res) => {
  try {
    const { companyId, days = 7 } = req.body;

    if (!companyId) {
      return res.status(400).json({
        error: 'companyId is required',
      });
    }

    logger.info('Syncing all banks', { companyId, days });

    // Sync accounts first
    const accountResults = await bankSyncService.syncAllBanks(parseInt(companyId));
    
    // Then sync transactions
    const transactionResults = await bankSyncService.syncAllTransactions(
      parseInt(companyId),
      parseInt(days as string)
    );

    const totalAccountsSynced = accountResults.reduce((sum, r) => sum + r.accountsSynced, 0);
    const totalTransactionsSynced = transactionResults.reduce((sum, r) => sum + r.transactionsSynced, 0);
    const allErrors = [...accountResults, ...transactionResults].flatMap(r => r.errors);

    res.json({
      success: allErrors.length === 0,
      message: `Synced ${totalAccountsSynced} accounts and ${totalTransactionsSynced} transactions`,
      data: {
        accountResults,
        transactionResults,
        summary: {
          totalAccountsSynced,
          totalTransactionsSynced,
          totalErrors: allErrors.length,
          errors: allErrors,
        },
      },
    });
  } catch (error: any) {
    logger.error('Full sync failed', { error });
    res.status(500).json({
      success: false,
      error: 'Full sync failed',
      message: error.message,
    });
  }
});

// List registered banks
router.get('/banks', (req, res) => {
  try {
    const banks = bankManager.getRegisteredBanks();
    
    res.json({
      success: true,
      count: banks.length,
      data: banks,
    });
  } catch (error: any) {
    logger.error('Failed to list banks', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to list banks',
      message: error.message,
    });
  }
});

// Register a new bank
router.post('/register', (req, res) => {
  try {
    const { bankCode, config } = req.body;

    if (!bankCode || !config) {
      return res.status(400).json({
        error: 'Missing required fields: bankCode, config',
      });
    }

    logger.info('Registering bank', { bankCode });

    const service = bankManager.registerBank(bankCode as BankCode, config);

    res.json({
      success: true,
      message: `Bank ${bankCode} registered successfully`,
      data: {
        bankCode,
        bankName: service['config'].bankName,
        environment: service['config'].environment,
      },
    });
  } catch (error: any) {
    logger.error('Failed to register bank', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to register bank',
      message: error.message,
    });
  }
});

// Get bank account statistics
router.get('/stats', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const [
      totalAccounts,
      activeAccounts,
      totalBalance,
      recentTransactions,
      unreconciledCount,
    ] = await Promise.all([
      prisma.bankAccount.count({
        where: { companyId: parseInt(companyId as string) },
      }),
      prisma.bankAccount.count({
        where: { companyId: parseInt(companyId as string), isActive: true },
      }),
      prisma.bankAccount.aggregate({
        where: { companyId: parseInt(companyId as string), isActive: true },
        _sum: { balance: true },
      }),
      prisma.bankTransaction.count({
        where: {
          account: { companyId: parseInt(companyId as string) },
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.bankTransaction.count({
        where: {
          account: { companyId: parseInt(companyId as string) },
          isReconciled: false,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalAccounts,
        activeAccounts,
        totalBalance: totalBalance._sum.balance || 0,
        recentTransactions,
        unreconciledCount,
      },
    });
  } catch (error: any) {
    logger.error('Failed to fetch stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message,
    });
  }
});

export default router;
