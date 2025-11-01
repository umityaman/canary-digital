import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

// Short-term: cast Prisma client to any to avoid generated-client type mismatches during triage
const prisma = new PrismaClient() as any;

// Email transporter (nodemailer already configured in app)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface NotificationData {
  companyId?: number;
  userId?: number;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  recipientEmail?: string;
  recipientPhone?: string;
  title: string;
  message: string;
  templateId?: string;
  category?: 'RESERVATION' | 'ORDER' | 'EQUIPMENT' | 'REMINDER' | 'ALERT';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  metadata?: any;
  scheduledFor?: Date;
  actionUrl?: string;
  actionLabel?: string;
}

interface TemplateVariables {
  [key: string]: string | number | Date;
}

export class NotificationService {
  /**
   * Create and optionally send a notification
   */
  static async create(data: NotificationData, sendNow: boolean = true) {
    try {
      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          companyId: data.companyId,
          userId: data.userId,
          type: data.type,
          recipientEmail: data.recipientEmail,
          recipientPhone: data.recipientPhone,
          title: data.title,
          message: data.message,
          templateId: data.templateId,
          category: data.category,
          priority: data.priority || 'NORMAL',
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          scheduledFor: data.scheduledFor,
          actionUrl: data.actionUrl,
          actionLabel: data.actionLabel,
          status: sendNow ? 'PENDING' : 'SCHEDULED',
        },
      });

      // Send immediately if requested and not scheduled
      if (sendNow && !data.scheduledFor) {
        await this.send(notification.id);
      }

      return notification;
    } catch (error: any) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Send a notification by ID
   */
  static async send(notificationId: number) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.status === 'SENT' || notification.status === 'DELIVERED') {
        return notification; // Already sent
      }

      // Check user preferences if userId is present
      if (notification.userId) {
        const canSend = await this.checkUserPreferences(
          notification.userId,
          notification.type,
          notification.category
        );
        if (!canSend) {
          await prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'SKIPPED', errorMessage: 'User preferences disabled this notification' },
          });
          return notification;
        }
      }

      let success = false;
      let errorMessage = '';

      // Send based on type
      switch (notification.type) {
        case 'EMAIL':
          success = await this.sendEmail(notification);
          break;
        case 'SMS':
          success = await this.sendSMS(notification);
          break;
        case 'PUSH':
          success = await this.sendPush(notification);
          break;
        case 'IN_APP':
          success = true; // In-app notifications are just database records
          break;
        default:
          errorMessage = 'Unknown notification type';
      }

      // Update notification status
      const updateData: any = {
        status: success ? 'SENT' : 'FAILED',
        sentAt: success ? new Date() : null,
        failedAt: success ? null : new Date(),
        errorMessage: success ? null : errorMessage,
        retryCount: notification.retryCount + 1,
      };

      if (success && notification.type === 'EMAIL') {
        updateData.deliveredAt = new Date();
        updateData.status = 'DELIVERED';
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: updateData,
      });

      return updatedNotification;
    } catch (error: any) {
      console.error(`Failed to send notification ${notificationId}:`, error);
      
      // Update as failed
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          errorMessage: error.message,
          retryCount: { increment: 1 },
        },
      });

      throw error;
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmail(notification: any): Promise<boolean> {
    try {
      if (!notification.recipientEmail) {
        throw new Error('Recipient email is required');
      }

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: notification.recipientEmail,
        subject: notification.title,
        html: this.formatEmailBody(notification),
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  /**
   * Send SMS notification (placeholder - requires Twilio integration)
   */
  private static async sendSMS(notification: any): Promise<boolean> {
    try {
      if (!notification.recipientPhone) {
        throw new Error('Recipient phone is required');
      }

      // TODO: Implement Twilio SMS sending
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   body: notification.message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: notification.recipientPhone
      // });

      console.log(`SMS would be sent to ${notification.recipientPhone}: ${notification.message}`);
      return true; // Mock success for now
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  /**
   * Send push notification (placeholder - requires web-push or Firebase)
   */
  private static async sendPush(notification: any): Promise<boolean> {
    try {
      // TODO: Implement web-push or Firebase Cloud Messaging
      console.log(`Push notification would be sent: ${notification.title}`);
      return true; // Mock success for now
    } catch (error) {
      console.error('Push send error:', error);
      return false;
    }
  }

  /**
   * Format email body with HTML
   */
  private static formatEmailBody(notification: any): string {
    const actionButton = notification.actionUrl
      ? `<div style="margin: 30px 0;">
           <a href="${notification.actionUrl}" 
              style="background-color: #2563eb; color: white; padding: 12px 24px; 
                     text-decoration: none; border-radius: 6px; display: inline-block;">
             ${notification.actionLabel || 'View Details'}
           </a>
         </div>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">${notification.title}</h2>
          <div style="background-color: white; border-radius: 6px; padding: 20px; margin: 20px 0;">
            ${notification.message}
          </div>
          ${actionButton}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>Bu otomatik bir bildirimdir. Lütfen yanıtlamayın.</p>
            <p>© ${new Date().getFullYear()} CANARY Rental Management. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Check user notification preferences
   */
  private static async checkUserPreferences(
    userId: number,
    type: string,
    category?: string | null
  ): Promise<boolean> {
    try {
      const prefs = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!prefs) {
        return true; // Default to allowing if no preferences set
      }

      // Check type-level preferences
      if (type === 'EMAIL' && !prefs.emailEnabled) return false;
      if (type === 'SMS' && !prefs.smsEnabled) return false;
      if (type === 'PUSH' && !prefs.pushEnabled) return false;
      if (type === 'IN_APP' && !prefs.inAppEnabled) return false;

      // Check category-level preferences
      if (category && type === 'EMAIL') {
        if (category === 'RESERVATION' && !prefs.reservationEmail) return false;
        if (category === 'ORDER' && !prefs.orderEmail) return false;
        if (category === 'EQUIPMENT' && !prefs.equipmentEmail) return false;
        if (category === 'REMINDER' && !prefs.reminderEmail) return false;
        if (category === 'ALERT' && !prefs.alertEmail) return false;
      }

      // Check quiet hours
      if (prefs.quietHoursStart && prefs.quietHoursEnd) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        if (currentTime >= prefs.quietHoursStart && currentTime <= prefs.quietHoursEnd) {
          return false; // In quiet hours
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking user preferences:', error);
      return true; // Default to allowing on error
    }
  }

  /**
   * Create notification from template
   */
  static async createFromTemplate(
    templateCode: string,
    variables: TemplateVariables,
    recipientData: {
      userId?: number;
      email?: string;
      phone?: string;
      companyId?: number;
    },
    sendNow: boolean = true
  ) {
    try {
      // Get template
      const template = await prisma.notificationTemplate.findUnique({
        where: { code: templateCode },
      });

      if (!template || !template.isActive) {
        throw new Error(`Template ${templateCode} not found or inactive`);
      }

      // Replace variables in body
      let message = template.body;
      let subject = template.subject || template.name;
      
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        const valueStr = value instanceof Date ? value.toLocaleDateString('tr-TR') : String(value);
        message = message.replace(new RegExp(placeholder, 'g'), valueStr);
        subject = subject.replace(new RegExp(placeholder, 'g'), valueStr);
      });

      // Create notification
      return await this.create(
        {
          companyId: recipientData.companyId,
          userId: recipientData.userId,
          type: template.type as any,
          recipientEmail: recipientData.email,
          recipientPhone: recipientData.phone,
          title: subject,
          message: message,
          templateId: template.code,
          category: template.category as any,
          metadata: variables,
        },
        sendNow
      );
    } catch (error: any) {
      console.error('Failed to create notification from template:', error);
      throw error;
    }
  }

  /**
   * Process scheduled notifications
   */
  static async processScheduled() {
    try {
      const now = new Date();
      
      // Find notifications scheduled for now or earlier
      const scheduled = await prisma.notification.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledFor: {
            lte: now,
          },
        },
        take: 50, // Process in batches
      });

      console.log(`Processing ${scheduled.length} scheduled notifications`);

      for (const notification of scheduled) {
        try {
          await this.send(notification.id);
        } catch (error) {
          console.error(`Failed to send scheduled notification ${notification.id}:`, error);
        }
      }

      return scheduled.length;
    } catch (error) {
      console.error('Failed to process scheduled notifications:', error);
      return 0;
    }
  }

  /**
   * Retry failed notifications
   */
  static async retryFailed() {
    try {
      // Find failed notifications that haven't exceeded max retries
      const failed = await prisma.notification.findMany({
        where: {
          status: 'FAILED',
          retryCount: {
            lt: 3, // maxRetries from schema default
          },
        },
        take: 50,
      });

      console.log(`Retrying ${failed.length} failed notifications`);

      for (const notification of failed) {
        try {
          await this.send(notification.id);
        } catch (error) {
          console.error(`Retry failed for notification ${notification.id}:`, error);
        }
      }

      return failed.length;
    } catch (error) {
      console.error('Failed to retry notifications:', error);
      return 0;
    }
  }

  /**
   * Get user's unread notifications
   */
  static async getUnread(userId: number, limit: number = 20) {
    return await prisma.notification.findMany({
      where: {
        userId,
        type: 'IN_APP',
        status: {
          in: ['SENT', 'DELIVERED'],
        },
        readAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all user notifications as read
   */
  static async markAllAsRead(userId: number) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  /**
   * Get user notifications with filters
   */
  static async getUserNotifications(userId: number, filters: any = {}) {
    const where: any = { userId };
    
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.isRead !== undefined) {
      where.readAt = filters.isRead ? { not: null } : null;
    }

    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  /**
   * Get notification by ID
   */
  static async getById(id: number) {
    return await prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  /**
   * Get unread notification count for user
   */
  static async getUnreadCount(userId: number) {
    return await prisma.notification.count({
      where: {
        userId,
        readAt: null,
        status: { not: 'FAILED' }
      }
    });
  }

  /**
   * Delete notification
   */
  static async delete(id: number) {
    return await prisma.notification.delete({
      where: { id }
    });
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(ids: number[]) {
    const result = await prisma.notification.updateMany({
      where: { 
        id: { in: ids } 
      },
      data: {
        readAt: new Date(),
        status: 'READ'
      }
    });
    return result.count;
  }

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: number) {
    return await prisma.notificationPreference.findUnique({
      where: { userId }
    });
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(userId: number, preferences: any) {
    return await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        ...preferences,
        updatedAt: new Date()
      },
      create: {
        userId,
        ...preferences
      }
    });
  }

  /**
   * Get all notifications (admin)
   */
  static async getAll(filters: any = {}) {
    const where: any = {};
    
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  /**
   * Get notification statistics
   */
  static async getStats(companyId?: number) {
    const where: any = {};
    if (companyId) where.companyId = companyId;

    const [total, unread, byType, byPriority] = await Promise.all([
      // Total notifications
      prisma.notification.count({ where }),
      
      // Unread notifications
      prisma.notification.count({ 
        where: { ...where, readAt: null } 
      }),
      
      // By type
      prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: { id: true }
      }),
      
      // By priority
      prisma.notification.groupBy({
        by: ['priority'],
        where,
        _count: { id: true }
      })
    ]);

    return {
      total,
      unread,
      byType: byType.reduce((acc, item) => ({
        ...acc,
        [item.type]: item._count.id
      }), {}),
      byPriority: byPriority.reduce((acc, item) => ({
        ...acc,
        [item.priority]: item._count.id
      }), {})
    };
  }
}

export default NotificationService;
