import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testInvoiceCreation() {
  console.log('🔍 Testing invoice creation flow...\n');

  try {
    // Step 1: Fetch customer
    console.log('1️⃣ Fetching customer ID 20...');
    const customer = await prisma.customer.findUnique({
      where: { id: 20 },
    });
    console.log('✅ Customer:', customer?.name || customer?.email);

    // Step 2: Fetch order WITH customer relation
    console.log('\n2️⃣ Fetching order ID 12 WITH customer relation...');
    const order = await prisma.order.findUnique({
      where: { id: 12 },
      include: {
        orderItems: { include: { equipment: true } },
        customer: true,
      },
    });
    
    if (!order) {
      throw new Error('Order not found');
    }

    console.log('✅ Order:', order.orderNumber);
    console.log('✅ Order.customerId:', order.customerId);
    console.log('✅ Order.companyId:', order.companyId);
    console.log('✅ Order.customer:', order.customer ? `${order.customer.name || order.customer.email}` : 'UNDEFINED!');

    // Step 3: Try to access order.customer properties
    console.log('\n3️⃣ Accessing order.customer properties...');
    try {
      const customerEmail = order.customer?.email;
      console.log('✅ order.customer.email:', customerEmail);
      
      const customerName = order.customer?.name;
      console.log('✅ order.customer.name:', customerName);
      
      const parasutId = (order.customer as any)?.parasutContactId;
      console.log('✅ order.customer.parasutContactId:', parasutId);
    } catch (err: any) {
      console.error('❌ ERROR accessing order.customer:', err.message);
      console.error('Stack:', err.stack);
    }

    console.log('\n✅ TEST PASSED - No errors!');
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testInvoiceCreation();
