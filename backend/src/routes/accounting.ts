import express from 'express';
import { accountingService } from '../services/accounting.service';
import { authenticateToken } from './auth';
import { log } from '../config/logger';

const router = express.Router();

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
    const companyId = (req as any).user?.companyId || 1;

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
    const companyId = (req as any).user?.companyId || 1;

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
 * @route   GET /api/accounting/cari
 * @desc    Cari hesap özeti (müşteri bazlı alacak-borç)
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
 * @route   GET /api/accounting/vat-report
 * @desc    KDV raporu
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
    const companyId = (req as any).user?.companyId || 1;

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
    log.error('Failed to get expenses:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get expenses',
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

    const companyId = (req as any).user?.companyId || 1;

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

export default router;
