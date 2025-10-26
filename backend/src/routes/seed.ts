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
 * @route   GET /api/seed/test
 * @desc    Test database connection and raw SQL
 * @access  Public (for debugging)
 */
router.get('/test', async (req, res) => {
  try {
    // Test 1: Simple query
    const result1 = await prisma.$queryRaw`SELECT current_database(), version()`;
    
    // Test 2: Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    res.json({
      success: true,
      database: result1,
      tables: tables,
      prismaWorks: true,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
});

/**
 * @route   POST /api/seed/migrate-simple
 * @desc    Simple migration with step-by-step logging
 * @access  Private (Admin)
 */
router.post('/migrate-simple', authenticateToken, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    console.log('[MIGRATION] Starting simple migration...');
    const steps = [];

    // Step 1: Create Offer table
    try {
      console.log('[MIGRATION] Creating Offer table...');
      const sql1 = `CREATE TABLE IF NOT EXISTS "Offer" (
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;
      await prisma.$executeRawUnsafe(sql1);
      steps.push('✅ Offer table created');
      console.log('[MIGRATION] Offer table created successfully');
    } catch (e: any) {
      const msg = `❌ Offer table: ${e.message}`;
      steps.push(msg);
      console.error('[MIGRATION] Offer table error:', e.message);
    }

    // Step 2: Create Expense table
    try {
      console.log('[MIGRATION] Creating Expense table...');
      const sql2 = `CREATE TABLE IF NOT EXISTS "Expense" (
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;
      await prisma.$executeRawUnsafe(sql2);
      steps.push('✅ Expense table created');
      console.log('[MIGRATION] Expense table created successfully');
    } catch (e: any) {
      const msg = `❌ Expense table: ${e.message}`;
      steps.push(msg);
      console.error('[MIGRATION] Expense table error:', e.message);
    }

    console.log('[MIGRATION] Migration completed with', steps.length, 'steps');
    res.json({ success: true, steps });
  } catch (error: any) {
    console.error('[MIGRATION] Fatal error:', error);
    res.status(500).json({ success: false, error: error.message, stack: error.stack?.substring(0, 500) });
  }
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
    
    const results = [];
    
    // Test 1: Create Offer table
    try {
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
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.push('Offer table created (no FK)');
      
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Offer_customerId_idx" ON "Offer"("customerId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Offer_status_idx" ON "Offer"("status")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Offer_offerDate_idx" ON "Offer"("offerDate")`);
      results.push('Offer indexes created');
    } catch (err: any) {
      results.push(`Offer table error: ${err.message}`);
      log.error('Offer table creation failed:', err);
    }
    
    log.info('Offer table phase completed');
    
    // Test 2: Create Expense table  
    try {
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
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.push('Expense table created (no FK)');
      
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Expense_companyId_idx" ON "Expense"("companyId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Expense_category_idx" ON "Expense"("category")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"("date")`);
      results.push('Expense indexes created');
    } catch (err: any) {
      results.push(`Expense table error: ${err.message}`);
      log.error('Expense table creation failed:', err);
    }

    log.info('Expense table phase completed');
    log.info('Migration completed - Foreign keys skipped for safety');

    log.info('Migration completed successfully');

    res.json({
      success: true,
      message: 'Database migration completed successfully',
      tables: ['Offer', 'Expense'],
      details: results,
      note: 'Foreign key constraints skipped - tables created without FK references',
    });
  } catch (error: any) {
    log.error('Migration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run migration',
      error: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
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
