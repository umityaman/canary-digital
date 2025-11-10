const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/canary_db'
    }
  }
});

async function checkTables() {
  try {
    console.log('🔍 Checking if tables exist in Cloud SQL...\n');
    
    // Check JournalEntry table
    try {
      const jeCount = await prisma.journalEntry.count();
      console.log(`✅ JournalEntry table exists - Count: ${jeCount}`);
    } catch (err) {
      console.log(`❌ JournalEntry table ERROR: ${err.message}`);
    }
    
    // Check ChartOfAccounts table
    try {
      const coaCount = await prisma.chartOfAccounts.count();
      console.log(`✅ ChartOfAccounts table exists - Count: ${coaCount}`);
    } catch (err) {
      console.log(`❌ ChartOfAccounts table ERROR: ${err.message}`);
    }
    
    // Check Invoice table (working baseline)
    try {
      const invCount = await prisma.invoice.count();
      console.log(`✅ Invoice table exists - Count: ${invCount}`);
    } catch (err) {
      console.log(`❌ Invoice table ERROR: ${err.message}`);
    }
    
    // List all tables
    console.log('\n📋 Listing all tables in database:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    console.table(tables);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
