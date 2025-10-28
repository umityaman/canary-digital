const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCustomers() {
  try {
    // Get all users with role customer
    const customers = await prisma.user.findMany({
      where: {
        role: 'customer'
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
      }
    });
    
    console.log('\n========================================');
    console.log('CUSTOMERS IN PRODUCTION DB:');
    console.log('========================================\n');
    
    if (customers.length === 0) {
      console.log('❌ NO CUSTOMERS FOUND!');
    } else {
      console.log(`✅ Found ${customers.length} customers:\n`);
      customers.forEach(c => {
        console.log(`ID: ${c.id} | Name: ${c.name} | Email: ${c.email} | CompanyId: ${c.companyId}`);
      });
    }
    
    console.log('\n========================================\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomers();
