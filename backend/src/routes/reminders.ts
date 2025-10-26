import express from 'express';
import { reminderService } from '../services/reminderService';
import { authenticateToken } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

/**
 * GET /api/reminders/test
 * Test reminder emails for current company
 */
router.get('/test', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;

    logger.info(`Testing reminders for company ${companyId}`);
    
    await reminderService.runAllReminders(companyId);

    res.json({
      success: true,
      message: 'Reminder emails sent (if any checks/notes are due)',
    });
  } catch (error: any) {
    logger.error('Test reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Reminder test failed',
      error: error.message,
    });
  }
});

/**
 * POST /api/reminders/run
 * Manually trigger reminders for current company
 */
router.post('/run', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;

    await reminderService.runAllReminders(companyId);

    res.json({
      success: true,
      message: 'Reminders processed successfully',
    });
  } catch (error: any) {
    logger.error('Manual reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run reminders',
      error: error.message,
    });
  }
});

/**
 * POST /api/reminders/schedule-all
 * Run reminders for all companies (admin only)
 */
router.post('/schedule-all', authenticateToken, async (req: any, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can trigger reminders for all companies',
      });
    }

    await reminderService.scheduleDailyReminders();

    res.json({
      success: true,
      message: 'Daily reminders scheduled for all companies',
    });
  } catch (error: any) {
    logger.error('Schedule all reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule reminders',
      error: error.message,
    });
  }
});

export default router;
