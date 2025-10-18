# 🔑 GitHub Secret Nasıl Eklenir?

## ⚠️ Önemli: Repository Settings'e Git (Profil Settings Değil!)

Birçok kişi **kendi profil settings**'ine gidiyor. Bu yanlış! 
**Repository'nin kendi settings**'ine gitmen lazım.

---

## 📍 ADIM ADIM GÖRSEL REHBERİ

### 1️⃣ GitHub Repository'ni Aç
```
Tarayıcıda git: https://github.com
→ Sol menüden repository'ni bul ve tıkla
```

Örnek: `https://github.com/umitylmz/canary-digital`

---

### 2️⃣ Settings Sekmesine Git

**Repository sayfasında üstte 6 sekme var:**
```
📊 <> Code    🔍 Issues    🔨 Pull requests    ⚡ Actions    📦 Projects    ⚙️ Settings
                                                                           ↑
                                                                    BURAYA TIKLA!
```

**Settings** sekmesi **en sağda** olur (⚙️ simgesi ile).

> **Not:** Eğer Settings sekmesini göremiyorsan, repository'nin sahibi sensin değil demektir. Owner/Admin olman gerekiyor.

---

### 3️⃣ Sol Menüden "Secrets and variables" Bul

Settings'e girdikten sonra **SOL TARAFTA** uzun bir menü var:

```
General
Collaborators
Code and automation
  → Branches
  → Tags
  → Actions               ← Bu kategorinin altına bak!
    → General
    → Runners
Security
  → Code security
  → Secrets and variables  ← BURADA!
    → Actions             ← BURAYA TIKLA!
    → Codespaces
    → Dependabot
```

**"Secrets and variables"** → **"Actions"** seç.

---

### 4️⃣ "New repository secret" Butonu

Sağ tarafta yeşil bir buton göreceksin:
```
🟢 New repository secret
```

Buna tıkla!

---

### 5️⃣ Secret Bilgilerini Gir

**Form açılacak:**

**Name:** (büyük harfle yaz)
```
GCP_SA_KEY
```

**Value:** (github-actions-key.json dosyasının içeriği)
```json
{
  "type": "service_account",
  "project_id": "canary-digital-475319",
  ... (tüm içerik)
}
```

**Value'yu kopyalamak için:**
```powershell
# PowerShell'de çalıştır
Get-Content github-actions-key.json | Set-Clipboard

# Sonra GitHub'da Value alanına Ctrl+V ile yapıştır
```

Ya da:
```powershell
# Notepad ile aç, Ctrl+A ile seç, Ctrl+C ile kopyala
notepad github-actions-key.json
```

---

### 6️⃣ "Add secret" Tıkla

Yeşil **Add secret** butonuna tıkla. Bitti! ✅

---

## 🔍 Doğrudan Link (Varsa)

Eğer repository URL'in biliyorsan:
```
https://github.com/USERNAME/REPO-NAME/settings/secrets/actions
```

Örnek:
```
https://github.com/umitylmz/canary-digital/settings/secrets/actions
```

Bu linke tıklarsan **direkt** secret ekleme sayfasına gidersin.

---

## ❌ Sık Yapılan Hatalar

### Hata 1: Profil Settings'e Gitmek
```
❌ YANLIŞ: github.com/settings (senin profilin)
✅ DOĞRU:  github.com/USERNAME/REPO-NAME/settings (repository'nin)
```

### Hata 2: Settings Sekmesi Yok
**Sebep:** Repository'nin sahibi değilsin veya admin değilsin.

**Çözüm:** 
- Repository owner'ından seni **Admin** yapmasını iste
- Ya da owner'ın kendisi secret eklemesi lazım

### Hata 3: JSON Formatı Bozuk
**Sebep:** JSON kopyalarken sadece bir kısmını kopyaladın.

**Çözüm:**
```powershell
# Tüm dosyayı kopyala
Get-Content github-actions-key.json -Raw | Set-Clipboard

# Dosyanın başında { ve sonunda } olduğundan emin ol
```

### Hata 4: Secret İsmi Yanlış
```
❌ YANLIŞ: gcp_sa_key, GCP-SA-KEY, gcp sa key
✅ DOĞRU:  GCP_SA_KEY (tam olarak bu şekilde, büyük harfle)
```

---

## ✅ Secret Doğru Eklendi mi Kontrol

Secret ekledikten sonra:

1. **Secrets and variables → Actions** sayfasında
2. **Repository secrets** listesinde
3. `GCP_SA_KEY` görünmeli

```
Repository secrets (1)

🔑 GCP_SA_KEY    Updated 1 minute ago    🗑️ Delete
```

> **Not:** Secret'ın değerini bir daha göremezsin (güvenlik için). Yanlış eklediysen, sil ve yeniden ekle.

---

## 🎬 Video Tutorial (Alternatif)

YouTube'da "GitHub Actions secrets" araması yapabilirsin.

Örnek arama:
```
github actions add secret tutorial
```

---

## 📞 Hala Bulamadın mı?

### Repo URL'ini bana söyle:
```
git remote -v
```

Komutu çalıştır, çıktıyı gönder. Ben sana direkt linki veririm.

---

## 🚀 Secret Ekledikten Sonra

```bash
# Workflows'u push et
git add .github/
git commit -m "Add CI/CD workflows"
git push origin main

# GitHub → Actions sekmesinde çalışmaya başladığını göreceksin
```

---

**İyi şanslar!** 🎉
