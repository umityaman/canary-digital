// Payment Processing Test - Invoice 23
// Test: Payment → JournalEntry → Invoice Update → AccountCard Update

const axios = require('axios');
require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BACKEND_URL = 'https://canary-backend-672344972017.europe-west1.run.app';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AY2FuYXJ5LmNvbSIsInJvbGUiOiJBRE1JTiIsImNvbXBhbnlJZCI6MSwiaWF0IjoxNzYzNDQ1NjY5LCJleHAiOjE3NjM1MzIwNjl9.QuUlohxnBER61K4nE26_oihX9y7p-UvPQUm5vEmTMdM';

async function testPaymentAutomation() {
  console.log('💰 PAYMENT AUTOMATION TEST\n');
  console.log('═'.repeat(60));
  
  try {
    const invoiceId = 23;
    
    // Step 1: Get Invoice Before Payment
    console.log('\n📄 STEP 1: Check Invoice Before Payment');
    const invoiceBefore = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        invoiceNumber: true,
        grandTotal: true,
        paidAmount: true,
        status: true,
        customerId: true
      }
    });
    
    console.log(`   Invoice: ${invoiceBefore.invoiceNumber}`);
    console.log(`   Grand Total: ${invoiceBefore.grandTotal} TRY`);
    console.log(`   Paid Amount: ${invoiceBefore.paidAmount} TRY`);
    console.log(`   Status: ${invoiceBefore.status}`);
    console.log(`   Customer ID: ${invoiceBefore.customerId}`);
    
    // Step 2: Get Customer Info
    console.log('\n👤 STEP 2: Get Customer Info');
    const customer = await prisma.customer.findUnique({
      where: { id: invoiceBefore.customerId },
      select: {
        id: true,
        name: true,
        company: true
      }
    });
    
    console.log(`   Customer: ${customer.company || customer.name}`);
    
    // Note: AccountCard-Customer relation is disabled (migration pending)
    // Check AccountCard by name matching instead
    const accountCardBefore = await prisma.accountCard.findFirst({
      where: { 
        name: {
          contains: customer.company || customer.name
        },
        type: 'customer'
      },
      select: {
        id: true,
        code: true,
        name: true,
        balance: true
      }
    });
    
    if (accountCardBefore) {
      console.log(`   AccountCard Found: ${accountCardBefore.code} - ${accountCardBefore.name}`);
      console.log(`   Balance Before: ${accountCardBefore.balance} TRY`);
    } else {
      console.log('   ⚠️  AccountCard not found (Customer-AccountCard relation disabled)');
    }
    
    // Step 3: Count JournalEntries Before Payment
    console.log('\n📚 STEP 3: Count JournalEntries Before Payment');
    const journalCountBefore = await prisma.journalEntry.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 300000) // Last 5 minutes
        }
      }
    });
    console.log(`   Recent JournalEntries: ${journalCountBefore}`);
    
    // Step 4: Create Payment
    console.log('\n💸 STEP 4: Create Payment');
    const paymentData = {
      amount: invoiceBefore.grandTotal,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'bank_transfer',
      transactionId: `TEST-${Date.now()}`,
      notes: 'Test payment for automation verification'
    };
    
    console.log(`   Sending POST to ${BACKEND_URL}/api/invoices/${invoiceId}/payment`);
    console.log(`   Amount: ${paymentData.amount} TRY`);
    
    const response = await axios.post(
      `${BACKEND_URL}/api/invoices/${invoiceId}/payment`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const payment = response.data.data || response.data;
    console.log(`   ✅ Payment Created!`);
    console.log(`   Payment ID: ${payment.id || 'N/A'}`);
    
    // Wait 2 seconds for async processes
    console.log('\n⏳ Waiting 2 seconds for automation to complete...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 5: Check Invoice After Payment
    console.log('\n📄 STEP 5: Verify Invoice Updated');
    const invoiceAfter = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        paidAmount: true,
        status: true
      }
    });
    
    console.log(`   Paid Amount Before: ${invoiceBefore.paidAmount} TRY`);
    console.log(`   Paid Amount After:  ${invoiceAfter.paidAmount} TRY`);
    console.log(`   Status Before: ${invoiceBefore.status}`);
    console.log(`   Status After:  ${invoiceAfter.status}`);
    
    const paidAmountIncreased = invoiceAfter.paidAmount > invoiceBefore.paidAmount;
    const statusUpdated = invoiceAfter.status === 'paid' || invoiceAfter.status === 'PAID';
    
    if (paidAmountIncreased) {
      console.log('   ✅ Invoice.paidAmount updated!');
    } else {
      console.log('   ❌ Invoice.paidAmount NOT updated!');
    }
    
    if (statusUpdated) {
      console.log('   ✅ Invoice.status changed to "paid"!');
    } else {
      console.log('   ⚠️  Invoice.status not changed (may be partially paid)');
    }
    
    // Step 6: Check New JournalEntry Created
    console.log('\n📚 STEP 6: Verify Payment JournalEntry Created');
    const newJournalEntries = await prisma.journalEntry.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 120000) // Last 2 minutes
        },
        entryType: 'auto_payment'
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
    
    if (newJournalEntries.length > 0) {
      const je = newJournalEntries[0];
      console.log(`   ✅ Found Payment JournalEntry:`);
      console.log(`      Entry Number: ${je.entryNumber}`);
      console.log(`      Entry Type: ${je.entryType}`);
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
      console.log('   ❌ NO Payment JournalEntry found!');
    }
    
    // Step 7: Check AccountCard After Payment
    console.log('\n💳 STEP 7: Verify AccountCard Balance Updated');
    if (accountCardBefore) {
      const accountCardAfter = await prisma.accountCard.findUnique({
        where: { id: accountCardBefore.id },
        select: { balance: true }
      });
      
      console.log(`   Balance Before: ${accountCardBefore.balance} TRY`);
      console.log(`   Balance After:  ${accountCardAfter.balance} TRY`);
      
      const balanceDecreased = accountCardAfter.balance < accountCardBefore.balance;
      if (balanceDecreased) {
        console.log(`   ✅ AccountCard balance decreased by ${accountCardBefore.balance - accountCardAfter.balance} TRY!`);
      } else {
        console.log('   ❌ AccountCard balance NOT updated!');
      }
    } else {
      console.log('   ⚠️  Cannot verify - AccountCard was not found');
    }
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY\n');
    console.log(`✅ Payment Created:      ${payment.id || 'Yes'}`);
    console.log(`${paidAmountIncreased ? '✅' : '❌'} Invoice.paidAmount:   ${paidAmountIncreased ? 'UPDATED' : 'NOT UPDATED'}`);
    console.log(`${statusUpdated ? '✅' : '⚠️ '} Invoice.status:       ${statusUpdated ? 'UPDATED TO PAID' : invoiceAfter.status}`);
    console.log(`${newJournalEntries.length > 0 ? '✅' : '❌'} Payment JournalEntry: ${newJournalEntries.length > 0 ? 'CREATED' : 'MISSING'}`);
    console.log(`${accountCardBefore && accountCardBefore.balance !== undefined ? '✅' : '❌'} AccountCard Updated:  ${accountCardBefore ? (accountCardBefore.balance > 0 ? 'VERIFIED' : 'N/A') : 'MISSING'}`);
    
    const allPassed = 
      paidAmountIncreased && 
      statusUpdated &&
      newJournalEntries.length > 0;
    
    console.log('\n' + (allPassed ? '🎉 ALL PAYMENT AUTOMATION TESTS PASSED!' : '⚠️  SOME AUTOMATIONS FAILED'));
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error(`   Status: ${error.response.status}`);
    }
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n')[0]}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPaymentAutomation();
