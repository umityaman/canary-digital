const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://canary_user:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/canary_db'
    }
  }
});

async function grantPermissionsToPostgres() {
  try {
    console.log('🔐 Granting permissions to postgres user...\n');
    
    // Grant all privileges on all tables to postgres
    await prisma.$executeRawUnsafe(`
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
    `);
    console.log('✅ Granted table privileges');
    
    // Grant all privileges on all sequences to postgres
    await prisma.$executeRawUnsafe(`
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
    `);
    console.log('✅ Granted sequence privileges');
    
    // Grant usage on schema
    await prisma.$executeRawUnsafe(`
      GRANT USAGE ON SCHEMA public TO postgres;
    `);
    console.log('✅ Granted schema usage');
    
    // Verify grants - check JournalEntry specifically
    const result = await prisma.$queryRawUnsafe(`
      SELECT grantee, table_name, privilege_type 
      FROM information_schema.table_privileges 
      WHERE grantee = 'postgres' AND table_schema = 'public' 
      AND table_name IN ('JournalEntry', 'ChartOfAccounts', 'Invoice')
      ORDER BY table_name, privilege_type;
    `);
    
    console.log('\n📋 Granted privileges to postgres user:');
    console.table(result);
    
    console.log('\n✅ All permissions granted successfully!');
    console.log('🔄 Now updating DATABASE_URL secret to use Cloud SQL...\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

grantPermissionsToPostgres();
