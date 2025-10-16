import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const expo = new Expo();

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

export class PushNotificationService {
  /**
   * Send push notification to a single user
   */
  static async sendToUser(userId: number, payload: NotificationPayload): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          expoPushToken: true,
          pushNotificationsEnabled: true 
        }
      });

      if (!user || !user.expoPushToken || !user.pushNotificationsEnabled) {
        console.log(`User ${userId} has no push token or notifications disabled`);
        return false;
      }

      if (!Expo.isExpoPushToken(user.expoPushToken)) {
        console.error(`Invalid Expo push token for user ${userId}`);
        return false;
      }

      const message: ExpoPushMessage = {
        to: user.expoPushToken,
        sound: payload.sound || 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        badge: payload.badge,
        channelId: payload.channelId,
        priority: payload.priority || 'high',
      };

      const chunks = expo.chunkPushNotifications([message]);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }

      // Check tickets for errors
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          console.error(`Error sending push notification:`, ticket.message);
          
          // If token is invalid, clear it from database
          if (ticket.details?.error === 'DeviceNotRegistered') {
            await prisma.user.update({
              where: { id: userId },
              data: { expoPushToken: null }
            });
          }
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in sendToUser:', error);
      return false;
    }
  }

  /**
   * Send push notification to multiple users
   */
  static async sendToUsers(userIds: number[], payload: NotificationPayload): Promise<number> {
    try {
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          expoPushToken: { not: null },
          pushNotificationsEnabled: true
        },
        select: { 
          id: true,
          expoPushToken: true 
        }
      });

      if (users.length === 0) {
        console.log('No users with valid push tokens found');
        return 0;
      }

      const messages: ExpoPushMessage[] = users
        .filter(user => user.expoPushToken && Expo.isExpoPushToken(user.expoPushToken))
        .map(user => ({
          to: user.expoPushToken!,
          sound: payload.sound || 'default',
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          badge: payload.badge,
          channelId: payload.channelId,
          priority: payload.priority || 'high',
        }));

      const chunks = expo.chunkPushNotifications(messages);
      let successCount = 0;

      for (const chunk of chunks) {
        try {
          const tickets = await expo.sendPushNotificationsAsync(chunk);
          
          // Check tickets and handle errors
          for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            if (ticket.status === 'ok') {
              successCount++;
            } else if (ticket.status === 'error') {
              console.error(`Error sending notification:`, ticket.message);
              
              // Clear invalid tokens
              if (ticket.details?.error === 'DeviceNotRegistered') {
                const user = users[i];
                if (user) {
                  await prisma.user.update({
                    where: { id: user.id },
                    data: { expoPushToken: null }
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }

      return successCount;
    } catch (error) {
      console.error('Error in sendToUsers:', error);
      return 0;
    }
  }

  /**
   * Send notification to all company users
   */
  static async sendToCompany(companyId: number, payload: NotificationPayload): Promise<number> {
    try {
      const users = await prisma.user.findMany({
        where: {
          companyId,
          expoPushToken: { not: null },
          pushNotificationsEnabled: true
        },
        select: { id: true }
      });

      const userIds = users.map(u => u.id);
      return await this.sendToUsers(userIds, payload);
    } catch (error) {
      console.error('Error in sendToCompany:', error);
      return 0;
    }
  }

  /**
   * Register/update user's push token
   */
  static async registerToken(userId: number, token: string): Promise<boolean> {
    try {
      if (!Expo.isExpoPushToken(token)) {
        console.error('Invalid Expo push token format');
        return false;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          expoPushToken: token,
          pushTokenUpdatedAt: new Date(),
          pushNotificationsEnabled: true
        }
      });

      return true;
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  /**
   * Remove user's push token
   */
  static async removeToken(userId: number): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          expoPushToken: null,
          pushTokenUpdatedAt: null
        }
      });

      return true;
    } catch (error) {
      console.error('Error removing push token:', error);
      return false;
    }
  }

  /**
   * Toggle push notifications for user
   */
  static async toggleNotifications(userId: number, enabled: boolean): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { pushNotificationsEnabled: enabled }
      });

      return true;
    } catch (error) {
      console.error('Error toggling notifications:', error);
      return false;
    }
  }

  /**
   * Pre-defined notification types
   */
  static async sendReservationReminder(userId: number, reservationData: any): Promise<boolean> {
    return await this.sendToUser(userId, {
      title: '🔔 Rezervasyon Hatırlatması',
      body: `${reservationData.equipmentName} için rezervasyonunuz yaklaşıyor!`,
      data: {
        type: 'RESERVATION_REMINDER',
        reservationId: reservationData.id,
        screen: 'ReservationDetail'
      },
      channelId: 'reservations',
      priority: 'high',
      badge: 1
    });
  }

  static async sendReservationConfirmation(userId: number, reservationData: any): Promise<boolean> {
    return await this.sendToUser(userId, {
      title: '✅ Rezervasyon Onaylandı',
      body: `${reservationData.equipmentName} rezervasyonunuz onaylandı.`,
      data: {
        type: 'RESERVATION_CONFIRMED',
        reservationId: reservationData.id,
        screen: 'ReservationDetail'
      },
      channelId: 'reservations',
      priority: 'high'
    });
  }

  static async sendReservationCancellation(userId: number, reservationData: any): Promise<boolean> {
    return await this.sendToUser(userId, {
      title: '❌ Rezervasyon İptal Edildi',
      body: `${reservationData.equipmentName} rezervasyonunuz iptal edildi.`,
      data: {
        type: 'RESERVATION_CANCELLED',
        reservationId: reservationData.id,
        screen: 'Reservations'
      },
      channelId: 'reservations',
      priority: 'high'
    });
  }

  static async sendEquipmentReturn(userId: number, equipmentData: any): Promise<boolean> {
    return await this.sendToUser(userId, {
      title: '📦 İade Hatırlatması',
      body: `${equipmentData.name} için iade tarihi yaklaşıyor!`,
      data: {
        type: 'EQUIPMENT_RETURN',
        equipmentId: equipmentData.id,
        screen: 'EquipmentDetail'
      },
      channelId: 'equipment',
      priority: 'high',
      badge: 1
    });
  }

  static async sendMaintenanceAlert(userId: number, equipmentData: any): Promise<boolean> {
    return await this.sendToUser(userId, {
      title: '🔧 Bakım Bildirimi',
      body: `${equipmentData.name} bakıma alındı.`,
      data: {
        type: 'MAINTENANCE_ALERT',
        equipmentId: equipmentData.id,
        screen: 'EquipmentDetail'
      },
      channelId: 'maintenance',
      priority: 'normal'
    });
  }

  static async sendPaymentReminder(userId: number, paymentData: any): Promise<boolean> {
    return await this.sendToUser(userId, {
      title: '💰 Ödeme Hatırlatması',
      body: `${paymentData.amount} TL tutarında ödeme bekleniyor.`,
      data: {
        type: 'PAYMENT_REMINDER',
        orderId: paymentData.orderId,
        screen: 'Orders'
      },
      channelId: 'payments',
      priority: 'high',
      badge: 1
    });
  }

  static async sendNewMessage(userId: number, messageData: any): Promise<boolean> {
    return await this.sendToUser(userId, {
      title: `💬 ${messageData.senderName}`,
      body: messageData.message,
      data: {
        type: 'NEW_MESSAGE',
        messageId: messageData.id,
        screen: 'Messaging'
      },
      channelId: 'messages',
      priority: 'high',
      badge: 1
    });
  }
}

export default PushNotificationService;
