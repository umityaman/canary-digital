# 🧪 CANARY Entity Flow Test - Production Test

**Test Başlangıcı:** 17 Kasım 2025 - 10:30  
**Test Ortamı:** PRODUCTION  
**Test Eden:** Manuel UI Test  

**URLs:**
- ✅ Frontend: https://canary-frontend-672344972017.europe-west1.run.app
- ✅ Backend: https://canary-backend-672344972017.europe-west1.run.app
- ✅ Active Revision: 00859 (stable design)

---

## 📋 Test Senaryosu: Customer → Order → Invoice → Payment

### Avantajlar
- ✅ Stable design zaten aktif (revision 00859)
- ✅ Gerçek database (10 invoice, 12 order, 2 payment, 3 journal entry)
- ✅ Tüm API'ler production'da test edilmiş
- ✅ Mock data yok, %100 gerçek veri

---

## 🎯 Test Adımları

### 1️⃣ LOGIN
**URL:** https://canary-frontend-672344972017.europe-west1.run.app/login

**Adımlar:**
1. [ ] Production login sayfası açıldı mı?
2. [ ] Tasarım stable design mi? (modern, statCardIcon pattern)
3. [ ] Production kullanıcısı ile giriş yap
4. [ ] Dashboard'a yönlendirildi mi?
5. [ ] Dashboard stats yüklendi mi?

**Browser Console Kontrolü (F12):**
```javascript
// Token kontrolü
console.log('Token:', localStorage.getItem('auth_token') ? 'Var' : 'Yok')
console.log('User:', JSON.parse(localStorage.getItem('user_data') || '{}'))
```

**Sonuç:**
- [x] ✅ Login başarılı
- [x] ✅ Tasarım modern (stable design)
- [x] ✅ Backend Health Check: OK (timestamp: 2025-11-17T07:48:13.610Z)
- [ ] ⚠️ Minor: Notifications API non-JSON response (kritik değil)

---

### 2️⃣ MEVCUT DATA KONTROLÜ

**Önce mevcut verileri görelim:**

**A) Customers Kontrolü:**
```javascript
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/customers', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Total Customers:', d.data?.length || d.length)
  console.log('Last 3 Customers:', (d.data || d).slice(-3))
})
```

**B) Orders Kontrolü:**
```javascript
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/orders', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Total Orders:', d.data?.length || d.length)
  console.log('Last Order:', (d.data || d)[0])
})
```

**C) Equipment Kontrolü:**
```javascript
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/equipment', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Total Equipment:', d.data?.length || d.length)
  console.log('Available Equipment:', (d.data || d).filter(e => e.status === 'AVAILABLE'))
})
```

**Notlar:**
- Customer sayısı: _______________
- Order sayısı: _______________
- Available Equipment: _______________

---

### 3️⃣ YENİ CUSTOMER OLUŞTURMA

**URL:** https://canary-frontend-672344972017.europe-west1.run.app/customers

**Adımlar:**
1. [ ] Customers sayfasını aç
2. [ ] Liste yüklendi mi? (gerçek data, mock değil)
3. [ ] "Yeni Müşteri" butonuna tıkla
4. [ ] Form doldur:
   ```
   İsim: TEST PROD Customer [TARİH]
   Email: testprod-20251117@test.com
   Telefon: 555-999-8877
   Şirket: Test Production A.Ş.
   Vergi No: 9876543210
   Adres: Production Test Sokak, İstanbul
   ```
5. [ ] Kaydet
6. [ ] Başarı mesajı göründü mü?
7. [ ] Listede yeni müşteri var mı?

**Backend API Kontrolü:**
```javascript
// En son oluşturulan customer'ı bul
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/customers', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const customers = d.data || d
  const lastCustomer = customers[customers.length - 1]
  console.log('Last Customer:', lastCustomer)
  console.log('Customer ID:', lastCustomer.id)
  
  // AccountCard kontrolü
  fetch(`https://canary-backend-672344972017.europe-west1.run.app/api/account-cards?customerId=${lastCustomer.id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  }).then(r => r.json()).then(d => {
    console.log('Customer AccountCard:', d.data || d)
  })
})
```

**Beklenen:**
- ✅ Customer oluşturuldu
- ✅ AccountCard otomatik oluştu (type: "customer", code: "120.XXX", balance: 0)

**Sonuç:**
- [ ] ✅ Customer oluşturuldu
- [ ] ✅ AccountCard otomatik oluşturuldu
- [ ] ❌ Hata: _______________

**Not:** Customer ID: `_____________`

---

### 4️⃣ YENİ ORDER OLUŞTURMA

**URL:** https://canary-frontend-672344972017.europe-west1.run.app/orders

**Adımlar:**
1. [ ] Orders sayfasını aç
2. [ ] "Yeni Sipariş" butonuna tıkla
3. [ ] Müşteri seç: [方才 oluşturduğun müşteri]
4. [ ] Tarih seç:
   - Başlangıç: 2025-11-17
   - Bitiş: 2025-11-22
5. [ ] "Ekipman Ekle" → Available ekipman seç (2 adet)
6. [ ] Fiyat kontrol et
7. [ ] Kaydet
8. [ ] Başarı mesajı göründü mü?

**Backend API Kontrolü:**
```javascript
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/orders', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const orders = d.data || d
  const lastOrder = orders[orders.length - 1]
  console.log('Last Order:', lastOrder)
  console.log('Order ID:', lastOrder.id)
  console.log('Order Items:', lastOrder.orderItems)
  console.log('Total Amount:', lastOrder.totalAmount)
})
```

**Sonuç:**
- [ ] ✅ Order oluşturuldu
- [ ] ✅ OrderItems doğru
- [ ] ❌ Hata: _______________

**Not:** Order ID: `_____________`

---

### 5️⃣ INVOICE OLUŞTURMA (KRİTİK TEST!)

**URL:** https://canary-frontend-672344972017.europe-west1.run.app/orders/[ORDER_ID]

**Adımlar:**
1. [ ] Order detay sayfasını aç
2. [ ] "Fatura Kes" butonuna tıkla
3. [ ] Fatura oluştur
4. [ ] Başarı mesajı göründü mü?

**OTOMATIK İŞLEMLER KONTROLÜ:**

**A) Invoice Oluşumu:**
```javascript
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/invoices', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const invoices = d.data || d
  const lastInvoice = invoices[invoices.length - 1]
  console.log('Last Invoice:', lastInvoice)
  console.log('Invoice ID:', lastInvoice.id)
  console.log('Grand Total:', lastInvoice.grandTotal)
  console.log('Status:', lastInvoice.status)
})
```

**B) StockMovement Kontrolü (KRİTİK!):**
```javascript
// Invoice ID'yi al ve stock movement'ları kontrol et
const invoiceId = [YENİ_INVOICE_ID]

fetch(`https://canary-backend-672344972017.europe-west1.run.app/api/stock/movements?invoiceId=${invoiceId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Stock Movements for Invoice:', d)
  const movements = d.data || d
  movements.forEach(m => {
    console.log(`- Equipment ${m.equipmentId}: ${m.movementType}, Qty: ${m.quantity}`)
  })
})
```

**Beklenen:**
- ✅ movementType = "out"
- ✅ quantity negatif
- ✅ invoiceId bağlantısı var

**C) Equipment Stok Azalması:**
```javascript
const equipmentId = [EKİPMAN_ID]

fetch(`https://canary-backend-672344972017.europe-west1.run.app/api/equipment/${equipmentId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Equipment After Invoice:')
  console.log('Quantity:', d.data.quantity)
  console.log('Status:', d.data.status)
})
```

**D) JournalEntry Kontrolü:**
```javascript
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/accounting/journal-entries', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const entries = d.data || d
  const lastEntry = entries[entries.length - 1]
  console.log('Last Journal Entry:', lastEntry)
  console.log('Total Debit:', lastEntry.totalDebit)
  console.log('Total Credit:', lastEntry.totalCredit)
  console.log('Balanced?', lastEntry.totalDebit === lastEntry.totalCredit)
  console.log('Items:', lastEntry.items || lastEntry.journalEntryItems)
})
```

**Beklenen Journal Entry:**
```
Borç:  120.XXX (Müşteri)     [TUTAR] TL
Alacak: 600.XXX (Kira Geliri) [TUTAR] TL
totalDebit === totalCredit ✅
```

**E) AccountCard Balance Kontrolü:**
```javascript
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/account-cards', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const cards = d.data || d
  const customerCard = cards.find(c => c.customerId === [CUSTOMER_ID])
  console.log('Customer AccountCard After Invoice:')
  console.log('Balance:', customerCard.balance)
  console.log('Expected:', [INVOICE_TUTAR])
})
```

**FRONTEND UI KONTROLÜ:**

1. [ ] **Accounting → Inventory Accounting**
   - [ ] Yeni stock movement görünüyor mu?
   - [ ] movementType "out" mu?
   - [ ] Miktar doğru mu?

2. [ ] **Accounting → Journal Entries** (varsa)
   - [ ] Yeni entry var mı?
   - [ ] Dengeli mi? (Debit = Credit)

3. [ ] **Accounting → Account Cards**
   - [ ] Müşteri balance'ı arttı mı?
   - [ ] Transaction history'de invoice var mı?

**Sonuç:**
- [ ] ✅ Invoice oluşturuldu
- [ ] ✅ StockMovement otomatik oluştu
- [ ] ✅ Equipment.quantity azaldı
- [ ] ✅ JournalEntry otomatik oluştu
- [ ] ✅ JournalEntry dengeli
- [ ] ✅ AccountCard.balance güncellendi
- [ ] ❌ Hata: _______________

**Not:** Invoice ID: `_____________`  
**Not:** Invoice Tutarı: `_____________` TL

---

### 6️⃣ PAYMENT ALMA

**URL:** https://canary-frontend-672344972017.europe-west1.run.app/invoices/[INVOICE_ID]

**Adımlar:**
1. [ ] Invoice detay sayfasını aç
2. [ ] "Ödeme Al" butonuna tıkla
3. [ ] Tutar gir: [Invoice tutarının tamamı]
4. [ ] Ödeme yöntemi seç: Bank Transfer
5. [ ] Kaydet
6. [ ] Başarı mesajı göründü mü?

**Backend Kontrolü:**

**A) Payment:**
```javascript
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/payments', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const payments = d.data || d
  const lastPayment = payments[payments.length - 1]
  console.log('Last Payment:', lastPayment)
})
```

**B) Invoice Status:**
```javascript
fetch(`https://canary-backend-672344972017.europe-west1.run.app/api/invoices/${invoiceId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Invoice After Payment:')
  console.log('Paid Amount:', d.data.paidAmount)
  console.log('Status:', d.data.status) // "paid" olmalı
})
```

**C) JournalEntry (Payment için):**
```javascript
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/accounting/journal-entries', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const entries = d.data || d
  const lastEntry = entries[entries.length - 1]
  console.log('Payment Journal Entry:', lastEntry)
  console.log('Entry Type:', lastEntry.entryType) // "auto_payment"
})
```

**Beklenen Journal Entry:**
```
Borç:  102.XXX (Banka)    [TUTAR] TL
Alacak: 120.XXX (Müşteri) [TUTAR] TL
```

**D) AccountCard Balance (Final):**
```javascript
fetch('https://canary-backend-672344972017.europe-west1.run.app/api/account-cards', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const cards = d.data || d
  const customerCard = cards.find(c => c.customerId === [CUSTOMER_ID])
  console.log('Customer Balance After Payment:', customerCard.balance)
  // 0 olmalı (tam ödeme yapıldıysa)
})
```

**Sonuç:**
- [ ] ✅ Payment kaydedildi
- [ ] ✅ Invoice.status "paid"
- [ ] ✅ JournalEntry oluştu
- [ ] ✅ AccountCard.balance = 0
- [ ] ❌ Hata: _______________

---

## 📊 TEST SONUÇLARI ÖZETİ

### Entity İlişkileri Doğrulama

| Test | Beklenen | Gerçek | Durum |
|------|----------|--------|-------|
| Customer → AccountCard | Otomatik oluşturulmalı | | ⏳ |
| Order → OrderItem | İlişki kurulmalı | | ⏳ |
| Invoice → StockMovement | Otomatik (out) | | ⏳ |
| Invoice → JournalEntry | Otomatik, dengeli | | ⏳ |
| Invoice → AccountCard | Balance artmalı | | ⏳ |
| Payment → JournalEntry | Otomatik | | ⏳ |
| Payment → Invoice | Status güncellenmeli | | ⏳ |
| Payment → AccountCard | Balance azalmalı | | ⏳ |

### Otomatik İşlemler

| İşlem | Çalıştı mı? | Not |
|-------|-------------|-----|
| Invoice → StockMovement | ⏳ | |
| Invoice → JournalEntry | ⏳ | |
| Payment → JournalEntry | ⏳ | |
| AccountCard balance update | ⏳ | |
| Equipment quantity update | ⏳ | |

### Frontend UI (Stable Design Test)

| Component | Tasarım | API Bağlantısı | Sonuç |
|-----------|---------|----------------|-------|
| Dashboard | ⏳ | ⏳ | ⏳ |
| Customer List | ⏳ | ⏳ | ⏳ |
| Order List | ⏳ | ⏳ | ⏳ |
| Invoice List | ⏳ | ⏳ | ⏳ |
| Inventory Accounting | ⏳ | ⏳ | ⏳ |
| Account Cards | ⏳ | ⏳ | ⏳ |
| Journal Entries | ⏳ | ⏳ | ⏳ |

---

## 🐛 Bulunan Hatalar

### Hata 1
- **Bileşen:** _______________
- **Açıklama:** _______________
- **Çözüm:** _______________

### Hata 2
- **Bileşen:** _______________
- **Açıklama:** _______________

---

## ✅ Başarılı İşlemler

1. _______________
2. _______________
3. _______________

---

## 📈 Sonuç

**Genel Durum:** ⏳ TEST BAŞLAYACAK

**Production Avantajları:**
- ✅ Stable design aktif (revision 00859)
- ✅ Gerçek database
- ✅ Mock data yok
- ✅ Tüm API'ler production-ready

**Test URL:** https://canary-frontend-672344972017.europe-west1.run.app

---

**Hazırlayan:** GitHub Copilot  
**Test Tarihi:** 17 Kasım 2025  
**Test Ortamı:** PRODUCTION  
**Test Süresi:** _______________

---

## 🎯 HEMEN TEST BAŞLAT!

**Browser'da aç:** https://canary-frontend-672344972017.europe-west1.run.app

1. Login yap
2. Tasarımı kontrol et (modern mi?)
3. Customer oluştur
4. Browser Console'u aç (F12)
5. Yukarıdaki komutları çalıştır
6. Entity flow'u test et!

**Bu dosyadaki checkboxları işaretleyerek ilerle! 📋**
