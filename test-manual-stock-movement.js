/**
 * Test Manual Stock Movement Creation
 * Creates a stock movement WITHOUT invoiceId to test "Bekleyenler" tab
 */

const API_URL = 'http://localhost:4000';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBjYW5hcnkuY29tIiwicm9sZSI6IkFETUlOIiwiY29tcGFueUlkIjoxLCJpYXQiOjE3MzE5NDI1MzV9.dOdaUHxyVU7xD-1UjW6Nwl2kSj3LhGo-mJsAe2Zh1Js';

async function createManualStockMovement() {
  try {
    console.log('🔧 Creating manual stock movement (without invoiceId)...\n');

    const response = await fetch(`${API_URL}/api/stock/movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        equipmentId: 1, // Sony A7IV
        movementType: 'adjustment', // Stok düzeltme
        movementReason: 'MANUAL_ADJUSTMENT',
        quantity: 1,
        notes: 'Manuel stok hareketi - Pending test için',
        // NO invoiceId - so it should be "pending"
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Manual stock movement created successfully!');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n📌 Movement ID:', data.data.id);
      console.log('📌 Has invoiceId?', data.data.invoiceId ? 'YES (recorded)' : 'NO (pending)');
      console.log('\n🎯 Now refresh "Stok Muhasebesi" page and check "Bekleyenler" tab!');
    } else {
      console.error('❌ Failed to create movement:', data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createManualStockMovement();
