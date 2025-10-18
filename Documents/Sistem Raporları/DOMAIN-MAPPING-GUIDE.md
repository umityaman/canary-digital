# 🌐 Domain Mapping Guide - canary-digital.com
**Google Cloud Run + Squarespace DNS**

---

## ✅ ADIM 1: Google Search Console Verification

### 1.1 Search Console'a Git
- URL: https://search.google.com/search-console/welcome
- Zaten açılmış olmalı (gcloud komutu açtı)

### 1.2 Domain Verification Seç
- **"Domain"** seçeneğini seç (sağ taraf - tüm URL'leri kapsar)
- **"URL prefix"** DEĞİL! (sol taraf - sadece tek URL)

### 1.3 Domain Gir
```
canary-digital.com
```
(www olmadan, https olmadan)

### 1.4 TXT Kaydını Kopyala
Şuna benzer bir kod verecek:
```
google-site-verification=ABC123XYZ456def789...
```
Bu kodu kopyala! 📋

---

## ✅ ADIM 2: Squarespace DNS Ayarları

### 2.1 Squarespace'e Giriş Yap
- URL: https://account.squarespace.com/domains
- Domain listesinde **canary-digital.com**'u bul

### 2.2 DNS Settings'e Git
```
Settings → Domains → canary-digital.com → DNS Settings
```

### 2.3 TXT Record Ekle
**Add Record** butonuna tıkla

- **Record Type:** TXT
- **Host:** `@` (veya boş bırak)
- **Data:** `google-site-verification=ABC123XYZ456def789...` (kopyaladığın kod)
- **TTL:** 3600 (otomatik olabilir)

**Save** / **Add** tıkla

### 2.4 DNS Propagation Bekle
⏰ **5-10 dakika** bekle (bazen 30 dakika sürebilir)

DNS'in yayıldığını kontrol etmek için:
```powershell
nslookup -type=TXT canary-digital.com
```

Çıktıda `google-site-verification=...` görmelisin.

---

## ✅ ADIM 3: Verification'ı Tamamla

### 3.1 Search Console'a Dön
- 5-10 dakika sonra Search Console'daki verification sayfasına geri dön
- **Verify** butonuna tıkla

### 3.2 Başarılı Olursa
✅ "Ownership verified" mesajı görmelisin

### 3.3 Başarısız Olursa
❌ Şunları kontrol et:
- TXT kaydı doğru mu?
- DNS propagation tamamlandı mı?
- Host alanı `@` mı?
- 10-15 dakika daha bekle, tekrar dene

---

## ✅ ADIM 4: Cloud Run Domain Mapping

### 4.1 Verification Başarılı Olunca
PowerShell'de şu komutu çalıştır:

```powershell
# Frontend için ana domain
gcloud beta run domain-mappings create \
  --service=canary-frontend \
  --domain=canary-digital.com \
  --region=europe-west1
```

### 4.2 API Subdomain (opsiyonel)
Backend için ayrı subdomain istersen:

```powershell
# Backend için api subdomain
gcloud beta run domain-mappings create \
  --service=canary-backend \
  --domain=api.canary-digital.com \
  --region=europe-west1
```

### 4.3 DNS Records Göster
Komut çalıştıktan sonra şunu çalıştır:

```powershell
gcloud beta run domain-mappings describe \
  --domain=canary-digital.com \
  --region=europe-west1
```

Şuna benzer IP'ler verecek:
```
A Records:
  216.239.32.21
  216.239.34.21
  216.239.36.21
  216.239.38.21

AAAA Records:
  2001:4860:4802:32::15
  2001:4860:4802:34::15
  2001:4860:4802:36::15
  2001:4860:4802:38::15
```

---

## ✅ ADIM 5: Squarespace'te A ve AAAA Records

### 5.1 Mevcut A Records'u Sil
Squarespace DNS Settings'te:
- Mevcut `@` host'lu **A record**'ları **SİL** (Squarespace default IP'leri)
- Mevcut `www` CNAME'i **SİL** (eğer varsa)

### 5.2 Yeni A Records Ekle
Her IP için ayrı A record ekle:

**Record 1:**
- Type: A
- Host: `@`
- Data: `216.239.32.21`

**Record 2:**
- Type: A
- Host: `@`
- Data: `216.239.34.21`

**Record 3:**
- Type: A
- Host: `@`
- Data: `216.239.36.21`

**Record 4:**
- Type: A
- Host: `@`
- Data: `216.239.38.21`

### 5.3 AAAA Records Ekle (IPv6)
Her IPv6 için ayrı AAAA record ekle:

**Record 1:**
- Type: AAAA
- Host: `@`
- Data: `2001:4860:4802:32::15`

(Diğer 3 IPv6 için tekrarla)

### 5.4 WWW Subdomain (opsiyonel)
`www.canary-digital.com` için:

**Option A - CNAME (önerilen):**
- Type: CNAME
- Host: `www`
- Data: `canary-digital.com`

**Option B - A Records:**
- Yukarıdaki 4 A record'u `www` host ile tekrarla

---

## ✅ ADIM 6: SSL Certificate (Otomatik)

Google Cloud Run otomatik olarak **SSL certificate** oluşturur:
- Let's Encrypt kullanır
- Ücretsiz
- Otomatik yenilenir
- 5-15 dakika sürer

### SSL Status Kontrol
```powershell
gcloud beta run domain-mappings describe \
  --domain=canary-digital.com \
  --region=europe-west1 \
  --format="value(status.conditions)"
```

`CertificateProvisioned: True` görmelisin.

---

## ✅ ADIM 7: Test Et

### 7.1 DNS Propagation Kontrol
```powershell
# A records kontrol
nslookup canary-digital.com

# AAAA records kontrol
nslookup -type=AAAA canary-digital.com
```

Google IP'lerini görmeli (`216.239.x.x`)

### 7.2 Site'yi Aç
```powershell
# HTTP redirect test
curl -I http://canary-digital.com

# HTTPS test
curl -I https://canary-digital.com
```

### 7.3 Browser'da Aç
```
https://canary-digital.com
```

✅ Login sayfası açılmalı!

---

## 🔧 Troubleshooting

### Hata: "Domain not verified"
- Search Console'da verification tamamlandı mı?
- `gcloud domains list` çalıştır, domain listede var mı?

### Hata: "Certificate provisioning failed"
- DNS records doğru mu?
- A records Squarespace IP'leri değil Google IP'leri mi?
- 15-20 dakika bekle, SSL provisioning zaman alıyor

### Hata: "502 Bad Gateway"
- Cloud Run service çalışıyor mu?
- `gcloud run services list --region=europe-west1`
- Frontend URL açılıyor mu direkt?

### Site açılmıyor
```powershell
# DNS propagation kontrol
nslookup canary-digital.com 8.8.8.8

# Domain mapping status
gcloud beta run domain-mappings list --region=europe-west1
```

---

## 📊 Final Checklist

- [ ] Google Search Console'da TXT record eklendi
- [ ] DNS propagation tamamlandı (5-10 dk)
- [ ] Search Console'da "Verify" başarılı
- [ ] `gcloud domain-mappings create` çalıştırıldı
- [ ] A records (4 adet) Squarespace'e eklendi
- [ ] AAAA records (4 adet) Squarespace'e eklendi
- [ ] WWW subdomain yapılandırıldı
- [ ] SSL certificate provisioned (15 dk)
- [ ] https://canary-digital.com açılıyor ✅
- [ ] https://www.canary-digital.com açılıyor ✅

---

## 🚀 Domain Mapping Komutları (Hızlı Referans)

```powershell
# 1. Verification başlat
gcloud domains verify canary-digital.com

# 2. Frontend mapping
gcloud beta run domain-mappings create \
  --service=canary-frontend \
  --domain=canary-digital.com \
  --region=europe-west1

# 3. Backend mapping (opsiyonel)
gcloud beta run domain-mappings create \
  --service=canary-backend \
  --domain=api.canary-digital.com \
  --region=europe-west1

# 4. DNS records göster
gcloud beta run domain-mappings describe \
  --domain=canary-digital.com \
  --region=europe-west1

# 5. Status kontrol
gcloud beta run domain-mappings list --region=europe-west1

# 6. SSL status
gcloud beta run domain-mappings describe \
  --domain=canary-digital.com \
  --region=europe-west1 \
  --format="value(status.conditions)"
```

---

## 📞 Yardım

- **Google Cloud Run Docs:** https://cloud.google.com/run/docs/mapping-custom-domains
- **Squarespace DNS Guide:** https://support.squarespace.com/hc/en-us/articles/205812378
- **DNS Propagation Check:** https://www.whatsmydns.net/

---

**Hazırlandı:** 2025-10-17
**Domain:** canary-digital.com
**Services:** canary-frontend, canary-backend
**Region:** europe-west1
