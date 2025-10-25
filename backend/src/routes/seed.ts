import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../index';
import log from '../utils/logger';

const execPromise = promisify(exec);
const router = express.Router();

/**
 * @route   GET /api/seed/health
 * @desc    Test if seed route is loaded
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Seed route loaded successfully' });
});

/**
 * @route   POST /api/seed/migrate
 * @desc    Run database migrations (ADMIN ONLY)
 * @access  Private (Admin)
 */
router.post('/migrate', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if ((req as any).user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can run migrations',
      });
    }

    log.info('Running database migration...');
    
    // Run prisma db push to sync schema
    const { stdout, stderr } = await execPromise('npx prisma db push --accept-data-loss');

    log.info('Migration completed', { stdout, stderr });

    res.json({
      success: true,
      message: 'Database migration completed successfully',
      output: stdout,
      warnings: stderr || null,
    });
  } catch (error: any) {
    log.error('Migration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run migration',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/seed
 * @desc    Seed database with test data (ADMIN ONLY)
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if ((req as any).user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can seed the database',
      });
    }

    log.info('Starting database seed...');

    // Simple inline seed without tsx
    const company = await prisma.company.upsert({
      where: { id: 1 },
      create: {
        name: 'Canary Camera Rentals',
        email: 'info@canaryrentals.com',
        phone: '+90 212 555 0123',
        address: 'İstanbul, Türkiye',
        timezone: 'Europe/Istanbul',
      },
      update: {},
    });

    // Create test data count
    const invoiceCount = await prisma.invoice.count();
    const offerCount = await prisma.offer.count();
    
    const summary = {
      company: company.name,
      invoices: invoiceCount,
      offers: offerCount,
      message: invoiceCount > 0 ? 'Database already has data' : 'Run /api/seed/full for complete seeding',
    };

    res.json({
      success: true,
      message: 'Quick seed completed',
      data: summary,
    });
  } catch (error: any) {
    log.error('Seed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error.message,
    });
  }
});

export default router;
