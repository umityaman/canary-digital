import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all reminders for company
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const { status, type, priority } = req.query;

    const reminders = await prisma.reminder.findMany({
      where: {
        companyId,
        ...(status && { status: status as string }),
        ...(type && { type: type as string }),
        ...(priority && { priority: priority as string }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, totalAmount: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: {
        reminderDate: 'asc',
      },
    });

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get upcoming reminders (next 7 days)
router.get('/upcoming', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const reminders = await prisma.reminder.findMany({
      where: {
        companyId,
        status: 'pending',
        reminderDate: {
          gte: today,
          lte: nextWeek,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, totalAmount: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: {
        reminderDate: 'asc',
      },
    });

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming reminders' });
  }
});

// Get overdue reminders
router.get('/overdue', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const today = new Date();

    const reminders = await prisma.reminder.findMany({
      where: {
        companyId,
        status: 'pending',
        reminderDate: {
          lt: today,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, totalAmount: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: {
        reminderDate: 'desc',
      },
    });

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching overdue reminders:', error);
    res.status(500).json({ error: 'Failed to fetch overdue reminders' });
  }
});

// Get single reminder
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, totalAmount: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ error: 'Failed to fetch reminder' });
  }
});

// Create reminder
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.userId;

    if (!companyId || !userId) {
      return res.status(400).json({ error: 'Company ID or User ID not found' });
    }

    const {
      title,
      description,
      type = 'payment',
      priority = 'medium',
      reminderDate,
      dueDate,
      invoiceId,
      customerId,
      sendEmail = true,
      sendSms = false,
      sendPush = true,
      isRecurring = false,
      recurrence,
      recurrenceEnd,
    } = req.body;

    if (!title || !reminderDate) {
      return res.status(400).json({ error: 'Title and reminderDate are required' });
    }

    const reminder = await prisma.reminder.create({
      data: {
        companyId,
        userId,
        title,
        description,
        type,
        priority,
        reminderDate: new Date(reminderDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        invoiceId: invoiceId || null,
        customerId: customerId || null,
        sendEmail,
        sendSms,
        sendPush,
        isRecurring,
        recurrence,
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
        status: 'pending',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, totalAmount: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Update reminder
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const existing = await prisma.reminder.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const {
      title,
      description,
      type,
      priority,
      status,
      reminderDate,
      dueDate,
      invoiceId,
      customerId,
      sendEmail,
      sendSms,
      sendPush,
      isRecurring,
      recurrence,
      recurrenceEnd,
    } = req.body;

    const reminder = await prisma.reminder.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(reminderDate && { reminderDate: new Date(reminderDate) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(invoiceId !== undefined && { invoiceId }),
        ...(customerId !== undefined && { customerId }),
        ...(sendEmail !== undefined && { sendEmail }),
        ...(sendSms !== undefined && { sendSms }),
        ...(sendPush !== undefined && { sendPush }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurrence !== undefined && { recurrence }),
        ...(recurrenceEnd !== undefined && { recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, totalAmount: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    res.json(reminder);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Mark reminder as sent
router.post('/:id/sent', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const updated = await prisma.reminder.update({
      where: { id: parseInt(id) },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error marking reminder as sent:', error);
    res.status(500).json({ error: 'Failed to mark reminder as sent' });
  }
});

// Mark reminder as completed
router.post('/:id/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const updated = await prisma.reminder.update({
      where: { id: parseInt(id) },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error marking reminder as completed:', error);
    res.status(500).json({ error: 'Failed to mark reminder as completed' });
  }
});

// Cancel reminder
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const updated = await prisma.reminder.update({
      where: { id: parseInt(id) },
      data: {
        status: 'cancelled',
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    res.status(500).json({ error: 'Failed to cancel reminder' });
  }
});

// Delete reminder
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: parseInt(id),
        companyId,
      },
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    await prisma.reminder.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

// Get reminder stats
router.get('/stats/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const [total, pending, upcoming, overdue, completed] = await Promise.all([
      prisma.reminder.count({ where: { companyId } }),
      prisma.reminder.count({ where: { companyId, status: 'pending' } }),
      prisma.reminder.count({
        where: {
          companyId,
          status: 'pending',
          reminderDate: { gte: today, lte: nextWeek },
        },
      }),
      prisma.reminder.count({
        where: {
          companyId,
          status: 'pending',
          reminderDate: { lt: today },
        },
      }),
      prisma.reminder.count({ where: { companyId, status: 'completed' } }),
    ]);

    res.json({
      total,
      pending,
      upcoming,
      overdue,
      completed,
    });
  } catch (error) {
    console.error('Error fetching reminder stats:', error);
    res.status(500).json({ error: 'Failed to fetch reminder stats' });
  }
});

export default router;
