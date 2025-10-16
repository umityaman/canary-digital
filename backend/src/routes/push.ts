import { Router, Request, Response } from 'express';
import { PushNotificationService } from '../services/pushNotification.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to check authentication (assuming you have this)
const authenticate = (req: any, res: Response, next: any) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

/**
 * @route POST /api/push/register-token
 * @desc Register or update user's Expo push token
 * @access Private
 */
router.post('/register-token', authenticate, async (req: any, res: Response) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ message: 'Push token is required' });
    }

    const success = await PushNotificationService.registerToken(userId, token);

    if (success) {
      res.json({ 
        message: 'Push token registered successfully',
        token 
      });
    } else {
      res.status(400).json({ message: 'Invalid push token format' });
    }
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route DELETE /api/push/token
 * @desc Remove user's push token (logout, disable notifications)
 * @access Private
 */
router.delete('/token', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const success = await PushNotificationService.removeToken(userId);

    if (success) {
      res.json({ message: 'Push token removed successfully' });
    } else {
      res.status(500).json({ message: 'Failed to remove push token' });
    }
  } catch (error) {
    console.error('Error removing push token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route PUT /api/push/toggle
 * @desc Enable/disable push notifications for current user
 * @access Private
 */
router.put('/toggle', authenticate, async (req: any, res: Response) => {
  try {
    const { enabled } = req.body;
    const userId = req.user.id;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Enabled must be a boolean' });
    }

    const success = await PushNotificationService.toggleNotifications(userId, enabled);

    if (success) {
      res.json({ 
        message: `Push notifications ${enabled ? 'enabled' : 'disabled'}`,
        enabled 
      });
    } else {
      res.status(500).json({ message: 'Failed to toggle notifications' });
    }
  } catch (error) {
    console.error('Error toggling notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /api/push/status
 * @desc Get current user's push notification status
 * @access Private
 */
router.get('/status', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        expoPushToken: true,
        pushTokenUpdatedAt: true,
        pushNotificationsEnabled: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      hasToken: !!user.expoPushToken,
      enabled: user.pushNotificationsEnabled,
      lastUpdated: user.pushTokenUpdatedAt
    });
  } catch (error) {
    console.error('Error getting push status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /api/push/send
 * @desc Send push notification to specific users (Admin only)
 * @access Private (Admin)
 */
router.post('/send', authenticate, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });

    if (adminUser?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userIds, title, body, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const sentCount = await PushNotificationService.sendToUsers(userIds, {
      title,
      body,
      data
    });

    res.json({
      message: 'Notifications sent',
      sentCount,
      totalUsers: userIds.length
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /api/push/broadcast
 * @desc Send push notification to all company users (Admin only)
 * @access Private (Admin)
 */
router.post('/broadcast', authenticate, async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, companyId: true }
    });

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const sentCount = await PushNotificationService.sendToCompany(user.companyId!, {
      title,
      body,
      data
    });

    res.json({
      message: 'Broadcast sent',
      sentCount
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /api/push/test
 * @desc Send a test notification to current user
 * @access Private
 */
router.post('/test', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const success = await PushNotificationService.sendToUser(userId, {
      title: '🧪 Test Bildirimi',
      body: 'Push notification sistemi çalışıyor!',
      data: { type: 'TEST' },
      sound: 'default'
    });

    if (success) {
      res.json({ message: 'Test notification sent successfully' });
    } else {
      res.status(400).json({ 
        message: 'Failed to send test notification. Make sure you have registered a push token.' 
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
