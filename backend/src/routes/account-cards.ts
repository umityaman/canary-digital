import express from 'express';
import { authenticateToken } from '../middleware/auth';
import logger from '../config/logger';
import * as accountCardService from '../services/accountCardService';

const router = express.Router();

// GET /api/account-cards - List account cards
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const { type, search, isActive, hasBalance } = req.query;
    const filters: any = {};
    if (type) filters.type = type;
    if (search) filters.search = search;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (hasBalance !== undefined) filters.hasBalance = hasBalance === 'true';
    const accountCards = await accountCardService.list(companyId, filters);
    res.json({ success: true, data: accountCards });
  } catch (error: any) {
    logger.error('List account cards error:', error);
    res.status(500).json({ success: false, message: 'Failed to list account cards', error: error.message });
  }
});

// GET /api/account-cards/stats - Get statistics
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const stats = await accountCardService.getStats(companyId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats', error: error.message });
  }
});

// GET /api/account-cards/top-debtors - Get top debtors
router.get('/top-debtors', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const debtors = await accountCardService.getTopDebtors(companyId, limit);
    res.json({ success: true, data: debtors });
  } catch (error: any) {
    logger.error('Get top debtors error:', error);
    res.status(500).json({ success: false, message: 'Failed to get top debtors', error: error.message });
  }
});

// GET /api/account-cards/age-analysis - Get aging analysis
router.get('/age-analysis', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const analysis = await accountCardService.getAgeAnalysisSummary(companyId);
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    logger.error('Get age analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to get age analysis', error: error.message });
  }
});

// GET /api/account-cards/:id - Get by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const accountCardId = parseInt(req.params.id);
    const accountCard = await accountCardService.getById(accountCardId, companyId);
    if (!accountCard) return res.status(404).json({ success: false, message: 'Account card not found' });
    res.json({ success: true, data: accountCard });
  } catch (error: any) {
    logger.error('Get account card error:', error);
    res.status(500).json({ success: false, message: 'Failed to get account card', error: error.message });
  }
});

// GET /api/account-cards/:id/age-analysis - Get card aging
router.get('/:id/age-analysis', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const accountCardId = parseInt(req.params.id);
    const analysis = await accountCardService.getAgeAnalysis(accountCardId, companyId);
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    logger.error('Get card age analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to get age analysis', error: error.message });
  }
});

// GET /api/account-cards/:id/report - Get transaction report
router.get('/:id/report', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const accountCardId = parseInt(req.params.id);
    const { startDate, endDate, type } = req.query;
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      filters.endDate = end;
    }
    if (type) filters.type = type;
    const report = await accountCardService.getTransactionReport(accountCardId, companyId, filters);
    res.json({ success: true, data: report });
  } catch (error: any) {
    logger.error('Get transaction report error:', error);
    res.status(500).json({ success: false, message: 'Failed to get transaction report', error: error.message });
  }
});

// POST /api/account-cards - Create
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.userId;
    const accountCard = await accountCardService.create(req.body, companyId, userId);
    res.status(201).json({ success: true, data: accountCard, message: 'Account card created successfully' });
  } catch (error: any) {
    logger.error('Create account card error:', error);
    res.status(500).json({ success: false, message: 'Failed to create account card', error: error.message });
  }
});

// POST /api/account-cards/:id/transactions - Add transaction
router.post('/:id/transactions', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.userId;
    const accountCardId = parseInt(req.params.id);
    const transaction = await accountCardService.addTransaction({ ...req.body, accountCardId }, companyId, userId);
    res.status(201).json({ success: true, data: transaction, message: 'Transaction added successfully' });
  } catch (error: any) {
    logger.error('Add transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to add transaction', error: error.message });
  }
});

// POST /api/account-cards/:id/calculate-balance - Recalculate balance
router.post('/:id/calculate-balance', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const accountCardId = parseInt(req.params.id);
    const balance = await accountCardService.calculateBalance(accountCardId, companyId);
    res.json({ success: true, data: { balance }, message: 'Balance recalculated successfully' });
  } catch (error: any) {
    logger.error('Calculate balance error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate balance', error: error.message });
  }
});

// PUT /api/account-cards/:id - Update
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const accountCardId = parseInt(req.params.id);
    const accountCard = await accountCardService.update(accountCardId, req.body, companyId);
    res.json({ success: true, data: accountCard, message: 'Account card updated successfully' });
  } catch (error: any) {
    logger.error('Update account card error:', error);
    res.status(500).json({ success: false, message: 'Failed to update account card', error: error.message });
  }
});

// DELETE /api/account-cards/:id - Delete
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const accountCardId = parseInt(req.params.id);
    await accountCardService.deleteAccountCard(accountCardId, companyId);
    res.json({ success: true, message: 'Account card deleted successfully' });
  } catch (error: any) {
    logger.error('Delete account card error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account card', error: error.message });
  }
});

export default router;
