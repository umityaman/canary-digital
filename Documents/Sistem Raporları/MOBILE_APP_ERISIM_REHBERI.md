# 📱 MOBILE APP'E ERİŞİM REHBERİ
**Tarih:** 19 Ekim 2025  
**Durum:** Production Ready  
**Platform:** iOS + Android

---

## 🚀 HIZLI BAŞLANGIÇ (5 Dakikada!)

### ADIM 1: Backend'i Başlat (Zaten çalışıyor olabilir)

```powershell
# Yeni PowerShell penceresi aç
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\backend
npm run dev

# Backend şu adreste çalışmalı: http://localhost:4000
```

### ADIM 2: Environment Variables'ı Ayarla

```powershell
# Mobile klasörüne git
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile

# .env dosyası var mı kontrol et
Get-Content .env
```

**Eğer .env dosyası yoksa:**
```powershell
# .env.example'dan kopyala
Copy-Item .env.example .env

# Ardından .env dosyasını düzenle
notepad .env
```

**Bilgisayarınızın IP adresini bulun:**
```powershell
ipconfig

# "Wireless LAN adapter Wi-Fi" altında "IPv4 Address" satırını bulun
# Örnek: 192.168.1.100
```

**.env dosyasını düzenleyin:**
```env
API_BASE_URL=http://192.168.1.100:4000
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000

# 192.168.1.100 yerine KENDI IP adresinizi yazın!
```

### ADIM 3: Dependencies Yükle (İlk Kez)

```powershell
# Mobile klasöründe
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile

# Node modules var mı kontrol et
Test-Path node_modules

# Yoksa yükle (bu 2-3 dakika sürer)
npm install
```

### ADIM 4: Expo Server'ı Başlat

```powershell
# Mobile klasöründe
npm start

# Veya cache'le başlat
npx expo start -c
```

Bu komut çalıştığında **QR kod** ve birkaç seçenek göreceksiniz:

```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

---

## 📱 3 FARKLI GÖRÜNTÜLEMe YÖNTEMİ

### YÖNTEM 1: Fiziksel Telefon (ÖNERİLEN! ⭐)

**Android İçin:**
1. **Google Play Store'dan "Expo Go" uygulamasını indirin**
2. Expo Go'yu açın
3. "Scan QR Code" butonuna tıklayın
4. Terminal'deki QR kodu telefonunuzla tarayın
5. Uygulama yüklenip açılacak! 🎉

**iOS İçin:**
1. **App Store'dan "Expo Go" uygulamasını indirin**
2. iPhone'unuzun **Kamera** uygulamasını açın
3. QR kodu kameraya tutun
4. Üstte çıkan bildirme tıklayın
5. Expo Go otomatik açılıp uygulama yüklenecek! 🎉

**ÖNEMLİ:** Telefon ve bilgisayar **aynı WiFi ağında** olmalı!

---

### YÖNTEM 2: Android Emulator

**Önce Android Studio Kurulumu Gerekli:**

1. **Android Studio İndir:**
   - https://developer.android.com/studio
   - Kurulum sırasında "Android Virtual Device" seçeneğini işaretle

2. **Android Emulator Oluştur:**
   - Android Studio'yu aç
   - "More Actions" → "Virtual Device Manager"
   - "Create Device" → Pixel 5 seçin
   - "R" (Android 11) image indir ve seç
   - "Finish"

3. **Emulator'u Başlat:**
   - Device Manager'da emulator'unuza tıklayın
   - ▶️ Play butonuna basın

4. **Mobile App'i Emulator'da Aç:**
```powershell
# Mobile klasöründe
npm run android

# Veya Expo server çalışıyorsa terminal'de 'a' tuşuna bas
```

Emulator'da uygulama otomatik açılacak!

---

### YÖNTEM 3: iOS Simulator (Sadece macOS)

**macOS'taysanız ve Xcode kuruluysa:**

```bash
# Terminal'de
npm run ios

# Veya Expo server çalışıyorsa terminal'de 'i' tuşuna bas
```

iOS Simulator açılıp uygulama yüklenecek.

---

## 🎯 UYGULAMAYI TEST ETME

### 1. Login Ekranı

**Demo Credentials:**
```
Email: admin@canary.com
Password: admin123
```

**Veya test hesabı:**
```
Email: test@canary.com
Password: test123
```

### 2. Ana Sayfa (Dashboard)

Login olduktan sonra:
- ✅ 4 stat card görmelisiniz (Revenue, Reservations, etc.)
- ✅ Quick Actions (3 button)
- ✅ Recent Activities listesi

### 3. Equipment Ekranı

Bottom tab'da "📦 Ekipman" tıklayın:
- ✅ Equipment listesi
- ✅ Search bar
- ✅ Filter button
- ✅ QR Scanner button (header'da)

### 4. QR Scanner Test

1. QR Scanner ikonuna tıklayın
2. Kamera izni verin
3. Bir QR kod tarayın (test için bir QR kod generator kullanın)

### 5. Reservations

Bottom tab'da "📅 Rezervasyon" tıklayın:
- ✅ Reservation listesi
- ✅ "+" button ile yeni rezervasyon

### 6. Profile

Bottom tab'da "👤 Profil" tıklayın:
- ✅ User bilgileri
- ✅ Settings
- ✅ Logout button

---

## 🐛 SORUN GİDERME

### Problem 1: "Cannot connect to backend"

**Çözüm:**
```powershell
# 1. Backend çalışıyor mu kontrol et
curl http://localhost:4000/api/test

# 2. IP adresini kontrol et
ipconfig

# 3. .env dosyasını düzenle
notepad c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile\.env

# 4. Firewall'da port 4000'i aç (PowerShell Admin)
netsh advfirewall firewall add rule name="Canary Backend" dir=in action=allow protocol=TCP localport=4000
netsh advfirewall firewall add rule name="Expo Server" dir=in action=allow protocol=TCP localport=8081

# 5. Expo'yu yeniden başlat
npx expo start -c
```

### Problem 2: "Metro bundler not running"

**Çözüm:**
```powershell
# Cache'i temizle
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile
npx expo start -c

# Eğer hala olmazsa
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npx expo start
```

### Problem 3: "QR kod çalışmıyor"

**Çözüm:**
1. Telefon ve PC **aynı WiFi**'da mı?
2. Expo Go güncel mi? (Play Store/App Store'dan güncelle)
3. QR yerine manuel giriş:
   - Expo Go'da "Enter URL manually"
   - `exp://192.168.1.100:8081` (kendi IP'nizi yazın)

### Problem 4: "Camera permission denied"

**Android:**
- Settings → Apps → Canary → Permissions → Camera → Allow

**iOS:**
- Settings → Privacy → Camera → Canary → On

### Problem 5: "Module not found" hatası

**Çözüm:**
```powershell
# Dependencies'i yeniden yükle
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile
Remove-Item -Recurse -Force node_modules
npm install

# Cache temizle
npx expo start -c
```

### Problem 6: Port 8081 kullanımda

**Çözüm:**
```powershell
# Port'u kullanan process'i bul ve kapat
netstat -ano | findstr :8081

# Process ID'yi not al (en sağdaki sayı)
# Process'i kapat (PID yerine sizinki)
taskkill /PID 12345 /F

# Expo'yu tekrar başlat
npx expo start
```

---

## 📊 PERFORMANS İPUÇLARI

### Hızlı Reload

Kod değişikliği yaptıktan sonra:
- **Automatic:** Dosyayı kaydedin, otomatik reload
- **Manual:** Cihazı sallayın (shake) → "Reload"
- **Terminal:** `r` tuşuna basın

### Debug Menu

- **Android:** Cihazı sallayın veya `Ctrl+M` (emulator)
- **iOS:** Cihazı sallayın veya `Cmd+D` (simulator)

Menu'den:
- "Reload" - Uygulamayı yeniden yükle
- "Debug" - Chrome DevTools aç
- "Element Inspector" - UI elementlerini incele

### Console Logs

```powershell
# Terminal'de 'j' tuşuna bas
# Chrome DevTools açılır
# Console tab'ında tüm console.log() çıktılarını görürsün
```

---

## 🎨 EKRAN GÖRÜNTÜLERİ

### Ana Sayfa
```
┌─────────────────────────────────┐
│  Welcome, Admin! 👋             │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌────┐│
│  │ 124K││ 156 ││  89  ││12.5%││
│  │ TL  ││ Rez ││Aktif││Büyüm││
│  └─────┘ └─────┘ └─────┘ └────┘│
│                                 │
│  Quick Actions                  │
│  🆕 Yeni Rezervasyon            │
│  📷 QR Tara                     │
│  🔔 Bildirimler                 │
│                                 │
│  Recent Activities              │
│  • Reservation #123 created     │
│  • Equipment E001 rented        │
│  • Payment received ₺1,250      │
└─────────────────────────────────┘
```

### Equipment List
```
┌─────────────────────────────────┐
│  Ekipman          🔍  🎚️  📷  │
│                                 │
│  [Search equipment...]          │
│                                 │
│  ┌─────────────────────────────┐│
│  │ 📷 Sony A7 IV               ││
│  │ Kategori: Kamera            ││
│  │ Durum: Müsait  ₺450/gün    ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ 📸 Canon EF Lens            ││
│  │ Kategori: Objektif          ││
│  │ Durum: Kirada  ₺150/gün    ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### QR Scanner
```
┌─────────────────────────────────┐
│  [X]              📋  💡        │
│                                 │
│      ┌───────────────┐          │
│      │   CAMERA      │          │
│      │   PREVIEW     │          │
│      │               │          │
│      │   [ FRAME ]   │          │
│      │               │          │
│      └───────────────┘          │
│                                 │
│   QR kodu çerçeve içine getirin │
│                                 │
│  [📷]      ( ⚪ )      [🔄]     │
│  Gallery   Capture    Flip      │
└─────────────────────────────────┘
```

---

## 📝 NOTLAR

### WiFi Bağlantısı
- ⚠️ Telefon ve PC **aynı WiFi**'da olmalı
- ⚠️ **VPN kapalı** olmalı
- ⚠️ Kurumsal WiFi'lerde **sorun** olabilir (port engelleme)

### IP Adresi
- ⚠️ `.env` dosyasında **localhost KULLANMAYIN**
- ✅ Bilgisayarınızın **local IP adresini** kullanın (192.168.x.x)
- ✅ IP değişirse (farklı WiFi) `.env`'yi güncellemeyi unutmayın

### First Run
- İlk çalıştırmada **dependencies build** edileceği için 1-2 dakika sürer
- Sonraki açılışlar **2-3 saniye** sürer
- Hot reload ile kod değişiklikleri **anında** yansır

---

## 🎯 ÖZET - 5 ADIMDA BAŞLA

```powershell
# 1. Backend'i başlat (başka terminal)
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\backend
npm run dev

# 2. IP adresini öğren
ipconfig  # IPv4 Address'i not al

# 3. .env dosyasını düzenle
notepad c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile\.env
# API_BASE_URL=http://[SENİN_IP]:4000 yaz

# 4. Dependencies yükle (ilk kez)
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile
npm install

# 5. Expo'yu başlat
npx expo start

# 6. Telefonunla QR'ı tara (Expo Go app ile)
```

**5 dakikada çalışır hale gelir!** ✅

---

## 🔗 FAYDALI LİNKLER

- **Expo Go (Android):** https://play.google.com/store/apps/details?id=host.exp.exponent
- **Expo Go (iOS):** https://apps.apple.com/app/expo-go/id982107779
- **Expo Docs:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/

---

## 📞 DESTEK

Sorun yaşarsanız:

1. **Backend çalışıyor mu?** → `curl http://localhost:4000/api/test`
2. **IP doğru mu?** → `ipconfig` ve `.env` karşılaştır
3. **Aynı WiFi mi?** → Telefon ve PC aynı ağda olmalı
4. **Firewall?** → Port 4000 ve 8081 açık olmalı
5. **Cache?** → `npx expo start -c` dene

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 19 Ekim 2025  
**Durum:** ✅ Production Ready Mobile App

🎉 **İyi Geliştirmeler!** 🎉
