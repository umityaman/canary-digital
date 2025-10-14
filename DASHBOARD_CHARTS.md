# 📊 Advanced Dashboard Charts - Eksiksiz Dökümantas yon

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Özellikler](#özellikler)
3. [Kurulum](#kurulum)
4. [Bileşenler](#bileşenler)
5. [API Entegrasyonu](#api-entegrasyonu)
6. [Export İşlemleri](#export-işlemleri)
7. [Kullanım Kılavuzu](#kullanım-kılavuzu)
8. [Teknik Detaylar](#teknik-detaylar)

---

## 🎯 Genel Bakış

Advanced Dashboard Charts, ekipman kiralama sisteminiz için kapsamlı analiz ve raporlama yetenekleri sunan gelişmiş bir dashboard bileşenidir. Recharts kütüphanesi kullanılarak oluşturulmuş, responsive ve kullanıcı dostu grafik bileşenleri içerir.

### 🎁 Ana Özellikler
- **4 Farklı Chart Türü**: Revenue, Utilization, Status, Top Equipment
- **Tarih Aralığı Seçimi**: Önceden tanımlı ve özel tarih aralıkları
- **Export İşlemleri**: Excel, PDF, ve Yazdırma desteği
- **Real-time Data**: Backend API ile gerçek zamanlı veri çekme
- **Responsive Design**: Tüm ekran boyutlarında optimize edilmiş görünüm
- **Mock Data Fallback**: API hataları durumunda mock veri desteği

---

## 🚀 Kurulum

### Frontend Dependencies

```bash
cd frontend
npm install recharts date-fns xlsx jspdf html2canvas
```

**Kurulu Paketler:**
- `recharts` (v2.x): Grafik bileşenleri
- `date-fns` (v3.x): Tarih manipülasyonu
- `xlsx` (v0.18.x): Excel export
- `jspdf` (v2.x): PDF oluşturma
- `html2canvas` (v1.x): HTML to image conversion

### Backend Dependencies

Yeni bağımlılık yok - mevcut Prisma ve Express ile çalışır.

---

## 📊 Bileşenler

### 1. DateRangeSelector

Tarih aralığı seçimi için kullanıcı dostu bir bileşen.

**Dosya:** `frontend/src/components/charts/DateRangeSelector.tsx`

**Özellikler:**
- Önceden tanımlı aralıklar: Son 7 Gün, Son 30 Gün, Son 90 Gün, Bu Yıl
- Özel tarih aralığı seçimi
- date-fns ile tarih formatlaması

**Kullanım:**
```tsx
import DateRangeSelector from '../components/charts/DateRangeSelector';

const [dateRange, setDateRange] = useState({
  label: 'Son 30 Gün',
  startDate: subDays(new Date(), 30),
  endDate: new Date(),
});

<DateRangeSelector
  selectedRange={dateRange}
  onRangeChange={setDateRange}
/>
```

---

### 2. RevenueChart

Günlük gelir ve sipariş trendini gösteren Area Chart.

**Dosya:** `frontend/src/components/charts/RevenueChart.tsx`

**Data Format:**
```typescript
interface RevenueData {
  date: string;          // ISO format: "2025-10-14"
  revenue: number;       // Gelir (TRY)
  orders: number;        // Sipariş sayısı
}
```

**Görselleştirme:**
- Area chart with gradient fill
- Toplam gelir, ortalama sipariş değeri, en yüksek günlük göstergeleri
- Custom tooltip with formatted currency
- Responsive height (300px)

**Kullanım:**
```tsx
import RevenueChart from '../components/charts/RevenueChart';

<RevenueChart 
  data={revenueData} 
  isLoading={chartsLoading}
/>
```

---

### 3. UtilizationChart

Ekipman kullanım oranını gösteren Line Chart.

**Dosya:** `frontend/src/components/charts/UtilizationChart.tsx`

**Data Format:**
```typescript
interface UtilizationData {
  date: string;
  utilizationRate: number;    // Percentage (0-100)
  activeRentals: number;      // Aktif kiralama sayısı
  totalEquipment: number;     // Toplam ekipman
}
```

**Görselleştirme:**
- Line chart with 0-100% domain
- Ortalama, en yüksek, toplam ekipman göstergeleri
- Dinamik renk kodlaması (yeşil: <60%, sarı: 60-80%, kırmızı: >80%)
- Performans ipuçları

**Özellikler:**
- Kullanım oranına göre renkli background
- İş zekası tavsiyeleri (yüksek kullanım = yeni ekipman önerisi)

---

### 4. StatusChart

Sipariş durumu dağılımını gösteren Pie Chart (Donut).

**Dosya:** `frontend/src/components/charts/StatusChart.tsx`

**Data Format:**
```typescript
interface StatusData {
  status: string;    // PENDING, APPROVED, ACTIVE, COMPLETED, CANCELLED
  count: number;
  color: string;     // Hex color
}
```

**Görselleştirme:**
- Donut chart (innerRadius: 60, outerRadius: 100)
- Yüzdelik label'lar
- Detaylı status legend
- Toplam sipariş ve aktif durum sayacı

**Status Colors:**
- PENDING: #f59e0b (amber)
- APPROVED: #10b981 (green)
- ACTIVE: #3b82f6 (blue)
- COMPLETED: #6366f1 (indigo)
- CANCELLED: #ef4444 (red)

---

### 5. TopEquipmentChart

En çok kiralanan ekipmanları gösteren Horizontal Bar Chart.

**Dosya:** `frontend/src/components/charts/TopEquipmentChart.tsx`

**Data Format:**
```typescript
interface EquipmentData {
  name: string;        // Ekipman adı
  rentCount: number;   // Kiralama sayısı
  revenue: number;     // Toplam gelir (TRY)
}
```

**Görselleştirme:**
- Horizontal bar chart (en popüler üstte)
- 10 renkli bar (COLORS array)
- Top performer badge (🥇)
- Toplam kiralama ve gelir göstergeleri
- Strateji önerileri

---

### 6. ExportButtons

Export işlemleri için 3 buton: Excel, PDF, Yazdır.

**Dosya:** `frontend/src/components/charts/ExportButtons.tsx`

**Özellikler:**
- Excel Export: `exportToExcel(data, filename)` - XLSX format
- PDF Export: `exportToPDF(elementId, filename)` - html2canvas + jsPDF
- Print: `printChart(elementId)` - Tarayıcı print dialog

**Kullanım:**
```tsx
import ExportButtons from '../components/charts/ExportButtons';

<ExportButtons
  data={revenueData}
  filename="dashboard-raporu"
  chartElementId="dashboard-charts-container"
/>
```

---

## 🔌 API Entegrasyonu

### Backend Routes

**Dosya:** `backend/src/routes/analytics.ts`

#### 1. GET /api/analytics/revenue

Tarih aralığına göre günlük gelir ve sipariş sayısı.

**Query Parameters:**
- `startDate`: ISO date string (required)
- `endDate`: ISO date string (required)

**Response:**
```json
[
  {
    "date": "2025-10-14",
    "revenue": 12500,
    "orders": 8
  },
  ...
]
```

**Logic:**
- Prisma ile orders tablosundan veri çekme
- Status filter: APPROVED, ACTIVE, COMPLETED
- createdAt bazlı gruplama
- Date key ile Map oluşturma
- Sıralama (date ascending)

---

#### 2. GET /api/analytics/utilization

Ekipman kullanım oranı (günlük).

**Query Parameters:**
- `startDate`: ISO date string (required)
- `endDate`: ISO date string (required)

**Response:**
```json
[
  {
    "date": "2025-10-14",
    "utilizationRate": 68.5,
    "activeRentals": 34,
    "totalEquipment": 50
  },
  ...
]
```

**Logic:**
- Toplam ekipman sayısı (companyId bazlı)
- Tarih aralığında aktif orders (APPROVED, ACTIVE)
- Günlük loop ile her gün için hesaplama
- Active rentals = order.startDate <= currentDate <= order.endDate
- utilizationRate = (activeRentals / totalEquipment) * 100

---

#### 3. GET /api/analytics/status

Sipariş durumu dağılımı (tüm zamanlar).

**Response:**
```json
[
  {
    "status": "PENDING",
    "count": 12,
    "color": "#f59e0b"
  },
  ...
]
```

**Logic:**
- Prisma groupBy with status
- _count aggregation
- Status colors mapping
- companyId filter

---

#### 4. GET /api/analytics/top-equipment

En popüler ekipmanlar (kiralama sayısına göre).

**Query Parameters:**
- `limit`: number (default: 10)

**Response:**
```json
[
  {
    "name": "Hilti TE 3000-AVR",
    "rentCount": 45,
    "revenue": 135000
  },
  ...
]
```

**Logic:**
- OrderItem tablosundan equipment join
- Status filter: APPROVED, ACTIVE, COMPLETED
- Equipment name bazlı gruplama (Map)
- rentCount = SUM(quantity)
- revenue = SUM(price * quantity)
- Sıralama (rentCount descending)
- Limit uygulama

---

### Frontend API Service

**Dosya:** `frontend/src/services/api.ts`

```typescript
export const analyticsAPI = {
  getRevenue: (startDate: string, endDate: string) =>
    api.get('/analytics/revenue', { params: { startDate, endDate } }),
  
  getUtilization: (startDate: string, endDate: string) =>
    api.get('/analytics/utilization', { params: { startDate, endDate } }),
  
  getStatus: () => api.get('/analytics/status'),
  
  getTopEquipment: (limit: number = 10) =>
    api.get('/analytics/top-equipment', { params: { limit } }),
}
```

---

## 📤 Export İşlemleri

### 1. Excel Export

**Dosya:** `frontend/src/components/charts/exportUtils.ts`

**Kütüphane:** `xlsx` (SheetJS)

**Fonksiyon:**
```typescript
exportToExcel(data: ExportData[], filename: string)
```

**İşlem Adımları:**
1. JSON data'yı worksheet'e dönüştür (`XLSX.utils.json_to_sheet`)
2. Workbook oluştur (`XLSX.utils.book_new`)
3. Worksheet'i workbook'a ekle
4. Timestamp ekle (filename_2025-10-14_12-30-45.xlsx)
5. Dosyayı indir (`XLSX.writeFile`)

**Örnek Kullanım:**
```typescript
const result = exportToExcel(revenueData, 'gelir-raporu');
if (result.success) {
  alert(`✅ İndirildi: ${result.filename}`);
}
```

---

### 2. PDF Export

**Dosya:** `frontend/src/components/charts/exportUtils.ts`

**Kütüphaneler:** `jspdf` + `html2canvas`

**Fonksiyon:**
```typescript
exportToPDF(elementId: string, filename: string)
```

**İşlem Adımları:**
1. Element'i bul (`document.getElementById`)
2. HTML'i canvas'a dönüştür (`html2canvas` - scale: 2, useCORS: true)
3. Canvas'ı image data'ya dönüştür (PNG)
4. jsPDF instance oluştur (A4, portrait)
5. Image'ı PDF'e ekle (otomatik sayfalama)
6. Timestamp ekle
7. Dosyayı indir (`pdf.save`)

**Multi-page Support:**
- A4 boyutundan büyük içerik için otomatik sayfa ekleme
- heightLeft hesaplaması ile döngü

---

### 3. Print

**Dosya:** `frontend/src/components/charts/exportUtils.ts`

**Fonksiyon:**
```typescript
printChart(elementId: string)
```

**İşlem Adımları:**
1. Element'i bul
2. Yeni pencere aç (`window.open`)
3. HTML structure oluştur (minimal CSS)
4. Element innerHTML'ini ekle
5. 250ms delay ile print dialog aç
6. Print sonrası pencereyi kapat

**Print CSS:**
```css
body { 
  margin: 20px; 
  font-family: Arial, sans-serif; 
}
@media print {
  body { margin: 0; }
}
```

---

## 📖 Kullanım Kılavuzu

### Dashboard'da Chart Görüntüleme

1. **Login**: `/login` sayfasından giriş yapın
2. **Home**: Ana sayfaya yönlendirileceksiniz
3. **Scroll Down**: "📊 Gelişmiş Dashboard" bölümüne inin
4. **Date Range**: Tarih aralığını seçin (varsayılan: Son 30 Gün)
5. **View Charts**: 4 farklı chart otomatik yüklenir

---

### Tarih Aralığı Değiştirme

1. **Preset Buttons**: "Son 7 Gün", "Son 30 Gün", "Son 90 Gün", "Bu Yıl"
2. **Custom Date**:
   - "Özel Tarih" butonuna tıklayın
   - Başlangıç tarihi seçin
   - Bitiş tarihi seçin
   - "Uygula" butonuna tıklayın
3. **Auto Refresh**: Tarih değiştiğinde chartlar otomatik güncellenir

---

### Export İşlemleri

#### Excel Export
1. "📊 Excel" butonuna tıklayın
2. `dashboard-raporu_2025-10-14_12-30-45.xlsx` dosyası indirilecek
3. Excel/LibreOffice ile açın

**Kullanım Alanları:**
- Finansal analizler
- Pivot table oluşturma
- Formül ekleme
- Grafik oluşturma

---

#### PDF Export
1. "📄 PDF" butonuna tıklayın
2. `dashboard-raporu_2025-10-14_12-30-45.pdf` dosyası indirilecek
3. PDF görüntüleyici ile açın

**Kullanım Alanları:**
- Müşteri raporları
- Yönetim sunumları
- Arşivleme
- Email ekleri

---

#### Yazdır
1. "🖨️ Yazdır" butonuna tıklayın
2. Tarayıcı print dialog açılacak
3. Yazıcı seçin ve ayarları yapılandırın
4. Yazdır

**Kullanım Alanları:**
- Fiziksel raporlar
- Meeting handouts
- Backup copies

---

### Chart Yenileme

1. **Manual Refresh**: Sağ üstteki "🔄 Yenile" butonuna tıklayın
2. **Auto Refresh**: Tarih aralığı değiştiğinde otomatik
3. **Loading State**: Yüklenirken skeleton loader görünür

---

## 🔧 Teknik Detaylar

### State Management

**Home.tsx State:**
```typescript
const [revenueData, setRevenueData] = useState<any[]>([]);
const [utilizationData, setUtilizationData] = useState<any[]>([]);
const [statusData, setStatusData] = useState<any[]>([]);
const [topEquipmentData, setTopEquipmentData] = useState<any[]>([]);
const [chartsLoading, setChartsLoading] = useState(true);
const [dateRange, setDateRange] = useState({
  label: 'Son 30 Gün',
  startDate: subDays(new Date(), 30),
  endDate: new Date(),
});
```

---

### Data Flow

```
1. User selects date range
   ↓
2. setDateRange(newRange) triggers useEffect
   ↓
3. fetchChartsData() called
   ↓
4. format(dateRange, 'yyyy-MM-dd')
   ↓
5. Promise.all([
     analyticsAPI.getRevenue(start, end),
     analyticsAPI.getUtilization(start, end),
     analyticsAPI.getStatus(),
     analyticsAPI.getTopEquipment(10),
   ])
   ↓
6. Update state: setRevenueData, setUtilizationData, etc.
   ↓
7. Charts re-render with new data
```

---

### Error Handling

**API Call Fallback:**
```typescript
try {
  // Try real API
  const [revenueRes, ...] = await Promise.all([...]);
  setRevenueData(revenueRes.data);
} catch (apiError) {
  console.warn('API call failed, using mock data:', apiError);
  // Fallback to mock data
  const mockData = generateMockRevenueData(...);
  setRevenueData(mockData);
}
```

**Mock Data Generators:**
- `generateMockRevenueData(start, end)`: Random revenue 5000-20000 TRY
- `generateMockUtilizationData(start, end)`: Random utilization 20-100%
- `generateMockStatusData()`: Fixed distribution
- `generateMockTopEquipmentData()`: Top 10 equipment with realistic names

---

### Performance Optimizations

1. **useEffect Dependencies**:
   - `[dateRange]` dependency ensures charts only refetch when date changes
   - Prevents unnecessary API calls

2. **Promise.all**:
   - Parallel API calls (4 endpoints simultaneously)
   - Reduces total loading time

3. **Lazy Loading**:
   - Charts only load when user scrolls to dashboard section
   - Initial page load is fast

4. **Memoization** (future improvement):
   - Can add `useMemo` for expensive calculations
   - Chart data transformation caching

---

### Responsive Design

**Breakpoints:**
- `lg:grid-cols-2`: Desktop - 2 columns
- `grid-cols-1`: Mobile - 1 column stacked

**Chart Sizes:**
- RevenueChart: 300px height
- UtilizationChart: 250px height
- StatusChart: 300px height
- TopEquipmentChart: 350px height (horizontal bars need more space)

**ResponsiveContainer:**
- Width: 100% (fluid)
- Height: Fixed (px) for consistency

---

### Security

**Backend Authentication:**
- All `/api/analytics/*` routes protected with `authenticateToken` middleware
- companyId filter ensures data isolation
- JWT token required in Authorization header

**Data Sanitization:**
- Date validation (startDate, endDate required)
- Numeric validation for limit parameter
- Prisma prevents SQL injection

---

### Testing

**Frontend Testing:**
```bash
# Component tests
npm run test -- DateRangeSelector.test.tsx
npm run test -- RevenueChart.test.tsx

# Integration tests
npm run test -- Home.test.tsx
```

**Backend Testing:**
```bash
# API endpoint tests
npm run test -- analytics.test.ts

# Manual testing with curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:4000/api/analytics/revenue?startDate=2025-10-01&endDate=2025-10-14"
```

---

## 🎨 Customization

### Colors

**Primary Palette (Tailwind):**
- Blue: `#3b82f6` (revenue, active)
- Green: `#10b981` (utilization, approved)
- Amber: `#f59e0b` (pending)
- Red: `#ef4444` (cancelled, high utilization)
- Purple: `#6366f1` (completed)

**Chart Colors Array:**
```typescript
const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];
```

---

### Text Labels

**Turkish Translations:**
- Status labels: `statusLabels` object
- Status icons: `statusIcons` object (emoji)
- Chart titles: Embedded in components
- Tooltip format: Custom `CustomTooltip` components

**Internationalization (future):**
- Extract all labels to `i18n/tr.json`
- Support English with `i18n/en.json`
- Use `useTranslation()` hook

---

### Chart Types

**Recharts Alternatives:**
- **AreaChart** → **LineChart**: Remove `<Area>`, add `<Line>`
- **BarChart** → **ComposedChart**: Mix Bar + Line in one chart
- **PieChart** → **RadialBarChart**: Circular progress style

**Example - Revenue as Line Chart:**
```tsx
import { LineChart, Line } from 'recharts';

<LineChart data={data}>
  <Line 
    type="monotone" 
    dataKey="revenue" 
    stroke="#3b82f6" 
    strokeWidth={3}
  />
</LineChart>
```

---

## 🐛 Troubleshooting

### Chart Not Loading

**Symptoms:** Loading spinner永远显示, chart never appears

**Possible Causes:**
1. API authentication error (401)
2. Network error
3. Invalid date format

**Solution:**
```bash
# Check browser console
F12 → Console → Look for errors

# Check network tab
F12 → Network → Filter: XHR → Check /analytics/* requests

# Check backend logs
cd backend
npm run dev
# Look for "Revenue analytics error" or similar
```

---

### Export Not Working

**Excel Export Issues:**
- **Error:** "Excel dosyası oluşturulamadı"
- **Cause:** XLSX library not installed or data format invalid
- **Solution:** `npm install xlsx` and ensure data is array of objects

**PDF Export Issues:**
- **Error:** "PDF dosyası oluşturulamadı"
- **Cause:** html2canvas failing (CORS, missing element)
- **Solution:** 
  - Check `chartElementId` matches actual element ID
  - Ensure element is visible (not display:none)
  - Check browser CORS policy

**Print Issues:**
- **Error:** Print window blocked
- **Cause:** Browser popup blocker
- **Solution:** Allow popups for your domain

---

### Date Range Issues

**Symptoms:** Charts show no data or wrong data

**Possible Causes:**
1. Start date after end date
2. Date range too large (performance)
3. No orders in selected range

**Solution:**
```typescript
// Add validation
if (startDate > endDate) {
  alert('Başlangıç tarihi bitiş tarihinden sonra olamaz');
  return;
}

// Limit range to 1 year
const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
if (daysDiff > 365) {
  alert('Maksimum 1 yıllık veri görüntülenebilir');
  return;
}
```

---

## 📊 Data Examples

### Sample Revenue Data
```json
[
  { "date": "2025-10-01", "revenue": 12500, "orders": 5 },
  { "date": "2025-10-02", "revenue": 18200, "orders": 8 },
  { "date": "2025-10-03", "revenue": 9500, "orders": 4 },
  { "date": "2025-10-04", "revenue": 15600, "orders": 7 },
  { "date": "2025-10-05", "revenue": 21300, "orders": 10 }
]
```

### Sample Utilization Data
```json
[
  { 
    "date": "2025-10-01", 
    "utilizationRate": 68.5, 
    "activeRentals": 34, 
    "totalEquipment": 50 
  },
  { 
    "date": "2025-10-02", 
    "utilizationRate": 72.0, 
    "activeRentals": 36, 
    "totalEquipment": 50 
  }
]
```

### Sample Status Data
```json
[
  { "status": "PENDING", "count": 12, "color": "#f59e0b" },
  { "status": "APPROVED", "count": 8, "color": "#10b981" },
  { "status": "ACTIVE", "count": 25, "color": "#3b82f6" },
  { "status": "COMPLETED", "count": 45, "color": "#6366f1" },
  { "status": "CANCELLED", "count": 5, "color": "#ef4444" }
]
```

### Sample Top Equipment Data
```json
[
  { "name": "Hilti TE 3000-AVR", "rentCount": 45, "revenue": 135000 },
  { "name": "Bosch GBH 5-40 DCE", "rentCount": 38, "revenue": 114000 },
  { "name": "Makita HR4013C", "rentCount": 32, "revenue": 96000 }
]
```

---

## 🚀 Future Enhancements

### Phase 1 (Short-term)
- [ ] Comparison mode (compare 2 date ranges)
- [ ] Chart download as PNG/SVG
- [ ] Email report scheduling
- [ ] Favorite date ranges (save presets)
- [ ] Chart annotations (add notes to specific dates)

### Phase 2 (Medium-term)
- [ ] Real-time updates (WebSocket integration)
- [ ] Custom chart builder (drag-and-drop metrics)
- [ ] Advanced filters (by customer, equipment type, location)
- [ ] Forecasting (ML predictions for next 30 days)
- [ ] Goal tracking (set revenue targets)

### Phase 3 (Long-term)
- [ ] Multi-company comparison (franchise view)
- [ ] Mobile app charts (React Native)
- [ ] Voice commands ("Show me last month's revenue")
- [ ] AI insights ("Revenue decreased 15% due to...")
- [ ] Automated alerts (email when utilization >90%)

---

## 📞 Destek

**Teknik Sorunlar:**
- GitHub Issues: [repository-link]
- Email: support@canary-rental.com

**Dokümantasyon:**
- API Docs: `/api-docs` (Swagger)
- Frontend README: `frontend/README.md`
- Backend README: `backend/README.md`

---

## ✅ Checklist

### İlk Kurulum
- [x] Recharts kurulumu
- [x] Date-fns kurulumu
- [x] XLSX kurulumu
- [x] jsPDF kurulumu
- [x] html2canvas kurulumu
- [x] 4 chart bileşeni oluşturuldu
- [x] DateRangeSelector oluşturuldu
- [x] ExportButtons oluşturuldu
- [x] Backend analytics routes oluşturuldu
- [x] Frontend API entegrasyonu
- [x] Home.tsx güncellendi
- [x] Mock data fallback eklendi
- [x] Dokümantasyon hazırlandı

### Test Edilecekler
- [ ] Login ve dashboard erişimi
- [ ] Tüm chartların görünmesi
- [ ] Tarih aralığı değişikliği
- [ ] Excel export
- [ ] PDF export
- [ ] Yazdırma
- [ ] Mobile responsive görünüm
- [ ] Backend API yanıtları
- [ ] Error handling (API down scenario)
- [ ] Mock data fallback

---

**Son Güncelleme:** 14 Ekim 2025  
**Versiyon:** 1.0.0  
**Yazar:** GitHub Copilot
