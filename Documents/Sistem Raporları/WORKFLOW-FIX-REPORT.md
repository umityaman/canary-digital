# 🔧 CI/CD Workflow Düzeltmeleri

## ❌ İlk Hata: Invalid Docker Configure

### Sorun:
```yaml
- name: Configure Docker for GCP
  run: gcloud auth configure-docker  # ❌ Yanlış komut
```

### Çözüm:
Bu satır **gereksiz** çünkü `gcloud run deploy --source` kullanıyoruz (Docker registry'ye manuel push gerekmiyor).

**Kaldırıldı!** ✅

---

## 🔄 Yeni Push

**Commit:** c997571 "Fix workflow: remove invalid docker configure step"

---

## 📊 Şimdi Ne Olacak?

Yeni push ile workflows tekrar tetiklenecek:

### Beklenen Workflow Runs:

1. **Full Deployment** ✅
   - Backend deploy
   - Frontend deploy
   
2. **Deploy Backend** (sadece workflow dosyası değişti, backend/ değişmedi)
   - Trigger olmayabilir

3. **Deploy Frontend** (sadece workflow dosyası değişti, frontend/ değişmedi)  
   - Trigger olmayabilir

---

## ✅ Başarı Senaryosu

Eğer her şey doğruysa:

```
🟢 Full Deployment
   ├── 🟢 Deploy Backend (3-4 min)
   │   ├── Build & Deploy
   │   └── Health check ✅
   └── 🟢 Deploy Frontend (3-4 min)
       ├── npm install
       ├── npm run build
       ├── Deploy
       └── Health check ✅
```

---

## ❌ Olası Hatalar

### 1. Secret Manager Hatası
```
ERROR: (gcloud.run.deploy) PERMISSION_DENIED: Permission 'secretmanager.versions.access' denied
```

**Sebep:** Cloud Run service account'un Secret Manager'a erişim yetkisi yok

**Çözüm:**
```powershell
gcloud projects add-iam-policy-binding canary-digital-475319 \
  --member="serviceAccount:672344972017-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 2. npm ci Hatası
```
ERROR: npm ci requires package-lock.json
```

**Sebep:** package-lock.json eksik veya bozuk

**Çözüm:**
```powershell
cd frontend
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

### 3. Build Hatası
```
ERROR: npm run build failed
```

**Sebep:** TypeScript hataları veya environment variable eksik

**Çözüm:**
```powershell
# Local'de test et
cd frontend
VITE_API_URL=https://canary-backend-672344972017.europe-west1.run.app/api npm run build

# Hataları düzelt
```

### 4. Health Check Failed
```
ERROR: Health check failed - HTTP 502
```

**Sebep:** Service başlamadı veya port yanlış

**Çözüm:**
- Cloud Run logs kontrol et
- Port ayarlarını kontrol et (Backend: 4000, Frontend: 8080)
- Dockerfile PORT env var kullanıyor mu?

---

## 🔍 Debugging Steps

### 1. GitHub Actions Logs
```
https://github.com/umityaman/canary-digital/actions
```

- Workflow run'a tıkla
- Failed step'i bul
- Error message'ı kopyala

### 2. Cloud Run Logs
```
https://console.cloud.google.com/run?project=canary-digital-475319
```

- Service'e tıkla
- **Logs** sekmesi
- Son 1 saati filtrele
- ERROR seviyesi filtrele

### 3. Secret Manager
```
https://console.cloud.google.com/security/secret-manager?project=canary-digital-475319
```

- `jwt-secret` var mı?
- IAM permissions doğru mu?

---

## 📞 İzleme

### Real-time:
```
https://github.com/umityaman/canary-digital/actions
```

**Şu anda:** Yeni workflow çalışıyor olmalı! 🔄

---

## 🎯 Sonraki Adımlar

### Eğer başarılı olursa:
✅ CI/CD pipeline aktif!
✅ Her push otomatik deploy olacak
✅ Option A tamamlandı

### Eğer başarısız olursa:
❌ Hata mesajını incele
❌ Yukarıdaki çözümleri dene
❌ Gerekirse workflow'ları güncelle

---

**Workflow çalışıyor!** Sonuçları bekleyelim... 🔄
