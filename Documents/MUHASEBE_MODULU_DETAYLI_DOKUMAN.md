# 📊 MUHASEBE MODÜLÜ - KAPSAMLI DÖKÜMAN

## 🎯 Genel Bakış
Canary Digital platformu için profesyonel muhasebe modülü. Logo, Paraşüt ve benzeri ERP sistemlerinden esinlenilerek KOBİ'ler için optimize edilmiş kapsamlı mali yönetim çözümü.

---

## 📑 ANA SEKMELER

### 1. 🏠 ÖZET / DASHBOARD
**Amaç:** Finansal durumun tek bakışta görünümü

**Bileşenler:**
- **Kart Metrikleri (4 adet)**
  - Toplam Gelir (Bu Ay / YTD)
  - Toplam Gider (Bu Ay / YTD)
  - Net Kar/Zarar (Bu Ay / YTD)
  - Nakit Akışı (Mevcut Durum)

- **Grafikler**
  - Gelir-Gider Trend Grafiği (Son 12 ay, çizgi grafik)
  - Kategori Bazlı Gider Dağılımı (Pasta grafik)
  - Aylık Kar/Zarar Grafiği (Bar chart)
  - Nakit Akış Projeksiyonu (Area chart)

- **Bildirimler**
  - Yaklaşan Ödemeler (7 gün içinde)
  - Geciken Tahsilatlar
  - Düşük Bakiye Uyarıları
  - Vade Tarihi Yaklaşan Çek/Senetler

**Backend Endpoint:** `GET /api/accounting/dashboard`

---

### 2. 💰 GELİRLER
**Amaç:** Tüm gelir kayıtlarının yönetimi

**Özellikler:**
- **Liste Görünümü**
  - Filtreleme: Tarih aralığı, kategori, durum, ödeme yöntemi
  - Sıralama: Tarih, tutar, kategori
  - Arama: Açıklama bazlı
  - Pagination: 10/25/50/100 kayıt
  
- **Tablo Kolonları**
  - Tarih
  - Açıklama
  - Kategori
  - Tutar (TL)
  - Ödeme Yöntemi
  - Durum (Alındı/Beklemede/İptal)
  - Fatura No (varsa)
  - İşlemler (Düzenle/Sil/PDF)

- **Gelir Kategorileri**
  - Ekipman Kiralama
  - Hizmet Bedeli
  - Ürün Satışı
  - Danışmanlık
  - Eğitim
  - Diğer

- **Gelir Ekleme/Düzenleme Modal**
  ```
  - Tarih (date picker)
  - Açıklama (textarea)
  - Kategori (dropdown)
  - Tutar (number input, TL)
  - Ödeme Yöntemi (Nakit/Banka/Kredi Kartı/Çek/Senet)
  - Durum (Alındı/Beklemede)
  - Fatura/Sipariş İlişkilendirme (optional)
  - Notlar (textarea)
  - Etiketler (multi-select)
  ```

**Backend Endpoints:**
- `GET /api/accounting/incomes` - Liste
- `POST /api/accounting/income` - Yeni kayıt
- `PUT /api/accounting/income/:id` - Güncelle
- `DELETE /api/accounting/income/:id` - Sil
- `GET /api/accounting/income/:id/pdf` - PDF export

---

### 3. 📉 GİDERLER
**Amaç:** Tüm gider kayıtlarının yönetimi

**Özellikler:**
- **Liste Görünümü** (Gelirler ile aynı yapı)
  
- **Tablo Kolonları**
  - Tarih
  - Açıklama
  - Kategori
  - Tutar (TL)
  - Ödeme Yöntemi
  - Durum (Ödendi/Beklemede/İptal)
  - Tedarikçi
  - İşlemler

- **Gider Kategorileri**
  - Personel Maaşları
  - Kira
  - Elektrik/Su/Doğalgaz
  - İnternet/Telefon
  - Malzeme Alımı
  - Ekipman Bakım/Onarım
  - Pazarlama/Reklam
  - Sigorta
  - Vergi/Harçlar
  - Yakıt
  - Seyahat/Konaklama
  - Yemek
  - Diğer

- **Gider Ekleme/Düzenleme Modal**
  ```
  - Tarih
  - Açıklama
  - Kategori
  - Tutar
  - Ödeme Yöntemi
  - Durum
  - Tedarikçi (dropdown)
  - Fatura No
  - KDV Oranı (0%, 1%, 8%, 10%, 20%)
  - Notlar
  - Etiketler
  - Makbuz/Fatura Upload
  ```

**Backend Endpoints:**
- `GET /api/accounting/expenses` - Liste
- `POST /api/accounting/expense` - Yeni kayıt
- `PUT /api/accounting/expense/:id` - Güncelle
- `DELETE /api/accounting/expense/:id` - Sil

---

### 4. 🏦 BANKA & KASA
**Amaç:** Nakit ve banka hesapları takibi

**Alt Sekmeler:**

#### 4.1 Banka Hesapları
- **Hesap Kartları**
  - Banka Adı
  - Hesap Türü (Vadesiz/Vadeli)
  - IBAN
  - Şube
  - Güncel Bakiye
  - Son Hareket Tarihi

- **Banka Hareketleri**
  - Tarih
  - Açıklama
  - Giriş/Çıkış
  - Bakiye
  - İşlem Türü (Havale/EFT/Çek/POS/Otomatik Ödeme)

#### 4.2 Kasa
- **Kasa Bakiyesi**
  - TL Bakiye
  - Döviz Bakiyeleri (USD, EUR)
  
- **Kasa Hareketleri**
  - Nakit Giriş/Çıkış
  - Açıklama
  - Kim tarafından (user tracking)

**Backend Endpoints:**
- `GET /api/accounting/banks` - Banka hesapları
- `GET /api/accounting/bank/:id/transactions` - Banka hareketleri
- `GET /api/accounting/cash` - Kasa özeti
- `POST /api/accounting/cash/transaction` - Kasa hareketi

---

### 5. 📝 ÇEK & SENET TAKİBİ
**Amaç:** Çek ve senet yönetimi (Kritik özellik!)

**Alt Sekmeler:**

#### 5.1 Alınan Çekler
- **Liste Görünümü**
  - Çek No
  - Keşideci (Müşteri)
  - Banka
  - Şube
  - Tutar
  - Vade Tarihi
  - Durum (Portföyde/Ciro/Tahsil/Karşılıksız/İade)
  - Kalan Gün (countdown)

- **Çek Ekleme Modal**
  ```
  - Çek No
  - Keşideci (Müşteri dropdown)
  - Banka
  - Şube
  - Hesap No
  - Tutar
  - Düzenleme Tarihi
  - Vade Tarihi
  - Durumu
  - Alındığı Sipariş/Fatura
  - Notlar
  ```

- **Çek İşlemleri**
  - Ciro Et (başka firmaya devret)
  - Bankaya Yatır
  - Karşılıksız İşaretle
  - PDF/Baskı

#### 5.2 Verilen Çekler
- Aynı yapı, Keşideci yerine "Lehtar"

#### 5.3 Alınan Senetler
- Çek ile benzer yapı
- Ek alanlar: Aval, Poliçe No

#### 5.4 Verilen Senetler
- Çek ile benzer yapı

**Raporlar:**
- Çek/Senet Yaşlandırma Raporu
- Vade Raporu (30/60/90 gün)
- Ciro Takip Raporu

**Backend Endpoints:**
- `GET /api/accounting/checks/received` - Alınan çekler
- `GET /api/accounting/checks/issued` - Verilen çekler
- `POST /api/accounting/check` - Çek ekle
- `PUT /api/accounting/check/:id/endorse` - Ciro
- `GET /api/accounting/promissory-notes/received` - Alınan senetler
- `GET /api/accounting/promissory-notes/issued` - Verilen senetler

---

### 6. 👥 CARİ HESAPLAR
**Amaç:** Müşteri/Tedarikçi borç-alacak takibi

**Özellikler:**

- **Cari Liste**
  - Cari Adı
  - Türü (Müşteri/Tedarikçi/Her İkisi)
  - Alacak Bakiyesi
  - Borç Bakiyesi
  - Net Durum
  - Risk Limiti
  - Son Hareket Tarihi

- **Cari Detay Sayfası**
  - Özet Bilgiler
  - Hareket Listesi (tüm işlemler)
  - Açık Faturalar
  - Ödeme Geçmişi
  - Çek/Senet Durumu
  - Ekstrelere Excel/PDF

- **Cari Kartı**
  ```
  - Firma Adı
  - Vergi No/TC No
  - Vergi Dairesi
  - Adres
  - Telefon/Email
  - Yetkili Kişi
  - Ödeme Vadesi (gün)
  - Risk Limiti
  - İskonto Oranı
  - Notlar
  ```

**Backend Endpoints:**
- `GET /api/accounting/accounts` - Cari liste
- `GET /api/accounting/account/:id` - Cari detay
- `GET /api/accounting/account/:id/statement` - Cari ekstre
- `POST /api/accounting/account` - Yeni cari
- `PUT /api/accounting/account/:id` - Güncelle

---

### 7. 📊 RAPORLAR
**Amaç:** Finansal raporlama ve analizler

**Rapor Türleri:**

#### 7.1 Kar-Zarar Tablosu
- Aylık/Yıllık
- Gelir kalemlerinin detayı
- Gider kalemlerinin detayı
- Net kar/zarar
- Grafik gösterim

#### 7.2 Nakit Akış Raporu
- Dönem bazlı nakit giriş/çıkış
- Kategori bazlı dağılım
- Projeksiyonlar

#### 7.3 Cari Ekstre
- Müşteri/Tedarikçi bazlı
- Tarih aralığı
- Bakiye hareketleri
- PDF/Excel export

#### 7.4 Gelir-Gider Analizi
- Kategori bazlı karşılaştırma
- Trend analizleri
- Aylık/Yıllık karşılaştırma

#### 7.5 KDV Raporu
- Hesaplanan KDV
- İndirilecek KDV
- Ödenecek KDV
- Dönemsel

#### 7.6 Çek/Senet Yaşlandırma
- Vade grupları (0-30, 31-60, 61-90, 90+)
- Risk analizi
- Tahsilat projeksiyonu

#### 7.7 Stok Değer Raporu
- Eldeki stok değeri
- Envanter raporu

**Rapor Özellikleri:**
- Tarih aralığı seçimi
- PDF/Excel/CSV export
- Email gönderimi
- Otomatik raporlama (planlama)
- Grafiksel gösterim

**Backend Endpoints:**
- `GET /api/accounting/reports/profit-loss` - Kar/Zarar
- `GET /api/accounting/reports/cash-flow` - Nakit Akış
- `GET /api/accounting/reports/statement` - Cari Ekstre
- `GET /api/accounting/reports/vat` - KDV Raporu
- `GET /api/accounting/reports/aging` - Yaşlandırma
- `POST /api/accounting/reports/schedule` - Rapor planla

---

### 8. ⚙️ AYARLAR
**Amaç:** Muhasebe modülü konfigürasyonu

**Alt Bölümler:**

#### 8.1 Genel Ayarlar
- Para Birimi (TL/USD/EUR)
- Dönem Başlangıcı (Mali Yıl)
- Vergi Dairesi Bilgileri
- Şirket Bilgileri

#### 8.2 Kategori Yönetimi
- Gelir Kategorileri (CRUD)
- Gider Kategorileri (CRUD)
- Renk kodları

#### 8.3 Etiket Yönetimi
- Etiket tanımlama
- Renk/İkon seçimi
- Etiket grupları

#### 8.4 Entegrasyonlar
- Paraşüt API
- Logo Entegrasyonu
- MT940 Banka Entegrasyonu
- e-Fatura/e-Arşiv
- e-Beyanname

#### 8.5 Bildirim Ayarları
- Vade tarihi bildirimleri (X gün önceden)
- Düşük bakiye uyarısı (eşik değer)
- Geciken ödeme bildirimleri
- Günlük/Haftalık özet rapor

#### 8.6 Yetkilendirme
- Kullanıcı rolleri
- Muhasebe modülü erişim kontrol
- İşlem onay mekanizması

**Backend Endpoints:**
- `GET /api/accounting/settings` - Ayarlar
- `PUT /api/accounting/settings` - Güncelle
- `GET /api/accounting/categories` - Kategori listesi
- `POST /api/accounting/category` - Kategori ekle

---

## 🎨 UI/UX ÖZELLİKLERİ

### Genel Tasarım Prensipler
1. **Renk Kodlama**
   - Gelir: Yeşil (#10B981)
   - Gider: Kırmızı (#EF4444)
   - Beklemede: Sarı (#F59E0B)
   - Tahsil Edildi: Mavi (#3B82F6)

2. **İkonlar**
   - Lucide React icon library
   - Her kategori için özel icon
   - Durum göstergeleri

3. **Responsive Tasarım**
   - Desktop: Full tablo görünümü
   - Tablet: Kart görünümü
   - Mobile: Liste görünümü + swipe actions

4. **Dark Mode Desteği**
   - Tüm bileşenler dark mode uyumlu
   - Tailwind CSS dark: prefix

### Interaktif Özellikler
- **Drag & Drop:** Dosya yükleme
- **Inline Editing:** Hızlı düzenleme
- **Bulk Actions:** Toplu işlemler
- **Quick Filters:** Hızlı filtreler
- **Export Options:** Birden fazla format
- **Auto-save:** Otomatik kayıt

---

## 🔔 BİLDİRİM SİSTEMİ

### Bildirim Türleri
1. **Vade Bildirimleri**
   - 7 gün önce
   - 3 gün önce
   - Vade günü
   - Vade geçmiş

2. **Ödeme Hatırlatıcıları**
   - Yaklaşan ödemeler
   - Geciken ödemeler
   - Planlanmış ödemeler

3. **Bakiye Uyarıları**
   - Düşük kasa bakiyesi
   - Düşük banka bakiyesi
   - Negatif bakiye

4. **Düzenli Raporlar**
   - Günlük özet (her sabah 09:00)
   - Haftalık rapor (Pazartesi)
   - Aylık kapanış raporu

### Bildirim Kanalları
- In-app notifications
- Email
- WhatsApp (entegrasyon mevcut)
- Push notification (mobil)

**Backend Endpoints:**
- `GET /api/accounting/notifications` - Bildirim listesi
- `PUT /api/accounting/notification/:id/read` - Okundu işaretle
- `POST /api/accounting/notification/settings` - Bildirim ayarları

---

## 📱 MOBİL UYUMLULUK

### Mobil Özel Özellikler
1. **Hızlı Gider Girişi**
   - Fotoğraf çek → OCR ile okut → Kaydet
   - Voice input desteği
   - GPS lokasyon kaydet

2. **QR Kod Okuyucu**
   - Fatura QR okuma
   - Ödeme QR'ları

3. **Offline Mod**
   - Offline veri girişi
   - Sync when online

4. **Bildirim Push**
   - Kritik bildirimlerde anlık push

---

## 🔐 GÜVENLİK & YETKİLENDİRME

### Rol Bazlı Erişim
1. **Muhasebe Admin**
   - Tüm yetkiler
   - Ayarlar yönetimi
   - Kullanıcı yönetimi

2. **Muhasebe Uzmanı**
   - Kayıt ekleme/düzenleme
   - Rapor görüntüleme
   - Export yapabilir

3. **Görüntüleyici**
   - Sadece raporları görür
   - Export yapamaz
   - Düzenleme yapamaz

### Audit Log
- Tüm işlemlerin kaydı
- Kim, ne zaman, ne yaptı
- Silinen kayıtların geri yüklenmesi

**Backend Endpoints:**
- `GET /api/accounting/audit-log` - İşlem geçmişi
- `POST /api/accounting/restore/:id` - Silinen kayıt geri yükle

---

## 🚀 GELECEK ÖZELLİKLER (ROADMAP)

### Faz 2
- [ ] Banka entegrasyonu (MT940)
- [ ] e-Fatura entegrasyonu
- [ ] e-Arşiv fatura
- [ ] Otomatik banka mutabakatı

### Faz 3
- [ ] Maliyet merkezi takibi
- [ ] Proje bazlı muhasebe
- [ ] Bütçe planlaması
- [ ] Bütçe vs gerçekleşen karşılaştırma

### Faz 4
- [ ] AI destekli harcama kategorilendirme
- [ ] Tahmine dayalı nakit akış analizi
- [ ] Anomali tespiti (olağan dışı harcamalar)
- [ ] Otomatik vergi hesaplama

### Faz 5
- [ ] Mali müşavir portalı
- [ ] e-Defter entegrasyonu
- [ ] e-Beyanname hazırlama
- [ ] SGK bildirge entegrasyonu

---

## 📊 BACKEND DATABASE SCHEMA

### Yeni Tablolar (Eklenmesi Gerekenler)

```prisma
// Income tablosu (✅ MEVCUT)
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
  
  @@index([companyId, category, date])
}

// Expense tablosu (✅ MEVCUT)
model Expense {
  id            Int       @id @default(autoincrement())
  companyId     Int
  description   String
  amount        Float
  category      String
  date          DateTime
  status        String    @default("paid")
  paymentMethod String?
  notes         String?
  receiptUrl    String?
  supplierId    Int?
  vatRate       Float?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  company       Company   @relation(fields: [companyId], references: [id])
  supplier      Supplier? @relation(fields: [supplierId], references: [id])
  
  @@index([companyId, category, date])
}

// ❌ EKLENMELI: Check (Çek)
model Check {
  id            Int      @id @default(autoincrement())
  companyId     Int
  checkNumber   String
  type          String   // "received" | "issued"
  drawer        String   // Keşideci (alınan çeklerde) veya Lehtar (verilen çeklerde)
  bank          String
  branch        String?
  accountNumber String?
  amount        Float
  issueDate     DateTime
  dueDate       DateTime
  status        String   // "portfolio" | "endorsed" | "collected" | "bounced" | "returned"
  customerId    Int?
  orderId       Int?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  company       Company  @relation(fields: [companyId], references: [id])
  customer      Customer? @relation(fields: [customerId], references: [id])
  order         Order?   @relation(fields: [orderId], references: [id])
  
  @@index([companyId, dueDate, status])
}

// ❌ EKLENMELI: PromissoryNote (Senet)
model PromissoryNote {
  id            Int      @id @default(autoincrement())
  companyId     Int
  noteNumber    String
  type          String   // "received" | "issued"
  drawer        String
  amount        Float
  issueDate     DateTime
  dueDate       DateTime
  status        String
  aval          String?  // Aval bilgisi
  customerId    Int?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  company       Company  @relation(fields: [companyId], references: [id])
  customer      Customer? @relation(fields: [customerId], references: [id])
  
  @@index([companyId, dueDate, status])
}

// ❌ EKLENMELI: BankAccount (Banka Hesabı)
model BankAccount {
  id            Int      @id @default(autoincrement())
  companyId     Int
  bankName      String
  accountType   String   // "checking" | "savings"
  iban          String
  branch        String?
  balance       Float    @default(0)
  currency      String   @default("TRY")
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  company       Company  @relation(fields: [companyId], references: [id])
  transactions  BankTransaction[]
  
  @@index([companyId, isActive])
}

// ❌ EKLENMELI: BankTransaction (Banka Hareketi)
model BankTransaction {
  id            Int          @id @default(autoincrement())
  accountId     Int
  type          String       // "deposit" | "withdrawal"
  amount        Float
  description   String
  transactionType String?    // "transfer" | "eft" | "check" | "pos" | "auto"
  balanceAfter  Float
  date          DateTime
  createdAt     DateTime     @default(now())
  
  account       BankAccount  @relation(fields: [accountId], references: [id])
  
  @@index([accountId, date])
}

// ❌ EKLENMELI: CashTransaction (Kasa Hareketi)
model CashTransaction {
  id            Int      @id @default(autoincrement())
  companyId     Int
  type          String   // "in" | "out"
  amount        Float
  description   String
  currency      String   @default("TRY")
  userId        Int?     // Kim gerçekleştirdi
  date          DateTime
  createdAt     DateTime @default(now())
  
  company       Company  @relation(fields: [companyId], references: [id])
  user          User?    @relation(fields: [userId], references: [id])
  
  @@index([companyId, date])
}

// ❌ EKLENMELI: AccountCategory (Kategori)
model AccountCategory {
  id            Int      @id @default(autoincrement())
  companyId     Int
  name          String
  type          String   // "income" | "expense"
  color         String?
  icon          String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  
  company       Company  @relation(fields: [companyId], references: [id])
  
  @@index([companyId, type])
}

// ❌ EKLENMELI: AccountingTag (Etiket)
model AccountingTag {
  id            Int      @id @default(autoincrement())
  companyId     Int
  name          String
  color         String?
  createdAt     DateTime @default(now())
  
  company       Company  @relation(fields: [companyId], references: [id])
  
  @@index([companyId])
}

// ❌ EKLENMELI: ReportSchedule (Otomatik Rapor)
model AccountingReportSchedule {
  id            Int      @id @default(autoincrement())
  companyId     Int
  reportType    String   // "profit-loss" | "cash-flow" | "statement"
  frequency     String   // "daily" | "weekly" | "monthly"
  recipients    String[] // Email adresleri
  isActive      Boolean  @default(true)
  lastRun       DateTime?
  nextRun       DateTime
  createdAt     DateTime @default(now())
  
  company       Company  @relation(fields: [companyId], references: [id])
  
  @@index([companyId, nextRun])
}
```

---

## 🛠️ TEKNİK STACK

### Frontend
- **Framework:** React + TypeScript
- **UI Library:** Tailwind CSS
- **Components:** Shadcn/ui
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Date Picker:** React Day Picker
- **Tables:** TanStack Table
- **Export:** xlsx, jsPDF

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT
- **Validation:** Zod
- **PDF:** PDFKit
- **Excel:** ExcelJS

---

## 📝 API ENDPOINT ÖZETİ

### Gelir/Gider
- `GET /api/accounting/incomes` - Gelir listesi
- `POST /api/accounting/income` - Gelir ekle
- `PUT /api/accounting/income/:id` - Gelir güncelle
- `DELETE /api/accounting/income/:id` - Gelir sil
- `GET /api/accounting/expenses` - Gider listesi
- `POST /api/accounting/expense` - Gider ekle
- `PUT /api/accounting/expense/:id` - Gider güncelle
- `DELETE /api/accounting/expense/:id` - Gider sil

### Çek/Senet
- `GET /api/accounting/checks` - Çek listesi
- `POST /api/accounting/check` - Çek ekle
- `PUT /api/accounting/check/:id/endorse` - Çek ciro
- `GET /api/accounting/promissory-notes` - Senet listesi
- `POST /api/accounting/promissory-note` - Senet ekle

### Banka/Kasa
- `GET /api/accounting/banks` - Banka hesapları
- `GET /api/accounting/bank/:id/transactions` - Banka hareketleri
- `GET /api/accounting/cash` - Kasa özeti
- `POST /api/accounting/cash/transaction` - Kasa hareketi

### Raporlar
- `GET /api/accounting/reports/dashboard` - Dashboard
- `GET /api/accounting/reports/profit-loss` - Kar/Zarar
- `GET /api/accounting/reports/cash-flow` - Nakit Akış
- `GET /api/accounting/reports/statement` - Cari Ekstre
- `GET /api/accounting/reports/vat` - KDV Raporu

### Ayarlar
- `GET /api/accounting/categories` - Kategori listesi
- `POST /api/accounting/category` - Kategori ekle
- `GET /api/accounting/tags` - Etiket listesi
- `POST /api/accounting/tag` - Etiket ekle

---

## 🎯 UYGULAMA PLANI

### PHASE 1: TEMELLERİ ATMAK (✅ Devam Ediyor)
**Süre:** 2 hafta
- [x] Income model & endpoints
- [x] Expense endpoints (mevcut)
- [ ] Dashboard API
- [ ] Frontend: Gelir-Gider listeleme
- [ ] Frontend: Gelir-Gider ekleme/düzenleme modals
- [ ] Frontend: Dashboard kartları ve grafikler

### PHASE 2: ÇEK/SENET & BANKA
**Süre:** 2 hafta
- [ ] Check model & endpoints
- [ ] PromissoryNote model & endpoints
- [ ] BankAccount model & endpoints
- [ ] Frontend: Çek/Senet listeleme
- [ ] Frontend: Banka hesapları
- [ ] Frontend: Vade takibi

### PHASE 3: RAPORLAMA
**Süre:** 2 hafta
- [ ] Kar/Zarar raporu
- [ ] Nakit akış raporu
- [ ] Cari ekstre
- [ ] PDF/Excel export
- [ ] Email gönderimi

### PHASE 4: GELİŞMİŞ ÖZELLİKLER
**Süre:** 2 hafta
- [ ] Otomatik bildirimler
- [ ] Kategori/Etiket yönetimi
- [ ] Toplu işlemler
- [ ] Mobil optimizasyon

### PHASE 5: ENTEGRASYONLAR
**Süre:** 3 hafta
- [ ] Paraşüt entegrasyonu
- [ ] e-Fatura entegrasyonu
- [ ] Banka MT940
- [ ] e-Beyanname

---

## 📚 KAYNAKLAR & REFERANSLAR

**Benchmark Sistemler:**
- Paraşüt (https://www.parasut.com)
- Logo Tiger (https://www.logo.com.tr)
- Mikro Yazılım (https://www.mikro.com.tr)
- Netsis (https://www.netsis.com.tr)

**Teknik Dokümantasyon:**
- Prisma Docs
- TanStack Table
- Recharts Examples
- Tailwind UI Components

---

## ✅ SONUÇ

Bu döküman, **kapsamlı bir muhasebe modülü** için gerekli tüm bileşenleri içermektedir:

✅ 8 ana sekme (Dashboard, Gelir, Gider, Banka/Kasa, Çek/Senet, Cari, Raporlar, Ayarlar)
✅ 40+ API endpoint
✅ 15+ veritabanı tablosu
✅ Mobil uyumlu tasarım
✅ 5 fazlı uygulama planı
✅ Güvenlik ve yetkilendirme

**Hedef:** KOBİ'ler için kullanımı kolay, güçlü ve entegre muhasebe çözümü! 🚀
