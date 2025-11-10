const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/canary_db'
    }
  }
});

async function checkTables() {
  try {
    console.log('🔍 Checking Cloud SQL tables...\n');
    
    // Check JournalEntry
    try {
      const journalCount = await prisma.journalEntry.count();
      console.log('✅ JournalEntry table EXISTS - Count:', journalCount);
    } catch (error) {
      console.log('❌ JournalEntry table MISSING:', error.message);
    }
    
    // Check ChartOfAccounts
    try {
      const coaCount = await prisma.chartOfAccounts.count();
      console.log('✅ ChartOfAccounts table EXISTS - Count:', coaCount);
    } catch (error) {
      console.log('❌ ChartOfAccounts table MISSING:', error.message);
    }
    
    // Check JournalEntryItem
    try {
      const itemCount = await prisma.journalEntryItem.count();
      console.log('✅ JournalEntryItem table EXISTS - Count:', itemCount);
    } catch (error) {
      console.log('❌ JournalEntryItem table MISSING:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
