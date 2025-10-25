import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Checking database data...\n');

  // Check invoices
  const invoiceCount = await prisma.invoice.count();
  console.log(`📄 Invoices: ${invoiceCount}`);
  
  if (invoiceCount > 0) {
    const invoices = await prisma.invoice.findMany({
      take: 3,
      include: { customer: { select: { name: true, email: true } } }
    });
    console.log('Sample invoices:');
    invoices.forEach(inv => {
      console.log(`  - ${inv.invoiceNumber}: ${inv.totalAmount}₺ (${inv.status}) - ${inv.customer.name}`);
    });
  }

  // Check offers
  const offerCount = await prisma.offer.count();
  console.log(`\n📋 Offers: ${offerCount}`);
  
  if (offerCount > 0) {
    const offers = await prisma.offer.findMany({
      take: 3,
      include: { customer: { select: { name: true, email: true } } }
    });
    console.log('Sample offers:');
    offers.forEach(offer => {
      console.log(`  - ${offer.offerNumber}: ${offer.grandTotal}₺ (${offer.status}) - ${offer.customer.name}`);
    });
  }

  // Check expenses
  const expenseCount = await prisma.expense.count();
  console.log(`\n💸 Expenses: ${expenseCount}`);
  
  if (expenseCount > 0) {
    const expenses = await prisma.expense.findMany({ take: 3 });
    console.log('Sample expenses:');
    expenses.forEach(exp => {
      console.log(`  - ${exp.category}: ${exp.amount}₺ (${exp.status})`);
    });
  }

  // Check payments
  const paymentCount = await prisma.payment.count();
  console.log(`\n💳 Payments: ${paymentCount}`);
  
  if (paymentCount > 0) {
    const payments = await prisma.payment.findMany({ 
      take: 3,
      include: { invoice: { select: { invoiceNumber: true } } }
    });
    console.log('Sample payments:');
    payments.forEach(pay => {
      console.log(`  - ${pay.invoice.invoiceNumber}: ${pay.amount}₺ (${pay.paymentMethod})`);
    });
  }

  // Check orders
  const orderCount = await prisma.order.count();
  console.log(`\n📦 Orders: ${orderCount}`);

  console.log('\n✅ Data check complete!');
}

checkData()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
