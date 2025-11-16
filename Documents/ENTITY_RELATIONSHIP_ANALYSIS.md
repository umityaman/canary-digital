# 🔗 CANARY - Varlık İlişkileri ve İş Akışı Analizi

**Tarih:** 16 Kasım 2025  
**Durum:** Mevcut Sistem Analizi

---

## 📊 Genel Bakış

CANARY sistemi, **ekipman kiralama** merkezli bir ERP sistemidir. Ana iş akışı şu şekilde işler:

```
Müşteri → Sipariş → Ekipman → Fatura → Muhasebe → Ödeme
            ↓
         Teslimat → Stok Hareketi → Muhasebe Kaydı
```

---

## 🏗️ 1. ANA VARLlKLAR (Core Entities)

### 1.1 Equipment (Ekipman) 🎬
**Amaç:** Kiralanacak ekipmanların yönetimi

**Temel Alanlar:**
- `id`, `code`, `name`, `brand`, `model`
- `serialNumber`, `qrCode`, `barcode`
- `quantity` (Stok adedi)
- Fiyatlandırma: `dailyPrice`, `weeklyPrice`, `monthlyPrice`, `hourlyPrice`
- `status`: AVAILABLE, RENTED, MAINTENANCE, RESERVED
- `replacementValue`, `depositAmount`

**İlişkileri:**
```
Equipment
  ├─→ OrderItem (1:N) - Sipariş kalemleri
  ├─→ StockMovement (1:N) - Stok hareketleri
  ├─→ Inspection (1:N) - Muayene kayıtları
  ├─→ DeliveryNoteItem (1:N) - İrsaliye kalemleri
  ├─→ StockAlert (1:N) - Stok uyarıları
  ├─→ StockTransfer (1:N) - Transfer kayıtları
  ├─→ WorkOrder (1:N) - Teknik servis
  └─→ PricingRule (1:N) - Fiyatlandırma kuralları
```

**İş Mantığı:**
- Her ekipmanın QR/Barkod ile takibi
- Stok seviyesi `quantity` alanında
- Fiyatlar ekipman bazında (günlük/haftalık/aylık)
- Booqable entegrasyonu (`booqableId`)

---

### 1.2 Customer (Müşteri) 👤
**Amaç:** Müşteri bilgileri ve CRM

**Temel Alanlar:**
- `id`, `name`, `email`, `phone`
- `company`, `taxNumber`, `taxOffice`
- `address`
- `booqableId`, `parasutId` (Entegrasyonlar)

**İlişkileri:**
```
Customer
  ├─→ Order (1:N) - Müşteri siparişleri
  ├─→ Check (1:N) - Alınan çekler
  ├─→ PromissoryNote (1:N) - Alınan senetler
  ├─→ Inspection (1:N) - Ekipman muayeneleri
  ├─→ Reminder (1:N) - Hatırlatmalar
  └─→ WorkOrder (1:N) - Servis talepleri
```

**NOT:** `accountCardId` alanı TODO - AccountCard'a bağlantı gelecek

---

### 1.3 Supplier (Tedarikçi) 🏭
**Amaç:** Ekipman/hizmet tedarikçileri

**Temel Alanlar:**
- `id`, `name`, `email`, `phone`
- `taxNumber`, `taxOffice`
- `contactPerson`, `notes`
- `parasutId` (Paraşüt entegrasyonu)

**İlişkileri:**
```
Supplier
  └─→ Expense (1:N) - Gider kayıtları
```

**NOT:** `accountCardId` alanı TODO - AccountCard'a bağlantı gelecek

---

### 1.4 Order (Sipariş) 📋
**Amaç:** Kiralama siparişleri

**Temel Alanlar:**
- `id`, `orderNumber` (unique)
- `startDate`, `endDate` (Kiralama tarihleri)
- `totalAmount`, `status`
- `customerId`, `companyId`
- Google Calendar sync: `googleEventId`, `calendarSynced`
- Booqable sync: `booqableId`, `syncStatus`

**İlişkileri:**
```
Order
  ├─→ OrderItem (1:N) - Sipariş kalemleri (ekipmanlar)
  ├─→ Invoice (1:N) - Faturalar
  ├─→ Inspection (1:N) - Teslim/iade muayeneleri
  ├─→ StockMovement (1:N) - Stok çıkış/giriş
  ├─→ Customer (N:1) - Müşteri
  └─→ Company (N:1) - Şirket
```

**İş Akışı:**
```
1. Order oluşturulur (PENDING)
2. OrderItem'lar eklenir (ekipmanlar)
3. Onaylanır → CONFIRMED
4. Invoice oluşturulur
5. Ekipmanlar teslim edilir → ACTIVE
6. İade alınır → COMPLETED
```

---

## 💰 2. MUHASEBE VARLlKLARl (Accounting Entities)

### 2.1 Invoice (Fatura) 🧾
**Amaç:** Satış faturaları ve e-fatura entegrasyonu

**Temel Alanlar:**
- `id`, `invoiceNumber`, `invoiceDate`, `dueDate`
- `orderId` (Hangi siparişe ait)
- `customerId` (Müşteri)
- Tutarlar: `subtotal`, `vatAmount`, `grandTotal`
- `paidAmount`, `status` (draft, sent, paid, overdue)
- `type`: rental, late-fee, deposit-refund
- E-Fatura: `parasutInvoiceId`, `syncedToParasut`

**İlişkileri:**
```
Invoice
  ├─→ Order (N:1) - Sipariş
  ├─→ Customer/User (N:1) - Müşteri
  ├─→ InvoiceItem (1:N) - Fatura kalemleri
  ├─→ Payment (1:N) - Ödemeler
  ├─→ Transaction (1:N) - İşlemler
  ├─→ EInvoice (1:1) - e-Fatura XML
  ├─→ DeliveryNote (1:1) - İrsaliye
  ├─→ StockMovement (1:N) - Stok hareketleri
  ├─→ BankTransaction (1:N) - Banka işlemleri
  └─→ Reminder (1:N) - Ödeme hatırlatmaları
```

**KRİTİK İŞ AKIŞI:**
```
Invoice.create() →
  1. InvoiceItem'lar oluşturulur
  2. StockMovement otomatik oluşturulur (movementType: "out")
  3. JournalEntry otomatik oluşturulur (gelir kaydı)
  4. AccountCard bakiyesi güncellenir
  5. Reminder oluşturulur (ödeme vadesi)
```

**Kod Referansı:** `backend/src/services/invoice.service.ts` (commit: 17059bb)

---

### 2.2 AccountCard (Cari Hesap) 💳
**Amaç:** Müşteri/tedarikçi cari hesap takibi (Türk muhasebe standardı)

**Temel Alanlar:**
- `id`, `code` (unique, örn: "120.001")
- `name` (Müşteri/tedarikçi adı)
- `type`: "customer", "supplier", "employee", "other"
- `balance` (Güncel bakiye - alacak/borç)
- `creditLimit`, `paymentTerm` (gün)
- İletişim: `phone`, `email`, `address`, `taxNumber`

**İlişkileri:**
```
AccountCard
  ├─→ AccountCardTransaction (1:N) - Hareket kayıtları
  ├─→ Company (N:1) - Şirket
  └─→ User/Creator (N:1) - Oluşturan
```

**TODO Bağlantılar (Yorum olarak var):**
```typescript
// invoices        Invoice[]   @relation("AccountCardInvoices")
// expenses        Expense[]   @relation("AccountCardExpenses")
// customers       Customer[]  @relation("CustomerAccountCard")
// suppliers       Supplier[]  @relation("SupplierAccountCard")
```

**İş Mantığı:**
- Her Customer/Supplier için bir AccountCard
- `balance` pozitif → Alacak (bize borçlu)
- `balance` negatif → Borç (biz borçlu)
- Transaction'lar balance'ı otomatik günceller

---

### 2.3 ChartOfAccounts (Hesap Planı) 📊
**Amaç:** Türk muhasebe standardı hesap planı

**Temel Alanlar:**
- `code` (primary key): "100", "120", "600", vb.
- `name`: Hesap adı
- `accountType`: "asset", "liability", "equity", "income", "expense"
- `parentCode` (Hiyerarşi için)
- `isActive`, `isSystemAccount`

**Hesap Kodları:**
```
100-199: Dönen Varlıklar
  100: Kasa
  102: Bankalar
  120: Alıcılar (Müşteriler)
  
200-299: Duran Varlıklar
  
300-399: Kısa Vadeli Borçlar
  320: Satıcılar (Tedarikçiler)
  
400-499: Uzun Vadeli Borçlar

500-599: Özkaynaklar

600-699: Gelir Hesapları
  600: Yurtiçi Satışlar

700-799: Gider Hesapları
  770: Genel Yönetim Giderleri
```

**İlişkileri:**
```
ChartOfAccounts
  ├─→ JournalEntryItem (1:N) - Yevmiye kayıt kalemleri
  └─→ Parent (self-reference) - Hiyerarşik yapı
```

---

### 2.4 JournalEntry (Yevmiye Defteri) 📖
**Amaç:** Çift taraflı kayıt sistemi (double-entry bookkeeping)

**Temel Alanlar:**
- `id`, `entryNumber` (örn: "2024-001")
- `entryDate`, `description`, `reference`
- `entryType`: manual, auto_invoice, auto_payment
- `status`: draft, posted, cancelled
- `totalDebit`, `totalCredit` (Her zaman eşit!)

**İlişkileri:**
```
JournalEntry
  ├─→ JournalEntryItem (1:N) - Borç/alacak kayıtları
  ├─→ Company (N:1)
  ├─→ Creator/User (N:1)
  └─→ Reversal (self-reference) - İptal kayıtları
```

**JournalEntryItem (Kalemler):**
- `accountCode` → ChartOfAccounts
- `debit` (Borç) veya `credit` (Alacak) - Biri mutlaka 0
- `description`, `lineNumber`

**Örnek Kayıt (Fatura Oluşturma):**
```
Entry: "Ekipman Kira Geliri"
  Borç  120.001 (Müşteri A)     10,000 TL
  Alacak 600.001 (Kira Geliri)  10,000 TL
```

**Otomatik Oluşturma:**
- Invoice oluşturulunca → auto_invoice entry
- Payment kaydedilince → auto_payment entry

**Kod Referansı:** `backend/src/services/journal-entry.service.ts` (commit: a43fe22)

---

### 2.5 StockMovement (Stok Hareketi) 📦
**Amaç:** Ekipman giriş/çıkış takibi ve muhasebe entegrasyonu

**Temel Alanlar:**
- `id`, `equipmentId`
- `movementType`: in (giriş), out (çıkış), adjustment, transfer
- `movementReason`: sale, return, purchase, damage, loss
- `quantity` (pozitif/negatif)
- `stockBefore`, `stockAfter` (Hareket öncesi/sonrası stok)
- Bağlantılar: `invoiceId`, `deliveryNoteId`, `orderId`

**İlişkileri:**
```
StockMovement
  ├─→ Equipment (N:1) - Hangi ekipman
  ├─→ Invoice (N:1) - Hangi fatura
  ├─→ DeliveryNote (N:1) - Hangi irsaliye
  ├─→ Order (N:1) - Hangi sipariş
  └─→ User (N:1) - Kim gerçekleştirdi
```

**Otomatik Oluşturma:**
```typescript
// Invoice.create() tetiklediğinde:
InvoiceService.createRentalInvoice() →
  StockMovementService.createFromInvoice() →
    {
      movementType: "out",
      movementReason: "sale",
      quantity: -invoiceItem.quantity,
      stockBefore: equipment.quantity,
      stockAfter: equipment.quantity - invoiceItem.quantity
    }
```

**Kod Referansı:** `backend/src/services/stock-movement.service.ts`

---

### 2.6 Check & PromissoryNote (Çek & Senet) 💵
**Amaç:** Çek ve senet takibi

**Check (Çek):**
- `type`: "received" (alınan), "issued" (verilen)
- `status`: portfolio, endorsed, collected, bounced
- `checkNumber`, `bank`, `branch`, `dueDate`
- `customerId` (Kimden alındı)

**PromissoryNote (Senet):**
- `type`: "received", "issued"
- `status`: portfolio, endorsed, collected
- `serialNumber`, `dueDate`, `endorsements` (ciro)

**Yaşlandırma Raporu:**
- `agingAPI.getCombinedAging()` → Vade analizi
- 0-30 gün, 31-60 gün, 61-90 gün, 90+ gün

---

## 🔄 3. İŞ AKIŞI SENARYOLARI

### Senaryo 1: Yeni Kiralama Siparişi
```
1. MÜŞTERI KAYDI
   Customer.create() →
     - AccountCard oluşturulur (type: "customer")
     - Code: "120.XXX" (Alıcılar grubundan)

2. SİPARİŞ OLUŞTURMA
   Order.create() →
     customerId: 123
     startDate: "2025-11-20"
     endDate: "2025-11-25"
     status: "PENDING"
   
   OrderItem.create() →
     orderId: 456
     equipmentId: 789
     quantity: 2
     dailyPrice: 500

3. FATURA KESİLMESİ
   InvoiceService.createRentalInvoice() →
     ✓ Invoice oluşturulur
     ✓ InvoiceItem'lar oluşturulur
     ✓ StockMovement otomatik (movementType: "out")
       - equipment.quantity -= 2
     ✓ JournalEntry otomatik
       - Borç: 120.123 (Müşteri) 6,000 TL
       - Alacak: 600.001 (Kira Geliri) 6,000 TL
     ✓ AccountCard.balance += 6,000
     ✓ Reminder oluşturulur (dueDate)
     ✓ DeliveryNote oluşturulur (irsaliye)

4. ÖDEME ALIMI
   Payment.create() →
     invoiceId: 456
     amount: 6,000
     paymentMethod: "bank_transfer"
   
   → JournalEntry otomatik
     - Borç: 102.001 (Banka) 6,000 TL
     - Alacak: 120.123 (Müşteri) 6,000 TL
   → AccountCard.balance -= 6,000
   → Invoice.paidAmount += 6,000
   → Invoice.status = "paid"

5. EKİPMAN İADESİ
   Order.status = "COMPLETED" →
     ✓ StockMovement (movementType: "in")
       - equipment.quantity += 2
     ✓ Inspection kaydı (ekipman durumu)
```

---

### Senaryo 2: Tedarikçiden Ekipman Alımı
```
1. TEDARİKCİ KAYDI
   Supplier.create() →
     - AccountCard oluşturulur (type: "supplier")
     - Code: "320.XXX" (Satıcılar grubundan)

2. SATIN ALMA
   Expense.create() →
     supplierId: 999
     description: "Kamera Alımı"
     amount: 50,000
     category: "equipment_purchase"
   
   → JournalEntry otomatik
     - Borç: 253.001 (Demirbaşlar) 50,000 TL
     - Alacak: 320.999 (Tedarikçi) 50,000 TL
   → AccountCard.balance -= 50,000 (biz borçluyuz)

3. STOK GİRİŞİ
   Equipment.create() →
     name: "Sony FX6"
     quantity: 1
   
   StockMovement.create() →
     movementType: "in"
     movementReason: "purchase"
     quantity: 1

4. ÖDEME YAPIMI
   Payment.create() →
     paymentMethod: "check"
   
   Check.create() →
     type: "issued"
     amount: 50,000
     dueDate: "2025-12-15"
   
   → JournalEntry
     - Borç: 320.999 (Tedarikçi) 50,000 TL
     - Alacak: 100.001 (Kasa) 50,000 TL
```

---

### Senaryo 3: Geç Ödeme ve Gecikme Ücreti
```
1. VADE GEÇTİ
   Invoice.dueDate < today && Invoice.status != "paid" →
     Reminder tetiklenir (email/SMS)
     Invoice.status = "overdue"

2. GECİKME ÜCRETİ FATURASI
   InvoiceService.createLateFee() →
     type: "late-fee"
     amount: lateDays × dailyFee
     reference: originalInvoice.id
   
   → JournalEntry
     - Borç: 120.123 (Müşteri) 500 TL
     - Alacak: 649.001 (Diğer Gelirler) 500 TL

3. TAKSİTLENDİRME
   InvoiceService.createPaymentPlan() →
     totalAmount: 6,500
     installments: 3
   
   → 3 adet Payment.create() (planned)
   → Her taksit için Reminder
```

---

## 🔗 4. KRİTİK İLİŞKİLER ve BAĞIMLILIKLAR

### 4.1 Muhasebe Zinciri (Accounting Chain)
```
Invoice → StockMovement → JournalEntry → ChartOfAccounts
   ↓           ↓              ↓
Payment → AccountCard → BalanceUpdate
```

**Önemli:** Bu zincir otomatik çalışır. Manuel müdahale gerektirmez.

### 4.2 Stok Takibi (Inventory Tracking)
```
Equipment.quantity (Current Stock)
    ↑
    └─ StockMovement (History)
         ├─ Invoice-based (otomatik)
         ├─ Order-based (teslim/iade)
         ├─ Adjustment (düzeltme)
         └─ Transfer (depo arası)
```

### 4.3 Müşteri İlişkileri (Customer Relations)
```
Customer
  ├─ AccountCard (Cari hesap bakiyesi)
  ├─ Order (Siparişler)
  │   └─ OrderItem (Kiraladığı ekipmanlar)
  ├─ Invoice (Kesilen faturalar)
  │   └─ Payment (Ödemeler)
  ├─ Check (Verdiği çekler)
  ├─ PromissoryNote (Verdiği senetler)
  └─ Reminder (Hatırlatmalar)
```

### 4.4 TODO: Eksik Bağlantılar
**Cloud SQL Migration Bekleyen:**
```typescript
// Customer model
accountCardId Int? // → AccountCard.id

// Supplier model
accountCardId Int? // → AccountCard.id

// Invoice model
accountCardId Int? // → AccountCard.id

// Expense model
accountCardId Int? // → AccountCard.id
```

**Bu bağlantılar aktif olunca:**
- Customer/Supplier → AccountCard (direkt erişim)
- Invoice/Expense → AccountCard (cari güncelleme)
- Raporlama kolaylaşacak

---

## 📈 5. RAPORLAMA ve ANALİZ

### 5.1 Finansal Raporlar
```
accountingAPI.getStats() →
  - totalRevenue (Toplam gelir)
  - totalExpenses (Toplam gider)
  - netProfit (Net kar)
  - totalCollections (Tahsilatlar)
  - totalOverdue (Vadesi geçen)
  - invoiceCount (Fatura sayısı)

accountingAPI.getIncomeExpenseAnalysis() →
  - Günlük/haftalık/aylık gelir-gider
  - Kategori bazında analiz
```

### 5.2 Cari Raporları
```
AccountCard.list() →
  - Müşteri/tedarikçi bazında bakiyeler
  - Vade analizi
  - Risk analizi (creditLimit aşımı)

accountingAPI.getCariSummary() →
  - Toplam alacak
  - Toplam borç
  - Net pozisyon
```

### 5.3 Stok Raporları
```
Equipment.list() →
  - Mevcut stok seviyeleri
  - Kirada olan ekipmanlar
  - Bakım/arıza durumları

StockMovement.analyze() →
  - Giriş/çıkış hareketleri
  - En çok kiralanan ekipmanlar
  - Stok devir hızı
```

### 5.4 Muhasebe Raporları
```
JournalEntry.getTrialBalance() →
  - Mizan raporu (tüm hesaplar)
  - Borç/alacak toplamları

JournalEntry.getIncomeStatement() →
  - Gelir tablosu
  - Gelir - Gider = Net Kar

JournalEntry.getBalanceSheet() →
  - Bilanço
  - Varlıklar = Borçlar + Özkaynaklar
```

---

## 🎯 6. ÖNERİLER ve İYİLEŞTİRMELER

### 6.1 Acil: AccountCard Bağlantıları
```sql
-- Migration needed:
ALTER TABLE "Customer" ADD COLUMN "accountCardId" INTEGER;
ALTER TABLE "Supplier" ADD COLUMN "accountCardId" INTEGER;
ALTER TABLE "Invoice" ADD COLUMN "accountCardId" INTEGER;
ALTER TABLE "Expense" ADD COLUMN "accountCardId" INTEGER;

-- Foreign keys:
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_accountCardId_fkey" 
  FOREIGN KEY ("accountCardId") REFERENCES "AccountCard"("id");
-- ... diğerleri için aynı
```

### 6.2 Orta Vadeli: Otomasyon İyileştirmeleri
- [ ] Order.create() → otomatik Invoice oluşturma seçeneği
- [ ] Invoice.overdue → otomatik gecikme ücreti hesaplama
- [ ] StockMovement → otomatik stok uyarıları (low stock)
- [ ] Payment → otomatik fatura eşleştirme (matching)

### 6.3 Uzun Vadeli: Gelişmiş Özellikler
- [ ] Multi-currency support (USD, EUR)
- [ ] Automated bank reconciliation (banka mutabakatı)
- [ ] Predictive analytics (tahmine dayalı analiz)
- [ ] Cash flow forecasting (nakit akışı tahmini)

---

## 📚 7. KOD REFERANSLARI

### Servisler (Backend)
```
backend/src/services/
  ├─ invoice.service.ts (Fatura işlemleri)
  ├─ stock-movement.service.ts (Stok hareketleri)
  ├─ journal-entry.service.ts (Yevmiye kayıtları)
  ├─ account-card.service.ts (Cari hesaplar)
  └─ accounting.service.ts (Muhasebe raporları)
```

### API Route'ları
```
backend/src/routes/
  ├─ accounting.ts (/api/accounting/*)
  ├─ invoice.ts (/api/invoices/*)
  ├─ order.ts (/api/orders/*)
  └─ equipment.ts (/api/equipment/*)
```

### Frontend Componentler
```
frontend/src/components/accounting/
  ├─ AccountCardList.tsx (Cari hesaplar)
  ├─ AccountCardDetail.tsx (Cari detay)
  ├─ InvoiceList.tsx (Fatura listesi)
  ├─ JournalEntryList.tsx (Yevmiye kayıtları)
  └─ BankReconciliation.tsx (Banka mutabakatı)
```

---

## 🔐 8. GÜVENLİK ve YETKİLENDİRME

### Middleware
```typescript
authenticateToken() // JWT token kontrolü
  ↓
checkRole(['ADMIN', 'ACCOUNTANT']) // Rol kontrolü
  ↓
checkCompanyAccess() // Şirket erişim kontrolü
```

### Veri İzolasyonu
- Tüm query'lerde `companyId` filtresi
- Multi-tenant yapı (şirket bazında veri)
- User → Company ilişkisi zorunlu

---

## 📊 9. PERFORMANS ve OPTİMİZASYON

### İndeksler (Indexes)
```prisma
@@index([companyId])        // Şirket filtresi
@@index([customerId])       // Müşteri sorguları
@@index([status])           // Durum filtreleme
@@index([createdAt])        // Tarih sıralama
@@index([invoiceDate])      // Fatura tarihi
```

### Eager Loading (Join'ler)
```typescript
// Tek query'de ilişkili verileri çek
prisma.invoice.findMany({
  include: {
    customer: true,
    order: {
      include: {
        orderItems: {
          include: { equipment: true }
        }
      }
    },
    payments: true
  }
})
```

### Caching Stratejisi
- Dashboard stats: 5 dakika cache
- Equipment list: 1 dakika cache
- ChartOfAccounts: 1 saat cache (nadiren değişir)

---

## ✅ SONUÇ

**CANARY sistemi**, **ekipman kiralama** işini **muhasebe entegrasyonu** ile birleştiren güçlü bir yapıya sahip. Ana güçlü yönleri:

1. **Otomatik Muhasebe Kayıtları** - Invoice → StockMovement → JournalEntry zinciri
2. **Türk Muhasebe Standardı** - ChartOfAccounts, AccountCard, çift taraflı kayıt
3. **E-Fatura Entegrasyonu** - GIB ile tam uyumlu
4. **Stok Takibi** - Real-time ekipman takibi
5. **Multi-tenant** - Şirket bazında izolasyon

**Eksik Olan:**
- Customer/Supplier → AccountCard bağlantıları (TODO)
- Bazı otomasyon senaryoları
- Gelişmiş raporlama

**Genel Puan:** ⭐⭐⭐⭐ (4/5) - Sağlam temel, birkaç eksik var.
