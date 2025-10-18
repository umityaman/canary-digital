# 🎯 CANARY DIGITAL - MASTER PLAN
**Tarih:** 17 Ekim 2025  
**Hazırlayan:** GitHub Copilot + User Collaboration  
**Durum:** Onay Bekleniyor ⏳

---

## 📊 MEVCUT DURUM ÖZET

### ✅ Tamamlanan Infrastructure (17 Ekim 2025)
- ✅ GCP Cloud Run Deployment (Backend + Frontend)
- ✅ CI/CD Pipeline (GitHub Actions - 3 workflows)
- ✅ PostgreSQL Database (Cloud SQL)
- ✅ Database Schema & Seed (14 tables, admin user)
- ✅ Production URLs Live & Tested
- ✅ Authentication System Working
- ✅ 9 Core Modules Fully Functional

### ⚠️ Yarım Kalan Modüller
- 10 modül UI var ama backend eksik/minimal
- Notification system backend %80, UI %20
- Reporting system backend %20, UI %40
- Document management backend %0, UI %50
- Accounting backend %60, UI %60

### 📈 Completion Status
**Overall:** %85-90 Complete  
**Backend:** %88 Complete  
**Frontend:** %82 Complete  
**Infrastructure:** %95 Complete

---

## 🗓️ 90-DAY MASTER PLAN

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIMELINE OVERVIEW                             │
├─────────────────────────────────────────────────────────────────┤
│ Week 1-2:  Testing, Notifications, Reporting (Quick Wins)       │
│ Week 3-4:  Document Management, Accounting Expansion            │
│ Week 5-8:  Mobile PWA, Social Media, CMS                        │
│ Week 9-12: AI Features, Multi-location, Advanced Features       │
└─────────────────────────────────────────────────────────────────┘
```

---

# 📅 PHASE 1: QUICK WINS & STABILIZATION
**Duration:** Week 1-2 (10 working days)  
**Goal:** Test production, complete high-impact features  
**Team Size:** 1-2 developers

---

## 🔴 WEEK 1: TESTING & CORE IMPROVEMENTS

### DAY 1-2: Production Testing & Bug Fixes 🚨
**Priority:** CRITICAL  
**Effort:** 12-16 hours  
**Assignee:** Full Stack Developer

#### Tasks Breakdown:
**Day 1 Morning (4 hours):**
- [ ] **Frontend Flow Testing**
  - [ ] Login/Register flow (admin@canary.com / admin123)
  - [ ] Dashboard loading (charts, stats, widgets)
  - [ ] Equipment list & detail pages
  - [ ] Order creation flow (baştan sona)
  - [ ] Customer management CRUD
  - [ ] Profile & settings pages
  - [ ] Calendar view & event creation
  - [ ] Technical service module

**Day 1 Afternoon (4 hours):**
- [ ] **Backend API Testing via Swagger**
  - [ ] Open: https://canary-backend-672344972017.europe-west1.run.app/api-docs
  - [ ] Test all auth endpoints (login, register, refresh, 2FA)
  - [ ] Test equipment endpoints (CRUD, search, filter)
  - [ ] Test order endpoints (create, update, status changes)
  - [ ] Test customer endpoints
  - [ ] Test calendar endpoints (Google sync test)
  - [ ] Test invoice endpoints (PDF generation)
  - [ ] Test payment endpoints (iyzico test mode)
  - [ ] Test notification endpoints

**Day 2 Morning (4 hours):**
- [ ] **Performance & Security Testing**
  - [ ] API response times (should be <500ms)
  - [ ] Database query optimization check
  - [ ] N+1 query detection
  - [ ] CORS configuration test
  - [ ] JWT token expiration test
  - [ ] File upload limits test
  - [ ] Rate limiting test (if exists)
  - [ ] SQL injection attempts (security)

**Day 2 Afternoon (4 hours):**
- [ ] **Mobile Responsive Testing**
  - [ ] iPhone 13/14 view
  - [ ] iPad view
  - [ ] Android phone view
  - [ ] Tablet landscape view
  - [ ] Touch interactions
  - [ ] Modal/dropdown behavior on mobile
  - [ ] Navigation menu mobile
  - [ ] Table scroll behavior

**Bug Fix Session (4 hours buffer):**
- [ ] Document all bugs in GitHub Issues
- [ ] Prioritize: Critical, High, Medium, Low
- [ ] Fix critical bugs immediately
- [ ] Create fix branch: `hotfix/production-bugs`
- [ ] Test fixes locally
- [ ] Deploy via GitHub Actions
- [ ] Verify in production

**Deliverables:**
- ✅ Bug report document
- ✅ All critical bugs fixed
- ✅ Performance optimization applied
- ✅ Mobile responsive issues resolved

---

### DAY 3-4: Notification System UI Completion 🔔
**Priority:** HIGH  
**Effort:** 12-14 hours  
**Assignee:** Frontend Developer  
**Backend Status:** %80 Ready (20 endpoints exist!)

#### Current Backend (Already Working):
```typescript
✅ POST   /api/notifications/send
✅ GET    /api/notifications
✅ GET    /api/notifications/:id
✅ PATCH  /api/notifications/:id/read
✅ PATCH  /api/notifications/mark-all-read
✅ DELETE /api/notifications/:id
✅ GET    /api/notifications/unread-count
✅ POST   /api/notifications/preferences
✅ GET    /api/notifications/preferences
✅ POST   /api/push/subscribe
✅ POST   /api/push/send
```

#### Day 3 Tasks (6-7 hours):
**Component 1: Notification Bell (2 hours)**
```typescript
// File: frontend/src/components/NotificationBell.tsx
- [ ] Create NotificationBell component
  - [ ] Bell icon with badge (unread count)
  - [ ] Animated bell shake on new notification
  - [ ] Dropdown trigger on click
  - [ ] Real-time updates (polling or websocket)
  - [ ] Sound notification (optional)

Tech: React, Lucide icons, Tailwind CSS
API: GET /api/notifications/unread-count (every 30s)
```

**Component 2: Notification Dropdown (3 hours)**
```typescript
// File: frontend/src/components/NotificationDropdown.tsx
- [ ] Notification list in dropdown
  - [ ] Group by: Today, Yesterday, This Week, Older
  - [ ] Show max 10, "View All" button
  - [ ] Mark as read on click
  - [ ] "Mark all as read" button
  - [ ] Empty state design
  - [ ] Loading skeleton

Tech: React, Framer Motion (animations)
API: GET /api/notifications?limit=10&unread=true
```

**Component 3: Integration (1 hour)**
```typescript
// File: frontend/src/layouts/DashboardLayout.tsx
- [ ] Add NotificationBell to header
- [ ] Position: Right side, before profile menu
- [ ] Responsive: Hide text on mobile, show only icon
- [ ] Z-index fix for dropdown
```

#### Day 4 Tasks (6-7 hours):
**Page 1: Notification Center (3 hours)**
```typescript
// File: frontend/src/pages/Notifications.tsx
- [ ] Full notification list page
  - [ ] Filters: All, Unread, Read, Type (info, warning, error, success)
  - [ ] Date range filter
  - [ ] Pagination (50 per page)
  - [ ] Bulk actions (mark as read, delete)
  - [ ] Search functionality
  - [ ] Notification detail modal

Layout: Table view + Card view toggle
```

**Page 2: Notification Settings (3 hours)**
```typescript
// File: frontend/src/pages/NotificationSettings.tsx
- [ ] Notification preferences
  - [ ] Email notifications (on/off per type)
  - [ ] Push notifications (on/off per type)
  - [ ] SMS notifications (on/off per type)
  - [ ] WhatsApp notifications (on/off per type)
  - [ ] Notification schedule (9AM-6PM, Always, Never)
  - [ ] Do Not Disturb mode
  - [ ] Test notification button

API: GET/POST /api/notifications/preferences
```

**Feature: Push Notifications (1 hour)**
```typescript
// File: frontend/src/services/pushNotifications.ts
- [ ] Request browser permission
- [ ] Register service worker
- [ ] Subscribe to push notifications
- [ ] Handle incoming push messages
- [ ] Show browser notifications

Tech: Service Worker API, Push API
API: POST /api/push/subscribe
```

**Deliverables:**
- ✅ NotificationBell component integrated
- ✅ NotificationDropdown working
- ✅ Full Notification Center page
- ✅ Notification Settings page
- ✅ Push notifications enabled (browser)
- ✅ Real-time notification updates

---

### DAY 5-7: Reporting & Analytics Dashboard 📊
**Priority:** CRITICAL  
**Effort:** 18-20 hours  
**Assignee:** Full Stack Developer  
**Backend Status:** %20 Ready (need to expand)

#### Current Backend (Existing):
```typescript
✅ GET /api/dashboard/stats
✅ GET /api/dashboard/revenue
✅ GET /api/analytics/revenue
✅ GET /api/analytics/utilization
✅ GET /api/analytics/top-equipment
```

#### Day 5 Tasks - Backend Expansion (6-7 hours):
**New Routes File:** `backend/src/routes/reports.ts`

```typescript
- [ ] Revenue Report Endpoint (2 hours)
POST /api/reports/revenue
Body: { startDate, endDate, groupBy: 'day|week|month|year' }
Response: 
{
  total: 125000,
  period: 'monthly',
  data: [
    { date: '2025-01', revenue: 45000, cost: 20000, profit: 25000, margin: 55.5 },
    { date: '2025-02', revenue: 50000, cost: 22000, profit: 28000, margin: 56.0 },
  ],
  comparison: {
    previousPeriod: 115000,
    change: +8.7,
    changeType: 'increase'
  }
}

Database Queries:
- Sum of invoice amounts (paid)
- Sum of expenses (if exists)
- Profit calculation
- Previous period comparison

- [ ] Equipment Utilization Report (2 hours)
GET /api/reports/equipment-utilization?startDate=X&endDate=Y
Response:
{
  overall: 68.5, // percentage
  byEquipment: [
    { 
      id: 1, 
      name: 'Camera Sony A7III', 
      totalDays: 90, 
      rentedDays: 75, 
      utilization: 83.3,
      revenue: 45000 
    },
  ],
  byCategory: [
    { category: 'Camera', utilization: 80.2, count: 5 },
  ],
  lowUtilization: [...], // <50% utilization
  highUtilization: [...] // >80% utilization
}

Calculation:
- Count total days in period
- Count rented days per equipment
- Calculate percentage
- Group by category

- [ ] Customer Segmentation Report (1.5 hours)
GET /api/reports/customer-segments
Response:
{
  vip: { count: 15, totalRevenue: 250000, avgOrderValue: 16666 },
  regular: { count: 45, totalRevenue: 180000, avgOrderValue: 4000 },
  new: { count: 30, totalRevenue: 25000, avgOrderValue: 833 },
  inactive: { count: 20, lastOrder: '2024-01-15' }
}

Segmentation Logic:
- VIP: Total spent > 100,000 TL
- Regular: Order count >= 5
- New: First order < 3 months ago
- Inactive: Last order > 6 months ago

- [ ] Seasonal Trends Report (1 hour)
GET /api/reports/seasonal
Response:
{
  monthly: [
    { month: 'January', orders: 25, revenue: 45000, avgOrderValue: 1800 },
    ...
  ],
  busySeason: 'June-September',
  slowSeason: 'December-February',
  forecast: {
    nextMonth: 52000,
    confidence: 0.85
  }
}

- [ ] Export Functionality (1.5 hours)
POST /api/reports/export
Body: { reportType: 'revenue|utilization|customers', format: 'pdf|excel|csv', ...filters }
Response: File download

Libraries:
- PDF: pdfkit (already used for invoices)
- Excel: exceljs
- CSV: csv-writer

npm install exceljs csv-writer
```

#### Day 6-7 Tasks - Frontend Dashboard (12-13 hours):

**Page Structure:** `frontend/src/pages/Reports.tsx`

```typescript
Layout:
┌─────────────────────────────────────────────────────────┐
│  [Reports Header]  [Date Range Picker]  [Export Btns]  │
├─────────────────────────────────────────────────────────┤
│  Tabs: Revenue | Utilization | Customers | Seasonal    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Tab Content with Charts & Tables]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Day 6 Morning (4 hours) - Chart Components:**
```typescript
- [ ] Install charting library
npm install recharts

- [ ] RevenueChart component (Line + Bar combo)
  - X-axis: Time periods
  - Y-axis: Revenue (TL)
  - Lines: Revenue, Profit
  - Bars: Costs
  - Tooltip with details
  - Responsive design

- [ ] UtilizationPieChart component
  - Donut chart
  - By equipment categories
  - Color coded
  - Click to drill down

- [ ] CustomerSegmentBarChart component
  - Grouped bar chart
  - VIP, Regular, New, Inactive
  - Count vs Revenue
```

**Day 6 Afternoon (4 hours) - Tab Panels:**
```typescript
- [ ] Revenue Tab
  - Summary cards (Total, Profit, Margin, Change%)
  - Line chart (revenue over time)
  - Comparison period selector
  - Top products table
  - Export button (PDF, Excel, CSV)

- [ ] Utilization Tab
  - Overall utilization gauge
  - Pie chart by category
  - Equipment utilization table (sortable)
  - Low utilization alerts
  - Recommendations
```

**Day 7 Morning (4 hours) - Remaining Tabs:**
```typescript
- [ ] Customers Tab
  - Segment cards (VIP, Regular, New)
  - Customer list table
  - Lifetime value chart
  - RFM analysis (Recency, Frequency, Monetary)
  - Top customers ranking

- [ ] Seasonal Tab
  - Monthly revenue bar chart
  - Order volume line chart
  - Busy/slow season indicators
  - Year-over-year comparison
  - Forecast projection
```

**Day 7 Afternoon (4-5 hours) - Polish & Features:**
```typescript
- [ ] Date range picker component
  - Presets: Today, Last 7 days, Last 30 days, This month, Last month, Custom
  - Calendar UI (react-datepicker)
  - Apply button

- [ ] Export functionality
  - Export modal with format selection
  - Loading state during export
  - Download trigger
  - Success toast

- [ ] Filters panel
  - Sidebar with advanced filters
  - Equipment category filter
  - Customer segment filter
  - Status filter
  - Apply/Reset buttons

- [ ] Responsive design
  - Stack charts vertically on mobile
  - Horizontal scroll for tables
  - Collapsible filters on mobile

- [ ] Loading states & empty states
  - Skeleton loaders for charts
  - "No data" messages
  - Retry button on error
```

**Libraries to Install:**
```bash
cd frontend
npm install recharts react-datepicker exceljs file-saver
npm install -D @types/react-datepicker
```

**Deliverables:**
- ✅ 4 new backend report endpoints
- ✅ Export functionality (PDF, Excel, CSV)
- ✅ Complete Reports page with 4 tabs
- ✅ 6+ chart components
- ✅ Date range filtering
- ✅ Responsive design
- ✅ Export buttons working

---

## 🟡 WEEK 2: DOCUMENT MANAGEMENT & POLISH

### DAY 8-10: Document Management Module 📄
**Priority:** HIGH  
**Effort:** 18-20 hours  
**Assignee:** Full Stack Developer  
**Backend Status:** %0 (start from scratch)

#### Day 8 Tasks - Database & Backend (6-7 hours):

**Step 1: Prisma Schema (1 hour)**
```prisma
// File: backend/prisma/schema.prisma

model Document {
  id          Int      @id @default(autoincrement())
  companyId   Int
  company     Company  @relation(fields: [companyId], references: [id])
  
  // Document Info
  title       String
  description String?
  type        DocumentType
  category    DocumentCategory?
  
  // File Info
  fileName    String
  fileSize    Int      // bytes
  mimeType    String
  fileUrl     String   // Cloud Storage URL
  thumbnailUrl String?
  
  // Metadata
  templateId  Int?
  template    DocumentTemplate? @relation(fields: [templateId], references: [id])
  version     Int      @default(1)
  
  // Relations
  customerId  Int?
  customer    Customer? @relation(fields: [customerId], references: [id])
  orderId     Int?
  order       Order?    @relation(fields: [orderId], references: [id])
  equipmentId Int?
  equipment   Equipment? @relation(fields: [equipmentId], references: [id])
  
  // Status & Security
  status      DocumentStatus @default(DRAFT)
  isPublic    Boolean   @default(false)
  tags        String[]  // Array of tags
  
  // Signatures (for contracts)
  signedByCustomer Boolean @default(false)
  signedByCompany  Boolean @default(false)
  signedAt         DateTime?
  
  // Timestamps
  createdBy   Int
  creator     User     @relation("DocumentCreator", fields: [createdBy], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([companyId, type])
  @@index([customerId])
  @@index([orderId])
}

model DocumentTemplate {
  id          Int      @id @default(autoincrement())
  companyId   Int
  company     Company  @relation(fields: [companyId], references: [id])
  
  name        String
  description String?
  type        DocumentType
  content     String   @db.Text // HTML template
  variables   Json     // Template variables definition
  
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)
  
  documents   Document[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([companyId, type])
}

enum DocumentType {
  CONTRACT          // Kiralama Sözleşmesi
  INVOICE           // Fatura (already exists, link)
  DELIVERY_FORM     // Teslim Tutanağı
  RETURN_FORM       // İade Tutanağı
  DAMAGE_REPORT     // Hasar Raporu
  INSURANCE_POLICY  // Sigorta Poliçesi
  QUOTATION         // Teklif
  RECEIPT           // Makbuz
  OTHER             // Diğer
}

enum DocumentCategory {
  FINANCIAL
  LEGAL
  OPERATIONAL
  ADMINISTRATIVE
}

enum DocumentStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  SIGNED
  ARCHIVED
  CANCELLED
}
```

**Step 2: Migration (10 minutes)**
```bash
cd backend
npx prisma migrate dev --name add_document_management
npx prisma generate
```

**Step 3: Backend Routes (4-5 hours)**
```typescript
// File: backend/src/routes/documents.ts

- [ ] Document CRUD Endpoints (2 hours)
POST   /api/documents              - Create document
GET    /api/documents              - List documents (with filters)
GET    /api/documents/:id          - Get document detail
PATCH  /api/documents/:id          - Update document
DELETE /api/documents/:id          - Delete document
POST   /api/documents/:id/sign     - Sign document

Filters: type, status, customerId, orderId, dateRange, tags

- [ ] File Upload (1.5 hours)
POST   /api/documents/upload        - Upload file
  - Use multer for file handling
  - Upload to local storage or cloud (GCP Storage)
  - Generate thumbnail for PDFs
  - Virus scan (optional)
  - Size limit: 10MB

Libraries:
npm install multer @google-cloud/storage sharp pdf-thumbnail

- [ ] Template Management (1.5 hours)
GET    /api/documents/templates           - List templates
GET    /api/documents/templates/:id       - Get template
POST   /api/documents/templates           - Create template
PUT    /api/documents/templates/:id       - Update template
DELETE /api/documents/templates/:id       - Delete template
POST   /api/documents/generate/:templateId - Generate document from template

Template Engine: Handlebars or EJS
Variables: {{customerName}}, {{orderDate}}, {{equipmentList}}, etc.

- [ ] Document Generation (1 hour)
POST   /api/documents/generate-pdf
  - HTML to PDF conversion
  - Use existing PDFKit or Puppeteer
  - Custom styling
  - Watermark support
```

**Step 4: Cloud Storage Setup (1 hour)**
```typescript
// File: backend/src/services/storageService.ts

- [ ] GCP Storage Bucket setup
  - Create bucket: canary-documents
  - Public/private files separation
  - Signed URLs for private documents
  - Automatic cleanup for old files

- [ ] Storage service methods
  - uploadFile(file, folder)
  - downloadFile(fileUrl)
  - deleteFile(fileUrl)
  - generateSignedUrl(fileUrl, expiry)
```

#### Day 9-10 Tasks - Frontend (12-13 hours):

**Page Structure:** `frontend/src/pages/Documents.tsx`

```typescript
Layout:
┌─────────────────────────────────────────────────────────┐
│  [Documents Header]  [Upload Btn]  [New Document Btn]  │
├─────────────────────────────────────────────────────────┤
│  Sidebar Filters    │    Document Grid/List View       │
│  - Type             │    ┌─────┐ ┌─────┐ ┌─────┐      │
│  - Status           │    │ Doc │ │ Doc │ │ Doc │      │
│  - Date Range       │    └─────┘ └─────┘ └─────┘      │
│  - Tags             │                                   │
│  - Customer         │    [Pagination]                   │
└─────────────────────────────────────────────────────────┘
```

**Day 9 Morning (4 hours) - Document List:**
```typescript
- [ ] Documents page layout
  - [ ] Header with actions
  - [ ] Sidebar filters panel
  - [ ] Grid/List view toggle
  - [ ] Sort dropdown (date, name, type)
  - [ ] Search bar

- [ ] Document card component
  - [ ] Thumbnail preview
  - [ ] Document title & type badge
  - [ ] File size & date
  - [ ] Quick actions (view, download, delete)
  - [ ] Status indicator

- [ ] Document table view (alternative)
  - [ ] Columns: Thumbnail, Name, Type, Status, Date, Size, Actions
  - [ ] Sortable columns
  - [ ] Row selection for bulk actions
```

**Day 9 Afternoon (4 hours) - Upload & Create:**
```typescript
- [ ] File upload modal
  - [ ] Drag & drop zone
  - [ ] File browser button
  - [ ] Multiple file support
  - [ ] Upload progress bars
  - [ ] File type validation
  - [ ] Size validation
  - [ ] Preview before upload

- [ ] Create document form
  - [ ] Document type selector
  - [ ] Title & description fields
  - [ ] Template selector (if type supports)
  - [ ] Related entity selector (customer, order, equipment)
  - [ ] Tags input (creatable)
  - [ ] Status selector
  - [ ] Public/private toggle
  - [ ] Upload or generate option

Libraries:
npm install react-dropzone react-select react-tagsinput
```

**Day 10 Morning (4 hours) - Viewer & Editor:**
```typescript
- [ ] Document viewer modal
  - [ ] PDF viewer (react-pdf or iframe)
  - [ ] Image viewer (zoom, pan)
  - [ ] Document info sidebar
  - [ ] Download button
  - [ ] Print button
  - [ ] Share button (generate link)
  - [ ] Delete button (with confirmation)
  - [ ] Edit button (opens editor)

- [ ] Document editor (simple)
  - [ ] Rename title
  - [ ] Edit description
  - [ ] Change status
  - [ ] Add/remove tags
  - [ ] Change related entities
  - [ ] Replace file

Libraries:
npm install react-pdf @react-pdf-viewer/core
```

**Day 10 Afternoon (4-5 hours) - Templates & Generation:**
```typescript
- [ ] Template management page
  - [ ] Template list table
  - [ ] Create template button
  - [ ] Edit template modal
  - [ ] Delete template (with confirmation)
  - [ ] Set as default toggle

- [ ] Template editor
  - [ ] Rich text editor (TinyMCE or Quill)
  - [ ] Variable inserter dropdown
  - [ ] Preview panel
  - [ ] HTML source view
  - [ ] Save button

- [ ] Document generation wizard
  - [ ] Step 1: Select template
  - [ ] Step 2: Fill variables (form)
  - [ ] Step 3: Preview document
  - [ ] Step 4: Generate & save
  - [ ] Option: Generate PDF immediately

- [ ] Digital signature (simple version)
  - [ ] Signature pad (canvas)
  - [ ] Type signature option
  - [ ] Upload signature image
  - [ ] Save & apply to document

Libraries:
npm install react-quill signature_pad
```

**Deliverables:**
- ✅ Document model & templates in database
- ✅ File upload system (GCP Storage)
- ✅ Document CRUD endpoints
- ✅ Template management system
- ✅ Document generation from templates
- ✅ Complete Documents page (grid/list view)
- ✅ Document viewer & editor
- ✅ Template management UI
- ✅ PDF generation working
- ✅ Digital signature basic support

---

## 📊 WEEK 1-2 SUMMARY

### Deliverables Checklist:
- ✅ Production fully tested (16 hours)
- ✅ All critical bugs fixed
- ✅ Notification system complete (14 hours)
- ✅ Reporting dashboard complete (20 hours)
- ✅ Document management module complete (20 hours)

### Total Effort: 70 hours (~2 weeks for 1 developer)

### Metrics:
- **Completion:** 88% → 92% (+4%)
- **New Features:** 3 major modules completed
- **Bug Fixes:** All critical bugs resolved
- **Performance:** Optimized, <500ms API responses

---

# 📅 PHASE 2: MODULE EXPANSION
**Duration:** Week 3-4 (10 working days)  
**Goal:** Complete half-finished modules  
**Team Size:** 1-2 developers

---

## 🟠 WEEK 3: ACCOUNTING & PAYMENTS

### DAY 11-13: Accounting Module Expansion 💰
**Priority:** HIGH  
**Effort:** 18-20 hours  
**Current:** %60 complete (Invoice system exists)  
**Goal:** Add expense tracking, bank accounts, financial reports

#### Day 11 - Expense Management Backend (6-7 hours):

**Database Schema Addition:**
```prisma
// File: backend/prisma/schema.prisma

model Expense {
  id          Int      @id @default(autoincrement())
  companyId   Int
  company     Company  @relation(fields: [companyId], references: [id])
  
  // Expense Info
  title       String
  description String?
  amount      Float
  currency    String   @default("TRY")
  category    ExpenseCategory
  
  // Payment Info
  paymentMethod PaymentMethod
  paymentDate   DateTime
  receiptUrl    String?
  
  // Relations
  supplierId  Int?
  supplier    Supplier? @relation(fields: [supplierId], references: [id])
  projectId   Int?      // Optional: link to order/project
  
  // Tax & Accounting
  taxAmount   Float?
  taxRate     Float?    // %
  isTaxDeductible Boolean @default(true)
  accountCode String?   // Muhasebe hesap kodu
  
  // Status
  status      ExpenseStatus @default(PENDING)
  approvedBy  Int?
  approver    User?     @relation("ExpenseApprover", fields: [approvedBy], references: [id])
  approvedAt  DateTime?
  
  // Metadata
  tags        String[]
  attachments String[]  // Multiple receipt images
  
  createdBy   Int
  creator     User      @relation("ExpenseCreator", fields: [createdBy], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([companyId, paymentDate])
  @@index([category])
}

model BankAccount {
  id          Int      @id @default(autoincrement())
  companyId   Int
  company     Company  @relation(fields: [companyId], references: [id])
  
  accountName String
  bankName    String
  accountNumber String
  iban        String?
  currency    String   @default("TRY")
  
  balance     Float    @default(0)
  
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)
  
  transactions BankTransaction[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([companyId])
}

model BankTransaction {
  id            Int      @id @default(autoincrement())
  bankAccountId Int
  bankAccount   BankAccount @relation(fields: [bankAccountId], references: [id])
  
  type          TransactionType
  amount        Float
  balance       Float    // Balance after transaction
  
  description   String
  reference     String?  // Check number, transfer reference, etc.
  
  relatedEntityType String?  // 'invoice', 'expense', 'order'
  relatedEntityId   Int?
  
  transactionDate DateTime
  
  createdAt     DateTime @default(now())
  
  @@index([bankAccountId, transactionDate])
}

enum ExpenseCategory {
  SALARY           // Maaş
  RENT             // Kira
  UTILITIES        // Elektrik, Su, İnternet
  MAINTENANCE      // Bakım Onarım
  MARKETING        // Reklam
  SUPPLIES         // Malzeme
  INSURANCE        // Sigorta
  TAX              // Vergi
  TRANSPORTATION   // Ulaşım
  PROFESSIONAL_FEES // Danışmanlık, Avukat
  EQUIPMENT_PURCHASE // Ekipman Alımı
  DEPRECIATION     // Amortisman
  OTHER
}

enum ExpenseStatus {
  PENDING
  APPROVED
  REJECTED
  PAID
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  CREDIT_CARD
  CHECK
  OTHER
}

enum TransactionType {
  DEPOSIT   // Para girişi
  WITHDRAWAL // Para çıkışı
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_accounting_expansion
```

**Backend Routes:**
```typescript
// File: backend/src/routes/accounting.ts

- [ ] Expense Routes (2 hours)
POST   /api/accounting/expenses           - Create expense
GET    /api/accounting/expenses           - List expenses (filters: category, dateRange, status)
GET    /api/accounting/expenses/:id       - Get expense detail
PUT    /api/accounting/expenses/:id       - Update expense
DELETE /api/accounting/expenses/:id       - Delete expense
POST   /api/accounting/expenses/:id/approve - Approve expense
POST   /api/accounting/expenses/:id/reject  - Reject expense
POST   /api/accounting/expenses/upload-receipt - Upload receipt image

- [ ] Bank Account Routes (1.5 hours)
POST   /api/accounting/bank-accounts      - Create bank account
GET    /api/accounting/bank-accounts      - List bank accounts
GET    /api/accounting/bank-accounts/:id  - Get account detail & transactions
PUT    /api/accounting/bank-accounts/:id  - Update account
DELETE /api/accounting/bank-accounts/:id  - Delete account (if no transactions)
POST   /api/accounting/bank-accounts/:id/transaction - Add manual transaction

- [ ] Financial Reports (2.5 hours)
GET    /api/accounting/reports/income-statement - Gelir Tablosu (Revenue - Expenses)
  Response: {
    period: { start, end },
    revenue: { total, byCategory: [...] },
    expenses: { total, byCategory: [...] },
    netIncome: revenue - expenses,
    profitMargin: (netIncome / revenue) * 100
  }

GET    /api/accounting/reports/cash-flow - Nakit Akışı
  Response: {
    period: { start, end },
    openingBalance: 50000,
    inflows: { invoices: 120000, deposits: 5000, total: 125000 },
    outflows: { expenses: 80000, withdrawals: 10000, total: 90000 },
    closingBalance: 85000
  }

GET    /api/accounting/reports/balance-sheet - Bilanço (simplified)
  Response: {
    assets: {
      cash: 85000,
      accountsReceivable: 25000, // Unpaid invoices
      equipment: 150000,
      total: 260000
    },
    liabilities: {
      accountsPayable: 15000, // Unpaid expenses
      loans: 50000,
      total: 65000
    },
    equity: 195000 // assets - liabilities
  }

GET    /api/accounting/reports/tax-summary - Vergi Özeti
  Response: {
    period: { start, end },
    totalRevenue: 500000,
    taxableIncome: 450000,
    taxRate: 20,
    taxAmount: 90000,
    expenseDeductions: 50000
  }
```

#### Day 12 - Accounting Frontend Pages (6-7 hours):

```typescript
// File: frontend/src/pages/Accounting.tsx

Layout:
┌─────────────────────────────────────────────────────────┐
│  [Accounting Header]  [Date Range]  [Export Buttons]   │
├─────────────────────────────────────────────────────────┤
│  Tabs: Dashboard | Invoices | Expenses | Bank Accounts │
│        | Reports | Settings                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Tab Content]                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘

- [ ] Dashboard Tab (2 hours)
  - Summary cards: Total Revenue, Total Expenses, Net Income, Profit Margin
  - Quick stats: Pending invoices, Unpaid expenses
  - Recent transactions timeline
  - Cash flow mini chart

- [ ] Expenses Tab (2 hours)
  - Expense list table (sortable, filterable)
  - Create expense button → modal form
  - Expense detail modal (view, edit, approve/reject)
  - Bulk actions (approve multiple, export)
  - Category filter, status filter
  - Receipt upload & viewer

- [ ] Bank Accounts Tab (2 hours)
  - Bank account cards (balance, account number)
  - Add account button → modal form
  - Account detail view
  - Transaction history table
  - Add transaction button (deposit/withdrawal)
  - Transfer between accounts (future)
```

#### Day 13 - Financial Reports Frontend (6 hours):

```typescript
- [ ] Reports Tab (6 hours)
  - Sub-tabs: Income Statement | Cash Flow | Balance Sheet | Tax Summary
  
  - [ ] Income Statement (1.5 hours)
    - Revenue breakdown (by category, by month)
    - Expense breakdown (by category)
    - Net income calculation
    - Waterfall chart (revenue → expenses → net income)
    - Comparison with previous period
  
  - [ ] Cash Flow Report (1.5 hours)
    - Opening & closing balance cards
    - Inflows vs Outflows chart
    - Cash flow timeline (daily/weekly/monthly)
    - Forecast projection (simple linear)
  
  - [ ] Balance Sheet (1.5 hours)
    - Assets section (Cash, AR, Equipment)
    - Liabilities section (AP, Loans)
    - Equity calculation
    - Pie charts for asset/liability distribution
  
  - [ ] Tax Summary (1.5 hours)
    - Taxable income calculation
    - Tax amount owed
    - Deductible expenses list
    - Tax payment tracker
    - Export for accountant
```

**Libraries:**
```bash
npm install recharts date-fns currency.js
```

**Deliverables:**
- ✅ Expense management complete (CRUD, approval)
- ✅ Bank account system
- ✅ Financial reports (4 types)
- ✅ Receipt upload system
- ✅ Tax calculation tools
- ✅ Export functionality

---

### DAY 14-15: Payment System Enhancement 💳
**Priority:** MEDIUM  
**Effort:** 12-14 hours  
**Current:** %80 complete (iyzico test mode exists)  
**Goal:** Add recurring payments, installments, refunds UI

#### Tasks Overview:

**Backend (6-7 hours):**
```typescript
- [ ] Recurring Payment Setup (2 hours)
POST /api/payment/subscription/create
  - Save card for future payments
  - Create subscription record
  - Schedule automatic charges (cron job)

- [ ] Installment Plans (2 hours)
GET  /api/payment/installments?amount=X
  - Query iyzico for available installments
  - Show interest rates
  - Calculate total cost per plan

POST /api/payment/installments
  - Process installment payment
  - Track installment schedule

- [ ] Refund Management (2 hours)
POST /api/payment/refund/:paymentId
  - Full or partial refund
  - Refund to original payment method
  - Update invoice status
  - Send notification

- [ ] Payment Analytics (1 hour)
GET  /api/payment/analytics
  - Success/failure rates
  - Average transaction value
  - Payment method distribution
  - Revenue by payment type
```

**Frontend (6-7 hours):**
```typescript
- [ ] Payment Flow UI Improvement (2 hours)
  - Multi-step payment wizard
  - Card form with validation
  - 3D Secure integration
  - Loading states & animations

- [ ] Installment Selector (1.5 hours)
  - Radio group with installment options
  - Show interest calculation
  - Total cost breakdown

- [ ] Recurring Payment Settings (1.5 hours)
  - Saved cards management
  - Subscription list
  - Cancel subscription button
  - Next payment date display

- [ ] Refund Management UI (2 hours)
  - Refund request form
  - Partial refund amount input
  - Refund reason selector
  - Refund history table
  - Status tracking
```

**Deliverables:**
- ✅ Recurring payments setup
- ✅ Installment plans working
- ✅ Refund system complete
- ✅ Payment analytics dashboard
- ✅ Enhanced payment UI

---

## 🔵 WEEK 4: MOBILE & UX POLISH

### DAY 16-20: Progressive Web App (PWA) 📱
**Priority:** HIGH  
**Effort:** 30-35 hours  
**Current:** %30 (basic React setup)  
**Goal:** Installable PWA with offline support

#### Day 16-17 - PWA Core Setup (12-14 hours):

**Service Worker Configuration (3 hours):**
```typescript
// File: frontend/public/service-worker.js

- [ ] Create service worker
  - Cache strategy: Network first, fallback to cache
  - Cache static assets (JS, CSS, images)
  - Cache API responses (short TTL)
  - Background sync for offline actions
  - Push notification handling

- [ ] Register service worker
// File: frontend/src/serviceWorkerRegistration.ts
  - Register on app load
  - Update check on navigation
  - Prompt user for update

- [ ] Workbox setup (easier alternative)
npm install -D workbox-webpack-plugin
  - Precaching
  - Runtime caching
  - Navigation preload
```

**Manifest & Icons (2 hours):**
```json
// File: frontend/public/manifest.json

- [ ] Create manifest.json
{
  "name": "Canary Digital - Equipment Rental",
  "short_name": "Canary",
  "description": "Equipment rental management system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [...]
}

- [ ] Generate icons (all sizes)
  - Use https://realfavicongenerator.net/
  - Or PWA Asset Generator: npm install -g pwa-asset-generator
  
- [ ] Add to HTML head
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3b82f6">
<link rel="apple-touch-icon" href="/icon-192.png">
```

**Offline Support (4-5 hours):**
```typescript
- [ ] Offline detection
  - Show offline banner when no connection
  - Queue actions when offline
  - Sync when back online

- [ ] Offline pages
  - Cached homepage
  - Cached dashboard
  - "You're offline" page for uncached routes

- [ ] Background sync
  - Queue POST requests (create order, etc.)
  - Retry when online
  - Show sync status

Libraries:
npm install workbox-window workbox-precaching workbox-routing
```

**Install Prompt (2-3 hours):**
```typescript
// File: frontend/src/components/InstallPrompt.tsx

- [ ] PWA install prompt
  - Detect if app is installable
  - Show custom install button
  - Handle beforeinstallprompt event
  - Show success message after install
  - Hide if already installed
  
- [ ] iOS install instructions
  - Detect Safari on iOS
  - Show "Add to Home Screen" instructions modal
  - Screenshots of steps
```

#### Day 18-19 - Mobile Optimization (12-14 hours):

**Responsive UI Fixes (6-7 hours):**
```typescript
- [ ] Navigation improvements
  - Bottom navigation bar for mobile
  - Drawer menu for tablets
  - Sticky header on scroll

- [ ] Touch interactions
  - Swipe gestures (swipe to delete, etc.)
  - Pull to refresh
  - Long press context menus
  - Touch-friendly buttons (min 44x44px)

- [ ] Mobile forms
  - Better input types (tel, email, number)
  - Date pickers mobile-friendly
  - Auto-focus on form open
  - Keyboard handling

- [ ] Tables on mobile
  - Card view for tables
  - Horizontal scroll with indicators
  - Expandable rows
  - Sticky columns

- [ ] Modals on mobile
  - Full-screen modals
  - Bottom sheets (slide up)
  - Swipe to close
```

**Camera & QR Scanner (3-4 hours):**
```typescript
// File: frontend/src/components/QRScanner.tsx

- [ ] Camera access
  - Request camera permission
  - Front/back camera toggle
  - Flashlight toggle

- [ ] QR code scanning
  - Real-time scanning
  - Scan result parsing
  - Redirect to equipment page

Libraries:
npm install html5-qrcode react-webcam

- [ ] Photo upload
  - Camera capture for damage reports
  - Photo compression before upload
  - Multiple photos selection
  - Photo preview & edit

Libraries:
npm install browser-image-compression
```

**Performance Optimization (3 hours):**
```typescript
- [ ] Code splitting
  - Lazy load routes
  - Lazy load heavy components
  - Dynamic imports

- [ ] Image optimization
  - WebP format with fallback
  - Lazy loading images
  - Placeholder blur effect
  - Responsive images (srcset)

- [ ] Bundle optimization
  - Analyze bundle size: npm run build -- --stats
  - Tree shaking
  - Remove unused dependencies
  - Minification

- [ ] Lighthouse audit
  - Target: 90+ score
  - Fix accessibility issues
  - Fix SEO issues
  - Fix performance issues
```

#### Day 20 - Push Notifications (6-7 hours):

**Backend Push Setup (3 hours):**
```typescript
// File: backend/src/services/pushService.ts

- [ ] Web Push setup
npm install web-push

- [ ] Generate VAPID keys
npx web-push generate-vapid-keys
  - Save in .env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

- [ ] Push subscription endpoint (already exists!)
POST /api/push/subscribe
  - Save subscription to database
  - Link to user

- [ ] Send push notification
POST /api/push/send
  - Send to specific user
  - Send to all users (broadcast)
  - Custom title, body, icon, badge
  - Click action URL
```

**Frontend Push (3-4 hours):**
```typescript
// File: frontend/src/services/pushNotifications.ts

- [ ] Request permission
  - Show permission prompt
  - Handle granted/denied
  - Save preference

- [ ] Subscribe to push
  - Get service worker registration
  - Subscribe with VAPID public key
  - Send subscription to backend

- [ ] Handle notifications
// File: frontend/public/service-worker.js
  - Listen for push events
  - Show notification
  - Handle notification click
  - Open app to specific page

- [ ] Notification preferences
  - Enable/disable per notification type
  - Test notification button
  - Unsubscribe option
```

**Deliverables:**
- ✅ PWA installable on mobile & desktop
- ✅ Service worker with offline support
- ✅ Manifest with proper icons
- ✅ Install prompt working
- ✅ Mobile-optimized UI
- ✅ Camera & QR scanner working
- ✅ Push notifications working
- ✅ Performance score 90+

---

## 📊 WEEK 3-4 SUMMARY

### Deliverables Checklist:
- ✅ Accounting module expanded (18 hours)
- ✅ Payment system enhanced (14 hours)
- ✅ PWA fully functional (35 hours)

### Total Effort: 67 hours (~2 weeks for 1 developer)

### Metrics:
- **Completion:** 92% → 96% (+4%)
- **Mobile Support:** 30% → 95%
- **PWA Features:** Complete
- **Financial Management:** Complete

---

# 📅 PHASE 3: ADVANCED FEATURES
**Duration:** Week 5-8 (20 working days)  
**Goal:** New modules (Social, CMS, AI)  
**Team Size:** 1-2 developers

## 🟢 WEEK 5-6: SOCIAL MEDIA & CMS

### Social Media Module (10-12 hours)
- Post scheduling
- Multi-platform posting (Instagram, Facebook, Twitter)
- Content calendar
- Media library
- Analytics dashboard

### CMS Module (8-10 hours)
- Page management
- Blog/News system
- Gallery
- SEO settings
- Menu builder

---

## 🟣 WEEK 7-8: AI & AUTOMATION

### AI Chatbot (12-15 hours)
- OpenAI API integration
- Customer support bot
- FAQ automation
- Booking assistant

### Demand Forecasting (10-12 hours)
- Historical data analysis
- ML model training
- Equipment demand prediction
- Dynamic pricing

---

# 📅 PHASE 4: ENTERPRISE FEATURES
**Duration:** Week 9-12 (20 working days)  
**Goal:** Multi-location, advanced reporting  
**Team Size:** 2 developers

## Multi-Location Support (15-20 hours)
- Branch management
- Inter-branch transfers
- Branch-based reporting
- Location inventory tracking

## Advanced Analytics (10-15 hours)
- Custom report builder
- KPI tracking
- Goal setting
- Performance dashboards

---

# 📊 RESOURCE PLAN

## Team Structure Options:

### Option 1: Solo Developer (Conservative)
- **Timeline:** 12 weeks
- **Hours/Week:** 35-40
- **Total:** ~450 hours
- **Completion:** Week 12

### Option 2: 2 Developers (Recommended)
- **Timeline:** 6-8 weeks
- **Hours/Week:** 70-80 (combined)
- **Total:** ~450 hours
- **Completion:** Week 8

### Option 3: Team of 3 (Aggressive)
- **Timeline:** 4-6 weeks
- **Hours/Week:** 105-120 (combined)
- **Total:** ~450 hours
- **Completion:** Week 6

---

# 💰 COST ESTIMATION

## Development Costs (Turkey Rates):

### Junior Developer
- **Rate:** $15-25/hour
- **Phase 1-2:** 140 hours = $2,100 - $3,500
- **Total Project:** 450 hours = $6,750 - $11,250

### Mid-Level Developer
- **Rate:** $30-50/hour
- **Phase 1-2:** 140 hours = $4,200 - $7,000
- **Total Project:** 450 hours = $13,500 - $22,500

### Senior Developer
- **Rate:** $60-100/hour
- **Phase 1-2:** 140 hours = $8,400 - $14,000
- **Total Project:** 450 hours = $27,000 - $45,000

---

# 🎯 RECOMMENDED APPROACH

## My Suggestion: **AGILE SPRINTS**

### Sprint Structure:
- **Sprint Duration:** 2 weeks
- **Planning:** Monday morning
- **Review:** Friday afternoon
- **Retrospective:** Friday afternoon

### Sprint 1 (Week 1-2): **Quick Wins** ✅
- Production testing
- Notifications UI
- Reporting dashboard
- **Goal:** Immediate value to users

### Sprint 2 (Week 3-4): **Core Completion** ✅
- Document management
- Accounting expansion
- Payment enhancements
- **Goal:** Complete half-finished features

### Sprint 3 (Week 5-6): **Mobile First** ✅
- PWA implementation
- Mobile optimization
- Camera features
- **Goal:** Mobile users can use app

### Sprint 4 (Week 7-8): **Content & Marketing** ✅
- Social media module
- CMS module
- SEO optimization
- **Goal:** Marketing team can manage content

### Sprint 5 (Week 9-10): **AI & Automation** ✅
- Chatbot integration
- Email automation
- Predictive analytics
- **Goal:** Reduce manual work

### Sprint 6 (Week 11-12): **Enterprise Ready** ✅
- Multi-location support
- Advanced reporting
- Security hardening
- **Goal:** Enterprise customers ready

---

# 📋 DAILY STANDUP TEMPLATE

## Questions:
1. What did you complete yesterday?
2. What will you work on today?
3. Any blockers or challenges?

## Tools:
- **Project Management:** GitHub Projects or Jira
- **Communication:** Slack or Discord
- **Version Control:** GitHub
- **CI/CD:** GitHub Actions (already setup!)

---

# ✅ ACCEPTANCE CRITERIA

## Phase 1 (Week 1-2):
- [ ] All production tests passing
- [ ] Zero critical bugs
- [ ] Notification bell working
- [ ] 4 report types available
- [ ] Document upload working

## Phase 2 (Week 3-4):
- [ ] Expense tracking functional
- [ ] Financial reports accurate
- [ ] PWA installable
- [ ] Mobile responsive (all pages)
- [ ] Camera QR scanner working

## Phase 3 (Week 5-8):
- [ ] Social media posting working
- [ ] CMS page management working
- [ ] AI chatbot responding
- [ ] Email automation working

## Phase 4 (Week 9-12):
- [ ] Multi-location transfers working
- [ ] Custom reports buildable
- [ ] KPI dashboards displaying
- [ ] Performance optimized

---

# 🚀 NEXT STEPS

## Immediate Actions (Today):

1. **Review & Approve This Plan** ⏳
   - Read through all phases
   - Provide feedback/changes
   - Confirm priorities

2. **Setup Project Board**
   - Create GitHub Project
   - Add all tasks as issues
   - Assign priorities & labels

3. **Start Sprint 1 Day 1**
   - Production testing
   - Bug documentation
   - Fix critical issues

---

# 📞 CONTACT & SUPPORT

## Questions?
- Unclear tasks?
- Need clarification?
- Want to adjust priorities?

**Let me know and I'll adjust the plan!**

---

**Plan Status:** ⏳ AWAITING APPROVAL  
**Next Action:** Your decision on:
1. Timeline (12 weeks solo vs 6 weeks team)
2. Priorities (agree with suggested order?)
3. Scope (add/remove features?)

**Ready to start?** Say "Onayla" and we begin! 🚀
