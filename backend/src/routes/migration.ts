// Temporary migration endpoint - DELETE AFTER USE
import express from 'express';
import { prisma } from '../index';

const router = express.Router();

router.post('/run-income-migration', async (req, res) => {
  try {
    console.log('Running Income table migration...');
    
    // Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Income" (
        "id" SERIAL PRIMARY KEY,
        "companyId" INTEGER NOT NULL,
        "description" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "category" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'received',
        "paymentMethod" TEXT,
        "notes" TEXT,
        "invoiceId" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Income_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Income_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    
    // Create indexes
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Income_companyId_idx" ON "Income"("companyId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Income_category_idx" ON "Income"("category")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Income_date_idx" ON "Income"("date")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Income_invoiceId_idx" ON "Income"("invoiceId")`);
    
    // Insert seed data
    const seedData = [
      { companyId: 1, description: 'Equipment Rental Income', amount: 15000, category: 'Equipment Rental', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'received', paymentMethod: 'Bank Transfer', notes: 'Camera equipment rental for fashion shoot' },
      { companyId: 1, description: 'Service Fee Income', amount: 8500, category: 'Service Fee', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'received', paymentMethod: 'Credit Card', notes: 'Production service fee - commercial project' },
      { companyId: 1, description: 'Product Sale Income', amount: 25000, category: 'Product Sale', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'received', paymentMethod: 'Bank Transfer', notes: 'LED lighting equipment sale' },
      { companyId: 1, description: 'Consulting Income', amount: 12500, category: 'Consulting', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'received', paymentMethod: 'Cash', notes: 'Production consulting for music video' },
      { companyId: 1, description: 'Training Income', amount: 8000, category: 'Training', date: new Date(), status: 'pending', paymentMethod: 'Bank Transfer', notes: 'Camera operation training session' }
    ];
    
    for (const income of seedData) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "Income" ("companyId", "description", "amount", "category", "date", "status", "paymentMethod", "notes", "createdAt", "updatedAt")
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE description = $2)
      `, income.companyId, income.description, income.amount, income.category, income.date, income.status, income.paymentMethod, income.notes);
    }
    
    // Verify
    const count: any = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Income"`;
    
    res.json({
      success: true,
      message: 'Income table created successfully',
      incomeCount: Number(count[0].count)
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/run-expense-migration', async (req, res) => {
  try {
    console.log('Running Expense table migration...');
    
    // Check if table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Expense'
      );
    `;
    
    if (!(tableExists as any)[0].exists) {
      // Create table if doesn't exist
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "Expense" (
          "id" SERIAL PRIMARY KEY,
          "companyId" INTEGER NOT NULL,
          "description" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "category" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'paid',
          "paymentMethod" TEXT,
          "notes" TEXT,
          "invoiceId" INTEGER,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "Expense_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE
        )
      `);
      
      // Create indexes
      await prisma.$executeRawUnsafe(`CREATE INDEX "Expense_companyId_idx" ON "Expense"("companyId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "Expense_category_idx" ON "Expense"("category")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "Expense_date_idx" ON "Expense"("date")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "Expense_invoiceId_idx" ON "Expense"("invoiceId")`);
    } else {
      // Table exists, check if invoiceId column exists
      const columnExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'Expense'
          AND column_name = 'invoiceId'
        );
      `;
      
      if (!(columnExists as any)[0].exists) {
        // Add invoiceId column if it doesn't exist
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "Expense" 
          ADD COLUMN "invoiceId" INTEGER,
          ADD CONSTRAINT "Expense_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE
        `);
        
        // Create index
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Expense_invoiceId_idx" ON "Expense"("invoiceId")`);
      }
    }
    
    // Insert seed data
    const seedData = [
      { companyId: 1, description: 'Office Rent', amount: 15000, category: 'Kira', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), status: 'paid', paymentMethod: 'bank_transfer', notes: 'October 2025 office rent' },
      { companyId: 1, description: 'Electricity Bill', amount: 3500, category: 'Elektrik', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), status: 'paid', paymentMethod: 'cash', notes: 'Monthly electricity bill' },
      { companyId: 1, description: 'Employee Salaries', amount: 45000, category: 'Personel Maaşı', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'paid', paymentMethod: 'bank_transfer', notes: 'October 2025 salaries' },
      { companyId: 1, description: 'Equipment Maintenance', amount: 8000, category: 'Bakım Onarım', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'paid', paymentMethod: 'cash', notes: 'Camera maintenance service' },
      { companyId: 1, description: 'Office Supplies', amount: 12000, category: 'Malzeme Alımı', date: new Date(), status: 'pending', paymentMethod: 'bank_transfer', notes: 'Stationery and equipment purchase' }
    ];
    
    let insertedCount = 0;
    for (const expense of seedData) {
      const result = await prisma.$executeRawUnsafe(`
        INSERT INTO "Expense" ("companyId", "description", "amount", "category", "date", "status", "paymentMethod", "notes", "createdAt", "updatedAt")
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM "Expense" WHERE description = $2)
      `, expense.companyId, expense.description, expense.amount, expense.category, expense.date, expense.status, expense.paymentMethod, expense.notes);
      if (result) insertedCount++;
    }
    
    // Verify
    const count: any = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Expense"`;
    
    res.json({
      success: true,
      message: 'Expense table migrated successfully',
      expenseCount: Number(count[0].count),
      newRecordsInserted: insertedCount
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
