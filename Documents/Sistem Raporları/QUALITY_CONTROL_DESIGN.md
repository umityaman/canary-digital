# 🔍 Quality Control & Inspection System - Tasarım Dokümanı

**Tarih:** 10 Ekim 2025  
**Modül:** Quality Control & Inspection  
**Öncelik:** 🔴 CRITICAL  
**Hedef Süre:** 1 hafta

---

## 📊 BACKEND API ANALİZİ (Tamamlandı ✅)

### Mevcut API Endpoints
```
✅ GET    /api/equipment          - Ekipman listesi
✅ GET    /api/equipment/:id      - Tekil ekipman + rental history
✅ POST   /api/equipment          - Yeni ekipman ekle
✅ PUT    /api/equipment/:id      - Ekipman güncelle
✅ DELETE /api/equipment/:id      - Ekipman sil

✅ GET    /api/orders             - Sipariş listesi
✅ GET    /api/orders/:id         - Tekil sipariş
✅ POST   /api/orders             - Yeni sipariş
✅ PUT    /api/orders/:id         - Sipariş güncelle

✅ GET    /api/customers          - Müşteri listesi
✅ POST   /api/customers          - Yeni müşteri

✅ POST   /api/auth/login         - Giriş
✅ POST   /api/auth/register      - Kayıt
```

### Mevcut Database Schema
```prisma
✅ Company
✅ User
✅ Equipment
✅ Customer
✅ Order
✅ OrderItem
```

### Eksik API Endpoints (Eklenecek)
```
🆕 POST   /api/inspections               - Yeni kontrol kaydı
🆕 GET    /api/inspections               - Kontrol listesi
🆕 GET    /api/inspections/:id           - Tekil kontrol
🆕 GET    /api/inspections/order/:id     - Sipariş bazlı kontroller
🆕 PUT    /api/inspections/:id           - Kontrol güncelle

🆕 POST   /api/inspections/:id/photos    - Fotoğraf yükle
🆕 DELETE /api/inspections/:id/photos/:photoId - Fotoğraf sil

🆕 POST   /api/inspections/:id/signature - İmza ekle
🆕 GET    /api/inspections/:id/pdf       - PDF rapor indir
```

---

## 🗄️ DATABASE SCHEMA GÜNCELLEMESİ

### Yeni Tablolar (Prisma Schema)

```prisma
// ============================================
// INSPECTION (Kontrol/Muayene Kaydı)
// ============================================
model Inspection {
  id              Int              @id @default(autoincrement())
  inspectionType  String           // "CHECKOUT" (Teslim), "CHECKIN" (İade)
  
  // İlişkiler
  order           Order            @relation(fields: [orderId], references: [id])
  orderId         Int
  equipment       Equipment        @relation(fields: [equipmentId], references: [id])
  equipmentId     Int
  inspector       User             @relation(fields: [inspectorId], references: [id])
  inspectorId     Int
  customer        Customer         @relation(fields: [customerId], references: [id])
  customerId      Int
  
  // Kontrol Detayları
  status          String           // "PENDING", "APPROVED", "REJECTED", "DAMAGE_FOUND"
  overallCondition String?         // "EXCELLENT", "GOOD", "FAIR", "POOR"
  
  // Checklist (JSON olarak saklanacak)
  checklistData   String?          // JSON: [{item: "Lens temiz", checked: true, notes: ""}]
  
  // İmzalar
  customerSignature  String?       // Base64 imza
  inspectorSignature String?       // Base64 imza
  
  // Genel Notlar
  notes           String?
  location        String?          // Hangi şubede yapıldı
  
  // Timestamps
  inspectionDate  DateTime         @default(now())
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  // İlişkili Veriler
  photos          InspectionPhoto[]
  damageReports   DamageReport[]
}

// ============================================
// INSPECTION PHOTO (Kontrol Fotoğrafları)
// ============================================
model InspectionPhoto {
  id            Int        @id @default(autoincrement())
  inspection    Inspection @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  inspectionId  Int
  
  photoUrl      String     // S3/Cloud storage URL veya local path
  photoType     String     // "GENERAL", "DAMAGE", "SERIAL_NUMBER", "FULL_VIEW"
  caption       String?
  
  // Metadata
  fileSize      Int?       // bytes
  mimeType      String?    // "image/jpeg", "image/png"
  
  createdAt     DateTime   @default(now())
}

// ============================================
// DAMAGE REPORT (Hasar Raporu)
// ============================================
model DamageReport {
  id            Int        @id @default(autoincrement())
  inspection    Inspection @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  inspectionId  Int
  
  // Hasar Detayları
  damageType    String     // "SCRATCH", "DENT", "BROKEN", "MISSING_PART", "MALFUNCTION", "COSMETIC", "FUNCTIONAL"
  severity      String     // "MINOR", "MODERATE", "MAJOR", "CRITICAL"
  description   String
  location      String?    // Hasarın yeri (ör: "Lens üzerinde")
  
  // Mali Bilgiler
  estimatedCost Float?
  actualCost    Float?
  
  // Sorumluluk
  responsibleParty String  // "CUSTOMER", "COMPANY", "THIRD_PARTY", "UNKNOWN"
  
  // Durum
  status        String     @default("REPORTED") // "REPORTED", "ASSESSED", "REPAIRED", "WRITTEN_OFF"
  
  // Fotoğraflar
  photoUrl      String?    // Ana hasar fotoğrafı
  
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

// ============================================
// CHECKLIST TEMPLATE (Kontrol Listesi Şablonları)
// ============================================
model ChecklistTemplate {
  id            Int        @id @default(autoincrement())
  name          String     // "Kamera Kontrol", "Lens Kontrol", "Lighting Kit"
  category      String?    // Ekipman kategorisi
  
  // Template Items (JSON)
  items         String     // JSON: [{id: 1, label: "Lens temiz mi?", required: true, type: "boolean"}]
  
  isActive      Boolean    @default(true)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
```

### İlişki Güncellemeleri (Mevcut Modellere Eklenecek)

```prisma
// Equipment modeline ekle
model Equipment {
  // ... mevcut alanlar
  inspections   Inspection[]
}

// Order modeline ekle
model Order {
  // ... mevcut alanlar
  inspections   Inspection[]
}

// Customer modeline ekle
model Customer {
  // ... mevcut alanlar
  inspections   Inspection[]
}

// User modeline ekle
model User {
  // ... mevcut alanlar
  inspections   Inspection[]
}
```

---

## 🎨 FRONTEND TASARIM (Wireframe)

### 1. Ana Sayfa: Inspection Listesi (`/inspection`)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Kontrol & Muayene                        [+ Yeni Kontrol]│
├─────────────────────────────────────────────────────────────┤
│  🔍 Ara...  | 📅 Tarih: [Son 30 gün ▼] | 🏷️ Tip: [Tümü ▼]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │ 📦 #INS-001 | Teslim (Checkout)    🟢 Onaylandı   │      │
│  │ Sony A7 III + 24-70mm Lens                        │      │
│  │ 👤 Ahmet Yılmaz | 📅 10 Eki 2025 14:30           │      │
│  │ 👨‍🔧 Ali Veli (Teknisyen)                          │      │
│  │ [📄 PDF] [👁️ Detay] [✏️ Düzenle]                  │      │
│  └───────────────────────────────────────────────────┘      │
│                                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │ 📦 #INS-002 | İade (Checkin)     🔴 Hasar Var     │      │
│  │ Canon EOS R5                                       │      │
│  │ 👤 Mehmet Demir | 📅 09 Eki 2025 16:45           │      │
│  │ 💰 Hasar Bedeli: ₺2,500                           │      │
│  │ [📄 PDF] [👁️ Detay] [✏️ Düzenle]                  │      │
│  └───────────────────────────────────────────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Yeni Kontrol Sayfası: Adım 1 - Genel Bilgiler

```
┌─────────────────────────────────────────────────────────────┐
│  ← Geri                 🔍 Yeni Kontrol                      │
├─────────────────────────────────────────────────────────────┤
│  Adım 1/4: Genel Bilgiler                                    │
│  ●━━━○━━━○━━━○                                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Kontrol Tipi *                                              │
│  ○ Teslim (Checkout) - Müşteriye teslim öncesi              │
│  ● İade (Checkin) - Müşteriden iade sonrası                 │
│                                                               │
│  Sipariş No *                                                │
│  [#ORD-12345         ▼]  → Otomatik: Müşteri, Ekipman      │
│                                                               │
│  📦 Ekipman: Sony A7 III + 24-70mm Lens                     │
│  👤 Müşteri: Ahmet Yılmaz (ahmet@example.com)               │
│  📅 Kiralama: 08-15 Eki 2025                                 │
│                                                               │
│  Kontrol Yapan *                                             │
│  [Ali Veli (Teknisyen) ▼]                                   │
│                                                               │
│  Konum                                                        │
│  [İstanbul - Merkez Şube ▼]                                 │
│                                                               │
│                                    [İptal] [Sonraki Adım →] │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Yeni Kontrol Sayfası: Adım 2 - Kontrol Listesi

```
┌─────────────────────────────────────────────────────────────┐
│  ← Geri                 🔍 Yeni Kontrol                      │
├─────────────────────────────────────────────────────────────┤
│  Adım 2/4: Kontrol Listesi                                   │
│  ●━━━●━━━○━━━○                                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ Kamera Gövdesi                                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ☑ Fiziksel hasar yok                                 │    │
│  │ ☑ Ekran çalışıyor                                    │    │
│  │ ☑ Tuşlar çalışıyor                                   │    │
│  │ ☑ Pil yuvası temiz                                   │    │
│  │ ☐ Hafıza kartı yuvası temiz                          │    │
│  │   📝 Not: [Hafif toz var]                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ✅ Lens                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ☑ Camlar temiz                                       │    │
│  │ ☑ Focus ring sorunsuz                                │    │
│  │ ☑ Zoom ring sorunsuz                                 │    │
│  │ ☐ Lens kapağı mevcut                                 │    │
│  │   🚨 Lens kapağı eksik!                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [+ Yeni Kategori Ekle]                                      │
│                                                               │
│  Genel Durum Değerlendirmesi                                 │
│  ● Mükemmel  ○ İyi  ○ Orta  ○ Kötü                          │
│                                                               │
│                              [← Geri] [Sonraki Adım →]       │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Yeni Kontrol Sayfası: Adım 3 - Fotoğraflar & Hasar

```
┌─────────────────────────────────────────────────────────────┐
│  ← Geri                 🔍 Yeni Kontrol                      │
├─────────────────────────────────────────────────────────────┤
│  Adım 3/4: Fotoğraflar & Hasar Kaydı                         │
│  ●━━━●━━━●━━━○                                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📸 Genel Fotoğraflar                                        │
│  ┌──────────┬──────────┬──────────┬──────────┐              │
│  │ [+ Ekle] │  [IMG1]  │  [IMG2]  │  [IMG3]  │              │
│  │          │   ✕      │   ✕      │   ✕      │              │
│  └──────────┴──────────┴──────────┴──────────┘              │
│                                                               │
│  🚨 Hasar Kaydı                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Hasar #1                                  [🗑️ Sil]  │    │
│  │ ─────────────────────────────────────────────────   │    │
│  │ Tip: [Çizik ▼]       Seviye: [Hafif ▼]             │    │
│  │ Konum: [Lens üzerinde, 2cm çizik]                   │    │
│  │ Açıklama: [Lens yüzeyinde sağ üst köşede çizik]    │    │
│  │ Tahmini Maliyet: [₺500]                              │    │
│  │ Sorumlu: ● Müşteri ○ Şirket ○ 3. Taraf ○ Belirsiz  │    │
│  │ 📷 [Hasar Fotoğrafı]                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [+ Yeni Hasar Ekle]                                         │
│                                                               │
│  💰 Toplam Tahmini Hasar Bedeli: ₺500                       │
│                                                               │
│                              [← Geri] [Sonraki Adım →]       │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Yeni Kontrol Sayfası: Adım 4 - İmzalar & Onay

```
┌─────────────────────────────────────────────────────────────┐
│  ← Geri                 🔍 Yeni Kontrol                      │
├─────────────────────────────────────────────────────────────┤
│  Adım 4/4: İmzalar & Onay                                    │
│  ●━━━●━━━●━━━●                                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✍️ Müşteri İmzası *                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │           [İmza çizim alanı]                         │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│  [🗑️ Temizle] [📱 Tablet'ten İmzala]                        │
│                                                               │
│  ☑ Ekipmanın durumunu gördüm ve onaylıyorum                 │
│  ☑ Hasar bedelini kabul ediyorum (₺500)                     │
│                                                               │
│  ✍️ Teknisyen İmzası *                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │           [İmza çizim alanı]                         │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│  [🗑️ Temizle]                                                │
│                                                               │
│  📝 Ek Notlar                                                │
│  [Ekipman genel olarak iyi durumda. Lens kapağı            │
│   müşteriden talep edilecek.]                                │
│                                                               │
│  📧 Müşteriye PDF Gönder: ☑ Email  ☑ SMS                    │
│                                                               │
│                    [← Geri] [💾 Kaydet ve Onayla]           │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Kontrol Detay Sayfası (Görüntüleme)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Listey e Dön        📋 Kontrol Detayı    [📄 PDF İndir]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┬─────────────────────────────────────┐  │
│  │ #INS-001        │  Durum: 🟢 Onaylandı               │  │
│  │ İade (Checkin)  │  📅 10 Eki 2025, 14:30             │  │
│  └─────────────────┴─────────────────────────────────────┘  │
│                                                               │
│  📦 Ekipman Bilgileri                                        │
│  ─────────────────────────────────────────────────────────  │
│  Ekipman: Sony A7 III + 24-70mm Lens (#SN12345)            │
│  Sipariş: #ORD-12345 (08-15 Eki 2025)                       │
│  Müşteri: Ahmet Yılmaz (ahmet@example.com, 0555 123 4567)  │
│  Teknisyen: Ali Veli                                         │
│  Konum: İstanbul - Merkez Şube                              │
│                                                               │
│  ✅ Kontrol Listesi (12/13 Tamamlandı)                      │
│  ─────────────────────────────────────────────────────────  │
│  Kamera Gövdesi: ✅ ✅ ✅ ✅                                 │
│  Lens: ✅ ✅ ✅ ❌ (Lens kapağı eksik)                       │
│  Aksesuarlar: ✅ ✅                                          │
│  Genel Durum: İyi                                            │
│                                                               │
│  📸 Fotoğraflar (5)                                          │
│  ─────────────────────────────────────────────────────────  │
│  [IMG1] [IMG2] [IMG3] [IMG4] [IMG5]                         │
│                                                               │
│  🚨 Hasar Raporları (1)                                      │
│  ─────────────────────────────────────────────────────────  │
│  ┌───────────────────────────────────────────────────┐      │
│  │ Çizik - Hafif | Lens üzerinde | ₺500             │      │
│  │ Sorumlu: Müşteri | [Hasar Fotoğrafı]             │      │
│  └───────────────────────────────────────────────────┘      │
│  💰 Toplam Hasar Bedeli: ₺500                               │
│                                                               │
│  ✍️ İmzalar                                                  │
│  ─────────────────────────────────────────────────────────  │
│  Müşteri: [İmza] | Teknisyen: [İmza]                        │
│                                                               │
│  📝 Notlar                                                   │
│  ─────────────────────────────────────────────────────────  │
│  Ekipman genel olarak iyi durumda...                        │
│                                                               │
│                                      [✏️ Düzenle] [🗑️ Sil]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 COMPONENT YAPISI (Frontend)

```
src/pages/
  Inspection.tsx          → Ana liste sayfası
  InspectionCreate.tsx    → Yeni kontrol (4 adımlı wizard)
  InspectionDetail.tsx    → Kontrol detay görüntüleme

src/components/inspection/
  InspectionList.tsx      → Liste component'i
  InspectionCard.tsx      → Tek kontrol kartı
  InspectionFilters.tsx   → Filtreleme sidebar
  
  InspectionForm/
    Step1_GeneralInfo.tsx    → Adım 1: Genel bilgiler
    Step2_Checklist.tsx      → Adım 2: Kontrol listesi
    Step3_PhotosDamage.tsx   → Adım 3: Fotoğraflar & hasar
    Step4_Signatures.tsx     → Adım 4: İmzalar
    
  InspectionChecklist.tsx    → Checklist component'i
  ChecklistItem.tsx          → Tek checklist item
  
  DamageReport.tsx           → Hasar raporu component'i
  DamageForm.tsx             → Hasar ekleme formu
  
  PhotoUpload.tsx            → Fotoğraf yükleme
  PhotoGallery.tsx           → Fotoğraf galeri
  
  SignatureCanvas.tsx        → İmza çizim alanı
  
  InspectionPDFPreview.tsx   → PDF önizleme

src/stores/
  inspectionStore.ts      → Zustand store (CRUD işlemleri)

src/services/
  inspectionApi.ts        → API calls
```

---

## 🔄 STATE MANAGEMENT (Zustand Store)

```typescript
// src/stores/inspectionStore.ts

interface InspectionStore {
  // State
  inspections: Inspection[]
  selectedInspection: Inspection | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchInspections: (filters?: InspectionFilters) => Promise<void>
  getInspection: (id: number) => Promise<Inspection>
  createInspection: (data: CreateInspectionDto) => Promise<Inspection>
  updateInspection: (id: number, data: UpdateInspectionDto) => Promise<Inspection>
  deleteInspection: (id: number) => Promise<void>
  
  // Photo actions
  uploadPhoto: (inspectionId: number, file: File) => Promise<InspectionPhoto>
  deletePhoto: (photoId: number) => Promise<void>
  
  // Signature actions
  saveSignature: (inspectionId: number, signatureData: string, type: 'customer' | 'inspector') => Promise<void>
  
  // PDF actions
  generatePDF: (inspectionId: number) => Promise<Blob>
  
  // Damage report actions
  addDamageReport: (inspectionId: number, damage: DamageReportDto) => Promise<DamageReport>
  updateDamageReport: (damageId: number, data: Partial<DamageReportDto>) => Promise<DamageReport>
  deleteDamageReport: (damageId: number) => Promise<void>
}
```

---

## 📋 TYPESCRIPT INTERFACES

```typescript
// src/types/inspection.ts

export interface Inspection {
  id: number
  inspectionType: 'CHECKOUT' | 'CHECKIN'
  
  orderId: number
  equipmentId: number
  inspectorId: number
  customerId: number
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DAMAGE_FOUND'
  overallCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  
  checklistData: ChecklistItem[]
  
  customerSignature?: string
  inspectorSignature?: string
  
  notes?: string
  location?: string
  
  inspectionDate: Date
  createdAt: Date
  updatedAt: Date
  
  // Relations
  order?: Order
  equipment?: Equipment
  inspector?: User
  customer?: Customer
  photos: InspectionPhoto[]
  damageReports: DamageReport[]
}

export interface ChecklistItem {
  id: string
  category: string
  label: string
  checked: boolean
  required: boolean
  notes?: string
}

export interface InspectionPhoto {
  id: number
  inspectionId: number
  photoUrl: string
  photoType: 'GENERAL' | 'DAMAGE' | 'SERIAL_NUMBER' | 'FULL_VIEW'
  caption?: string
  fileSize?: number
  mimeType?: string
  createdAt: Date
}

export interface DamageReport {
  id: number
  inspectionId: number
  damageType: 'SCRATCH' | 'DENT' | 'BROKEN' | 'MISSING_PART' | 'MALFUNCTION' | 'COSMETIC' | 'FUNCTIONAL'
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL'
  description: string
  location?: string
  estimatedCost?: number
  actualCost?: number
  responsibleParty: 'CUSTOMER' | 'COMPANY' | 'THIRD_PARTY' | 'UNKNOWN'
  status: 'REPORTED' | 'ASSESSED' | 'REPAIRED' | 'WRITTEN_OFF'
  photoUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChecklistTemplate {
  id: number
  name: string
  category?: string
  items: ChecklistTemplateItem[]
  isActive: boolean
}

export interface ChecklistTemplateItem {
  id: string
  label: string
  required: boolean
  type: 'boolean' | 'text' | 'number' | 'rating'
  order: number
}

export interface InspectionFilters {
  search?: string
  inspectionType?: 'CHECKOUT' | 'CHECKIN' | 'ALL'
  status?: string
  dateFrom?: Date
  dateTo?: Date
  equipmentId?: number
  customerId?: number
}

export interface CreateInspectionDto {
  inspectionType: 'CHECKOUT' | 'CHECKIN'
  orderId: number
  equipmentId: number
  inspectorId: number
  customerId: number
  checklistData: ChecklistItem[]
  notes?: string
  location?: string
}

export interface UpdateInspectionDto {
  status?: string
  overallCondition?: string
  checklistData?: ChecklistItem[]
  customerSignature?: string
  inspectorSignature?: string
  notes?: string
}

export interface DamageReportDto {
  damageType: string
  severity: string
  description: string
  location?: string
  estimatedCost?: number
  responsibleParty: string
  photoUrl?: string
}
```

---

## 🚀 IMPLEMENTASYONSONRAKİ ADIMLAR

### Bugün (10 Ekim)
1. ✅ Backend API analizi (Tamamlandı)
2. ✅ Tasarım dokümanı (Tamamlandı)
3. 🔄 Database schema güncellemesi (Şimdi yapılacak)

### Yarın (11 Ekim)
1. Backend route'ları oluştur (`/api/inspections`)
2. Frontend component yapısı kur
3. Zustand store oluştur
4. Adım 1-2 implementasyonu

### Önümüzdeki Hafta
- Pazartesi-Salı: Photo upload & damage report
- Çarşamba: Signature canvas & PDF generation
- Perşembe: Testing & bug fixes
- Cuma: Production ready & dokümantasyon

---

**Durum:** ✅ Tasarım tamamlandı  
**Sonraki:** Database schema güncellemesi  
**Hazırlayan:** GitHub Copilot
