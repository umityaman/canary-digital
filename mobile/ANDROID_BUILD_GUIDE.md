# 📱 Android Studio ile Mobile App Build Rehberi

## 🎯 Genel Bakış

Bu rehber, Expo mobile app'i Android Studio kullanarak APK'ya çevirme adımlarını içerir.

## 📋 Gereksinimler

✅ Android Studio yüklü  
✅ Java JDK (Android Studio ile gelir)  
✅ Node.js ve npm  
✅ Expo CLI  

## 🚀 YÖN

TEM 1: EAS Build Setup (Önerilen - Kolay)

### Adım 1: EAS CLI Kurulumu

```powershell
cd C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile
npm install -g eas-cli
```

### Adım 2: Expo Hesabı

```powershell
# Expo hesabınızla giriş yapın
npx expo login
```

Eğer hesabınız yoksa: https://expo.dev/signup

### Adım 3: EAS Build Yapılandırması

```powershell
# Build config oluştur
eas build:configure
```

Bu komut `eas.json` dosyası oluşturacak.

### Adım 4: Development Build Oluştur

```powershell
# Local build (Android Studio gerekli)
eas build --profile development --platform android --local

# VEYA Cloud build (daha kolay, hesap gerekli)
eas build --profile development --platform android
```

**Local build** bilgisayarınızda yapılır (5-10 dakika)  
**Cloud build** Expo serverlarında yapılır (15-20 dakika, ücretsiz)

### Adım 5: APK'yı Yükle

Build tamamlandığında:
- Local: `mobile/android/app/build/outputs/apk/` klasöründe APK olacak
- Cloud: Download linkini verecek

APK'yı telefona yükleyin:
```powershell
# USB debugging açık olmalı
adb install app-debug.apk
```

---

## 🛠️ YÖNTEM 2: Prebuild + Android Studio (Manuel)

### Adım 1: Expo Prebuild

```powershell
cd C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile

# Android klasörünü oluştur
npx expo prebuild --platform android
```

Bu komut `android/` klasörü oluşturacak.

### Adım 2: Android Studio'da Aç

1. Android Studio'yu aç
2. **Open an Existing Project** seç
3. `mobile/android` klasörünü seç
4. Gradle sync bekle (5-10 dakika)

### Adım 3: Build

Android Studio'da:
1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Build tamamlanınca notification'a tıklayın
3. **locate** linkine tıklayın
4. APK dosyası açılacak

### Adım 4: Cihaza Yükle

**USB ile:**
1. Telefonu USB'ye takın
2. USB debugging açık olmalı
3. Android Studio'da **Run** → **Run 'app'**

**Manuel:**
1. APK'yı telefona kopyalayın
2. Dosya yöneticisiyle açın ve yükleyin

---

## 🔧 YÖNTEM 3: Hızlı Test (Expo Go Bypass)

Eğer sadece test etmek istiyorsanız:

```powershell
# Development build oluştur
npx expo run:android
```

Bu komut:
- `android/` klasörü oluşturur (yoksa)
- Build yapar
- Bağlı cihaza yükler
- Metro bundler başlatır

**Gereksinimler:**
- Android Studio yüklü
- USB debugging açık
- Telefon USB'ye bağlı

---

## ⚙️ app.json Güncellemesi

Prebuild öncesi `app.json`'u kontrol edin:

```json
{
  "expo": {
    "name": "Canary Digital",
    "slug": "canary-digital",
    "version": "1.0.0",
    "android": {
      "package": "com.canarydigital.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "CAMERA",
        "NOTIFICATIONS"
      ]
    }
  }
}
```

---

## 🐛 Sorun Giderme

### "Gradle sync failed"
```powershell
cd android
./gradlew clean
```

### "SDK location not found"
Android Studio → **Tools** → **SDK Manager**  
SDK path'i not edin, `local.properties` oluşturun:
```
sdk.dir=C:\\Users\\umity\\AppData\\Local\\Android\\Sdk
```

### "Build failed"
```powershell
# Cache temizle
cd android
./gradlew clean
./gradlew --stop

# Tekrar dene
cd ..
npx expo run:android
```

### "Device not found"
```powershell
# Cihazları listele
adb devices

# Server'ı yeniden başlat
adb kill-server
adb start-server
```

---

## 📊 Hangi Yöntemi Seçmeli?

### EAS Build (YÖNTEM 1) - ⭐ Önerilen
**Artılar:**
- ✅ En kolay
- ✅ Cloud'da build (lokal kaynak kullanmaz)
- ✅ Otomatik signing
- ✅ CI/CD entegrasyonu

**Eksiler:**
- ❌ Expo hesabı gerekli
- ❌ Cloud build 15-20 dakika sürer

**Ne Zaman Kullan:** Production build için, takım çalışması

### Prebuild + Android Studio (YÖNTEM 2)
**Artılar:**
- ✅ Tam kontrol
- ✅ Native kod eklenebilir
- ✅ Offline çalışır

**Eksiler:**
- ❌ Android Studio bilgisi gerekli
- ❌ Manuel adımlar fazla

**Ne Zaman Kullan:** Native modül ekleme, özelleştirme

### Expo Run Android (YÖNTEM 3) - ⚡ En Hızlı
**Artılar:**
- ✅ Tek komut
- ✅ Hızlı test
- ✅ Metro bundler entegre

**Eksiler:**
- ❌ USB debugging gerekli
- ❌ Cihaz bağlı olmalı

**Ne Zaman Kullan:** Hızlı test, development

---

## 🎯 ÖNERİM

**Şimdi için:** YÖNTEM 3 (En hızlı test)
```powershell
cd mobile
npx expo run:android
```

**Production için:** YÖNTEM 1 (EAS Build)

---

## 📱 Backend Bağlantısı

APK'da backend URL'i `.env` dosyasından alınır:
```
EXPO_PUBLIC_API_URL=https://canary-backend-672344972017.europe-west1.run.app
```

Local test için:
```
EXPO_PUBLIC_API_URL=http://192.168.1.39:4000
```

**Not:** Production build'de production URL kullanın!

---

## ✅ Kontrol Listesi

Build öncesi:
- [ ] Android Studio yüklü
- [ ] USB debugging açık (Settings → Developer Options)
- [ ] Telefon USB'ye bağlı
- [ ] `adb devices` çalışıyor
- [ ] Backend çalışıyor (local test için)
- [ ] `.env` dosyası doğru
- [ ] `app.json` yapılandırıldı

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 20 Ekim 2025  
**Dosya:** `mobile/ANDROID_BUILD_GUIDE.md`
