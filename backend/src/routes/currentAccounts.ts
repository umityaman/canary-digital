import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as currentAccountService from '../services/currentAccountService';

const router = express.Router();

/**
 * GET /api/current-accounts/balances
 * Get balances for all customers
 */
router.get('/balances', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { hasBalance, minBalance, maxBalance } = req.query;

    const filters: any = {};
    if (hasBalance === 'true') filters.hasBalance = true;
    if (minBalance) filters.minBalance = parseFloat(minBalance as string);
    if (maxBalance) filters.maxBalance = parseFloat(maxBalance as string);

    const balances = await currentAccountService.getAllCustomerBalances(filters);

    res.json({
      success: true,
      data: balances,
      count: balances.length
    });
  } catch (error: any) {
    console.error('Error fetching customer balances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer balances',
      error: error.message
    });
  }
});

/**
 * GET /api/current-accounts/balances/:customerId
 * Get balance for a specific customer
 */
router.get('/balances/:customerId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId);

    if (isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const balance = await currentAccountService.getCustomerBalance(customerId);

    res.json({
      success: true,
      data: balance
    });
  } catch (error: any) {
    console.error('Error fetching customer balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer balance',
      error: error.message
    });
  }
});

/**
 * GET /api/current-accounts/statement/:customerId
 * Get account statement for a customer
 */
router.get('/statement/:customerId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const { startDate, endDate } = req.query;

    if (isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const periodStart = new Date(startDate as string);
    const periodEnd = new Date(endDate as string);

    if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const statement = await currentAccountService.getCustomerStatement(
      customerId,
      periodStart,
      periodEnd
    );

    res.json({
      success: true,
      data: statement
    });
  } catch (error: any) {
    console.error('Error generating customer statement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate customer statement',
      error: error.message
    });
  }
});

/**
 * GET /api/current-accounts/aging
 * Get aging report for all customers
 */
router.get('/aging', authenticateToken, async (req: Request, res: Response) => {
  try {
    const reports = await currentAccountService.getAllAgingReports();

    res.json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (error: any) {
    console.error('Error generating aging reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate aging reports',
      error: error.message
    });
  }
});

/**
 * GET /api/current-accounts/aging/:customerId
 * Get aging report for a specific customer
 */
router.get('/aging/:customerId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId);

    if (isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const report = await currentAccountService.getCustomerAgingReport(customerId);

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    console.error('Error generating aging report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate aging report',
      error: error.message
    });
  }
});

/**
 * GET /api/current-accounts/transactions/:customerId
 * Get transaction history for a customer
 */
router.get('/transactions/:customerId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const { limit, offset, startDate, endDate } = req.query;

    if (isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const options: any = {};
    if (limit) options.limit = parseInt(limit as string);
    if (offset) options.offset = parseInt(offset as string);
    if (startDate) options.startDate = new Date(startDate as string);
    if (endDate) options.endDate = new Date(endDate as string);

    const result = await currentAccountService.getCustomerTransactionHistory(customerId, options);

    res.json({
      success: true,
      data: result.transactions,
      total: result.total,
      limit: options.limit,
      offset: options.offset
    });
  } catch (error: any) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history',
      error: error.message
    });
  }
});

/**
 * GET /api/current-accounts/summary
 * Get summary statistics for all current accounts
 */
router.get('/summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const balances = await currentAccountService.getAllCustomerBalances();
    const agingReports = await currentAccountService.getAllAgingReports();

    // Calculate summary statistics
    let totalReceivables = 0;  // Total alacaklar
    let totalPayables = 0;     // Total borçlar
    let activeAccounts = 0;

    for (const balance of balances) {
      if (balance.balance !== 0) {
        activeAccounts++;
      }
      if (balance.balance > 0) {
        totalReceivables += balance.balance;
      } else if (balance.balance < 0) {
        totalPayables += Math.abs(balance.balance);
      }
    }

    // Calculate overdue totals
    let totalOverdue = 0;
    let overdueAccounts = 0;

    for (const report of agingReports) {
      if (report.totalOverdue > 0) {
        totalOverdue += report.totalOverdue;
        overdueAccounts++;
      }
    }

    res.json({
      success: true,
      data: {
        totalReceivables,
        totalPayables,
        netBalance: totalReceivables - totalPayables,
        activeAccounts,
        totalAccounts: balances.length,
        totalOverdue,
        overdueAccounts,
        agingSummary: {
          days30to60: agingReports.reduce((sum, r) => sum + r.days30to60, 0),
          days60to90: agingReports.reduce((sum, r) => sum + r.days60to90, 0),
          over90: agingReports.reduce((sum, r) => sum + r.over90, 0)
        }
      }
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error.message
    });
  }
});

export default router;
