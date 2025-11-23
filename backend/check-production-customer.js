// Check production database for Customer 20
const { PrismaClient } = require('@prisma/client');

// Use production DATABASE_URL from environment
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://canary_user:CanaryRental2024Secure@35.205.55.157:5432/canary'
    }
  }
});

async function checkProductionCustomer() {
  try {
    console.log('🔍 Checking PRODUCTION database for Customer 20...\n');
    
    const customer = await prisma.customer.findUnique({ 
      where: { id: 20 } 
    });
    
    if (customer) {
      console.log('✅ Customer 20 EXISTS:', customer.name, customer.email);
    } else {
      console.log('❌ Customer 20 NOT FOUND in production!');
    }
    
    console.log('\n🔍 Checking Order 12 in production...');
    const order = await prisma.order.findUnique({
      where: { id: 12 },
      select: { id: true, orderNumber: true, customerId: true }
    });
    
    if (order) {
      console.log('✅ Order 12 EXISTS:', order.orderNumber, 'customerId:', order.customerId);
      
      // Check if that customer exists
      const orderCustomer = await prisma.customer.findUnique({
        where: { id: order.customerId }
      });
      
      if (orderCustomer) {
        console.log('✅ Order customer EXISTS:', orderCustomer.name);
      } else {
        console.log('❌ Order customer ID', order.customerId, 'NOT FOUND!');
      }
    } else {
      console.log('❌ Order 12 NOT FOUND!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionCustomer();
