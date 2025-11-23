require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEquipment() {
  try {
    const equipment = await prisma.equipment.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        quantity: true,
        dailyPrice: true,
        status: true
      },
      orderBy: { id: 'asc' }
    });
    
    console.log('📦 Available Equipment:\n');
    equipment.forEach(e => {
      console.log(`ID: ${e.id} | ${e.name}`);
      console.log(`   Quantity: ${e.quantity} | Price: ${e.dailyPrice} TRY/day | Status: ${e.status}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEquipment();
