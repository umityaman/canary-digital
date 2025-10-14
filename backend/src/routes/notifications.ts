import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import NotificationService from '../services/notificationService';

const router = Router();
const prisma = new PrismaClient();

// POST /api/notifications - Create and send a notification
router.post('/', async (req: Request, res: Response) => {
  try {
    const notificationData = req.body;

    const notification = await NotificationService.create(
      notificationData,
      req.body.sendNow !== false // Default to sending immediately
    );

    res.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim oluşturulamadı',
      error: error.message,
    });
  }
});

// POST /api/notifications/template - Create notification from template
router.post('/template', async (req: Request, res: Response) => {
  try {
    const { templateCode, variables, recipient, sendNow } = req.body;

    if (!templateCode || !variables || !recipient) {
      return res.status(400).json({
        success: false,
        message: 'Template code, variables, and recipient are required',
      });
    }

    const notification = await NotificationService.createFromTemplate(
      templateCode,
      variables,
      recipient,
      sendNow !== false
    );

    res.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error('Create from template error:', error);
    res.status(500).json({
      success: false,
      message: 'Template bildirim oluşturulamadı',
      error: error.message,
    });
  }
});

// POST /api/notifications/:id/send - Send a specific notification
router.post('/:id/send', async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);

    const notification = await NotificationService.send(notificationId);

    res.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim gönderilemedi',
      error: error.message,
    });
  }
});

// GET /api/notifications/user/:userId - Get user's notifications
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';

    const whereClause: any = {
      userId,
      type: 'IN_APP',
    };

    if (unreadOnly) {
      whereClause.readAt = null;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: whereClause }),
      prisma.notification.count({
        where: { userId, type: 'IN_APP', readAt: null },
      }),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      unreadCount,
    });
  } catch (error: any) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler alınamadı',
      error: error.message,
    });
  }
});

// GET /api/notifications/unread/:userId - Get unread notifications count
router.get('/unread/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        type: 'IN_APP',
        readAt: null,
      },
    });

    const unreadNotifications = await NotificationService.getUnread(userId, 10);

    res.json({
      success: true,
      data: {
        count: unreadCount,
        recent: unreadNotifications,
      },
    });
  } catch (error: any) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Okunmamış bildirimler alınamadı',
      error: error.message,
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);

    const notification = await NotificationService.markAsRead(notificationId);

    res.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim okundu olarak işaretlenemedi',
      error: error.message,
    });
  }
});

// PUT /api/notifications/user/:userId/read-all - Mark all as read
router.put('/user/:userId/read-all', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    const result = await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      data: result,
      message: 'Tüm bildirimler okundu olarak işaretlendi',
    });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler okundu olarak işaretlenemedi',
      error: error.message,
    });
  }
});

// GET /api/notifications/history - Get notification history with filters
router.get('/history', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      type,
      category,
      status,
      startDate,
      endDate,
      limit = '50',
      offset = '0',
    } = req.query;

    const whereClause: any = {};

    if (userId) whereClause.userId = parseInt(userId as string);
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.notification.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error: any) {
    console.error('Get notification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim geçmişi alınamadı',
      error: error.message,
    });
  }
});

// GET /api/notifications/templates - Get all notification templates
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { category, type, isActive } = req.query;

    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (type) whereClause.type = type;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const templates = await prisma.notificationTemplate.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Template\'ler alınamadı',
      error: error.message,
    });
  }
});

// POST /api/notifications/templates - Create notification template
router.post('/templates', async (req: Request, res: Response) => {
  try {
    const template = await prisma.notificationTemplate.create({
      data: req.body,
    });

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Template oluşturulamadı',
      error: error.message,
    });
  }
});

// PUT /api/notifications/templates/:id - Update notification template
router.put('/templates/:id', async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);

    const template = await prisma.notificationTemplate.update({
      where: { id: templateId },
      data: req.body,
    });

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Template güncellenemedi',
      error: error.message,
    });
  }
});

// GET /api/notifications/preferences/:userId - Get user preferences
router.get('/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Tercihler alınamadı',
      error: error.message,
    });
  }
});

// PUT /api/notifications/preferences/:userId - Update user preferences
router.put('/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: req.body,
      create: {
        userId,
        ...req.body,
      },
    });

    res.json({
      success: true,
      data: preferences,
      message: 'Tercihler güncellendi',
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Tercihler güncellenemedi',
      error: error.message,
    });
  }
});

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { userId, companyId, startDate, endDate } = req.query;

    const whereClause: any = {};
    if (userId) whereClause.userId = parseInt(userId as string);
    if (companyId) whereClause.companyId = parseInt(companyId as string);
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const [
      totalNotifications,
      byType,
      byStatus,
      byCategory,
    ] = await Promise.all([
      prisma.notification.count({ where: whereClause }),
      prisma.notification.groupBy({
        by: ['type'],
        where: whereClause,
        _count: true,
      }),
      prisma.notification.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
      }),
      prisma.notification.groupBy({
        by: ['category'],
        where: whereClause,
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        total: totalNotifications,
        byType,
        byStatus,
        byCategory,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı',
      error: error.message,
    });
  }
});

// POST /api/notifications/process-scheduled - Manually trigger scheduled processing
router.post('/process-scheduled', async (req: Request, res: Response) => {
  try {
    const processed = await NotificationService.processScheduled();

    res.json({
      success: true,
      data: { processed },
      message: `${processed} scheduled notification(s) processed`,
    });
  } catch (error: any) {
    console.error('Process scheduled error:', error);
    res.status(500).json({
      success: false,
      message: 'Zamanlanmış bildirimler işlenemedi',
      error: error.message,
    });
  }
});

// POST /api/notifications/retry-failed - Retry failed notifications
router.post('/retry-failed', async (req: Request, res: Response) => {
  try {
    const retried = await NotificationService.retryFailed();

    res.json({
      success: true,
      data: { retried },
      message: `${retried} failed notification(s) retried`,
    });
  } catch (error: any) {
    console.error('Retry failed error:', error);
    res.status(500).json({
      success: false,
      message: 'Başarısız bildirimler yeniden denenemedi',
      error: error.message,
    });
  }
});

// ==============================================
// Mobile App Specific Endpoints
// ==============================================

// GET /api/notifications - Get current user's notifications (requires auth)
router.get('/', async (req: Request, res: Response) => {
  try {
    // @ts-ignore - userId is set by auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
          type: 'IN_APP',
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: { userId, type: 'IN_APP', readAt: null },
      }),
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler alınamadı',
      error: error.message,
    });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);
    // @ts-ignore
    const userId = req.user?.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı',
      });
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    res.json({
      success: true,
      message: 'Bildirim silindi',
    });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim silinemedi',
      error: error.message,
    });
  }
});

// POST /api/notifications/register - Register device token for push notifications
router.post('/register', async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { token, platform, deviceId } = req.body;

    if (!token || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Token and platform are required',
      });
    }

    // Store or update device token
    const existingToken = await prisma.deviceToken.findFirst({
      where: {
        userId,
        deviceId: deviceId || token,
      },
    });

    let deviceToken;
    if (existingToken) {
      deviceToken = await prisma.deviceToken.update({
        where: { id: existingToken.id },
        data: {
          token,
          platform,
          lastUsedAt: new Date(),
        },
      });
    } else {
      deviceToken = await prisma.deviceToken.create({
        data: {
          userId,
          token,
          platform,
          deviceId: deviceId || token,
          lastUsedAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      data: deviceToken,
      message: 'Device token registered successfully',
    });
  } catch (error: any) {
    console.error('Register device token error:', error);
    res.status(500).json({
      success: false,
      message: 'Device token could not be registered',
      error: error.message,
    });
  }
});

// POST /api/notifications/unregister - Unregister device token
router.post('/unregister', async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    await prisma.deviceToken.deleteMany({
      where: {
        userId,
        token,
      },
    });

    res.json({
      success: true,
      message: 'Device token unregistered successfully',
    });
  } catch (error: any) {
    console.error('Unregister device token error:', error);
    res.status(500).json({
      success: false,
      message: 'Device token could not be unregistered',
      error: error.message,
    });
  }
});

export default router;
