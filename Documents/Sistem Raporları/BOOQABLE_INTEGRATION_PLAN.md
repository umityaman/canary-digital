# 🔌 Booqable Integration - Detaylı Planlama ve Analiz

**Tarih:** 12 Ekim 2025  
**Durum:** Implementation Ready  
**Öncelik:** Yüksek  
**Tahmini Süre:** 3-5 gün

---

## 📋 EXECUTIVE SUMMARY

Booqable, dünyanın en popüler ekipman kiralama yazılımıdır. Canary ile entegre edildiğinde:
- ✅ Ekipman senkronizasyonu (Booqable → Canary)
- ✅ Sipariş senkronizasyonu (iki yönlü)
- ✅ Stok güncellemeleri (real-time)
- ✅ Müşteri verileri senkronizasyonu
- ✅ Fiyat ve kategori yönetimi

**İş Faydaları:**
- Mevcut Booqable müşterileri kolay geçiş yapabilir
- Eski veriler otomatik import edilir
- İki sistem paralel çalışabilir (migration döneminde)
- API-first yaklaşım ile esneklik

---

## 🔍 BOOQABLE API ANALİZİ

### Authentication
**Method:** API Key (Bearer Token)  
**Endpoint:** `https://api.booqable.com/1/`  
**Rate Limit:** 100 request/minute (standart plan)

```typescript
const headers = {
  'Authorization': `Bearer ${BOOQABLE_API_KEY}`,
  'Content-Type': 'application/json'
}
```

### Core Resources

#### 1. Products (Ekipmanlar)
```
GET    /products           - Liste
GET    /products/:id       - Detay
POST   /products           - Oluştur
PUT    /products/:id       - Güncelle
DELETE /products/:id       - Sil
```

**Önemli Alanlar:**
- `name`, `description`, `sku`
- `price_structure` (daily, weekly, monthly rates)
- `quantity` (stok)
- `category`, `tags`
- `photo_url`, `properties`

#### 2. Orders
```
GET    /orders             - Liste
GET    /orders/:id         - Detay
POST   /orders             - Oluştur
PUT    /orders/:id         - Güncelle
```

**Önemli Alanlar:**
- `customer`, `items`, `dates`
- `status` (concept, reserved, started, stopped)
- `total_amount`, `deposit`
- `delivery_address`, `notes`

#### 3. Customers
```
GET    /customers          - Liste
GET    /customers/:id      - Detay
POST   /customers          - Oluştur
PUT    /customers/:id      - Güncelle
```

**Önemli Alanlar:**
- `name`, `email`, `phone`
- `address`, `tax_id`
- `properties` (custom fields)

#### 4. Stock Items
```
GET    /stock_items        - Fiziksel envanter
GET    /stock_items/:id    - Detay
```

**Kullanım:** Aynı üründen birden fazla birim için

---

## 🗄️ DATA MODEL KARŞILAŞTIRMASI

### Booqable → Canary Mapping

| Booqable Model | Canary Model | Sync Type | Notes |
|----------------|--------------|-----------|-------|
| Product | Equipment | One-way (B→C) | Booqable master data source |
| Order | Order | Two-way | Hem Booqable hem Canary'de sipariş oluşturulabilir |
| Customer | Customer | Two-way | Müşteri verileri senkronize |
| Stock Item | Equipment.serialNumbers | One-way | Serial number tracking için |
| Category | Equipment.category | One-way | Kategori yapısı sync |
| Payment | - | Manual | Payment handling Canary'de yapılacak |

### Field Mapping: Products → Equipment

```typescript
{
  // Booqable Product → Canary Equipment
  name: product.name,
  description: product.description,
  sku: product.sku,
  category: product.category.name,
  dailyRate: product.price_structure.day || 0,
  weeklyRate: product.price_structure.week || 0,
  monthlyRate: product.price_structure.month || 0,
  totalQuantity: product.quantity,
  availableQuantity: product.stock_count,
  imageUrl: product.photo_url,
  specifications: JSON.stringify(product.properties),
  booqableId: product.id,
  booqableUpdatedAt: product.updated_at
}
```

### Field Mapping: Orders → Orders

```typescript
{
  // Booqable Order → Canary Order
  orderNumber: order.number,
  customerId: syncedCustomer.id, // Previously synced
  startDate: order.starts_at,
  endDate: order.stops_at,
  totalAmount: order.total_amount,
  status: mapBooqableStatus(order.status),
  notes: order.note,
  deliveryAddress: order.delivery_address,
  booqableId: order.id,
  booqableUpdatedAt: order.updated_at
}
```

**Status Mapping:**
| Booqable | Canary |
|----------|--------|
| concept | PENDING |
| reserved | CONFIRMED |
| started | ACTIVE |
| stopped | COMPLETED |
| canceled | CANCELLED |

---

## 🔄 SYNC STRATEJİSİ

### Initial Sync (İlk Kurulum)
1. **Step 1:** Tüm Products import (Booqable → Canary)
2. **Step 2:** Tüm Customers import (Booqable → Canary)
3. **Step 3:** Son 6 aydaki Orders import (Booqable → Canary)
4. **Step 4:** Webhook subscription başlat

**Süre:** ~5-10 dakika (500 ekipman için)

### Ongoing Sync (Sürekli Senkronizasyon)

#### A. Webhook-Based (Real-time)
Booqable webhook'ları kullanarak anlık güncelleme:
```
product.created → Canary'ye ekle
product.updated → Canary'de güncelle
product.deleted → Canary'de soft delete
order.created → Canary'ye ekle
order.updated → Canary'de güncelle
```

#### B. Scheduled Sync (Yedek)
Webhook başarısız olursa, her 15 dakikada bir:
- Son 1 saatte güncellenen products kontrolü
- Son 1 saatte güncellenen orders kontrolü
- Conflict resolution (son güncelleme kazanır)

#### C. Manual Sync (İsteğe Bağlı)
Settings sayfasında "Sync Now" butonu

---

## 💻 IMPLEMENTATION PLAN

### Phase 1: Backend Foundation (1 gün)

#### 1.1 Prisma Schema Update
```prisma
model BooqableConnection {
  id             Int      @id @default(autoincrement())
  companyId      Int      @unique
  company        Company  @relation(fields: [companyId], references: [id])
  apiKey         String   // Encrypted
  accountUrl     String
  isActive       Boolean  @default(true)
  lastSyncAt     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model BooqableSync {
  id               Int      @id @default(autoincrement())
  companyId        Int
  company          Company  @relation(fields: [companyId], references: [id])
  syncType         String   // PRODUCT, ORDER, CUSTOMER
  direction        String   // IMPORT, EXPORT
  status           String   // PENDING, IN_PROGRESS, SUCCESS, FAILED
  recordsProcessed Int      @default(0)
  recordsFailed    Int      @default(0)
  errorMessage     String?
  startedAt        DateTime @default(now())
  completedAt      DateTime?
}

model Equipment {
  // ... existing fields ...
  booqableId        String?  @unique
  booqableUpdatedAt DateTime?
  syncStatus        String   @default("LOCAL") // LOCAL, SYNCED, CONFLICT
}

model Order {
  // ... existing fields ...
  booqableId        String?  @unique
  booqableUpdatedAt DateTime?
  syncStatus        String   @default("LOCAL")
}

model Customer {
  // ... existing fields ...
  booqableId        String?  @unique
  booqableUpdatedAt DateTime?
  syncStatus        String   @default("LOCAL")
}
```

#### 1.2 BooqableService
`backend/src/services/booqable.ts`
```typescript
export class BooqableService {
  private apiKey: string;
  private baseUrl = 'https://api.booqable.com/1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Products
  async getProducts(page = 1, perPage = 100) { }
  async getProduct(id: string) { }
  async createProduct(data: any) { }
  async updateProduct(id: string, data: any) { }

  // Orders
  async getOrders(filters?: any) { }
  async getOrder(id: string) { }
  async createOrder(data: any) { }
  async updateOrder(id: string, data: any) { }

  // Customers
  async getCustomers(page = 1, perPage = 100) { }
  async getCustomer(id: string) { }
  async createCustomer(data: any) { }
  async updateCustomer(id: string, data: any) { }

  // Webhooks
  async createWebhook(url: string, events: string[]) { }
  async deleteWebhook(id: string) { }
  async verifyWebhook(payload: any, signature: string): boolean { }
}
```

#### 1.3 Sync Service
`backend/src/services/booqableSync.ts`
```typescript
export class BooqableSyncService {
  async initialSync(companyId: number) {
    // 1. Sync all products
    // 2. Sync all customers
    // 3. Sync recent orders
    // 4. Setup webhooks
  }

  async syncProducts(companyId: number) { }
  async syncOrders(companyId: number) { }
  async syncCustomers(companyId: number) { }

  private mapBooqableProduct(product: any): Equipment { }
  private mapBooqableOrder(order: any): Order { }
  private mapBooqableCustomer(customer: any): Customer { }

  private resolveConflict(localData: any, remoteData: any) {
    // Last-write-wins strategy
  }
}
```

---

### Phase 2: API Endpoints (1 gün)

`backend/src/routes/booqable.ts`
```typescript
// Configuration
POST   /api/booqable/connect        - API key kaydet ve test et
DELETE /api/booqable/disconnect     - Bağlantıyı kapat
GET    /api/booqable/status         - Bağlantı durumu

// Manual Sync
POST   /api/booqable/sync/products  - Tüm products sync
POST   /api/booqable/sync/orders    - Tüm orders sync
POST   /api/booqable/sync/customers - Tüm customers sync
POST   /api/booqable/sync/all       - Full sync

// Webhook Handler
POST   /api/booqable/webhook        - Booqable webhook receiver

// Logs
GET    /api/booqable/sync-history   - Sync history
GET    /api/booqable/sync/:id       - Sync detail
```

---

### Phase 3: Frontend UI (1 gün)

#### 3.1 Settings Page - Booqable Tab
`frontend/src/pages/Admin.tsx` (yeni tab)

**Features:**
- [ ] API Key input (encrypted storage)
- [ ] "Connect to Booqable" butonu
- [ ] Connection status badge
- [ ] Last sync time
- [ ] Manual sync buttons (Products, Orders, All)
- [ ] Sync history table (son 20 sync)
- [ ] Error log viewer

**Wireframe:**
```
┌─────────────────────────────────────┐
│ Booqable Integration               │
├─────────────────────────────────────┤
│ Status: ● Connected                │
│ Last Sync: 2 minutes ago           │
│                                     │
│ [Disconnect]                       │
├─────────────────────────────────────┤
│ Manual Sync                        │
│ [Sync Products] [Sync Orders]     │
│ [Sync All]                         │
├─────────────────────────────────────┤
│ Sync History                       │
│ Type  | Status | Records | Time    │
│ ------|--------|---------|---------|
│ ALL   | ✓      | 523     | 2m ago  │
│ ORDER | ✓      | 12      | 15m ago │
└─────────────────────────────────────┘
```

#### 3.2 Equipment Page - Booqable Indicator
Booqable'dan sync edilen ekipmanlarda badge göster:
```tsx
{equipment.booqableId && (
  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
    Booqable
  </span>
)}
```

---

### Phase 4: Webhook Implementation (1 gün)

#### 4.1 Webhook Receiver
`backend/src/routes/booqable.ts`
```typescript
router.post('/webhook', async (req, res) => {
  const { event, data } = req.body;

  // Verify webhook signature
  if (!verifyBooqableSignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  switch (event) {
    case 'product.created':
      await handleProductCreated(data);
      break;
    case 'product.updated':
      await handleProductUpdated(data);
      break;
    case 'order.created':
      await handleOrderCreated(data);
      break;
    case 'order.updated':
      await handleOrderUpdated(data);
      break;
  }

  res.json({ success: true });
});
```

#### 4.2 Railway Webhook URL
```
https://canary-production-5a09.up.railway.app/api/booqable/webhook
```

Bu URL'yi Booqable dashboard'da kaydet.

---

### Phase 5: Error Handling & Testing (1 gün)

#### 5.1 Error Scenarios
- [ ] API key invalid
- [ ] Rate limit exceeded (429)
- [ ] Network timeout
- [ ] Duplicate data (409)
- [ ] Missing foreign key (customer not found)
- [ ] Webhook signature mismatch

#### 5.2 Test Cases
```typescript
describe('BooqableSync', () => {
  it('should sync 100 products successfully', async () => {});
  it('should handle rate limiting gracefully', async () => {});
  it('should resolve conflicts (last-write-wins)', async () => {});
  it('should rollback on error', async () => {});
});
```

---

## 🎯 SUCCESS CRITERIA

1. ✅ API connection successful
2. ✅ 100+ products synced without error
3. ✅ Orders sync bidirectionally
4. ✅ Webhooks working real-time
5. ✅ Conflict resolution working
6. ✅ Error logs accessible
7. ✅ Performance: <5s for 100 records

---

## 💰 COST ANALYSIS

### Booqable API Pricing
- **Basic Plan:** 100 requests/min = FREE
- **Advanced Plan:** 1000 requests/min = Contact Sales

### Estimated Usage (Medium Business)
- Initial sync: ~500 requests (one-time)
- Daily sync: ~50 requests/day
- Webhooks: Unlimited (inbound)

**Sonuç:** Basic plan yeterli

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Database migration (`npx prisma migrate dev`)
- [ ] Environment variables (`BOOQABLE_WEBHOOK_SECRET`)
- [ ] Backend deploy (Railway)
- [ ] Frontend deploy (Vercel)
- [ ] Webhook URL Booqable'da kayıt
- [ ] Test account ile full sync test
- [ ] Documentation update

---

## 📚 REFERENCES

- [Booqable API Docs](https://docs.booqable.com/api)
- [Webhook Best Practices](https://docs.booqable.com/webhooks)
- [Rate Limiting](https://docs.booqable.com/rate-limiting)

---

## 🎓 LEARNINGS

Bu entegrasyon şunları öğretecek:
- External API integration patterns
- Webhook handling & security
- Data synchronization strategies
- Conflict resolution algorithms
- Rate limiting & retry logic
- Background job processing

---

**NEXT STEPS:** Implementation başlasın mı? 🚀
