# iyzico Payment Gateway Integration

Bu dokümantasyon, sistemimize entegre edilen iyzico ödeme gateway'inin kullanımını ve yapılandırmasını açıklar.

## İçindekiler

- [Genel Bakış](#genel-bakış)
- [Kurulum](#kurulum)
- [Yapılandırma](#yapılandırma)
- [API Endpoints](#api-endpoints)
- [3D Secure Ödeme Akışı](#3d-secure-ödeme-akışı)
- [Test Kartları](#test-kartları)
- [Taksit Seçenekleri](#taksit-seçenekleri)
- [İade ve İptal İşlemleri](#iade-ve-iptal-işlemleri)
- [Webhook Entegrasyonu](#webhook-entegrasyonu)
- [Hata Kodları](#hata-kodları)
- [Güvenlik](#güvenlik)
- [Production Checklist](#production-checklist)

---

## Genel Bakış

iyzico, Türkiye'nin önde gelen ödeme gateway'lerinden biridir. Bu entegrasyon şunları sağlar:

- **3D Secure Ödeme**: PSD2 uyumlu güvenli ödeme
- **Taksit Desteği**: 2-12 ay arası taksit seçenekleri
- **İade ve İptal**: Esnek iade ve iptal işlemleri
- **BIN Sorgulama**: Kart bilgilerini otomatik algılama
- **Webhook Desteği**: Gerçek zamanlı ödeme bildirimleri

### Dosya Yapısı

```
backend/
├── src/
│   ├── config/
│   │   └── iyzico.ts              # iyzico API client
│   ├── services/
│   │   └── payment.service.ts     # Payment business logic
│   ├── routes/
│   │   └── payment.ts             # Payment API endpoints
│   └── app.ts                     # Route integration
├── prisma/
│   └── schema.prisma              # Transaction & Card models
└── IYZICO_README.md               # Bu dosya
```

---

## Kurulum

### 1. Paket Kurulumu

```bash
npm install iyzipay
```

### 2. Environment Variables

`.env` dosyasına aşağıdaki değişkenleri ekleyin:

```bash
# iyzico Configuration
IYZICO_API_KEY="your-api-key"
IYZICO_SECRET_KEY="your-secret-key"
BACKEND_URL="http://localhost:4000"
NODE_ENV="development"  # "production" için canlı ortam
```

### 3. API Credentials Alma

1. [iyzico Merchant Panel](https://merchant.iyzipay.com)'e giriş yapın
2. **Hesabım > Ayarlar > API Anahtarlarım** bölümüne gidin
3. **Test Ortamı** için Sandbox API Key & Secret Key'i kopyalayın
4. Production için **Canlı Ortam** API anahtarlarını kullanın

### 4. Database Migration

```bash
npx prisma generate
npx prisma migrate dev --name add_payment_models
```

---

## Yapılandırma

### iyzico Client

`backend/src/config/iyzico.ts` dosyası iyzico API client'ını içerir:

```typescript
import { IyzicoClient } from './config/iyzico';

const iyzicoClient = IyzicoClient.getInstance();

// Yapılandırma kontrolü
if (!iyzicoClient.isConfigured()) {
  console.error('iyzico not configured!');
}
```

### Test vs Production

Ortam `NODE_ENV` environment variable ile kontrol edilir:

- `NODE_ENV=development`: Sandbox ortamı (test kartları)
- `NODE_ENV=production`: Canlı ortam (gerçek kartlar)

---

## API Endpoints

### 1. Ödeme Başlatma

**Endpoint:** `POST /api/payment/initiate`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": 123,
  "customerId": 456,
  "amount": 500.00,
  "installment": 3,
  "cardHolderName": "John Doe",
  "cardNumber": "5528790000000008",
  "expireMonth": "12",
  "expireYear": "2030",
  "cvc": "123",
  "saveCard": false
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": 789,
  "threeDSHtmlContent": "<html>...</html>",
  "conversationId": "order-123-1697123456789"
}
```

**3D Secure HTML:**
`threeDSHtmlContent` içeriğini frontend'de render edin:

```javascript
// React örneği
const PaymentPage = ({ threeDSHtmlContent }) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: threeDSHtmlContent }} />
  );
};
```

### 2. Callback İşleme

**Endpoint:** `POST /api/payment/callback`

Bu endpoint iyzico tarafından otomatik olarak çağrılır. Frontend'den manuel çağrı gerekmez.

**iyzico'dan Gelen Data:**
```json
{
  "conversationData": "order-123-1697123456789",
  "paymentId": "12345678",
  "mdStatus": "1"
}
```

**Başarılı Ödeme:**
Kullanıcı otomatik olarak `/payment/success?orderId=123&transactionId=789` sayfasına yönlendirilir.

**Başarısız Ödeme:**
Kullanıcı `/payment/failed?orderId=123` sayfasına yönlendirilir.

### 3. İade İşlemi

**Endpoint:** `POST /api/payment/:id/refund`

**Request:**
```json
{
  "amount": 250.00,  // Opsiyonel (belirtilmezse tam iade)
  "reason": "Müşteri talebi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund completed successfully",
  "refundId": 101,
  "amount": 250.00
}
```

### 4. İptal İşlemi

**Endpoint:** `POST /api/payment/:id/cancel`

Not: Sadece henüz bankalara gitmemiş ödemeler iptal edilebilir (genelde aynı gün).

**Request:**
```json
{
  "reason": "Yanlış tutar girildi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment cancelled successfully"
}
```

### 5. Ödeme Detayları

**Endpoint:** `GET /api/payment/:id`

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": 789,
    "orderId": 123,
    "amount": 500.00,
    "status": "completed",
    "cardNumber": "****0008",
    "installment": 3,
    "createdAt": "2025-10-13T10:30:00Z"
  }
}
```

### 6. Müşteri Ödemeleri

**Endpoint:** `GET /api/payment/customer/:customerId?status=completed&startDate=2025-01-01`

**Response:**
```json
{
  "success": true,
  "count": 15,
  "transactions": [...]
}
```

### 7. Taksit Bilgileri

**Endpoint:** `POST /api/payment/installments`

**Request:**
```json
{
  "binNumber": "552879",
  "price": 1000.00
}
```

**Response:**
```json
{
  "success": true,
  "installmentOptions": [
    {
      "installmentNumber": 1,
      "totalPrice": 1000.00
    },
    {
      "installmentNumber": 3,
      "totalPrice": 1050.00,
      "installmentPrice": 350.00
    }
  ]
}
```

### 8. Kart Bilgileri (BIN Sorgulaması)

**Endpoint:** `POST /api/payment/card-info`

**Request:**
```json
{
  "binNumber": "552879"
}
```

**Response:**
```json
{
  "success": true,
  "cardType": "CREDIT_CARD",
  "cardAssociation": "MASTER_CARD",
  "cardFamily": "Bonus",
  "bankName": "Garanti Bankası",
  "commercial": 0
}
```

### 9. Ödeme İstatistikleri

**Endpoint:** `GET /api/payment/stats/summary?startDate=2025-01-01&endDate=2025-12-31`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalTransactions": 150,
    "totalAmount": 75000.00,
    "totalRefunded": 2500.00,
    "netAmount": 72500.00,
    "averageAmount": 500.00,
    "byInstallment": {
      "1": { "count": 100, "amount": 50000.00 },
      "3": { "count": 30, "amount": 15000.00 },
      "6": { "count": 20, "amount": 10000.00 }
    }
  }
}
```

---

## 3D Secure Ödeme Akışı

```
[Frontend] → [Backend] → [iyzico] → [Banka] → [iyzico] → [Backend] → [Frontend]
```

### Adım 1: Ödeme Başlatma

Frontend, `/api/payment/initiate` endpoint'ine ödeme bilgilerini gönderir.

### Adım 2: 3D Secure Sayfası

Backend, iyzico'dan 3D Secure HTML içeriğini alır ve frontend'e döner.

### Adım 3: Banka Doğrulaması

Frontend, HTML içeriğini render eder. Kullanıcı bankasının 3D Secure sayfasında SMS/OTP doğrulaması yapar.

### Adım 4: Callback

Banka doğrulaması sonrası iyzico, `/api/payment/callback` endpoint'ini çağırır.

### Adım 5: Sonuç

Backend, ödeme durumunu kontrol eder ve kullanıcıyı success/failed sayfasına yönlendirir.

**Frontend Kod Örneği:**

```typescript
// 1. Ödeme başlatma
const initiatePayment = async (paymentData) => {
  const response = await fetch('/api/payment/initiate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });
  
  const result = await response.json();
  
  if (result.success) {
    // 3D Secure HTML'i render et
    setThreeDSHtml(result.threeDSHtmlContent);
  }
};

// 2. 3D Secure HTML render
<div dangerouslySetInnerHTML={{ __html: threeDSHtml }} />

// 3. Success sayfası
const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transactionId');
  
  return (
    <div>
      <h1>Ödeme Başarılı!</h1>
      <p>Sipariş No: {orderId}</p>
      <p>İşlem No: {transactionId}</p>
    </div>
  );
};
```

---

## Test Kartları

### Başarılı Ödeme

```
Kart Numarası: 5528790000000008
Son Kullanma: 12/2030
CVC: 123
3D Secure Şifresi: any
```

### Yetersiz Bakiye

```
Kart Numarası: 5528790000000032
Son Kullanma: 12/2030
CVC: 123
```

### Onaylanmadı

```
Kart Numarası: 5528790000000057
Son Kullanma: 12/2030
CVC: 123
```

### Test Kartları Listesi

```typescript
import { iyzicoClient } from './config/iyzico';

const testCards = iyzicoClient.getTestCards();
console.log(testCards);
```

---

## Taksit Seçenekleri

iyzico, 2-12 ay arası taksit seçeneklerini destekler. Taksit oranları banka ve kart tipine göre değişir.

### Taksit Sorgulama

```typescript
const installments = await paymentService.getInstallmentOptions(
  '552879',  // BIN number (kartın ilk 6 hanesi)
  1000.00    // Tutar
);

// Örnek sonuç:
[
  { installmentNumber: 1, totalPrice: 1000.00 },
  { installmentNumber: 3, totalPrice: 1050.00, installmentPrice: 350.00 },
  { installmentNumber: 6, totalPrice: 1100.00, installmentPrice: 183.33 },
  { installmentNumber: 9, totalPrice: 1150.00, installmentPrice: 127.78 },
]
```

### Taksit ile Ödeme

```json
{
  "installment": 3,
  "...": "..."
}
```

---

## İade ve İptal İşlemleri

### İade (Refund)

İade işlemi, tamamlanmış ödemeler için kullanılır. Kısmi veya tam iade yapılabilir.

**Tam İade:**
```typescript
await paymentService.refundPayment(transactionId);
```

**Kısmi İade:**
```typescript
await paymentService.refundPayment(transactionId, 250.00, 'Kısmi iade');
```

### İptal (Cancel)

İptal işlemi sadece henüz bankalara gitmemiş ödemeler için kullanılır (genelde aynı gün içinde).

```typescript
await paymentService.cancelPayment(transactionId, 'Yanlış tutar');
```

### İade vs İptal

| Özellik | İade (Refund) | İptal (Cancel) |
|---------|---------------|----------------|
| Zaman | Her zaman | Sadece aynı gün |
| Kısmi | Evet | Hayır |
| Banka Süreci | 2-10 gün | Anında |
| Komisyon | Alınır | Alınmaz |

---

## Webhook Entegrasyonu

iyzico, ödeme durumu değişikliklerini webhook ile bildirir.

### Webhook Endpoint

**URL:** `POST /api/payment/webhook`

### Webhook Tipleri

- `PAYMENT_SUCCESS`: Ödeme başarılı
- `PAYMENT_FAILED`: Ödeme başarısız
- `REFUND_SUCCESS`: İade başarılı

### Webhook Payload

```json
{
  "iyziEventType": "PAYMENT_SUCCESS",
  "status": "SUCCESS",
  "paymentId": "12345678",
  "...": "..."
}
```

### iyzico Merchant Panel'de Webhook URL Ekleme

1. [iyzico Merchant Panel](https://merchant.iyzipay.com) > Ayarlar > Webhook
2. Webhook URL: `https://yourdomain.com/api/payment/webhook`
3. Kaydet

---

## Hata Kodları

| Kod | Açıklama | Çözüm |
|-----|----------|--------|
| 5001 | Yetersiz bakiye | Müşteriden farklı kart istensin |
| 5046 | Do not honor | Banka ödemeyi reddetti |
| 5054 | Geçersiz kart numarası | Kart numarası kontrol edilsin |
| 5057 | Kredi kartınız internet işlemlerine kapalı | Müşteri bankasını arasın |
| 5084 | Geçersiz CVC | CVC kontrol edilsin |
| 5204 | Üye işyeri yetersiz bakiye | iyzico hesabınızı kontrol edin |

### Hata Yakalama

```typescript
try {
  await paymentService.initiatePayment(params);
} catch (error) {
  if (error.message.includes('5001')) {
    alert('Yetersiz bakiye. Lütfen farklı bir kart deneyin.');
  } else if (error.message.includes('5054')) {
    alert('Geçersiz kart numarası.');
  } else {
    alert('Ödeme başarısız. Lütfen tekrar deneyin.');
  }
}
```

---

## Güvenlik

### PCI DSS Compliance

- **Kart bilgileri asla saklanmaz**: Kart numaraları sadece maskelenmiş olarak (`****1234`) saklanır
- **HTTPS zorunlu**: Production ortamında SSL sertifikası gereklidir
- **3D Secure**: Tüm ödemeler 3D Secure ile korunur

### Best Practices

1. **Environment Variables**: API anahtarları asla kodda yer almamalı
2. **Rate Limiting**: Ödeme endpoint'leri için rate limiting ekleyin
3. **Logging**: Hassas bilgiler (CVC, kart numarası) loglanmamalı
4. **Token Expiry**: JWT token'ları düzenli olarak yenilenmeli
5. **IP Whitelisting**: Webhook endpoint'i sadece iyzico IP'lerinden kabul etmeli

---

## Production Checklist

### Gerekli Adımlar

- [ ] **iyzico Canlı Ortam API anahtarları** `.env` dosyasına eklendi
- [ ] **NODE_ENV=production** ayarlandı
- [ ] **BACKEND_URL** production domain'i ile güncellendi
- [ ] **SSL Sertifikası** kuruldu (HTTPS)
- [ ] **Webhook URL** iyzico panel'de yapılandırıldı
- [ ] **Database backup** stratejisi oluşturuldu
- [ ] **Error monitoring** (Sentry) aktif
- [ ] **Rate limiting** production değerleri ile güncellendi
- [ ] **CORS** sadece production frontend'i kabul ediyor
- [ ] **Test ödemeleri** canlı ortamda yapıldı

### Performance Optimizations

- [ ] Database indexler eklendi (Transaction tablosu)
- [ ] Redis cache iyzico API yanıtları için kullanılıyor
- [ ] CDN için static asset'ler optimize edildi

### Monitoring

- [ ] Ödeme başarı/başarısızlık oranları izleniyor
- [ ] Response time monitoring aktif
- [ ] Error rate alerts ayarlandı
- [ ] Daily payment report otomasyonu kuruldu

---

## İletişim ve Destek

**iyzico Destek:**
- Email: destek@iyzico.com
- Telefon: 0850 222 0 999
- Dokümantasyon: https://dev.iyzipay.com

**Proje Desteği:**
- İç ekip ile iletişim için Slack/Teams kullanın
- Bug reports için GitHub Issues

---

## Changelog

### v1.0.0 (13 Ekim 2025)
- ✅ Initial iyzico integration
- ✅ 3D Secure payment flow
- ✅ Refund and cancel operations
- ✅ Installment support
- ✅ BIN lookup
- ✅ Webhook integration
- ✅ Test environment ready
- ✅ Production-ready configuration

---

**Son Güncelleme:** 13 Ekim 2025  
**Versiyon:** 1.0.0  
**Durum:** Production Ready ✅
