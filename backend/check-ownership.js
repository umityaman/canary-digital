const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/canary_db'
    }
  }
});

async function checkOwnership() {
  try {
    console.log('🔍 Checking table ownership...\n');
    
    const result = await prisma.$queryRawUnsafe(`
      SELECT 
        tablename, 
        tableowner 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('JournalEntry', 'ChartOfAccounts', 'Invoice', 'User', 'Company')
      ORDER BY tablename;
    `);
    
    console.log('Table Owners:');
    console.table(result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOwnership();
