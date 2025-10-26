import express from 'express';
import { accountingService } from '../services/accounting.service';
import { authenticateToken } from './auth';
import { log } from '../config/logger';
import { prisma } from '../index';

const router = express.Router();

/**
 * @route   GET /api/accounting/stats
 * @desc    Dashboard quick stats (gelir, gider, kâr, tahsilat)
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
 * @route   GET /api/accounting/chart-data
 * @desc    Dashboard chart data (trend + category distribution)
 * @access  Private
 * @query   months (default: 12) OR startDate + endDate for custom range
 */
router.get('/chart-data', authenticateToken, async (req, res) => {
  try {
    const { startDate: startParam, endDate: endParam } = req.query;
    
    let startDate: Date;
    let endDate: Date;
    let months = 12;

    // Custom date range or default to last N months
    if (startParam && endParam) {
      startDate = new Date(startParam as string);
      endDate = new Date(endParam as string);
      endDate.setHours(23, 59, 59, 999);
      
      // Calculate months between dates for trend data
      months = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      months = Math.max(1, Math.min(months, 24)); // Between 1-24 months
    } else {
      months = req.query.months ? parseInt(req.query.months as string) : 12;
      endDate = new Date();
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
    }

    // Trend data - group by month
    const trendData = [];
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const [incomes, expenses] = await Promise.all([
        prisma.income.findMany({
          where: {
            date: { gte: monthStart, lte: monthEnd },
            status: 'received',
          },
          select: { amount: true },
        }),
        prisma.expense.findMany({
          where: {
            date: { gte: monthStart, lte: monthEnd },
            status: 'paid',
          },
          select: { amount: true },
        }),
      ]);

      const incomeTotal = incomes.reduce((sum, i) => sum + i.amount, 0);
      const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

      trendData.push({
        month: monthStart.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
        income: incomeTotal,
        expense: expenseTotal,
        profit: incomeTotal - expenseTotal,
      });
    }

    // Category distribution - use same date range as trend
    const categoryStartDate = startDate;
    const categoryEndDate = endDate;

    const [incomesByCategory, expensesByCategory] = await Promise.all([
      prisma.income.groupBy({
        by: ['category'],
        where: {
          date: { gte: categoryStartDate, lte: categoryEndDate },
          status: 'received',
        },
        _sum: { amount: true },
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where: {
          date: { gte: categoryStartDate, lte: categoryEndDate },
          status: 'paid',
        },
        _sum: { amount: true },
      }),
    ]);

    const incomeCategoryData = incomesByCategory.map(item => ({
      name: item.category,
      value: item._sum.amount || 0,
      percentage: 0, // Will be calculated
    }));

    const expenseCategoryData = expensesByCategory.map(item => ({
      name: item.category,
      value: item._sum.amount || 0,
      percentage: 0,
    }));

    // Calculate percentages
    const incomeTotal = incomeCategoryData.reduce((sum, item) => sum + item.value, 0);
    const expenseTotal = expenseCategoryData.reduce((sum, item) => sum + item.value, 0);

    incomeCategoryData.forEach(item => {
      item.percentage = incomeTotal > 0 ? (item.value / incomeTotal) * 100 : 0;
    });

    expenseCategoryData.forEach(item => {
      item.percentage = expenseTotal > 0 ? (item.value / expenseTotal) * 100 : 0;
    });

    res.json({
      success: true,
      data: {
        trend: trendData,
        incomeCategories: incomeCategoryData.sort((a, b) => b.value - a.value),
        expenseCategories: expenseCategoryData.sort((a, b) => b.value - a.value),
      },
    });
  } catch (error: any) {
    log.error('Failed to get chart data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get chart data',
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
 * @route   POST /api/accounting/income
 * @desc    Gelir kaydı ekle
 * @access  Private
 */
router.post('/income', authenticateToken, async (req, res) => {
  try {
    const { description, amount, category, date, paymentMethod, notes, status, invoiceId } = req.body;
    const companyId = req.user?.companyId || 1;

    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'description, amount, category, date are required',
      });
    }

    const income = await prisma.income.create({
      data: {
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        companyId,
        paymentMethod,
        notes,
        status: status || 'received',
        invoiceId: invoiceId ? parseInt(invoiceId) : undefined,
      },
    });

    res.json({
      success: true,
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
 * @route   GET /api/accounting/incomes
 * @desc    Gelirleri listele
 * @access  Private
 */
router.get('/incomes', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId || 1;
    const { category, startDate, endDate, limit = '50', offset = '0' } = req.query;

    const where: any = { companyId };
    
    if (category) {
      where.category = category as string;
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },
    });

    const total = await prisma.income.count({ where });

    res.json({
      success: true,
      data: incomes,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error: any) {
    log.error('Failed to fetch incomes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch incomes',
    });
  }
});

/**
 * @route   GET /api/accounting/expenses
 * @desc    Giderleri listele
 * @access  Private
 */
router.get('/expenses', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId || 1;
    const { category, startDate, endDate, limit = '50', offset = '0' } = req.query;

    const where: any = { companyId };
    
    if (category) {
      where.category = category as string;
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.expense.count({ where });

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error: any) {
    log.error('Failed to fetch expenses:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch expenses',
    });
  }
});

/**
 * @route   PUT /api/accounting/income/:id
 * @desc    Gelir kaydını güncelle
 * @access  Private
 */
router.put('/income/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date, paymentMethod, notes, status, invoiceId } = req.body;
    const companyId = req.user?.companyId || 1;

    // Check if income exists and belongs to user's company
    const existing = await prisma.income.findFirst({
      where: { id: parseInt(id), companyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Income not found',
      });
    }

    const income = await prisma.income.update({
      where: { id: parseInt(id) },
      data: {
        description,
        amount: amount ? parseFloat(amount) : undefined,
        category,
        date: date ? new Date(date) : undefined,
        paymentMethod,
        notes,
        status,
        invoiceId: invoiceId ? parseInt(invoiceId) : null,
      },
    });

    res.json({
      success: true,
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
 * @route   PUT /api/accounting/expense/:id
 * @desc    Gider kaydını güncelle
 * @access  Private
 */
router.put('/expense/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date, paymentMethod, notes, status } = req.body;
    const companyId = req.user?.companyId || 1;

    // Check if expense exists and belongs to user's company
    const existing = await prisma.expense.findFirst({
      where: { id: parseInt(id), companyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const expense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        description,
        amount: amount ? parseFloat(amount) : undefined,
        category,
        date: date ? new Date(date) : undefined,
        paymentMethod,
        notes,
        status,
      },
    });

    res.json({
      success: true,
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
 * @route   DELETE /api/accounting/income/:id
 * @desc    Gelir kaydını sil
 * @access  Private
 */
router.delete('/income/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId || 1;

    // Check if income exists and belongs to user's company
    const existing = await prisma.income.findFirst({
      where: { id: parseInt(id), companyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Income not found',
      });
    }

    await prisma.income.delete({
      where: { id: parseInt(id) },
    });

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
 * @route   DELETE /api/accounting/expense/:id
 * @desc    Gider kaydını sil
 * @access  Private
 */
router.delete('/expense/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId || 1;

    // Check if expense exists and belongs to user's company
    const existing = await prisma.expense.findFirst({
      where: { id: parseInt(id), companyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });

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
 * @route   POST /api/accounting/expense
 * @desc    Gider kaydı ekle
 * @access  Private
 */
router.post('/expense', authenticateToken, async (req, res) => {
  try {
    const { description, amount, category, date, paymentMethod, notes, status } = req.body;
    const companyId = req.user?.companyId || 1;

    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'description, amount, category, date are required',
      });
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        companyId,
        paymentMethod,
        notes,
        status: status || 'pending',
      },
    });

    res.json({
      success: true,
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

export default router;
