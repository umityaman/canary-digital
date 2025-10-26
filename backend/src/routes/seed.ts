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

    log.info('Starting database migration with raw SQL...');
    
    // Create Offer table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Offer" (
        "id" SERIAL PRIMARY KEY,
        "customerId" INTEGER NOT NULL,
        "offerNumber" TEXT UNIQUE NOT NULL,
        "offerDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "validUntil" TIMESTAMP(3) NOT NULL,
        "items" JSONB NOT NULL,
        "totalAmount" DOUBLE PRECISION NOT NULL,
        "vatAmount" DOUBLE PRECISION NOT NULL,
        "grandTotal" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Offer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Offer_customerId_idx" ON "Offer"("customerId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Offer_status_idx" ON "Offer"("status")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Offer_offerDate_idx" ON "Offer"("offerDate")`);
    
    log.info('Offer table created');
    
    // Create Expense table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Expense" (
        "id" SERIAL PRIMARY KEY,
        "companyId" INTEGER NOT NULL,
        "description" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "category" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "paymentMethod" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Expense_companyId_idx" ON "Expense"("companyId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Expense_category_idx" ON "Expense"("category")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"("date")`);

    log.info('Expense table created');

    log.info('Migration completed successfully');

    res.json({
      success: true,
      message: 'Database migration completed successfully',
      tables: ['Offer', 'Expense'],
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
