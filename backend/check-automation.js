const { PrismaClient } = require('@prisma/client');

// Use production DATABASE_URL
require('dotenv').config();
const prisma = new PrismaClient();

async function checkAutomation() {
  try {
    // 1. Check StockMovements
    console.log('📦 Checking StockMovements for Invoice 20...\n');
    const stockMovements = await prisma.stockMovement.findMany({
      where: { invoiceId: 20 },
      include: { equipment: true }
    });
    
    if (stockMovements.length > 0) {
      console.log(`✅ Found ${stockMovements.length} StockMovement(s):`);
      stockMovements.forEach(sm => {
        console.log(`  - ID: ${sm.id}, Equipment: ${sm.equipment.name}, Quantity: ${sm.quantity}`);
        console.log(`    Type: ${sm.movementType}, Reason: ${sm.movementReason}`);
        console.log(`    Stock Before: ${sm.stockBefore}, After: ${sm.stockAfter}`);
      });
    } else {
      console.log('❌ No StockMovements found');
    }
    
    // 2. Check Equipment quantity
    console.log('\n🔧 Checking Equipment 1 quantity...\n');
    const equipment = await prisma.equipment.findUnique({
      where: { id: 1 },
      select: { id: true, name: true, quantity: true }
    });
    
    if (equipment) {
      console.log(`✅ Equipment 1: ${equipment.name}`);
      console.log(`   Current Quantity: ${equipment.quantity}`);
    } else {
      console.log('❌ Equipment 1 not found');
    }
    
    // 3. Check JournalEntries
    console.log('\n📚 Checking recent JournalEntries...\n');
    const journalEntries = await prisma.journalEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        journalEntryItems: {
          include: {
            account: { select: { code: true, name: true } }
          }
        }
      }
    });
    
    if (journalEntries.length > 0) {
      console.log(`✅ Found ${journalEntries.length} recent JournalEntry(ies):`);
      journalEntries.forEach(je => {
        console.log(`\n  - ID: ${je.id}, Number: ${je.entryNumber}`);
        console.log(`    Date: ${je.entryDate.toISOString().split('T')[0]}`);
        console.log(`    Debit: ${je.totalDebit}, Credit: ${je.totalCredit}`);
        console.log(`    Balanced: ${je.totalDebit === je.totalCredit ? '✅ YES' : '❌ NO'}`);
        console.log(`    Items (${je.journalEntryItems.length}):`);
        je.journalEntryItems.forEach(item => {
          console.log(`      - ${item.account.code} ${item.account.name}: ${item.debit > 0 ? `Debit ${item.debit}` : `Credit ${item.credit}`}`);
        });
      });
    } else {
      console.log('❌ No JournalEntries found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAutomation();
