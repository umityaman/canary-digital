# 📱 Canary Mobile App - Başlatma Rehberi

Bu rehber mobil uygulamayı Expo Go ile başlatmanız için hazırlandı.

## 🎯 Hızlı Başlangıç

### Yöntem 1: Script ile Başlatma (ÖNERİLEN)

**1. Yeni bir PowerShell terminali açın**

**2. Backend'i başlatın:**
```powershell
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile
.\start-backend.ps1
```

**3. Başka bir PowerShell terminali açın ve mobile app'i başlatın:**
```powershell
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile
.\start-mobile.ps1
```

**4. QR kodu göründüğünde:**
- Telefonunuzdan **Expo Go** uygulamasını açın
- QR kodu tarayın
- App inmeye başlayacak

### Yöntem 2: Tunnel Mode (LAN çalışmazsa)

Eğer QR kod `127.0.0.1` gösteriyorsa veya bağlantı hatası alıyorsanız:

```powershell
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile
.\start-mobile-tunnel.ps1
```

Bu yöntem ngrok üzerinden public URL oluşturur (daha yavaş ama garantili çalışır).

## 📋 Manuel Başlatma

Script'ler çalışmazsa manuel olarak:

**Terminal 1 - Backend:**
```powershell
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\backend
npm run dev
```

**Terminal 2 - Mobile (LAN mode):**
```powershell
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile
$env:REACT_NATIVE_PACKAGER_HOSTNAME='192.168.1.39'
npx expo start --lan
```

**Terminal 2 - Mobile (Tunnel mode):**
```powershell
cd c:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile
npx expo start --tunnel
```

## 🔧 Sorun Giderme

### QR kod 127.0.0.1 gösteriyor
**Çözüm:** `start-mobile-tunnel.ps1` kullanın

### "Port 4000 already in use" hatası
**Çözüm:**
```powershell
Get-Process node | Stop-Process -Force
```

### "Port 8081 already in use" hatası
**Çözüm:**
```powershell
Get-Process node | Stop-Process -Force
```

### Metro Bundler dondu
**Çözüm:** Ctrl+C ile durdurun ve tekrar başlatın:
```powershell
npx expo start --clear
```

### "Failed to download remote update"
**Çözüm:** 
- Backend'in çalıştığından emin olun (http://192.168.1.39:4000)
- Telefon ve bilgisayar aynı WiFi ağında olmalı
- Tunnel mode kullanın

### SDK version mismatch
**Çözüm:** Expo Go uygulamanızı güncelleyin (SDK 54 gerekli)

## 📱 Test Kullanıcıları

**Admin:**
- Email: admin@canary.com
- Password: admin123

**Test:**
- Email: test@canary.com
- Password: test123

## ✅ Başarılı Bağlantı Kontrol Listesi

- [ ] Backend çalışıyor (http://192.168.1.39:4000)
- [ ] Metro Bundler başladı
- [ ] QR kod göründü
- [ ] Telefon ve PC aynı WiFi ağında
- [ ] Expo Go app açık (SDK 54)
- [ ] QR kod tarandı
- [ ] App indirmeye başladı

## 🚨 Bilinen Sorunlar

1. **React Native Reanimated kaldırıldı** - Bazı animasyonlar çalışmayabilir
2. **9 component dosyası reanimated import'ları içeriyor** - Bu ekranlara girildiğinde hata verebilir:
   - HomeScreen
   - EquipmentDetailScreen
   - EquipmentListScreen
   - UI components (Button, Card, Input, etc.)

Bu dosyalar ileride düzeltilecek.

## 📊 Durum

- ✅ SDK 49 → 54 upgrade tamamlandı
- ✅ Dependencies güncellendi
- ✅ babel.config.js düzeltildi
- ✅ Backend API çalışıyor
- ⏳ QR kod LAN IP sorunu (script ile çözülecek)
- ⏳ Reanimated kaldırıldı (9 dosya düzeltilecek)

## 🎯 Sonraki Adımlar

1. Mobile app'i başarıyla açın
2. Login yapın (admin@canary.com / admin123)
3. Test edin:
   - Equipment listesi
   - Profil ekranı
   - Bildirimler
4. Hata raporu oluşturun

---

**Son Güncelleme:** 19 Ekim 2025
**SDK Versiyonu:** 54
**React Native:** 0.72.6
