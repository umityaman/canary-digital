import { Router, Request, Response } from 'express';
import stockMovementService from '../services/stockMovementService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/stock/movements
 * Record a generic stock movement
 */
router.post('/movements', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const movement = await stockMovementService.recordMovement({
      ...req.body,
      companyId
    });

    res.status(201).json({
      success: true,
      data: movement
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stock/sales
 * Record a sale movement
 */
router.post('/sales', async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user as any;
    const movement = await stockMovementService.recordSale({
      ...req.body,
      companyId,
      userId
    });

    res.status(201).json({
      success: true,
      data: movement
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stock/returns
 * Record a return movement
 */
router.post('/returns', async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user as any;
    const movement = await stockMovementService.recordReturn({
      ...req.body,
      companyId,
      userId
    });

    res.status(201).json({
      success: true,
      data: movement
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stock/transfers
 * Create a stock transfer
 */
router.post('/transfers', async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user as any;
    const transfer = await stockMovementService.recordTransfer({
      ...req.body,
      companyId,
      requestedBy: userId
    });

    res.status(201).json({
      success: true,
      data: transfer
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stock/transfers/:id/complete
 * Complete a stock transfer
 */
router.post('/transfers/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user as any;
    const transferId = parseInt(req.params.id);
    
    const transfer = await stockMovementService.completeTransfer(transferId, userId);

    res.json({
      success: true,
      data: transfer
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stock/adjust
 * Adjust stock quantity
 */
router.post('/adjust', async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user as any;
    const movement = await stockMovementService.adjustStock({
      ...req.body,
      companyId,
      userId
    });

    res.json({
      success: true,
      data: movement
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/stock/movements/:equipmentId
 * Get movement history for equipment
 */
router.get('/movements/:equipmentId', async (req: Request, res: Response) => {
  try {
    const equipmentId = parseInt(req.params.equipmentId);
    const { movementType, startDate, endDate, limit, offset } = req.query;

    const options: any = {};
    if (movementType) options.movementType = movementType as string;
    if (startDate) options.startDate = new Date(startDate as string);
    if (endDate) options.endDate = new Date(endDate as string);
    if (limit) options.limit = parseInt(limit as string);
    if (offset) options.offset = parseInt(offset as string);

    const movements = await stockMovementService.getMovementHistory(equipmentId, options);

    res.json({
      success: true,
      data: movements
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/stock/alerts
 * Get active stock alerts
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const { severity, alertType } = req.query;

    const options: any = {};
    if (severity) options.severity = severity as string;
    if (alertType) options.alertType = alertType as string;

    const alerts = await stockMovementService.getActiveAlerts(companyId, options);

    res.json({
      success: true,
      data: alerts
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stock/alerts/:id/acknowledge
 * Acknowledge an alert
 */
router.post('/alerts/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user as any;
    const alertId = parseInt(req.params.id);
    
    const alert = await stockMovementService.acknowledgeAlert(alertId, userId);

    res.json({
      success: true,
      data: alert
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stock/alerts/generate
 * Generate alerts for all equipment
 */
router.post('/alerts/generate', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const alerts = await stockMovementService.generateAlerts(companyId);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/stock/summary
 * Get stock summary
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user as any;
    const { category, lowStockOnly } = req.query;

    const options: any = {};
    if (category) options.category = category as string;
    if (lowStockOnly) options.lowStockOnly = lowStockOnly === 'true';

    const summary = await stockMovementService.getStockSummary(companyId, options);

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
