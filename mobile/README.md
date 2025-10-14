# 📱 CANARY Mobile App

React Native mobil uygulama - iOS ve Android için cross-platform ekipman kiralama yönetim uygulaması.

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- Expo CLI
- iOS için: Xcode 14+ (Mac)
- Android için: Android Studio 2022.1+
- Backend API running on http://localhost:3000

### Adımlar

```bash
# Expo CLI kurulumu (global)
npm install -g expo-cli

# Bağımlılıkları yükle
npm install

# Development server başlat
npm start

# iOS simulator (Mac required)
npm run ios

# Android emulator
npm run android

# Fiziksel cihazda test
# Expo Go app ile QR kodu tara
```

### API Bağlantısı

Uygulamanın backend'e bağlanabilmesi için:

1. Backend'i başlatın: `cd backend && npm run dev`
2. `mobile/src/services/api.ts` dosyasındaki `BASE_URL`'i düzenleyin:
   - iOS Simulator: `http://localhost:3000`
   - Android Emulator: `http://10.0.2.2:3000`
   - Fiziksel Cihaz: `http://<YOUR_COMPUTER_IP>:3000`

## 📦 Özellikler

### ✅ v1.0 - Temel Özellikler (TAMAMLANDI)

**Authentication**
- ✅ Login/Logout
- ✅ Token yönetimi (AsyncStorage)
- ✅ Auto-refresh
- ✅ Güvenli authentication flow

**Dashboard**
- ✅ Real-time istatistikler
- ✅ Revenue tracking
- ✅ Reservation counts
- ✅ Equipment overview
- ✅ Notification bell with badge

**Equipment Module**
- ✅ Equipment listing
- ✅ Detail view
- ✅ Status management (available, in-use, maintenance)
- ✅ Image support
- ✅ QR code integration
- ✅ Create/Edit/Delete operations

**Reservation Module**
- ✅ Reservation listing
- ✅ Create new reservations
- ✅ Status tracking
- ✅ Date range selection
- ✅ Customer management
- ✅ Notes and pricing

### ✅ v1.1 - İleri Seviye Özellikler (TAMAMLANDI)

**Push Notifications**
- ✅ Expo Push Notifications integration
- ✅ Token management
- ✅ Permission handling
- ✅ Local notifications
- ✅ Foreground/Background handling
- ✅ Badge management
- ✅ Notification screen
- ✅ Mark as read/delete
- ✅ Type-based icons (INFO, SUCCESS, WARNING, ERROR)

**Offline Mode & Sync**
- ✅ Network monitoring with NetInfo
- ✅ Offline indicator
- ✅ Sync queue for offline operations
- ✅ Cache management
- ✅ Auto-sync when online
- ✅ AsyncStorage persistence

**Search & Filters**
- ✅ SearchBar component with debounce
- ✅ FilterChips UI
- ✅ Equipment filter modal
- ✅ Status filter
- ✅ Category filter
- ✅ Sort options (name, category, date)
- ✅ Search history tracking
- ✅ Recent searches

**Settings & Profile**
- ✅ User profile screen
- ✅ Settings screen
- ✅ Notification toggle
- ✅ Theme settings (dark mode placeholder)
- ✅ Cache management
- ✅ Sync queue management
- ✅ Logout functionality

**Error Handling**
- ✅ ErrorBoundary component
- ✅ NetworkError component
- ✅ EmptyState component
- ✅ LoadingSkeleton for better UX
- ✅ Global error handling
- ✅ Retry mechanisms

**Performance**
- ✅ Custom hooks (useDebounce, useThrottle, useAsync)
- ✅ OptimizedFlatList component
- ✅ React.memo optimizations
- ✅ FlatList performance settings
- ✅ Image caching

### 🔄 v1.2 - Gelecek Özellikler (PLANLANIYOR)

**Analytics**
- Liste görünümü
- Detay sayfası
- QR kod tarama
- Filtreleme/arama

✅ **Reservations**
- Rezervasyon listesi
- Yeni rezervasyon
- Rezervasyon detayı
- Durum güncelleme

✅ **QR Scanner**
- Kamera erişimi
- QR/Barcode okuma
- Ekipman bilgisi gösterme

✅ **Notifications**
- Push notifications (Expo Push)
- Bildirim listesi
- Read/unread tracking

### v2.0 (Gelecek)

🔄 **Offline Mode**
- Local storage (AsyncStorage)
- Sync when online
- Conflict resolution

🔄 **Advanced Features**
- Image upload (ekipman fotoğrafları)
- Signature pad (dijital imza)
- Maps integration (şube konumları)

## 🏗️ Teknoloji Stack

- **Framework:** React Native (Expo)
- **Navigation:** React Navigation
- **State Management:** Zustand
- **API Client:** Axios
- **UI Components:** React Native Paper
- **Icons:** React Native Vector Icons
- **QR Scanner:** expo-barcode-scanner
- **Notifications:** expo-notifications
- **Storage:** AsyncStorage

## 📁 Proje Yapısı

```
mobile/
├── app.json                  # Expo config
├── package.json
├── tsconfig.json
├── babel.config.js
├── App.tsx                   # Root component
├── src/
│   ├── navigation/           # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── screens/              # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SplashScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── equipment/
│   │   │   ├── EquipmentListScreen.tsx
│   │   │   ├── EquipmentDetailScreen.tsx
│   │   │   └── QRScannerScreen.tsx
│   │   ├── reservations/
│   │   │   ├── ReservationListScreen.tsx
│   │   │   ├── ReservationDetailScreen.tsx
│   │   │   └── CreateReservationScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   ├── components/           # Reusable components
│   │   ├── EquipmentCard.tsx
│   │   ├── ReservationCard.tsx
│   │   ├── StatCard.tsx
│   │   └── QRScanner.tsx
│   ├── services/             # API services
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── storage.ts
│   ├── stores/               # Zustand stores
│   │   ├── authStore.ts
│   │   ├── equipmentStore.ts
│   │   └── reservationStore.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   ├── utils/                # Utility functions
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── constants/            # App constants
│       ├── colors.ts
│       └── config.ts
└── assets/                   # Images, fonts, etc.
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

## 🔐 Environment Variables

`.env` dosyası oluştur:

```env
API_BASE_URL=http://192.168.1.100:4000
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
```

**Not:** Local development için bilgisayarınızın IP adresini kullanın (localhost değil!)

## 📱 Ekran Yapısı

### Auth Stack
- **Splash Screen** → Otomatik login check
- **Login Screen** → Email/password

### Main Stack (Tab Navigator)
- **Home Tab** 
  - Dashboard
  - Hızlı aksiyonlar
  - Son aktiviteler

- **Equipment Tab**
  - Equipment List
  - Equipment Detail
  - QR Scanner

- **Reservations Tab**
  - Reservation List
  - Reservation Detail
  - Create Reservation

- **Profile Tab**
  - User info
  - Settings
  - Logout

## 🎨 UI Design

**Color Scheme:**
```typescript
const colors = {
  primary: '#3b82f6',      // Blue
  secondary: '#8b5cf6',    // Purple
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Yellow
  error: '#ef4444',        // Red
  background: '#f9fafb',   // Light gray
  surface: '#ffffff',      // White
  text: '#1f2937',         // Dark gray
  textSecondary: '#6b7280',// Medium gray
};
```

## 🔔 Push Notifications

### Setup (Expo Push)

```typescript
import * as Notifications from 'expo-notifications';

// Notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Get push token
const token = await Notifications.getExpoPushTokenAsync();
```

### Backend Integration

Backend'den bildirim gönderme:

```bash
POST https://exp.host/--/api/v2/push/send
Content-Type: application/json

{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "sound": "default",
  "title": "Yeni Rezervasyon",
  "body": "RES-2025-0042 onaylandı!",
  "data": { "reservationId": 42 }
}
```

## 📸 QR Kod Tarama

```typescript
import { BarCodeScanner } from 'expo-barcode-scanner';

// Permission request
const { status } = await BarCodeScanner.requestPermissionsAsync();

// Scan handler
const handleBarCodeScanned = ({ type, data }) => {
  console.log(`QR Code: ${data}`);
  // API call to get equipment info
};
```

## 🚀 Deployment

### iOS (App Store)

1. Apple Developer hesabı oluştur ($99/year)
2. Bundle ID oluştur
3. Build:
   ```bash
   expo build:ios
   ```
4. App Store Connect'e yükle
5. Review için gönder

### Android (Google Play)

1. Google Play Console hesabı ($25 one-time)
2. Build:
   ```bash
   expo build:android
   ```
3. APK veya AAB oluştur
4. Google Play Console'a yükle
5. Review için gönder

### Expo Updates (OTA)

```bash
# Code changes için (app store review olmadan)
expo publish
```

## 📊 Analytics

```bash
npm install expo-firebase-analytics
```

Track events:
```typescript
import * as Analytics from 'expo-firebase-analytics';

Analytics.logEvent('view_equipment', {
  equipment_id: 123,
  equipment_name: 'Canon R5',
});
```

## 🧪 Testing

```bash
# Jest setup
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

## 📚 Dokümantasyon

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

## 🐛 Bilinen Sorunlar

- [ ] Android'de QR scanner bazı cihazlarda yavaş açılıyor
- [ ] iOS'ta push notification badge count sıfırlanmıyor
- [ ] Offline mode'da conflict resolution eksik

## 🔜 Yapılacaklar

- [ ] Biometric authentication (Face ID / Fingerprint)
- [ ] Dark mode support
- [ ] Multi-language (i18n)
- [ ] Offline-first architecture
- [ ] Image optimization
- [ ] Performance monitoring

## 📄 Lisans

MIT

---

**Version:** 1.0.0  
**Last Updated:** 13 Ekim 2025
