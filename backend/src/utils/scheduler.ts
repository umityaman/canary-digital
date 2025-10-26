import cron from 'node-cron';
import { reminderService } from '../services/reminderService';
import logger from '../utils/logger';

/**
 * Schedule daily reminders
 * Runs every day at 9:00 AM Turkish time
 */
export const initializeScheduler = () => {
  // Run every day at 9:00 AM (0 9 * * *)
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('⏰ Daily reminder scheduler triggered at 9:00 AM');
      await reminderService.scheduleDailyReminders();
    } catch (error) {
      logger.error('❌ Daily reminder scheduler failed:', error);
    }
  }, {
    timezone: 'Europe/Istanbul',
  });

  // Also run at startup (for testing/development)
  logger.info('✅ Reminder scheduler initialized (runs daily at 9:00 AM Turkish time)');
  
  // Optional: Run immediately on startup in development
  if (process.env.NODE_ENV === 'development') {
    logger.info('🔧 Development mode: Skipping immediate reminder run');
    // Uncomment to test on startup:
    // reminderService.scheduleDailyReminders();
  }
};

export default {
  initializeScheduler,
};
