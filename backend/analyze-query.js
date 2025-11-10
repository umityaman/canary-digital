const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function analyzeQuery() {
  try {
    console.log('🔍 Analyzing JournalEntry query...\n');
    
    // EXPLAIN ANALYZE the query
    const explain = await prisma.$queryRawUnsafe(`
      EXPLAIN ANALYZE
      SELECT id, "entryNumber", "entryDate", "entryType", description, reference, 
             "totalDebit", "totalCredit", status, "createdAt", "updatedAt"
      FROM "JournalEntry"
      WHERE "companyId" = 1
      ORDER BY "entryDate" DESC
      LIMIT 5;
    `);
    
    console.log('Query Plan:');
    explain.forEach(row => console.log(row['QUERY PLAN']));
    
    console.log('\n🔍 Checking indexes...\n');
    
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT 
        tablename, 
        indexname, 
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('JournalEntry', 'ChartOfAccounts')
      ORDER BY tablename, indexname;
    `);
    
    console.log('Existing indexes:');
    console.table(indexes);
    
    console.log('\n🔍 Checking table statistics...\n');
    
    const stats = await prisma.$queryRawUnsafe(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      AND tablename IN ('JournalEntry', 'ChartOfAccounts')
      ORDER BY tablename;
    `);
    
    console.log('Table statistics:');
    console.table(stats);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeQuery();
