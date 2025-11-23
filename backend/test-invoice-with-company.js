const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get current date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}${month}`;
  
  // Find last invoice for company 1
  const lastInvoice = await prisma.invoice.findFirst({
    where: { 
      companyId: 1,
      invoiceNumber: { startsWith: prefix }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('Last invoice:', lastInvoice?.invoiceNumber || 'None');
  
  const nextNumber = lastInvoice 
    ? parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0') + 1
    : 1;
  const invoiceNumber = `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  
  console.log('Next invoice number:', invoiceNumber);
  
  // Create test invoice directly
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: invoiceNumber,
      invoiceDate: now,
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
      totalAmount: 100,
      vatAmount: 18,
      grandTotal: 118,
      paidAmount: 0,
      status: 'draft',
      type: 'rental',
      customerId: 1,
      companyId: 1, // CRITICAL: Set companyId
    }
  });
  
  console.log('\n✅ Invoice created:');
  console.log(`  ID: ${invoice.id}`);
  console.log(`  Number: ${invoice.invoiceNumber}`);
  console.log(`  CompanyId: ${invoice.companyId}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
