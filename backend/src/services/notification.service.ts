import { PrismaClient } from '@prisma/client';
import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushErrorReceipt } from 'expo-server-sdk';

const prisma = new PrismaClient();
const expo = new Expo();

export interface SendNotificationOptions {
  userId: number;
  title: string;
  body: string;
  data?: any;
  type?: string;
  sound?: string;
  badge?: number;
  category?: string;
  priority?: 'default' | 'normal' | 'high';
}

export interface ScheduleReminderOptions {
  reservationId: number;
  userId: number;
  equipmentName: string;
  startDate: Date;
}

class NotificationService {
  /**
   * Send push notification to a user
   */
  async sendNotification(options: SendNotificationOptions): Promise<boolean> {
    try {
      const {
        userId,
        title,
        body,
        data = {},
        type = 'general',
        sound = 'default',
        badge,
        category,
        priority = 'high',
      } = options;

      // Get user's push tokens
      const pushTokens = await prisma.pushToken.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      if (pushTokens.length === 0) {
        console.log(`No active push tokens found for user ${userId}`);
        return false;
      }

      // Prepare messages
      const messages: ExpoPushMessage[] = pushTokens
        .filter((token) => Expo.isExpoPushToken(token.token))
        .map((token) => ({
          to: token.token,
          sound,
          title,
          body,
          data: { ...data, type },
          badge,
          categoryId: category,
          priority,
        }));

      if (messages.length === 0) {
        console.log('No valid Expo push tokens');
        return false;
      }

      // Send notifications in chunks
      const chunks = expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending notification chunk:', error);
        }
      }

      // Save to notification history
      await prisma.notificationHistory.create({
        data: {
          userId,
          title,
          body,
          type,
          data: JSON.stringify(data),
          status: 'sent',
          sentAt: new Date(),
        },
      });

      // Update token last used
      await prisma.pushToken.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          lastUsed: new Date(),
        },
      });

      // Check for errors
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          console.error('Notification error:', ticket.message);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in sendNotification:', error);
      return false;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendBatchNotifications(
    userIds: number[],
    title: string,
    body: string,
    data?: any,
    type?: string
  ): Promise<void> {
    const promises = userIds.map((userId) =>
      this.sendNotification({ userId, title, body, data, type })
    );
    await Promise.all(promises);
  }

  /**
   * Schedule reservation reminders
   */
  async scheduleReservationReminders(
    options: ScheduleReminderOptions
  ): Promise<void> {
    const { reservationId, userId, equipmentName, startDate } = options;

    // Note: This sends immediate notifications
    // For actual scheduling, you would need a job queue like Bull or Agenda
    
    const now = new Date();
    const start = new Date(startDate);
    const hoursDiff = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If reservation is within 24 hours, send 24h reminder
    if (hoursDiff <= 24 && hoursDiff > 1) {
      await this.sendNotification({
        userId,
        title: 'Rezervasyon Hatırlatması',
        body: `${equipmentName} için rezervasyonunuz ${Math.floor(hoursDiff)} saat içinde başlayacak!`,
        data: {
          reservationId,
          screen: 'ReservationDetail',
        },
        type: 'reservation-reminder-24h',
        category: 'reservations',
      });
    }

    // If reservation is within 1 hour, send 1h reminder
    if (hoursDiff <= 1 && hoursDiff > 0) {
      await this.sendNotification({
        userId,
        title: 'Rezervasyon Başlıyor!',
        body: `${equipmentName} için rezervasyonunuz 1 saat içinde başlıyor!`,
        data: {
          reservationId,
          screen: 'ReservationDetail',
        },
        type: 'reservation-reminder-1h',
        category: 'reservations',
        priority: 'high',
      });
    }
  }

  /**
   * Send reservation status update notification
   */
  async sendReservationStatusUpdate(
    userId: number,
    reservationId: number,
    status: string,
    equipmentName: string
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      confirmed: 'Rezervasyonunuz onaylandı',
      cancelled: 'Rezervasyonunuz iptal edildi',
      completed: 'Rezervasyonunuz tamamlandı',
      active: 'Rezervasyonunuz başladı',
    };

    const message = statusMessages[status] || 'Rezervasyon durumunuz güncellendi';

    await this.sendNotification({
      userId,
      title: 'Rezervasyon Güncellemesi',
      body: `${equipmentName}: ${message}`,
      data: {
        reservationId,
        status,
        screen: 'ReservationDetail',
      },
      type: 'reservation-status-update',
      category: 'status-updates',
    });
  }

  /**
   * Send equipment availability notification
   */
  async sendEquipmentAvailability(
    userId: number,
    equipmentId: number,
    equipmentName: string
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Ekipman Müsait!',
      body: `${equipmentName} artık rezervasyon için müsait.`,
      data: {
        equipmentId,
        screen: 'EquipmentDetail',
      },
      type: 'equipment-availability',
      category: 'status-updates',
    });
  }

  /**
   * Send order status update
   */
  async sendOrderStatusUpdate(
    userId: number,
    orderId: number,
    orderNumber: string,
    status: string
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      confirmed: 'Siparişiniz onaylandı',
      processing: 'Siparişiniz hazırlanıyor',
      shipped: 'Siparişiniz kargoya verildi',
      delivered: 'Siparişiniz teslim edildi',
      cancelled: 'Siparişiniz iptal edildi',
    };

    const message = statusMessages[status] || 'Sipariş durumunuz güncellendi';

    await this.sendNotification({
      userId,
      title: 'Sipariş Güncellemesi',
      body: `#${orderNumber}: ${message}`,
      data: {
        orderId,
        status,
        screen: 'OrderDetail',
      },
      type: 'order-status-update',
      category: 'status-updates',
    });
  }

  /**
   * Send promotional notification
   */
  async sendPromotion(
    userId: number,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    // Check if user has promotions enabled
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences?.pushEnabled) {
      console.log(`User ${userId} has push notifications disabled`);
      return;
    }

    await this.sendNotification({
      userId,
      title,
      body,
      data,
      type: 'promotion',
      priority: 'normal',
    });
  }

  /**
   * Register a push token for a user
   */
  async registerPushToken(
    userId: number,
    token: string,
    platform: string,
    deviceId?: string
  ): Promise<boolean> {
    try {
      // Check if token is valid
      if (!Expo.isExpoPushToken(token)) {
        console.error('Invalid Expo push token:', token);
        return false;
      }

      // Upsert token
      await prisma.pushToken.upsert({
        where: { token },
        update: {
          isActive: true,
          lastUsed: new Date(),
          platform,
          deviceId,
        },
        create: {
          token,
          platform,
          deviceId,
          userId,
          isActive: true,
        },
      });

      return true;
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  /**
   * Unregister a push token
   */
  async unregisterPushToken(token: string): Promise<boolean> {
    try {
      await prisma.pushToken.update({
        where: { token },
        data: { isActive: false },
      });
      return true;
    } catch (error) {
      console.error('Error unregistering push token:', error);
      return false;
    }
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(
    userId: number,
    limit = 50,
    offset = 0
  ): Promise<any[]> {
    try {
      const history = await prisma.notificationHistory.findMany({
        where: { userId },
        orderBy: { sentAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return history.map((item) => ({
        ...item,
        data: item.data ? JSON.parse(item.data) : null,
      }));
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  /**
   * Mark notification as delivered
   */
  async markAsDelivered(notificationId: number): Promise<void> {
    try {
      await prisma.notificationHistory.update({
        where: { id: notificationId },
        data: {
          status: 'delivered',
          deliveredAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking notification as delivered:', error);
    }
  }

  /**
   * Mark notification as opened
   */
  async markAsOpened(notificationId: number): Promise<void> {
    try {
      await prisma.notificationHistory.update({
        where: { id: notificationId },
        data: {
          status: 'opened',
          openedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking notification as opened:', error);
    }
  }

  /**
   * Clean up old notification history
   */
  async cleanupOldNotifications(daysToKeep = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await prisma.notificationHistory.deleteMany({
        where: {
          sentAt: {
            lt: cutoffDate,
          },
        },
      });

      console.log(`Cleaned up notifications older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }
}

export default new NotificationService();
