# 🔍 Deployment Debug Plan - 3 Kasım 2025

## 🎯 Hedef
Backend ve Frontend deployment'larının neden başarısız olduğunu bulmak ve çözmek.

---

## ✅ Şimdiye Kadar Yapılan Düzeltmeler

### Backend Dockerfile (Commit: 395d2ad)
- ✅ Node 18 → Node 20
- ✅ Build tools eklendi (python3, make, g++)
- ✅ package-lock.json kopyalanıyor
- ✅ npm install → npm ci
- ✅ Prisma generate adımı var
- ✅ PORT dinamik (process.env.PORT || 4000)

### Frontend Dockerfile (Commit: a0b5d93)
- ✅ Node 20 kullanılıyor
- ✅ Build tools eklendi
- ✅ npm ci kullanılıyor (--only=production kaldırıldı)
- ✅ VITE_API_URL build arg olarak geçiliyor
- ✅ nginx ile serve ediliyor
- ✅ Port 8080

### package.json (Commit: 395d2ad)
- ✅ exceljs dependency var
- ✅ start script güvenli (prisma db push yok)

### CI/CD Workflows (Commit: 86db039)
- ✅ Test job'ları kaldırıldı
- ✅ Health check var
- ✅ Timeout 20 dakika
- ✅ Secret Manager entegrasyonu yapılmış

---

## 🔴 Potansiyel Sorunlar

### 1. **Prisma Client Generation Timing**
**Sorun:** Dockerfile'da Prisma generate çok erken yapılıyor olabilir

**Dockerfile'daki mevcut sıralama:**
```dockerfile
COPY package*.json ./
RUN npm ci --production=false
COPY prisma ./prisma
RUN npx prisma generate  # ← Burada generate ediliyor
COPY . .                  # ← Sonra tüm kod kopyalanıyor
```

**Risk:** 
- Prisma Client, schema.prisma'yı okur ve node_modules/@prisma/client oluşturur
- Ama sonra `COPY . .` yapınca `node_modules/@prisma/client` üzerine yazılabilir
- Cloud Build cache ile karışıklık olabilir

**Çözüm:**
```dockerfile
COPY package*.json ./
RUN npm ci --production=false
COPY prisma ./prisma
COPY . .                   # Önce tüm kod
RUN npx prisma generate    # Sonra generate
```

---

### 2. **Environment Variables - DATABASE_URL**
**Sorun:** Cloud Run'da DATABASE_URL doğru şekilde set edilmeyebilir

**Workflow'da:**
```yaml
--update-secrets=DATABASE_URL=database-url:latest
```

**Kontrol Edilmesi Gerekenler:**
- [ ] GCP Secret Manager'da `database-url` secret'i var mı?
- [ ] Secret value doğru format'ta mı? (`postgresql://...`)
- [ ] Cloud SQL connection string Cloud Run'da mı yoksa public IP mi?
- [ ] Secret Manager'da latest version aktif mi?

**Test Command:**
```powershell
gcloud secrets versions access latest --secret="database-url"
```

---

### 3. **Cloud SQL Connection**
**Sorun:** Cloud Run → Cloud SQL bağlantısı kurulam ayabilir

**Workflow'da:**
```yaml
--set-cloudsql-instances=${{ env.PROJECT_ID }}:${{ env.REGION }}:canary-postgres
```

**Kontrol:**
- Instance name: `canary-postgres` doğru mu?
- Region: `europe-west1` doğru mu?
- Cloud SQL Admin API enabled mı?

**Test Commands:**
```powershell
# Instance'ı listele
gcloud sql instances list

# Instance detayını gör
gcloud sql instances describe canary-postgres
```

---

### 4. **Build Context Size**
**Sorun:** Backend dizini çok büyükse Cloud Build timeout olabilir

**Kontrol:**
```powershell
# Backend dizin boyutu
Get-ChildItem -Path backend -Recurse | Measure-Object -Property Length -Sum

# .dockerignore çalışıyor mu test
cd backend
docker build --dry-run -t test . 2>&1 | Select-String "Sending build context"
```

---

### 5. **Memory/CPU Limits**
**Sorun:** Prisma generate ve npm ci çok fazla memory kullanıyor olabilir

**Cloud Run Deployment:**
```yaml
--memory=1Gi     # ← 1GB yeterli mi?
--cpu=1          # ← 1 CPU yeterli mi?
```

**Önerilen değişiklik:**
```yaml
--memory=2Gi     # Build time için daha fazla
--cpu=2          # Parallel build için
```

---

### 6. **ts-node Runtime Dependencies**
**Sorun:** Production'da ts-node kullanılıyor, ama devDependencies'de olabilir

**package.json kontrol:**
```json
{
  "dependencies": {
    "ts-node": "^10.9.1"  // ← dependencies'de olmalı
  }
}
```

**Dockerfile:**
```dockerfile
RUN npm ci --production=false  # ← --production=false doğru
```

---

### 7. **Frontend nginx Config**
**Sorun:** nginx.conf dosyası eksik veya hatalı olabilir

**Kontrol:**
```powershell
cat frontend/nginx.conf
```

**Gerekli config:**
```nginx
server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### 8. **GitHub Secrets**
**Sorun:** GitHub'daki secrets eksik veya yanlış olabilir

**Kontrol Edilmesi Gerekenler:**
- [ ] GCP_SA_KEY - Service Account JSON key
- [ ] GCP_PROJECT_ID - Project ID (canary-digital-475319)
- [ ] DATABASE_URL secret'i Cloud'da doğru

**Test:**
```powershell
# GitHub repo settings'de secrets kontrol et
https://github.com/umityaman/canary-digital/settings/secrets/actions
```

---

## 🧪 Debug Adımları (Sıralı)

### Adım 1: Secret Manager Kontrolü (5 dk)
```powershell
# Login
gcloud auth login

# Project set
gcloud config set project canary-digital-475319

# Secrets listele
gcloud secrets list

# database-url secret'ini görüntüle
gcloud secrets versions access latest --secret="database-url"

# jwt-secret kontrol
gcloud secrets versions access latest --secret="jwt-secret"
```

**Beklenen Çıktı:**
- database-url: `postgresql://user:pass@35.205.55.157:5432/canary_db`
- jwt-secret: Random string

---

### Adım 2: Cloud SQL Instance Kontrolü (3 dk)
```powershell
# Instance listele
gcloud sql instances list

# Instance detay
gcloud sql instances describe canary-postgres

# Connection name al
gcloud sql instances describe canary-postgres --format="get(connectionName)"
```

**Beklenen Çıktı:**
- Instance status: RUNNABLE
- Connection name: `canary-digital-475319:europe-west1:canary-postgres`

---

### Adım 3: Cloud Build History İnceleme (10 dk)
```powershell
# Son 10 build'i listele
gcloud builds list --limit=10 --format="table(id,status,source.repoSource.branchName,startTime,duration)"

# Son başarısız build'in ID'sini al
$BUILD_ID = (gcloud builds list --limit=1 --filter="status=FAILURE" --format="value(id)")

# Build loglarını görüntüle
gcloud builds log $BUILD_ID
```

**Aranacak Hata Mesajları:**
- `npm ERR!`
- `FATAL ERROR`
- `Prisma Client could not be generated`
- `Error: connect ETIMEDOUT`
- `Permission denied`

---

### Adım 4: Cloud Run Service Status (5 dk)
```powershell
# Backend service detay
gcloud run services describe canary-backend --region=europe-west1 --format=yaml

# Latest revision
gcloud run revisions list --service=canary-backend --region=europe-west1 --limit=5

# Son revision'ın logları
gcloud run services logs read canary-backend --region=europe-west1 --limit=100
```

**Aranacak Sorunlar:**
- Revision status: FAILED
- Error messages
- Container crashes
- Database connection errors

---

### Adım 5: Manual Build Test (LOCAL - SKIP if Docker not working)
```powershell
# Backend build
cd backend
docker build -t canary-backend-local .

# Image size kontrol
docker images canary-backend-local

# Container çalıştır (dry run)
docker run --rm canary-backend-local npm --version
docker run --rm canary-backend-local node --version
docker run --rm canary-backend-local npx prisma --version
```

---

### Adım 6: Dockerfile Düzeltmesi (EĞER SORUN BULUNURSA)

**Backend Dockerfile optimizasyonu:**
```dockerfile
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache openssl libc6-compat python3 make g++

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false && npm cache clean --force

# Copy everything FIRST (before prisma generate)
COPY . .

# Generate Prisma Client AFTER copying all files
RUN npx prisma generate

# Environment
ENV NODE_ENV=production

# Port
EXPOSE 4000

# Start
CMD ["npx", "ts-node", "--transpile-only", "src/index.ts"]
```

**Değişiklik:** `COPY . .` ve `RUN npx prisma generate` sırasını değiştirdik

---

### Adım 7: Environment Variables Fix (EĞER SECRET SORUNU VARSA)

**Eğer DATABASE_URL eksikse, manual set:**
```powershell
gcloud run services update canary-backend `
  --region=europe-west1 `
  --update-env-vars="DATABASE_URL=postgresql://canary_user:YOUR_PASS@35.205.55.157:5432/canary_db"
```

**Veya Secret oluştur:**
```powershell
# Secret oluştur
echo "postgresql://canary_user:PASS@35.205.55.157:5432/canary_db" | gcloud secrets create database-url --data-file=-

# Service'e bağla
gcloud run services update canary-backend `
  --region=europe-west1 `
  --update-secrets=DATABASE_URL=database-url:latest
```

---

### Adım 8: Memory/CPU Artırma (EĞER RESOURCE SORUNU VARSA)

```powershell
gcloud run services update canary-backend `
  --region=europe-west1 `
  --memory=2Gi `
  --cpu=2 `
  --timeout=300
```

---

### Adım 9: Manual Deploy Test

**Backend manual deploy:**
```powershell
cd backend

gcloud run deploy canary-backend `
  --source . `
  --region=europe-west1 `
  --platform=managed `
  --allow-unauthenticated `
  --memory=2Gi `
  --cpu=2 `
  --port=4000 `
  --timeout=300 `
  --set-cloudsql-instances=canary-digital-475319:europe-west1:canary-postgres `
  --update-secrets=DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest `
  --set-env-vars="NODE_ENV=production"
```

**Frontend manual deploy:**
```powershell
cd frontend

gcloud run deploy canary-frontend `
  --source . `
  --region=europe-west1 `
  --platform=managed `
  --allow-unauthenticated `
  --memory=1Gi `
  --cpu=1 `
  --port=8080 `
  --timeout=180
```

---

## 📊 Başarı Kriterleri

### Backend Deploy Başarılı ise:
- ✅ Build tamamlanır (5-15 dakika)
- ✅ Container başlatılır
- ✅ Health check başarılı: `curl https://canary-backend-672344972017.europe-west1.run.app/api/health`
- ✅ Response: `{"ok":true,"timestamp":"..."}`

### Frontend Deploy Başarılı ise:
- ✅ Build tamamlanır (3-8 dakika)
- ✅ nginx başlatılır
- ✅ `curl https://canary-frontend-672344972017.europe-west1.run.app` → HTML response

---

## 🚨 Acil Durum Planı

### Eğer hiçbir şey çalışmazsa:

**Plan A: Railway'e Deploy**
```powershell
# Railway CLI install
npm install -g @railway/cli

# Login
railway login

# Backend deploy
cd backend
railway init
railway up
```

**Plan B: Vercel (Frontend için)**
```powershell
npm install -g vercel
cd frontend
vercel --prod
```

**Plan C: Render.com**
- GitHub'dan direkt deploy
- Free tier var
- Hızlı setup

---

## 📝 Sonraki Adımlar

1. **ŞİMDİ:** Adım 1-4'ü çalıştır (Cloud kontrolü)
2. **SONRA:** Sorun bulunursa Adım 6-8 (Fix)
3. **EN SON:** Adım 9 (Manual deploy test)
4. **BAŞARILI ISE:** GitHub Actions'ı yeniden tetikle

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 3 Kasım 2025, Sabah  
**Durum:** DEBUG BAŞLADI 🔍
