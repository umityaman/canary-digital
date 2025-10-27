import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countInvoices() {
  try {
    const count = await prisma.invoice.count();
    console.log('📄 Toplam Fatura:', count);
    
    if (count > 0) {
      const invoices = await prisma.invoice.findMany({
        take: 5,
        include: {
          customer: true,
          order: { include: { customer: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('\n📋 Son 5 Fatura:');
      invoices.forEach(inv => {
        console.log(`  • ${inv.invoiceNumber} - ${inv.order.customer.name} - ${inv.grandTotal.toLocaleString('tr-TR')} ₺ - ${inv.status}`);
      });
    }
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

countInvoices();
