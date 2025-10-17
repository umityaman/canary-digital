# 🔧 CI/CD Troubleshooting Guide

## 🎯 Hata Tespiti

GitHub Actions'da hata görüyorsan, hangi step'te olduğunu belirle:

### 1. Google Auth Hatası
```
Error: google-github-actions/auth failed
```

**Sebep:** GCP_SA_KEY secret formatı yanlış

**Çözüm:**
```powershell
# JSON'u tekrar kopyala
Get-Content github-actions-key.json -Raw | Set-Clipboard

# GitHub → Settings → Secrets → GCP_SA_KEY → Update
# Value'yu tamamen sil, Ctrl+V, Update secret
```

---

### 2. Secret Manager Permission Hatası
```
ERROR: (gcloud.run.deploy) PERMISSION_DENIED: 
Permission 'secretmanager.versions.access' denied
```

**Sebep:** Cloud Run service account'un Secret Manager'a erişim yetkisi yok

**Çözüm (ŞİMDİ YAPILDI ✅):**
```powershell
gcloud projects add-iam-policy-binding canary-digital-475319 \
  --member="serviceAccount:672344972017-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

### 3. npm ci Hatası
```
ERROR: npm ci can only install packages when your package.json 
and package-lock.json or npm-shrinkwrap.json are in sync
```

**Sebep:** package-lock.json bozuk veya eksik

**Çözüm:**
```powershell
cd frontend
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Fix package-lock.json"
git push
```

---

### 4. npm build Hatası
```
ERROR: npm run build failed
TypeScript errors...
```

**Sebep:** TypeScript hataları veya eksik environment variables

**Çözüm:**
```powershell
# Local'de test et
cd frontend
VITE_API_URL=https://canary-backend-672344972017.europe-west1.run.app/api npm run build

# Hataları düzelt
npm run build
```

---

### 5. Health Check Failed
```
Error: Health check failed - HTTP 502/503/404
```

**Sebep:** Service başlamadı veya endpoint yanlış

**Çözüm:**
```powershell
# Cloud Run logs kontrol et
gcloud logging read "resource.type=cloud_run_revision" \
  --project=canary-digital-475319 \
  --limit=50 \
  --format=json

# Veya Console'da:
# https://console.cloud.google.com/run?project=canary-digital-475319
```

---

### 6. Cloud SQL Connection Hatası
```
ERROR: connect ECONNREFUSED
Cloud SQL instance not found
```

**Sebep:** Cloud SQL instance connection string yanlış

**Çözüm:**
```yaml
--set-cloudsql-instances=canary-digital-475319:europe-west1:canary-postgres
# Format: PROJECT_ID:REGION:INSTANCE_NAME
```

---

### 7. Docker Build Hatası
```
ERROR: failed to solve with frontend dockerfile.v0
```

**Sebep:** Dockerfile syntax hatası veya dosya eksik

**Çözüm:**
- `backend/Dockerfile` var mı kontrol et
- `frontend/Dockerfile` var mı kontrol et
- Syntax doğru mu kontrol et

---

### 8. Memory/CPU Limit Hatası
```
ERROR: The container failed to start. The container port or memory 
configuration might be wrong.
```

**Sebep:** Yeterli kaynak yok veya port yanlış

**Çözüm:**
```yaml
--memory=512Mi  # Backend için
--memory=256Mi  # Frontend için
--port=4000     # Backend
--port=8080     # Frontend
```

---

## 🔍 Debug Komutları

### 1. Workflow Logs (GitHub)
```
https://github.com/umityaman/canary-digital/actions
→ Workflow run'a tıkla
→ Job'a tıkla
→ Step'leri genişlet
→ Error mesajını kopyala
```

### 2. Cloud Run Logs (GCP)
```powershell
# Son 50 log
gcloud logging read "resource.type=cloud_run_revision" \
  --project=canary-digital-475319 \
  --limit=50

# Sadece ERROR logs
gcloud logging read "resource.type=cloud_run_revision AND severity=ERROR" \
  --project=canary-digital-475319 \
  --limit=20
```

### 3. Service Status
```powershell
# Backend status
gcloud run services describe canary-backend \
  --region=europe-west1 \
  --project=canary-digital-475319

# Frontend status
gcloud run services describe canary-frontend \
  --region=europe-west1 \
  --project=canary-digital-475319
```

### 4. Secret Manager Check
```powershell
# Secrets listele
gcloud secrets list --project=canary-digital-475319

# Secret değerini göster (test için)
gcloud secrets versions access latest --secret=jwt-secret \
  --project=canary-digital-475319
```

---

## 🎯 Hızlı Fix Checklist

Şu adımları sırayla dene:

- [ ] GCP_SA_KEY secret doğru mu? (Update et)
- [ ] Secret Manager permission var mı? (✅ Eklendi)
- [ ] package-lock.json güncel mi?
- [ ] Local'de build çalışıyor mu? (`npm run build`)
- [ ] Dockerfile'lar mevcut mu?
- [ ] Environment variables doğru mu?
- [ ] Cloud SQL instance çalışıyor mu?
- [ ] Service account permissions doğru mu?

---

## 📞 Hata Mesajını Paylaş

Lütfen GitHub Actions'dan tam hata mesajını kopyala:

**Hangi workflow?**
- [ ] Full Deployment
- [ ] Deploy Backend
- [ ] Deploy Frontend

**Hangi job?**
- [ ] deploy-backend
- [ ] deploy-frontend
- [ ] notify-success

**Hangi step?**
- [ ] Google Auth
- [ ] Deploy to Cloud Run
- [ ] Install Dependencies
- [ ] Build
- [ ] Health Check
- [ ] Diğer: ___________

**Hata mesajı:**
```
[HATA MESAJINI BURAYA YAPIŞTIR]
```

---

**Hata mesajını göster, tam çözümü sağlayayım!** 🔧
