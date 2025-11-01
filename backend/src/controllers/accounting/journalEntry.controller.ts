import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

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
 * Generate next entry number for company (format: YYYY-NNN)
 */
async function generateEntryNumber(companyId: number, entryDate: Date): Promise<string> {
  const year = entryDate.getFullYear();
  const prefix = `${year}-`;

  // Get the last entry number for this year
  const lastEntry = await prisma.journalEntry.findFirst({
    where: {
      companyId,
      entryNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      entryNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastEntry) {
    const lastNumberStr = lastEntry.entryNumber.split('-')[1];
    const lastNumber = parseInt(lastNumberStr);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Validate journal entry items (debit must equal credit)
 */
function validateItems(items: any[]): { valid: boolean; message?: string; totalDebit: number; totalCredit: number } {
  if (items.length < 2) {
    return {
      valid: false,
      message: 'At least 2 journal entry items are required',
      totalDebit: 0,
      totalCredit: 0,
    };
  }

  const totalDebit = items.reduce((sum, item) => sum + Number(item.debit), 0);
  const totalCredit = items.reduce((sum, item) => sum + Number(item.credit), 0);

  // Check if debit equals credit (allow small floating point difference)
  const difference = Math.abs(totalDebit - totalCredit);
  if (difference > 0.01) {
    return {
      valid: false,
      message: `Total debit (${totalDebit}) must equal total credit (${totalCredit})`,
      totalDebit,
      totalCredit,
    };
  }

  // Check each item has either debit or credit, not both
  for (const item of items) {
    const debit = Number(item.debit);
    const credit = Number(item.credit);

    if (debit > 0 && credit > 0) {
      return {
        valid: false,
        message: `Item for account ${item.accountCode} cannot have both debit and credit`,
        totalDebit,
        totalCredit,
      };
    }

    if (debit === 0 && credit === 0) {
      return {
        valid: false,
        message: `Item for account ${item.accountCode} must have either debit or credit`,
        totalDebit,
        totalCredit,
      };
    }
  }

  return {
    valid: true,
    totalDebit,
    totalCredit,
  };
}

/**
 * Update account balances after journal entry posting
 */
async function updateAccountBalances(companyId: number, items: any[], reverse: boolean = false) {
  for (const item of items) {
    const account = await prisma.chartOfAccounts.findFirst({
      where: { companyId, code: item.accountCode },
    });

    if (!account) continue;

    const debit = Number(item.debit);
    const credit = Number(item.credit);
    const amount = reverse ? -(debit - credit) : (debit - credit);

    // Update balance based on normal balance type
    const newBalance = account.normalBalance === 'debit'
      ? Number(account.currentBalance) + amount
      : Number(account.currentBalance) - amount;

    await prisma.chartOfAccounts.update({
      where: { id: account.id },
      data: { currentBalance: newBalance },
    });
  }
}

/**
 * Get all journal entries with filtering and pagination
 */
export const getJournalEntries = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      status,
      entryType,
      startDate,
      endDate,
      search,
    } = req.query;

    const companyId = req.user!.companyId;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const where: any = { companyId };

    if (status) where.status = status;
    if (entryType) where.entryType = entryType;

    if (startDate || endDate) {
      where.entryDate = {};
      if (startDate) where.entryDate.gte = new Date(startDate as string);
      if (endDate) where.entryDate.lte = new Date(endDate as string);
    }

    if (search) {
      where.OR = [
        { entryNumber: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { reference: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get entries with pagination
    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { entryNumber: 'desc' },
        include: {
          journalEntryItems: {
            include: {
              account: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
            orderBy: { lineNumber: 'asc' },
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
          reversedEntry: {
            select: {
              id: true,
              entryNumber: true,
              entryDate: true,
            },
          },
        },
      }),
      prisma.journalEntry.count({ where }),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entries',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get a single journal entry by ID
 */
export const getJournalEntryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
      include: {
        journalEntryItems: {
          include: {
            account: true,
          },
          orderBy: { lineNumber: 'asc' },
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
        reversedEntry: {
          select: {
            id: true,
            entryNumber: true,
            entryDate: true,
            description: true,
          },
        },
        reversalEntry: {
          select: {
            id: true,
            entryNumber: true,
            entryDate: true,
            description: true,
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
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create a new journal entry
 */
export const createJournalEntry = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const createdBy = req.user!.id;
    const {
      entryDate,
      entryType,
      description,
      reference,
      items,
    } = req.body;

    // Validate items
    const validation = validateItems(items);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Check all account codes exist
    for (const item of items) {
      const account = await prisma.chartOfAccounts.findFirst({
        where: { companyId, code: item.accountCode },
      });

      if (!account) {
        return res.status(400).json({
          success: false,
          message: `Account code ${item.accountCode} not found`,
        });
      }

      if (!account.isActive) {
        return res.status(400).json({
          success: false,
          message: `Account ${item.accountCode} is inactive`,
        });
      }
    }

    // Generate entry number
    const entryNumber = await generateEntryNumber(companyId, new Date(entryDate));

    // Create journal entry with items
    const entry = await prisma.journalEntry.create({
      data: {
        companyId,
        entryNumber,
        entryDate: new Date(entryDate),
        entryType: entryType || 'general',
        description,
        reference,
        totalDebit: validation.totalDebit,
        totalCredit: validation.totalCredit,
        status: 'draft',
        createdBy,
        journalEntryItems: {
          create: items.map((item: any, index: number) => ({
            companyId,
            accountCode: item.accountCode,
            debit: Number(item.debit),
            credit: Number(item.credit),
            description: item.description,
            lineNumber: index + 1,
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
    });

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: entry,
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update a journal entry (only if status = draft)
 */
export const updateJournalEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;
    const {
      entryDate,
      entryType,
      description,
      reference,
      items,
    } = req.body;

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    if (entry.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft journal entries can be updated',
      });
    }

    // If items are provided, validate and update them
    let totalDebit = entry.totalDebit;
    let totalCredit = entry.totalCredit;

    if (items) {
      const validation = validateItems(items);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }

      // Check all account codes exist
      for (const item of items) {
        const account = await prisma.chartOfAccounts.findFirst({
          where: { companyId, code: item.accountCode },
        });

        if (!account) {
          return res.status(400).json({
            success: false,
            message: `Account code ${item.accountCode} not found`,
          });
        }
      }

      totalDebit = validation.totalDebit;
      totalCredit = validation.totalCredit;

      // Delete old items and create new ones
      await prisma.journalEntryItem.deleteMany({
        where: { journalEntryId: entry.id },
      });
    }

    const updated = await prisma.journalEntry.update({
      where: { id: entry.id },
      data: {
        ...(entryDate && { entryDate: new Date(entryDate) }),
        ...(entryType && { entryType }),
        ...(description !== undefined && { description }),
        ...(reference !== undefined && { reference }),
        ...(items && {
          totalDebit,
          totalCredit,
          journalEntryItems: {
            create: items.map((item: any, index: number) => ({
              companyId,
              accountCode: item.accountCode,
              debit: Number(item.debit),
              credit: Number(item.credit),
              description: item.description,
              lineNumber: index + 1,
            })),
          },
        }),
      },
      include: {
        journalEntryItems: {
          include: {
            account: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update journal entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Post a journal entry (lock it, make it permanent, update balances)
 */
export const postJournalEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;
    const postedBy = req.user!.id;

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
      include: {
        journalEntryItems: true,
      },
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    if (entry.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft journal entries can be posted',
      });
    }

    // Update account balances
    await updateAccountBalances(companyId, entry.journalEntryItems);

    // Update entry status
    const posted = await prisma.journalEntry.update({
      where: { id: entry.id },
      data: {
        status: 'posted',
        postedBy,
        postedAt: new Date(),
      },
      include: {
        journalEntryItems: {
          include: {
            account: {
              select: {
                code: true,
                name: true,
              },
            },
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

    res.json({
      success: true,
      message: 'Journal entry posted successfully',
      data: posted,
    });
  } catch (error) {
    console.error('Error posting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post journal entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Reverse a posted journal entry
 */
export const reverseJournalEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, reversalDate } = req.body;
    const companyId = req.user!.companyId;
    const createdBy = req.user!.id;

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
      include: {
        journalEntryItems: true,
      },
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    if (entry.status !== 'posted') {
      return res.status(400).json({
        success: false,
        message: 'Only posted journal entries can be reversed',
      });
    }

    if (entry.isReversed) {
      return res.status(400).json({
        success: false,
        message: 'This journal entry has already been reversed',
      });
    }

    const revDate = reversalDate ? new Date(reversalDate) : new Date();

    // Create reversal entry with opposite debit/credit
    const entryNumber = await generateEntryNumber(companyId, revDate);

    const reversalEntry = await prisma.journalEntry.create({
      data: {
        companyId,
        entryNumber,
        entryDate: revDate,
        entryType: 'reversal',
        description: `Reversal: ${entry.description} - ${reason}`,
        reference: entry.reference,
        totalDebit: entry.totalCredit, // Swap
        totalCredit: entry.totalDebit, // Swap
        status: 'posted',
        createdBy,
        postedBy: createdBy,
        postedAt: new Date(),
        reversedEntryId: entry.id,
        journalEntryItems: {
          create: entry.journalEntryItems.map((item, index) => ({
            companyId,
            accountCode: item.accountCode,
            debit: item.credit, // Swap
            credit: item.debit, // Swap
            description: `Reversal: ${item.description || ''}`,
            lineNumber: index + 1,
          })),
        },
      },
    });

    // Update original entry
    await prisma.journalEntry.update({
      where: { id: entry.id },
      data: {
        isReversed: true,
        status: 'reversed',
        reversalEntryId: reversalEntry.id,
      },
    });

    // Update account balances (reverse)
    await updateAccountBalances(companyId, entry.journalEntryItems, true);

    res.json({
      success: true,
      message: 'Journal entry reversed successfully',
      data: {
        originalEntry: entry,
        reversalEntry,
      },
    });
  } catch (error) {
    console.error('Error reversing journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reverse journal entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete a journal entry (only if status = draft)
 */
export const deleteJournalEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    if (entry.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft journal entries can be deleted',
      });
    }

    // Delete items first (cascade should handle this, but being explicit)
    await prisma.journalEntryItem.deleteMany({
      where: { journalEntryId: entry.id },
    });

    // Delete entry
    await prisma.journalEntry.delete({
      where: { id: entry.id },
    });

    res.json({
      success: true,
      message: 'Journal entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Validate a journal entry before saving
 */
export const validateJournalEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    const companyId = req.user!.companyId;

    // Validate items balance
    const validation = validateItems(items);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        totalDebit: validation.totalDebit,
        totalCredit: validation.totalCredit,
      });
    }

    // Check all account codes exist
    const accountErrors: string[] = [];
    for (const item of items) {
      const account = await prisma.chartOfAccounts.findFirst({
        where: { companyId, code: item.accountCode },
      });

      if (!account) {
        accountErrors.push(`Account code ${item.accountCode} not found`);
      } else if (!account.isActive) {
        accountErrors.push(`Account ${item.accountCode} - ${account.name} is inactive`);
      }
    }

    if (accountErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Account validation failed',
        errors: accountErrors,
      });
    }

    res.json({
      success: true,
      message: 'Journal entry is valid',
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
    });
  } catch (error) {
    console.error('Error validating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate journal entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
