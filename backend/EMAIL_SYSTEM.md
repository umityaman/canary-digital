# 📧 CANARY Email System Documentation

## Genel Bakış

CANARY ERP'nin otomatik email sistemi, müşterilere zamanında bildirimler göndermek için tasarlanmıştır. Sistem 11 farklı email template'i ve otomatik zamanlanmış hatırlatmalardan oluşur.

---

## 📋 Email Templates

### 1. Welcome Email (`welcome.hbs`)
**Ne zaman gönderilir:** Yeni kullanıcı kaydolduğunda  
**Kullanım:**
```typescript
await sendWelcomeEmail('user@example.com', {
  name: 'Ahmet Yılmaz',
  email: 'user@example.com',
  companyName: 'CANARY ERP',
  loginUrl: 'https://canary.com/login'
});
```

### 2. Order Confirmation (`order-confirmation.hbs`)
**Ne zaman gönderilir:** Sipariş oluşturulduğunda (otomatik)  
**Kullanım:** `/api/orders` POST endpoint'i otomatik gönderir  
**İçerik:**
- Sipariş numarası
- Tarih aralığı
- Ekipman listesi ve fiyatları
- Toplam tutar
- Teslimat bilgileri

### 3. Pickup Reminder (`pickup-reminder.hbs`)
**Ne zaman gönderilir:** Teslim alma gününden 1 gün önce saat 09:00 (otomatik)  
**İçerik:**
- Teslim alma tarihi ve saati
- Ekipman listesi
- Teslim alma adresi
- İletişim bilgileri

### 4. Return Reminder (`return-reminder.hbs`)
**Ne zaman gönderilir:** İade günü sabah saat 10:00 (otomatik)  
**İçerik:**
- İade tarihi ve saati
- İade edilecek ekipmanlar
- Gecikme ücreti uyarısı
- İade adresi

### 5. Invoice (`invoice.hbs`)
**Ne zaman gönderilir:** Manuel olarak fatura gönderildiğinde  
**İçerik:**
- Fatura numarası ve tarihi
- Şirket bilgileri
- Detaylı ürün tablosu
- Vergi ve toplam tutar
- PDF indirme linki
- Ödeme linki (ödenmediyse)

### 6. Payment Confirmation (`payment-confirmation.hbs`)
**Ne zaman gönderilir:** Ödeme başarılı olduğunda  
**İçerik:**
- Ödeme tutarı
- İşlem ID
- Ödeme yöntemi
- Makbuz indirme linki

### 7. Late Payment Warning (`late-payment.hbs`)
**Ne zaman gönderilir:** Ödeme vadesi geçtiğinde (planlanan: günlük saat 11:00)  
**İçerik:**
- Gecikmiş tutar
- Gecikme süresi
- Gecikme ücreti
- Acil ödeme linki

### 8. Password Reset (`password-reset.hbs`)
**Ne zaman gönderilir:** Kullanıcı şifre sıfırlama talep ettiğinde  
**İçerik:**
- Şifre sıfırlama linki
- Link geçerlilik süresi
- Güvenlik uyarısı

### 9. Inspection Report (`inspection-report.hbs`)
**Ne zaman gönderilir:** Ekipman kontrolü tamamlandığında  
**İçerik:**
- Kontrol tarihi ve türü
- Ekipman durumları (OK/Hasarlı)
- Hasar bedeli (varsa)
- Detaylı rapor linki

### 10. Monthly Summary (`monthly-summary.hbs`)
**Ne zaman gönderilir:** Her ay başında (planlanan)  
**İçerik:**
- Aylık istatistikler (sipariş, gün, harcama)
- En çok kiralanan ekipmanlar
- Yaklaşan rezervasyonlar

### 11. Promotional Email (`promotional.hbs`)
**Ne zaman gönderilir:** Manuel kampanya gönderiminde  
**İçerik:**
- İndirim kodu
- İndirim oranı
- Kampanya koşulları
- Son kullanma tarihi

---

## 🤖 Otomatik Scheduler'lar

### Pickup Reminder Job
- **Çalışma Saati:** Her gün 09:00
- **Cron:** `0 9 * * *`
- **Görev:** Yarın başlayan siparişler için hatırlatma gönder
- **Durum Filtresi:** PENDING, CONFIRMED

### Return Reminder Job
- **Çalışma Saati:** Her gün 10:00
- **Cron:** `0 10 * * *`
- **Görev:** Bugün biten siparişler için iade hatırlatması gönder
- **Durum Filtresi:** ACTIVE

### Late Payment Check Job (Hazırlanıyor)
- **Çalışma Saati:** Her gün 11:00
- **Cron:** `0 11 * * *`
- **Görev:** Gecikmiş ödemeleri kontrol et ve uyarı gönder
- **Durum:** Payment sistemi implement edildiğinde aktif olacak

---

## 🧪 Email Test Endpointi

### Test Endpoint
```
POST /api/test-email/:templateName
Content-Type: application/json

{
  "to": "test@example.com"
}
```

### Kullanılabilir Template'ler
```bash
# Welcome email
curl -X POST http://localhost:4000/api/test-email/welcome \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Order confirmation
curl -X POST http://localhost:4000/api/test-email/order-confirmation \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Pickup reminder
curl -X POST http://localhost:4000/api/test-email/pickup-reminder \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Return reminder
curl -X POST http://localhost:4000/api/test-email/return-reminder \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Invoice
curl -X POST http://localhost:4000/api/test-email/invoice \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Payment confirmation
curl -X POST http://localhost:4000/api/test-email/payment-confirmation \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Late payment warning
curl -X POST http://localhost:4000/api/test-email/late-payment \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Password reset
curl -X POST http://localhost:4000/api/test-email/password-reset \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Inspection report
curl -X POST http://localhost:4000/api/test-email/inspection-report \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Monthly summary
curl -X POST http://localhost:4000/api/test-email/monthly-summary \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'

# Promotional email
curl -X POST http://localhost:4000/api/test-email/promotional \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

### Template Listesini Görme
```bash
GET /api/test-email
```

---

## ⚙️ Environment Variables

### Gmail SMTP Ayarları
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_FROM=your-gmail@gmail.com
```

### Scheduler Ayarları
```env
# Email scheduler'ları devre dışı bırakmak için
ENABLE_EMAIL_SCHEDULERS=false

# Frontend URL (email link'lerinde kullanılır)
FRONTEND_URL=https://frontend-5a3yqvtgp-umityamans-projects.vercel.app
```

---

## 📁 Dosya Yapısı

```
backend/
├── src/
│   ├── templates/
│   │   └── emails/
│   │       ├── welcome.hbs
│   │       ├── order-confirmation.hbs
│   │       ├── pickup-reminder.hbs
│   │       ├── return-reminder.hbs
│   │       ├── invoice.hbs
│   │       ├── payment-confirmation.hbs
│   │       ├── late-payment.hbs
│   │       ├── password-reset.hbs
│   │       ├── inspection-report.hbs
│   │       ├── monthly-summary.hbs
│   │       └── promotional.hbs
│   ├── services/
│   │   ├── emailTemplate.service.ts  # Handlebars loader
│   │   └── scheduler.ts              # Cron jobs
│   ├── utils/
│   │   └── emailService.ts           # Email fonksiyonları
│   └── routes/
│       ├── email-test.ts             # Test endpoint
│       └── orders.ts                 # Order email entegrasyonu
```

---

## 🚀 Deployment Checklist

### Railway Deploy Öncesi
- [x] Gmail App Password oluştur
- [x] Railway'de EMAIL_USER ve EMAIL_PASSWORD env variable'ları ekle
- [x] FRONTEND_URL'i ayarla
- [x] ENABLE_EMAIL_SCHEDULERS=true olarak ayarla (production'da)

### Test Sonrası
- [ ] Her template'i en az 1 kez test et
- [ ] Scheduler log'larını kontrol et (saat 09:00, 10:00, 11:00)
- [ ] Order oluşturulduğunda email gidiyor mu kontrol et
- [ ] Email'lerin spam'e düşmediğini doğrula

---

## 🐛 Troubleshooting

### Email gönderilmiyor
1. Gmail App Password doğru mu?
2. EMAIL_USER ve EMAIL_PASSWORD environment variable'ları ayarlandı mı?
3. Backend log'larına bak: `2025-10-14 17:42:54 [info]: ✅ Gmail SMTP initialized successfully`

### Scheduler çalışmıyor
1. ENABLE_EMAIL_SCHEDULERS=false olabilir mi?
2. Backend başlatıldığında şu log görünüyor mu: `📧 Email schedulers initialized`
3. Cron expression'ları doğru mu?

### Template render edilmiyor
1. Template dosyası var mı? (`backend/src/templates/emails/`)
2. Handlebars syntax doğru mu?
3. emailTemplate.service.ts'de compileTemplate fonksiyonu çalışıyor mu?

---

## 📊 Monitoring & Analytics

### Email Log'ları
```typescript
// Success log
console.log(`✅ Order confirmation email sent to ${email}`);

// Error log
console.error('❌ Failed to send email:', error.message);
```

### Scheduler Log'ları
```
2025-10-14 09:00:00 [info]: 🔔 Pickup reminder job started
2025-10-14 09:00:05 [info]: Found 3 orders starting tomorrow
2025-10-14 09:00:10 [info]: ✅ Pickup reminder sent for order ORD-123 to customer@example.com
2025-10-14 09:00:15 [info]: 🔔 Pickup reminder job completed
```

---

## 🔮 Gelecek İyileştirmeler

- [ ] Email send history database'e kayıt
- [ ] Email açılma/tıklama tracking
- [ ] A/B testing için multiple template versiyonları
- [ ] Email queue sistemi (Bull/Redis)
- [ ] Unsubscribe/opt-out mechanism
- [ ] Email preferences per customer
- [ ] SendGrid/AWS SES integration (Gmail yerine)
- [ ] Email analytics dashboard

---

## 📞 Destek

Sorularınız için:
- Backend logs: `railway logs`
- Test endpoint: `GET /api/test-email`
- Email service: `backend/src/utils/emailService.ts`

---

**Son Güncelleme:** 14 Ocak 2025  
**Versiyon:** 1.0.0  
**Durum:** ✅ Production Ready
