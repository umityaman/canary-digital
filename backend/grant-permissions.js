const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/canary_db'
    }
  }
});

async function grantPermissions() {
  try {
    console.log('🔒 Granting permissions to postgres user...\n');
    
    const tables = [
      'JournalEntry',
      'JournalEntryItem',
      'ChartOfAccounts',
      'AccountCard',
      'AccountCardTransaction',
      'BankAccount',
      'BankTransaction',
      'CashTransaction',
    ];
    
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON TABLE "${table}" TO postgres;`);
        console.log(`✅ Granted ALL on ${table}`);
      } catch (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
      }
    }
    
    // Grant on sequences too
    const sequences = [
      'JournalEntry_id_seq',
      'JournalEntryItem_id_seq',
      'ChartOfAccounts_id_seq',
    ];
    
    for (const seq of sequences) {
      try {
        await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON SEQUENCE "${seq}" TO postgres;`);
        console.log(`✅ Granted ALL on sequence ${seq}`);
      } catch (error) {
        console.log(`⚠️  ${seq}: ${error.message}`);
      }
    }
    
    console.log('\n✅ Permissions granted successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

grantPermissions();
