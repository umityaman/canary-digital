# 🎯 YARINKI ÖNCELIKLER - 20 Ekim 2025

**Tarih:** 20 Ekim 2025, Pazar  
**Hedef Süre:** 4-6 saat  
**Ana Odak:** 📱 Mobile App Çalıştırma ve Test

---

## ⚡ CRITICAL (Önce Bunlar) - P0

### 1️⃣ Mobile App Başlatma Sorunu Çözümü
**Süre:** 1-2 saat  
**Öncelik:** 🔴 P0

#### Adımlar:
- [ ] Yeni PowerShell terminal aç
- [ ] Backend başlat: `cd backend ; npm run dev`
- [ ] Backend çalıştığını kontrol et (http://192.168.1.39:4000)
- [ ] İkinci terminal aç, mobile dizine git
- [ ] `.\DIAGNOSE.ps1` çalıştır - sistem durumunu kontrol et
- [ ] `.\start-mobile.ps1` çalıştır (LAN mode)
- [ ] Eğer LAN IP çalışmazsa: `.\start-mobile-tunnel.ps1` (tunnel mode)
- [ ] QR kod scan et (Expo Go app)
- [ ] App'in indirilmesini bekle
- [ ] İlk açılış hatasını logla

#### Beklenen Sonuç:
✅ QR kod exp://192.168.1.39:8081 gösteriyor  
✅ Telefonda Expo Go ile tarama başarılı  
✅ Bundle indiriliyor mesajı görünüyor  
✅ App açılıyor (veya hata mesajı net görünüyor)

#### Olası Sorunlar:
- QR 127.0.0.1 gösteriyorsa → tunnel mode kullan
- "Failed to download" → Backend çalışıyor mu kontrol et
- Import error → Reanimated imports (sonraki adım)
- Error 500 → Metro cache temizle: `npx expo start --clear`

---

### 2️⃣ React Native Reanimated Imports Temizliği
**Süre:** 1 saat  
**Öncelik:** 🔴 P0

#### Etkilenen Dosyalar (9 adet):
1. `mobile/src/screens/home/HomeScreen.tsx`
2. `mobile/src/screens/equipment/EquipmentDetailScreen.tsx`
3. `mobile/src/screens/equipment/EquipmentListScreen.tsx`
4. `mobile/src/components/ui/Button.tsx`
5. `mobile/src/components/ui/Card.tsx`
6. `mobile/src/components/ui/Input.tsx`
7. `mobile/src/components/ui/Chip.tsx`
8. `mobile/src/components/ui/Badge.tsx`
9. `mobile/src/components/ui/Avatar.tsx`

#### Her dosya için:
```typescript
// ❌ Kaldır:
import Animated from 'react-native-reanimated';

// ✅ Ekle:
import { Animated } from 'react-native';

// ❌ Değiştir:
<Animated.View ...>

// ✅ Şuna:
<Animated.View ...> // Aynı kullanım ama farklı import
```

#### Test:
- [ ] HomeScreen aç → hata var mı?
- [ ] EquipmentListScreen aç → scroll çalışıyor mu?
- [ ] Button component → tıklama animasyonu çalışıyor mu?
- [ ] Input component → focus animasyonu var mı?

---

## 🔥 HIGH (Sonra) - P1

### 3️⃣ Mobile App Kapsamlı Test
**Süre:** 2 saat  
**Öncelik:** 🟡 P1

#### Test Senaryoları:

**Authentication:**
- [ ] Login ekranı açılıyor mu?
- [ ] Email: admin@canary.com / admin123 ile giriş yap
- [ ] JWT token alınıyor mu?
- [ ] Home screen'e yönlendirme oluyor mu?
- [ ] Logout çalışıyor mu?

**Equipment Module:**
- [ ] Equipment list görünüyor mu?
- [ ] Scroll çalışıyor mu?
- [ ] Arama çalışıyor mu?
- [ ] Filter'lar çalışıyor mu?
- [ ] Equipment detail açılıyor mu?
- [ ] Resimler yükleniyor mu?

**Reservation:**
- [ ] Yeni rezervasyon oluştur
- [ ] Tarih seçici çalışıyor mu?
- [ ] Equipment seçimi çalışıyor mu?
- [ ] Submit başarılı mı?

**QR Scanner:**
- [ ] Camera permission isteniyor mu?
- [ ] QR kod taranıyor mu?
- [ ] Equipment detail açılıyor mu?

**Profile:**
- [ ] Profil bilgileri görünüyor mu?
- [ ] Settings açılıyor mu?
- [ ] Logout çalışıyor mu?

**Notifications:**
- [ ] Notification icon çalışıyor mu?
- [ ] Notification listesi açılıyor mu?
- [ ] Mark as read çalışıyor mu?

#### Bug Listesi:
Her test için bulunan hataları kaydet:
```
BUG-001: [Ekran adı] - [Hata açıklaması]
BUG-002: ...
```

---

### 4️⃣ Backend Route Errors Düzeltme
**Süre:** 1 saat  
**Öncelik:** 🟡 P1

#### Hatalı Route'lar:
1. `/api/payments` - Route.post() callback undefined
2. `/api/parasut` - Route.get() callback undefined
3. `/api/whatsapp` - Route.get() callback undefined
4. `/api/email` - Route.get() callback undefined
5. `/api/social-media` - Cannot find module '../middleware/validate'

#### Adımlar:
- [ ] Her route dosyasını aç
- [ ] Undefined callback'leri bul
- [ ] Controller function'ları import edilmiş mi kontrol et
- [ ] social-media: validate middleware'i oluştur veya import'u düzelt
- [ ] Test et: Postman/Thunder Client ile endpoint'leri dene

---

## 📊 MEDIUM (Zaman Kalırsa) - P2

### 5️⃣ Suppliers Phase 2
**Süre:** 2-3 saat  
**Öncelik:** 🟢 P2

**Not:** Mobile app sorunları çözülmezse bu işe başlama!

#### Backend:
- [ ] Prisma schema: Supplier model'e rating, taxNumber, trustScore ekle
- [ ] Migration oluştur ve çalıştır
- [ ] Rating endpoints: POST /api/suppliers/:id/rate, GET ratings
- [ ] Supplier detail endpoint güncelle

#### Frontend:
- [ ] SupplierDetailModal component
- [ ] Rating component (star rating)
- [ ] Category filter dropdown
- [ ] Advanced search form

---

## 📋 KONTROL LİSTESİ

### Başlamadan Önce
- [ ] Backend server çalışıyor (http://192.168.1.39:4000)
- [ ] Frontend dev server kapalı (port conflict'ten kaçın)
- [ ] Mobile DIAGNOSE.ps1 çalıştır
- [ ] Telefon ve PC aynı WiFi'da
- [ ] Expo Go app güncel (SDK 54)

### Gün Sonunda
- [ ] Tüm changes commit et
- [ ] Bug listesi oluştur (varsa)
- [ ] Yarın için TODO güncelle
- [ ] Gün sonu raporu (kısa özet)

---

## 🎯 BAŞARI KRİTERLERİ

Yarın başarılı sayılması için:

✅ **Minimum:**
- Mobile app telefonda açılıyor
- Login çalışıyor
- Homescreen görünüyor

✅ **Hedef:**
- Tüm ekranlar test edildi
- Bug listesi oluşturuldu
- Backend errors düzeltildi

✅ **Bonus:**
- Suppliers Phase 2 başlatıldı
- APK build araştırması yapıldı

---

## 📝 NOTLAR

### Mobile App Başlatma Alternatifleri

**Plan A: LAN Mode (Önerilen)**
```powershell
cd mobile
.\start-mobile.ps1
```

**Plan B: Tunnel Mode (LAN çalışmazsa)**
```powershell
cd mobile
.\start-mobile-tunnel.ps1
```

**Plan C: Manuel (Script çalışmazsa)**
```powershell
cd mobile
$env:REACT_NATIVE_PACKAGER_HOSTNAME='192.168.1.39'
npx expo start --lan
```

**Plan D: Offline Mode (Son çare)**
```powershell
cd mobile
npx expo start --offline
# Not: Backend'e erişim olmayabilir
```

### Debug Commands

**Process'leri temizle:**
```powershell
Get-Process node | Stop-Process -Force
```

**Port kontrolü:**
```powershell
Test-NetConnection -ComputerName localhost -Port 8081
```

**Cache temizle:**
```powershell
npx expo start --clear
```

**Metro reset:**
```powershell
npx expo start --reset-cache
```

---

## 🚀 HIZLI BAŞLANGIÇ

Sabah ilk yapılacaklar (15 dakika):

```powershell
# 1. Backend Başlat (Terminal 1)
cd C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\backend
npm run dev

# 2. Sistem Kontrolü (Terminal 2)
cd C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\mobile
.\DIAGNOSE.ps1

# 3. Mobile Başlat (Aynı Terminal)
.\start-mobile.ps1

# 4. QR Scan
# Expo Go app ile QR kodu tara
```

---

## ⏰ TAHMINI ZAMAN PLANI

**09:00-11:00** (2h) - Mobile app başlatma + QR scan  
**11:00-12:00** (1h) - Reanimated imports temizliği  
**12:00-13:00** - Öğle molası 🍽️  
**13:00-15:00** (2h) - Mobile app comprehensive testing  
**15:00-16:00** (1h) - Backend route errors  
**16:00-18:00** (2h) - Suppliers Phase 2 (opsiyonel)  
**18:00-18:30** - Gün sonu raporu + commit

**Toplam:** 6 saat net çalışma

---

## 📞 YARDIM

Sorun yaşarsan:
1. `DIAGNOSE.ps1` çalıştır - sistem durumunu kontrol et
2. `MOBILE_APP_BASLAT.md` - detaylı troubleshooting
3. Terminal output'unu screenshot al
4. Error mesajlarını tam kopyala

---

**İyi şanslar! 🍀**  
**Hedef: Mobile app'i çalıştırmak ve test etmek! 📱**

**Hazırlayan:** GitHub Copilot  
**Tarih:** 19 Ekim 2025, 23:30
