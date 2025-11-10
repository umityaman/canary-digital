const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/canary_db'
    }
  }
});

async function seedAccounting() {
  try {
    console.log('🌱 Seeding accounting data to Cloud SQL...\n');
    
    // 1. Chart of Accounts
    console.log('📋 Creating Chart of Accounts...');
    const accounts = [
      { code: '100', name: 'Kasa', type: 'ASSET', category: 'CURRENT_ASSETS', companyId: 1 },
      { code: '102', name: 'Bankalar', type: 'ASSET', category: 'CURRENT_ASSETS', companyId: 1 },
      { code: '120', name: 'Alıcılar', type: 'ASSET', category: 'CURRENT_ASSETS', companyId: 1 },
      { code: '320', name: 'Satıcılar', type: 'LIABILITY', category: 'SHORT_TERM_LIABILITIES', companyId: 1 },
      { code: '600', name: 'Satış Gelirleri', type: 'REVENUE', category: 'OPERATING_INCOME', companyId: 1 },
      { code: '770', name: 'Genel Giderler', type: 'EXPENSE', category: 'OPERATING_EXPENSES', companyId: 1 },
    ];
    
    for (const account of accounts) {
      await prisma.chartOfAccounts.upsert({
        where: { companyId_code: { companyId: account.companyId, code: account.code } },
        update: account,
        create: account
      });
    }
    console.log(`✅ Created ${accounts.length} chart of accounts`);
    
    // 2. Journal Entries
    console.log('\n📊 Creating Journal Entries...');
    const entry1 = await prisma.journalEntry.create({
      data: {
        entryNumber: 'JE-2025-001',
        entryDate: new Date('2025-01-15'),
        description: 'Açılış Kaydı',
        entryType: 'STANDARD',
        status: 'POSTED',
        totalDebit: 10000,
        totalCredit: 10000,
        company: { connect: { id: 1 } },
        creator: { connect: { id: 1 } },
        journalEntryItems: {
          create: [
            {
              accountCode: '100',
              accountName: 'Kasa',
              debit: 10000,
              credit: 0,
              description: 'Açılış kasası'
            },
            {
              accountCode: '600',
              accountName: 'Satış Gelirleri',
              debit: 0,
              credit: 10000,
              description: 'İlk satış'
            }
          ]
        }
      }
    });
    
    const entry2 = await prisma.journalEntry.create({
      data: {
        entryNumber: 'JE-2025-002',
        entryDate: new Date('2025-02-01'),
        description: 'Banka Transfer',
        entryType: 'STANDARD',
        status: 'POSTED',
        totalDebit: 5000,
        totalCredit: 5000,
        company: { connect: { id: 1 } },
        creator: { connect: { id: 1 } },
        journalEntryItems: {
          create: [
            {
              accountCode: '102',
              accountName: 'Bankalar',
              debit: 5000,
              credit: 0,
              description: 'Bankaya yatırılan'
            },
            {
              accountCode: '100',
              accountName: 'Kasa',
              debit: 0,
              credit: 5000,
              description: 'Kasadan çekilen'
            }
          ]
        }
      }
    });
    
    console.log(`✅ Created 2 journal entries: ${entry1.entryNumber}, ${entry2.entryNumber}`);
    
    // 3. Verify counts
    console.log('\n📊 Final counts:');
    const coaCount = await prisma.chartOfAccounts.count();
    const jeCount = await prisma.journalEntry.count();
    const jeiCount = await prisma.journalEntryItem.count();
    
    console.log(`  Chart of Accounts: ${coaCount}`);
    console.log(`  Journal Entries: ${jeCount}`);
    console.log(`  Journal Entry Items: ${jeiCount}`);
    
    console.log('\n✅ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAccounting();
