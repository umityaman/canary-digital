// Create Income table in production database
const { Client } = require('pg');

const client = new Client({
  host: '35.205.55.157',
  port: 5432,
  user: 'postgres',
  password: 'Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5',
  database: 'railway',
  ssl: {
    rejectUnauthorized: false
  }
});

const createTableSQL = `
-- Create Income table
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
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Income_companyId_idx" ON "Income"("companyId");
CREATE INDEX IF NOT EXISTS "Income_category_idx" ON "Income"("category");
CREATE INDEX IF NOT EXISTS "Income_date_idx" ON "Income"("date");
CREATE INDEX IF NOT EXISTS "Income_invoiceId_idx" ON "Income"("invoiceId");
`;

const seedDataSQL = `
-- Insert seed data
INSERT INTO "Income" ("companyId", "description", "amount", "category", "date", "status", "paymentMethod", "notes")
SELECT 1, 'Equipment Rental Income', 15000.00, 'Equipment Rental', NOW() - INTERVAL '5 days', 'received', 'Bank Transfer', 'Camera equipment rental for fashion shoot'
WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE description = 'Equipment Rental Income')
UNION ALL
SELECT 1, 'Service Fee Income', 8500.00, 'Service Fee', NOW() - INTERVAL '3 days', 'received', 'Credit Card', 'Production service fee - commercial project'
WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE description = 'Service Fee Income')
UNION ALL
SELECT 1, 'Product Sale Income', 25000.00, 'Product Sale', NOW() - INTERVAL '2 days', 'received', 'Bank Transfer', 'LED lighting equipment sale'
WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE description = 'Product Sale Income')
UNION ALL
SELECT 1, 'Consulting Income', 12500.00, 'Consulting', NOW() - INTERVAL '1 day', 'received', 'Cash', 'Production consulting for music video'
WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE description = 'Consulting Income')
UNION ALL
SELECT 1, 'Training Income', 8000.00, 'Training', NOW(), 'pending', 'Bank Transfer', 'Camera operation training session'
WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE description = 'Training Income');
`;

async function createIncomeTable() {
  try {
    console.log('\n🔧 Connecting to production database...\n');
    await client.connect();
    
    console.log('✅ Connected!\n');
    console.log('📝 Creating Income table...');
    await client.query(createTableSQL);
    console.log('✅ Income table created!\n');
    
    console.log('📝 Inserting seed data...');
    await client.query(seedDataSQL);
    console.log('✅ Seed data inserted!\n');
    
    // Verify
    const result = await client.query('SELECT COUNT(*) as count FROM "Income"');
    console.log(`📊 Total Income records: ${result.rows[0].count}\n`);
    
    // Show first record
    const sample = await client.query('SELECT * FROM "Income" LIMIT 1');
    if (sample.rows.length > 0) {
      console.log('📋 Sample Income record:');
      console.log(`   Description: ${sample.rows[0].description}`);
      console.log(`   Amount: ${sample.rows[0].amount} TL`);
      console.log(`   Category: ${sample.rows[0].category}\n`);
    }
    
    console.log('✅ INCOME TABLE SETUP COMPLETE!\n');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.detail) console.error('   Detail:', error.detail);
  } finally {
    await client.end();
  }
}

createIncomeTable();
