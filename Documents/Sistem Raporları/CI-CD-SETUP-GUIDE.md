# 🔄 CI/CD Pipeline Setup Guide
**GitHub Actions + Google Cloud Run**

---

## ✅ Tamamlanan Adımlar

### 1. GitHub Actions Workflows Oluşturuldu
- ✅ `deploy-backend.yml` - Backend otomatik deployment
- ✅ `deploy-frontend.yml` - Frontend otomatik deployment  
- ✅ `deploy-full.yml` - Full stack deployment

### 2. GCP Service Account Oluşturuldu
- ✅ Service Account: `github-actions@canary-digital-475319.iam.gserviceaccount.com`
- ✅ Roller:
  - `roles/run.admin` - Cloud Run yönetimi
  - `roles/iam.serviceAccountUser` - Service account kullanımı
  - `roles/cloudbuild.builds.builder` - Build yapabilme

### 3. Service Account Key Oluşturuldu
- ✅ Key dosyası: `github-actions-key.json` (proje root'da)

---

## 📝 GitHub Repository Setup (MANUEL ADIMLAR)

### ADIM 1: GitHub Repository'ye Git
```
https://github.com/YOUR-USERNAME/YOUR-REPO-NAME
```

### ADIM 2: GitHub Secret Ekle

**ÖNEMLİ:** Repository'nin kendi settings'ine git (profil settings değil!)

**Doğru yol:**
1. GitHub.com'da **repository'ni aç**
2. Üstteki menüden **⚙️ Settings** sekmesine tıkla (repository için)
3. Sol menüden **Secrets and variables** bul
4. **Secrets and variables** altında **Actions** seç
5. Sağ tarafta **New repository secret** butonu görünecek

**Alternatif doğrudan link:**
```
https://github.com/YOUR-USERNAME/YOUR-REPO-NAME/settings/secrets/actions
```

**Secret ekle:**

**Secret Name:**
```
GCP_SA_KEY
```

**Secret Value:**
```json
github-actions-key.json dosyasının TAMAMI
```

**Dosyayı kopyalamak için:**
```powershell
# PowerShell'de
Get-Content github-actions-key.json | Set-Clipboard
# Şimdi Ctrl+V ile yapıştırabilirsin
```

Ya da:
```powershell
# Dosyayı aç, içeriği kopyala
notepad github-actions-key.json
```

4. **Add secret** tıkla

### ADIM 3: .gitignore Güncelle

`github-actions-key.json` dosyası **ASLA** Git'e pushlanmamalı!

`.gitignore` dosyasına ekle:
```
# GCP Service Account Keys
*.json
github-actions-key.json
gcp-*.json
```

### ADIM 4: Workflows'u GitHub'a Push Et

```bash
git add .github/workflows/
git add .gitignore
git commit -m "Add CI/CD workflows with GitHub Actions"
git push origin main
```

### ADIM 5: İlk Deployment Test

**Option A - Otomatik (Main'e Push):**
```bash
# Herhangi bir değişiklik yap
git add .
git commit -m "Test CI/CD pipeline"
git push origin main

# GitHub Actions otomatik başlayacak
```

**Option B - Manuel Trigger:**
1. GitHub'da **Actions** sekmesine git
2. **Full Deployment** workflow'u seç
3. **Run workflow** → **Run workflow** tıkla

---

## 🚀 Workflow'ların Nasıl Çalıştığı

### 1. Deploy Backend (`deploy-backend.yml`)
**Tetiklenir:**
- `backend/` klasöründe değişiklik olduğunda
- Manuel trigger

**Ne yapar:**
1. Backend kodunu checkout eder
2. GCP'ye authenticate olur
3. Cloud Run'a deploy eder
4. Health check yapar
5. Başarı/hata bildirir

### 2. Deploy Frontend (`deploy-frontend.yml`)
**Tetiklenir:**
- `frontend/` klasöründe değişiklik olduğunda
- Manuel trigger

**Ne yapar:**
1. Frontend kodunu checkout eder
2. Dependencies install eder
3. Production build yapar
4. GCP'ye authenticate olur
5. Cloud Run'a deploy eder
6. Health check yapar
7. Başarı/hata bildirir

### 3. Full Deployment (`deploy-full.yml`)
**Tetiklenir:**
- `main` branch'e herhangi bir push
- Manuel trigger

**Ne yapar:**
1. **Backend Deploy** (önce)
   - Backend'i deploy eder
   - URL'i kaydeder
2. **Frontend Deploy** (sonra)
   - Backend URL'ini kullanarak build yapar
   - Frontend'i deploy eder
3. **CORS Update**
   - Frontend URL'i backend CORS'a ekler
4. **Bildirim**
   - Başarı/hata durumunu bildirir

---

## 📊 GitHub Actions Dashboard

### Actions Sekmesi
```
https://github.com/YOUR-USERNAME/canary-digital/actions
```

Burada görebilirsin:
- ✅ Başarılı deploymentlar
- ❌ Başarısız deploymentlar
- ⏳ Devam eden deploymentlar
- 📝 Deployment logları

### Deployment Logları
Her deployment'ın detaylı loglarını görmek için:
1. **Actions** sekmesi
2. Workflow run'a tıkla
3. Job'a tıkla (örn: "Deploy Backend")
4. Step'leri genişlet

---

## 🔐 Güvenlik

### Secret Management
- ✅ Service account key GitHub Secret olarak saklanıyor
- ✅ Local'de `github-actions-key.json` .gitignore'da
- ✅ Asla Git'e pushlanmıyor

### GCP Secrets (Kod dışında)
- ✅ JWT_SECRET - Secret Manager'da
- ✅ DB_PASSWORD - Secret Manager'da
- ✅ Workflows bu secretlara erişemiyor (sadece referans veriyor)

---

## 🧪 Test Senaryoları

### Scenario 1: Backend Değişikliği
```bash
# Backend'de değişiklik yap
echo "console.log('test');" >> backend/src/app.ts

git add backend/
git commit -m "Backend test change"
git push origin main

# Sadece deploy-backend.yml çalışır
```

### Scenario 2: Frontend Değişikliği
```bash
# Frontend'de değişiklik yap
echo "// test" >> frontend/src/App.tsx

git add frontend/
git commit -m "Frontend test change"
git push origin main

# Sadece deploy-frontend.yml çalışır
```

### Scenario 3: Full Deployment
```bash
# Hem backend hem frontend değişiklik
echo "// test" >> backend/src/app.ts
echo "// test" >> frontend/src/App.tsx

git add .
git commit -m "Full stack change"
git push origin main

# deploy-full.yml çalışır (backend → frontend sırasıyla)
```

### Scenario 4: Manuel Deployment
1. GitHub → Actions
2. "Full Deployment" seç
3. "Run workflow" tıkla
4. Branch seç (main)
5. "Run workflow" onayla

---

## 🔧 Troubleshooting

### Hata: "Error: google-github-actions/auth failed"
**Sebep:** `GCP_SA_KEY` secret yanlış ya da eksik

**Çözüm:**
1. GitHub Settings → Secrets and variables → Actions
2. `GCP_SA_KEY` secret'ının var olduğunu kontrol et
3. Yoksa ADIM 2'yi tekrar yap
4. `github-actions-key.json` içeriğini tam olarak kopyaladığından emin ol

### Hata: "Permission denied"
**Sebep:** Service account'un yeterli yetkisi yok

**Çözüm:**
```powershell
# Rolleri tekrar ekle
gcloud projects add-iam-policy-binding canary-digital-475319 \
  --member="serviceAccount:github-actions@canary-digital-475319.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

### Hata: "Build failed"
**Sebep:** Kod hataları

**Çözüm:**
1. Local'de test et: `npm run build`
2. Hataları düzelt
3. Tekrar push et

### Hata: "Health check failed"
**Sebep:** Service deploy oldu ama health endpoint yanıt vermiyor

**Çözüm:**
1. GCP Console'da service loglarını kontrol et
2. Health endpoint doğru mu? (`/api/health`)
3. Port doğru mu? (Backend: 4000, Frontend: 8080)

### Workflow Çalışmıyor
**Sebep:** Trigger path'leri eşleşmiyor

**Çözüm:**
```yaml
# deploy-backend.yml içinde
on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'  # Bu path'e uygun değişiklik yap
```

---

## 📈 Monitoring & Alerts

### GitHub Actions Email Notifications
**Ayarla:**
1. GitHub → Settings → Notifications
2. "Actions" bölümünde:
   - ✅ Send notifications for failed workflows only
   - ✅ Send notifications for all events

### Slack Integration (Opsiyonel)
Workflow'lara Slack bildirimleri eklemek için:
```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🎯 Best Practices

### 1. Branch Protection
**Main branch'i koru:**
- Settings → Branches → Add rule
- Branch name: `main`
- ✅ Require status checks before merging
- ✅ Require branches to be up to date

### 2. Pull Request Workflow
```bash
# Feature branch oluştur
git checkout -b feature/new-feature

# Değişiklik yap, commit et
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# GitHub'da Pull Request oluştur
# CI/CD otomatik test eder
# Merge olduktan sonra otomatik deploy olur
```

### 3. Staging Environment (Gelecek)
```yaml
# staging branch için ayrı workflow
on:
  push:
    branches:
      - staging
```

### 4. Rollback Strategy
**Hatalı deployment geri al:**
```powershell
# GCP Console → Cloud Run → Revisions
# Önceki revision'a %100 traffic yönlendir

# Ya da CLI ile
gcloud run services update-traffic canary-backend \
  --to-revisions=canary-backend-00006-xxx=100 \
  --region=europe-west1
```

---

## ✅ Setup Checklist

- [ ] `.github/workflows/` klasörü oluşturuldu
- [ ] 3 workflow dosyası eklendi
- [ ] GCP Service Account oluşturuldu
- [ ] Service Account key indirildi (`github-actions-key.json`)
- [ ] `.gitignore` güncellendi (key dosyası eklendi)
- [ ] GitHub repository'de `GCP_SA_KEY` secret eklendi
- [ ] Workflows GitHub'a pushlandı
- [ ] İlk deployment test edildi
- [ ] Deployment başarılı! ✅

---

## 🚀 Sonraki Adımlar

### İleride Eklenebilecekler:
1. **Automated Tests** - Deployment öncesi testler
2. **Staging Environment** - Test ortamı
3. **Blue-Green Deployment** - Zero-downtime
4. **Canary Releases** - Gradual rollout
5. **Automated Rollback** - Hata durumunda otomatik geri alma
6. **Performance Tests** - Load testing
7. **Security Scanning** - Vulnerability checks

---

## 📞 Yardım

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **GCP Cloud Run Docs:** https://cloud.google.com/run/docs
- **Service Account Setup:** https://cloud.google.com/iam/docs/service-accounts

---

**CI/CD Pipeline hazır!** 🎉

Artık her `main` branch'e push ettiğinde otomatik olarak GCP'ye deploy olacak.
