const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function checkEquipment() {
  const equipment = await prisma.equipment.findMany({
    where: { quantity: { gt: 0 } },
    take: 5,
    select: { id: true, name: true, quantity: true, dailyPrice: true }
  });
  
  console.log('📦 Available Equipment:');
  equipment.forEach(e => {
    console.log(`  ${e.id}. ${e.name} - Qty: ${e.quantity}, Rate: ${e.dailyPrice} TRY/day`);
  });
  
  await prisma.$disconnect();
}

checkEquipment();
