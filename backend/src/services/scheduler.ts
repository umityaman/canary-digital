import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendPickupReminder, sendReturnReminder } from '../utils/emailService';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Email Reminder Scheduler
 * Zamanlanmış görevlerle otomatik email hatırlatmaları gönderir
 */

/**
 * Pickup Reminder - Teslim alma 1 gün öncesi hatırlatması
 * Her gün saat 09:00'da çalışır
 */
export const startPickupReminderJob = () => {
  // Cron: Her gün saat 09:00'da çalışır
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('🔔 Pickup reminder job started');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Yarın başlayan ve PENDING veya CONFIRMED durumundaki siparişleri bul
      const ordersStartingTomorrow = await prisma.order.findMany({
        where: {
          startDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        },
        include: {
          customer: true,
          orderItems: {
            include: {
              equipment: true
            }
          },
          company: true
        }
      });

      logger.info(`Found ${ordersStartingTomorrow.length} orders starting tomorrow`);

      for (const order of ordersStartingTomorrow) {
        try {
          if (!order.customer?.email) {
            logger.warn(`Order ${order.orderNumber} has no customer email`);
            continue;
          }

          const pickupDate = new Date(order.startDate).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });

          const equipment = order.orderItems.map(item => ({
            name: item.equipment.name,
            quantity: item.quantity
          }));

          await sendPickupReminder(order.customer.email, {
            customerName: order.customer.name,
            orderNumber: order.orderNumber,
            pickupDate,
            pickupTime: '14:00', // Default pickup time, bu bilgiyi order'a ekleyebilirsiniz
            equipment,
            pickupAddress: order.company?.address || 'Ofisimiz',
            contactPhone: order.company?.phone || '+90 555 123 4567',
            orderUrl: `${process.env.FRONTEND_URL || 'https://frontend-5a3yqvtgp-umityamans-projects.vercel.app'}/orders/${order.id}`
          });

          logger.info(`✅ Pickup reminder sent for order ${order.orderNumber} to ${order.customer.email}`);
        } catch (error: any) {
          logger.error(`❌ Failed to send pickup reminder for order ${order.orderNumber}:`, error.message);
        }
      }

      logger.info('🔔 Pickup reminder job completed');
    } catch (error: any) {
      logger.error('❌ Pickup reminder job failed:', error.message);
    }
  });

  logger.info('✅ Pickup reminder cron job started (runs daily at 09:00)');
};

/**
 * Return Reminder - İade günü hatırlatması
 * Her gün saat 10:00'da çalışır
 */
export const startReturnReminderJob = () => {
  // Cron: Her gün saat 10:00'da çalışır
  cron.schedule('0 10 * * *', async () => {
    try {
      logger.info('🔔 Return reminder job started');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Bugün biten ve ACTIVE durumundaki siparişleri bul
      const ordersEndingToday = await prisma.order.findMany({
        where: {
          endDate: {
            gte: today,
            lt: tomorrow
          },
          status: 'ACTIVE'
        },
        include: {
          customer: true,
          orderItems: {
            include: {
              equipment: true
            }
          },
          company: true
        }
      });

      logger.info(`Found ${ordersEndingToday.length} orders ending today`);

      for (const order of ordersEndingToday) {
        try {
          if (!order.customer?.email) {
            logger.warn(`Order ${order.orderNumber} has no customer email`);
            continue;
          }

          const returnDate = new Date(order.endDate).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });

          const equipment = order.orderItems.map(item => ({
            name: item.equipment.name,
            quantity: item.quantity
          }));

          await sendReturnReminder(order.customer.email, {
            customerName: order.customer.name,
            orderNumber: order.orderNumber,
            returnDate,
            returnTime: '17:00', // Default return time
            equipment,
            returnAddress: order.company?.address || 'Ofisimiz',
            contactPhone: order.company?.phone || '+90 555 123 4567',
            lateFee: '100 TL/gün', // Bu bilgiyi company settings'e ekleyebilirsiniz
            orderUrl: `${process.env.FRONTEND_URL || 'https://frontend-5a3yqvtgp-umityamans-projects.vercel.app'}/orders/${order.id}`
          });

          logger.info(`✅ Return reminder sent for order ${order.orderNumber} to ${order.customer.email}`);
        } catch (error: any) {
          logger.error(`❌ Failed to send return reminder for order ${order.orderNumber}:`, error.message);
        }
      }

      logger.info('🔔 Return reminder job completed');
    } catch (error: any) {
      logger.error('❌ Return reminder job failed:', error.message);
    }
  });

  logger.info('✅ Return reminder cron job started (runs daily at 10:00)');
};

/**
 * Late Payment Warning - Gecikmiş ödeme kontrol
 * Her gün saat 11:00'da çalışır
 */
export const startLatePaymentCheckJob = () => {
  // Cron: Her gün saat 11:00'da çalışır
  cron.schedule('0 11 * * *', async () => {
    try {
      logger.info('🔔 Late payment check job started');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // TODO: Payment sistemi implement edildiğinde bu kısım aktif edilecek
      // Şu an için sadece log atıyoruz
      logger.info('Late payment check - Payment system not yet implemented');

      logger.info('🔔 Late payment check job completed');
    } catch (error: any) {
      logger.error('❌ Late payment check job failed:', error.message);
    }
  });

  logger.info('✅ Late payment check cron job started (runs daily at 11:00)');
};

/**
 * Tüm scheduler'ları başlat
 */
export const startAllSchedulers = () => {
  logger.info('🚀 Starting all email schedulers...');
  
  startPickupReminderJob();
  startReturnReminderJob();
  startLatePaymentCheckJob();
  
  logger.info('✅ All email schedulers started successfully');
};

/**
 * Test function - Hemen çalıştırma (development için)
 */
export const runPickupReminderNow = async () => {
  logger.info('🧪 Running pickup reminder manually...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const orders = await prisma.order.findMany({
    where: {
      startDate: {
        gte: tomorrow,
        lt: dayAfterTomorrow
      },
      status: {
        in: ['PENDING', 'CONFIRMED']
      }
    },
    include: {
      customer: true,
      orderItems: {
        include: {
          equipment: true
        }
      },
      company: true
    }
  });

  logger.info(`Found ${orders.length} orders for manual test`);
  return orders;
};
