const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const invoices = await prisma.invoice.findMany({
    where: { id: { in: [30, 31, 32] } },
    select: { 
      id: true, 
      invoiceNumber: true, 
      createdAt: true,
      companyId: true 
    },
    orderBy: { id: 'asc' }
  });
  
  console.log('\n📋 Invoice Numbers Check:\n');
  invoices.forEach(inv => {
    console.log(`ID ${inv.id}: ${inv.invoiceNumber} (Company ${inv.companyId}) - ${inv.createdAt}`);
  });
  
  // Also check all invoices starting with INV-202511
  const allNovInvoices = await prisma.invoice.findMany({
    where: { 
      invoiceNumber: { startsWith: 'INV-202511' }
    },
    select: { 
      id: true, 
      invoiceNumber: true, 
      companyId: true 
    },
    orderBy: { invoiceNumber: 'asc' }
  });
  
  console.log('\n📅 All November 2025 Invoices:\n');
  allNovInvoices.forEach(inv => {
    console.log(`${inv.invoiceNumber} (ID ${inv.id}, Company ${inv.companyId})`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);
