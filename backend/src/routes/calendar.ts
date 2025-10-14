import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/calendar/events
 * List calendar events with filters
 */
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      eventType,
      status,
      equipmentId,
      customerId,
      assignedUserId,
    } = req.query;

    const where: any = {
      companyId: req.companyId,
    };

    // Date range filter
    if (startDate && endDate) {
      where.AND = [
        { startDate: { lte: new Date(endDate as string) } },
        { endDate: { gte: new Date(startDate as string) } },
      ];
    }

    // Other filters
    if (eventType) where.eventType = eventType;
    if (status) where.status = status;
    if (equipmentId) where.equipmentId = parseInt(equipmentId as string);
    if (customerId) where.customerId = parseInt(customerId as string);
    if (assignedUserId) where.assignedUserId = parseInt(assignedUserId as string);

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
        equipment: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reminders: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    res.json(events);
  } catch (error: any) {
    console.error('Failed to fetch calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

/**
 * GET /api/calendar/events/:id
 * Get single calendar event
 */
router.get('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId,
      },
      include: {
        order: true,
        equipment: true,
        customer: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reminders: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    res.json(event);
  } catch (error: any) {
    console.error('Failed to fetch calendar event:', error);
    res.status(500).json({ error: 'Failed to fetch calendar event' });
  }
});

/**
 * POST /api/calendar/events
 * Create new calendar event
 */
router.post('/events', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      allDay,
      location,
      status,
      priority,
      color,
      orderId,
      equipmentId,
      customerId,
      assignedUserId,
      notes,
      reminders,
    } = req.body;

    // Validation
    if (!title || !eventType || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required fields: title, eventType, startDate, endDate',
      });
    }

    // Check for conflicts if equipment is assigned
    if (equipmentId) {
      const conflicts = await prisma.calendarEvent.findMany({
        where: {
          equipmentId: parseInt(equipmentId),
          companyId: req.companyId,
          status: { not: 'CANCELLED' },
          AND: [
            { startDate: { lt: new Date(endDate) } },
            { endDate: { gt: new Date(startDate) } },
          ],
        },
      });

      if (conflicts.length > 0) {
        return res.status(409).json({
          error: 'Equipment is already booked for this time period',
          conflicts,
        });
      }
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        eventType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        allDay: allDay || false,
        location,
        status: status || 'SCHEDULED',
        priority: priority || 'MEDIUM',
        color: color || '#3b82f6',
        orderId: orderId ? parseInt(orderId) : null,
        equipmentId: equipmentId ? parseInt(equipmentId) : null,
        customerId: customerId ? parseInt(customerId) : null,
        assignedUserId: assignedUserId ? parseInt(assignedUserId) : null,
        companyId: req.companyId,
        notes,
        reminders: reminders
          ? {
              create: reminders.map((r: any) => ({
                reminderTime: new Date(r.reminderTime),
                method: r.method,
                customMessage: r.customMessage,
              })),
            }
          : undefined,
      },
      include: {
        order: true,
        equipment: true,
        customer: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reminders: true,
      },
    });

    res.status(201).json(event);
  } catch (error: any) {
    console.error('Failed to create calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

/**
 * PUT /api/calendar/events/:id
 * Update calendar event
 */
router.put('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      allDay,
      location,
      status,
      priority,
      color,
      orderId,
      equipmentId,
      customerId,
      assignedUserId,
      notes,
    } = req.body;

    // Check if event exists and belongs to company
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    // Check for conflicts if equipment changed or dates changed
    if (equipmentId && (startDate || endDate)) {
      const newStartDate = startDate
        ? new Date(startDate)
        : existingEvent.startDate;
      const newEndDate = endDate ? new Date(endDate) : existingEvent.endDate;

      const conflicts = await prisma.calendarEvent.findMany({
        where: {
          id: { not: parseInt(id) }, // Exclude current event
          equipmentId: parseInt(equipmentId),
          companyId: req.companyId,
          status: { not: 'CANCELLED' },
          AND: [
            { startDate: { lt: newEndDate } },
            { endDate: { gt: newStartDate } },
          ],
        },
      });

      if (conflicts.length > 0) {
        return res.status(409).json({
          error: 'Equipment is already booked for this time period',
          conflicts,
        });
      }
    }

    const event = await prisma.calendarEvent.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(eventType && { eventType }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(allDay !== undefined && { allDay }),
        ...(location !== undefined && { location }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(color && { color }),
        ...(orderId !== undefined && {
          orderId: orderId ? parseInt(orderId) : null,
        }),
        ...(equipmentId !== undefined && {
          equipmentId: equipmentId ? parseInt(equipmentId) : null,
        }),
        ...(customerId !== undefined && {
          customerId: customerId ? parseInt(customerId) : null,
        }),
        ...(assignedUserId !== undefined && {
          assignedUserId: assignedUserId ? parseInt(assignedUserId) : null,
        }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        order: true,
        equipment: true,
        customer: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reminders: true,
      },
    });

    res.json(event);
  } catch (error: any) {
    console.error('Failed to update calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

/**
 * DELETE /api/calendar/events/:id
 * Delete calendar event
 */
router.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists and belongs to company
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    await prisma.calendarEvent.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

/**
 * GET /api/calendar/availability
 * Check equipment availability for a time period
 */
router.get('/availability', authenticateToken, async (req, res) => {
  try {
    const { equipmentId, startDate, endDate } = req.query;

    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters: equipmentId, startDate, endDate',
      });
    }

    const conflicts = await prisma.calendarEvent.findMany({
      where: {
        equipmentId: parseInt(equipmentId as string),
        companyId: req.companyId,
        status: { not: 'CANCELLED' },
        AND: [
          { startDate: { lt: new Date(endDate as string) } },
          { endDate: { gt: new Date(startDate as string) } },
        ],
      },
      include: {
        order: {
          select: {
            orderNumber: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      available: conflicts.length === 0,
      conflicts,
    });
  } catch (error: any) {
    console.error('Failed to check availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

/**
 * POST /api/calendar/events/:id/reminders
 * Add reminder to event
 */
router.post('/events/:id/reminders', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reminderTime, method, customMessage } = req.body;

    // Check if event exists and belongs to company
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    const reminder = await prisma.eventReminder.create({
      data: {
        eventId: parseInt(id),
        reminderTime: new Date(reminderTime),
        method,
        customMessage,
      },
    });

    res.status(201).json(reminder);
  } catch (error: any) {
    console.error('Failed to add reminder:', error);
    res.status(500).json({ error: 'Failed to add reminder' });
  }
});

/**
 * DELETE /api/calendar/events/:id/reminders/:reminderId
 * Delete reminder
 */
router.delete(
  '/events/:id/reminders/:reminderId',
  authenticateToken,
  async (req, res) => {
    try {
      const { id, reminderId } = req.params;

      // Check if event exists and belongs to company
      const event = await prisma.calendarEvent.findFirst({
        where: {
          id: parseInt(id),
          companyId: req.companyId,
        },
      });

      if (!event) {
        return res.status(404).json({ error: 'Calendar event not found' });
      }

      await prisma.eventReminder.delete({
        where: { id: parseInt(reminderId) },
      });

      res.json({ message: 'Reminder deleted successfully' });
    } catch (error: any) {
      console.error('Failed to delete reminder:', error);
      res.status(500).json({ error: 'Failed to delete reminder' });
    }
  }
);

export default router;
