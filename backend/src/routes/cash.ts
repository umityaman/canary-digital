import express from 'express';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get cash transactions list with pagination
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const companyId = (req as any).user.companyId;
    const { page = '1', limit = '20', type, startDate, endDate } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {
      companyId,
    };

    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.cashTransaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.cashTransaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get cash transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Kasa işlemleri alınamadı',
      error: error.message,
    });
  }
});

// Get single cash transaction
router.get('/transactions/:id', authenticate, async (req, res) => {
  try {
    const companyId = (req as any).user.companyId;
    const transactionId = parseInt(req.params.id);

    const transaction = await prisma.cashTransaction.findFirst({
      where: {
        id: transactionId,
        companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı',
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    console.error('Get cash transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'İşlem alınamadı',
      error: error.message,
    });
  }
});

// Create new cash transaction
router.post('/transactions', authenticate, async (req, res) => {
  try {
    const companyId = (req as any).user.companyId;
    const userId = (req as any).user.id;
    const { type, amount, description, currency = 'TRY', date } = req.body;

    // Validation
    if (!type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Tip ve tutar zorunludur',
      });
    }

    if (type !== 'in' && type !== 'out') {
      return res.status(400).json({
        success: false,
        message: 'Tip "in" veya "out" olmalıdır',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Tutar pozitif olmalıdır',
      });
    }

    const transaction = await prisma.cashTransaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        currency,
        date: date ? new Date(date) : new Date(),
        companyId,
        userId,
      },
      include: {
        user: {
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
      message: 'Kasa işlemi oluşturuldu',
      data: transaction,
    });
  } catch (error: any) {
    console.error('Create cash transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Kasa işlemi oluşturulamadı',
      error: error.message,
    });
  }
});

// Update cash transaction
router.put('/transactions/:id', authenticate, async (req, res) => {
  try {
    const companyId = (req as any).user.companyId;
    const transactionId = parseInt(req.params.id);
    const { type, amount, description, currency, date } = req.body;

    // Check if transaction exists and belongs to company
    const existingTransaction = await prisma.cashTransaction.findFirst({
      where: {
        id: transactionId,
        companyId,
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı',
      });
    }

    // Validation
    if (type && type !== 'in' && type !== 'out') {
      return res.status(400).json({
        success: false,
        message: 'Tip "in" veya "out" olmalıdır',
      });
    }

    if (amount && amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Tutar pozitif olmalıdır',
      });
    }

    const updateData: any = {};
    if (type) updateData.type = type;
    if (amount) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description;
    if (currency) updateData.currency = currency;
    if (date) updateData.date = new Date(date);

    const transaction = await prisma.cashTransaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        user: {
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
      message: 'Kasa işlemi güncellendi',
      data: transaction,
    });
  } catch (error: any) {
    console.error('Update cash transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Kasa işlemi güncellenemedi',
      error: error.message,
    });
  }
});

// Delete cash transaction
router.delete('/transactions/:id', authenticate, async (req, res) => {
  try {
    const companyId = (req as any).user.companyId;
    const transactionId = parseInt(req.params.id);

    // Check if transaction exists and belongs to company
    const existingTransaction = await prisma.cashTransaction.findFirst({
      where: {
        id: transactionId,
        companyId,
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı',
      });
    }

    await prisma.cashTransaction.delete({
      where: { id: transactionId },
    });

    res.json({
      success: true,
      message: 'Kasa işlemi silindi',
    });
  } catch (error: any) {
    console.error('Delete cash transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Kasa işlemi silinemedi',
      error: error.message,
    });
  }
});

// Get cash balance
router.get('/balance', authenticate, async (req, res) => {
  try {
    const companyId = (req as any).user.companyId;

    const [inTotal, outTotal] = await Promise.all([
      prisma.cashTransaction.aggregate({
        where: { companyId, type: 'in' },
        _sum: { amount: true },
      }),
      prisma.cashTransaction.aggregate({
        where: { companyId, type: 'out' },
        _sum: { amount: true },
      }),
    ]);

    const inAmount = inTotal._sum.amount || 0;
    const outAmount = outTotal._sum.amount || 0;
    const balance = inAmount - outAmount;

    res.json({
      success: true,
      data: {
        balance,
        inTotal: inAmount,
        outTotal: outAmount,
      },
    });
  } catch (error: any) {
    console.error('Get cash balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Kasa bakiyesi alınamadı',
      error: error.message,
    });
  }
});

// Get today's summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const companyId = (req as any).user.companyId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayIn, todayOut, transactionCount] = await Promise.all([
      prisma.cashTransaction.aggregate({
        where: {
          companyId,
          type: 'in',
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: { amount: true },
      }),
      prisma.cashTransaction.aggregate({
        where: {
          companyId,
          type: 'out',
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: { amount: true },
      }),
      prisma.cashTransaction.count({
        where: {
          companyId,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    const todayInAmount = todayIn._sum.amount || 0;
    const todayOutAmount = todayOut._sum.amount || 0;

    res.json({
      success: true,
      data: {
        todayIn: todayInAmount,
        todayOut: todayOutAmount,
        todayNet: todayInAmount - todayOutAmount,
        transactionCount,
      },
    });
  } catch (error: any) {
    console.error('Get cash summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Kasa özeti alınamadı',
      error: error.message,
    });
  }
});

// Get daily report (all dates)
router.get('/daily-report', authenticate, async (req, res) => {
  try {
    const companyId = (req as any).user.companyId;
    const { startDate, endDate } = req.query;

    const where: any = { companyId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const transactions = await prisma.cashTransaction.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    // Group by date
    const dailyReport: any = {};
    
    transactions.forEach((transaction) => {
      const dateKey = transaction.date.toISOString().split('T')[0];
      
      if (!dailyReport[dateKey]) {
        dailyReport[dateKey] = {
          date: dateKey,
          in: 0,
          out: 0,
          net: 0,
          count: 0,
        };
      }

      if (transaction.type === 'in') {
        dailyReport[dateKey].in += transaction.amount;
      } else {
        dailyReport[dateKey].out += transaction.amount;
      }
      dailyReport[dateKey].net = dailyReport[dateKey].in - dailyReport[dateKey].out;
      dailyReport[dateKey].count++;
    });

    const reportArray = Object.values(dailyReport);

    res.json({
      success: true,
      data: reportArray,
    });
  } catch (error: any) {
    console.error('Get daily report error:', error);
    res.status(500).json({
      success: false,
      message: 'Günlük rapor alınamadı',
      error: error.message,
    });
  }
});

// Get cash flow (monthly breakdown)
router.get('/cash-flow', authenticate, async (req, res) => {
  try {
    const companyId = (req as any).user.companyId;
    const { year = new Date().getFullYear().toString() } = req.query;

    const yearNum = parseInt(year as string);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const cashFlow = await Promise.all(
      months.map(async (month) => {
        const startDate = new Date(yearNum, month - 1, 1);
        const endDate = new Date(yearNum, month, 0);
        endDate.setHours(23, 59, 59, 999);

        const [inResult, outResult] = await Promise.all([
          prisma.cashTransaction.aggregate({
            where: {
              companyId,
              type: 'in',
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
          }),
          prisma.cashTransaction.aggregate({
            where: {
              companyId,
              type: 'out',
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
          }),
        ]);

        const income = inResult._sum.amount || 0;
        const expense = outResult._sum.amount || 0;

        return {
          month,
          monthName: new Date(yearNum, month - 1).toLocaleString('tr-TR', {
            month: 'long',
          }),
          income,
          expense,
          net: income - expense,
        };
      })
    );

    res.json({
      success: true,
      data: cashFlow,
    });
  } catch (error: any) {
    console.error('Get cash flow error:', error);
    res.status(500).json({
      success: false,
      message: 'Nakit akışı alınamadı',
      error: error.message,
    });
  }
});

export default router;
