# 📋 Yarın Yapılacaklar - 3 Kasım 2025

## 🎯 Ana Hedef
Production deployment sorunlarını çözmek ve uygulamayı stabil hale getirmek

---

## 🔴 KRİTİK ÖNCELİK (SABAH - İlk 2 Saat)

### 1. Deployment Sorunu Root Cause Analysis
**Süre:** 1 saat  
**Öncelik:** 🔴 Kritik

**Adımlar:**
- [ ] GitHub Actions'da son 5 deployment'ın loglarını incele
- [ ] Backend deployment failure reason'ları listele
- [ ] Frontend deployment failure reason'ları listele
- [ ] Cloud Build logs'ları kontrol et (`gcloud builds list --limit=10`)
- [ ] Cloud Run logs'ları kontrol et (`gcloud run services logs read`)

**Dosyalar:**
- `.github/workflows/deploy-backend.yml`
- `.github/workflows/deploy-frontend.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`

**Beklenen Çıktı:**
- Deployment başarısızlık nedenlerinin listesi
- Hangi aşamada hata olduğu (build, push, deploy)
- Error message'lar

---

### 2. Local Docker Build Test
**Süre:** 1 saat  
**Öncelik:** 🔴 Kritik

**Backend Test:**
```powershell
cd backend
docker build -t canary-backend-test .
docker run -p 3000:3000 --env-file .env.example canary-backend-test
# Test: http://localhost:3000/api/health
```

**Frontend Test:**
```powershell
cd frontend
docker build -t canary-frontend-test --build-arg VITE_API_URL=http://localhost:3000 .
docker run -p 8080:8080 canary-frontend-test
# Test: http://localhost:8080
```

**Kontrol Edilecekler:**
- [ ] Docker build başarılı mı?
- [ ] Image boyutu normal mi? (backend ~200MB, frontend ~50MB)
- [ ] Container başlatılıyor mu?
- [ ] Health check'ler çalışıyor mu?
- [ ] Native dependencies (bcrypt, exceljs) çalışıyor mu?

**Beklenen Çıktı:**
- Local'de çalışan Docker image'ler
- Hata varsa detaylı error logs

---

## 🟡 YÜKSEK ÖNCELİK (ÖĞLEN - 3-4 Saat)

### 3. Dockerfile Düzeltmeleri (Eğer Local Test Başarısızsa)
**Süre:** 2 saat  
**Öncelik:** 🟡 Yüksek

**Backend Olası Sorunlar ve Çözümler:**

```dockerfile
# SORUN 1: Prisma Client generate edilmiyor
# ÇÖZÜM:
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --production=false
RUN npx prisma generate

# SORUN 2: Environment variables eksik
# ÇÖZÜM:
ARG DATABASE_URL
ARG JWT_SECRET
ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}

# SORUN 3: Port hardcoded
# ÇÖZÜM:
ENV PORT=8080
EXPOSE 8080
```

**Frontend Olası Sorunlar:**

```dockerfile
# SORUN 1: VITE_API_URL build time'da set edilmeli
# ÇÖZÜM:
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# SORUN 2: nginx config eksik/yanlış
# KONTROL: nginx.conf dosyasını incele
```

**Görevler:**
- [ ] Backend Dockerfile gözden geçir
- [ ] Frontend Dockerfile gözden geçir
- [ ] .dockerignore dosyalarını kontrol et
- [ ] Multi-stage build optimize et
- [ ] Build cache kullanımını optimize et

---

### 4. Cloud Run Environment Variables Kontrolü
**Süre:** 30 dakika  
**Öncelik:** 🟡 Yüksek

**Komutlar:**
```powershell
# Backend env vars kontrol
gcloud run services describe canary-backend --region=europe-west1 --format="get(spec.template.spec.containers[0].env)"

# Eksik varsa ekle
gcloud run services update canary-backend `
  --region=europe-west1 `
  --set-env-vars="NODE_ENV=production,PORT=8080" `
  --add-cloudsql-instances="canary-project:europe-west1:canary-db"
```

**Kontrol Edilecek Env Vars:**

**Backend:**
- [ ] DATABASE_URL (Secret Manager'dan)
- [ ] JWT_SECRET (Secret Manager'dan)
- [ ] NODE_ENV=production
- [ ] PORT=8080
- [ ] SENTRY_DSN (opsiyonel)

**Frontend:**
- [ ] VITE_API_URL (build arg olarak geçmeli)

---

### 5. GitHub Actions Workflow İyileştirmeleri
**Süre:** 1 saat  
**Öncelik:** 🟡 Yüksek

**deploy-backend.yml İyileştirmeleri:**

```yaml
# Eklenecek adımlar:

# 1. Build öncesi validation
- name: Validate Dockerfile
  run: docker build --check backend/

# 2. Build args geç
- name: Build Docker image
  run: |
    gcloud builds submit \
      --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/canary-backend \
      --timeout=20m \
      --machine-type=e2-highcpu-8 \
      backend/

# 3. Deployment retry logic
- name: Deploy to Cloud Run
  uses: google-github-actions/deploy-cloudrun@v1
  with:
    timeout: 20m
    max-instances: 10
    min-instances: 1

# 4. Deployment verification
- name: Verify Deployment
  run: |
    curl -f https://canary-backend-672344972017.europe-west1.run.app/api/health || exit 1
```

**Görevler:**
- [ ] Timeout'ları artır (10m → 20m)
- [ ] Machine type optimize et
- [ ] Retry logic ekle
- [ ] Health check endpoint'i doğrula
- [ ] Secret Manager entegrasyonunu kontrol et

---

## 🟢 ORTA ÖNCELİK (ÖĞLEDEN SONRA - 2-3 Saat)

### 6. Production Database Health Check
**Süre:** 30 dakika  
**Öncelik:** 🟢 Orta

**Kontroller:**
```sql
-- Connection test
SELECT version();

-- Tables var mı?
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Critical tables row count
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM "User"
UNION ALL
SELECT 'customers', COUNT(*) FROM "Customer"
UNION ALL
SELECT 'invoices', COUNT(*) FROM "Invoice";

-- Index'ler var mı?
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public';
```

**Görevler:**
- [ ] Database connection test (local → GCP)
- [ ] Prisma schema ile database sync check
- [ ] Performance: Slow query log kontrol
- [ ] Backup schedule kontrol
- [ ] Connection pool settings

---

### 7. API Health Check ve Monitoring
**Süre:** 1 saat  
**Öncelik:** 🟢 Orta

**Health Check Endpoint İyileştirme:**

```typescript
// backend/src/routes/health.ts
router.get('/health', async (req, res) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    database: 'unknown',
    services: {}
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';

    // Critical services check
    checks.services = {
      prisma: 'ok',
      exceljs: 'ok',
      parasut: 'ok'
    };

    res.status(200).json(checks);
  } catch (error) {
    checks.status = 'unhealthy';
    checks.database = 'disconnected';
    checks.error = error.message;
    res.status(503).json(checks);
  }
});
```

**Görevler:**
- [ ] `/api/health` endpoint'i genişlet
- [ ] Database connection check ekle
- [ ] Kritik service'leri test et
- [ ] Response time logla
- [ ] Cloud Monitoring'e metrik gönder

---

### 8. Test Environment Setup (Local)
**Süre:** 1.5 saat  
**Öncelik:** 🟢 Orta

**Jest Configuration:**
```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

**Test Database Setup:**
```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL_TEST }
  }
});

beforeAll(async () => {
  await prisma.$executeRaw`CREATE DATABASE IF NOT EXISTS test_db`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

**Görevler:**
- [ ] Test database oluştur (local PostgreSQL)
- [ ] .env.test dosyası oluştur
- [ ] Sample test yaz (user service)
- [ ] `npm test` çalıştır
- [ ] Coverage report oluştur

---

## 🔵 DÜŞÜK ÖNCELİK (Akşam - 1-2 Saat)

### 9. Documentation Güncellemeleri
**Süre:** 1 saat  
**Öncelik:** 🔵 Düşük

**Dosyalar:**
- [ ] `README.md` - Deployment bölümünü güncelle
- [ ] `backend/README.md` - Yeni API endpoint'leri ekle
- [ ] `DEPLOYMENT.md` - Troubleshooting section ekle
- [ ] `API_DOCUMENTATION.md` - Yeni modülleri dokümante et

**İçerik:**
```markdown
# Deployment Guide

## Prerequisites
- Node.js 20+
- Docker
- Google Cloud SDK
- PostgreSQL 14+

## Local Development
...

## Production Deployment
...

## Troubleshooting
### Backend Build Fails
- Check Node version: `node -v` (should be 20.x)
- Check native dependencies: bcrypt, exceljs
- Verify package-lock.json exists
...
```

---

### 10. Code Cleanup ve Refactoring
**Süre:** 1 saat  
**Öncelik:** 🔵 Düşük

**Backend Cleanup:**
- [ ] Unused imports'ları kaldır
- [ ] Console.log'ları sil (production'da logger kullan)
- [ ] Type definitions'ları düzelt
- [ ] Error handling'i standardize et
- [ ] Comments ekle/düzelt

**Frontend Cleanup:**
- [ ] Unused components'leri sil
- [ ] CSS duplicate'leri kaldır
- [ ] PropTypes ekle/düzelt
- [ ] Error boundaries ekle
- [ ] Loading states standardize et

---

## 📊 Gün Sonu Hedefleri

### Başarı Kriterleri ✅

**Minimum (Olmazsa Olmaz):**
- [ ] Backend local Docker build başarılı
- [ ] Frontend local Docker build başarılı
- [ ] Deployment failure root cause belirlendi
- [ ] Dockerfile düzeltmeleri yapıldı (gerekiyorsa)

**İdeal (Hedeflenen):**
- [ ] Backend production'a başarıyla deploy oldu
- [ ] Frontend production'a başarıyla deploy oldu
- [ ] Health check'ler çalışıyor
- [ ] Database connection stable
- [ ] Test environment kuruldu

**Bonus (Zaman Kalırsa):**
- [ ] API documentation güncellendi
- [ ] Test coverage %50+
- [ ] Monitoring dashboards kuruldu
- [ ] Performance baseline alındı

---

## 🛠️ Gerekli Araçlar ve Komutlar

### Docker Commands
```powershell
# Build
docker build -t canary-backend:test ./backend
docker build -t canary-frontend:test ./frontend

# Run
docker run -p 3000:3000 --env-file .env canary-backend:test
docker run -p 8080:8080 canary-frontend:test

# Debug
docker logs <container-id>
docker exec -it <container-id> sh

# Cleanup
docker system prune -a
```

### GCloud Commands
```powershell
# Logs
gcloud run services logs read canary-backend --region=europe-west1 --limit=50
gcloud builds list --limit=10

# Deploy (manuel)
gcloud run deploy canary-backend `
  --source ./backend `
  --region=europe-west1 `
  --allow-unauthenticated

# Config
gcloud run services describe canary-backend --region=europe-west1
```

### Database Commands
```powershell
# Connect
psql "postgresql://user:pass@35.205.55.157:5432/canary_db"

# Prisma
cd backend
npx prisma db pull          # Schema'yı DB'den çek
npx prisma db push          # Schema'yı DB'ye gönder
npx prisma generate         # Client generate et
npx prisma studio           # GUI aç
```

### Git Commands
```powershell
# Status
git status
git log --oneline -n 10

# Commit
git add .
git commit -m "fix: Deployment issues resolved"
git push origin main

# Rollback (gerekirse)
git revert HEAD
git push origin main
```

---

## ⚠️ Risk ve Blocker'lar

### Potansiyel Riskler:
1. **Docker Build Timeout:** Build 20 dakikayı geçerse Cloud Build timeout
2. **Memory Limit:** Native dependencies compile ederken OOM
3. **Database Connection:** Cloud Run → Cloud SQL connection pool tükenebilir
4. **Environment Variables:** Secret Manager'dan çekilemezse deployment fail
5. **Cold Start:** İlk request'te Prisma Client initialization yavaş olabilir

### Hazırlıklı Olunması Gerekenler:
- [ ] Cloud SQL Proxy yedek plan (local test için)
- [ ] Manual deployment script'i (CI/CD bypass için)
- [ ] Database backup (rollback için)
- [ ] Previous working commit hash'i (rollback için)
- [ ] Alternative deployment stratejisi (Railway, Vercel, vb.)

---

## 📞 Yardım Kaynakları

**Dokümantasyon:**
- Cloud Run: https://cloud.google.com/run/docs
- Docker Multi-stage: https://docs.docker.com/build/building/multi-stage/
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
- GitHub Actions: https://docs.github.com/en/actions

**Debugging:**
- Cloud Run Logs: https://console.cloud.google.com/logs
- Cloud Build History: https://console.cloud.google.com/cloud-build/builds
- GitHub Actions: https://github.com/umityaman/canary-digital/actions

**Slack/Discord:**
- Google Cloud Community
- Prisma Discord
- Docker Forum

---

## 📝 Notlar ve Hatırlatmalar

1. **SABAH İLK İŞ:** GitHub Actions logs'ları incele, son hataları not al
2. **LOCAL TEST:** Production'a push etmeden önce mutlaka local Docker build test et
3. **BACKUP:** Önemli değişiklik öncesi database backup al
4. **COMMIT MESSAGES:** Deployment fix'leri için "fix(deploy):" prefix kullan
5. **DOCUMENTATION:** Her fix'i dokümante et (gelecekte lazım olabilir)
6. **TIME BOX:** Her göreve max süre koy, takılma devam et
7. **PROGRESS TRACKING:** Her saat sonunda neler yapıldığını not et

---

## 🎯 Yarının Başarı Metrikleri

**Teknik:**
- Backend uptime: %99+
- Frontend load time: <2s
- API response time: <500ms
- Database query time: <100ms
- Error rate: <%1

**İş:**
- Deployment success rate: %100 (son 3 deployment)
- Zero production incidents
- All critical features working
- Test coverage: %50+

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 2 Kasım 2025, Akşam  
**Yarın:** 3 Kasım 2025, Pazar  
**Tahmini Süre:** 8-10 saat  
**Öncelik Dağılımı:** %40 Kritik, %40 Yüksek, %20 Orta/Düşük

---

## ✅ Son Kontrol Listesi (Sabah)

Yarın işe başlamadan önce:
- [ ] Kahve hazır ☕
- [ ] Editor açık (VS Code)
- [ ] Terminal açık (PowerShell)
- [ ] Chrome'da açık tab'lar:
  - [ ] GitHub Actions
  - [ ] GCP Console (Cloud Run)
  - [ ] GCP Console (Cloud Build)
  - [ ] Database client (TablePlus/DBeaver)
- [ ] Dokümantasyon hazır:
  - [ ] Bu TODO listesi
  - [ ] Dünkü rapor
  - [ ] Deployment guide
- [ ] Backup plan hazır (Railway/Vercel)
- [ ] Zaman takibi başlat (Toggl/manuel)

**İyi şanslar! 🚀**
