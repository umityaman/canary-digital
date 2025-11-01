import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    companyId: number;
    role: string;
  };
}

/**
 * Get all chart of accounts with filtering and pagination
 */
export const getChartOfAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '100',
      search,
      type,
      category,
      level,
      parentCode,
      isActive,
      isSystem,
    } = req.query;

    const companyId = req.user!.companyId;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const where: any = { companyId };

    if (search) {
      where.OR = [
        { code: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        { nameEn: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (category) where.category = category;
    if (level) where.level = parseInt(level as string);
    if (parentCode) where.parentCode = parentCode;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isSystem !== undefined) where.isSystem = isSystem === 'true';

    // Get accounts with pagination
    const [accounts, total] = await Promise.all([
      prisma.chartOfAccounts.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { code: 'asc' },
        include: {
          parent: {
            select: { code: true, name: true },
          },
          children: {
            select: { code: true, name: true },
          },
          _count: {
            select: {
              journalEntryItems: true,
              children: true,
            },
          },
        },
      }),
      prisma.chartOfAccounts.count({ where }),
    ]);

    res.json({
      success: true,
      data: accounts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching chart of accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart of accounts',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get chart of accounts in hierarchical structure
 */
export const getChartOfAccountsHierarchy = async (req: AuthRequest, res: Response) => {
  try {
    const { type, rootCode } = req.query;
    const companyId = req.user!.companyId;

    const where: any = {
      companyId,
      isActive: true,
    };

    if (type) where.type = type;
    if (rootCode) {
      where.OR = [
        { code: rootCode },
        { parentCode: rootCode },
        { code: { startsWith: rootCode as string } },
      ];
    } else {
      where.level = 1; // Root level accounts only
    }

    const accounts = await prisma.chartOfAccounts.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        children: {
          orderBy: { code: 'asc' },
          include: {
            children: {
              orderBy: { code: 'asc' },
              include: {
                children: {
                  orderBy: { code: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error('Error fetching chart hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart hierarchy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get a single chart of account by code
 */
export const getChartOfAccountByCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const companyId = req.user!.companyId;

    const account = await prisma.chartOfAccounts.findFirst({
      where: {
        companyId,
        code,
      },
      include: {
        parent: true,
        children: true,
        journalEntryItems: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            journalEntry: {
              select: {
                entryNumber: true,
                entryDate: true,
                description: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            journalEntryItems: true,
            children: true,
          },
        },
      },
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
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create a new chart of account
 */
export const createChartOfAccount = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const {
      code,
      name,
      nameEn,
      type,
      category,
      level,
      parentCode,
      normalBalance,
      isActive = true,
    } = req.body;

    // Check if code already exists
    const existing = await prisma.chartOfAccounts.findFirst({
      where: { companyId, code },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Account code already exists',
      });
    }

    // Validate parent if provided
    if (parentCode) {
      const parent = await prisma.chartOfAccounts.findFirst({
        where: { companyId, code: parentCode },
      });

      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent account not found',
        });
      }

      // Validate level (must be parent.level + 1)
      if (level !== parent.level + 1) {
        return res.status(400).json({
          success: false,
          message: `Account level must be ${parent.level + 1} (parent level + 1)`,
        });
      }
    } else if (level !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Root accounts must have level 1',
      });
    }

    const account = await prisma.chartOfAccounts.create({
      data: {
        companyId,
        code,
        name,
        nameEn,
        type,
        category,
        level,
        parentCode,
        normalBalance,
        currentBalance: 0,
        isActive,
        isSystem: false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account,
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update a chart of account
 */
export const updateChartOfAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const companyId = req.user!.companyId;
    const { name, nameEn, category, parentCode, isActive } = req.body;

    const account = await prisma.chartOfAccounts.findFirst({
      where: { companyId, code },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Don't allow updating system accounts' critical fields
    if (account.isSystem && (parentCode !== undefined || category !== account.category)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify structure of system accounts',
      });
    }

    // Validate parent if changing
    if (parentCode !== undefined && parentCode !== account.parentCode) {
      if (parentCode) {
        const parent = await prisma.chartOfAccounts.findFirst({
          where: { companyId, code: parentCode },
        });

        if (!parent) {
          return res.status(400).json({
            success: false,
            message: 'Parent account not found',
          });
        }

        // Check for circular reference
        if (parentCode === code) {
          return res.status(400).json({
            success: false,
            message: 'Account cannot be its own parent',
          });
        }
      }
    }

    const updated = await prisma.chartOfAccounts.update({
      where: { id: account.id },
      data: {
        ...(name && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(category && { category }),
        ...(parentCode !== undefined && { parentCode }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update account',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete (soft delete) a chart of account
 */
export const deleteChartOfAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const companyId = req.user!.companyId;

    const account = await prisma.chartOfAccounts.findFirst({
      where: { companyId, code },
      include: {
        _count: {
          select: {
            journalEntryItems: true,
            children: true,
          },
        },
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Don't allow deleting system accounts
    if (account.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete system accounts',
      });
    }

    // Don't allow deleting accounts with journal entries
    if (account._count.journalEntryItems > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with journal entries. Deactivate instead.',
      });
    }

    // Don't allow deleting accounts with children
    if (account._count.children > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with sub-accounts',
      });
    }

    // Soft delete by setting isActive to false
    await prisma.chartOfAccounts.update({
      where: { id: account.id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get account balance and movements
 */
export const getAccountBalance = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const { startDate, endDate } = req.query;
    const companyId = req.user!.companyId;

    const account = await prisma.chartOfAccounts.findFirst({
      where: { companyId, code },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.journalEntry = {
        entryDate: {},
      };
      if (startDate) dateFilter.journalEntry.entryDate.gte = new Date(startDate as string);
      if (endDate) dateFilter.journalEntry.entryDate.lte = new Date(endDate as string);
    }

    // Get journal entry items for this account
    const items = await prisma.journalEntryItem.findMany({
      where: {
        companyId,
        accountCode: code,
        ...dateFilter,
      },
      include: {
        journalEntry: {
          select: {
            entryNumber: true,
            entryDate: true,
            description: true,
            status: true,
            reference: true,
          },
        },
      },
      orderBy: {
        journalEntry: {
          entryDate: 'asc',
        },
      },
    });

    // Calculate totals
    const totalDebit = items.reduce((sum, item) => sum + Number(item.debit), 0);
    const totalCredit = items.reduce((sum, item) => sum + Number(item.credit), 0);
    const balance = account.normalBalance === 'debit'
      ? totalDebit - totalCredit
      : totalCredit - totalDebit;

    res.json({
      success: true,
      data: {
        account: {
          code: account.code,
          name: account.name,
          type: account.type,
          normalBalance: account.normalBalance,
          currentBalance: account.currentBalance,
        },
        movements: {
          totalDebit,
          totalCredit,
          balance,
          count: items.length,
        },
        items: items.map(item => ({
          id: item.id,
          debit: item.debit,
          credit: item.credit,
          description: item.description,
          entryNumber: item.journalEntry.entryNumber,
          entryDate: item.journalEntry.entryDate,
          entryDescription: item.journalEntry.description,
          status: item.journalEntry.status,
          reference: item.journalEntry.reference,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching account balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account balance',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
