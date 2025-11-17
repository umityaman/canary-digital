# 🧪 CANARY Entity Flow Test - Canlı Test Kılavuzu

**Test Başlangıcı:** 17 Kasım 2025 - 09:57  
**Test Eden:** Manuel UI Test  
**Sunucular:**
- ✅ Backend: http://localhost:3000 (çalışıyor)
- ✅ Frontend: http://localhost:5173 (çalışıyor)

---

## 📋 Test Senaryosu: Customer → Order → Invoice → Payment

### Ön Hazırlık ✅
- [x] Backend çalışıyor (port 3000)
- [x] Frontend çalışıyor (port 5173)  
- [x] Browser açıldı (http://localhost:5173)
- [x] Mock data temizlendi (DeliveryNoteList, BankReconciliation)

---

## 🎯 Test Adımları

### 1️⃣ LOGIN (Authentication Test)
**URL:** http://localhost:5173/login

**Adımlar:**
1. [ ] Tarayıcıda login sayfası açıldı mı?
2. [ ] Email ve password alanları görünüyor mu?
3. [ ] Test kullanıcısı ile giriş yap:
   - Email: `admin@canary.com` veya mevcut kullanıcı
   - Password: Mevcut şifre
4. [ ] Login başarılı mı?
5. [ ] Dashboard'a yönlendirildi mi?
6. [ ] Token localStorage'a kaydedildi mi? (F12 > Application > Local Storage)

**Kontrol Noktaları:**
- `auth_token` localStorage'da var mı?
- `user_data` localStorage'da var mı?
- Dashboard stats yüklendi mi?

---

### 2️⃣ CUSTOMER OLUŞTURMA (Customer → AccountCard Flow)
**URL:** http://localhost:5173/customers

**Adımlar:**
1. [ ] Menüden "Customers" veya "Müşteriler" sayfasına git
2. [ ] "Yeni Müşteri" veya "+ Add Customer" butonuna tıkla
3. [ ] Form alanlarını doldur:
   ```
   İsim: Test Müşteri - [TARİH]
   Email: test-[TIMESTAMP]@test.com
   Telefon: 555-111-2233
   Şirket: Test Film A.Ş.
   Vergi No: 1234567890
   Vergi Dairesi: Beşiktaş
   Adres: Test Sokak No:1, İstanbul
   ```
4. [ ] "Kaydet" butonuna tıkla
5. [ ] Başarı mesajı göründü mü?
6. [ ] Yeni müşteri listede görünüyor mu?

**Backend Kontrolü (Postman/Browser Console):**
```javascript
// Console'da çalıştır:
fetch('http://localhost:3000/api/customers', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => console.log('Customers:', d))
```

**Beklenen:**
- ✅ Customer oluşturuldu (status: 200/201)
- ✅ AccountCard otomatik oluşturuldu mu? (Backend log kontrol)
- ✅ AccountCard.code = "120.XXX" formatında mı?
- ✅ AccountCard.type = "customer" mı?
- ✅ AccountCard.balance = 0 mı?

**AccountCard Kontrolü:**
```javascript
// Müşteri ID'sini aldıktan sonra:
const customerId = [YENİ_CUSTOMER_ID];
fetch(`http://localhost:3000/api/account-cards?customerId=${customerId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => console.log('AccountCard:', d))
```

**Sonuç:**
- [ ] ✅ Customer oluşturuldu
- [ ] ✅ AccountCard otomatik oluşturuldu
- [ ] ❌ Hata var: _______________

---

### 3️⃣ ORDER OLUŞTURMA (Order → OrderItem Flow)
**URL:** http://localhost:5173/orders

**Adımlar:**
1. [ ] Menüden "Orders" veya "Siparişler" sayfasına git
2. [ ] "Yeni Sipariş" veya "+ Create Order" butonuna tıkla
3. [ ] Form alanlarını doldur:
   ```
   Müşteri: [方才 oluşturduğun müşteri]
   Başlangıç Tarihi: [BUGÜN]
   Bitiş Tarihi: [BUGÜN + 5 gün]
   Durum: PENDING
   ```
4. [ ] "Ekipman Ekle" butonuna tıkla
5. [ ] Ekipman seç (örn: Sony A7 III, Canon EOS)
6. [ ] Miktar: 2 adet
7. [ ] Günlük fiyat kontrol et (otomatik doluyor mu?)
8. [ ] İkinci bir ekipman daha ekle (opsiyonel)
9. [ ] "Kaydet" butonuna tıkla
10. [ ] Başarı mesajı göründü mü?
11. [ ] Order listesinde yeni sipariş görünüyor mu?

**Backend Kontrolü:**
```javascript
fetch('http://localhost:3000/api/orders', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const lastOrder = d.data[d.data.length - 1];
  console.log('Last Order:', lastOrder);
  console.log('Order Items:', lastOrder.orderItems);
})
```

**Beklenen:**
- ✅ Order oluşturuldu
- ✅ OrderItem'lar oluşturuldu
- ✅ Customer ilişkisi doğru
- ✅ Equipment ilişkisi doğru
- ✅ totalAmount hesaplandı
- ✅ Order.status = "PENDING"

**Sonuç:**
- [ ] ✅ Order oluşturuldu
- [ ] ✅ OrderItem'lar doğru
- [ ] ❌ Hata var: _______________

**Not:** ORDER ID'yi not al: `_____________`

---

### 4️⃣ INVOICE OLUŞTURMA (KRİTİK: Invoice → StockMovement → JournalEntry)
**URL:** http://localhost:5173/orders/[ORDER_ID]

**Adımlar:**
1. [ ] Order detay sayfasını aç
2. [ ] "Fatura Kes" veya "Create Invoice" butonunu bul
3. [ ] Butona tıkla
4. [ ] Fatura formu açıldı mı?
5. [ ] Fatura bilgilerini kontrol et (otomatik doluyor mu?)
6. [ ] "Kaydet" veya "Fatura Oluştur" butonuna tıkla
7. [ ] Başarı mesajı göründü mü?
8. [ ] Invoice No oluşturuldu mu? (örn: INV-20250123)

**OTOMATIK İŞLEMLER - Backend Log Kontrolü:**

Terminal'de backend loglarını izle. Şunları aramalısın:

```
✅ "Invoice created" log
✅ "StockMovement created" log  
✅ "JournalEntry created" log
✅ "AccountCard balance updated" log
```

**Backend API Kontrolleri:**

**A) Invoice Kontrolü:**
```javascript
const invoiceId = [YENİ_INVOICE_ID];
fetch(`http://localhost:3000/api/invoices/${invoiceId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Invoice:', d);
  console.log('Invoice Items:', d.data.invoiceItems);
  console.log('Total Amount:', d.data.grandTotal);
  console.log('Status:', d.data.status);
})
```

**B) StockMovement Kontrolü (KRİTİK!):**
```javascript
fetch(`http://localhost:3000/api/stock/movements?invoiceId=${invoiceId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Stock Movements:', d);
  d.data.forEach(mov => {
    console.log(`Equipment ${mov.equipmentId}: ${mov.movementType}, Qty: ${mov.quantity}`);
  });
})
```

**Beklenen:**
- ✅ movementType = "out" (çıkış)
- ✅ quantity = negatif (örn: -2)
- ✅ invoiceId bağlantısı var
- ✅ equipmentId doğru

**C) Equipment Stok Kontrolü:**
```javascript
const equipmentId = [EKİPMAN_ID];
fetch(`http://localhost:3000/api/equipment/${equipmentId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Equipment Quantity AFTER Invoice:', d.data.quantity);
  // Önceki quantity - 2 = yeni quantity olmalı
})
```

**D) JournalEntry Kontrolü (KRİTİK!):**
```javascript
fetch('http://localhost:3000/api/accounting/journal-entries', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const lastEntry = d.data[d.data.length - 1];
  console.log('Last Journal Entry:', lastEntry);
  console.log('Entry Items:', lastEntry.items);
  console.log('Total Debit:', lastEntry.totalDebit);
  console.log('Total Credit:', lastEntry.totalCredit);
  console.log('Balanced?', lastEntry.totalDebit === lastEntry.totalCredit);
})
```

**Beklenen Journal Entry Yapısı:**
```
Borç (Debit):  120.XXX (Müşteri)     [TUTAR] TL
Alacak (Credit): 600.001 (Kira Geliri) [TUTAR] TL

totalDebit === totalCredit (Dengeli olmalı!)
```

**E) AccountCard Balance Kontrolü:**
```javascript
fetch('http://localhost:3000/api/account-cards', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const customerCard = d.data.find(card => card.customerId === [CUSTOMER_ID]);
  console.log('Customer AccountCard:', customerCard);
  console.log('Balance AFTER Invoice:', customerCard.balance);
  // Balance = invoice grandTotal olmalı
})
```

**Frontend UI Kontrolleri:**

1. [ ] **Accounting → Inventory Accounting** sayfasını aç
2. [ ] Yeni stok hareketi görünüyor mu?
3. [ ] Hareket tipi "out" (çıkış) mı?
4. [ ] Miktar doğru mu?
5. [ ] Equipment linki çalışıyor mu?

6. [ ] **Accounting → Journal Entries** sayfasını aç (eğer varsa)
7. [ ] Yeni journal entry görünüyor mu?
8. [ ] Borç/Alacak dengeli mi?
9. [ ] Hesap kodları doğru mu? (120.XXX, 600.XXX)

10. [ ] **Accounting → Account Cards** sayfasını aç
11. [ ] Müşterinin AccountCard'ını bul
12. [ ] Balance = Invoice tutarı mı?
13. [ ] Transaction history'de fatura görünüyor mu?

**Sonuç:**
- [ ] ✅ Invoice oluşturuldu
- [ ] ✅ StockMovement otomatik oluştu
- [ ] ✅ Equipment.quantity azaldı
- [ ] ✅ JournalEntry otomatik oluştu
- [ ] ✅ JournalEntry dengeli (Debit = Credit)
- [ ] ✅ AccountCard.balance güncellendi
- [ ] ✅ UI'da tüm değişiklikler görünüyor
- [ ] ❌ Hata var: _______________

**Not:** INVOICE ID'yi not al: `_____________`  
**Not:** Invoice Tutarı: `_____________` TL

---

### 5️⃣ PAYMENT ALMA (Payment → JournalEntry → AccountCard Balance Update)
**URL:** http://localhost:5173/invoices/[INVOICE_ID]

**Adımlar:**
1. [ ] Invoice detay sayfasını aç
2. [ ] "Ödeme Al" veya "Add Payment" butonunu bul
3. [ ] Butona tıkla
4. [ ] Payment formu açıldı mı?
5. [ ] Tutar: [Invoice tutarının tamamı veya bir kısmı]
6. [ ] Ödeme yöntemi: Bank Transfer / Credit Card / Cash
7. [ ] Ödeme tarihi: [BUGÜN]
8. [ ] "Kaydet" butonuna tıkla
9. [ ] Başarı mesajı göründü mü?

**Backend API Kontrolleri:**

**A) Payment Kontrolü:**
```javascript
const paymentId = [YENİ_PAYMENT_ID];
fetch(`http://localhost:3000/api/payments/${paymentId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Payment:', d);
  console.log('Amount:', d.data.amount);
  console.log('Method:', d.data.paymentMethod);
})
```

**B) Invoice Güncellenmesi:**
```javascript
fetch(`http://localhost:3000/api/invoices/${invoiceId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Invoice AFTER Payment:');
  console.log('Paid Amount:', d.data.paidAmount);
  console.log('Status:', d.data.status); // "paid" olmalı
  console.log('Remaining:', d.data.grandTotal - d.data.paidAmount);
})
```

**Beklenen:**
- ✅ paidAmount = payment amount
- ✅ status = "paid" (tam ödeme yapıldıysa)
- ✅ status = "partial" (kısmi ödeme yapıldıysa)

**C) JournalEntry Kontrolü (Payment için):**
```javascript
fetch('http://localhost:3000/api/accounting/journal-entries', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const lastEntry = d.data[d.data.length - 1];
  console.log('Payment Journal Entry:', lastEntry);
  console.log('Entry Type:', lastEntry.entryType); // "auto_payment"
  console.log('Items:', lastEntry.items);
})
```

**Beklenen Journal Entry Yapısı:**
```
Borç (Debit):  102.001 (Banka)    [TUTAR] TL
Alacak (Credit): 120.XXX (Müşteri) [TUTAR] TL
```

**D) AccountCard Balance Kontrolü (Final):**
```javascript
fetch('http://localhost:3000/api/account-cards', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  const customerCard = d.data.find(card => card.customerId === [CUSTOMER_ID]);
  console.log('Customer AccountCard AFTER Payment:');
  console.log('Balance:', customerCard.balance);
  // Balance = 0 olmalı (tam ödeme yapıldıysa)
  // Balance = Invoice - Payment olmalı (kısmi ödeme yapıldıysa)
})
```

**Frontend UI Kontrolleri:**

1. [ ] Invoice detay sayfasında status güncellenmiş mi? ("Paid" badge)
2. [ ] paidAmount gösteriliyor mu?
3. [ ] Payment history'de yeni ödeme görünüyor mu?

4. [ ] **Accounting → Journal Entries** sayfasını aç
5. [ ] Yeni payment journal entry var mı?
6. [ ] Entry type "auto_payment" mı?
7. [ ] Hesap kodları doğru mu? (102.XXX banka, 120.XXX müşteri)

8. [ ] **Accounting → Account Cards** sayfasını aç
9. [ ] Müşterinin balance'ı 0 mı? (tam ödeme yapıldıysa)
10. [ ] Transaction history'de payment kaydı var mı?

**Sonuç:**
- [ ] ✅ Payment kaydedildi
- [ ] ✅ Invoice.paidAmount güncellendi
- [ ] ✅ Invoice.status "paid" oldu
- [ ] ✅ JournalEntry otomatik oluştu (payment için)
- [ ] ✅ AccountCard.balance 0 oldu
- [ ] ✅ UI'da tüm değişiklikler görünüyor
- [ ] ❌ Hata var: _______________

---

### 6️⃣ ORDER TAMAMLAMA (Order → StockMovement Return)
**URL:** http://localhost:5173/orders/[ORDER_ID]

**Adımlar:**
1. [ ] Order detay sayfasını aç
2. [ ] "Siparişi Tamamla" veya "Complete Order" butonunu bul
3. [ ] Butona tıkla
4. [ ] Onay mesajı göründü mü?
5. [ ] Order status "COMPLETED" oldu mu?

**Backend API Kontrolleri:**

**A) Order Kontrolü:**
```javascript
fetch(`http://localhost:3000/api/orders/${orderId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Order Status:', d.data.status); // "COMPLETED"
})
```

**B) StockMovement Return Kontrolü:**
```javascript
fetch(`http://localhost:3000/api/stock/movements?orderId=${orderId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('All Stock Movements for Order:', d);
  const returnMovements = d.data.filter(m => m.movementType === 'in');
  console.log('Return Movements:', returnMovements);
})
```

**Beklenen:**
- ✅ movementType = "in" (giriş/iade)
- ✅ quantity = pozitif (örn: +2)
- ✅ movementReason = "return"

**C) Equipment Stok Kontrolü (Final):**
```javascript
fetch(`http://localhost:3000/api/equipment/${equipmentId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Equipment Quantity AFTER Return:', d.data.quantity);
  // Başlangıç quantity'ye geri dönmüş olmalı
})
```

**Sonuç:**
- [ ] ✅ Order.status "COMPLETED"
- [ ] ✅ StockMovement (return) oluştu
- [ ] ✅ Equipment.quantity geri arttı
- [ ] ❌ Hata var: _______________

---

## 📊 TEST SONUÇLARI ÖZETİ

### Entity İlişkileri Doğrulama

| Test | Beklenen Sonuç | Gerçek Sonuç | Durum |
|------|----------------|--------------|-------|
| Customer → AccountCard | Otomatik oluşturulmalı | | ⏳ |
| Order → OrderItem | İlişki kurulmalı | | ⏳ |
| Invoice → StockMovement | Otomatik oluşturulmalı (out) | | ⏳ |
| Invoice → JournalEntry | Otomatik, dengeli | | ⏳ |
| Invoice → AccountCard | Balance artmalı | | ⏳ |
| Payment → JournalEntry | Otomatik oluşturulmalı | | ⏳ |
| Payment → Invoice | paidAmount, status güncel | | ⏳ |
| Payment → AccountCard | Balance azalmalı | | ⏳ |
| Order Complete → StockMovement | Return hareketi (in) | | ⏳ |
| Equipment Quantity | Doğru güncellenmeli | | ⏳ |

### Otomatik İşlemler

| İşlem | Çalıştı mı? | Not |
|-------|-------------|-----|
| Invoice → StockMovement oluşturma | ⏳ | |
| Invoice → JournalEntry oluşturma | ⏳ | |
| Payment → JournalEntry oluşturma | ⏳ | |
| AccountCard balance güncelleme | ⏳ | |
| Equipment quantity güncelleme | ⏳ | |

### Muhasebe Dengesi

| Kontrol | Sonuç | Detay |
|---------|-------|-------|
| JournalEntry (Invoice) dengeli mi? | ⏳ | Debit = Credit? |
| JournalEntry (Payment) dengeli mi? | ⏳ | Debit = Credit? |
| Hesap kodları doğru mu? | ⏳ | 120.XXX, 600.XXX, 102.XXX |
| AccountCard balance tutarlı mı? | ⏳ | Başlangıç → Invoice → Payment |

### Frontend UI

| Component | Mock Data Durumu | API Bağlantısı | Test Sonucu |
|-----------|------------------|----------------|-------------|
| InventoryAccounting | ✅ Temiz | ✅ Bağlı | ⏳ |
| CostAccounting | ✅ Temiz | ✅ Bağlı | ⏳ |
| BankReconciliation | ✅ Temiz | ✅ Bağlı | ⏳ |
| DeliveryNoteList | ✅ Temiz | ✅ Bağlı | ⏳ |
| AgingReportTable | ✅ Temiz | ✅ Bağlı | ⏳ |
| JournalEntryList | ? | ? | ⏳ |
| AccountCardList | ? | ? | ⏳ |

---

## 🐛 Bulunan Hatalar

### Hata 1
- **Bileşen:** _______________
- **Açıklama:** _______________
- **Adımlar:** _______________
- **Beklenen:** _______________
- **Gerçek:** _______________
- **Çözüm:** _______________

### Hata 2
- **Bileşen:** _______________
- **Açıklama:** _______________

---

## ✅ Başarılı İşlemler

1. _______________
2. _______________

---

## 📈 Sonuç

**Genel Durum:** ⏳ TEST BAŞLADI

**İstatistikler:**
- Tamamlanan Testler: 0/10
- Başarılı: 0
- Başarısız: 0
- Bekliyor: 10

**Notlar:**
- Backend ve frontend çalışıyor
- Browser açıldı
- Test senaryosu hazır

**Sıradaki Adım:** Login yapıp Customer oluşturmaya başla!

---

**Test Eden:** _______________  
**Test Tarihi:** 17 Kasım 2025  
**Test Süresi:** _______________  
**Son Güncelleme:** 09:57
