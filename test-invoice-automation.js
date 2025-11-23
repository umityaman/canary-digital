// Test Invoice Creation with Automation Verification
// Equipment: Canon EOS R6 (ID: 2)
// Order: 12, Customer: 20

const axios = require('axios');
require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BACKEND_URL = 'https://canary-backend-672344972017.europe-west1.run.app';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AY2FuYXJ5LmNvbSIsInJvbGUiOiJBRE1JTiIsImNvbXBhbnlJZCI6MSwiaWF0IjoxNzYzNDQ1NjY5LCJleHAiOjE3NjM1MzIwNjl9.QuUlohxnBER61K4nE26_oihX9y7p-UvPQUm5vEmTMdM';

async function testInvoiceAutomation() {
  console.log('🧪 INVOICE AUTOMATION TEST\n');
  console.log('═'.repeat(60));
  
  try {
    // Step 1: Get Equipment 4 current quantity
    console.log('\n📦 STEP 1: Check Equipment Before Invoice');
    const equipmentBefore = await prisma.equipment.findUnique({
      where: { id: 4 },
      select: { id: true, name: true, quantity: true }
    });
    console.log(`   Equipment: ${equipmentBefore.name}`);
    console.log(`   Quantity Before: ${equipmentBefore.quantity}`);
    
    // Step 2: Create Invoice
    console.log('\n📄 STEP 2: Create Invoice');
    const invoiceData = {
      orderId: 12,
      customerId: 20,
      items: [
        {
          equipmentId: 4,
          description: 'DJI Ronin-S - 2 day rental',
          quantity: 1,
          unitPrice: 200,
          days: 2,
          discountPercentage: 0
        }
      ],
      startDate: '2025-11-18T00:00:00Z',
      endDate: '2025-11-20T00:00:00Z',
      notes: 'Full automation test - Invoice + StockMovement + JournalEntry'
    };
    
    console.log(`   Sending POST to ${BACKEND_URL}/api/invoices/rental`);
    const response = await axios.post(
      `${BACKEND_URL}/api/invoices/rental`,
      invoiceData,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const invoice = response.data.data;
    console.log(`   ✅ Invoice Created!`);
    console.log(`   Invoice ID: ${invoice.id}`);
    console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
    console.log(`   Total Amount: ${invoice.totalAmount} TRY`);
    console.log(`   VAT Amount: ${invoice.vatAmount} TRY`);
    console.log(`   Grand Total: ${invoice.grandTotal} TRY`);
    
    // Wait 2 seconds for async processes
    console.log('\n⏳ Waiting 2 seconds for automation to complete...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Check StockMovement
    console.log('\n📦 STEP 3: Verify StockMovement Created');
    const stockMovements = await prisma.stockMovement.findMany({
      where: { invoiceId: invoice.id },
      include: { equipment: { select: { name: true } } }
    });
    
    if (stockMovements.length > 0) {
      console.log(`   ✅ Found ${stockMovements.length} StockMovement(s):`);
      stockMovements.forEach(sm => {
        console.log(`      - Equipment: ${sm.equipment.name}`);
        console.log(`        Type: ${sm.movementType}, Reason: ${sm.movementReason}`);
        console.log(`        Quantity: ${sm.quantity}`);
        console.log(`        Stock: ${sm.stockBefore} → ${sm.stockAfter}`);
      });
    } else {
      console.log('   ❌ NO StockMovements found!');
    }
    
    // Step 4: Check Equipment Quantity
    console.log('\n🔧 STEP 4: Verify Equipment Quantity Updated');
    const equipmentAfter = await prisma.equipment.findUnique({
      where: { id: 4 },
      select: { quantity: true }
    });
    console.log(`   Quantity Before: ${equipmentBefore.quantity}`);
    console.log(`   Quantity After:  ${equipmentAfter.quantity}`);
    
    if (equipmentAfter.quantity === equipmentBefore.quantity - 1) {
      console.log('   ✅ Equipment quantity correctly decreased!');
    } else {
      console.log('   ❌ Equipment quantity NOT updated!');
    }
    
    // Step 5: Check JournalEntry
    console.log('\n📚 STEP 5: Verify JournalEntry Created');
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60000) // Last 1 minute
        }
      },
      include: {
        journalEntryItems: {
          include: {
            account: { select: { code: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    
    if (journalEntries.length > 0) {
      const je = journalEntries[0];
      console.log(`   ✅ Found JournalEntry:`);
      console.log(`      Entry Number: ${je.entryNumber}`);
      console.log(`      Date: ${je.entryDate.toISOString().split('T')[0]}`);
      console.log(`      Total Debit: ${je.totalDebit} TRY`);
      console.log(`      Total Credit: ${je.totalCredit} TRY`);
      console.log(`      Balanced: ${je.totalDebit === je.totalCredit ? '✅ YES' : '❌ NO'}`);
      
      if (je.journalEntryItems.length > 0) {
        console.log(`      Items (${je.journalEntryItems.length}):`);
        je.journalEntryItems.forEach(item => {
          const type = item.debit > 0 ? 'Debit' : 'Credit';
          const amount = item.debit > 0 ? item.debit : item.credit;
          console.log(`        - ${item.account.code} ${item.account.name}: ${type} ${amount} TRY`);
        });
      }
    } else {
      console.log('   ❌ NO recent JournalEntries found!');
    }
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY\n');
    console.log(`✅ Invoice Created:      ${invoice.id} (${invoice.invoiceNumber})`);
    console.log(`${stockMovements.length > 0 ? '✅' : '❌'} StockMovement:       ${stockMovements.length > 0 ? 'CREATED' : 'MISSING'}`);
    console.log(`${equipmentAfter.quantity < equipmentBefore.quantity ? '✅' : '❌'} Equipment Updated:   ${equipmentAfter.quantity < equipmentBefore.quantity ? 'YES' : 'NO'}`);
    console.log(`${journalEntries.length > 0 ? '✅' : '❌'} JournalEntry:        ${journalEntries.length > 0 ? 'CREATED' : 'MISSING'}`);
    
    const allPassed = 
      stockMovements.length > 0 && 
      equipmentAfter.quantity < equipmentBefore.quantity &&
      journalEntries.length > 0;
    
    console.log('\n' + (allPassed ? '🎉 ALL AUTOMATION TESTS PASSED!' : '⚠️  SOME AUTOMATIONS FAILED'));
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error(`   Status: ${error.response.status}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testInvoiceAutomation();
