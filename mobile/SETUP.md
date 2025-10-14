# 🚀 CANARY Mobile App - Hızlı Başlangıç Kılavuzu

## 📋 Önkoşullar

Mobil uygulama geliştirmesi için aşağıdaki araçların kurulu olması gereklidir:

### Tüm Platformlar İçin:
- ✅ **Node.js 18+** (LTS)
- ✅ **npm veya yarn**
- ✅ **Expo CLI**

### iOS Development için (Opsiyonel):
- ✅ **macOS**
- ✅ **Xcode** (App Store'dan)
- ✅ **iOS Simulator**

### Android Development için (Opsiyonel):
- ✅ **Android Studio**
- ✅ **Android SDK**
- ✅ **Android Emulator**

## 📦 Kurulum

### 1. Mobil Klasörüne Git

```bash
cd mobile
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Environment Variables

`.env.example` dosyasını kopyalayıp `.env` oluşturun:

```bash
copy .env.example .env
```

`.env` dosyasını düzenleyin ve backend API URL'ini güncelleyin:

```env
# Bilgisayarınızın local IP adresini buraya yazın (localhost DEĞİL!)
API_BASE_URL=http://192.168.1.100:4000
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
```

**IP Adresinizi Öğrenmek İçin:**

**Windows (PowerShell):**
```powershell
ipconfig
# "IPv4 Address" satırını bulun
```

**macOS/Linux:**
```bash
ifconfig | grep "inet "
# veya
ip addr show
```

### 4. Backend'i Başlatın

Mobil uygulamanın çalışması için backend sunucusunun çalışıyor olması gerekir:

```bash
# Başka bir terminal penceresinde
cd ../backend
npm run dev
```

Backend http://localhost:4000 adresinde çalışacaktır.

## 🎬 Uygulamayı Başlatma

### Expo Development Server'ı Başlat

```bash
npm start
```

Bu komut Expo Dev Tools'u başlatacaktır. Terminal'de bir QR kod göreceksiniz.

### Fiziksel Cihazda Test (En Kolay Yöntem)

1. **Expo Go** uygulamasını indirin:
   - iOS: App Store'dan "Expo Go"
   - Android: Google Play'den "Expo Go"

2. Expo Go'yu açın ve QR kodu tarayın:
   - iOS: Kamera uygulamasıyla QR'ı tarayın
   - Android: Expo Go içinden "Scan QR Code"

3. Uygulama cihazınızda açılacaktır! 🎉

**Not:** Telefon ve bilgisayar aynı WiFi ağında olmalıdır.

### iOS Simulator'da Test (macOS)

```bash
npm run ios
```

Xcode yüklü değilse, önce yükleyin:
```bash
xcode-select --install
```

### Android Emulator'da Test

```bash
npm run android
```

Android Studio ve emulator yüklü olmalıdır.

## 🔧 Geliştirme

### Hot Reload

Kod değişiklikleriniz otomatik olarak uygulamaya yansıyacaktır. Manuel reload için:
- iOS/Android: Cihazı sallayın (shake) ve "Reload" seçin
- Emulator: `Cmd+D` (iOS) veya `Cmd+M` (Android)

### Debug Menu

- **iOS**: `Cmd+D` (Simulator) veya cihazı sallayın
- **Android**: `Cmd+M` (Emulator) veya cihazı sallayın

### Logs

Terminal'de logları görebilirsiniz. Daha detaylı için:
```bash
npm start
# Ardından terminal'de 'j' tuşuna basın (Chrome DevTools açar)
```

## 📱 Özellikler Testi

### 1. QR Scanner Test

1. Uygulamada "Equipment" tab'ına gidin
2. QR Scanner iconuna tıklayın
3. Kamera izni verin
4. Bir QR kodu tarayın (backend'den generate edilmiş)

### 2. Push Notifications Test

1. Uygulama açılınca notification izni verin
2. Backend'den test notification gönderin
3. Notification'ın geldiğini doğrulayın

## 🐛 Sorun Giderme

### Port 19000 kullanımda hatası

```bash
# Expo cache'i temizle
npx expo start -c
```

### Metro bundler hatası

```bash
# Node modules'i sil ve yeniden yükle
rm -rf node_modules
npm install

# Cache'i temizle
npx expo start -c
```

### Cannot connect to backend

1. Backend'in çalıştığından emin olun (http://localhost:4000)
2. `.env` dosyasında IP adresinin doğru olduğunu kontrol edin
3. Telefon ve PC aynı WiFi'da olmalı
4. Firewall'un 4000 portunu bloklamadığından emin olun

**Windows Firewall:**
```powershell
# PowerShell (Admin olarak çalıştır)
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=4000
```

### iOS: Could not connect to development server

1. iOS Settings → Wi-Fi → [Your Network] → HTTP Proxy → Off
2. Expo Go'yu kapatıp yeniden açın
3. QR'ı tekrar tarayın

### Android: Network request failed

1. Android Emulator için `.env` dosyasında:
   ```env
   API_BASE_URL=http://10.0.2.2:4000
   ```

2. Fiziksel cihaz için bilgisayarın IP adresini kullanın

## 📚 Dosya Yapısı

```
mobile/
├── App.tsx                    # Root component
├── app.json                   # Expo config
├── package.json
├── tsconfig.json
├── .env                       # Environment variables
├── src/
│   ├── navigation/            # React Navigation setup
│   ├── screens/               # App screens
│   │   ├── auth/             # Login, Splash
│   │   ├── home/             # Dashboard
│   │   ├── equipment/        # Equipment list, detail, QR
│   │   ├── reservations/     # Reservations
│   │   └── profile/          # User profile
│   ├── components/            # Reusable UI components
│   ├── services/              # API services
│   │   ├── api.ts            # Axios setup
│   │   ├── auth.ts           # Auth methods
│   │   └── storage.ts        # AsyncStorage helpers
│   ├── stores/                # Zustand state management
│   │   ├── authStore.ts
│   │   ├── equipmentStore.ts
│   │   └── reservationStore.ts
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Helper functions
│   │   ├── formatters.ts     # Currency, date formatters
│   │   └── validators.ts     # Form validation
│   └── constants/             # App constants
│       ├── colors.ts         # Color palette
│       └── config.ts         # API endpoints, config
└── assets/                    # Images, icons
```

## 🎨 UI Components

Uygulama **React Native Paper** kullanmaktadır:
```typescript
import { Button, Card, TextInput } from 'react-native-paper';
```

Icon'lar için **Lucide React Native** kullanılabilir veya Vector Icons.

## 🔐 Authentication Flow

1. App açılır → **SplashScreen**
2. Token check → Varsa Main, yoksa Login
3. **LoginScreen** → Email/password
4. Login success → Token save → **MainScreen**
5. Logout → Token clear → **LoginScreen**

## 📊 State Management

**Zustand** kullanılıyor:

```typescript
import { useAuthStore } from './stores/authStore';

const { user, login, logout } = useAuthStore();
```

## 🌐 API Calls

```typescript
import api from './services/api';
import { API_ENDPOINTS } from './constants/config';

// GET
const response = await api.get(API_ENDPOINTS.EQUIPMENT);

// POST
const response = await api.post(API_ENDPOINTS.LOGIN, {
  email: 'user@example.com',
  password: 'password',
});
```

## 📸 QR Scanner Usage

```typescript
import { BarCodeScanner } from 'expo-barcode-scanner';

// Permission
const { status } = await BarCodeScanner.requestPermissionsAsync();

// Scan handler
const handleBarCodeScanned = ({ type, data }) => {
  console.log(`Scanned: ${data}`);
  // Fetch equipment by QR code
};
```

## 🔔 Push Notifications

```typescript
import * as Notifications from 'expo-notifications';

// Get push token
const token = await Notifications.getExpoPushTokenAsync();

// Send to backend
await api.post('/api/notifications/register', { pushToken: token.data });
```

## 📦 Build & Deploy

### Development Build

```bash
# iOS
npx eas build --platform ios --profile development

# Android
npx eas build --platform android --profile development
```

### Production Build

```bash
# iOS (App Store)
npx eas build --platform ios --profile production

# Android (Google Play)
npx eas build --platform android --profile production
```

### OTA Updates (Expo Updates)

Kod değişikliklerini app store review olmadan deploy etmek için:

```bash
npx expo publish
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 📝 Sonraki Adımlar

1. ✅ **Navigation Setup** - React Navigation ile ekran geçişleri
2. ✅ **Auth Screens** - Login ve Splash screen'leri
3. ✅ **Home Screen** - Dashboard widget'ları
4. ✅ **Equipment Screens** - Liste, detay, QR scanner
5. ✅ **Reservation Screens** - Liste, oluştur, detay
6. ✅ **Profile Screen** - Kullanıcı bilgileri, ayarlar
7. ⏳ **Push Notifications** - Backend entegrasyonu
8. ⏳ **Offline Mode** - AsyncStorage ile caching
9. ⏳ **Image Upload** - Ekipman fotoğrafları
10. ⏳ **Biometric Auth** - Face ID / Fingerprint

## 🆘 Yardım

- **Expo Docs:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/
- **React Navigation:** https://reactnavigation.org/

## 📄 Lisans

MIT

---

**Hazırlayan:** CANARY Team  
**Tarih:** 13 Ekim 2025  
**Versiyon:** 1.0.0
