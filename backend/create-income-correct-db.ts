import { PrismaClient } from '@prisma/client';

// Connect to the ACTUAL production database that backend uses
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://canary_user:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@/canary_db?host=/cloudsql/canary-digital-475319:europe-west1:canary-postgres'
    }
  }
});

async function createIncomeTableProduction() {
  try {
    console.log('\n🔧 Connecting to ACTUAL production database...');
    console.log('Database: canary-digital-475319:europe-west1:canary-postgres\n');
    
    console.log('📝 Creating Income table...');
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
    console.log('✅ Income table created!\n');
    
    // Create indexes
    console.log('📝 Creating indexes...');
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Income_companyId_idx" ON "Income"("companyId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Income_category_idx" ON "Income"("category")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Income_date_idx" ON "Income"("date")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Income_invoiceId_idx" ON "Income"("invoiceId")`);
    console.log('✅ Indexes created!\n');
    
    // Insert seed data
    console.log('📝 Inserting seed data...');
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
    console.log('✅ Seed data inserted!\n');
    
    // Verify
    const count: any = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Income"`;
    console.log(`📊 Total Income records: ${count[0].count}\n`);
    
    console.log('✅ INCOME TABLE SETUP COMPLETE!\n');
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    if (error.code) console.error('   Code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

createIncomeTableProduction();
