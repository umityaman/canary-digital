# 🚀 HIZLI BAŞLANGIÇ: Google Calendar Setup

**Süre**: 15-20 dakika  
**Aşamalar**: 9 adım

---

## 📌 ADIM 1: Google Cloud Console'a Git

1. Tarayıcınızda şu adresi açın: **https://console.cloud.google.com**
2. Google hesabınızla giriş yapın
3. Eğer ilk kez kullanıyorsanız, Terms of Service'i kabul edin

---

## 📌 ADIM 2: Yeni Proje Oluştur

1. **Üst menüdeki proje seçici**'ye tıklayın (Google Cloud Platform yazısının yanında)
2. **"NEW PROJECT"** butonuna tıklayın
3. Proje bilgilerini girin:
   ```
   Project name: Canary Camera Rental
   Location: No organization (varsayılan)
   ```
4. **"CREATE"** butonuna tıklayın
5. Projenin oluşmasını bekleyin (10-30 saniye)
6. Bildirim geldiğinde **"SELECT PROJECT"** tıklayın

---

## 📌 ADIM 3: Google Calendar API'yi Etkinleştir

1. Sol üst köşedeki **hamburger menu** (☰) tıklayın
2. **"APIs & Services"** → **"Library"** seçin
3. Arama kutusuna: **`Google Calendar API`** yazın
4. İlk sonuca (**Google Calendar API**) tıklayın
5. **"ENABLE"** butonuna tıklayın
6. API'nin etkinleşmesini bekleyin (~5 saniye)

✅ Ekranda "API enabled" yazısını görmelisiniz

---

## 📌 ADIM 4: OAuth Consent Screen Yapılandır

1. Sol menüden **"APIs & Services"** → **"OAuth consent screen"** seçin
2. **User Type** seçin:
   - ✅ **External** seçin (herkese açık)
   - "Internal" sadece Google Workspace için
3. **"CREATE"** butonuna tıklayın

### App Information:
```
App name: Canary Camera Rental System
User support email: [Kendi email adresiniz]
App logo: [Boş bırakabilirsiniz]
```

### App domain (ŞİMDİLİK BOŞ BIRAKIN):
```
Application home page: [Boş]
Application privacy policy: [Boş]
Application terms of service: [Boş]
```

### Developer contact information:
```
Email addresses: [Kendi email adresiniz]
```

4. **"SAVE AND CONTINUE"** butonuna tıklayın

---

## 📌 ADIM 5: Scopes Ekle

1. **"ADD OR REMOVE SCOPES"** butonuna tıklayın
2. Arama kutusuna **`calendar`** yazın
3. Şu 2 scope'u seçin (checkbox işaretleyin):
   ```
   ✅ .../auth/calendar
   ✅ .../auth/calendar.events
   ```
4. Arama kutusuna **`email`** yazın
5. Şu scope'u seçin:
   ```
   ✅ .../auth/userinfo.email
   ```
6. **"UPDATE"** butonuna tıklayın
7. **"SAVE AND CONTINUE"** butonuna tıklayın

---

## 📌 ADIM 6: Test Users (Opsiyonel)

App "Testing" modundayken sadece eklediğiniz kullanıcılar test edebilir.

1. **"ADD USERS"** butonuna tıklayın
2. Kendi email adresinizi ekleyin
3. Test edecek başka kullanıcılar varsa onları da ekleyin
4. **"ADD"** butonuna tıklayın
5. **"SAVE AND CONTINUE"** butonuna tıklayın

### Summary:
6. Özeti kontrol edin
7. **"BACK TO DASHBOARD"** butonuna tıklayın

---

## 📌 ADIM 7: OAuth Client ID Oluştur (EN ÖNEMLİ!)

1. Sol menüden **"APIs & Services"** → **"Credentials"** seçin
2. Üstte **"+ CREATE CREDENTIALS"** butonuna tıklayın
3. **"OAuth client ID"** seçin

### Application type:
```
Application type: Web application
```

### Name:
```
Name: Canary Backend Server
```

### Authorized JavaScript origins:
**"+ ADD URI"** butonuna tıklayın ve ekleyin:
```
http://localhost:4000
```

### Authorized redirect URIs:
**"+ ADD URI"** butonuna tıklayın ve ekleyin:
```
http://localhost:4000/api/auth/google/callback
```

⚠️ **ÇOK ÖNEMLİ**: Bu URL'yi TAM OLARAK bu şekilde yazın!

4. **"CREATE"** butonuna tıklayın

---

## 📌 ADIM 8: Credentials'ı Kopyala

Bir popup açılacak: **"OAuth client created"**

### Bu bilgileri KOPYALAYIN:

```
Your Client ID: 
[Çok uzun bir string - .apps.googleusercontent.com ile biter]

Your Client Secret:
[GOCSPX- ile başlayan string]
```

**ÇOK ÖNEMLİ**: 
- Bu bilgileri bir yere not edin
- "DOWNLOAD JSON" butonuna tıklayarak da yedekleyebilirsiniz
- Popup'ı kapatırsanız, Credentials sayfasından tekrar erişebilirsiniz

---

## 📌 ADIM 9: .env Dosyasını Güncelle

### Windows Explorer'da:
1. `C:\Users\umity\Desktop\CANARY-BACKUP-20251008-1156\backend` klasörünü açın
2. `.env` dosyasını VS Code veya Notepad ile açın

### Şu satırları bulun:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### KOPYALADIĞINIZ DEĞERLERLE DEĞİŞTİRİN:
```env
GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
```

### Dosyayı kaydedin (Ctrl+S)

---

## 🧪 ADIM 10: Backend'i Restart Et

### Terminal'de:
```powershell
cd backend
npm run dev
```

### Görmeli olduğunuz çıktı:
```
✓ Backend listening on port 4000
```

---

## ✅ ADIM 11: TEST ET!

### 1. Frontend'i Başlat (Yeni Terminal):
```powershell
cd frontend
npm run dev
```

### 2. Tarayıcıda:
```
http://localhost:5173
```

### 3. Login Ol:
- Email: (herhangi bir email)
- Password: (herhangi bir şifre)

### 4. Settings Sayfasına Git:
- Sol menüden **"Ayarlar"** tıkla

### 5. Google Calendar'a Bağlan:
- **"Google Calendar'a Bağlan"** butonuna tıkla
- Popup açılacak
- Google hesabınızla giriş yapın
- İzin verin (Allow)
- Popup kapanacak
- **"✅ Bağlı"** durumunu görmelisiniz

---

## 🎉 BAŞARILI!

Artık:
- ✅ Yeni sipariş oluşturduğunuzda Google Calendar'a event eklenir
- ✅ Müşteriye otomatik email daveti gider
- ✅ Sipariş güncellendiğinde event güncellenir
- ✅ Sipariş iptal edildiğinde event silinir

---

## 🐛 Sorun mu var?

### Hata: "redirect_uri_mismatch"
**Çözüm**: Google Console'da Authorized redirect URIs'ı kontrol edin:
```
http://localhost:4000/api/auth/google/callback
```
Tam olarak bu şekilde olmalı (sonunda `/` yok!)

### Hata: "invalid_client"
**Çözüm**: Client ID veya Secret yanlış kopyalanmış. .env dosyasını kontrol edin.

### Hata: "access_denied"
**Çözüm**: OAuth consent screen'de scope'ları kontrol edin. Calendar ve email scope'ları ekli mi?

### Popup açılmıyor
**Çözüm**: Popup blocker'ı kapatın veya site için izin verin.

---

## 📞 YARDIM

Sorun mu yaşıyorsunuz? 

1. Backend terminal'inde hata var mı kontrol edin
2. Browser console'u açın (F12) ve hata var mı bakın
3. Google Cloud Console'da quota'ları kontrol edin

---

**Hazırladı**: Canary Team  
**Tarih**: 10 Ekim 2025  
**Durum**: Production Ready ✅
