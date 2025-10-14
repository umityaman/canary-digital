# 🎯 Google Calendar Setup - Screenshot Checklist

Bu dokuman, her adımda ne görmeniz gerektiğini açıklar.

---

## ✅ ADIM 1: Google Cloud Console

**URL**: https://console.cloud.google.com

**Görmelisiniz**:
```
┌─────────────────────────────────────────────┐
│  Google Cloud Platform                      │
│  [Proje Seçici ▼]  [Search]  [Hesap]      │
├─────────────────────────────────────────────┤
│                                             │
│  Welcome to Google Cloud Platform          │
│  ☁️                                         │
│                                             │
│  [Create a Project]                         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✅ ADIM 2: Yeni Proje

**Proje Seçici → NEW PROJECT**

**Form Görünümü**:
```
New Project
─────────────────────────────────────
Project name: 
┌────────────────────────────────────┐
│ Canary Camera Rental               │ [Buraya yazın]
└────────────────────────────────────┘

Project ID:
canary-camera-rental-abc123 [Otomatik]

Location:
┌────────────────────────────────────┐
│ No organization                    ▼│
└────────────────────────────────────┘

           [CANCEL]  [CREATE]
```

**Başarı Bildirimi**:
```
✓ Project created: Canary Camera Rental
  [SELECT PROJECT]
```

---

## ✅ ADIM 3: Calendar API

**APIs & Services → Library**

**Arama**:
```
Search for APIs & Services
┌────────────────────────────────────┐
│ Google Calendar API            🔍  │
└────────────────────────────────────┘

Results:
┌─────────────────────────────────────┐
│ 📅 Google Calendar API              │
│    Integrate your service...        │
│                          [View] →   │
└─────────────────────────────────────┘
```

**API Sayfası**:
```
Google Calendar API
─────────────────────────────────
Integrates your service with 
Google Calendar.

Status: ⚪ Not enabled

         [ENABLE]
```

**Başarı**:
```
Google Calendar API
Status: ✅ Enabled
```

---

## ✅ ADIM 4: OAuth Consent Screen

**OAuth consent screen → CREATE**

**User Type**:
```
Select User Type
─────────────────────────────────

○ Internal
  Only available to users within
  your Google Workspace

● External  [Bu seçili olmalı]
  Available to any test user with
  a Google Account

         [CREATE]
```

**App Information**:
```
OAuth consent screen
─────────────────────────────────

App information
───────────────
App name *
┌────────────────────────────────┐
│ Canary Camera Rental System    │
└────────────────────────────────┘

User support email *
┌────────────────────────────────┐
│ your-email@gmail.com         ▼│
└────────────────────────────────┘

App logo
[Upload] (Optional)

Developer contact *
┌────────────────────────────────┐
│ your-email@gmail.com           │
└────────────────────────────────┘

  [SAVE AND CONTINUE]
```

---

## ✅ ADIM 5: Scopes

**Scopes Sayfası**:
```
Scopes
─────────────────────────────────

Add or remove scopes to tell 
users what data your app accesses.

[ADD OR REMOVE SCOPES]
```

**Scope Seçimi Popup**:
```
Update selected scopes
─────────────────────────────────
Search scopes
┌────────────────────────────────┐
│ calendar                     🔍│
└────────────────────────────────┘

Filter: [ ] Recommended

Results:
☑️ .../auth/calendar
   See, edit, share, and permanently
   delete calendars
   
☑️ .../auth/calendar.events
   View and edit events

☑️ .../auth/userinfo.email
   View your email address

       [CANCEL]  [UPDATE]
```

**Başarı**:
```
Your non-sensitive scopes
───────────────────────────────
• .../auth/calendar
• .../auth/calendar.events  
• .../auth/userinfo.email

[EDIT]
```

---

## ✅ ADIM 6: Test Users

**Test users (Optional)**:
```
Test users
─────────────────────────────────

Add email addresses for test users
who can access your app.

┌────────────────────────────────┐
│ your-email@gmail.com           │
│ + Add another email            │
└────────────────────────────────┘

[ADD USERS]
```

---

## ✅ ADIM 7: OAuth Client ID

**Credentials → CREATE CREDENTIALS**

**Application type**:
```
Create OAuth client ID
─────────────────────────────────

Application type *
┌────────────────────────────────┐
│ Web application              ▼│
└────────────────────────────────┘

Name *
┌────────────────────────────────┐
│ Canary Backend Server          │
└────────────────────────────────┘
```

**Authorized origins**:
```
Authorized JavaScript origins
─────────────────────────────────

URIs 1
┌────────────────────────────────┐
│ http://localhost:4000          │
└────────────────────────────────┘

[+ ADD URI]
```

**Authorized redirect URIs**:
```
Authorized redirect URIs
─────────────────────────────────

URIs 1
┌────────────────────────────────┐
│ http://localhost:4000/api/     │
│ auth/google/callback           │
└────────────────────────────────┘

[+ ADD URI]

       [CANCEL]  [CREATE]
```

---

## ✅ ADIM 8: Credentials Popup

**Başarı Popup**:
```
┌─────────────────────────────────┐
│ OAuth client created      [X]   │
├─────────────────────────────────┤
│                                 │
│ Your Client ID                  │
│ ┌─────────────────────────────┐ │
│ │123456789-abc...xyz.apps.    │ │
│ │googleusercontent.com        │ │
│ └─────────────────────────────┘ │
│              [Copy] 📋          │
│                                 │
│ Your Client Secret              │
│ ┌─────────────────────────────┐ │
│ │GOCSPX-abcdefghijklmnop      │ │
│ └─────────────────────────────┘ │
│              [Copy] 📋          │
│                                 │
│       [DOWNLOAD JSON]           │
│            [OK]                 │
└─────────────────────────────────┘
```

**⚠️ ÖNEMLİ**: Her iki değeri de kopyalayın!

---

## ✅ ADIM 9: .env Dosyası

**Önceki hali**:
```env
# Google Calendar API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

**Güncellenmişhali**:
```env
# Google Calendar API Configuration
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

---

## ✅ ADIM 10: Backend Start

**Terminal**:
```powershell
PS C:\...\CANARY-BACKUP-20251008-1156> cd backend
PS C:\...\backend> npm run dev

> backend@1.0.0 dev
> ts-node src/index.ts

✓ Backend listening on port 4000
```

✅ Bu mesajı görmelisiniz!

---

## ✅ ADIM 11: Frontend Test

**Settings Sayfası - Bağlı Değil**:
```
┌─────────────────────────────────────────┐
│ 📅 Google Calendar Entegrasyonu         │
│    Siparişleriniz otomatik olarak       │
│    Google Calendar'a senkronize edilir  │
│                                          │
│                    ❌ Bağlı Değil       │
├─────────────────────────────────────────┤
│                                          │
│  [Google Calendar'a Bağlan]             │
│                                          │
└─────────────────────────────────────────┘
```

**Bağlan Butonu Tıklama → OAuth Popup**:
```
┌─────────────────────────────────────┐
│ Sign in - Google Accounts     [X]   │
├─────────────────────────────────────┤
│                                     │
│  🔐 Sign in to continue to          │
│     Canary Camera Rental System     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ your-email@gmail.com          │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Continue]                         │
│                                     │
└─────────────────────────────────────┘
```

**İzin Ekranı**:
```
┌─────────────────────────────────────┐
│ Canary Camera Rental System   [X]   │
│ wants to access your Google Account │
├─────────────────────────────────────┤
│                                     │
│ This will allow Canary Camera       │
│ Rental System to:                   │
│                                     │
│ ✓ See, edit, share, and delete all  │
│   the calendars you can access      │
│   using Google Calendar             │
│                                     │
│ ✓ See your primary Google Account   │
│   email address                     │
│                                     │
│       [Cancel]  [Allow]             │
│                                     │
└─────────────────────────────────────┘
```

**Başarı - Settings Sayfası**:
```
┌─────────────────────────────────────────┐
│ 📅 Google Calendar Entegrasyonu         │
│    Siparişleriniz otomatik olarak       │
│    Google Calendar'a senkronize edilir  │
│                                          │
│                    ✅ Bağlı             │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Aktif Bağlantı                    │ │
│ │                                     │ │
│ │ Yeni siparişleriniz otomatik        │ │
│ │ olarak Google Calendar'a ekleniyor. │ │
│ │ Müşterilerinize email ile takvim    │ │
│ │ daveti gönderiliyor.                │ │
│ └─────────────────────────────────────┘ │
│                                          │
│  [Bağlantıyı Kes]                       │
│                                          │
│ Özellikler:                              │
│ ✓ Yeni sipariş → Otomatik event        │
│ ✓ Sipariş güncelleme → Event güncelle  │
│ ✓ Sipariş iptali → Event silme          │
│ ✓ Email bildirimleri                    │
│ ✓ Renk kodlu event'ler                  │
└─────────────────────────────────────────┘
```

---

## 🎉 TAMAMLANDI!

Artık sistemde yeni sipariş oluşturduğunuzda:

1. ✅ Backend otomatik Google Calendar event oluşturur
2. ✅ Müşteriye email daveti gider
3. ✅ Event'i Google Calendar'da görebilirsiniz
4. ✅ Sipariş güncellendiğinde event güncellenir
5. ✅ Sipariş iptal edildiğinde event silinir

---

**Test Etmek İçin**:

1. Siparişler sayfasına git
2. "Yeni Sipariş" oluştur
3. Müşteri email'i gir
4. Google Calendar'ı aç (calendar.google.com)
5. Event'i görmelisiniz! 📅

---

**Hazırladı**: Canary Team  
**Tarih**: 10 Ekim 2025
