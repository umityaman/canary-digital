const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      // Railway DB - has 10 chart of accounts already
      url: 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/railway'
    }
  }
});

async function quickSeed() {
  try {
    console.log('🌱 Quick seed to Railway DB...\n');
    
    // Check current data
    const coaCount = await prisma.chartOfAccounts.count();
    const jeCount = await prisma.journalEntry.count();
    
    console.log(`Current status:`);
    console.log(`  - Chart of Accounts: ${coaCount}`);
    console.log(`  - Journal Entries: ${jeCount}\n`);
    
    if (jeCount > 0) {
      console.log('✅ Journal entries already exist. Skipping seed.');
      return;
    }
    
    // Use raw SQL to insert journal entries
    console.log('📊 Inserting journal entries with SQL...');
    
    await prisma.$executeRaw`
      INSERT INTO "JournalEntry" (
        "entryNumber", "entryDate", "entryType", "description",
        "totalDebit", "totalCredit", "status", "companyId", "createdBy",
        "createdAt", "updatedAt"
      ) VALUES
      ('JE-2025-001', '2025-01-15', 'STANDARD', 'Açılış Kaydı - Test', 
       10000, 10000, 'POSTED', 1, 1, NOW(), NOW()),
      ('JE-2025-002', '2025-02-01', 'STANDARD', 'Banka Transfer - Test',
       5000, 5000, 'POSTED', 1, 1, NOW(), NOW()),
      ('JE-2025-003', '2025-03-10', 'STANDARD', 'Satış Kaydı - Test',
       15000, 15000, 'POSTED', 1, 1, NOW(), NOW())
    `;
    
    console.log('✅ Inserted 3 journal entries');
    
    // Insert items
    console.log('📝 Inserting journal entry items...');
    
    await prisma.$executeRaw`
      INSERT INTO "JournalEntryItem" (
        "journalEntryId", "lineNumber", "accountCode",
        "debit", "credit", "description"
      ) 
      SELECT 
        je.id,
        1,
        '100',
        10000,
        0,
        'Açılış kasası - Kasa'
      FROM "JournalEntry" je
      WHERE je."entryNumber" = 'JE-2025-001'
      
      UNION ALL
      
      SELECT 
        je.id,
        2,
        '600',
        0,
        10000,
        'İlk satış - Satış Gelirleri'
      FROM "JournalEntry" je
      WHERE je."entryNumber" = 'JE-2025-001'
    `;
    
    console.log('✅ Inserted items for JE-2025-001');
    
    // Final count
    const finalJE = await prisma.journalEntry.count();
    const finalItems = await prisma.$queryRaw`SELECT COUNT(*) FROM "JournalEntryItem"`;
    
    console.log(`\n📊 Final counts:`);
    console.log(`  - Journal Entries: ${finalJE}`);
    console.log(`  - Journal Entry Items: ${finalItems[0].count}`);
    console.log('\n✅ Seed completed!\n');
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickSeed();
