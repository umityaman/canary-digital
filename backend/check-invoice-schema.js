const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInvoiceSchema() {
  try {
    // Get raw SQL to describe Invoice table
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Invoice'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n========================================');
    console.log('INVOICE TABLE COLUMNS (Production DB):');
    console.log('========================================\n');
    
    result.forEach(col => {
      console.log(`${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n========================================\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkInvoiceSchema();
