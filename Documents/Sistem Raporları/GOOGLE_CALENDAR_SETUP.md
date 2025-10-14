# Google Calendar API - Setup Guide

Bu dokuman Google Calendar entegrasyonu için gerekli OAuth 2.0 credentials'ı nasıl alacağınızı adım adım anlatır.

---

## 📋 ADIM 1: Google Cloud Console'a Giriş

1. **Google Cloud Console**'a gidin: https://console.cloud.google.com
2. Google hesabınızla giriş yapın
3. Üst menüden proje seçici açılır menüsüne tıklayın

---

## 🆕 ADIM 2: Yeni Proje Oluştur

1. "New Project" butonuna tıklayın
2. Proje bilgilerini girin:
   - **Project name**: `Canary Camera Rental`
   - **Organization**: (Yoksa boş bırakın)
   - **Location**: (Varsayılan)
3. "CREATE" butonuna tıklayın
4. Proje oluşturulmasını bekleyin (10-30 saniye)

---

## 🔧 ADIM 3: Google Calendar API'yi Aktifleştir

1. Sol menüden **"APIs & Services"** > **"Library"** seçin
2. Arama kutusuna `Google Calendar API` yazın
3. **"Google Calendar API"** sonucuna tıklayın
4. **"ENABLE"** butonuna tıklayın
5. API'nin aktif olmasını bekleyin

---

## 🔑 ADIM 4: OAuth 2.0 Credentials Oluştur

### 4.1 OAuth Consent Screen Ayarları

1. Sol menüden **"APIs & Services"** > **"OAuth consent screen"** seçin
2. **User Type** seçin:
   - ✅ **External** (Herkes kullanabilir)
   - Internal (Sadece Google Workspace kullanıcıları - kurumsal)
3. "CREATE" butonuna tıklayın

### 4.2 App Information

Aşağıdaki bilgileri girin:

- **App name**: `Canary Camera Rental System`
- **User support email**: Kendi email adresiniz
- **App logo**: (Opsiyonel - 120x120 px PNG)
- **App domain**: (Şimdilik boş bırakabilirsiniz)
  - Application home page: `http://localhost:5173`
  - Application privacy policy link: (Opsiyonel)
  - Application terms of service link: (Opsiyonel)
- **Authorized domains**: (Şimdilik boş bırakın)
- **Developer contact information**: Email adresiniz

"SAVE AND CONTINUE" butonuna tıklayın.

### 4.3 Scopes

1. "ADD OR REMOVE SCOPES" butonuna tıklayın
2. Aşağıdaki scope'ları seçin:
   - ✅ `https://www.googleapis.com/auth/calendar` - Google Calendar access
   - ✅ `https://www.googleapis.com/auth/calendar.events` - Create/edit events
   - ✅ `https://www.googleapis.com/auth/userinfo.email` - User email
3. "UPDATE" butonuna tıklayın
4. "SAVE AND CONTINUE" butonuna tıklayın

### 4.4 Test Users (Opsiyonel)

App henüz "Testing" modundayken, sadece eklediğiniz kullanıcılar test edebilir.

1. "ADD USERS" butonuna tıklayın
2. Test kullanıcı email'lerini ekleyin
3. "SAVE AND CONTINUE" butonuna tıklayın

### 4.5 Summary

Özeti kontrol edin ve "BACK TO DASHBOARD" butonuna tıklayın.

---

## 🎟️ ADIM 5: OAuth 2.0 Client ID Oluştur

1. Sol menüden **"APIs & Services"** > **"Credentials"** seçin
2. Üst menüden **"+ CREATE CREDENTIALS"** > **"OAuth client ID"** seçin
3. **Application type**: `Web application` seçin
4. **Name**: `Canary Backend Server`
5. **Authorized JavaScript origins**:
   - `http://localhost:4000` (Development)
   - `https://your-domain.com` (Production - ileride eklersiniz)
6. **Authorized redirect URIs**:
   - `http://localhost:4000/api/auth/google/callback` ✅ ÖNEMLİ
   - `https://your-domain.com/api/auth/google/callback` (Production)
7. "CREATE" butonuna tıklayın

---

## 📋 ADIM 6: Client ID ve Secret'ı Kopyala

OAuth client oluşturulunca bir popup açılır:

```
OAuth client created
Your Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
Your Client Secret: GOCSPX-abcdefghijklmnopqrst
```

**ÖNEMLİ**: Bu bilgileri şimdi kopyalayın!

1. **Client ID**'yi kopyalayın
2. **Client Secret**'ı kopyalayın
3. "DOWNLOAD JSON" butonuna tıklayarak yedek alın (opsiyonel)

---

## ⚙️ ADIM 7: Backend .env Dosyasını Güncelle

`backend/.env` dosyasını açın ve aşağıdaki satırları güncelleyin:

```env
GOOGLE_CLIENT_ID=BURAYA_CLIENT_ID_YAPIŞTIR
GOOGLE_CLIENT_SECRET=BURAYA_CLIENT_SECRET_YAPIŞTIR
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

**Örnek:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrst
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 ADIM 8: Backend'i Restart Et

Terminal'de:

```bash
cd backend
npm run dev
```

Backend başarıyla başlamalı:
```
✓ Backend listening on port 4000
✓ Google Calendar API configured
```

---

## ✅ ADIM 9: Test Et

### Frontend'de Test

1. Frontend'i çalıştırın: `cd frontend && npm run dev`
2. Login olun
3. **Ayarlar** sayfasına gidin
4. **"Google Calendar'a Bağlan"** butonuna tıklayın
5. Google OAuth ekranı açılmalı
6. İzin verin
7. Callback URL'e yönlendirilmeli
8. "✅ Google Calendar bağlandı" mesajı görünmeli

### Backend'de Test

Postman veya cURL ile test:

```bash
# 1. Auth URL al
curl http://localhost:4000/api/auth/google

# 2. Dönen URL'i tarayıcıda aç
# 3. İzin ver
# 4. Callback'te token kaydedilir

# 5. Status kontrol et
curl http://localhost:4000/api/auth/google/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔒 GÜVENLİK ÖNEMLİ NOTLAR

### ⚠️ ASLA YAPMAYIN:

1. ❌ Client Secret'ı GitHub'a push etmeyin
2. ❌ .env dosyasını commit etmeyin
3. ❌ Client ID'yi frontend JavaScript kodunda hardcode etmeyin
4. ❌ Tokens'ı localStorage'da plain text olarak saklamayın

### ✅ YAPILMASI GEREKENLER:

1. ✅ .env dosyasını .gitignore'a ekleyin
2. ✅ Production'da environment variables kullanın
3. ✅ Refresh token'ları database'de şifreli saklayın
4. ✅ HTTPS kullanın (production)
5. ✅ Rate limiting ekleyin

---

## 🌐 PRODUCTION'A DEPLOY

Production'a deploy ederken:

### 1. Google Cloud Console'da Production URL Ekle

**Credentials** sayfasından OAuth Client'ı edit edin:

- **Authorized JavaScript origins**:
  ```
  https://api.yourdomain.com
  ```

- **Authorized redirect URIs**:
  ```
  https://api.yourdomain.com/api/auth/google/callback
  ```

### 2. .env Production Values

```env
GOOGLE_CLIENT_ID=same_as_development
GOOGLE_CLIENT_SECRET=same_as_development
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

### 3. OAuth Consent Screen - Publish App

1. **OAuth consent screen** sayfasına gidin
2. "PUBLISH APP" butonuna tıklayın
3. Verification için başvurun (Google review süreci)

**Not**: Review süreci 4-6 hafta sürebilir. Bu sürede "Testing" modunda 100 kullanıcıya kadar test edilebilir.

---

## 🐛 TROUBLESHOOTING

### Hata: "redirect_uri_mismatch"

**Çözüm**: Google Console'da **Authorized redirect URIs** ayarını kontrol edin. Tam olarak aynı olmalı:
```
http://localhost:4000/api/auth/google/callback
```

### Hata: "invalid_client"

**Çözüm**: Client ID veya Client Secret yanlış. .env dosyasını kontrol edin.

### Hata: "access_denied"

**Çözüm**: Kullanıcı izin vermeyi reddetti veya scope'lar eksik.

### Hata: "Token expired"

**Çözüm**: Refresh token kullanarak yeni access token alın. GoogleCalendarService bunu otomatik yapar.

---

## 📚 KAYNAKLAR

- **Google Calendar API Docs**: https://developers.google.com/calendar
- **OAuth 2.0 Guide**: https://developers.google.com/identity/protocols/oauth2
- **googleapis npm package**: https://www.npmjs.com/package/googleapis
- **Google Cloud Console**: https://console.cloud.google.com

---

## ✅ CHECKLIST

Kurulum tamamlandı mı?

- [ ] Google Cloud Project oluşturuldu
- [ ] Google Calendar API aktif
- [ ] OAuth consent screen yapılandırıldı
- [ ] OAuth 2.0 credentials oluşturuldu
- [ ] Client ID ve Secret kopyalandı
- [ ] .env dosyası güncellendi
- [ ] Backend restart edildi
- [ ] Test başarılı

**Tamamlandı mı? Frontend implementasyonuna geçelim!** 🚀

---

**Hazırladı**: Canary Development Team  
**Tarih**: 10 Ekim 2025  
**Versiyon**: 1.0
