# Gelir-Gider (Income/Expense) CRUD İmplementasyonu

**Tarih:** 20 Ekim 2025  
**Durum:** ✅ Backend Hazır, 🔄 Database Oluşturulacak, ⏳ Frontend Beklemede  
**Öncelik:** YÜKSEK (Competitive Analysis'te en kritik eksik özellik)

---

## 📋 TAMAMLANAN ADIMLAR

### 1. Database Schema ✅
**Dosya:** `backend/prisma/schema.prisma`

**Income Model Oluşturuldu (Lines 1072-1091):**
```prisma
model Income {
  id            Int      @id @default(autoincrement())
  companyId     Int
  description   String
  amount        Float
  category      String
  date          DateTime
  status        String   @default("received")
  paymentMethod String?
  notes         String?
  invoiceId     Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  company       Company  @relation(fields: [companyId], references: [id])
  invoice       Invoice? @relation(fields: [invoiceId], references: [id])
  
  @@index([companyId])
  @@index([category])
  @@index([date])
  @@index([invoiceId])
}
```

**Relationlar Güncellendi:**
- Company model: `incomes Income[]` eklendi
- Invoice model: `incomes Income[]` eklendi

**Expense Model:** Zaten mevcut (Lines 1054-1071), backend servisleri eklendi

---

### 2. Backend API Endpoints ✅
**Dosya:** `backend/src/routes/accounting.ts`

**Eklenen Endpointler:**

#### INCOME ENDPOINTS:
- ✅ `POST /api/accounting/income` - Gelir ekle
- ✅ `GET /api/accounting/incomes` - Gelirleri listele (pagination, filter)
- ✅ `PUT /api/accounting/income/:id` - Gelir güncelle
- ✅ `DELETE /api/accounting/income/:id` - Gelir sil

#### EXPENSE ENDPOINTS:
- ✅ `POST /api/accounting/expense` - Gider ekle
- ✅ `GET /api/accounting/expenses` - Giderleri listele (pagination, filter)
- ✅ `PUT /api/accounting/expense/:id` - Gider güncelle
- ✅ `DELETE /api/accounting/expense/:id` - Gider sil

**Özellikler:**
- Authentication kontrolü (authenticateToken)
- Company ID bazlı veri izolasyonu
- Pagination (limit, offset)
- Filtering (category, startDate, endDate)
- Input validasyonu
- Hata yönetimi

**API Kullanım Örnekleri:**

```bash
# Gelir Ekle
POST /api/accounting/income
{
  "description": "Ekipman Kiralama",
  "amount": 25000,
  "category": "Equipment Rental",
  "date": "2025-10-10",
  "paymentMethod": "bank_transfer",
  "notes": "Sony A7III kiralama",
  "status": "received"
}

# Gelirleri Listele
GET /api/accounting/incomes?category=Equipment Rental&startDate=2025-10-01&endDate=2025-10-31&limit=50&offset=0

# Gelir Güncelle
PUT /api/accounting/income/1
{
  "amount": 30000,
  "notes": "Güncellenmiş not"
}

# Gelir Sil
DELETE /api/accounting/income/1
```

---

### 3. Database Migration SQL ✅
**Dosya:** `backend/create-income-table.sql`

**Oluşturulacak Objeler:**
- Income tablosu (12 field)
- Foreign key constraints (Company, Invoice)
- 4 adet index (companyId, category, date, invoiceId)
- 5 adet seed data (toplam 69,000 TL gelir)

**Seed Data:**
1. Equipment Rental - 25,000 TL (10 Ekim)
2. Service Fee - 12,000 TL (11 Ekim)
3. Product Sale - 18,000 TL (12 Ekim)
4. Consulting - 8,000 TL (13 Ekim)
5. Training - 6,000 TL (14 Ekim)

---

### 4. Deploy Script ✅
**Dosya:** `backend/run-income-sql.ps1`

PowerShell scripti ile Cloud SQL'de tablo oluşturma:
```powershell
.\run-income-sql.ps1
```

---

## ⏳ YAPILACAKLAR

### ADIM 1: Database Oluşturma (5 dakika)

**Seçenek A - PowerShell Script:**
```powershell
cd backend
.\run-income-sql.ps1
```

**Seçenek B - Manuel GCP Console:**
1. GCP Console → Cloud SQL → canary-postgres
2. Query Editor'ü aç
3. `create-income-table.sql` içeriğini yapıştır
4. Çalıştır

**Seçenek C - gcloud CLI:**
```bash
gcloud sql connect canary-postgres --user=postgres --database=canary_db
# SQL dosyasını yapıştır ve çalıştır
```

---

### ADIM 2: Backend Deployment (10 dakika)

**Backend'de 194 TypeScript Hatası Var:**
- Bunlar Income/Expense ile alakalı DEĞİL
- Pre-existing technical debt
- Orders.ts, ParasutService, notification.service vb.

**2 Seçenek:**

**A. Hataları Düzeltmeden Deploy (HIZLI):**
- Sadece accounting.ts ve ilgili dosyalar build olacak şekilde
- Veya mevcut production'a manuel patch

**B. Tüm Hataları Düzelt (DOĞRU AMA UZUN):**
- 193 hatayı düzelt (4-6 saat)
- Build
- Deploy

**Öneri:** A seçeneği - Income/Expense acil ihtiyaç

---

### ADIM 3: Backend Test (10 dakika)

Postman/curl ile endpoint testleri:

```bash
# 1. Gelir Ekle
curl -X POST https://canary-backend-672344972017.europe-west1.run.app/api/accounting/income \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test Gelir",
    "amount": 5000,
    "category": "Test",
    "date": "2025-10-20"
  }'

# 2. Gelirleri Listele
curl https://canary-backend-672344972017.europe-west1.run.app/api/accounting/incomes \
  -H "Authorization: Bearer TOKEN"

# 3. Giderleri Listele
curl https://canary-backend-672344972017.europe-west1.run.app/api/accounting/expenses \
  -H "Authorization: Bearer TOKEN"
```

---

### ADIM 4: Frontend UI (3 saat)

**Dosya:** `frontend/src/pages/Accounting.tsx`

**"Ön Muhasebe" Tab'ına Eklenecekler:**

1. **Income/Expense Toggle Tabs**
   - Gelirler / Giderler switch

2. **Add Modal (Income & Expense için ayrı)**
   - Description (required)
   - Amount (required)
   - Category (dropdown - required)
   - Date (date picker - required)
   - Payment Method (dropdown - optional)
   - Notes (textarea - optional)
   - Invoice Link (autocomplete - optional, sadece Income)

3. **Data Table**
   - Columns: Date, Description, Category, Amount, Payment Method, Status, Actions
   - Pagination
   - Filters: Category, Date Range, Status
   - Search: Description
   - Actions: Edit, Delete
   - Total Sum Footer

4. **Edit Modal**
   - Aynı form, pre-filled data

5. **Category Dropdowns**
   - Income Categories:
     - Equipment Rental
     - Service Fee
     - Product Sale
     - Consulting
     - Training
     - Other
   - Expense Categories:
     - Rent
     - Utilities
     - Salaries
     - Marketing
     - Equipment Purchase
     - Maintenance
     - Other

6. **Stats Cards (üstte)**
   - Total Income
   - Total Expense
   - Net Profit
   - This Month

**UI Wireframe:**
```
┌─────────────────────────────────────────────────────┐
│ Stats Cards                                         │
│ [Total Gelir] [Total Gider] [Net Kâr] [Bu Ay]      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ [Gelirler] [Giderler]  [+ Yeni Gelir] [Filtreler] │
├─────────────────────────────────────────────────────┤
│ Tarih      | Açıklama        | Kategori   | Tutar  │
│ 10.10.2025 | Ekipman Kiralama| Equipment  | 25,000 │
│ 11.10.2025 | Servis Ücreti   | Service    | 12,000 │
│ ...                                                 │
├─────────────────────────────────────────────────────┤
│ Toplam: 69,000 TL                      [1][2][3]   │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 COMPETITIVE ANALYSIS CONTEXT

**Paraşüt'te var:**
- Gelir/Gider yönetimi ✓
- Kategorilendirme ✓
- Ödeme yöntemleri ✓
- Rapor/Excel export

**Logo GO3'te var:**
- Gelir/Gider takibi ✓
- Kategori bazlı analiz ✓
- Bütçe karşılaştırması
- Otomatik hatırlatmalar

**Canary'de şu an:**
- ❌ Gelir/Gider CRUD yok
- ❌ Kategori takibi yok
- ✅ Fatura yönetimi var (Invoice)
- ✅ Ödeme takibi var (Payment)

**Bu implementasyon ile:**
- ✅ Temel Gelir/Gider CRUD
- ✅ Kategori bazlı takip
- ✅ Ödeme yöntemi takibi
- ✅ Fatura entegrasyonu (optional)

---

## 📊 ETKİ ANALİZİ

**Business Impact:**
- ⭐⭐⭐⭐⭐ YÜKSEK - Temel muhasebe özelliği
- Paraşüt ve Logo'nun temel özelliği
- Müşteri retention için kritik

**Teknik Complexity:**
- ⭐⭐☆☆☆ DÜŞÜK - Basit CRUD işlemleri
- Mevcut altyapı kullanılıyor
- 3-4 saat frontend çalışması

**User Value:**
- ⭐⭐⭐⭐⭐ ÇOK YÜKSEK
- Günlük kullanım
- Nakit akışı görünürlüğü
- Vergi raporlama kolaylığı

**Priority Score:** 95/100

---

## 🚀 DEPLOY PLANI

### Öneri Sıralama:

1. **Bugün (2 saat):**
   - ✅ Database oluştur (5 dk)
   - ✅ Backend deploy et (veya mevcut hataları fix et)
   - ✅ API test et (10 dk)

2. **Yarın (3 saat):**
   - Frontend UI geliştir
   - Test et
   - Deploy et

3. **İleri (1-2 hafta):**
   - Excel/PDF export ekle
   - Gelir-Gider grafikler ekle
   - Recurring income/expense ekle
   - Otomatik hatırlatmalar ekle

---

## ⚠️ BLOCKER: BACKEND ERRORS

**Mevcut Durum:**
- 194 TypeScript hatası
- Income/Expense kodları TAMAM
- Diğer dosyalardaki hatalar deploy'u engelliyor

**En Çok Hata Veren Dosyalar:**
1. src/routes/orders.ts - 58 hata
2. src/controllers/PaymentController.ts - 17 hata
3. src/services/invoice.service.ts - 13 hata
4. src/services/ReservationService.ts - 15 hata
5. src/services/notification.service.ts - 9 hata

**Hata Tipleri:**
- Missing Order fields: tags, documents, equipment, customer
- Missing auth export: authenticate
- Missing Prisma models: pushToken, notificationHistory, contract
- Type mismatches

**Çözüm Seçenekleri:**

**A. Kısa Vadeli (30 dk):**
```typescript
// tsconfig.json - broken files'ı exclude et
{
  "exclude": [
    "src/routes/orders.ts",
    "src/controllers/PaymentController.ts",
    // ...
  ]
}
```
- Sadece accounting.ts ve core files build olur
- Deploy edebiliriz
- Diğer features çalışmaz (geçici)

**B. Uzun Vadeli (4-6 saat):**
- Tüm 194 hatayı düzelt
- Schema'yı code ile senkronize et
- Temiz deploy

**Öneri:** A seçeneği şimdi, B seçeneği hafta sonu

---

## 📝 NOTLAR

1. **Income model invoiceId opsiyonel:**
   - Gelir mutlaka fatura ile bağlantılı olmayabilir
   - Nakit ödemeler fatura gerektirmez
   - İsteğe bağlı bağlama imkanı var

2. **Expense model zaten vardı:**
   - Sadece backend endpoints eklendi
   - Frontend UI eklenmişti

3. **Category sistemi basit:**
   - String field (dropdown'dan seçilecek)
   - İleri versiyonda Category tablosu olabilir

4. **Stats endpoint mevcut:**
   - `/api/accounting/stats` zaten var
   - Income/Expense toplamları frontend'de hesaplanabilir

5. **Gelecek geliştirmeler:**
   - Recurring transactions (sabit gelir/gider)
   - Budget tracking (bütçe takibi)
   - Auto-categorization (AI kategori önerisi)
   - Bank integration (banka hareketi sync)
   - Check/Promissory note tracking (çek/senet)

---

## ✅ SON DURUM

**Backend:** ✅ Hazır (accounting.ts - 270+ satır, 8 endpoint)  
**Database:** 🔄 SQL hazır, execute edilecek  
**Seed Data:** ✅ Hazır (5 income record)  
**Deploy:** ⏸️ Backend errors nedeniyle beklemede  
**Frontend:** ⏳ UI tasarımı yapılacak  

**Bir sonraki adım:** Database oluştur ve backend deploy et
