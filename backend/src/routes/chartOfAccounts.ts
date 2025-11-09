import express from 'express';
import { prisma } from '../index';
import { authenticateToken } from './auth';
import { log } from '../config/logger';

const router = express.Router();

/**
 * @route   GET /api/chart-of-accounts
 * @desc    Get all chart of accounts
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, search, limit = '1000' } = req.query;

    const where: any = {};

    if (type) {
      where.type = type as string;
    }

    if (search) {
      where.OR = [
        {
          code: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Query with limit for performance
    const accounts = await prisma.chartOfAccounts.findMany({
      where,
      orderBy: {
        code: 'asc',
      },
      take: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error: any) {
    log.error('Failed to get chart of accounts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get chart of accounts',
    });
  }
});

/**
 * @route   POST /api/chart-of-accounts
 * @desc    Create a new account
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { code, name, type, description } = req.body;

    // Validation
    if (!code || !name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: code, name, type',
      });
    }

    // Check if code already exists
    const existing = await prisma.chartOfAccounts.findUnique({
      where: { code },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Account code already exists',
      });
    }

    const account = await prisma.chartOfAccounts.create({
      data: {
        code,
        name,
        type,
        description,
      },
    });

    log.info('Chart of account created:', { accountId: account.id, code });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account,
    });
  } catch (error: any) {
    log.error('Failed to create chart of account:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create account',
    });
  }
});

/**
 * @route   GET /api/chart-of-accounts/:code
 * @desc    Get account by code
 * @access  Private
 */
router.get('/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;

    const account = await prisma.chartOfAccounts.findUnique({
      where: { code },
    });

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
    log.error('Failed to get chart of account:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get account',
    });
  }
});

/**
 * @route   PUT /api/chart-of-accounts/:code
 * @desc    Update account
 * @access  Private
 */
router.put('/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    const { name, type, description } = req.body;

    const account = await prisma.chartOfAccounts.update({
      where: { code },
      data: {
        name,
        type,
        description,
      },
    });

    log.info('Chart of account updated:', { accountId: account.id, code });

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: account,
    });
  } catch (error: any) {
    log.error('Failed to update chart of account:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update account',
    });
  }
});

/**
 * @route   DELETE /api/chart-of-accounts/:code
 * @desc    Delete account
 * @access  Private
 */
router.delete('/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;

    // Check if account is used in any journal entries
    const usageCount = await prisma.journalEntry.count({
      where: {
        OR: [
          { debitAccountCode: code },
          { creditAccountCode: code },
        ],
      },
    });

    if (usageCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete account. It is used in ${usageCount} journal entries.`,
      });
    }

    await prisma.chartOfAccounts.delete({
      where: { code },
    });

    log.info('Chart of account deleted:', { code });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    log.error('Failed to delete chart of account:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete account',
    });
  }
});

export default router;
