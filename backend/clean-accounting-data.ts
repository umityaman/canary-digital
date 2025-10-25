import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanAccountingData() {
  console.log('🧹 Cleaning accounting data...\n');

  // Delete in correct order (respect foreign keys)
  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`✅ Deleted ${deletedPayments.count} payments`);

  const deletedInvoices = await prisma.invoice.deleteMany({});
  console.log(`✅ Deleted ${deletedInvoices.count} invoices`);

  const deletedOffers = await prisma.offer.deleteMany({});
  console.log(`✅ Deleted ${deletedOffers.count} offers`);

  const deletedExpenses = await prisma.expense.deleteMany({});
  console.log(`✅ Deleted ${deletedExpenses.count} expenses`);

  // Keep orders, users, equipment, etc. - just reset accounting data
  
  console.log('\n✅ Accounting data cleaned! Ready for fresh seed.');
}

cleanAccountingData()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
