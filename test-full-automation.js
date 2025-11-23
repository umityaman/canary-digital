// Complete Test: Invoice Creation → Payment → All Automations
// Equipment: Manfrotto Tripod (ID: 5)

const axios = require('axios');
require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BACKEND_URL = 'https://canary-backend-672344972017.europe-west1.run.app';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AY2FuYXJ5LmNvbSIsInJvbGUiOiJBRE1JTiIsImNvbXBhbnlJZCI6MSwiaWF0IjoxNzYzNDQ1NjY5LCJleHAiOjE3NjM1MzIwNjl9.QuUlohxnBER61K4nE26_oihX9y7p-UvPQUm5vEmTMdM';

async function fullAutomationTest() {
  console.log('🎯 COMPLETE AUTOMATION TEST: Invoice → Payment\n');
  console.log('═'.repeat(70));
  
  try {
    // PART 1: Create Invoice
    console.log('\n📄 PART 1: CREATE INVOICE');
    console.log('─'.repeat(70));
    
    const invoiceData = {
      orderId: 12,
      customerId: 20,
      items: [{
        equipmentId: 5,
        description: 'Manfrotto Tripod - 1 day rental',
        quantity: 1,
        unitPrice: 75,
        days: 1
      }],
      startDate: '2025-11-18T00:00:00Z',
      endDate: '2025-11-19T00:00:00Z',
      notes: 'Complete automation test'
    };
    
    const invoiceResp = await axios.post(
      `${BACKEND_URL}/api/invoices/rental`,
      invoiceData,
      { headers: { 'Authorization': `Bearer ${TOKEN}` } }
    );
    
    const invoice = invoiceResp.data.data;
    console.log(`✅ Invoice Created: ${invoice.invoiceNumber}`);
    console.log(`   ID: ${invoice.id}, Grand Total: ${invoice.grandTotal} TRY`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Verify StockMovement
    const stockMovement = await prisma.stockMovement.findFirst({
      where: { invoiceId: invoice.id }
    });
    console.log(`${stockMovement ? '✅' : '❌'} StockMovement: ${stockMovement ? 'Created' : 'Missing'}`);
    
    // Verify Invoice JournalEntry
    const invoiceJournal = await prisma.journalEntry.findFirst({
      where: { 
        entryType: 'auto_invoice',
        createdAt: { gte: new Date(Date.now() - 60000) }
      }
    });
    console.log(`${invoiceJournal ? '✅' : '❌'} Invoice JournalEntry: ${invoiceJournal ? invoiceJournal.entryNumber : 'Missing'}`);
    
    // PART 2: Create Payment
    console.log('\n💰 PART 2: CREATE PAYMENT');
    console.log('─'.repeat(70));
    
    const paymentData = {
      amount: invoice.grandTotal,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'bank_transfer',
      notes: 'Test payment'
    };
    
    const paymentResp = await axios.post(
      `${BACKEND_URL}/api/invoices/${invoice.id}/payment`,
      paymentData,
      { headers: { 'Authorization': `Bearer ${TOKEN}` } }
    );
    
    const payment = paymentResp.data.data;
    console.log(`✅ Payment Created: ${payment.id}`);
    console.log(`   Amount: ${paymentData.amount} TRY`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Verify Invoice Updated
    const invoiceAfter = await prisma.invoice.findUnique({
      where: { id: invoice.id }
    });
    console.log(`${invoiceAfter.status === 'paid' ? '✅' : '❌'} Invoice Status: ${invoiceAfter.status}`);
    console.log(`${invoiceAfter.paidAmount === invoice.grandTotal ? '✅' : '❌'} Invoice Paid: ${invoiceAfter.paidAmount} TRY`);
    
    // Verify Payment JournalEntry
    const paymentJournal = await prisma.journalEntry.findFirst({
      where: { 
        entryType: 'auto_payment',
        createdAt: { gte: new Date(Date.now() - 60000) }
      },
      include: {
        journalEntryItems: {
          include: {
            account: { select: { code: true, name: true } }
          }
        }
      }
    });
    
    if (paymentJournal) {
      console.log(`✅ Payment JournalEntry: ${paymentJournal.entryNumber}`);
      console.log(`   Debit: ${paymentJournal.totalDebit}, Credit: ${paymentJournal.totalCredit}`);
      console.log(`   Items:`);
      paymentJournal.journalEntryItems.forEach(item => {
        const type = item.debit > 0 ? 'Debit' : 'Credit';
        const amt = item.debit > 0 ? item.debit : item.credit;
        console.log(`     - ${item.account.code} ${item.account.name}: ${type} ${amt} TRY`);
      });
    } else {
      console.log(`❌ Payment JournalEntry: Missing`);
    }
    
    // SUMMARY
    console.log('\n' + '═'.repeat(70));
    console.log('📊 FINAL RESULTS\n');
    
    const results = [
      { name: 'Invoice Created', status: !!invoice.id },
      { name: 'StockMovement Created', status: !!stockMovement },
      { name: 'Invoice JournalEntry', status: !!invoiceJournal },
      { name: 'Payment Created', status: !!payment.id },
      { name: 'Invoice Status Updated', status: invoiceAfter.status === 'paid' },
      { name: 'Payment JournalEntry', status: !!paymentJournal }
    ];
    
    results.forEach(r => {
      console.log(`${r.status ? '✅' : '❌'} ${r.name}`);
    });
    
    const allPassed = results.every(r => r.status);
    console.log('\n' + (allPassed ? '🎉 ALL TESTS PASSED! FULL AUTOMATION WORKING!' : '⚠️  SOME TESTS FAILED'));
    console.log('═'.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fullAutomationTest();
