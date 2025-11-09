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
      sortBy = 'entryDate',
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
          journalEntryItems: {
            include: {
              account: {
                select: {
                  code: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
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
      entryDate,
      description,
      items, // Array of { accountCode, debit, credit }
      reference,
      companyId,
    } = req.body;

    // Validation
    if (!entryDate || !description || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: entryDate, description, items',
      });
    }

    // Verify balanced (total debit = total credit)
    const totalDebit = items.reduce((sum: number, item: any) => sum + (parseFloat(item.debit) || 0), 0);
    const totalCredit = items.reduce((sum: number, item: any) => sum + (parseFloat(item.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Journal entry not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`,
      });
    }

    // Get next entry number
    const lastEntry = await prisma.journalEntry.findFirst({
      where: { companyId: companyId || 1 },
      orderBy: { entryNumber: 'desc' },
    });

    const year = new Date().getFullYear();
    const nextNum = lastEntry ? parseInt(lastEntry.entryNumber.split('-')[1]) + 1 : 1;
    const entryNumber = `${year}-${String(nextNum).padStart(4, '0')}`;

    const entry = await prisma.journalEntry.create({
      data: {
        entryNumber,
        entryDate: new Date(entryDate),
        description,
        reference,
        totalDebit,
        totalCredit,
        companyId: companyId || 1,
        createdBy: (req as any).user?.id || 1,
        status: 'posted',
        journalEntryItems: {
          create: items.map((item: any) => ({
            accountCode: item.accountCode,
            debit: parseFloat(item.debit) || 0,
            credit: parseFloat(item.credit) || 0,
            description: item.description || description,
          })),
        },
      },
      include: {
        journalEntryItems: {
          include: {
            account: {
              select: {
                code: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    log.info('Journal entry created:', { entryId: entry.id, entryNumber });

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
        journalEntryItems: {
          include: {
            account: {
              select: {
                code: true,
                name: true,
                type: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        poster: {
          select: {
            id: true,
            name: true,
            email: true,
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
