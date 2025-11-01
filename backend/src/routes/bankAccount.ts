import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import bankAccountService from '../services/bankAccountService';

const router = Router();

// Apply authentication to all routes
router.use(authenticateJWT);

/**
 * POST /api/bank-accounts - Create a new bank account
 */
router.post('/', async (req, res) => {
  try {
    const { 
      bankName, 
      accountNumber, 
      accountType, 
      iban, 
      branch,
      branchCode,
      currency,
      balance,
      notes
    } = req.body;

    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const account = await bankAccountService.createAccount({
      bankName,
      accountNumber,
      accountType,
      iban,
      branch,
      branchCode,
      currency,
      balance,
      notes,
      companyId
    });

    res.status(201).json(account);
  } catch (error: any) {
    console.error('Error creating bank account:', error);
    res.status(500).json({ message: error.message || 'Failed to create bank account' });
  }
});

/**
 * POST /api/bank-accounts/:id/transactions - Record a transaction
 */
router.post('/:id/transactions', async (req, res) => {
  try {
    const accountId = parseInt(req.params.id);
    const {
      type,
      amount,
      description,
      transactionType,
      reference,
      counterParty,
      counterPartyIBAN,
      category,
      date,
      valueDate,
      expenseId,
      invoiceId,
      notes
    } = req.body;

    const transaction = await bankAccountService.recordTransaction({
      accountId,
      type,
      amount,
      description,
      transactionType,
      reference,
      counterParty,
      counterPartyIBAN,
      category,
      date: new Date(date),
      valueDate: valueDate ? new Date(valueDate) : undefined,
      expenseId,
      invoiceId,
      notes
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    console.error('Error recording transaction:', error);
    res.status(500).json({ message: error.message || 'Failed to record transaction' });
  }
});

/**
 * GET /api/bank-accounts/:id/balance - Get account balance
 */
router.get('/:id/balance', async (req, res) => {
  try {
    const accountId = parseInt(req.params.id);
    const balance = await bankAccountService.getBalance(accountId);
    res.json(balance);
  } catch (error: any) {
    console.error('Error getting balance:', error);
    res.status(500).json({ message: error.message || 'Failed to get balance' });
  }
});

/**
 * GET /api/bank-accounts/:id/transactions - Get transaction history
 */
router.get('/:id/transactions', async (req, res) => {
  try {
    const accountId = parseInt(req.params.id);
    const { startDate, endDate, type, status, limit, offset } = req.query;

    const transactions = await bankAccountService.getTransactions(accountId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: type as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });

    res.json(transactions);
  } catch (error: any) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ message: error.message || 'Failed to get transactions' });
  }
});

/**
 * POST /api/bank-accounts/:id/reconcile - Create reconciliation
 */
router.post('/:id/reconcile', async (req, res) => {
  try {
    const accountId = parseInt(req.params.id);
    const { periodStart, periodEnd, bankBalance, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    const reconciliation = await bankAccountService.createReconciliation({
      accountId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      bankBalance,
      reconciledBy: userId,
      notes
    });

    res.status(201).json(reconciliation);
  } catch (error: any) {
    console.error('Error creating reconciliation:', error);
    res.status(500).json({ message: error.message || 'Failed to create reconciliation' });
  }
});

/**
 * GET /api/bank-accounts/:id/unreconciled - Get unreconciled transactions
 */
router.get('/:id/unreconciled', async (req, res) => {
  try {
    const accountId = parseInt(req.params.id);
    const { startDate, endDate } = req.query;

    const transactions = await bankAccountService.getUnreconciledTransactions(accountId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    });

    res.json(transactions);
  } catch (error: any) {
    console.error('Error getting unreconciled transactions:', error);
    res.status(500).json({ message: error.message || 'Failed to get unreconciled transactions' });
  }
});

/**
 * PUT /api/bank-accounts/transactions/:id/reconcile - Reconcile a transaction
 */
router.put('/transactions/:id/reconcile', async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    const transaction = await bankAccountService.reconcileTransaction(transactionId, userId);
    res.json(transaction);
  } catch (error: any) {
    console.error('Error reconciling transaction:', error);
    res.status(500).json({ message: error.message || 'Failed to reconcile transaction' });
  }
});

/**
 * POST /api/bank-accounts/transactions/reconcile-bulk - Bulk reconcile transactions
 */
router.post('/transactions/reconcile-bulk', async (req, res) => {
  try {
    const { transactionIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    const result = await bankAccountService.bulkReconcile(transactionIds, userId);
    res.json(result);
  } catch (error: any) {
    console.error('Error bulk reconciling transactions:', error);
    res.status(500).json({ message: error.message || 'Failed to bulk reconcile transactions' });
  }
});

/**
 * GET /api/bank-accounts/summary - Get account summary
 */
router.get('/summary', async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const summary = await bankAccountService.getAccountSummary(companyId);
    res.json(summary);
  } catch (error: any) {
    console.error('Error getting account summary:', error);
    res.status(500).json({ message: error.message || 'Failed to get account summary' });
  }
});

/**
 * POST /api/bank-accounts/:id/statements - Upload bank statement
 */
router.post('/:id/statements', async (req, res) => {
  try {
    const accountId = parseInt(req.params.id);
    const {
      statementNumber,
      periodStart,
      periodEnd,
      openingBalance,
      closingBalance,
      fileName,
      fileUrl
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    const statement = await bankAccountService.uploadStatement({
      accountId,
      statementNumber,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      openingBalance,
      closingBalance,
      fileName,
      fileUrl,
      uploadedBy: userId
    });

    res.status(201).json(statement);
  } catch (error: any) {
    console.error('Error uploading statement:', error);
    res.status(500).json({ message: error.message || 'Failed to upload statement' });
  }
});

export default router;
