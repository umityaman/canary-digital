const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/railway'
    }
  }
});

async function checkColumns() {
  console.log('\n=== JournalEntryItem Columns ===');
  const columns = await prisma.$queryRaw`
    SELECT column_name
    FROM information_schema.columns 
    WHERE table_name = 'JournalEntryItem' 
    ORDER BY ordinal_position
  `;
  console.log(columns.map(c => c.column_name).join(', '));
  await prisma.$disconnect();
}

checkColumns();
