import { Router, Request, Response } from 'express';
import costAccountingService from '../services/costAccountingService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/cost-centers
 * Create a cost center
 */
router.post('/cost-centers', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const costCenter = await costAccountingService.createCostCenter({
      ...req.body,
      companyId
    });

    res.status(201).json({
      success: true,
      data: costCenter
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/cost-centers/hierarchy
 * Get cost center hierarchy
 */
router.get('/cost-centers/hierarchy', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const hierarchy = await costAccountingService.getCostCenterHierarchy(companyId);

    res.json({
      success: true,
      data: hierarchy
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/budget-items
 * Create a budget item
 */
router.post('/budget-items', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const budgetItem = await costAccountingService.createBudgetItem({
      ...req.body,
      companyId
    });

    res.status(201).json({
      success: true,
      data: budgetItem
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/budget-items/:id/actual
 * Update budget item actual amount
 */
router.put('/budget-items/:id/actual', async (req: Request, res: Response) => {
  try {
    const budgetItemId = parseInt(req.params.id);
    const { actualAmount } = req.body;
    
    const budgetItem = await costAccountingService.updateBudgetActual(budgetItemId, actualAmount);

    res.json({
      success: true,
      data: budgetItem
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/cost-allocations
 * Allocate cost to cost center
 */
router.post('/cost-allocations', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const allocation = await costAccountingService.allocateCost({
      ...req.body,
      companyId
    });

    res.status(201).json({
      success: true,
      data: allocation
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/profit-loss
 * Calculate profit/loss report
 */
router.get('/reports/profit-loss', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    const report = await costAccountingService.calculateProfitLoss(
      companyId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/budget
 * Track budget performance
 */
router.get('/reports/budget', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const { year, month, quarter } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        error: 'Year is required'
      });
    }

    const report = await costAccountingService.trackBudget(
      companyId,
      parseInt(year as string),
      month ? parseInt(month as string) : undefined,
      quarter ? parseInt(quarter as string) : undefined
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/budget-vs-actual
 * Compare budget vs actual
 */
router.get('/reports/budget-vs-actual', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        error: 'Year is required'
      });
    }

    const report = await costAccountingService.compareBudgetVsActual(
      companyId,
      parseInt(year as string)
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/cost
 * Generate comprehensive cost report
 */
router.get('/reports/cost', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    const report = await costAccountingService.generateCostReport(
      companyId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
