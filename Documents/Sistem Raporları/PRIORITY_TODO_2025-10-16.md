# 🎯 ÖNCELİKLİ TODO LİSTESİ - 16 EKİM 2025

## 🔴 KRİTİK ÖNCELİKLİ (Bugün - 2-4 saat)

### 1. Railway Environment Variables ⏱️ 30 dk
**Durum:** Backend canlı ama bazı özellikler env var olmadan çalışmıyor

```bash
# Railway Dashboard: https://railway.com/project/4678be72-8e90-4ed9-be91-5cd2713e6ddf
# Settings > Variables

# ZORUNLU - Backend çalışması için
DATABASE_URL=postgresql://...  # Railway PostgreSQL addon URL'ini buraya link et

# ZORUNLU - Payment sistemi için (backend'de hata veriyor)
IYZICO_API_KEY=sandbox-xxx  # İyzico hesabından al
IYZICO_SECRET_KEY=sandbox-xxx
BACKEND_URL=https://canary-production-5a09.up.railway.app

# ZORUNLU - Email gönderimi için (zaten var olabilir, kontrol et)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@canary.com

# ZORUNLU - JWT için (zaten var olabilir)
JWT_SECRET=your-super-secret-key-min-32-chars
```

**Adımlar:**
1. Railway dashboard'a git
2. canary-production-5a09 service'i seç
3. Variables tab'ına git
4. Yukarıdaki değişkenleri ekle/kontrol et
5. DATABASE_URL için PostgreSQL addon'dan "Link" butonuna tıkla
6. Service otomatik redeploy olacak (3-5 dk)

---

### 2. Database Migration ⏱️ 5 dk
**Durum:** Database bağlı değil, tablolar oluşturulmamış

```powershell
# Local'den Railway'e bağlan
cd backend
railway run npx prisma migrate deploy

# Ya da Railway CLI ile:
railway shell
npx prisma migrate deploy
exit
```

**Kontrol:**
```powershell
railway run npx prisma db seed  # Test data ekle (optional)
```

---

### 3. Production Health Check ⏱️ 10 dk
**Durum:** Backend canlı ama endpoint'ler test edilmedi

**Test Edilecekler:**
```powershell
# 1. Backend çalışıyor mu?
curl https://canary-production-5a09.up.railway.app/api/auth/login

# 2. Database bağlantısı var mı?
curl https://canary-production-5a09.up.railway.app/api/equipment

# 3. CORS çalışıyor mu?
# Frontend'den login dene
```

**Beklenen:**
- ✅ 200 OK responses
- ✅ JSON data döner
- ✅ CORS headers var

**Hata varsa:**
- Railway logs'a bak
- Environment variables'ı kontrol et
- Database connection string'i doğrula

---

### 4. Frontend Deployment Güncelleme ⏱️ 15 dk
**Durum:** Frontend deployed ama API URL güncel mi emin değiliz

```powershell
cd frontend

# Vercel dashboard'dan mevcut env var'ları kontrol et
vercel env ls

# Gerekirse güncelle:
vercel env add VITE_API_URL production
# Value: https://canary-production-5a09.up.railway.app/api

# Redeploy:
vercel --prod
```

**Kontrol:**
```powershell
# Browser'da aç:
start https://frontend-6iaj8qzs1-umityamans-projects.vercel.app

# Network tab'da API çağrılarını kontrol et:
# - https://canary-production-5a09.up.railway.app/api/... çağrıları yapılıyor mu?
# - CORS hataları var mı?
```

---

## 🟡 YÜKSEK ÖNCELİKLİ (Bugün/Yarın - 4-8 saat)

### 5. Production Testing - Authentication ⏱️ 1 saat
**Test Senaryosu:**

1. **Register:**
   ```http
   POST https://canary-production-5a09.up.railway.app/api/auth/register
   {
     "email": "test@test.com",
     "password": "Test1234!",
     "name": "Test User",
     "role": "admin"
   }
   ```

2. **Login:**
   ```http
   POST https://canary-production-5a09.up.railway.app/api/auth/login
   {
     "email": "test@test.com",
     "password": "Test1234!"
   }
   ```
   - ✅ JWT token dönüyor mu?
   - ✅ Frontend'e login olabiliyor musun?

3. **2FA Enable:**
   ```http
   POST https://canary-production-5a09.up.railway.app/api/2fa/enable
   Headers: Authorization: Bearer <token>
   {
     "method": "totp"
   }
   ```
   - ✅ QR code dönüyor mu?
   - ✅ Google Authenticator ile çalışıyor mu?

---

### 6. Production Testing - Core Features ⏱️ 2 saat

**Equipment:**
```http
# List
GET /api/equipment

# Create
POST /api/equipment
{
  "name": "Test Equipment",
  "categoryId": 1,
  "dailyRate": 100,
  "status": "available"
}

# Generate QR
POST /api/scan/generate-codes
{
  "equipmentId": 1,
  "quantity": 1
}
```

**Orders:**
```http
# Create Order
POST /api/orders
{
  "customerId": 1,
  "equipmentId": 1,
  "startDate": "2025-10-20",
  "endDate": "2025-10-25",
  "totalAmount": 500
}

# Update Status
PUT /api/orders/1
{
  "status": "active"
}
```

**Customer:**
```http
# Create
POST /api/customers
{
  "name": "Test Customer",
  "email": "customer@test.com",
  "phone": "+905551234567"
}
```

---

### 7. Bug Fixes (Bulundukça) ⏱️ 2-4 saat
**Test ederken karşılaşılan hataları çöz:**

- [ ] CORS hataları
- [ ] Database query hataları
- [ ] Validation hataları
- [ ] TypeScript hataları
- [ ] File upload hataları

---

### 8. Optional Integrations Setup ⏱️ 1 saat
**Paraşüt (Optional - Accounting):**
```bash
railway variables --set PARASUT_CLIENT_ID=xxx
railway variables --set PARASUT_CLIENT_SECRET=xxx
railway variables --set PARASUT_USERNAME=xxx
railway variables --set PARASUT_PASSWORD=xxx
railway variables --set PARASUT_COMPANY_ID=xxx
railway variables --set PARASUT_DEFAULT_ACCOUNT_ID=xxx
```

**Sentry (Optional - Error Tracking):**
```bash
railway variables --set SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Redis (Optional - Caching):**
```bash
# Railway'de Redis addon ekle
railway add redis
# Otomatik REDIS_URL environment variable oluşturur
```

---

## 🔵 ORTA ÖNCELİKLİ (2-3 gün)

### 9. Advanced Testing ⏱️ 4 saat

**Invoice & Payment:**
- [ ] PDF invoice generation test
- [ ] iyzico payment flow test
- [ ] Refund işlemi test
- [ ] Taksit hesaplama test

**Calendar & Events:**
- [ ] Event CRUD test
- [ ] Google Calendar sync test
- [ ] Reminders test

**Technical Service:**
- [ ] Work order oluşturma test
- [ ] Part management test
- [ ] Technician assignment test

**Notifications:**
- [ ] Email gönderimi test (11 template)
- [ ] WhatsApp mesaj test (Twilio)
- [ ] SMS gönderimi test
- [ ] Push notification test

**File Uploads:**
- [ ] Avatar upload test
- [ ] Equipment photo test
- [ ] Inspection photo test
- [ ] Company logo test

---

### 10. Performance Optimization ⏱️ 3 saat

**Backend:**
- [ ] Slow queries tespit et (monitoring endpoint)
- [ ] N+1 query problemlerini çöz
- [ ] Index'ler ekle (database)
- [ ] Response caching ekle (Redis)

**Frontend:**
- [ ] Bundle size analizi (lighthouse)
- [ ] Lazy loading ekle (React.lazy)
- [ ] Image optimization
- [ ] API call optimization

---

### 11. Security Hardening ⏱️ 2 saat

**Backend:**
- [ ] Rate limiting ekle (express-rate-limit)
- [ ] Helmet.js ekle (security headers)
- [ ] Input sanitization kontrol et
- [ ] SQL injection testleri
- [ ] XSS testleri

**Frontend:**
- [ ] Content Security Policy
- [ ] Token storage güvenliği
- [ ] Sensitive data masking

---

## 🟢 DÜŞÜK ÖNCELİKLİ (1-2 hafta)

### 12. Contract Management Modülü ⏱️ 8-16 saat
**Backend:**
- [ ] Contract model (Prisma schema)
- [ ] Contract routes (CRUD)
- [ ] Contract templates
- [ ] PDF generation
- [ ] E-signature integration (optional)

**Frontend:**
- [ ] Contracts page
- [ ] Contract form
- [ ] Contract list
- [ ] Contract detail view

---

### 13. Advanced Reporting ⏱️ 6-12 saat
**Backend:**
- [ ] Excel export (xlsx)
- [ ] Custom report builder
- [ ] Scheduled reports (cron jobs)
- [ ] Report templates

**Frontend:**
- [ ] Report builder UI
- [ ] Chart library expansion (more chart types)
- [ ] Filter builder UI
- [ ] Export buttons

---

### 14. Mobile App Completion ⏱️ 16-24 saat
**React Native:**
- [ ] Port tüm sayfaları mobile'a
- [ ] API integration
- [ ] Push notification setup (FCM)
- [ ] Offline mode
- [ ] Camera integration (QR scan)
- [ ] File upload
- [ ] Store submission hazırlığı

---

### 15. DevOps & Monitoring ⏱️ 4-6 saat

**CI/CD:**
- [ ] GitHub Actions setup
- [ ] Automated testing
- [ ] Automated deployment
- [ ] Rollback strategy

**Monitoring:**
- [ ] Sentry error tracking
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring
- [ ] Log aggregation (Loggly/Papertrail)

**Backup:**
- [ ] Database backup strategy
- [ ] File backup (S3)
- [ ] Disaster recovery plan

---

### 16. Documentation ⏱️ 3-4 saat

**API Documentation:**
- [ ] Swagger/OpenAPI ekle
- [ ] Postman collection
- [ ] API versioning

**User Documentation:**
- [ ] User manual
- [ ] Admin guide
- [ ] Video tutorials

**Developer Documentation:**
- [ ] Architecture overview
- [ ] Setup guide
- [ ] Contributing guide
- [ ] Code style guide

---

## 📊 ZAMAN TAHMİNİ ÖZET

| Öncelik | Görevler | Toplam Süre | Başlangıç |
|---------|----------|-------------|-----------|
| 🔴 Kritik | 1-4 | 2-4 saat | Bugün |
| 🟡 Yüksek | 5-8 | 4-8 saat | Bugün/Yarın |
| 🔵 Orta | 9-11 | 9 saat | 2-3 gün |
| 🟢 Düşük | 12-16 | 37-62 saat | 1-2 hafta |
| **TOPLAM** | - | **52-83 saat** | - |

---

## 🎯 BUGÜN YAPILACAKLAR (4 saat)

### Sabah (2 saat):
1. ✅ Railway env variables ekle (30 dk)
2. ✅ Database migration çalıştır (5 dk)
3. ✅ Health check yap (10 dk)
4. ✅ Frontend redeploy (15 dk)
5. ✅ Production testing - Auth (1 saat)

### Öğleden Sonra (2 saat):
6. ✅ Production testing - Core Features (2 saat)
7. ✅ Bug fixes (bulundukça)

### Akşam (isteğe bağlı):
8. ⚠️ Optional integrations (Paraşüt, Sentry) (1 saat)

---

## 📋 CHECKLIST

### Deployment Tamamlama:
- [ ] Railway DATABASE_URL bağlandı
- [ ] Railway env variables eklendi (iyzico, email, jwt)
- [ ] Database migration tamamlandı
- [ ] Backend health check başarılı
- [ ] Frontend redeploy tamamlandı
- [ ] Frontend backend'e bağlanıyor
- [ ] Login çalışıyor
- [ ] Equipment CRUD çalışıyor
- [ ] Order CRUD çalışıyor

### Production Ready:
- [ ] Tüm core features test edildi
- [ ] Critical bug'lar çözüldü
- [ ] Performance acceptable
- [ ] Security checks passed
- [ ] Documentation hazır (en az README)

### Long-term Goals:
- [ ] Contract management eklendi
- [ ] Advanced reporting tamamlandı
- [ ] Mobile app yayında
- [ ] CI/CD pipeline kuruldu
- [ ] Monitoring aktif

---

**Oluşturulma:** 16 Ekim 2025  
**Öncelik:** 🔴 Kritik  
**İlk Hedef:** Deployment'ı bugün bitir  
**Sonraki Hedef:** Production testing 2 gün içinde tamamla
