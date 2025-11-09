import express from 'express';
import { prisma } from '../index';
import { authenticateToken } from './auth';
import { log } from '../config/logger';

const router = express.Router();

/**
 * @route   GET /api/journal-entries
 * @desc    Get all journal entries with pagination and filtering
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      sortBy = 'date',
      sortOrder = 'desc',
      startDate,
      endDate,
      accountCode,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    if (accountCode) {
      where.OR = [
        { debitAccountCode: accountCode as string },
        { creditAccountCode: accountCode as string },
      ];
    }

    if (search) {
      where.description = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: {
          debitAccount: {
            select: {
              code: true,
              name: true,
            },
          },
          creditAccount: {
            select: {
              code: true,
              name: true,
            },
          },
        },
        orderBy: {
          [sortBy as string]: sortOrder as string,
        },
        skip,
        take: limitNum,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        entries,
        total,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error: any) {
    log.error('Failed to get journal entries:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get journal entries',
    });
  }
});

/**
 * @route   POST /api/journal-entries
 * @desc    Create a new journal entry
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      date,
      description,
      debitAccountCode,
      creditAccountCode,
      amount,
      reference,
    } = req.body;

    // Validation
    if (!date || !description || !debitAccountCode || !creditAccountCode || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Verify accounts exist
    const [debitAccount, creditAccount] = await Promise.all([
      prisma.chartOfAccounts.findUnique({
        where: { code: debitAccountCode },
      }),
      prisma.chartOfAccounts.findUnique({
        where: { code: creditAccountCode },
      }),
    ]);

    if (!debitAccount || !creditAccount) {
      return res.status(404).json({
        success: false,
        message: 'One or both account codes not found',
      });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        date: new Date(date),
        description,
        debitAccountCode,
        creditAccountCode,
        amount: parseFloat(amount),
        reference,
      },
      include: {
        debitAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        creditAccount: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    log.info('Journal entry created:', { entryId: entry.id });

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: entry,
    });
  } catch (error: any) {
    log.error('Failed to create journal entry:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create journal entry',
    });
  }
});

/**
 * @route   GET /api/journal-entries/:id
 * @desc    Get journal entry by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.journalEntry.findUnique({
      where: { id: parseInt(id) },
      include: {
        debitAccount: {
          select: {
            code: true,
            name: true,
          },
        },
        creditAccount: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error: any) {
    log.error('Failed to get journal entry:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get journal entry',
    });
  }
});

/**
 * @route   DELETE /api/journal-entries/:id
 * @desc    Delete journal entry
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.journalEntry.delete({
      where: { id: parseInt(id) },
    });

    log.info('Journal entry deleted:', { entryId: id });

    res.json({
      success: true,
      message: 'Journal entry deleted successfully',
    });
  } catch (error: any) {
    log.error('Failed to delete journal entry:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete journal entry',
    });
  }
});

export default router;
