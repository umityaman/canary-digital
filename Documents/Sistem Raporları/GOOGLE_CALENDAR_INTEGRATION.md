# Google Calendar Entegrasyonu - Araştırma ve İmplementasyon Planı

**Proje**: Canary Kamera Kiralama Sistemi  
**Modül**: Takvim ve Rezervasyon Yönetimi  
**Tarih**: 10 Ekim 2025  
**Durum**: Araştırma Tamamlandı

---

## 📋 İÇİNDEKİLER

1. [Genel Bakış](#genel-bakış)
2. [Kullanım Senaryoları](#kullanım-senaryoları)
3. [Teknik Analiz](#teknik-analiz)
4. [Google Calendar API](#google-calendar-api)
5. [Mimari Tasarım](#mimari-tasarım)
6. [Implementasyon Planı](#implementasyon-planı)
7. [Maliyet Analizi](#maliyet-analizi)
8. [Alternatif Çözümler](#alternatif-çözümler)
9. [Risk Analizi](#risk-analizi)
10. [Zaman Çizelgesi](#zaman-çizelgesi)

---

## 🎯 GENEL BAKIŞ

### Hedef
Canary sistemindeki sipariş ve rezervasyonları Google Calendar ile senkronize ederek:
- Müşterilere otomatik takvim davetleri göndermek
- Personelin günlük programını görüntülemek
- Ekipman müsaitliğini takvim üzerinden takip etmek
- İki yönlü senkronizasyon sağlamak

### Temel Özellikler
✅ **Event Oluşturma**: Yeni sipariş → Google Calendar event  
✅ **Event Güncelleme**: Sipariş değişikliği → Calendar update  
✅ **Event Silme**: Sipariş iptali → Calendar delete  
✅ **Calendar Görüntüleme**: Frontend'de embedded calendar  
✅ **Email Bildirimleri**: Otomatik davetiye gönderimi  
✅ **Çakışma Kontrolü**: Ekipman müsaitlik kontrolü  
✅ **Multiple Calendar**: Farklı ekipman kategorileri için ayrı takvimler

---

## 💼 KULLANIM SENARYOLARI

### 1. Sipariş Oluşturma Akışı
```
Müşteri sipariş verir
  ↓
Canary sistemi Google Calendar'a event oluşturur
  ↓
Müşteriye otomatik davetiye gönderilir
  ↓
Müşteri Gmail/Calendar'ından görür ve kabul eder
  ↓
Personel takviminden tüm rezervasyonları görebilir
```

### 2. Çakışma Kontrolü
```
Yeni sipariş talebi gelir
  ↓
Sistem seçili tarihlerde Google Calendar'ı kontrol eder
  ↓
Eğer aynı ekipman için rezervasyon varsa → UYARI
  ↓
Müsait ekipmanları önerir
```

### 3. İki Yönlü Senkronizasyon
```
Google Calendar'da manuel değişiklik
  ↓
Webhook ile Canary'ye bildirim gelir
  ↓
Canary database güncellenir
  ↓
Frontend'de yeni durum gösterilir
```

### 4. Personel Programı
```
Personel login olur
  ↓
Günlük/haftalık takvim görür
  ↓
Hangi ekipmanlar nerede → harita
  ↓
Teslim/iade randevuları
```

---

## 🔧 TEKNİK ANALİZ

### Google Calendar API v3

#### **Temel Endpoint'ler**

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/calendars` | GET | Takvim listesi |
| `/calendars` | POST | Yeni takvim oluştur |
| `/calendars/{calendarId}/events` | GET | Event listesi |
| `/calendars/{calendarId}/events` | POST | Event oluştur |
| `/calendars/{calendarId}/events/{eventId}` | GET | Event detayı |
| `/calendars/{calendarId}/events/{eventId}` | PUT | Event güncelle |
| `/calendars/{calendarId}/events/{eventId}` | DELETE | Event sil |
| `/freeBusy` | POST | Müsaitlik kontrolü |

#### **Authentication: OAuth 2.0**

**Flow Tipi**: Server-side (Backend)

```javascript
// 1. Authorization URL oluştur
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]
});

// 2. Kullanıcı izin verir, callback URL'e code gelir
// callback: /api/auth/google/callback?code=xxx

// 3. Code ile token al
const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);

// 4. Token'ı database'e kaydet
await prisma.user.update({
  where: { id: userId },
  data: {
    googleAccessToken: tokens.access_token,
    googleRefreshToken: tokens.refresh_token,
    googleTokenExpiry: new Date(tokens.expiry_date)
  }
});
```

#### **Gerekli Scope'lar**
```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/calendar.readonly (opsiyonel)
```

#### **Rate Limits**
- **Queries per day**: 1,000,000
- **Queries per user per second**: 100
- **Queries per second**: 500

Canary için bu limitler **fazlasıyla yeterli** (ortalama 100-200 request/day bekleniyor).

---

## 📐 MİMARİ TASARIM

### Database Schema Güncellemesi

```prisma
// prisma/schema.prisma

model User {
  id                    Int       @id @default(autoincrement())
  // ... existing fields
  
  // Google Calendar Integration
  googleAccessToken     String?   @db.Text
  googleRefreshToken    String?   @db.Text
  googleTokenExpiry     DateTime?
  googleCalendarId      String?   // Primary calendar ID
  googleCalendarEnabled Boolean   @default(false)
}

model Order {
  id                  Int       @id @default(autoincrement())
  // ... existing fields
  
  // Google Calendar Integration
  googleEventId       String?   // Calendar event ID
  googleEventLink     String?   // Event link
  calendarSynced      Boolean   @default(false)
  calendarSyncedAt    DateTime?
}

model CalendarEvent {
  id              Int       @id @default(autoincrement())
  
  // Relations
  order           Order     @relation(fields: [orderId], references: [id])
  orderId         Int
  company         Company   @relation(fields: [companyId], references: [id])
  companyId       Int
  
  // Google Calendar Data
  googleEventId   String    @unique
  calendarId      String
  
  // Event Details
  title           String
  description     String?   @db.Text
  location        String?
  startDate       DateTime
  endDate         DateTime
  
  // Attendees
  attendees       String?   @db.Text // JSON: [{email, name, status}]
  
  // Metadata
  eventType       String    // "ORDER", "DELIVERY", "PICKUP", "INSPECTION"
  status          String    // "PENDING", "CONFIRMED", "CANCELLED"
  
  // Sync Info
  lastSyncedAt    DateTime  @default(now())
  syncStatus      String    @default("SYNCED") // "SYNCED", "PENDING", "ERROR"
  syncError       String?   @db.Text
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### Backend Architecture

```
backend/
├── src/
│   ├── services/
│   │   ├── googleCalendar.ts        # Google Calendar API wrapper
│   │   ├── calendarSync.ts          # Sync logic
│   │   └── oauth.ts                 # OAuth 2.0 helper
│   ├── routes/
│   │   ├── calendar.ts              # Calendar CRUD endpoints
│   │   └── googleAuth.ts            # OAuth callback endpoint
│   ├── jobs/
│   │   └── calendarSync.ts          # Background sync job
│   └── webhooks/
│       └── googleCalendar.ts        # Google Calendar webhook handler
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── services/
│   │   └── calendarApi.ts           # Calendar API client
│   ├── stores/
│   │   └── calendarStore.ts         # Zustand store
│   ├── components/
│   │   └── calendar/
│   │       ├── CalendarView.tsx     # Full calendar component
│   │       ├── EventCard.tsx        # Single event card
│   │       ├── EventModal.tsx       # Event detail modal
│   │       └── GoogleAuthButton.tsx # Connect Google account
│   └── pages/
│       └── Calendar.tsx             # Main calendar page
```

---

## 🛠️ IMPLEMENTASYON PLANI

### FAZA 1: Google OAuth Setup (1-2 gün)

#### Backend Tasks
- [ ] Google Cloud Console'da proje oluştur
- [ ] OAuth 2.0 credentials oluştur (Web application)
- [ ] Authorized redirect URIs ekle
- [ ] `googleapis` npm paketi yükle
- [ ] OAuth service oluştur (`src/services/oauth.ts`)
- [ ] Auth routes oluştur (`/api/auth/google`, `/api/auth/google/callback`)
- [ ] Token storage (database)
- [ ] Token refresh mechanism

#### Frontend Tasks
- [ ] "Google Calendar'a Bağlan" butonu ekle
- [ ] OAuth popup/redirect flow
- [ ] Token storage (zustand/localStorage)
- [ ] Connection status indicator

**Örnek Code:**

```typescript
// backend/src/services/oauth.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    prompt: 'consent'
  });
};

export const getTokenFromCode = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};
```

### FAZA 2: Calendar API Integration (2-3 gün)

#### Backend Service Layer
- [ ] `GoogleCalendarService` class oluştur
- [ ] Event CRUD operations
  - `createEvent(orderData)`
  - `updateEvent(eventId, orderData)`
  - `deleteEvent(eventId)`
  - `getEvent(eventId)`
  - `listEvents(dateRange)`
- [ ] FreeBusy check (`checkAvailability()`)
- [ ] Error handling ve retry logic

**Örnek Code:**

```typescript
// backend/src/services/googleCalendar.ts
export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  
  constructor(accessToken: string, refreshToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }
  
  async createEvent(order: Order) {
    const event = {
      summary: `${order.equipment.name} - ${order.customer.name}`,
      description: `Sipariş #${order.id}\nEkipman: ${order.equipment.name}\nMüşteri: ${order.customer.name}`,
      location: order.deliveryAddress || '',
      start: {
        dateTime: order.startDate.toISOString(),
        timeZone: 'Europe/Istanbul'
      },
      end: {
        dateTime: order.endDate.toISOString(),
        timeZone: 'Europe/Istanbul'
      },
      attendees: [
        { email: order.customer.email }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 gün önce
          { method: 'popup', minutes: 60 }       // 1 saat önce
        ]
      },
      colorId: '2' // Yeşil (kiralama)
    };
    
    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all' // Email notification gönder
    });
    
    return response.data;
  }
  
  async checkAvailability(equipmentId: number, startDate: Date, endDate: Date) {
    // Aynı ekipman için çakışan rezervasyon var mı kontrol et
    const events = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    // equipmentId ile filter et
    const conflicts = events.data.items?.filter(event => 
      event.description?.includes(`Equipment ID: ${equipmentId}`)
    );
    
    return conflicts && conflicts.length === 0;
  }
}
```

### FAZA 3: Order-Calendar Sync (2-3 gün)

#### Sipariş Lifecycle Hooks
- [ ] Order create → Calendar event create
- [ ] Order update → Calendar event update
- [ ] Order cancel → Calendar event delete
- [ ] Order status change → Calendar event color change

**Örnek Integration:**

```typescript
// backend/src/routes/orders.ts
router.post('/', authenticateToken, async (req, res) => {
  // ... existing order creation logic
  
  const order = await prisma.order.create({ data: orderData });
  
  // Google Calendar sync
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        googleAccessToken: true, 
        googleRefreshToken: true,
        googleCalendarEnabled: true 
      }
    });
    
    if (user?.googleCalendarEnabled && user.googleAccessToken) {
      const calendarService = new GoogleCalendarService(
        user.googleAccessToken,
        user.googleRefreshToken!
      );
      
      const event = await calendarService.createEvent(order);
      
      // Update order with event ID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          googleEventId: event.id,
          googleEventLink: event.htmlLink,
          calendarSynced: true,
          calendarSyncedAt: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Calendar sync failed:', error);
    // Log error but don't fail the order
  }
  
  res.json(order);
});
```

### FAZA 4: Frontend Calendar View (3-4 gün)

#### Options

**Option 1: Google Calendar Embed (Kolay)**
```tsx
<iframe 
  src={`https://calendar.google.com/calendar/embed?src=${calendarId}`}
  style={{ border: 0, width: '100%', height: 600 }}
  frameBorder="0"
  scrolling="no"
/>
```

**Option 2: FullCalendar.js (Profesyonel)**
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

```tsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

<FullCalendar
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  events={events}
  eventClick={handleEventClick}
  dateClick={handleDateClick}
  headerToolbar={{
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  }}
  locale="tr"
/>
```

**Tavsiye: Option 2 (FullCalendar)** - Daha fazla kontrol ve özelleştirme

### FAZA 5: Webhook & Two-Way Sync (2-3 gün) - OPSIYONEL

#### Google Calendar Push Notifications
```typescript
// backend/src/webhooks/googleCalendar.ts
router.post('/webhook/google-calendar', async (req, res) => {
  const { eventId, calendarId, changeType } = req.body;
  
  // changeType: "created", "updated", "deleted"
  
  switch (changeType) {
    case 'updated':
      // Fetch event from Google
      // Update order in database
      break;
    case 'deleted':
      // Mark order as cancelled
      break;
  }
  
  res.sendStatus(200);
});
```

**Webhook Setup:**
```typescript
await calendar.events.watch({
  calendarId: 'primary',
  requestBody: {
    id: uuid(),
    type: 'web_hook',
    address: 'https://your-domain.com/webhook/google-calendar'
  }
});
```

### FAZA 6: Advanced Features (3-4 gün) - OPSIYONEL

- [ ] **Multiple Calendars**: Her ekipman kategorisi için ayrı takvim
- [ ] **Color Coding**: Sipariş durumuna göre renkler
- [ ] **Recurring Events**: Tekrarlayan kiralama (haftalık)
- [ ] **Calendar Sharing**: Takvimi müşteri ile paylaş
- [ ] **SMS Reminders**: Twilio entegrasyonu
- [ ] **Equipment Timeline**: Ekipman bazlı Gantt chart

---

## 💰 MALİYET ANALİZİ

### Google Calendar API

✅ **TAMAMEN ÜCRETSİZ**

- Unlimited API calls (quota limitleri içinde)
- Storage: Sınırsız
- Users: Sınırsız
- No credit card required

**Tek maliyet**: Google Workspace hesabı (opsiyonel)
- Personal Gmail: ₺0 (yeterli)
- Google Workspace Business: $12/user/month (₺350/ay)

### Geliştirme Maliyeti

| Faz | Süre | Açıklama |
|-----|------|----------|
| Faz 1 | 2 gün | OAuth setup |
| Faz 2 | 3 gün | API integration |
| Faz 3 | 3 gün | Order sync |
| Faz 4 | 4 gün | Frontend calendar |
| Faz 5 | 3 gün | Webhooks (opsiyonel) |
| Faz 6 | 4 gün | Advanced features (opsiyonel) |
| **Toplam** | **12-19 gün** | Full implementation |

**Minimum Viable Product (MVP)**: 8-10 gün (Faz 1-4)

### 3rd Party Library Maliyetleri

| Library | Lisans | Maliyet |
|---------|--------|---------|
| googleapis | Apache 2.0 | ₺0 |
| @fullcalendar/react | MIT | ₺0 |
| react-big-calendar | MIT | ₺0 |

**Toplam**: ₺0 ✅

---

## 🔄 ALTERNATİF ÇÖZÜMLER

### 1. Microsoft Outlook Calendar
**Avantajlar:**
- Office 365 entegrasyonu
- Kurumsal müşteriler için daha uygun

**Dezavantajlar:**
- Daha karmaşık API
- OAuth setup daha zor
- Türkiye'de Google Calendar daha yaygın

### 2. Apple Calendar (CalDAV)
**Avantajlar:**
- Apple kullanıcıları için native

**Dezavantajlar:**
- Kısıtlı API
- Web interface zayıf
- Android desteği yok

### 3. Kendi Calendar Sistemimiz
**Avantajlar:**
- Tam kontrol
- Özelleştirilebilir

**Dezavantajlar:**
- Geliştirme süresi uzun (3-4 hafta)
- Müşteri email entegrasyonu yok
- Mobile app gerekli

**KARAR: Google Calendar** ✅
- En yaygın kullanılan
- Ücretsiz
- Güçlü API
- Email entegrasyonu hazır

---

## ⚠️ RİSK ANALİZİ

### Yüksek Riskler

**1. OAuth Token Expiry**
- **Risk**: Access token 1 saat sonra expire olur
- **Çözüm**: Refresh token kullan, otomatik renewal

**2. API Rate Limits**
- **Risk**: Çok fazla request → quota aşımı
- **Çözüm**: Caching, batch operations, retry mechanism

**3. Sync Conflicts**
- **Risk**: Google Calendar'da manuel değişiklik → database uyumsuzluğu
- **Çözüm**: Webhook kullan, conflict resolution stratejisi

### Orta Riskler

**4. User Privacy**
- **Risk**: Kullanıcı Google hesabına erişim izni vermek istemeyebilir
- **Çözüm**: Opsiyonel yap, manuel takvim seçeneği sun

**5. Timezone Issues**
- **Risk**: Farklı timezone'larda hatalı tarih gösterimi
- **Çözüm**: Tüm tarihleri UTC'de sakla, client-side conversion

**6. Network Failures**
- **Risk**: Google API'ye ulaşılamama
- **Çözüm**: Retry logic, fallback mechanism, queue system

### Düşük Riskler

**7. Google API Değişikleri**
- **Risk**: API breaking changes
- **Çözüm**: googleapis library otomatik update, versioning

---

## 📅 ZAMAN ÇİZELGESİ

### Sprint 1 (Hafta 1-2) - MVP

**Gün 1-2: OAuth Setup**
- Google Cloud Console setup
- Backend OAuth routes
- Frontend connect button
- Token storage

**Gün 3-5: API Integration**
- GoogleCalendarService class
- Create/Update/Delete events
- FreeBusy check
- Error handling

**Gün 6-8: Order Sync**
- Order lifecycle hooks
- Automatic event creation
- Database fields
- Testing

**Gün 9-10: Basic Frontend**
- Google Calendar embed
- Event list display
- Connection status

**Deliverable**: Çalışan bir takvim entegrasyonu

### Sprint 2 (Hafta 3) - Enhanced

**Gün 11-13: Professional Calendar**
- FullCalendar.js integration
- Custom event rendering
- Drag & drop
- Filter & search

**Gün 14-15: Advanced Features**
- Color coding
- Multiple calendars
- Batch sync
- Performance optimization

**Deliverable**: Production-ready takvim sistemi

### Sprint 3 (Hafta 4) - Optional

**Gün 16-18: Two-Way Sync**
- Webhook setup
- Push notifications
- Conflict resolution

**Gün 19-20: Extra Features**
- SMS reminders
- Calendar sharing
- Mobile optimization
- Analytics

**Deliverable**: Enterprise-level özellikler

---

## 📝 SONUÇ VE ÖNERİLER

### Önerilen Yaklaşım

1. **MVP ile başla** (8-10 gün)
   - OAuth + Basic API integration
   - Order → Calendar sync (one-way)
   - Embedded calendar view

2. **Kullanıcı feedback topla** (1 hafta)
   - Hangi özellikler kullanılıyor?
   - Neye ihtiyaç var?

3. **Advanced features ekle** (5-7 gün)
   - FullCalendar.js
   - Two-way sync
   - Multiple calendars

### Kritik Başarı Faktörleri

✅ **Basit OAuth Flow**: Kullanıcı kolayca bağlanabilmeli  
✅ **Güvenilir Sync**: %99.9 uptime  
✅ **Hızlı Performance**: <2s event oluşturma  
✅ **Güzel UI**: FullCalendar ile modern görünüm  
✅ **Mobile Support**: Responsive tasarım  

### Metrikler

| Metrik | Hedef |
|--------|-------|
| OAuth başarı oranı | >95% |
| Sync başarı oranı | >99% |
| API response time | <1s |
| Event oluşturma süresi | <2s |
| Kullanıcı memnuniyeti | >4/5 |

### İlk Adım

**Hemen şimdi başlayalım!** 🚀

1. Google Cloud Console'da proje oluştur
2. OAuth credentials al
3. `googleapis` paketi yükle
4. Backend OAuth flow implementasyonu

---

**Hazırladı**: AI Assistant  
**Tarih**: 10 Ekim 2025  
**Versiyon**: 1.0  
**Durum**: Onay Bekliyor ✅

