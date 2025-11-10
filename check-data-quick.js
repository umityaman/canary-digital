const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/railway'
    }
  }
});

async function checkData() {
  const entries = await prisma.journalEntry.findMany({
    take: 5,
    select: {
      id: true,
      entryNumber: true,
      entryDate: true,
      description: true,
      totalDebit: true,
      totalCredit: true,
    },
    orderBy: { entryDate: 'desc' }
  });
  
  console.log(`\n📊 Found ${entries.length} journal entries in DB:\n`);
  console.table(entries);
  
  await prisma.$disconnect();
}

checkData();
