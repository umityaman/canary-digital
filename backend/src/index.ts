import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { startAllSchedulers } from './services/scheduler';
import logger from './config/logger';

const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=>{
  console.log(`Backend listening on port ${PORT}`);
  
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
