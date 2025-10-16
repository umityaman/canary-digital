/**
 * Push Notification Integration Examples
 * 
 * This file demonstrates how to integrate push notifications
 * into existing backend routes and services.
 */

import PushNotificationService from '../services/pushNotification.service';

/**
 * EXAMPLE 1: Send notification when reservation is confirmed
 * File: backend/src/routes/reservations.ts
 */
export async function onReservationConfirmed(reservationId: number, userId: number, equipmentName: string) {
  await PushNotificationService.sendReservationConfirmation(userId, {
    id: reservationId,
    equipmentName: equipmentName
  });
}

/**
 * EXAMPLE 2: Send notification 24h before reservation
 * File: backend/src/services/scheduler.ts or cron job
 */
export async function sendReservationReminders() {
  // Query reservations starting in 24 hours
  const upcomingReservations = []; // Get from database
  
  for (const reservation of upcomingReservations) {
    await PushNotificationService.sendReservationReminder(
      reservation.userId,
      {
        id: reservation.id,
        equipmentName: reservation.equipment.name
      }
    );
  }
}

/**
 * EXAMPLE 3: Send notification when equipment needs maintenance
 * File: backend/src/routes/equipment.ts
 */
export async function onEquipmentMaintenance(equipmentId: number, equipmentName: string, companyId: number) {
  // Notify all users in the company
  await PushNotificationService.sendToCompany(companyId, {
    title: '🔧 Bakım Bildirimi',
    body: `${equipmentName} bakıma alındı.`,
    data: {
      type: 'MAINTENANCE_ALERT',
      equipmentId: equipmentId,
      screen: 'EquipmentDetail'
    },
    channelId: 'maintenance',
    priority: 'normal'
  });
}

/**
 * EXAMPLE 4: Send notification when new message arrives
 * File: backend/src/routes/messaging.ts
 */
export async function onNewMessage(recipientId: number, senderName: string, message: string, messageId: number) {
  await PushNotificationService.sendNewMessage(recipientId, {
    id: messageId,
    senderName: senderName,
    message: message
  });
}

/**
 * EXAMPLE 5: Send notification when payment is due
 * File: backend/src/routes/orders.ts
 */
export async function onPaymentDue(userId: number, orderId: number, amount: number) {
  await PushNotificationService.sendPaymentReminder(userId, {
    orderId: orderId,
    amount: amount
  });
}

/**
 * EXAMPLE 6: Send custom notification to specific users
 * Admin feature to send announcements
 */
export async function sendCustomNotification(
  userIds: number[],
  title: string,
  body: string,
  data?: any
) {
  const sentCount = await PushNotificationService.sendToUsers(userIds, {
    title,
    body,
    data,
    priority: 'high'
  });
  
  return { sentCount, totalUsers: userIds.length };
}

/**
 * EXAMPLE 7: Send broadcast to entire company
 * Admin feature for company-wide announcements
 */
export async function sendCompanyBroadcast(
  companyId: number,
  title: string,
  body: string
) {
  const sentCount = await PushNotificationService.sendToCompany(companyId, {
    title,
    body,
    priority: 'normal'
  });
  
  return { sentCount };
}

/**
 * INTEGRATION GUIDE:
 * 
 * 1. Import PushNotificationService wherever you need to send notifications
 * 2. Call the appropriate method after the event occurs
 * 3. Use try-catch to handle errors gracefully
 * 4. Don't block the main flow - send notifications asynchronously
 * 
 * Example in a route handler:
 * 
 * router.post('/reservations', authenticate, async (req, res) => {
 *   try {
 *     // Create reservation
 *     const reservation = await createReservation(req.body);
 *     
 *     // Send notification (don't await to avoid blocking)
 *     PushNotificationService.sendReservationConfirmation(
 *       req.user.id,
 *       { id: reservation.id, equipmentName: reservation.equipment.name }
 *     ).catch(err => console.error('Failed to send notification:', err));
 *     
 *     // Return response immediately
 *     res.json({ success: true, reservation });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 */

/**
 * CRON JOB SETUP for scheduled notifications:
 * 
 * Install: npm install node-cron
 * 
 * File: backend/src/jobs/notificationJobs.ts
 * 
 * import cron from 'node-cron';
 * import PushNotificationService from '../services/pushNotification.service';
 * import { PrismaClient } from '@prisma/client';
 * 
 * const prisma = new PrismaClient();
 * 
 * // Send reservation reminders every hour
 * cron.schedule('0 * * * *', async () => {
 *   const tomorrow = new Date();
 *   tomorrow.setDate(tomorrow.getDate() + 1);
 *   
 *   const upcomingReservations = await prisma.reservation.findMany({
 *     where: {
 *       startDate: {
 *         gte: new Date(),
 *         lte: tomorrow
 *       },
 *       notificationSent: false
 *     },
 *     include: { user: true, equipment: true }
 *   });
 *   
 *   for (const reservation of upcomingReservations) {
 *     await PushNotificationService.sendReservationReminder(
 *       reservation.userId,
 *       {
 *         id: reservation.id,
 *         equipmentName: reservation.equipment.name
 *       }
 *     );
 *     
 *     // Mark as sent
 *     await prisma.reservation.update({
 *       where: { id: reservation.id },
 *       data: { notificationSent: true }
 *     });
 *   }
 * });
 * 
 * Then import and run in index.ts:
 * import './jobs/notificationJobs';
 */
