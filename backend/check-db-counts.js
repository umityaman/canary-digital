const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkCounts() {
  try {
    const invoiceCount = await prisma.invoice.count();
    const journalCount = await prisma.journalEntry.count();
    const coaCount = await prisma.chartOfAccounts.count();
    
    console.log('\n📊 Database Counts:');
    console.log('- Invoices:', invoiceCount);
    console.log('- Journal Entries:', journalCount);
    console.log('- Chart of Accounts:', coaCount);
    console.log('\nDatabase:', process.env.DATABASE_URL.match(/\/([^?]+)(\?|$)/)[1]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();
