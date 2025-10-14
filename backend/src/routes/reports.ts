import express from 'express';
import { ReportService } from '../services/ReportService';

const router = express.Router();
const reportService = new ReportService();

/**
 * GET /api/reports/dashboard
 * Get dashboard summary statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required',
      });
    }

    const stats = await reportService.getDashboardStats({
      companyId: parseInt(companyId as string),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard statistics',
    });
  }
});

/**
 * GET /api/reports/revenue
 * Get revenue report by period
 */
router.get('/revenue', async (req, res) => {
  try {
    const { companyId, startDate, endDate, groupBy } = req.query;

    if (!companyId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, start date, and end date are required',
      });
    }

    const report = await reportService.getRevenueReport({
      companyId: parseInt(companyId as string),
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      groupBy: (groupBy as 'day' | 'week' | 'month') || 'day',
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Get revenue report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get revenue report',
    });
  }
});

/**
 * GET /api/reports/equipment
 * Get equipment performance report
 */
router.get('/equipment', async (req, res) => {
  try {
    const { companyId, startDate, endDate, equipmentId } = req.query;

    if (!companyId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, start date, and end date are required',
      });
    }

    const report = await reportService.getEquipmentReport({
      companyId: parseInt(companyId as string),
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      equipmentId: equipmentId ? parseInt(equipmentId as string) : undefined,
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Get equipment report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get equipment report',
    });
  }
});

/**
 * GET /api/reports/customers
 * Get customer report
 */
router.get('/customers', async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;

    if (!companyId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, start date, and end date are required',
      });
    }

    const report = await reportService.getCustomerReport({
      companyId: parseInt(companyId as string),
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Get customer report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get customer report',
    });
  }
});

/**
 * GET /api/reports/categories
 * Get category performance report
 */
router.get('/categories', async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;

    if (!companyId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, start date, and end date are required',
      });
    }

    const report = await reportService.getCategoryReport({
      companyId: parseInt(companyId as string),
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Get category report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get category report',
    });
  }
});

export default router;
