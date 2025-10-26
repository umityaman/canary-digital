import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/railway?schema=public'
    }
  }
});

async function checkIncomeTable() {
  try {
    console.log('\n🔍 Checking Income table...\n');
    
    // Check if table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Income'
      )
    `;
    console.log('Income table exists:', tableExists[0].exists ? '✅ YES' : '❌ NO');
    
    if (tableExists[0].exists) {
      // Count records
      const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Income"`;
      console.log('Income records:', count[0].count);
      
      // Get sample
      const sample: any = await prisma.$queryRaw`SELECT * FROM "Income" LIMIT 1`;
      if (sample.length > 0) {
        console.log('\nSample record:');
        console.log('  Description:', sample[0].description);
        console.log('  Amount:', sample[0].amount, 'TL');
        console.log('  Category:', sample[0].category);
      }
    }
    
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkIncomeTable();
