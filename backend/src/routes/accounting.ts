import express from 'express';
import { accountingService } from '../services/accounting.service';
import * as gibService from '../services/gib-soap.service';
import { authenticateToken } from './auth';
import { log } from '../config/logger';
import chartOfAccountsRoutes from './accounting/chartOfAccounts.routes';
import journalEntryRoutes from './accounting/journalEntry.routes';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Chart of Accounts routes (Turkish Accounting Standards)
router.use('/chart-of-accounts', chartOfAccountsRoutes);

// Journal Entry routes (Yevmiye Defteri)
router.use('/journal-entries', journalEntryRoutes);

/**
 * @route   GET /api/accounting/dashboard/stats
 * @desc    Dashboard quick stats (gelir, gider, kâr, tahsilat)
 * @access  Private
 * @query   startDate, endDate (optional)
 */
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const stats = await accountingService.getDashboardStats(start, end);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    log.error('Failed to get accounting stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get accounting stats',
    });
  }
});

/**
 * @route   GET /api/accounting/dashboard/trends
 * @desc    Dashboard 6-month trend data
 * @access  Private
 * @query   months (default: 6)
 */
router.get('/dashboard/trends', authenticateToken, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const companyId = (req as any).companyId || 1;

    const trends = await accountingService.getDashboardTrends(
      companyId,
      parseInt(months as string)
    );

    res.json({
      success: true,
      data: trends,
    });
  } catch (error: any) {
    log.error('Failed to get dashboard trends:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard trends',
    });
  }
});

/**
 * @route   GET /api/accounting/dashboard/categories
 * @desc    Dashboard category breakdown
 * @access  Private
 * @query   type (income/expense), startDate, endDate
 */
router.get('/dashboard/categories', authenticateToken, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const companyId = (req as any).companyId || 1;

    if (!type || (type !== 'income' && type !== 'expense')) {
      return res.status(400).json({
        success: false,
        message: 'type must be "income" or "expense"',
      });
    }

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const categories = await accountingService.getCategoryBreakdown(
      companyId,
      type as 'income' | 'expense',
      start,
      end
    );

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    log.error('Failed to get category breakdown:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get category breakdown',
    });
  }
});

/**
 * @route   GET /api/accounting/stats
 * @desc    Dashboard quick stats (gelir, gider, kâr, tahsilat) - Deprecated, use /dashboard/stats
 * @access  Private
 * @query   startDate, endDate (optional)
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const stats = await accountingService.getDashboardStats(start, end);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    log.error('Failed to get accounting stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get accounting stats',
    });
  }
});

/**
 * @route   GET /api/accounting/income-expense
 * @desc    Gelir-gider detaylı analiz
 * @access  Private
 * @query   startDate, endDate, groupBy (day/week/month)
 */
router.get('/income-expense', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const analysis = await accountingService.getIncomeExpenseAnalysis(
      new Date(startDate as string),
      new Date(endDate as string),
      (groupBy as 'day' | 'week' | 'month') || 'day'
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    log.error('Failed to get income-expense analysis:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get income-expense analysis',
    });
  }
});

/**
 * @route   GET /api/accounting/accounts
 * @desc    Cari hesap listesi (filters, pagination, sorting)
 * @access  Private
 * @query   page, limit, search, type (customer/supplier), minDebt, status
 */
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      type, 
      minDebt, 
      status,
      sortBy = 'totalDebt',
      sortOrder = 'desc'
    } = req.query;

    const companyId = (req as any).companyId || 1;

    const accounts = await accountingService.getAccountsList({
      companyId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      type: type as 'customer' | 'supplier',
      minDebt: minDebt ? parseFloat(minDebt as string) : undefined,
      status: status as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.json({
      success: true,
      data: accounts.data,
      pagination: accounts.pagination,
    });
  } catch (error: any) {
    log.error('Failed to get accounts list:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get accounts list',
    });
  }
});

/**
 * @route   GET /api/accounting/account/:id
 * @desc    Cari hesap detayı (overview with 4 tabs data)
 * @access  Private
 */
router.get('/account/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const account = await accountingService.getAccountDetail(parseInt(id));

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error: any) {
    log.error('Failed to get account detail:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get account detail',
    });
  }
});

/**
 * @route   GET /api/accounting/account/:id/aging
 * @desc    Yaşlandırma analizi (30/60/90 gün)
 * @access  Private
 */
router.get('/account/:id/aging', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const aging = await accountingService.getAccountAging(parseInt(id));

    res.json({
      success: true,
      data: aging,
    });
  } catch (error: any) {
    log.error('Failed to get account aging:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get account aging',
    });
  }
});

/**
 * @route   GET /api/accounting/account/:id/statement
 * @desc    Cari hesap ekstresi (tüm işlemler)
 * @access  Private
 * @query   startDate, endDate
 */
router.get('/account/:id/statement', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const statement = await accountingService.getAccountStatement(
      parseInt(id),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: statement,
    });
  } catch (error: any) {
    log.error('Failed to get account statement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get account statement',
    });
  }
});

/**
 * @route   GET /api/accounting/cari
 * @desc    Cari hesap özeti (müşteri bazlı alacak-borç) - Deprecated, use /accounts
 * @access  Private
 */
router.get('/cari', authenticateToken, async (req, res) => {
  try {
    const summary = await accountingService.getCariAccountSummary();

    res.json({
      success: true,
      data: summary,
      count: summary.length,
    });
  } catch (error: any) {
    log.error('Failed to get cari account summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get cari account summary',
    });
  }
});

/**
 * @route   GET /api/accounting/cash
 * @desc    Nakit yönetimi özeti (kasa/banka)
 * @access  Private
 */
router.get('/cash', authenticateToken, async (req, res) => {
  try {
    const summary = await accountingService.getCashManagementSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    log.error('Failed to get cash management summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get cash management summary',
    });
  }
});

/**
 * @route   GET /api/accounting/reports/cashflow
 * @desc    Nakit akış raporu (operating, investing, financing)
 * @access  Private
 * @query   months (default: 6)
 */
router.get('/reports/cashflow', authenticateToken, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const companyId = (req as any).companyId || 1;

    const report = await accountingService.getCashflowReport(
      companyId,
      parseInt(months as string)
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    log.error('Failed to get cashflow report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get cashflow report',
    });
  }
});

/**
 * @route   GET /api/accounting/reports/profit-loss
 * @desc    Kar-Zarar tablosu (P&L statement)
 * @access  Private
 * @query   startDate, endDate
 */
router.get('/reports/profit-loss', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = (req as any).companyId || 1;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate as string) : new Date();

    const report = await accountingService.getProfitLossReport(companyId, start, end);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    log.error('Failed to get profit-loss report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get profit-loss report',
    });
  }
});

/**
 * @route   GET /api/accounting/reports/trial-balance
 * @desc    Mizan raporu (Trial Balance)
 * @access  Private
 * @query   startDate, endDate, accountType, includeZeroBalance
 */
router.get('/reports/trial-balance', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, accountType, includeZeroBalance } = req.query;
    const companyId = (req as any).companyId || 1;

    const report = await accountingService.getTrialBalanceReport({
      companyId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : new Date(),
      accountType: accountType as string | undefined,
      includeZeroBalance: includeZeroBalance === 'true',
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    log.error('Failed to get trial balance report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get trial balance report',
    });
  }
});

/**
 * @route   GET /api/accounting/reports/income-statement
 * @desc    Gelir-Gider Tablosu (Income Statement)
 * @access  Private
 * @query   startDate, endDate
 */
router.get('/reports/income-statement', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = (req as any).companyId || 1;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const report = await accountingService.getIncomeStatementReport({
      companyId,
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    log.error('Failed to get income statement report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get income statement report',
    });
  }
});

/**
 * @route   GET /api/accounting/reports/balance-sheet
 * @desc    Bilanço raporu (Balance Sheet)
 * @access  Private
 * @query   date (default: today)
 */
router.get('/reports/balance-sheet', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const companyId = (req as any).companyId || 1;

    const reportDate = date ? new Date(date as string) : new Date();

    const report = await accountingService.getBalanceSheetReport({
      companyId,
      date: reportDate,
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    log.error('Failed to get balance sheet report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get balance sheet report',
    });
  }
});

/**
 * @route   GET /api/accounting/reports/vat-declaration
 * @desc    KDV beyannamesi hazırlık raporu
 * @access  Private
 * @query   months (default: 6)
 */
router.get('/reports/vat-declaration', authenticateToken, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const companyId = (req as any).companyId || 1;

    const report = await accountingService.getVATDeclarationReport(
      companyId,
      parseInt(months as string)
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    log.error('Failed to get VAT declaration report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get VAT declaration report',
    });
  }
});

/**
 * @route   GET /api/accounting/vat-report
 * @desc    KDV raporu - Deprecated, use /reports/vat-declaration
 * @access  Private
 * @query   startDate, endDate
 */
router.get('/vat-report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const report = await accountingService.getVATReport(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    log.error('Failed to get VAT report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get VAT report',
    });
  }
});

/**
 * @route   GET /api/accounting/incomes
 * @desc    Gelir listesi (pagination, filter)
 * @access  Private
 */
router.get('/incomes', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, startDate, endDate, search } = req.query;
    
    const incomes = await accountingService.getIncomes({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      category: category as string,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string,
    });

    res.json({
      success: true,
      data: incomes.data,
      pagination: incomes.pagination,
    });
  } catch (error: any) {
    log.error('Failed to get incomes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get incomes',
    });
  }
});

/**
 * @route   GET /api/accounting/income/:id
 * @desc    Gelir detayı
 * @access  Private
 */
router.get('/income/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const income = await accountingService.getIncomeById(parseInt(id));

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found',
      });
    }

    res.json({
      success: true,
      data: income,
    });
  } catch (error: any) {
    log.error('Failed to get income:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get income',
    });
  }
});

/**
 * @route   POST /api/accounting/income
 * @desc    Gelir kaydı ekle
 * @access  Private
 */
router.post('/income', authenticateToken, async (req, res) => {
  try {
    const { description, amount, category, date, status, paymentMethod, notes, invoiceId } = req.body;

    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'description, amount, category, and date are required',
      });
    }

    // Note: companyId should come from authenticated user's context
    // For now, we'll use a default or from request
    const companyId = (req as any).companyId || 1;

    const income = await accountingService.createIncome({
      companyId,
      description,
      amount: parseFloat(amount),
      category,
      date: new Date(date),
      status: status || 'received',
      paymentMethod: paymentMethod || 'Nakit',
      notes,
      invoiceId: invoiceId ? parseInt(invoiceId) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Income created successfully',
      data: income,
    });
  } catch (error: any) {
    log.error('Failed to create income:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create income',
    });
  }
});

/**
 * @route   PUT /api/accounting/income/:id
 * @desc    Gelir kaydı güncelle
 * @access  Private
 */
router.put('/income/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date, status, paymentMethod, notes, invoiceId } = req.body;

    const income = await accountingService.updateIncome(parseInt(id), {
      description,
      amount: amount ? parseFloat(amount) : undefined,
      category,
      date: date ? new Date(date) : undefined,
      status,
      paymentMethod,
      notes,
      invoiceId: invoiceId ? parseInt(invoiceId) : undefined,
    });

    res.json({
      success: true,
      message: 'Income updated successfully',
      data: income,
    });
  } catch (error: any) {
    log.error('Failed to update income:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update income',
    });
  }
});

/**
 * @route   DELETE /api/accounting/income/:id
 * @desc    Gelir kaydı sil
 * @access  Private
 */
router.delete('/income/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await accountingService.deleteIncome(parseInt(id));

    res.json({
      success: true,
      message: 'Income deleted successfully',
    });
  } catch (error: any) {
    log.error('Failed to delete income:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete income',
    });
  }
});

/**
 * @route   GET /api/accounting/expenses
 * @desc    Gider listesi (pagination, filter)
 * @access  Private
 */
router.get('/expenses', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, startDate, endDate, search } = req.query;
    
    const expenses = await accountingService.getExpenses({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      category: category as string,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string,
    });

    res.json({
      success: true,
      data: expenses.data,
      pagination: expenses.pagination,
    });
  } catch (error: any) {
    log.error('Failed to get expenses - returning empty data:', error);
    // Return empty data instead of 500 to prevent frontend crash
    res.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: 0,
      },
    });
  }
});

/**
 * @route   GET /api/accounting/expense/:id
 * @desc    Gider detayı
 * @access  Private
 */
router.get('/expense/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await accountingService.getExpenseById(parseInt(id));

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error: any) {
    log.error('Failed to get expense:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get expense',
    });
  }
});

/**
 * @route   POST /api/accounting/expense
 * @desc    Gider kaydı ekle
 * @access  Private
 */
router.post('/expense', authenticateToken, async (req, res) => {
  try {
    const { description, amount, category, date, status, paymentMethod, notes, receiptUrl } = req.body;

    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'description, amount, category, and date are required',
      });
    }

    const companyId = (req as any).companyId || 1;

    const expense = await accountingService.createExpense({
      companyId,
      description,
      amount: parseFloat(amount),
      category,
      date: new Date(date),
      status: status || 'paid',
      paymentMethod: paymentMethod || 'Nakit',
      notes,
      receiptUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    });
  } catch (error: any) {
    log.error('Failed to create expense:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create expense',
    });
  }
});

/**
 * @route   PUT /api/accounting/expense/:id
 * @desc    Gider kaydı güncelle
 * @access  Private
 */
router.put('/expense/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date, status, paymentMethod, notes, receiptUrl } = req.body;

    const expense = await accountingService.updateExpense(parseInt(id), {
      description,
      amount: amount ? parseFloat(amount) : undefined,
      category,
      date: date ? new Date(date) : undefined,
      status,
      paymentMethod,
      notes,
      receiptUrl,
    });

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error: any) {
    log.error('Failed to update expense:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update expense',
    });
  }
});

/**
 * @route   DELETE /api/accounting/expense/:id
 * @desc    Gider kaydı sil
 * @access  Private
 */
router.delete('/expense/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await accountingService.deleteExpense(parseInt(id));

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error: any) {
    log.error('Failed to delete expense:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete expense',
    });
  }
});

/**
 * CATEGORY MANAGEMENT OPERATIONS
 */

/**
 * @route   GET /api/accounting/categories
 * @desc    Get all income/expense categories
 * @access  Private
 * @query   type (income|expense)
 */
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { type } = req.query;

    // Get categories from Income and Expense tables
    let categories: { id: string; name: string; type: string; color?: string }[] = [];

    if (!type || type === 'income') {
      const incomes = await prisma.income.findMany({
        where: { companyId },
        select: { category: true },
        distinct: ['category'],
      });
      const incomeCats = incomes
        .filter(i => i.category)
        .map(i => ({ 
          id: `income-${i.category}`, 
          name: i.category!, 
          type: 'income',
          color: '#10b981'
        }));
      categories.push(...incomeCats);
    }

    if (!type || type === 'expense') {
      const expenses = await prisma.expense.findMany({
        where: { companyId },
        select: { category: true },
        distinct: ['category'],
      });
      const expenseCats = expenses
        .filter(e => e.category)
        .map(e => ({ 
          id: `expense-${e.category}`, 
          name: e.category!, 
          type: 'expense',
          color: '#ef4444'
        }));
      categories.push(...expenseCats);
    }

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    log.error('Failed to get categories:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get categories',
    });
  }
});

/**
 * @route   POST /api/accounting/categories/rename
 * @desc    Rename a category (updates all records)
 * @access  Private
 * @body    type, oldName, newName
 */
router.post('/categories/rename', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { type, oldName, newName } = req.body;

    if (!type || !oldName || !newName) {
      return res.status(400).json({
        success: false,
        message: 'type, oldName, and newName are required',
      });
    }

    let updatedCount = 0;

    if (type === 'income') {
      const result = await prisma.income.updateMany({
        where: { companyId, category: oldName },
        data: { category: newName },
      });
      updatedCount = result.count;
    } else if (type === 'expense') {
      const result = await prisma.expense.updateMany({
        where: { companyId, category: oldName },
        data: { category: newName },
      });
      updatedCount = result.count;
    }

    res.json({
      success: true,
      message: `Category renamed successfully. ${updatedCount} records updated.`,
      data: { updatedCount },
    });
  } catch (error: any) {
    log.error('Failed to rename category:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to rename category',
    });
  }
});

/**
 * @route   DELETE /api/accounting/categories/:type/:name
 * @desc    Delete a category (moves records to 'Uncategorized')
 * @access  Private
 */
router.delete('/categories/:type/:name', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { type, name } = req.params;

    if (!type || !name) {
      return res.status(400).json({
        success: false,
        message: 'type and name are required',
      });
    }

    const decodedName = decodeURIComponent(name);
    let updatedCount = 0;

    if (type === 'income') {
      const result = await prisma.income.updateMany({
        where: { companyId, category: decodedName },
        data: { category: 'Diğer' },
      });
      updatedCount = result.count;
    } else if (type === 'expense') {
      const result = await prisma.expense.updateMany({
        where: { companyId, category: decodedName },
        data: { category: 'Diğer' },
      });
      updatedCount = result.count;
    }

    res.json({
      success: true,
      message: `Category deleted. ${updatedCount} records moved to 'Diğer'.`,
      data: { updatedCount },
    });
  } catch (error: any) {
    log.error('Failed to delete category:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete category',
    });
  }
});

/**
 * E-INVOICE CRUD OPERATIONS
 */

/**
 * @route   POST /api/accounting/e-invoice
 * @desc    Create new e-invoice (e-fatura or e-archive)
 * @access  Private
 * @body    orderId, customerId, items, type (auto-detect if not provided)
 */
router.post('/e-invoice', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { orderId, customerId, items, type, notes } = req.body;

    if (!orderId || !customerId || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'orderId, customerId, and items array are required',
      });
    }

    const invoice = await accountingService.createEInvoice({
      companyId,
      orderId: parseInt(orderId),
      customerId: parseInt(customerId),
      items,
      type, // Optional: will auto-detect if not provided
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'E-Invoice created successfully',
      data: invoice,
    });
  } catch (error: any) {
    log.error('Failed to create e-invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create e-invoice',
    });
  }
});

/**
 * @route   GET /api/accounting/e-invoice/:id
 * @desc    Get e-invoice details
 * @access  Private
 */
router.get('/e-invoice/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await accountingService.getEInvoiceDetail(parseInt(id));

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'E-Invoice not found',
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    log.error('Failed to get e-invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get e-invoice',
    });
  }
});

/**
 * @route   PUT /api/accounting/e-invoice/:id
 * @desc    Update e-invoice (only if status = draft)
 * @access  Private
 */
router.put('/e-invoice/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { items, notes, dueDate } = req.body;

    const invoice = await accountingService.updateEInvoice(parseInt(id), {
      items,
      notes,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    res.json({
      success: true,
      message: 'E-Invoice updated successfully',
      data: invoice,
    });
  } catch (error: any) {
    log.error('Failed to update e-invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update e-invoice',
    });
  }
});

/**
 * @route   POST /api/accounting/e-invoice/:id/send
 * @desc    Send e-invoice to GIB (change status from draft to sent)
 * @access  Private
 */
router.post('/e-invoice/:id/send', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await accountingService.sendEInvoice(parseInt(id));

    res.json({
      success: true,
      message: 'E-Invoice sent successfully',
      data: invoice,
    });
  } catch (error: any) {
    log.error('Failed to send e-invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send e-invoice',
    });
  }
});

/**
 * @route   POST /api/accounting/e-invoice/:id/cancel
 * @desc    Cancel e-invoice (soft delete, change status to cancelled)
 * @access  Private
 */
router.post('/e-invoice/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const invoice = await accountingService.cancelEInvoice(parseInt(id), reason);

    res.json({
      success: true,
      message: 'E-Invoice cancelled successfully',
      data: invoice,
    });
  } catch (error: any) {
    log.error('Failed to cancel e-invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel e-invoice',
    });
  }
});

/**
 * @route   GET /api/accounting/e-invoices
 * @desc    List e-invoices with filters
 * @access  Private
 * @query   status, type, startDate, endDate, page, limit
 */
router.get('/e-invoices', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      type,
      startDate,
      endDate,
      page = '1',
      limit = '20',
    } = req.query;

    const filters = {
      status: status as string,
      type: type as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await accountingService.listEInvoices(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result.invoices,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    log.error('Failed to list e-invoices:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list e-invoices',
    });
  }
});

/**
 * @route   POST /api/accounting/e-invoice/:id/download-pdf
 * @desc    Generate and download e-invoice PDF
 * @access  Private
 */
router.post('/e-invoice/:id/download-pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await accountingService.generateEInvoicePDF(parseInt(id));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    log.error('Failed to generate e-invoice PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate e-invoice PDF',
    });
  }
});

/**
 * @route   POST /api/accounting/e-invoice/:id/download-xml
 * @desc    Generate and download e-invoice XML (UBL-TR format)
 * @access  Private
 */
router.post('/e-invoice/:id/download-xml', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const xmlContent = await accountingService.generateEInvoiceXML(parseInt(id));

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.xml`);
    res.send(xmlContent);
  } catch (error: any) {
    log.error('Failed to generate e-invoice XML:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate e-invoice XML',
    });
  }
});

/**
 * DELIVERY NOTES (İRSALİYE) CRUD OPERATIONS
 */

/**
 * @route   POST /api/accounting/delivery-note
 * @desc    Create new delivery note
 * @access  Private
 * @body    orderId, customerId, items, type (inbound/outbound), waybillNumber
 */
router.post('/delivery-note', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { orderId, customerId, items, type, waybillNumber, notes, vehicleInfo } = req.body;

    if (!orderId || !customerId || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'orderId, customerId, and items array are required',
      });
    }

    if (!type || !['inbound', 'outbound'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be either "inbound" or "outbound"',
      });
    }

    const deliveryNote = await accountingService.createDeliveryNote({
      companyId,
      orderId: parseInt(orderId),
      customerId: parseInt(customerId),
      items,
      type,
      waybillNumber,
      notes,
      vehicleInfo,
    });

    res.status(201).json({
      success: true,
      message: 'Delivery note created successfully',
      data: deliveryNote,
    });
  } catch (error: any) {
    log.error('Failed to create delivery note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create delivery note',
    });
  }
});

/**
 * @route   GET /api/accounting/delivery-note/:id
 * @desc    Get delivery note details
 * @access  Private
 */
router.get('/delivery-note/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryNote = await accountingService.getDeliveryNoteDetail(parseInt(id));

    if (!deliveryNote) {
      return res.status(404).json({
        success: false,
        message: 'Delivery note not found',
      });
    }

    res.json({
      success: true,
      data: deliveryNote,
    });
  } catch (error: any) {
    log.error('Failed to get delivery note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get delivery note',
    });
  }
});

/**
 * @route   PUT /api/accounting/delivery-note/:id
 * @desc    Update delivery note (only if status = draft)
 * @access  Private
 */
router.put('/delivery-note/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { items, notes, vehicleInfo, waybillNumber } = req.body;

    const deliveryNote = await accountingService.updateDeliveryNote(parseInt(id), {
      items,
      notes,
      vehicleInfo,
      waybillNumber,
    });

    res.json({
      success: true,
      message: 'Delivery note updated successfully',
      data: deliveryNote,
    });
  } catch (error: any) {
    log.error('Failed to update delivery note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update delivery note',
    });
  }
});

/**
 * @route   POST /api/accounting/delivery-note/:id/confirm
 * @desc    Confirm delivery note (change status from draft to confirmed)
 * @access  Private
 */
router.post('/delivery-note/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryNote = await accountingService.confirmDeliveryNote(parseInt(id));

    res.json({
      success: true,
      message: 'Delivery note confirmed successfully',
      data: deliveryNote,
    });
  } catch (error: any) {
    log.error('Failed to confirm delivery note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm delivery note',
    });
  }
});

/**
 * @route   POST /api/accounting/delivery-note/:id/cancel
 * @desc    Cancel delivery note
 * @access  Private
 */
router.post('/delivery-note/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const deliveryNote = await accountingService.cancelDeliveryNote(parseInt(id), reason);

    res.json({
      success: true,
      message: 'Delivery note cancelled successfully',
      data: deliveryNote,
    });
  } catch (error: any) {
    log.error('Failed to cancel delivery note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel delivery note',
    });
  }
});

/**
 * @route   GET /api/accounting/delivery-notes
 * @desc    List delivery notes with filters
 * @access  Private
 * @query   status, type, orderId, startDate, endDate, page, limit
 */
router.get('/delivery-notes', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      type,
      orderId,
      startDate,
      endDate,
      page = '1',
      limit = '20',
    } = req.query;

    const filters = {
      status: status as string,
      type: type as string,
      orderId: orderId ? parseInt(orderId as string) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await accountingService.listDeliveryNotes(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result.deliveryNotes,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    log.error('Failed to list delivery notes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list delivery notes',
    });
  }
});

/**
 * @route   POST /api/accounting/delivery-note/:id/download-pdf
 * @desc    Generate and download delivery note PDF
 * @access  Private
 */
router.post('/delivery-note/:id/download-pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await accountingService.generateDeliveryNotePDF(parseInt(id));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=delivery-note-${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    log.error('Failed to generate delivery note PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate delivery note PDF',
    });
  }
});

/**
 * @route   GET /api/accounting/delivery-note/:id/link-invoice/:invoiceId
 * @desc    Link delivery note to invoice
 * @access  Private
 */
router.post('/delivery-note/:id/link-invoice/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { id, invoiceId } = req.params;
    const deliveryNote = await accountingService.linkDeliveryNoteToInvoice(
      parseInt(id),
      parseInt(invoiceId)
    );

    res.json({
      success: true,
      message: 'Delivery note linked to invoice successfully',
      data: deliveryNote,
    });
  } catch (error: any) {
    log.error('Failed to link delivery note to invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to link delivery note to invoice',
    });
  }
});

/**
 * BANK & CASH OPERATIONS
 */

/**
 * @route   GET /api/accounting/bank-accounts
 * @desc    List all bank accounts for company
 * @access  Private
 */
router.get('/bank-accounts', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const accounts = await accountingService.listBankAccounts(companyId);

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error: any) {
    log.error('Failed to list bank accounts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list bank accounts',
    });
  }
});

/**
 * @route   POST /api/accounting/bank-account
 * @desc    Create new bank account
 * @access  Private
 */
router.post('/bank-account', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { bankName, accountType, iban, branch, balance, currency } = req.body;

    if (!bankName || !accountType || !iban) {
      return res.status(400).json({
        success: false,
        message: 'bankName, accountType, and iban are required',
      });
    }

    const account = await accountingService.createBankAccount({
      companyId,
      bankName,
      accountType,
      iban,
      branch,
      balance: balance ? parseFloat(balance) : 0,
      currency: currency || 'TRY',
    });

    res.status(201).json({
      success: true,
      message: 'Bank account created successfully',
      data: account,
    });
  } catch (error: any) {
    log.error('Failed to create bank account:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create bank account',
    });
  }
});

/**
 * @route   GET /api/accounting/bank-account/:id/transactions
 * @desc    Get bank account transactions with pagination
 * @access  Private
 * @query   startDate, endDate, page, limit
 */
router.get('/bank-account/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, page = '1', limit = '50' } = req.query;

    const result = await accountingService.getBankTransactions(
      parseInt(id),
      {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      },
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result.transactions,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    log.error('Failed to get bank transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get bank transactions',
    });
  }
});

/**
 * @route   POST /api/accounting/bank-transaction
 * @desc    Create bank transaction (deposit/withdrawal)
 * @access  Private
 */
router.post('/bank-transaction', authenticateToken, async (req, res) => {
  try {
    const { accountId, type, amount, description, date } = req.body;

    if (!accountId || !type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'accountId, type, and amount are required',
      });
    }

    if (!['deposit', 'withdrawal'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be either "deposit" or "withdrawal"',
      });
    }

    const transaction = await accountingService.createBankTransaction({
      accountId: parseInt(accountId),
      type,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Bank transaction created successfully',
      data: transaction,
    });
  } catch (error: any) {
    log.error('Failed to create bank transaction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create bank transaction',
    });
  }
});

/**
 * @route   POST /api/accounting/bank-reconciliation
 * @desc    Reconcile bank statement with recorded transactions
 * @access  Private
 * @body    accountId, statementBalance, statementDate
 */
router.post('/bank-reconciliation', authenticateToken, async (req, res) => {
  try {
    const { accountId, statementBalance, statementDate } = req.body;

    if (!accountId || statementBalance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'accountId and statementBalance are required',
      });
    }

    const result = await accountingService.reconcileBankAccount(
      parseInt(accountId),
      parseFloat(statementBalance),
      statementDate ? new Date(statementDate) : new Date()
    );

    res.json({
      success: true,
      message: 'Bank reconciliation completed',
      data: result,
    });
  } catch (error: any) {
    log.error('Failed to reconcile bank account:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reconcile bank account',
    });
  }
});

/**
 * @route   GET /api/accounting/cash-transactions
 * @desc    List cash transactions
 * @access  Private
 * @query   startDate, endDate, type, page, limit
 */
router.get('/cash-transactions', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { startDate, endDate, type, page = '1', limit = '50' } = req.query;

    const result = await accountingService.listCashTransactions(
      companyId,
      {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        type: type as string,
      },
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result.transactions,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    log.error('Failed to list cash transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list cash transactions',
    });
  }
});

/**
 * @route   POST /api/accounting/cash-transaction
 * @desc    Create cash transaction (in/out)
 * @access  Private
 */
router.post('/cash-transaction', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const userId = (req as any).user?.id;
    const { type, amount, description, date } = req.body;

    if (!type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'type and amount are required',
      });
    }

    if (!['in', 'out'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be either "in" or "out"',
      });
    }

    const transaction = await accountingService.createCashTransaction({
      companyId,
      userId,
      type,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Cash transaction created successfully',
      data: transaction,
    });
  } catch (error: any) {
    log.error('Failed to create cash transaction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create cash transaction',
    });
  }
});

/**
 * @route   GET /api/accounting/cash-balance
 * @desc    Get current cash balance
 * @access  Private
 */
router.get('/cash-balance', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const balance = await accountingService.getCashBalance(companyId);

    res.json({
      success: true,
      data: { balance },
    });
  } catch (error: any) {
    log.error('Failed to get cash balance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get cash balance',
    });
  }
});

/**
 * @route   POST /api/accounting/parse-mt940
 * @desc    Parse MT940 bank statement file (prep for future implementation)
 * @access  Private
 * @body    fileContent (MT940 format text)
 */
router.post('/parse-mt940', authenticateToken, async (req, res) => {
  try {
    const { fileContent } = req.body;

    if (!fileContent) {
      return res.status(400).json({
        success: false,
        message: 'fileContent is required',
      });
    }

    const result = await accountingService.parseMT940Statement(fileContent);

    res.json({
      success: true,
      message: 'MT940 statement parsed successfully',
      data: result,
    });
  } catch (error: any) {
    log.error('Failed to parse MT940 statement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to parse MT940 statement',
    });
  }
});

/**
 * STOCK MOVEMENTS OPERATIONS
 */

/**
 * @route   POST /api/accounting/stock-movement
 * @desc    Create stock movement (in/out/adjustment)
 * @access  Private
 * @body    equipmentId, type, quantity, unitCost, notes
 */
router.post('/stock-movement', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const userId = (req as any).user?.id;
    const { equipmentId, type, quantity, unitCost, notes, orderId } = req.body;

    if (!equipmentId || !type || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'equipmentId, type, and quantity are required',
      });
    }

    if (!['in', 'out', 'adjustment'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be "in", "out", or "adjustment"',
      });
    }

    const movement = await accountingService.createStockMovement({
      companyId,
      userId,
      equipmentId: parseInt(equipmentId),
      type,
      quantity: parseFloat(quantity),
      unitCost: unitCost ? parseFloat(unitCost) : undefined,
      notes,
      orderId: orderId ? parseInt(orderId) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Stock movement created successfully',
      data: movement,
    });
  } catch (error: any) {
    log.error('Failed to create stock movement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create stock movement',
    });
  }
});

/**
 * @route   GET /api/accounting/stock-movements
 * @desc    List stock movements with filters
 * @access  Private
 * @query   equipmentId, type, startDate, endDate, page, limit
 */
router.get('/stock-movements', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const {
      equipmentId,
      type,
      startDate,
      endDate,
      page = '1',
      limit = '50',
    } = req.query;

    const filters = {
      equipmentId: equipmentId ? parseInt(equipmentId as string) : undefined,
      type: type as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await accountingService.listStockMovements(
      companyId,
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result.movements,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    log.error('Failed to list stock movements:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list stock movements',
    });
  }
});

/**
 * @route   GET /api/accounting/stock-valuation
 * @desc    Get stock valuation report (FIFO/LIFO)
 * @access  Private
 * @query   method (fifo/lifo), equipmentId (optional)
 */
router.get('/stock-valuation', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { method = 'fifo', equipmentId } = req.query;

    if (!['fifo', 'lifo'].includes(method as string)) {
      return res.status(400).json({
        success: false,
        message: 'method must be "fifo" or "lifo"',
      });
    }

    const valuation = await accountingService.getStockValuation(
      companyId,
      method as 'fifo' | 'lifo',
      equipmentId ? parseInt(equipmentId as string) : undefined
    );

    res.json({
      success: true,
      data: valuation,
    });
  } catch (error: any) {
    log.error('Failed to get stock valuation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get stock valuation',
    });
  }
});

/**
 * @route   GET /api/accounting/stock-balance/:equipmentId
 * @desc    Get current stock balance for equipment
 * @access  Private
 */
router.get('/stock-balance/:equipmentId', authenticateToken, async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const balance = await accountingService.getStockBalance(parseInt(equipmentId));

    res.json({
      success: true,
      data: balance,
    });
  } catch (error: any) {
    log.error('Failed to get stock balance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get stock balance',
    });
  }
});

/**
 * @route   GET /api/accounting/low-stock-alert
 * @desc    Get equipment with low stock levels
 * @access  Private
 * @query   threshold (minimum quantity, default 5)
 */
router.get('/low-stock-alert', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { threshold = '5' } = req.query;

    const lowStockItems = await accountingService.getLowStockAlert(
      companyId,
      parseInt(threshold as string)
    );

    res.json({
      success: true,
      data: lowStockItems,
    });
  } catch (error: any) {
    log.error('Failed to get low stock alert:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get low stock alert',
    });
  }
});

/**
 * CHECKS & PROMISSORY NOTES OPERATIONS
 */

/**
 * @route   POST /api/accounting/check
 * @desc    Create new check (received/issued)
 * @access  Private
 */
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const {
      checkNumber,
      type,
      drawer,
      bank,
      branch,
      accountNumber,
      amount,
      issueDate,
      dueDate,
      customerId,
      orderId,
      notes,
    } = req.body;

    if (!checkNumber || !type || !drawer || !bank || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'checkNumber, type, drawer, bank, amount, and dueDate are required',
      });
    }

    if (!['received', 'issued'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be "received" or "issued"',
      });
    }

    const check = await accountingService.createCheck({
      companyId,
      checkNumber,
      type,
      drawer,
      bank,
      branch,
      accountNumber,
      amount: parseFloat(amount),
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: new Date(dueDate),
      customerId: customerId ? parseInt(customerId) : undefined,
      orderId: orderId ? parseInt(orderId) : undefined,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Check created successfully',
      data: check,
    });
  } catch (error: any) {
    log.error('Failed to create check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create check',
    });
  }
});

/**
 * @route   GET /api/accounting/checks
 * @desc    List checks with filters
 * @access  Private
 * @query   type, status, startDate, endDate, page, limit
 */
router.get('/checks', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const {
      type,
      status,
      startDate,
      endDate,
      page = '1',
      limit = '50',
    } = req.query;

    const filters = {
      type: type as string,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await accountingService.listChecks(
      companyId,
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result.checks,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    log.error('Failed to list checks:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list checks',
    });
  }
});

/**
 * @route   POST /api/accounting/check/:id/endorse
 * @desc    Endorse check to another party
 * @access  Private
 */
router.post('/check/:id/endorse', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { endorsedTo, notes } = req.body;

    if (!endorsedTo) {
      return res.status(400).json({
        success: false,
        message: 'endorsedTo is required',
      });
    }

    const check = await accountingService.endorseCheck(
      parseInt(id),
      endorsedTo,
      notes
    );

    res.json({
      success: true,
      message: 'Check endorsed successfully',
      data: check,
    });
  } catch (error: any) {
    log.error('Failed to endorse check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to endorse check',
    });
  }
});

/**
 * @route   POST /api/accounting/check/:id/collect
 * @desc    Mark check as collected
 * @access  Private
 */
router.post('/check/:id/collect', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const check = await accountingService.collectCheck(parseInt(id));

    res.json({
      success: true,
      message: 'Check collected successfully',
      data: check,
    });
  } catch (error: any) {
    log.error('Failed to collect check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to collect check',
    });
  }
});

/**
 * @route   POST /api/accounting/check/:id/bounce
 * @desc    Mark check as bounced
 * @access  Private
 */
router.post('/check/:id/bounce', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const check = await accountingService.bounceCheck(parseInt(id), reason);

    res.json({
      success: true,
      message: 'Check marked as bounced',
      data: check,
    });
  } catch (error: any) {
    log.error('Failed to bounce check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to bounce check',
    });
  }
});

/**
 * @route   POST /api/accounting/promissory-note
 * @desc    Create new promissory note
 * @access  Private
 */
router.post('/promissory-note', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const {
      noteNumber,
      type,
      drawer,
      amount,
      issueDate,
      dueDate,
      aval,
      customerId,
      notes,
    } = req.body;

    if (!noteNumber || !type || !drawer || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'noteNumber, type, drawer, amount, and dueDate are required',
      });
    }

    if (!['received', 'issued'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be "received" or "issued"',
      });
    }

    const note = await accountingService.createPromissoryNote({
      companyId,
      noteNumber,
      type,
      drawer,
      amount: parseFloat(amount),
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: new Date(dueDate),
      aval,
      customerId: customerId ? parseInt(customerId) : undefined,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Promissory note created successfully',
      data: note,
    });
  } catch (error: any) {
    log.error('Failed to create promissory note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create promissory note',
    });
  }
});

/**
 * @route   GET /api/accounting/promissory-notes
 * @desc    List promissory notes with filters
 * @access  Private
 */
router.get('/promissory-notes', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const {
      type,
      status,
      startDate,
      endDate,
      page = '1',
      limit = '50',
    } = req.query;

    const filters = {
      type: type as string,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await accountingService.listPromissoryNotes(
      companyId,
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result.notes,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    log.error('Failed to list promissory notes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list promissory notes',
    });
  }
});

/**
 * @route   GET /api/accounting/due-soon
 * @desc    Get checks and notes due within specified days
 * @access  Private
 * @query   days (default 30)
 */
router.get('/due-soon', authenticateToken, async (req, res) => {
  try {
    const companyId = (req as any).companyId || 1;
    const { days = '30' } = req.query;

    const dueSoon = await accountingService.getDueSoon(
      companyId,
      parseInt(days as string)
    );

    res.json({
      success: true,
      data: dueSoon,
    });
  } catch (error: any) {
    log.error('Failed to get due soon items:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get due soon items',
    });
  }
});

// ==================== GIB SOAP Integration ====================

/**
 * @route   POST /api/accounting/gib/send-invoice
 * @desc    Send e-Invoice to GIB (e-Fatura or e-Arşiv)
 * @access  Private
 * @body    invoiceData (InvoiceData type from gib-soap.service)
 */
router.post('/gib/send-invoice', authenticateToken, async (req, res) => {
  try {
    const invoiceData = req.body;

    // Generate UBL-TR 1.2 XML
    const invoiceXML = gibService.generateInvoiceXML(invoiceData);

    // Determine if e-Fatura or e-Arşiv based on customer tax number
    const isEFatura = !!invoiceData.customer.taxNumber;
    
    let result;
    if (isEFatura) {
      result = await gibService.sendInvoice(invoiceXML);
    } else {
      result = await gibService.sendArchiveInvoice(invoiceXML);
    }

    res.json({
      success: result.success,
      data: {
        type: isEFatura ? 'e-Fatura' : 'e-Arşiv',
        invoiceId: invoiceData.invoiceId,
        uuid: invoiceData.uuid,
        xml: invoiceXML,
        gibResponse: result,
      },
      message: result.success 
        ? `${isEFatura ? 'e-Fatura' : 'e-Arşiv'} başarıyla GİB'e gönderildi` 
        : 'Fatura gönderimi başarısız',
    });
  } catch (error: any) {
    log.error('Failed to send invoice to GIB:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send invoice to GIB',
    });
  }
});

/**
 * @route   GET /api/accounting/gib/invoice-status/:uuid
 * @desc    Query invoice status from GIB
 * @access  Private
 * @param   uuid - Invoice UUID
 */
router.get('/gib/invoice-status/:uuid', authenticateToken, async (req, res) => {
  try {
    const { uuid } = req.params;

    const status = await gibService.queryInvoiceStatus(uuid);

    res.json({
      success: true,
      data: {
        uuid,
        status: status.status,
        message: status.message,
        details: status,
      },
    });
  } catch (error: any) {
    log.error('Failed to query invoice status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to query invoice status',
    });
  }
});

/**
 * @route   POST /api/accounting/gib/cancel-invoice
 * @desc    Cancel invoice on GIB
 * @access  Private
 * @body    uuid, reason
 */
router.post('/gib/cancel-invoice', authenticateToken, async (req, res) => {
  try {
    const { uuid, reason } = req.body;

    if (!uuid || !reason) {
      return res.status(400).json({
        success: false,
        message: 'UUID ve iptal nedeni gereklidir',
      });
    }

    const result = await gibService.cancelInvoice(uuid, reason);

    res.json({
      success: result.success,
      data: {
        uuid,
        reason,
        gibResponse: result,
      },
      message: result.success ? 'Fatura başarıyla iptal edildi' : 'Fatura iptali başarısız',
    });
  } catch (error: any) {
    log.error('Failed to cancel invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel invoice',
    });
  }
});

/**
 * @route   POST /api/accounting/gib/generate-xml
 * @desc    Generate UBL-TR 1.2 XML for preview (without sending to GIB)
 * @access  Private
 * @body    invoiceData
 */
router.post('/gib/generate-xml', authenticateToken, async (req, res) => {
  try {
    const invoiceData = req.body;

    const invoiceXML = gibService.generateInvoiceXML(invoiceData);

    res.json({
      success: true,
      data: {
        invoiceId: invoiceData.invoiceId,
        uuid: invoiceData.uuid,
        xml: invoiceXML,
      },
      message: 'XML başarıyla oluşturuldu',
    });
  } catch (error: any) {
    log.error('Failed to generate XML:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate XML',
    });
  }
});

/**
 * @route   GET /api/accounting/gib/test-connection
 * @desc    Test GIB service connection
 * @access  Private
 */
router.get('/gib/test-connection', authenticateToken, async (req, res) => {
  try {
    const isConnected = await gibService.testConnection();

    res.json({
      success: isConnected,
      data: {
        connected: isConnected,
        environment: process.env.NODE_ENV === 'production' ? 'Production' : 'Test',
      },
      message: isConnected 
        ? 'GİB servisleri erişilebilir' 
        : 'GİB servisleri erişilemiyor',
    });
  } catch (error: any) {
    log.error('Failed to test GIB connection:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to test GIB connection',
    });
  }
});

export default router;

