const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCustomer() {
  const customer = await prisma.customer.findUnique({ where: { id: 20 } });
  console.log('Customer 20:', customer ? customer.name : 'NOT FOUND');
  
  const allCustomers = await prisma.customer.findMany({ select: { id: true, name: true } });
  console.log('\nAll Customers:', allCustomers);
  
  await prisma.$disconnect();
}

checkCustomer();
