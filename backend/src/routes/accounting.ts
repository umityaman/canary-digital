import express from 'express';
import { accountingService } from '../services/accounting.service';
import { authenticateToken } from './auth';
import { log } from '../config/logger';

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
 * @desc    Gelir kaydı ekle (TODO)
 * @access  Private
 */
router.post('/income', authenticateToken, async (req, res) => {
  try {
    // TODO: Expense model oluşturulunca implement edilecek
    res.status(501).json({
      success: false,
      message: 'Income recording endpoint - Coming soon (Expense model required)',
    });
  } catch (error: any) {
    log.error('Failed to record income:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record income',
    });
  }
});

/**
 * @route   POST /api/accounting/expense
 * @desc    Gider kaydı ekle (TODO)
 * @access  Private
 */
router.post('/expense', authenticateToken, async (req, res) => {
  try {
    // TODO: Expense model oluşturulunca implement edilecek
    res.status(501).json({
      success: false,
      message: 'Expense recording endpoint - Coming soon (Expense model required)',
    });
  } catch (error: any) {
    log.error('Failed to record expense:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record expense',
    });
  }
});

export default router;
