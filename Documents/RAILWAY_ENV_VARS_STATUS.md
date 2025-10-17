# 🔑 RAILWAY ENVIRONMENT VARIABLES - DURUM RAPORU

**Tarih:** 16 Ekim 2025  
**Proje:** canary  
**Environment:** production

---

## ✅ MEVCUT VARIABLES (Zaten Var!)

| Variable | Durum | Notlar |
|----------|-------|--------|
| DATABASE_URL | ✅ | PostgreSQL bağlı |
| JWT_SECRET | ✅ | Güvenli random string |
| JWT_REFRESH_SECRET | ✅ | Refresh tokens için |
| EMAIL_USER | ✅ | seyyahyaman@gmail.com |
| EMAIL_PASSWORD | ✅ | Gmail App Password |
| EMAIL_FROM | ✅ | noreply@canary-erp.com |
| SENDGRID_API_KEY | ✅ | Email alternatifi |
| BACKEND_URL | ✅ | https://canary-production-5a09.up.railway.app |
| FRONTEND_URL | ✅ | Vercel URL |
| PORT | ✅ | 4000 |
| NODE_ENV | ✅ | production |

---

## ⚠️ EKSİK VARIABLES (Eklenecek)

### 🔴 KRİTİK (Backend'de hata veriyor)

#### 1. iyzico Payment Gateway
```bash
railway variables --set IYZICO_API_KEY="sandbox-xxx"
railway variables --set IYZICO_SECRET_KEY="sandbox-xxx"
```

**Not:** 
- Test için sandbox key'leri kullanılacak
- Production için merchant.iyzipay.com'dan alınır
- Backend başlangıcında bu değerler yoksa hata veriyor

---

### 🟡 ÖNEMLİ (Bazı özellikler çalışmıyor)

#### 2. Twilio WhatsApp (WhatsApp notifications için)
```bash
railway variables --set TWILIO_ACCOUNT_SID="your-sid"
railway variables --set TWILIO_AUTH_TOKEN="your-token"
railway variables --set TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

**Durum:** 
- WhatsApp notification sistemi hazır ama credentials yok
- Test için Twilio sandbox kullanılabilir
- Production için Twilio WhatsApp Business onayı gerekir

---

### 🟢 OPSIYONEL (İyileştirmeler)

#### 3. Paraşüt Accounting (Fatura entegrasyonu)
```bash
railway variables --set PARASUT_CLIENT_ID="xxx"
railway variables --set PARASUT_CLIENT_SECRET="xxx"
railway variables --set PARASUT_USERNAME="xxx"
railway variables --set PARASUT_PASSWORD="xxx"
railway variables --set PARASUT_COMPANY_ID="xxx"
railway variables --set PARASUT_DEFAULT_ACCOUNT_ID="xxx"
```

**Durum:**
- Fatura sistemi var ama Paraşüt olmadan da çalışır
- PDF invoice generation var (3 template)
- Paraşüt eklenirse muhasebe yazılımına otomatik aktarır

#### 4. Sentry Error Tracking
```bash
railway variables --set SENTRY_DSN="https://xxx@sentry.io/xxx"
```

**Durum:**
- Backend Sentry entegrasyonu hazır
- DSN yoksa gracefully devre dışı kalır
- Production'da hata takibi için önerilir

#### 5. Redis Caching
```bash
# Railway dashboard'dan Redis addon ekle
# Otomatik REDIS_URL variable oluşturur
```

**Durum:**
- Cache sistemi için opsiyonel
- Performance iyileştirmesi sağlar
- Zorunlu değil

#### 6. Google OAuth (Calendar sync için)
```bash
railway variables --set GOOGLE_CLIENT_ID="xxx"
railway variables --set GOOGLE_CLIENT_SECRET="xxx"
railway variables --set GOOGLE_CALLBACK_URL="https://canary-production-5a09.up.railway.app/api/auth/google/callback"
```

**Durum:**
- Google Calendar entegrasyonu hazır
- Credentials yoksa sadece manual calendar kullanılır
- OAuth flow için gerekli

---

## 🎯 ŞİMDİ NE YAPALIM?

### Seçenek 1: iyzico Test Keys (5 dk)
En hızlı çözüm. Backend'deki payment hatasını düzeltir.

```bash
# Test/Sandbox credentials kullan:
railway variables --set IYZICO_API_KEY="sandbox-xxxx"
railway variables --set IYZICO_SECRET_KEY="sandbox-xxxx"
```

**Sonuç:** Backend başarıyla çalışır, payment modülü test modunda çalışır

---

### Seçenek 2: Gerçek iyzico Hesabı (30 dk)
Gerçek ödeme almak istersen:

1. https://merchant.iyzipay.com adresine git
2. Hesap aç (ücretsiz)
3. Ayarlar > API Anahtarlarım
4. Production veya Sandbox key'lerini kopyala
5. Railway'e ekle

**Sonuç:** Gerçek ödeme alabilirsin

---

### Seçenek 3: iyzico'suz Devam (Şimdilik)
Payment modülünü şimdilik atlayabiliriz:

```typescript
// backend/src/app.ts içinde iyzico initialization'ı comment out
// Ama backend hata vermeye devam eder
```

**Önerilmez:** Backend başlangıcında hata veriyor

---

## 📋 HIZLI EKLEME KOMUTLARI

### Minimal Setup (Sadece iyzico test):
```bash
cd backend
railway variables --set IYZICO_API_KEY="sandbox-change-me"
railway variables --set IYZICO_SECRET_KEY="sandbox-change-me"
```

### Full Setup (Tüm özellikler):
```bash
cd backend

# iyzico (test mode)
railway variables --set IYZICO_API_KEY="sandbox-xxx"
railway variables --set IYZICO_SECRET_KEY="sandbox-xxx"

# Twilio WhatsApp (test mode)
railway variables --set TWILIO_ACCOUNT_SID="ACxxxx"
railway variables --set TWILIO_AUTH_TOKEN="xxxx"
railway variables --set TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Google OAuth (optional)
railway variables --set GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
railway variables --set GOOGLE_CLIENT_SECRET="xxx"
railway variables --set GOOGLE_CALLBACK_URL="https://canary-production-5a09.up.railway.app/api/auth/google/callback"

# Sentry (optional)
railway variables --set SENTRY_DSN="https://xxx@sentry.io/xxx"
```

---

## ✅ SONRA NE OLACAK?

Variables eklendikten sonra:

1. **Otomatik Redeploy:** Railway servisi otomatik yeniden başlatılır (2-3 dk)
2. **Backend Kontrol:** 
   ```bash
   curl https://canary-production-5a09.up.railway.app/api/auth/login
   ```
3. **Logs Kontrol:**
   ```bash
   railway logs
   ```
4. **Test:** Login flow ve payment flow test edilir

---

## 🔗 YARALI LINKLER

- **Railway Dashboard:** https://railway.com/project/4678be72-8e90-4ed9-be91-5cd2713e6ddf
- **Variables Ayarları:** Dashboard > Settings > Variables
- **iyzico:** https://merchant.iyzipay.com
- **Twilio:** https://console.twilio.com
- **Paraşüt:** https://uygulama.parasut.com
- **Sentry:** https://sentry.io

---

**Oluşturulma:** 16 Ekim 2025  
**Durum:** DATABASE_URL ve temel variables ✅, iyzico ve Twilio eksik ⚠️  
**Sonraki Adım:** iyzico credentials ekle → backend test et
