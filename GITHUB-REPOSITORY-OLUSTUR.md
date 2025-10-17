# 🚀 GitHub Repository Oluşturma ve Push Rehberi

## 📋 Durum
- ✅ Local'de Git repository var
- ❌ GitHub'da remote repository yok
- 🎯 GitHub'a pushlamamız gerekiyor

---

## 🏗️ ADIM 1: GitHub'da Repository Oluştur

### 1️⃣ GitHub.com'a Git
```
https://github.com/new
```

### 2️⃣ Repository Bilgilerini Doldur

**Repository name:** (önerilen)
```
canary-digital
```

**Description:** (opsiyonel)
```
🐦 Canary Digital - Full Stack Equipment Rental Management System
```

**Visibility:**
- 🔒 **Private** (önerilen - şimdilik özel tut)
- 🌍 Public (herkes görebilir)

**Initialize repository:**
- ❌ **README** ekleme (zaten var)
- ❌ **.gitignore** ekleme (zaten var)
- ❌ **License** ekleme (sonra eklersin)

### 3️⃣ "Create repository" Tıkla

✅ Repository oluşturuldu!

---

## 🔗 ADIM 2: Local Repository'i GitHub'a Bağla

GitHub'da repository oluşturduktan sonra şu komutu göreceksin:

```bash
git remote add origin https://github.com/umityaman/canary-digital.git
```

**PowerShell'de çalıştır:**
```powershell
# Remote ekle
git remote add origin https://github.com/umityaman/canary-digital.git

# Remote'u kontrol et
git remote -v
```

Çıktı:
```
origin  https://github.com/umityaman/canary-digital.git (fetch)
origin  https://github.com/umityaman/canary-digital.git (push)
```

---

## 📦 ADIM 3: GitHub'a Push Et

### .gitignore Güncelle (Önemli!)

Önce hassas dosyaları .gitignore'a ekle:

```powershell
# .gitignore'a ekle
@"

# GCP Service Account Keys
*.json
github-actions-key.json
gcp-*.json
gcp-postgres-password.txt

# Environment files
.env
.env.local
.env.production
.env.*.local

# GCP deployment files
gcp-deploy.ps1
gcp-deploy.sh
"@ | Add-Content .gitignore
```

### Değişiklikleri Stage Et

```powershell
# Tüm değişiklikleri ekle
git add .

# Ne ekleneceğini kontrol et
git status
```

### Commit Yap

```powershell
# Commit yap
git commit -m "Add GCP deployment and CI/CD pipeline

- Add Cloud Run deployment configuration
- Add GitHub Actions workflows
- Add Secret Manager integration
- Add monitoring and domain mapping guides
- Update backend and frontend for GCP
"
```

### Main Branch'e Geç (Eğer master'daysan)

```powershell
# Branch adını kontrol et
git branch

# Eğer master'daysan, main'e rename et (GitHub default main kullanıyor)
git branch -M main
```

### GitHub'a Push Et

```powershell
# İlk push (upstream set ederek)
git push -u origin main
```

**İlk push için GitHub username ve password isteyecek:**
- **Username:** umityaman
- **Password:** GitHub Personal Access Token (PAT) kullanman gerekiyor

---

## 🔑 ADIM 4: GitHub Personal Access Token Oluştur

GitHub artık password ile push izin vermiyor. Token oluşturman gerekiyor.

### 1️⃣ Token Oluştur
```
https://github.com/settings/tokens/new
```

### 2️⃣ Token Ayarları
- **Note:** `Canary Digital Deployment`
- **Expiration:** 90 days (ya da istediğin süre)
- **Select scopes:**
  - ✅ `repo` (tüm repo access)
  - ✅ `workflow` (GitHub Actions için)

### 3️⃣ "Generate token" Tıkla

Token'ı **kopyala ve güvenli bir yere kaydet!** (bir daha göremezsin)

Örnek token:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4️⃣ Push İçin Token Kullan

```powershell
# Push yaparken:
git push -u origin main

# Username: umityaman
# Password: [token'ı yapıştır - ghp_xxx...]
```

**Alternatif: Token'ı URL'e ekle**
```powershell
git remote set-url origin https://umityaman:ghp_TOKENBURAYA@github.com/umityaman/canary-digital.git

# Şimdi push et
git push -u origin main
```

---

## ✅ ADIM 5: Push Başarılı!

Push başarılı olduktan sonra:

```
https://github.com/umityaman/canary-digital
```

Repository'ni görebilirsin! 🎉

---

## 🔐 ADIM 6: GitHub Secret Ekle

Şimdi artık Settings sekmesini göreceksin!

### Direkt Link:
```
https://github.com/umityaman/canary-digital/settings/secrets/actions
```

### Manuel Yol:
1. Repository sayfasında **⚙️ Settings** sekmesi
2. Sol menüde **Secrets and variables** → **Actions**
3. **🟢 New repository secret**

### Secret Ekle:

**Name:**
```
GCP_SA_KEY
```

**Value:** (github-actions-key.json içeriği)
```powershell
# Kopyala
Get-Content github-actions-key.json -Raw | Set-Clipboard

# GitHub'da yapıştır (Ctrl+V)
```

**Add secret** tıkla. ✅

---

## 🚀 ADIM 7: CI/CD Test Et

### Otomatik Deployment

Artık her push'ta otomatik deploy olacak:

```powershell
# Test için küçük bir değişiklik yap
echo "# Canary Digital - Deployed!" | Add-Content README.md

# Commit ve push
git add README.md
git commit -m "Test CI/CD pipeline"
git push origin main
```

### GitHub Actions'ı İzle

```
https://github.com/umityaman/canary-digital/actions
```

Burada deployment'ın çalıştığını göreceksin! 🎬

---

## 🎯 Özet

```powershell
# 1. Remote ekle
git remote add origin https://github.com/umityaman/canary-digital.git

# 2. .gitignore güncelle
# (yukarıdaki komutu çalıştır)

# 3. Commit yap
git add .
git commit -m "Add GCP deployment and CI/CD"

# 4. Main branch
git branch -M main

# 5. Push et
git push -u origin main
# (Token kullan: ghp_xxx...)

# 6. GitHub Secret ekle
# https://github.com/umityaman/canary-digital/settings/secrets/actions
# Name: GCP_SA_KEY
# Value: github-actions-key.json içeriği

# 7. Test et
git push origin main
```

---

## ❓ Sorun mu Var?

### Hata: "remote origin already exists"
```powershell
# Eski remote'u sil
git remote remove origin

# Yeni remote ekle
git remote add origin https://github.com/umityaman/canary-digital.git
```

### Hata: "Permission denied"
- Token yanlış ya da eksik
- Token'ın `repo` ve `workflow` scope'ları olmalı
- Yeni token oluştur ve tekrar dene

### Hata: "Large files"
```powershell
# .gitignore'a ekle ve cache'i temizle
git rm -r --cached .
git add .
git commit -m "Fix gitignore"
```

---

**Hazırsın!** 🚀 GitHub'da repository oluştur ve push et!
