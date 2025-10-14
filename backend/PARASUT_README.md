# Paraşüt Entegrasyonu - Kullanım Rehberi

## 📋 Genel Bakış

CANARY Rental Software için Paraşüt muhasebe entegrasyonu tamamlandı. Bu entegrasyon ile:
- ✅ Otomatik fatura oluşturma (e-Fatura/e-Arşiv)
- ✅ Ödeme takibi
- ✅ Gecikme cezası faturalama
- ✅ Depozito iadesi
- ✅ Müşteri senkronizasyonu

---

## 🚀 Kurulum Adımları

### 1. Paraşüt Hesabı Oluşturma

1. https://uygulama.parasut.com adresine gidin
2. Ücretsiz hesap oluşturun (14 gün deneme)
3. Şirket bilgilerinizi girin

### 2. API Credentials Alma

1. Paraşüt'e login olun
2. **Hesap Ayarları** > **Entegrasyonlar** > **API**
3. **Yeni API Anahtarı Oluştur** butonuna tıklayın
4. **Client ID** ve **Secret Key**'i kopyalayın
5. **Company ID**'yi URL'den alın
   - Örnek: `https://uygulama.parasut.com/123456/dashboard`
   - Company ID: `123456`

### 3. Environment Variables

`.env` dosyanızı güncelleyin:

```env
# Paraşüt API Configuration
PARASUT_CLIENT_ID="your-client-id"
PARASUT_CLIENT_SECRET="your-secret-key"
PARASUT_USERNAME="your-email@example.com"
PARASUT_PASSWORD="your-parasut-password"
PARASUT_COMPANY_ID="123456"
PARASUT_DEFAULT_ACCOUNT_ID="your-bank-account-id"
```

### 4. Varsayılan Banka Hesabı ID'si Alma

API ile hesapları listeleyin:

```bash
GET /api/invoices/parasut/accounts
```

Veya Paraşüt web arayüzünde:
1. **Hesaplar** > **Banka Hesapları**
2. Kullanmak istediğiniz hesabın ID'sini not edin

### 5. Database Migration

**ÖNEMLİ:** Sunucuyu kapatın (tüm terminal ve Node süreçlerini durdurun), sonra:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name add_invoice_payment_models
```

### 6. Sunucuyu Başlatın

```bash
npm run dev
```

---

## 📡 API Endpoints

### 1. Kiralama Faturası Oluşturma

**POST** `/api/invoices/rental`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": 1,
  "customerId": 2,
  "items": [
    {
      "equipmentId": 5,
      "description": "Canon EOS 5D Mark IV",
      "quantity": 1,
      "unitPrice": 500.00,
      "days": 3,
      "discountPercentage": 10
    }
  ],
  "startDate": "2025-10-13",
  "endDate": "2025-10-16",
  "notes": "Kiralama faturası"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": 1,
    "invoiceNumber": "2025000001",
    "grandTotal": 1593.00,
    "status": "sent"
  }
}
```

---

### 2. Ödeme Kaydetme

**POST** `/api/invoices/:id/payment`

**Body:**
```json
{
  "amount": 1593.00,
  "paymentDate": "2025-10-13",
  "paymentMethod": "credit_card",
  "transactionId": "TXN123456",
  "notes": "Kredi kartı ile ödeme"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "id": 1,
    "amount": 1593.00,
    "paymentDate": "2025-10-13T00:00:00.000Z"
  }
}
```

---

### 3. Gecikme Cezası Faturası

**POST** `/api/invoices/late-fee`

**Body:**
```json
{
  "orderId": 1,
  "lateDays": 2,
  "dailyFee": 50.00,
  "notes": "Ekipman iade gecikmesi"
}
```

---

### 4. Depozito İade Faturası

**POST** `/api/invoices/deposit-refund`

**Body:**
```json
{
  "orderId": 1,
  "depositAmount": 500.00,
  "notes": "Ekipman hasarsız teslim edildi"
}
```

---

### 5. Fatura Detayları

**GET** `/api/invoices/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoiceNumber": "2025000001",
    "invoiceDate": "2025-10-13T00:00:00.000Z",
    "dueDate": "2025-10-16T00:00:00.000Z",
    "totalAmount": 1350.00,
    "vatAmount": 243.00,
    "grandTotal": 1593.00,
    "paidAmount": 1593.00,
    "status": "paid",
    "type": "rental",
    "order": { ... },
    "customer": { ... },
    "payments": [ ... ]
  }
}
```

---

### 6. Müşteri Faturaları

**GET** `/api/invoices/customer/:customerId`

**Query Params:**
- `status` - draft, sent, paid, partial_paid, cancelled, overdue
- `type` - rental, late_fee, deposit_refund
- `startDate` - ISO date (2025-01-01)
- `endDate` - ISO date (2025-12-31)

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 5
}
```

---

### 7. Fatura İptal

**DELETE** `/api/invoices/:id`

**Body:**
```json
{
  "reason": "Müşteri talebi ile iptal"
}
```

---

### 8. Ödeme Planı Oluşturma

**POST** `/api/invoices/payment-plan`

**Body:**
```json
{
  "orderId": 1,
  "totalAmount": 5000.00,
  "installments": 3,
  "startDate": "2025-10-13"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "installmentNumber": 1, "amount": 1666.67, "dueDate": "2025-10-13" },
    { "installmentNumber": 2, "amount": 1666.67, "dueDate": "2025-11-13" },
    { "installmentNumber": 3, "amount": 1666.66, "dueDate": "2025-12-13" }
  ]
}
```

---

## 🔄 Otomatik Workflow Örneği

### Sipariş Tamamlama Senaryosu

```typescript
// 1. Sipariş oluşturulduğunda
const order = await createOrder({...});

// 2. Fatura oluştur
const invoice = await fetch('/api/invoices/rental', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: order.id,
    customerId: order.customerId,
    items: order.items,
    startDate: order.startDate,
    endDate: order.endDate
  })
});

// 3. Ödeme alındığında
const payment = await fetch(`/api/invoices/${invoice.id}/payment`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: invoice.grandTotal,
    paymentDate: new Date(),
    paymentMethod: 'credit_card',
    transactionId: 'TXN123'
  })
});

// 4. Ekipman geç teslim edilirse
if (returnDate > order.endDate) {
  const lateDays = calculateLateDays(returnDate, order.endDate);
  const lateFeeInvoice = await fetch('/api/invoices/late-fee', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      orderId: order.id,
      lateDays: lateDays,
      dailyFee: 50.00
    })
  });
}

// 5. Ekipman hasarsız iade edilirse depozito iade et
if (equipmentCondition === 'good') {
  const refundInvoice = await fetch('/api/invoices/deposit-refund', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      orderId: order.id,
      depositAmount: order.depositAmount
    })
  });
}
```

---

## 🗄️ Database Schema

### Invoice Tablosu

```prisma
model Invoice {
  id                Int       @id @default(autoincrement())
  orderId           Int
  customerId        Int
  parasutInvoiceId  String?   @unique
  invoiceNumber     String?
  invoiceDate       DateTime
  dueDate           DateTime
  totalAmount       Float
  vatAmount         Float
  grandTotal        Float
  paidAmount        Float     @default(0)
  status            String    @default("draft")
  type              String    @default("rental")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  order             Order     @relation(...)
  customer          User      @relation(...)
  payments          Payment[]
}
```

### Payment Tablosu

```prisma
model Payment {
  id                Int       @id @default(autoincrement())
  invoiceId         Int
  amount            Float
  paymentDate       DateTime
  paymentMethod     String
  transactionId     String?
  parasutPaymentId  String?   @unique
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  invoice           Invoice   @relation(...)
}
```

### Refund Tablosu

```prisma
model Refund {
  id                Int       @id @default(autoincrement())
  orderId           Int
  amount            Float
  reason            String
  transactionId     String?
  status            String    @default("pending")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

---

## 🧪 Test Etme

### 1. Paraşüt Bağlantısını Test Et

```bash
# Backend'i başlatın ve logs'u izleyin
npm run dev

# Log'larda şunu göreceksiniz:
# ✓ Paraşüt: Access token başarıyla alındı
```

### 2. API Test (Postman/Thunder Client)

1. **Login** yapın ve JWT token alın
2. Yukarıdaki endpoint'leri sırayla test edin
3. Paraşüt web arayüzünde faturaları kontrol edin

### 3. Manuel Test Senaryosu

1. Yeni müşteri oluşturun
2. Sipariş oluşturun
3. Fatura oluşturun (`POST /api/invoices/rental`)
4. Paraşüt'te faturayı kontrol edin
5. Ödeme kaydedin (`POST /api/invoices/:id/payment`)
6. Fatura durumunun "paid" olduğunu kontrol edin

---

## ⚠️ Önemli Notlar

### 1. Token Yenileme
- Access token 7200 saniye (2 saat) geçerlidir
- Otomatik olarak yenilenir, manuel işlem gerekmez

### 2. Rate Limiting
- Paraşüt API: 100 istek/dakika
- Aşarsanız 429 hatası alırsınız

### 3. KDV Oranı
- Varsayılan %18
- `backend/src/services/invoice.service.ts` içinde değiştirilebilir

### 4. Fatura Tipleri
- **e-Fatura**: Vergi numarası olan müşterilere (B2B)
- **e-Arşiv**: Vergi numarası olmayan müşterilere (B2C)
- Otomatik seçim yapılır

### 5. Müşteri Senkronizasyonu
- İlk fatura oluşturulduğunda Paraşüt'te otomatik müşteri oluşturulur
- `parasutContactId` User tablosunda saklanır

---

## 🐛 Troubleshooting

### "Paraşüt authentication failed"
- `.env` dosyasında credentials'ları kontrol edin
- Username/password doğru mu?
- API keys geçerli mi?

### "Customer not found in Paraşüt"
- Müşterinin ilk faturası oluşturulmamış olabilir
- Manuel olarak müşteri oluşturup ID'yi kaydedin

### "Invoice not found"
- Fatura ID'sini kontrol edin
- Database'de invoice var mı kontrol edin

### "Payment failed"
- `PARASUT_DEFAULT_ACCOUNT_ID` environment variable set edilmiş mi?
- Hesap ID geçerli mi?

---

## 📞 Destek

### Paraşüt Destek
- **Email:** destek@parasut.com
- **Telefon:** +90 850 260 0 260
- **Dokümantasyon:** https://api.parasut.com.tr

### API Dokümantasyonu
- https://api.parasut.com.tr/docs/v4

---

## 🔄 Gelecek Özellikler (Opsiyonel)

- [ ] Toplu fatura oluşturma
- [ ] Periyodik faturalama (abonelikler için)
- [ ] E-fatura PDF indirme
- [ ] Fatura istatistikleri dashboard
- [ ] E-defter entegrasyonu
- [ ] Vergi raporları
- [ ] Otomatik hatırlatma sistemi (vadesi yaklaşan faturalar)
- [ ] WhatsApp/SMS fatura bildirimleri

---

**Son Güncelleme:** 13 Ekim 2025  
**Versiyon:** 1.0.0  
**Durum:** ✅ Production Ready
