# 🧪 CANARY Test Stratejisi - Entity İlişkilerine Göre

**Tarih:** 17 Kasım 2025  
**Amaç:** Entity relationship raporlarına göre sistemi kapsamlı test etmek  
**Hedef:** Mock data'ları kaldırıp gerçek data akışını doğrulamak

---

## 📋 Genel Bakış

### Mevcut Durum

**✅ API'ye Bağlı Componentler (Rapor: FRONTEND_API_INTEGRATION_REPORT.md):**
- InventoryAccounting.tsx (Stock movements)
- CostAccounting.tsx (Cost analysis)
- AgingReportTable.tsx (Aging reports)

**❌ Halen Mock Data Kullanan Componentler:**
1. **DeliveryNoteList.tsx** - İrsaliye listesi (aktif mock)
2. **BankReconciliation.tsx** - Deprecated mock (kullanılmıyor ama kod var)
3. **AdvancedReporting.tsx** - VAT için fallback mock
4. **DynamicRevenueChart.tsx** - Gelir grafiği mock generator

---

## 🎯 Test Stratejisi - 5 Aşama

### Aşama 1: Production Database Kontrolü (10 dk)
**Amaç:** Mevcut verileri ve sistem durumunu öğrenmek

**Kontroller:**
```powershell
# 1. Backend'e geç ve data durumunu kontrol et
cd backend
node check-data.ts

# 2. Production endpoints test
cd ..
.\production-test.ps1

# 3. Database table counts
cd backend
node check-db-counts.js
```

**Beklenen Çıktı:**
- Customer sayısı
- Order sayısı
- Invoice sayısı
- StockMovement kayıt sayısı
- JournalEntry kayıt sayısı
- AccountCard kayıt sayısı

**Karar Noktası:**
- Eğer yeterli test datası varsa → Aşama 2'ye geç
- Eğer data azsa → Seed script çalıştır

---

### Aşama 2: Mock Data Temizleme (30 dk)

#### 2.1 DeliveryNoteList - Gerçek API Bağlantısı
**Dosya:** `frontend/src/components/accounting/DeliveryNoteList.tsx`

**Mevcut:** 
```typescript
const mockData: DeliveryNote[] = [
  { id: 1, deliveryNumber: 'IRS-2024-001', ... },
  // ... mock array
];
setDeliveryNotes(mockData);
```

**Hedef:**
```typescript
const loadDeliveryNotes = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/delivery-notes', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to load delivery notes');
    
    const data = await response.json();
    setDeliveryNotes(data.data || data);
  } catch (error) {
    console.error('Failed to load delivery notes:', error);
    toast.error('İrsaliyeler yüklenemedi');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadDeliveryNotes();
}, []);
```

**Backend Endpoint Kontrolü:**
```bash
# Route'un var olup olmadığını kontrol et
grep -r "delivery-note" backend/src/routes/
```

**Olası Endpoint:** 
- `GET /api/delivery-notes`
- `GET /api/invoices/:id/delivery-note`
- `POST /api/orders/:id/delivery-note`

---

#### 2.2 BankReconciliation - Deprecated Mock Kaldırma
**Dosya:** `frontend/src/components/accounting/BankReconciliation.tsx`

**Aksiyon:**
```typescript
// Satır 120-200 arası deprecated mock function'ı tamamen sil
// const generateMockBankData_DEPRECATED = () => { ... }

// Kod zaten gerçek API kullanıyor, sadece eski kodu temizle
```

---

#### 2.3 AdvancedReporting - VAT Mock Kontrolü
**Dosya:** `frontend/src/components/accounting/AdvancedReporting.tsx`

**Mevcut (Satır 345):**
```typescript
// Mock data for VAT (fallback)
```

**Kontrol Et:**
- Bu fallback gerekli mi? (API fail olunca gösterilsin)
- Yoksa gerçek VAT endpoint'i eksik mi?

**Aksiyon:**
- Eğer fallback → Bırak, ama yorumu güncelle
- Eğer eksik API → Backend'e VAT endpoint ekle

---

#### 2.4 DynamicRevenueChart - Mock Generator
**Dosya:** `frontend/src/components/charts/examples/DynamicRevenueChart.tsx`

**Mevcut:**
```typescript
const mockData = generateMockData(period);
```

**Hedef:**
```typescript
const loadRevenueData = async (period: string) => {
  try {
    const response = await fetch(`/api/analytics/revenue?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    setChartData(data.data || data);
  } catch (error) {
    console.error('Failed to load revenue data:', error);
    toast.error('Gelir verileri yüklenemedi');
  }
};
```

---

### Aşama 3: Backend Test - Entity Flow (45 dk)

#### 3.1 Customer → Order Flow Test
**Senaryo:** Yeni müşteri kaydı ve sipariş oluşturma

```bash
# Terminal 1: Backend'i başlat
cd backend
npm run dev

# Terminal 2: API test script
```

**Test Adımları:**
```typescript
// 1. Yeni Customer Oluştur
POST /api/customers
{
  "name": "Test Müşteri A",
  "email": "test@canary.com",
  "phone": "5551234567",
  "company": "Test A.Ş.",
  "taxNumber": "1234567890"
}

// Beklenen: 
// - Customer oluşturulur
// - AccountCard otomatik oluşturulur (type: "customer", code: "120.XXX")

// 2. Customer'ın AccountCard'ını Kontrol Et
GET /api/account-cards?customerId={id}

// Beklenen:
// - AccountCard döner
// - balance = 0
// - type = "customer"
```

**Doğrulama Kriterleri:**
- ✅ Customer oluşturuldu mu?
- ✅ AccountCard otomatik oluştu mu?
- ✅ AccountCard.code doğru mu? (120.XXX)
- ✅ İlişki kuruldu mu? (Customer ↔ AccountCard)

---

#### 3.2 Order → Invoice → StockMovement Flow Test
**Senaryo:** Sipariş → Fatura → Otomatik Stok Hareketi

```typescript
// 1. Yeni Sipariş Oluştur
POST /api/orders
{
  "customerId": {customer_id},
  "startDate": "2025-11-20",
  "endDate": "2025-11-25",
  "status": "PENDING",
  "orderItems": [
    {
      "equipmentId": {equipment_id},
      "quantity": 2,
      "dailyPrice": 500
    }
  ]
}

// 2. Fatura Kes
POST /api/invoices
{
  "orderId": {order_id},
  "type": "rental"
}

// Beklenen Otomatik İşlemler:
// ✅ Invoice oluşturulur
// ✅ InvoiceItem'lar oluşturulur
// ✅ StockMovement otomatik oluşturulur (movementType: "out")
// ✅ Equipment.quantity azalır
// ✅ JournalEntry otomatik oluşturulur
// ✅ AccountCard.balance güncellenir
```

**Doğrulama Sorguları:**
```typescript
// 1. Invoice kontrolü
GET /api/invoices/{invoice_id}

// 2. StockMovement kontrolü
GET /api/stock/movements?invoiceId={invoice_id}
// Beklenen: movementType = "out", quantity negatif

// 3. Equipment stok kontrolü
GET /api/equipment/{equipment_id}
// Beklenen: quantity azalmış olmalı

// 4. JournalEntry kontrolü
GET /api/accounting/journal-entries?referenceId={invoice_id}
// Beklenen:
// - Borç: 120.XXX (Müşteri)
// - Alacak: 600.001 (Kira Geliri)

// 5. AccountCard kontrolü
GET /api/account-cards/{account_card_id}
// Beklenen: balance artmış olmalı (invoice amount kadar)
```

**KRİTİK:** Bu test entity relationship'in en önemli zinciri!

---

#### 3.3 Payment → Accounting Update Flow Test
**Senaryo:** Ödeme alımı ve muhasebe güncellemesi

```typescript
// 1. Ödeme Kaydı
POST /api/payments
{
  "invoiceId": {invoice_id},
  "amount": 6000,
  "paymentMethod": "bank_transfer",
  "paymentDate": "2025-11-17"
}

// Beklenen Otomatik İşlemler:
// ✅ Payment oluşturulur
// ✅ JournalEntry otomatik oluşturulur
// ✅ Invoice.paidAmount güncellenir
// ✅ Invoice.status "paid" olur
// ✅ AccountCard.balance azalır
```

**Doğrulama:**
```typescript
// 1. Payment kontrolü
GET /api/payments/{payment_id}

// 2. Invoice güncellenmesi
GET /api/invoices/{invoice_id}
// Beklenen: paidAmount = 6000, status = "paid"

// 3. JournalEntry kontrolü
GET /api/accounting/journal-entries?referenceId={payment_id}
// Beklenen:
// - Borç: 102.001 (Banka)
// - Alacak: 120.XXX (Müşteri)

// 4. AccountCard balance
GET /api/account-cards/{account_card_id}
// Beklenen: balance = 0 (ödeme alındı)
```

---

### Aşama 4: Frontend Test - UI Doğrulama (30 dk)

#### 4.1 Manuel UI Test Senaryosu

**Login:**
```
1. Frontend'i aç: http://localhost:5173
2. Login ol (test kullanıcısı)
```

**Test Akışı:**

**1️⃣ Customer Oluşturma**
- Menü: Customers → Yeni Müşteri
- Form doldur → Kaydet
- Liste'de göründüğünü kontrol et

**2️⃣ Order Oluşturma**
- Menü: Orders → Yeni Sipariş
- Müşteri seç
- Ekipman ekle (2 adet)
- Tarih seç → Kaydet
- Order detayında ekipmanları gör

**3️⃣ Invoice Oluşturma**
- Order detayında "Fatura Kes" butonuna tıkla
- Fatura oluşturuldu mesajı
- Invoice listesinde yeni faturayı gör

**4️⃣ Stok Hareketi Kontrolü**
- Menü: Accounting → Inventory Accounting
- Yeni stok hareketi göründü mü? (movementType: "out")
- Equipment link'ine tıkla → Stok azalmış mı?

**5️⃣ Muhasebe Kaydı Kontrolü**
- Menü: Accounting → Journal Entries
- Yeni journal entry var mı?
- Borç/Alacak dengeli mi? (totalDebit === totalCredit)

**6️⃣ Cari Hesap Kontrolü**
- Menü: Accounting → Account Cards
- Müşterinin bakiyesi arttı mı?
- Transaction history'de fatura görünüyor mu?

**7️⃣ Ödeme Alma**
- Invoice detayında "Ödeme Al" butonuna tıkla
- Tutar gir → Kaydet
- Invoice status "Paid" oldu mu?

**8️⃣ Ödeme Sonrası Kontroller**
- Journal Entries: Yeni ödeme kaydı var mı?
- Account Card: Balance 0 oldu mu?
- Invoice: paidAmount doğru mu?

---

#### 4.2 DeliveryNote UI Test
```
1. Order detayında "İrsaliye Oluştur" butonuna tıkla
2. Menü: Accounting → Delivery Notes
3. Yeni irsaliye listede görünüyor mu?
4. İrsaliye detayını aç
5. PDF indir butonuna tıkla
6. PDF doğru bilgilerle açıldı mı?
```

---

### Aşama 5: Entegrasyon Testleri (30 dk)

#### 5.1 Booqable Sync Test (Opsiyonel)
```typescript
// Eğer Booqable entegrasyonu aktifse
POST /api/integrations/booqable/sync-order
{
  "orderId": {order_id}
}

// Kontrol:
GET /api/orders/{order_id}
// Beklenen: booqableId dolu, syncStatus = "synced"
```

---

#### 5.2 e-Invoice Test (GIB Entegrasyonu)
```typescript
// Test environment GIB
POST /api/einvoice/create
{
  "invoiceId": {invoice_id}
}

// Kontrol:
GET /api/einvoice/{invoice_id}
// Beklenen: EInvoice kaydı, xmlContent dolu
```

---

#### 5.3 Bank API Test
```typescript
// Banka işlemlerini çek
GET /api/bank-api/transactions?accountId={account_id}

// Kontrol:
// - BankTransaction kayıtları var mı?
// - matched field'ları çalışıyor mu?
```

---

## 📊 Test Checklist - Tam Liste

### Backend Entity Tests
- [ ] **Customer Oluşturma**
  - [ ] Customer kaydı başarılı
  - [ ] AccountCard otomatik oluştu (type: customer, code: 120.XXX)
  - [ ] İlişki kuruldu (Customer.accountCardId)

- [ ] **Order Oluşturma**
  - [ ] Order kaydı başarılı
  - [ ] OrderItem'lar oluştu
  - [ ] Customer ilişkisi doğru
  - [ ] Equipment ilişkisi doğru
  - [ ] startDate/endDate doğru

- [ ] **Invoice Oluşturma (KRİTİK)**
  - [ ] Invoice kaydı başarılı
  - [ ] InvoiceItem'lar oluştu
  - [ ] StockMovement otomatik oluştu (movementType: "out")
  - [ ] Equipment.quantity azaldı
  - [ ] JournalEntry otomatik oluştu
  - [ ] JournalEntryItem'lar dengeli (Borç = Alacak)
  - [ ] AccountCard.balance güncellendi
  - [ ] DeliveryNote oluştu (eğer ayarlıysa)

- [ ] **Payment Kaydı**
  - [ ] Payment kaydı başarılı
  - [ ] JournalEntry otomatik oluştu
  - [ ] Invoice.paidAmount güncellendi
  - [ ] Invoice.status "paid" oldu
  - [ ] AccountCard.balance azaldı

- [ ] **Order Tamamlama**
  - [ ] Order.status "COMPLETED" oldu
  - [ ] StockMovement oluştu (movementType: "in", iade)
  - [ ] Equipment.quantity arttı
  - [ ] Inspection kaydı (opsiyonel)

### Frontend UI Tests
- [ ] **Customer UI**
  - [ ] Customer listesi yükleniyor
  - [ ] Yeni customer formu çalışıyor
  - [ ] Customer detay sayfası açılıyor
  - [ ] Customer düzenleme çalışıyor

- [ ] **Order UI**
  - [ ] Order listesi yükleniyor
  - [ ] Yeni order formu çalışıyor
  - [ ] OrderItem ekleme/çıkarma çalışıyor
  - [ ] Order detay sayfası doğru
  - [ ] Status güncellemeleri yansıyor

- [ ] **Invoice UI**
  - [ ] Invoice listesi yükleniyor
  - [ ] Invoice oluşturma butonu çalışıyor
  - [ ] Invoice detay sayfası açılıyor
  - [ ] PDF indirme çalışıyor
  - [ ] Status badge'leri doğru renkte

- [ ] **Accounting UI**
  - [ ] InventoryAccounting gerçek data gösteriyor
  - [ ] CostAccounting gerçek data gösteriyor
  - [ ] AgingReportTable gerçek data gösteriyor
  - [ ] JournalEntryList çalışıyor (TODO: henüz yoksa ekle)
  - [ ] ChartOfAccounts görüntüleniyor

- [ ] **Account Cards UI**
  - [ ] AccountCard listesi yükleniyor
  - [ ] Balance doğru gösteriliyor
  - [ ] Transaction history doğru
  - [ ] Filtreleme çalışıyor (customer/supplier)

- [ ] **Delivery Notes UI**
  - [ ] DeliveryNote listesi gerçek data (mock değil!)
  - [ ] Yeni irsaliye oluşturma çalışıyor
  - [ ] PDF export çalışıyor

### Muhasebe Raporları Tests
- [ ] **Mizan (Trial Balance)**
  - [ ] ChartOfAccounts listesi doğru
  - [ ] Borç/Alacak toplamları dengeli
  - [ ] Hesap hiyerarşisi çalışıyor

- [ ] **Gelir Tablosu (Income Statement)**
  - [ ] Gelir hesapları (600-699) gösteriliyor
  - [ ] Gider hesapları (700-799) gösteriliyor
  - [ ] Net kar doğru hesaplanıyor

- [ ] **Bilanço (Balance Sheet)**
  - [ ] Varlıklar (100-299) gösteriliyor
  - [ ] Borçlar (300-499) gösteriliyor
  - [ ] Özkaynaklar (500-599) gösteriliyor
  - [ ] Denklem dengeli (Varlıklar = Borçlar + Özkaynaklar)

### Entegrasyon Tests
- [ ] **Booqable Sync**
  - [ ] Order sync çalışıyor
  - [ ] Equipment sync çalışıyor
  - [ ] booqableId'ler kaydediliyor

- [ ] **e-Invoice (GIB)**
  - [ ] e-Fatura oluşturma çalışıyor
  - [ ] XML generation doğru
  - [ ] GIB'e gönderim başarılı (test env)

- [ ] **Bank API**
  - [ ] Banka hareketleri çekiliyor
  - [ ] Transaction matching çalışıyor

---

## 🚀 Test Execution Planı

### Hızlı Test (30 dakika)
```bash
# 1. Database kontrolü
cd backend && node check-data.ts

# 2. Production endpoints test
cd .. && .\production-test.ps1

# 3. Frontend'i başlat
cd frontend && npm run dev

# 4. Manuel UI testi (Customer → Order → Invoice → Payment)
```

### Tam Test (2 saat)
```bash
# 1. Database seed (temiz data)
cd backend && npm run seed

# 2. Backend başlat
npm run dev

# 3. Frontend başlat (yeni terminal)
cd ../frontend && npm run dev

# 4. Mock data temizle (4 component)
# - DeliveryNoteList.tsx
# - BankReconciliation.tsx (deprecated kaldır)
# - AdvancedReporting.tsx (kontrol et)
# - DynamicRevenueChart.tsx

# 5. Tüm UI akışını test et (checklist)

# 6. Muhasebe raporlarını kontrol et

# 7. Entegrasyonları test et
```

---

## 📝 Test Sonuçları Raporu Template

```markdown
# Test Sonuçları - [TARİH]

## Database Durumu
- Customer: X kayıt
- Order: X kayıt
- Invoice: X kayıt
- StockMovement: X kayıt
- JournalEntry: X kayıt
- AccountCard: X kayıt

## Backend Tests
- [ ] Customer → AccountCard: ✅/❌
- [ ] Order → OrderItem: ✅/❌
- [ ] Invoice → StockMovement: ✅/❌
- [ ] Invoice → JournalEntry: ✅/❌
- [ ] Payment → AccountCard: ✅/❌

## Frontend Tests
- [ ] Customer UI: ✅/❌
- [ ] Order UI: ✅/❌
- [ ] Invoice UI: ✅/❌
- [ ] Accounting UI: ✅/❌
- [ ] Delivery Notes: ✅/❌ (Mock temizlendi mi?)

## Mock Data Durumu
- InventoryAccounting: ✅ API (zaten temiz)
- CostAccounting: ✅ API (zaten temiz)
- BankReconciliation: ⏳ Deprecated kaldırılacak
- DeliveryNoteList: ❌ Mock (temizlenecek)
- AdvancedReporting: ⚠️ Fallback (kontrol edilecek)
- DynamicRevenueChart: ❌ Mock (temizlenecek)

## Bulunan Hatalar
1. [Hata açıklaması]
2. [Hata açıklaması]

## İyileştirme Önerileri
1. [Öneri]
2. [Öneri]
```

---

## 🎯 Öncelikler

### P0 (Kritik - Hemen)
1. ✅ Database durumunu kontrol et
2. ⏳ DeliveryNoteList mock'unu temizle
3. ⏳ Customer → Order → Invoice → Payment akışını test et

### P1 (Yüksek - Bugün)
4. BankReconciliation deprecated mock'u kaldır
5. DynamicRevenueChart gerçek API'ye bağla
6. Muhasebe raporlarını test et

### P2 (Normal - Bu hafta)
7. AdvancedReporting VAT durumunu kontrol et
8. Entegrasyon testlerini çalıştır
9. Performance test (büyük data setleri)

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 17 Kasım 2025  
**Versiyon:** 1.0  
**Durum:** 📝 HAZIR - Test başlayabilir!
