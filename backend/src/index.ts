import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { PrismaClient } from '@prisma/client';
import { startAllSchedulers } from './services/scheduler';
import { initializeTwilio } from './services/whatsapp.service';
import logger from './config/logger';

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=>{
  console.log(`✅ Backend listening on port ${PORT}`);
  logger.info(`✅ Backend listening on port ${PORT}`);
  
  // Initialize Twilio WhatsApp
  initializeTwilio();
  
  // Start email schedulers
  if (process.env.ENABLE_EMAIL_SCHEDULERS !== 'false') {
    try {
      startAllSchedulers();
      logger.info('📧 Email schedulers initialized');
    } catch (error: any) {
      logger.error('❌ Failed to start schedulers:', error.message);
    }
  } else {
    logger.info('📧 Email schedulers disabled (ENABLE_EMAIL_SCHEDULERS=false)');
  }
});
