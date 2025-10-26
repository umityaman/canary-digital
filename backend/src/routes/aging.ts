import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

interface AgingBucket {
  label: string;
  minDays: number;
  maxDays: number | null;
  count: number;
  amount: number;
  items: any[];
}

/**
 * GET /api/aging/checks
 * Get aging analysis for checks
 */
router.get('/checks', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all checks in portfolio or deposited
    const checks = await prisma.check.findMany({
      where: {
        companyId,
        status: { in: ['portfolio', 'deposited'] },
      },
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Define aging buckets
    const buckets: AgingBucket[] = [
      { label: '0-30 Gün', minDays: 0, maxDays: 30, count: 0, amount: 0, items: [] },
      { label: '31-60 Gün', minDays: 31, maxDays: 60, count: 0, amount: 0, items: [] },
      { label: '61-90 Gün', minDays: 61, maxDays: 90, count: 0, amount: 0, items: [] },
      { label: '90+ Gün', minDays: 91, maxDays: null, count: 0, amount: 0, items: [] },
      { label: 'Vadesi Geçmiş', minDays: -999999, maxDays: -1, count: 0, amount: 0, items: [] },
    ];

    // Categorize checks into buckets
    checks.forEach((check) => {
      const dueDate = new Date(check.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let bucketIndex = -1;

      if (daysUntilDue < 0) {
        bucketIndex = 4; // Overdue
      } else if (daysUntilDue <= 30) {
        bucketIndex = 0;
      } else if (daysUntilDue <= 60) {
        bucketIndex = 1;
      } else if (daysUntilDue <= 90) {
        bucketIndex = 2;
      } else {
        bucketIndex = 3;
      }

      if (bucketIndex !== -1) {
        buckets[bucketIndex].count++;
        buckets[bucketIndex].amount += check.amount;
        buckets[bucketIndex].items.push({
          id: check.id,
          checkNumber: check.checkNumber,
          amount: check.amount,
          currency: check.currency,
          dueDate: check.dueDate,
          daysUntilDue,
          type: check.type,
          status: check.status,
          drawerName: check.drawerName,
          bankName: check.bankName,
          location: check.location,
          customer: check.customer,
          supplier: check.supplier,
        });
      }
    });

    // Calculate totals
    const totalCount = checks.length;
    const totalAmount = checks.reduce((sum, check) => sum + check.amount, 0);

    // Separate received and issued
    const receivedChecks = checks.filter((c) => c.type === 'received');
    const issuedChecks = checks.filter((c) => c.type === 'issued');

    res.json({
      success: true,
      data: {
        buckets,
        summary: {
          totalCount,
          totalAmount,
          receivedCount: receivedChecks.length,
          receivedAmount: receivedChecks.reduce((sum, c) => sum + c.amount, 0),
          issuedCount: issuedChecks.length,
          issuedAmount: issuedChecks.reduce((sum, c) => sum + c.amount, 0),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get check aging error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get check aging analysis',
      error: error.message,
    });
  }
});

/**
 * GET /api/aging/promissory-notes
 * Get aging analysis for promissory notes
 */
router.get('/promissory-notes', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all promissory notes in portfolio
    const notes = await prisma.promissoryNote.findMany({
      where: {
        companyId,
        status: { in: ['portfolio'] },
      },
      include: {
        customer: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Define aging buckets
    const buckets: AgingBucket[] = [
      { label: '0-30 Gün', minDays: 0, maxDays: 30, count: 0, amount: 0, items: [] },
      { label: '31-60 Gün', minDays: 31, maxDays: 60, count: 0, amount: 0, items: [] },
      { label: '61-90 Gün', minDays: 61, maxDays: 90, count: 0, amount: 0, items: [] },
      { label: '90+ Gün', minDays: 91, maxDays: null, count: 0, amount: 0, items: [] },
      { label: 'Vadesi Geçmiş', minDays: -999999, maxDays: -1, count: 0, amount: 0, items: [] },
    ];

    // Categorize notes into buckets
    notes.forEach((note) => {
      const dueDate = new Date(note.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let bucketIndex = -1;

      if (daysUntilDue < 0) {
        bucketIndex = 4; // Overdue
      } else if (daysUntilDue <= 30) {
        bucketIndex = 0;
      } else if (daysUntilDue <= 60) {
        bucketIndex = 1;
      } else if (daysUntilDue <= 90) {
        bucketIndex = 2;
      } else {
        bucketIndex = 3;
      }

      if (bucketIndex !== -1) {
        buckets[bucketIndex].count++;
        buckets[bucketIndex].amount += note.amount;
        buckets[bucketIndex].items.push({
          id: note.id,
          noteNumber: note.noteNumber,
          amount: note.amount,
          currency: note.currency,
          dueDate: note.dueDate,
          daysUntilDue,
          type: note.type,
          status: note.status,
          drawerName: note.drawerName,
          guarantorName: note.guarantorName,
          location: note.location,
          customer: note.customer,
          supplier: note.supplier,
        });
      }
    });

    // Calculate totals
    const totalCount = notes.length;
    const totalAmount = notes.reduce((sum, note) => sum + note.amount, 0);

    // Separate receivable and payable
    const receivableNotes = notes.filter((n) => n.type === 'receivable');
    const payableNotes = notes.filter((n) => n.type === 'payable');

    res.json({
      success: true,
      data: {
        buckets,
        summary: {
          totalCount,
          totalAmount,
          receivableCount: receivableNotes.length,
          receivableAmount: receivableNotes.reduce((sum, n) => sum + n.amount, 0),
          payableCount: payableNotes.length,
          payableAmount: payableNotes.reduce((sum, n) => sum + n.amount, 0),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get promissory note aging error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get promissory note aging analysis',
      error: error.message,
    });
  }
});

/**
 * GET /api/aging/combined
 * Get combined aging analysis for checks and promissory notes
 */
router.get('/combined', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get checks and notes
    const [checks, notes] = await Promise.all([
      prisma.check.findMany({
        where: {
          companyId,
          status: { in: ['portfolio', 'deposited'] },
        },
        include: {
          customer: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      prisma.promissoryNote.findMany({
        where: {
          companyId,
          status: { in: ['portfolio'] },
        },
        include: {
          customer: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Combine all items
    const allItems = [
      ...checks.map((c) => ({
        type: 'check' as const,
        id: c.id,
        number: c.checkNumber,
        amount: c.amount,
        currency: c.currency,
        dueDate: c.dueDate,
        itemType: c.type,
        status: c.status,
        name: c.drawerName,
        customer: c.customer,
        supplier: c.supplier,
      })),
      ...notes.map((n) => ({
        type: 'promissory_note' as const,
        id: n.id,
        number: n.noteNumber,
        amount: n.amount,
        currency: n.currency,
        dueDate: n.dueDate,
        itemType: n.type,
        status: n.status,
        name: n.drawerName,
        customer: n.customer,
        supplier: n.supplier,
      })),
    ];

    // Sort by due date
    allItems.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Define aging buckets
    const buckets: AgingBucket[] = [
      { label: '0-30 Gün', minDays: 0, maxDays: 30, count: 0, amount: 0, items: [] },
      { label: '31-60 Gün', minDays: 31, maxDays: 60, count: 0, amount: 0, items: [] },
      { label: '61-90 Gün', minDays: 61, maxDays: 90, count: 0, amount: 0, items: [] },
      { label: '90+ Gün', minDays: 91, maxDays: null, count: 0, amount: 0, items: [] },
      { label: 'Vadesi Geçmiş', minDays: -999999, maxDays: -1, count: 0, amount: 0, items: [] },
    ];

    // Categorize items into buckets
    allItems.forEach((item) => {
      const dueDate = new Date(item.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let bucketIndex = -1;

      if (daysUntilDue < 0) {
        bucketIndex = 4; // Overdue
      } else if (daysUntilDue <= 30) {
        bucketIndex = 0;
      } else if (daysUntilDue <= 60) {
        bucketIndex = 1;
      } else if (daysUntilDue <= 90) {
        bucketIndex = 2;
      } else {
        bucketIndex = 3;
      }

      if (bucketIndex !== -1) {
        buckets[bucketIndex].count++;
        buckets[bucketIndex].amount += item.amount;
        buckets[bucketIndex].items.push({
          ...item,
          daysUntilDue,
        });
      }
    });

    // Calculate totals
    const totalCount = allItems.length;
    const totalAmount = allItems.reduce((sum, item) => sum + item.amount, 0);

    res.json({
      success: true,
      data: {
        buckets,
        summary: {
          totalCount,
          totalAmount,
          checkCount: checks.length,
          checkAmount: checks.reduce((sum, c) => sum + c.amount, 0),
          noteCount: notes.length,
          noteAmount: notes.reduce((sum, n) => sum + n.amount, 0),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get combined aging error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get combined aging analysis',
      error: error.message,
    });
  }
});

export default router;
