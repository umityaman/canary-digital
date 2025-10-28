const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/railway'
    }
  }
});

async function checkOrderRelations() {
  try {
    // Try to create an order and see what it requires
    const testOrder = {
      orderNumber: `TEST-${Date.now()}`,
      startDate: new Date(),
      endDate: new Date(),
      totalAmount: 100,
      status: 'completed',
      notes: 'Test',
      customerId: 1, // We know this works
    };

    console.log('Testing Order.create() with these fields:');
    console.log(JSON.stringify(testOrder, null, 2));
    console.log('\n========================================');
    
    try {
      const order = await prisma.order.create({
        data: testOrder,
      });
      console.log('✅ SUCCESS! Order created:', order.id);
    } catch (error) {
      console.log('❌ ERROR:', error.message);
      console.log('\nLet me check foreign key constraints...\n');
      
      // Check foreign keys
      const fkResult = await prisma.$queryRaw`
        SELECT
          tc.table_name, 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name='Order';
      `;
      
      console.log('FOREIGN KEY CONSTRAINTS on Order table:');
      fkResult.forEach(fk => {
        console.log(`  ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderRelations();
