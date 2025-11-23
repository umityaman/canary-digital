// Check if Order 12 already has invoices
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://canary_user:CanaryRental2024Secure@35.205.55.157:5432/canary'
    }
  }
});

async function checkOrderInvoices() {
  try {
    console.log('🔍 Checking invoices for Order 12...\n');
    
    const invoices = await prisma.invoice.findMany({
      where: { orderId: 12 },
      select: { 
        id: true, 
        invoiceNumber: true, 
        customerId: true,
        grandTotal: true,
        status: true,
        createdAt: true
      }
    });
    
    if (invoices.length > 0) {
      console.log(`✅ Found ${invoices.length} invoice(s) for Order 12:`);
      invoices.forEach(inv => {
        console.log(`  - Invoice ${inv.id}: ${inv.invoiceNumber}, customerId: ${inv.customerId}, total: ${inv.grandTotal}, status: ${inv.status}`);
        console.log(`    Created: ${inv.createdAt}`);
      });
    } else {
      console.log('❌ No invoices found for Order 12');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderInvoices();
