# 🌐 Custom Domain Setup - rental.canary-digital.com

**Tarih:** 20 Ekim 2025  
**Domain:** rental.canary-digital.com  
**Hedef:** Cloud Run Frontend Service

---

## 📝 Adım 1: Cloud Run Service'e Domain Mapping

### Frontend için:

```bash
# Google Cloud Console'a giriş yap
gcloud auth login

# Project'i seç
gcloud config set project canary-digital-439910

# Frontend service'e custom domain ekle
gcloud run services update canary-frontend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated

# Domain mapping oluştur
gcloud beta run domain-mappings create \
  --service canary-frontend \
  --domain rental.canary-digital.com \
  --region europe-west1
```

### Backend için (API subdomain):

```bash
# Backend için api.rental.canary-digital.com
gcloud beta run domain-mappings create \
  --service canary-backend \
  --domain api.rental.canary-digital.com \
  --region europe-west1
```

---

## 📝 Adım 2: DNS Kayıtlarını Güncelle (Cloud Domains)

Google Cloud Console komut çalıştırdıktan sonra size DNS kayıtları verecek:

**Örnek DNS Kayıtları:**
```
CNAME rental.canary-digital.com → ghs.googlehosted.com
A     rental.canary-digital.com → [IP Address]
AAAA  rental.canary-digital.com → [IPv6 Address]
```

### Cloud Domains'de DNS Güncelleme:

1. **Google Cloud Console** → https://console.cloud.google.com
2. **Network Services** → **Cloud Domains**
3. **canary-digital.com** domain'ini seç
4. **DNS** → **Manage**
5. **Add Record** butonuna tıkla
6. Aşağıdaki kayıtları ekle:

#### Frontend - rental.canary-digital.com
```
Type: CNAME
Name: rental
Data: ghs.googlehosted.com.
TTL: 300
```

veya A/AAAA records:
```
Type: A
Name: rental
Data: [Google'ın verdiği IP]
TTL: 300

Type: AAAA
Name: rental
Data: [Google'ın verdiği IPv6]
TTL: 300
```

#### Backend - api.rental.canary-digital.com
```
Type: CNAME
Name: api.rental
Data: ghs.googlehosted.com.
TTL: 300
```

---

## 📝 Adım 3: SSL Certificate Doğrulama

Google Cloud Run otomatik olarak SSL sertifikası oluşturacak.
Domain mapping'den sonra **15-30 dakika** içinde aktif olur.

Durum kontrolü:
```bash
# Mapping durumunu kontrol et
gcloud beta run domain-mappings describe \
  --domain rental.canary-digital.com \
  --region europe-west1

# SSL sertifika durumu
# Status: ACTIVE olmalı
```

---

## 📝 Adım 4: Frontend Environment Variables Güncelle

Frontend'te API URL'i güncellemek gerekebilir.

**frontend/.env.production:**
```env
VITE_API_URL=https://api.rental.canary-digital.com
VITE_APP_URL=https://rental.canary-digital.com
```

---

## 🚀 Hızlı Komutlar (PowerShell)

### Domain Mapping Oluştur:
```powershell
# Frontend
gcloud beta run domain-mappings create --service canary-frontend --domain rental.canary-digital.com --region europe-west1

# Backend
gcloud beta run domain-mappings create --service canary-backend --domain api.rental.canary-digital.com --region europe-west1
```

### Durumu Kontrol Et:
```powershell
# Frontend domain status
gcloud beta run domain-mappings describe --domain rental.canary-digital.com --region europe-west1

# Backend domain status
gcloud beta run domain-mappings describe --domain api.rental.canary-digital.com --region europe-west1
```

### Domain Mappings Listele:
```powershell
gcloud beta run domain-mappings list --region europe-west1
```

---

## ✅ Test Adımları

1. **DNS Propagation Kontrolü:**
   ```bash
   nslookup rental.canary-digital.com
   ```

2. **HTTP Test:**
   ```bash
   curl https://rental.canary-digital.com
   ```

3. **Browser'da Aç:**
   - https://rental.canary-digital.com
   - https://api.rental.canary-digital.com/health

---

## 🎯 Beklenen Sonuç

- ✅ rental.canary-digital.com → Frontend (Login sayfası)
- ✅ api.rental.canary-digital.com → Backend API
- ✅ SSL aktif (yeşil kilit)
- ✅ canary-digital.com → Mevcut site (değişmeden kalacak)

---

## 📌 Notlar

- DNS propagation **5-60 dakika** sürebilir
- SSL sertifika aktivasyonu **15-30 dakika**
- Eski URL'ler (`canary-frontend-672344972017.europe-west1.run.app`) çalışmaya devam edecek
- Domain mapping sonrası otomatik HTTPS redirect aktif olacak

---

## 🔍 Troubleshooting

### DNS çalışmıyor:
```bash
# DNS records kontrol
nslookup rental.canary-digital.com 8.8.8.8
```

### SSL pending durumunda:
- 30 dakika bekleyin
- DNS kayıtlarının doğru olduğundan emin olun
- Cloud Console'da status kontrol edin

### Domain mapping hatası:
```bash
# Mevcut mappings'i sil
gcloud beta run domain-mappings delete --domain rental.canary-digital.com --region europe-west1

# Yeniden oluştur
gcloud beta run domain-mappings create --service canary-frontend --domain rental.canary-digital.com --region europe-west1
```

---

## 📞 Sonraki Adımlar

1. ✅ gcloud komutlarını çalıştır
2. ✅ DNS kayıtlarını ekle (Cloud Domains)
3. ⏳ DNS propagation bekle (5-60 dakika)
4. ⏳ SSL certificate bekle (15-30 dakika)
5. ✅ Test et: https://rental.canary-digital.com
6. ✅ Frontend .env.production güncelle (ihtiyaç varsa)
7. ✅ Redeploy (yeni URL'lerle)

