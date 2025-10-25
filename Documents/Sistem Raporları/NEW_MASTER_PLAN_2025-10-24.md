# 🎯 CANARY DIGITAL - YENİ MASTER PLAN
**Tarih:** 24 Ekim 2025  
**Geçerlilik:** 24 Ekim - 31 Aralık 2025 (10 Hafta)  
**Hedef:** %93 → %100 Complete  
**Yaklaşım:** Agile, 2-haftalık sprintler

---

## 📊 MEVCUT DURUM ÖZET (24 Ekim 2025)

### ✅ Başarılar
```
Overall Completion:     ████████████████████░ 93%
Backend:                ███████████████████░░ 96%
Frontend:               ██████████████████░░░ 91%
Database:               ███████████████████░░ 98%
Infrastructure:         ████████████████████ 100%
```

### 🎉 Son 7 Günde Tamamlananlar (17-24 Ekim)
```
✅ Website.tsx redesign (Social.tsx pattern)
✅ Meetings.tsx - Calendar tab eklendi
✅ Inventory.tsx cleanup
✅ TechnicalService.tsx redesign (775→300 satır)
✅ HumanResources expansion:
   - DocumentManagement.tsx (385 satır)
   - CareerManagement.tsx (450 satır)
   - HRReports.tsx (Chart.js entegrasyonu)
✅ Chart.js integration complete
✅ Build & deploy success (commit b466d13)
```

### 📈 Kod İstatistikleri
```
Backend Routes:    40 dosya, 14,215 satır
Frontend Pages:    44 dosya, 20,000+ satır
Database Models:   66 model, 150+ relation
Total Code Base:   ~35,000 satır kod
```

---

## 🎯 10-WEEK ROADMAP (24 Ekim - 31 Aralık 2025)

```
┌─────────────────────────────────────────────────────────────┐
│                    SPRINT OVERVIEW                           │
├─────────────────────────────────────────────────────────────┤
│ Sprint 1-2:  Reporting & Analytics (24 Eki - 7 Kas)        │
│ Sprint 3-4:  Backend Completions (8 Kas - 21 Kas)          │
│ Sprint 5-6:  Frontend Enhancements (22 Kas - 5 Ara)        │
│ Sprint 7-8:  Advanced Features (6 Ara - 19 Ara)            │
│ Sprint 9-10: Polish & Optimization (20 Ara - 31 Ara)       │
└─────────────────────────────────────────────────────────────┘
```

---

# 📅 SPRINT 1-2: REPORTING & ANALYTICS EXCELLENCE
**Tarih:** 24 Ekim - 7 Kasım 2025 (2 hafta)  
**Goal:** Reporting sistemini %40'tan %100'e çıkar  
**Effort:** 60 hours (4-5 working days)

---

## WEEK 1: Advanced Reporting Backend (24-31 Ekim)

### DAY 1-2: Custom Report Builder Backend (16h)
**Priority:** 🔴 CRITICAL  
**Dosya:** `backend/src/routes/reports.ts` (157 satır → ~500 satır)

#### Task 1.1: Report Builder Core (6h)
```typescript
Backend Endpoint:
POST /api/reports/custom/build

Request Body:
{
  "reportName": "Monthly Revenue by Category",
  "entity": "orders", // orders, equipment, customers, invoices
  "fields": ["orderNumber", "totalAmount", "createdAt", "customer.name"],
  "filters": [
    { "field": "createdAt", "operator": ">=", "value": "2025-10-01" },
    { "field": "status", "operator": "=", "value": "COMPLETED" }
  ],
  "groupBy": ["category"],
  "aggregations": [
    { "field": "totalAmount", "function": "SUM" },
    { "field": "orderNumber", "function": "COUNT" }
  ],
  "sortBy": "totalAmount",
  "sortOrder": "DESC",
  "limit": 100
}

Response:
{
  "success": true,
  "reportId": "RPT-2025-001",
  "data": [...],
  "summary": {
    "totalRecords": 45,
    "totalRevenue": 125000,
    "averageOrder": 2777
  },
  "generatedAt": "2025-10-24T10:30:00Z"
}

Database:
- CREATE ReportTemplate model
- CREATE ReportExecution model
- CREATE SavedReport model

Implementation:
- Dynamic SQL query builder
- Security: SQL injection prevention
- Field validation (whitelist approved fields)
- Aggregation functions (SUM, AVG, COUNT, MIN, MAX)
- Group by support
- Having clause support
```

#### Task 1.2: Report Templates (4h)
```typescript
GET /api/reports/templates
POST /api/reports/templates
PUT /api/reports/templates/:id
DELETE /api/reports/templates/:id

Pre-built Templates:
1. Revenue Summary (Daily, Weekly, Monthly, Yearly)
2. Equipment Utilization Report
3. Customer Lifetime Value
4. Order Completion Rate
5. Technician Performance
6. Inventory Stock Levels
7. Payment Collection Report
8. Overdue Invoices
9. Seasonal Trends Analysis
10. Top 10 Customers

Template Structure:
{
  "id": 1,
  "name": "Revenue Summary",
  "description": "Daily/weekly/monthly revenue breakdown",
  "category": "financial",
  "icon": "dollar-sign",
  "query": {...}, // Query configuration
  "visualizations": ["line-chart", "bar-chart", "table"],
  "exportFormats": ["pdf", "excel", "csv"],
  "scheduleEnabled": true,
  "isPublic": true,
  "createdBy": "admin",
  "usageCount": 156
}
```

#### Task 1.3: Export Functionality (6h)
```typescript
POST /api/reports/export

Request:
{
  "reportId": "RPT-2025-001",
  "format": "excel", // pdf, excel, csv
  "options": {
    "includeCharts": true,
    "pageOrientation": "landscape",
    "fontSize": 10,
    "companyLogo": true
  }
}

Libraries:
- ExcelJS for Excel export
- PDFKit or Puppeteer for PDF
- csv-stringify for CSV

Excel Features:
- Multiple sheets (data, charts, summary)
- Formatted cells (currency, dates, percentages)
- Formulas (SUM, AVERAGE)
- Charts embedded
- Company branding (logo, colors)
- Auto-width columns

PDF Features:
- Header with company logo
- Page numbers
- Charts as images (Chart.js → canvas → image)
- Tables with alternating row colors
- Summary section
- Generated timestamp
```

### DAY 3: Scheduled Reports & Email Delivery (8h)
**Priority:** 🔴 CRITICAL

#### Task 1.4: Report Scheduler (5h)
```typescript
GET /api/reports/schedules
POST /api/reports/schedules
PUT /api/reports/schedules/:id
DELETE /api/reports/schedules/:id

Schedule Structure:
{
  "id": 1,
  "reportTemplateId": 5,
  "name": "Weekly Revenue Report",
  "frequency": "weekly", // daily, weekly, monthly
  "dayOfWeek": 1, // Monday
  "timeOfDay": "09:00",
  "timezone": "Europe/Istanbul",
  "recipients": ["admin@canary.com", "manager@canary.com"],
  "format": "excel",
  "isActive": true,
  "lastRunAt": "2025-10-21T09:00:00Z",
  "nextRunAt": "2025-10-28T09:00:00Z"
}

Cron Job:
- Use node-cron library
- Check schedules every hour
- Generate reports automatically
- Send via email
- Log execution status
```

#### Task 1.5: Email Delivery Integration (3h)
```typescript
POST /api/reports/send-email

Request:
{
  "reportId": "RPT-2025-001",
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Weekly Revenue Report - Oct 21, 2025",
  "message": "Please find attached the weekly revenue report.",
  "attachFormat": "excel"
}

Email Template:
Subject: [CANARY] {reportName} - {date}

Body:
Hi {recipientName},

Please find attached the {reportName} for the period {startDate} to {endDate}.

Summary:
- Total Revenue: {totalRevenue}
- Total Orders: {totalOrders}
- Growth: {growthPercent}%

Best regards,
CANARY ERP System

Attachment: report.xlsx (or .pdf)

Integration:
- Use existing EmailService (email.ts 259 satır)
- Add new template: report-delivery.hbs
- Track email delivery status
```

### DAY 4-5: Analytics Dashboard Enhancement (16h)
**Priority:** 🟡 HIGH  
**Dosya:** `backend/src/routes/analytics.ts` (215 satır → ~400 satır)

#### Task 1.6: Advanced Analytics Endpoints (10h)
```typescript
1. GET /api/analytics/revenue-trends
   Query: ?period=month&months=12
   Response: Monthly revenue for last 12 months
   Chart: Line chart

2. GET /api/analytics/customer-segments
   Response: Customer segments (VIP, Regular, New, Inactive)
   Chart: Pie chart

3. GET /api/analytics/equipment-performance
   Response: Top/bottom performing equipment
   Chart: Bar chart

4. GET /api/analytics/order-funnel
   Response: Order status distribution
   Chart: Funnel chart

5. GET /api/analytics/technician-kpis
   Response: Technician performance metrics
   Chart: Radar chart

6. GET /api/analytics/seasonal-patterns
   Response: Monthly business patterns (last 3 years)
   Chart: Heatmap

7. GET /api/analytics/payment-methods
   Response: Payment method distribution
   Chart: Donut chart

8. GET /api/analytics/geographical
   Response: Orders by city/region
   Chart: Map (optional)

9. GET /api/analytics/real-time-dashboard
   Response: Live metrics (updated every 30s)
   Chart: Multiple widgets

10. GET /api/analytics/predictions
    Response: Revenue/demand forecasting (basic ML)
    Chart: Line chart with prediction bands

Implementation:
- Complex SQL queries (JOIN, GROUP BY, HAVING)
- Aggregation functions
- Date range filtering
- Caching (Redis - optional)
- Performance optimization (indexes)
```

#### Task 1.7: Analytics Export (3h)
```typescript
POST /api/analytics/export-dashboard

Request:
{
  "widgets": ["revenue-trends", "customer-segments", "order-funnel"],
  "format": "pdf",
  "dateRange": { "start": "2025-01-01", "end": "2025-10-24" }
}

Response:
- PDF file with all selected charts
- Executive summary
- KPI highlights
- Recommendations section (AI-generated - future)
```

#### Task 1.8: Real-time Metrics (3h)
```typescript
WebSocket Implementation (optional):
- ws://backend/analytics/live

SSE Alternative:
GET /api/analytics/stream

Updates every 30 seconds:
{
  "timestamp": "2025-10-24T15:30:00Z",
  "metrics": {
    "todayRevenue": 15420,
    "activeOrders": 12,
    "availableEquipment": 45,
    "pendingInvoices": 8
  }
}

Frontend:
- Use EventSource API
- Auto-refresh dashboard
- Visual indicators for changes
```

---

## WEEK 2: Reporting Frontend & Connections (1-7 Kasım)

### DAY 6-7: Report Builder UI (16h)
**Priority:** 🔴 CRITICAL  
**Yeni Dosya:** `frontend/src/pages/ReportBuilder.tsx`

#### Task 2.1: Report Builder Interface (10h)
```typescript
Components:
1. EntitySelector
   - Dropdown: Orders, Equipment, Customers, Invoices, etc.
   - Shows available fields for selected entity

2. FieldSelector
   - Multi-select checkboxes
   - Drag-drop to reorder
   - Preview selected fields

3. FilterBuilder
   - Add filter button
   - Filter rows:
     * Field dropdown
     * Operator dropdown (=, !=, >, <, >=, <=, LIKE, IN)
     * Value input (text, number, date, dropdown)
   - AND/OR logic
   - Remove filter button

4. GroupBySelector
   - Multi-select for grouping fields
   - Aggregation function selector (SUM, AVG, COUNT, MIN, MAX)

5. SortOptions
   - Sort by field
   - Sort order (ASC, DESC)

6. PreviewPanel
   - Table preview (first 10 rows)
   - Column headers
   - Loading state

7. SaveTemplateModal
   - Template name
   - Description
   - Category
   - Icon selector
   - Public/Private toggle

8. ExportButton
   - Format selector (PDF, Excel, CSV)
   - Export options
   - Download trigger

UI Framework:
- Tailwind CSS
- Headless UI (modals, dropdowns)
- Lucide icons
- react-beautiful-dnd (drag-drop)

State Management:
- Zustand store (reportBuilderStore)
- Form validation (zod)
```

#### Task 2.2: Report Templates Gallery (6h)
```typescript
Page: frontend/src/pages/Reports.tsx (new)

Layout:
┌────────────────────────────────────────┐
│ 📊 Reports & Analytics                 │
├────────────────────────────────────────┤
│ [Custom Report] [Templates] [Scheduled]│
├────────────────────────────────────────┤
│ FEATURED TEMPLATES                     │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │ Rev  │ │ Equip│ │ Cust │ │ Tech │ │
│ │ Sum  │ │ Util │ │ LTV  │ │ Perf │ │
│ └──────┘ └──────┘ └──────┘ └──────┘ │
├────────────────────────────────────────┤
│ ALL TEMPLATES (Grid View)              │
│ [Search] [Filter by category]          │
│                                        │
│ ┌────────────────────────────────────┐│
│ │ 📈 Revenue Summary                 ││
│ │ Daily/weekly/monthly breakdown      ││
│ │ [Generate] [Schedule] [Preview]    ││
│ └────────────────────────────────────┘│
│ ...                                    │
└────────────────────────────────────────┘

Features:
- Template cards with icons
- Category filtering
- Search functionality
- Usage count badge
- Quick generate button
- Schedule button
- Preview modal
```

### DAY 8-9: Analytics Dashboard UI (16h)
**Priority:** 🔴 CRITICAL  
**Dosya:** `frontend/src/pages/Analytics.tsx` (10 satır → ~600 satır)

#### Task 2.3: Analytics Page Redesign (12h)
```typescript
Layout: Social.tsx pattern

Tabs:
1. Overview
2. Revenue
3. Equipment
4. Customers
5. Operations
6. Predictions

Overview Tab:
┌────────────────────────────────────────┐
│ Quick Stats (4 cards)                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │₺125K │ │ 248  │ │  68% │ │ +12% │ │
│ │Revenue│ │Orders│ │ Util │ │Growth│ │
│ └──────┘ └──────┘ └──────┘ └──────┘ │
├────────────────────────────────────────┤
│ Revenue Trend (Line Chart)             │
│ [6M] [1Y] [2Y] [All]                   │
├────────────────────────────────────────┤
│ ┌──────────────────┐ ┌───────────────┐│
│ │ Order Funnel     │ │ Payment Mix   ││
│ │ (Funnel Chart)   │ │ (Donut Chart) ││
│ └──────────────────┘ └───────────────┘│
└────────────────────────────────────────┘

Charts: (Using Chart.js - already integrated!)
- Line charts (revenue trends)
- Bar charts (comparisons)
- Pie/Donut charts (distributions)
- Funnel charts (conversion)
- Radar charts (technician KPIs)
- Heatmaps (seasonal patterns)

Period Selector:
- Today, Week, Month, Quarter, Year, Custom
- Date range picker

Export:
- Export entire dashboard as PDF
- Individual chart export
- CSV data export
```

#### Task 2.4: Real-time Dashboard (4h)
```typescript
Features:
- SSE connection to backend
- Auto-refresh metrics (30s interval)
- Visual change indicators (↑ ↓)
- Live order status
- Equipment availability
- Active users count (optional)

Implementation:
- useEffect with EventSource
- State updates on SSE message
- Cleanup on unmount
- Reconnection logic
```

### DAY 10: API Connections & Testing (8h)
**Priority:** 🔴 CRITICAL

#### Task 2.5: Connect Frontend to Backend (5h)
```typescript
Pages to Connect:
1. Documents.tsx → documents.ts ✅
   - File upload API
   - Document list
   - Category filter
   - Share/permissions

2. Analytics.tsx → analytics.ts ✅
   - Chart data fetch
   - Real-time metrics
   - Export functions

3. Pricing.tsx → pricing.ts ✅
   - Pricing rules CRUD
   - Bundle management
   - Discount codes

4. Reports.tsx → reports.ts ✅
   - Report builder
   - Templates
   - Scheduled reports

API Service (frontend/src/services/api.ts):
- Axios instance
- Base URL from env
- Auth headers
- Error handling
- Loading states
```

#### Task 2.6: Testing & Bug Fixes (3h)
```
Test Scenarios:
- [ ] Generate custom report (10+ filters)
- [ ] Export report to Excel (check formatting)
- [ ] Export report to PDF (check charts)
- [ ] Schedule daily report (verify cron)
- [ ] Email delivery test
- [ ] Analytics charts load correctly
- [ ] Real-time metrics update
- [ ] Document upload/download
- [ ] Pricing rule creation
- [ ] Mobile responsive (all new pages)

Bug Tracking:
- Create GitHub issues for found bugs
- Fix critical bugs immediately
- Log minor bugs for later
```

---

## SPRINT 1-2 DELIVERABLES

### ✅ Backend
```
✅ reports.ts expanded (157 → ~500 satır)
   - Custom report builder
   - 10+ pre-built templates
   - Export (Excel, PDF, CSV)
   - Scheduled reports
   - Email delivery

✅ analytics.ts expanded (215 → ~400 satır)
   - 10 new analytics endpoints
   - Real-time metrics
   - Advanced charts data
   - Predictions (basic)
```

### ✅ Frontend
```
✅ ReportBuilder.tsx (new, ~500 satır)
   - Drag-drop interface
   - Filter builder
   - Preview panel
   - Template gallery

✅ Reports.tsx (new, ~400 satır)
   - Template showcase
   - Scheduled reports list
   - Quick actions

✅ Analytics.tsx redesign (10 → ~600 satır)
   - 6 tabs
   - 15+ charts
   - Real-time dashboard
   - Export functions

✅ API connections
   - Documents.tsx connected
   - Pricing.tsx connected
   - All new pages connected
```

### 📊 Success Metrics
```
- Report generation time: <5 seconds
- Export time: <10 seconds (Excel/PDF)
- Chart load time: <2 seconds
- Real-time update latency: <1 second
- Email delivery success rate: >95%
- User satisfaction: 4.5+/5 stars
```

---

# 📅 SPRINT 3-4: BACKEND COMPLETIONS
**Tarih:** 8-21 Kasım 2025 (2 hafta)  
**Goal:** Eksik backend endpoints tamamla  
**Effort:** 56 hours

---

## WEEK 3: Todo & Task Management (8-14 Kasım)

### Task 3.1: Task Management Backend (16h)
**Yeni Dosya:** `backend/src/routes/tasks.ts` (~400 satır)

```typescript
Endpoints:
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/bulk
PUT    /api/tasks/:id/assign
PUT    /api/tasks/:id/status
POST   /api/tasks/:id/comments
GET    /api/tasks/:id/comments
POST   /api/tasks/:id/attachments
GET    /api/tasks/my-tasks
GET    /api/tasks/team-tasks
GET    /api/tasks/overdue
GET    /api/tasks/today
GET    /api/tasks/week

Database Model:
model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  status      String   @default("TODO") // TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED
  priority    String   @default("MEDIUM") // LOW, MEDIUM, HIGH, URGENT
  dueDate     DateTime?
  startDate   DateTime?
  estimatedHours Float?
  actualHours    Float?
  
  // Assignment
  assignedTo   User? @relation(fields: [assignedToId], references: [id])
  assignedToId Int?
  assignedBy   Int?
  
  // Relations
  parentTaskId Int?
  parentTask   Task? @relation("Subtasks", fields: [parentTaskId], references: [id])
  subtasks     Task[] @relation("Subtasks")
  
  // Metadata
  tags        String[] // Array of tags
  labels      String[]
  attachments String[] // JSON array of file URLs
  
  // Tracking
  comments    TaskComment[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TaskComment {
  id        Int      @id @default(autoincrement())
  taskId    Int
  task      Task     @relation(fields: [taskId], references: [id])
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  comment   String
  createdAt DateTime @default(now())
}

Features:
- Subtask support (nested tasks)
- File attachments
- Comments
- Time tracking
- Due date reminders (cron job)
- Assignment notifications
- Kanban board support (status-based)
```

### Task 3.2: Task Frontend Integration (8h)
**Dosya:** `frontend/src/pages/Todo.tsx` (469 satır mevcut)

```typescript
Views:
1. List View (Table)
2. Kanban Board (Drag-drop columns)
3. Calendar View
4. Timeline (Gantt-like)

Features:
- Quick task creation
- Inline editing
- Drag-drop status change
- Filter by: status, priority, assignee, due date
- Sort by: priority, due date, created date
- Bulk actions (assign, delete, change status)
- Task detail modal
- Comment thread
- Attach files
```

---

## WEEK 4: Customer Service CRM (15-21 Kasım)

### Task 3.3: Support Ticket System Backend (20h)
**Yeni Dosya:** `backend/src/routes/tickets.ts` (~500 satır)

```typescript
Endpoints:
POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/:id
PUT    /api/tickets/:id
DELETE /api/tickets/:id
POST   /api/tickets/:id/reply
GET    /api/tickets/:id/replies
PUT    /api/tickets/:id/assign
PUT    /api/tickets/:id/status
PUT    /api/tickets/:id/priority
GET    /api/tickets/my-tickets
GET    /api/tickets/team-tickets
GET    /api/tickets/stats
GET    /api/tickets/sla-status

Database Model:
model SupportTicket {
  id          Int      @id @default(autoincrement())
  ticketNumber String  @unique // TKT-2025-0001
  subject     String
  description String
  status      String   @default("OPEN") // OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED
  priority    String   @default("MEDIUM") // LOW, MEDIUM, HIGH, URGENT
  category    String? // Technical, Billing, General, Feature Request
  
  // Customer
  customerId   Int
  customer     Customer @relation(fields: [customerId], references: [id])
  customerEmail String
  customerName  String
  
  // Assignment
  assignedTo   User? @relation(fields: [assignedToId], references: [id])
  assignedToId Int?
  
  // SLA Tracking
  createdAt      DateTime @default(now())
  firstReplyAt   DateTime?
  resolvedAt     DateTime?
  closedAt       DateTime?
  slaDeadline    DateTime?
  slaMet         Boolean @default(true)
  
  // Metadata
  tags         String[]
  attachments  String[] // JSON
  
  // Relations
  replies TicketReply[]
  
  updatedAt DateTime @updatedAt
}

model TicketReply {
  id        Int           @id @default(autoincrement())
  ticketId  Int
  ticket    SupportTicket @relation(fields: [ticketId], references: [id])
  userId    Int?
  user      User?         @relation(fields: [userId], references: [id])
  message   String
  isPublic  Boolean       @default(true) // Internal note vs customer-visible
  attachments String[] // JSON
  createdAt DateTime      @default(now())
}

Features:
- Auto ticket number generation
- SLA tracking (response time, resolution time)
- Email integration (create ticket from email)
- Auto-assignment (round-robin)
- Canned responses
- Knowledge base linking
- Customer satisfaction survey (after resolution)
```

### Task 3.4: Knowledge Base System (12h)
**Yeni Dosya:** `backend/src/routes/knowledge-base.ts` (~300 satır)

```typescript
Endpoints:
GET    /api/kb/articles
GET    /api/kb/articles/:id
POST   /api/kb/articles
PUT    /api/kb/articles/:id
DELETE /api/kb/articles/:id
GET    /api/kb/categories
POST   /api/kb/search
PUT    /api/kb/articles/:id/helpful
GET    /api/kb/popular

Database Model:
model KBArticle {
  id          Int      @id @default(autoincrement())
  title       String
  content     String   @db.Text
  category    String
  tags        String[]
  author      User     @relation(fields: [authorId], references: [id])
  authorId    Int
  status      String   @default("DRAFT") // DRAFT, PUBLISHED, ARCHIVED
  
  // SEO
  slug        String   @unique
  metaDesc    String?
  
  // Stats
  viewCount   Int      @default(0)
  helpfulCount Int     @default(0)
  
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

Features:
- Full-text search
- Rich text editor support (HTML content)
- Category organization
- Related articles suggestion
- Helpful voting
- View tracking
```

### Task 3.5: CRM Frontend (CustomerService.tsx) (12h)
**Dosya:** `frontend/src/pages/CustomerService.tsx` (503 satır mevcut)

```typescript
Tabs:
1. Tickets (List + Detail)
2. Create Ticket
3. Knowledge Base
4. Canned Responses
5. Reports

Ticket List Features:
- Filter by status, priority, assignee
- Search by ticket number, subject
- Bulk actions
- Quick status change
- SLA indicators (red/yellow/green)

Ticket Detail:
- Full conversation thread
- Reply editor (rich text)
- Attach files
- Internal notes toggle
- Quick actions (assign, change status, close)
- Customer info sidebar
- Related tickets
```

---

## SPRINT 3-4 DELIVERABLES

### ✅ New Backend Routes
```
✅ tasks.ts (~400 satır)
   - Full CRUD
   - Subtasks
   - Comments
   - Time tracking
   - Reminders

✅ tickets.ts (~500 satır)
   - Support ticket system
   - SLA tracking
   - Assignment workflow
   - Email integration

✅ knowledge-base.ts (~300 satır)
   - Article CRUD
   - Search
   - Categories
   - Analytics
```

### ✅ Frontend Updates
```
✅ Todo.tsx enhancement (469 → ~800 satır)
   - Kanban board
   - Calendar view
   - Backend connection

✅ CustomerService.tsx enhancement (503 → ~900 satır)
   - Ticket management
   - KB integration
   - Live chat (future)
```

### 📊 Success Metrics
```
- Ticket creation time: <30 seconds
- Average response time: <2 hours
- SLA compliance: >90%
- Knowledge base helpfulness: >70%
- Customer satisfaction: >4.2/5
```

---

# 📅 SPRINT 5-6: FRONTEND ENHANCEMENTS
**Tarih:** 22 Kasım - 5 Aralık 2025 (2 hafta)  
**Goal:** UI/UX polish & missing connections  
**Effort:** 48 hours

---

## WEEK 5: Admin Panel & Settings (22-28 Kasım)

### Task 4.1: Admin Panel Enhancement (16h)
**Dosya:** `frontend/src/pages/Admin.tsx` (120 satır → ~700 satır)

```typescript
Tabs:
1. Users
2. Roles & Permissions
3. System Settings
4. Activity Logs
5. Audit Trail
6. System Health

Users Tab:
- User table (filterable, sortable)
- Create user button
- Bulk actions (activate, deactivate, delete)
- User detail modal
- Role assignment
- Password reset

Roles & Permissions:
- Role list
- Create/edit role modal
- Permission matrix (checkbox grid)
- Assign permissions to roles

System Settings:
- Company settings
- Email settings
- Notification settings
- Integration settings (API keys)
- Feature flags

Activity Logs:
- Real-time activity feed
- Filter by user, action, date
- Export logs

System Health:
- Server status
- Database status
- API response times
- Error rate
- Disk usage
- Memory usage
```

### Task 4.2: Admin Backend (12h)
**Yeni Dosya:** `backend/src/routes/admin.ts` (~400 satır)

```typescript
Endpoints:
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
POST   /api/admin/users/:id/reset-password
GET    /api/admin/roles
POST   /api/admin/roles
PUT    /api/admin/roles/:id
DELETE /api/admin/roles/:id
GET    /api/admin/permissions
POST   /api/admin/assign-role
GET    /api/admin/activity-logs
GET    /api/admin/audit-trail
GET    /api/admin/system-settings
PUT    /api/admin/system-settings
GET    /api/admin/health

Middleware:
- isAdmin (check user role)
- Permission checks
- Audit logging (all admin actions)

Security:
- Rate limiting (prevent brute force)
- IP whitelisting (optional)
- 2FA required for sensitive actions
```

---

## WEEK 6: Mobile Optimization & Polish (29 Kas - 5 Ara)

### Task 4.3: Mobile Responsive Audit (8h)
```
Test All Pages:
- [ ] Home/Dashboard
- [ ] Equipment (list, detail)
- [ ] Orders (list, detail, create)
- [ ] Customers
- [ ] Calendar
- [ ] Reservations
- [ ] Invoices
- [ ] Payments
- [ ] Technical Service
- [ ] Reports
- [ ] Analytics
- [ ] Human Resources
- [ ] Social Media
- [ ] Website
- [ ] Meetings
- [ ] Documents
- [ ] Todo
- [ ] Customer Service
- [ ] Admin

Fix Issues:
- Horizontal scroll
- Overlapping elements
- Touch target size (<44px)
- Font sizes too small
- Tables overflow
- Modal widths
- Navigation menu
```

### Task 4.4: Performance Optimization (12h)
```
Frontend:
- [ ] Code splitting (React.lazy)
- [ ] Image optimization (next/image alternative)
- [ ] Lazy load images
- [ ] Debounce search inputs
- [ ] Memoize expensive components
- [ ] Remove unused dependencies
- [ ] Bundle size analysis (vite-bundle-visualizer)
- [ ] Lighthouse audit (target: 90+)

Backend:
- [ ] Database query optimization
- [ ] Add indexes (slow queries)
- [ ] Implement caching (Redis - optional)
- [ ] Response compression (gzip)
- [ ] Rate limiting (prevent abuse)
- [ ] Connection pooling (Prisma)
- [ ] N+1 query prevention

Target Metrics:
- Page load: <3 seconds
- Time to interactive: <5 seconds
- First contentful paint: <1.5 seconds
- API response: <500ms average
```

---

## SPRINT 5-6 DELIVERABLES

### ✅ Admin System
```
✅ Admin.tsx complete (120 → ~700 satır)
   - User management
   - Role/permission matrix
   - System settings
   - Activity logs

✅ admin.ts backend (~400 satır)
   - Full admin endpoints
   - Security middleware
   - Audit logging
```

### ✅ Optimization
```
✅ Mobile responsive (all pages)
✅ Performance improved
   - Lighthouse score: 90+
   - Bundle size reduced
   - Load time <3s
✅ Code quality
   - ESLint clean
   - TypeScript strict mode
   - No console.log in production
```

---

# 📅 SPRINT 7-8: ADVANCED FEATURES
**Tarih:** 6-19 Aralık 2025 (2 hafta)  
**Goal:** AI, Automation, Production Module  
**Effort:** 52 hours

---

## WEEK 7: AI & Automation (6-12 Aralık)

### Task 5.1: AI Chatbot Enhancement (16h)
**Dosya:** `backend/src/routes/chatbot.ts` (574 satır → ~800 satır)

```typescript
OpenAI Integration:
- [ ] Get OpenAI API key
- [ ] Install openai npm package
- [ ] Create ChatGPT wrapper service
- [ ] Fine-tune with company data
- [ ] Context management
- [ ] Conversation history
- [ ] Multi-turn conversations

Features:
- Natural language queries
- FAQ auto-response
- Product recommendations
- Order status lookup
- Equipment availability check
- Simple math calculations
- Sentiment analysis
- Multi-language support (TR, EN)

Training Interface:
POST /api/chatbot/train
- Upload Q&A pairs
- Import from knowledge base
- Test responses
- Analytics dashboard
```

### Task 5.2: Email Automation Enhancement (12h)
**Dosya:** `backend/src/services/EmailService.ts` (585 satır)

```typescript
New Features:
- Email campaigns (bulk send with personalization)
- Drip campaigns (automated sequences)
- A/B testing (subject lines)
- Email templates builder (drag-drop)
- Unsubscribe handling
- Bounce tracking
- Open rate tracking
- Click tracking

Triggers:
- Order placed → confirmation email
- Order due soon → reminder email (3 days before)
- Order overdue → late payment email
- Equipment available → notification email
- Inspection scheduled → reminder email (1 day before)
- Invoice created → invoice email
- Payment received → receipt email

Implementation:
- Cron jobs for scheduled sends
- Queue system (Bull + Redis) for bulk sends
- Template caching
- Retry logic with exponential backoff
```

### Task 5.3: WhatsApp Automation (8h)
**Dosya:** `backend/src/routes/whatsapp.ts` (601 satır)

```typescript
Automated Messages:
- Order confirmation
- Delivery updates
- Payment reminders
- Inspection reminders
- Equipment return reminders

Interactive Messages:
- Quick reply buttons
- List messages
- Call-to-action buttons

Business Integration:
- Catalog integration (equipment showcase)
- Order placement via WhatsApp
- Payment link sharing
```

---

## WEEK 8: Production Module (13-19 Aralık)

### Task 5.4: Production Planning Backend (16h)
**Yeni Dosya:** `backend/src/routes/production.ts` (~600 satır)

```typescript
For Film/Video Production Management:

Endpoints:
POST   /api/production/projects
GET    /api/production/projects
GET    /api/production/projects/:id
PUT    /api/production/projects/:id
DELETE /api/production/projects/:id
POST   /api/production/call-sheets
GET    /api/production/call-sheets
POST   /api/production/schedules
GET    /api/production/schedules
POST   /api/production/crew-assignments
GET    /api/production/budget
PUT    /api/production/budget/:id

Database Models:
model ProductionProject {
  id          Int      @id @default(autoincrement())
  companyId   Int
  company     Company  @relation(fields: [companyId], references: [id])
  
  name        String
  description String?
  type        String // Film, Commercial, Music Video, etc.
  status      String @default("PLANNING") // PLANNING, PRE_PRODUCTION, PRODUCTION, POST_PRODUCTION, COMPLETED
  
  // Dates
  startDate   DateTime?
  endDate     DateTime?
  
  // Budget
  totalBudget Float?
  spentAmount Float @default(0)
  
  // Relations
  callSheets  CallSheet[]
  schedules   ProductionSchedule[]
  crew        CrewMember[]
  equipment   EquipmentAllocation[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CallSheet {
  id         Int               @id @default(autoincrement())
  projectId  Int
  project    ProductionProject @relation(fields: [projectId], references: [id])
  
  shootDate  DateTime
  callTime   String // "06:00"
  wrapTime   String // "18:00"
  location   String
  scenes     String[] // JSON array
  
  // Weather
  weather    String?
  
  // Notes
  specialNotes String?
  
  createdAt DateTime @default(now())
}

Features:
- Project dashboard
- Call sheet generator
- Crew scheduling
- Equipment allocation
- Budget tracking
- Shot list management
- Location scouting tracker
- Permits tracking
```

### Task 5.5: Production Frontend (12h)
**Dosya:** `frontend/src/pages/Production.tsx` (180 satır → ~700 satır)

```typescript
Tabs:
1. Projects
2. Call Sheets
3. Schedule
4. Crew
5. Equipment
6. Budget

Features:
- Project kanban board
- Call sheet template editor
- Day-by-day schedule
- Crew availability calendar
- Equipment checkout/checkin
- Budget breakdown charts
- Expense tracking
```

---

## SPRINT 7-8 DELIVERABLES

### ✅ AI & Automation
```
✅ OpenAI chatbot integration
✅ Email campaigns
✅ WhatsApp automation
✅ Drip campaigns
```

### ✅ Production Module
```
✅ production.ts backend (~600 satır)
✅ Production.tsx frontend (~700 satır)
✅ Call sheet generator
✅ Crew management
✅ Budget tracking
```

---

# 📅 SPRINT 9-10: POLISH & OPTIMIZATION
**Tarih:** 20-31 Aralık 2025 (2 hafta)  
**Goal:** Final polish, documentation, launch prep  
**Effort:** 48 hours

---

## WEEK 9: Final Polish (20-26 Aralık)

### Task 6.1: Production Credentials & Setup (8h)
```
1. Custom Domain Setup
   - [ ] Purchase canary.digital domain
   - [ ] Configure Cloud Run custom domain
   - [ ] SSL certificate (auto-managed)
   - [ ] DNS configuration
   - [ ] Redirect *.run.app to custom domain

2. Production API Keys
   - [ ] Paraşüt production API key
   - [ ] Twilio production credentials
   - [ ] OpenAI API key (production tier)
   - [ ] Sentry DSN
   - [ ] Google Analytics

3. Error Tracking (Sentry)
   - [ ] Install @sentry/node (backend)
   - [ ] Install @sentry/react (frontend)
   - [ ] Configure error tracking
   - [ ] Set up alerts
   - [ ] Test error reporting

4. Analytics
   - [ ] Google Analytics 4 setup
   - [ ] Track page views
   - [ ] Track custom events
   - [ ] Conversion tracking
```

### Task 6.2: Security Hardening (12h)
```
Backend:
- [ ] Rate limiting (express-rate-limit)
- [ ] CORS configuration (whitelist domains)
- [ ] Helmet.js (security headers)
- [ ] SQL injection prevention audit
- [ ] XSS prevention audit
- [ ] CSRF protection
- [ ] Environment variable encryption
- [ ] API key rotation
- [ ] Password strength requirements
- [ ] Session timeout (auto-logout)

Frontend:
- [ ] CSP (Content Security Policy)
- [ ] XSS prevention (sanitize user input)
- [ ] Secure localStorage usage
- [ ] HTTPS enforcement
- [ ] Sensitive data masking

Compliance:
- [ ] GDPR compliance check
- [ ] KVKK compliance check
- [ ] Data retention policy
- [ ] Privacy policy update
- [ ] Terms of service update
```

### Task 6.3: Testing & QA (12h)
```
Unit Tests:
- [ ] Backend: 50+ unit tests (Jest)
  - Auth functions
  - Business logic
  - Calculation functions
  - Validation functions
  
- [ ] Frontend: 30+ unit tests (Vitest)
  - Components
  - Hooks
  - Utilities

Integration Tests:
- [ ] API endpoint tests (20+ tests)
  - CRUD operations
  - Authentication flow
  - Payment flow
  - Email sending

E2E Tests:
- [ ] Playwright/Cypress setup
- [ ] Critical user flows (10+ tests)
  - Login → Create Order → Payment
  - Create Equipment → Reserve → Invoice
  - Create Ticket → Assign → Resolve

Manual QA:
- [ ] All modules tested
- [ ] Mobile testing (iOS, Android)
- [ ] Cross-browser (Chrome, Safari, Firefox, Edge)
- [ ] Accessibility audit (WCAG 2.1 Level AA)
- [ ] Usability testing (5+ users)
```

### Task 6.4: Documentation (8h)
```
Technical Documentation:
- [ ] API documentation (Swagger complete)
- [ ] Database schema diagram
- [ ] Architecture overview
- [ ] Deployment guide
- [ ] Environment setup guide
- [ ] Troubleshooting guide

User Documentation:
- [ ] User manual (PDF)
- [ ] Video tutorials (5+ videos)
  - Getting started
  - Creating orders
  - Managing equipment
  - Running reports
  - Admin functions
- [ ] FAQ section (20+ questions)
- [ ] Knowledge base articles (30+ articles)

Developer Documentation:
- [ ] README.md (comprehensive)
- [ ] CONTRIBUTING.md
- [ ] CODE_OF_CONDUCT.md
- [ ] Changelog
- [ ] Release notes
```

---

## WEEK 10: Launch Preparation (27-31 Aralık)

### Task 6.5: Performance Optimization (8h)
```
Final Optimizations:
- [ ] Lighthouse audit (all pages >90 score)
- [ ] Bundle size optimization
- [ ] Image optimization (WebP format)
- [ ] CDN setup for static assets
- [ ] Database index optimization
- [ ] Query performance analysis
- [ ] Load testing (Artillery/k6)
  - Target: 100 concurrent users
  - Response time: <500ms p95
  - Error rate: <0.1%
```

### Task 6.6: Backup & Disaster Recovery (8h)
```
Setup:
- [ ] Database backup automation (daily)
- [ ] Backup retention (30 days)
- [ ] Backup verification (restore test)
- [ ] Point-in-time recovery setup
- [ ] Disaster recovery plan document
- [ ] Data restore procedure
- [ ] Backup monitoring & alerts

Cloud Run:
- [ ] Revision management (keep last 10)
- [ ] Rollback procedure documented
- [ ] Zero-downtime deployment verified
```

### Task 6.7: Monitoring & Alerts (8h)
```
Setup:
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Performance monitoring (New Relic/DataDog - optional)
- [ ] Error rate alerts (Sentry)
- [ ] Database performance monitoring
- [ ] Disk usage alerts
- [ ] SSL expiry alerts
- [ ] API response time alerts

Dashboards:
- [ ] Cloud Run metrics dashboard
- [ ] Database performance dashboard
- [ ] Business metrics dashboard
- [ ] Security events dashboard
```

### Task 6.8: Final Review & Launch (8h)
```
Pre-launch Checklist:
- [ ] All features tested
- [ ] All critical bugs fixed
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Backups verified
- [ ] Monitoring active
- [ ] Custom domain active
- [ ] SSL certificate valid
- [ ] Production credentials set
- [ ] Team training complete
- [ ] User acceptance testing passed

Launch Activities:
- [ ] Soft launch (internal users)
- [ ] Beta testing (selected customers)
- [ ] Feedback collection
- [ ] Bug triage
- [ ] Final fixes
- [ ] Full production launch
- [ ] Announcement (email, social media)
- [ ] Press release (optional)

Post-launch:
- [ ] Monitor for 48 hours
- [ ] Address urgent issues
- [ ] Collect user feedback
- [ ] Plan next iteration
```

---

## SPRINT 9-10 DELIVERABLES

### ✅ Infrastructure
```
✅ Custom domain setup
✅ Production credentials
✅ Error tracking (Sentry)
✅ Analytics (Google Analytics)
✅ Backups automated
✅ Monitoring & alerts
```

### ✅ Quality
```
✅ Security hardening complete
✅ 80+ tests written
✅ Documentation complete
✅ Performance optimized (Lighthouse 90+)
✅ Accessibility compliant
```

### ✅ Launch
```
✅ Soft launch successful
✅ Beta testing complete
✅ Full production launch
✅ System stable
```

---

# 📊 FINAL PROJECT STATUS (31 Aralık 2025)

## Completion Scorecard
```
Overall:                ████████████████████ 100%
Backend:                ████████████████████ 100%
Frontend:               ████████████████████ 100%
Database:               ████████████████████ 100%
Infrastructure:         ████████████████████ 100%
Documentation:          ████████████████████ 100%
Testing:                ████████████████████ 100%
Security:               ████████████████████ 100%
```

## Total Statistics
```
Backend Routes:         45+ files, 16,000+ lines
Frontend Pages:         50+ files, 25,000+ lines
Database Models:        70+ models
Tests:                  150+ tests
Documentation:          100+ pages
API Endpoints:          300+ endpoints
Production Users:       Active
System Uptime:          99.9%+
```

## Features Completed
```
✅ 20 Core Modules
✅ Advanced Reporting & Analytics
✅ AI Chatbot with OpenAI
✅ Email & WhatsApp Automation
✅ Production Planning Module
✅ CRM & Support Tickets
✅ Task Management
✅ Admin Panel
✅ Mobile Responsive
✅ PWA Support
✅ Real-time Notifications
✅ Payment Integrations
✅ Accounting Integration
✅ Social Media Management
✅ CMS & Website Builder
✅ Document Management
✅ Calendar & Scheduling
✅ QR/Barcode System
✅ Inspection System
✅ Technical Service
```

---

# 🎯 EXECUTION STRATEGY

## Team Recommendation
```
Option A: Solo Developer (You + Copilot)
Timeline: 10 weeks (full roadmap)
Effort: 40 hours/week
Pros: Full control, consistency
Cons: Slower, no knowledge sharing

Option B: 2 Developers (RECOMMENDED)
Timeline: 6 weeks (parallel work)
Effort: 20 hours/week each
Pros: Faster, code review, knowledge sharing
Cons: Coordination overhead

Option C: 3 Developers (Fast Track)
Timeline: 4 weeks (aggressive)
Effort: 15 hours/week each
Pros: Very fast, distributed work
Cons: More coordination, potential conflicts
```

## Sprint Management
```
Tools:
- GitHub Projects (Kanban board)
- GitHub Issues (task tracking)
- GitHub Milestones (sprint goals)
- GitHub Actions (CI/CD)

Process:
1. Sprint Planning (Monday)
   - Review backlog
   - Prioritize tasks
   - Assign work
   - Set sprint goal

2. Daily Standup (async)
   - What did I do yesterday?
   - What will I do today?
   - Any blockers?

3. Sprint Review (Friday)
   - Demo completed features
   - Collect feedback
   - Update roadmap

4. Sprint Retrospective (Friday)
   - What went well?
   - What can improve?
   - Action items
```

## Priority Levels
```
🔴 P0 - Critical (Do First)
   - Reporting system
   - Production credentials
   - Security fixes
   - Critical bugs

🟡 P1 - High (Do Soon)
   - Todo & CRM backends
   - Admin panel
   - API connections
   - Mobile responsive

🟢 P2 - Medium (Nice to Have)
   - AI enhancements
   - Production module
   - Advanced features

🔵 P3 - Low (Future)
   - Nice-to-have features
   - Experimental features
   - Optimization tweaks
```

---

# 💰 INVESTMENT ANALYSIS

## Development Cost (10 weeks)

### Option A: Solo
```
Rate: $50/hour
Hours: 400 hours (40h/week × 10 weeks)
Total: $20,000
Timeline: 10 weeks
```

### Option B: 2 Developers (RECOMMENDED)
```
Lead Dev: $50/hour × 120 hours = $6,000
Mid Dev: $35/hour × 120 hours = $4,200
Total: $10,200
Timeline: 6 weeks
```

### Option C: 3 Developers
```
Lead Dev: $50/hour × 60 hours = $3,000
Mid Dev 1: $35/hour × 60 hours = $2,100
Mid Dev 2: $35/hour × 60 hours = $2,100
Total: $7,200
Timeline: 4 weeks
```

## Additional Costs
```
Services (Annual):
- Custom Domain: $15/year
- Cloud Run: ~$100/month = $1,200/year
- Cloud SQL: ~$50/month = $600/year
- OpenAI API: ~$20/month = $240/year
- Sentry: Free tier (or $29/month)
- Email (SendGrid): Free tier (or $20/month)
- Storage: ~$10/month = $120/year

Total Services: ~$2,175/year (or $181/month)
```

## ROI Projection
```
Immediate Value:
- Complete ERP system worth $50,000+
- Custom reporting worth $10,000+
- Automation saves 20h/week = $1,000/week = $52,000/year
- No licensing fees (self-hosted)

Break-even:
- Investment: $10,200 (2 devs, 6 weeks)
- Services: $2,175/year
- Total Year 1: $12,375
- Savings Year 1: $52,000
- Net Benefit Year 1: $39,625

ROI: 320% in first year
```

---

# ✅ SUCCESS CRITERIA

## Sprint 1-2 (Reporting)
```
✅ Report builder functional
✅ 10+ templates available
✅ Excel/PDF export working
✅ Scheduled reports active
✅ Email delivery >95% success
✅ Dashboard <2s load time
```

## Sprint 3-4 (Backend)
```
✅ Task management complete
✅ CRM system functional
✅ Knowledge base active
✅ All APIs tested
```

## Sprint 5-6 (Frontend)
```
✅ Admin panel complete
✅ All pages mobile responsive
✅ Lighthouse score >90
✅ Zero console errors
```

## Sprint 7-8 (Advanced)
```
✅ AI chatbot responding
✅ Email automation working
✅ Production module complete
```

## Sprint 9-10 (Launch)
```
✅ Custom domain live
✅ All credentials set
✅ Security audit passed
✅ Documentation complete
✅ System stable >99.9% uptime
```

---

# 🚀 NEXT STEPS

## Immediate Actions (Today)
1. ✅ Review this master plan
2. ⏳ Approve budget & timeline
3. ⏳ Select team composition
4. ⏳ Create GitHub Project board
5. ⏳ Setup sprint 1 tasks

## Tomorrow (Day 1 of Sprint 1)
1. Start report builder backend
2. Create report database models
3. Implement custom query builder
4. Write unit tests

## This Week
1. Complete report builder backend
2. Start export functionality
3. Design report builder UI
4. Test & iterate

---

**MASTER PLAN SONU**

*Bu plan, mevcut kod tabanının kapsamlı analizine dayanarak hazırlanmıştır.*  
*40 backend route, 44 frontend sayfa, 66 database model analiz edilmiştir.*  
*Gerçekçi zaman tahminleri ve öncelik sıralaması yapılmıştır.*

**Hazırlayan:** GitHub Copilot  
**Tarih:** 24 Ekim 2025  
**Versiyon:** 2.0 (Comprehensive Edition)  
**Durum:** ⏳ Onay Bekleniyor

---

## 📞 APPROVAL REQUIRED

**Bu planı onaylamak için:**
1. Timeline'ı gözden geçir (10 hafta uygun mu?)
2. Bütçeyi değerlendir ($10K-$20K aralık)
3. Takım kompozisyonuna karar ver (1, 2 veya 3 dev)
4. Öncelikleri kontrol et (değişiklik var mı?)

**Onayladıktan sonra hemen başlıyoruz! 🚀**

Say "ONAYLA" veya "START" and we begin Sprint 1 immediately!
