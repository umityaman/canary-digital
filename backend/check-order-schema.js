const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/railway'
    }
  }
});

async function checkOrderSchema() {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'Order'
      ORDER BY ordinal_position;
    `;
    
    console.log('========================================');
    console.log('ORDER TABLE SCHEMA IN PRODUCTION:');
    console.log('========================================');
    result.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('========================================');
    console.log(`Total columns: ${result.length}`);
    console.log('========================================');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderSchema();
