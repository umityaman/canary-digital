const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const item = await prisma.invoiceItem.create({
    data: {
      invoiceId: 28,
      description: 'Sony A7S III Kamera Kiralama (3 gün)',
      quantity: 1,
      unitPrice: 500,
      vatRate: 18,
      total: 590
    }
  });
  console.log('✅ Item created: ID', item.id, '- Invoice #28');
  
  const item2 = await prisma.invoiceItem.create({
    data: {
      invoiceId: 28,
      description: 'Rode Wireless GO II Mikrofon (2 adet)',
      quantity: 2,
      unitPrice: 50,
      vatRate: 18,
      total: 118
    }
  });
  console.log('✅ Item created: ID', item2.id, '- Invoice #28');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
