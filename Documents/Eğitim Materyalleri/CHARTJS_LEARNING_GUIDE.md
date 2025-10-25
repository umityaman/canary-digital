# 📊 Chart.js Öğrenme Rehberi

**Hazırlayan:** GitHub Copilot  
**Tarih:** 25 Ekim 2025  
**Süre:** 3-4 saat  
**Hedef:** Sprint 1 Analytics Dashboard için Chart.js ustası olmak

---

## 🎯 Öğrenme Hedefleri

### Temel Seviye (1-2 saat)
- ✅ Chart.js nedir, nasıl çalışır?
- ✅ React ile entegrasyon (react-chartjs-2)
- ✅ 4 temel chart tipi: Line, Bar, Pie, Doughnut
- ✅ Responsive design patterns

### İleri Seviye (1-2 saat)
- ✅ Custom tooltips ve legends
- ✅ Multiple datasets
- ✅ Dynamic data updates
- ✅ Performance optimization
- ✅ Chart.js plugins

---

## 📚 Kaynak Linkler

### Resmi Dökümanlar
1. **Chart.js Official Docs**: https://www.chartjs.org/docs/latest/
2. **react-chartjs-2 Docs**: https://react-chartjs-2.js.org/
3. **Chart.js Examples**: https://www.chartjs.org/docs/latest/samples/
4. **GitHub Repo**: https://github.com/chartjs/Chart.js

### Türkçe Kaynaklar
1. **Chart.js Türkçe Tutorial**: YouTube'da "Chart.js Türkçe" ara
2. **React Chart.js Örnek**: Medium makaleleri

### İnteraktif Öğrenme
1. **CodePen Examples**: https://codepen.io/tag/chartjs
2. **CodeSandbox**: react-chartjs-2 örnekleri

---

## 🚀 Hızlı Başlangıç

### 1. Installation

```bash
# Frontend klasöründe
cd frontend
npm install chart.js react-chartjs-2
```

### 2. Temel Kullanım

```tsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Chart.js'i kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function MyChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Revenue' }
    }
  };

  return <Line data={data} options={options} />;
}
```

---

## 📊 Chart Tipleri ve Kullanım Alanları

### 1. Line Chart (Çizgi Grafik)
**Ne zaman kullanılır:** Zaman serisi verileri, trend analizi

**Canary için kullanım:**
- Revenue trends (Gelir trendi)
- Equipment usage over time (Ekipman kullanımı)
- Order volume trends (Sipariş hacmi)

**Örnek:**
```tsx
const revenueData = {
  labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs'],
  datasets: [{
    label: 'Aylık Gelir (₺)',
    data: [45000, 52000, 48000, 61000, 58000],
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.4, // Smooth curves
    fill: true,
  }]
};
```

### 2. Bar Chart (Çubuk Grafik)
**Ne zaman kullanılır:** Kategoriler arası karşılaştırma

**Canary için kullanım:**
- Equipment utilization by type (Ekipman tiplerine göre kullanım)
- Revenue by category (Kategoriye göre gelir)
- Customer segments (Müşteri segmentleri)

**Örnek:**
```tsx
const equipmentData = {
  labels: ['Kamera', 'Lens', 'Işık', 'Ses', 'Drone'],
  datasets: [{
    label: 'Kullanım Oranı (%)',
    data: [85, 72, 68, 45, 92],
    backgroundColor: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
    ],
  }]
};
```

### 3. Pie Chart (Pasta Grafik)
**Ne zaman kullanılır:** Yüzde dağılımları, oran gösterimi

**Canary için kullanım:**
- Revenue by category (Kategoriye göre gelir dağılımı)
- Order status distribution (Sipariş durum dağılımı)
- Customer types (Müşteri tipleri)

**Örnek:**
```tsx
const categoryData = {
  labels: ['Kamera', 'Lens', 'Işık', 'Ses', 'Aksesuarlar'],
  datasets: [{
    data: [35, 25, 20, 12, 8],
    backgroundColor: [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
    ],
  }]
};
```

### 4. Doughnut Chart (Halka Grafik)
**Ne zaman kullanılır:** Pie chart gibi, ama ortası boş (daha modern görünüm)

**Canary için kullanım:**
- Equipment availability (Ekipman müsaitlik durumu)
- Payment status (Ödeme durumu)

**Örnek:**
```tsx
const availabilityData = {
  labels: ['Müsait', 'Kirada', 'Bakımda'],
  datasets: [{
    data: [45, 38, 7],
    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
    borderWidth: 2,
  }]
};
```

---

## 🎨 Önemli Konfigürasyon Seçenekleri

### Responsive Design
```tsx
const options = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2, // width/height ratio
};
```

### Tooltip Customization
```tsx
const options = {
  plugins: {
    tooltip: {
      enabled: true,
      mode: 'index', // 'point', 'nearest', 'index', 'dataset'
      intersect: false,
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ₺${context.parsed.y.toLocaleString('tr-TR')}`;
        }
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
    }
  }
};
```

### Legend Customization
```tsx
const options = {
  plugins: {
    legend: {
      display: true,
      position: 'top', // 'top', 'bottom', 'left', 'right'
      align: 'center', // 'start', 'center', 'end'
      labels: {
        color: '#374151',
        font: { size: 12 },
        padding: 15,
        usePointStyle: true, // Circular legends
      }
    }
  }
};
```

### Axes Customization
```tsx
const options = {
  scales: {
    x: {
      grid: {
        display: false, // Hide grid lines
      },
      ticks: {
        color: '#6b7280',
        font: { size: 11 }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        color: '#6b7280',
        callback: function(value) {
          return '₺' + value.toLocaleString('tr-TR');
        }
      }
    }
  }
};
```

---

## 🔥 Advanced Techniques

### 1. Multiple Datasets (Çoklu Veri Setleri)

```tsx
const multiData = {
  labels: ['Ocak', 'Şubat', 'Mart', 'Nisan'],
  datasets: [
    {
      label: '2024 Gelir',
      data: [45000, 52000, 48000, 61000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: '2025 Gelir',
      data: [51000, 58000, 55000, 68000],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
    }
  ]
};
```

### 2. Dynamic Data Updates (Dinamik Veri Güncelleme)

```tsx
function DynamicChart() {
  const [chartData, setChartData] = useState(initialData);

  useEffect(() => {
    // API'den veri çek
    fetch('/api/analytics/revenue?period=30d')
      .then(res => res.json())
      .then(data => {
        setChartData({
          labels: data.dates,
          datasets: [{
            label: 'Revenue',
            data: data.values,
            borderColor: 'rgb(59, 130, 246)',
          }]
        });
      });
  }, []);

  return <Line data={chartData} options={options} />;
}
```

### 3. Mixed Chart Types (Karma Grafik Tipleri)

```tsx
const mixedData = {
  labels: ['Ocak', 'Şubat', 'Mart'],
  datasets: [
    {
      type: 'line',
      label: 'Revenue',
      data: [45000, 52000, 48000],
      borderColor: 'rgb(59, 130, 246)',
    },
    {
      type: 'bar',
      label: 'Orders',
      data: [120, 145, 135],
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
    }
  ]
};
```

---

## 🎯 Canary Dashboard için Chart Plan

### Overview Tab
1. **Revenue Line Chart** - Son 30 gün gelir trendi
2. **Equipment Utilization Doughnut** - Ekipman kullanım oranı
3. **Top Categories Bar Chart** - En popüler kategoriler

### Revenue Tab
1. **Monthly Revenue Line Chart** - Aylık gelir karşılaştırması (2024 vs 2025)
2. **Category Breakdown Pie Chart** - Kategoriye göre gelir dağılımı
3. **Payment Status Doughnut** - Ödeme durumu dağılımı

### Equipment Tab
1. **Utilization Rate Bar Chart** - Ekipman tiplerine göre kullanım
2. **Availability Doughnut** - Müsait vs Kirada vs Bakımda
3. **Popular Equipment Line Chart** - Popüler ekipman trendi

### Customer Tab
1. **New Customers Line Chart** - Yeni müşteri trendi
2. **Customer Segments Pie Chart** - Müşteri segmentleri
3. **Top Customers Bar Chart** - En iyi müşteriler

---

## 💡 Best Practices

### 1. Performance Optimization
```tsx
// Use React.memo for chart components
const RevenueChart = React.memo(({ data, options }) => {
  return <Line data={data} options={options} />;
});

// Memoize data and options
const chartData = useMemo(() => ({
  labels: data.labels,
  datasets: data.datasets,
}), [data]);

const chartOptions = useMemo(() => ({
  responsive: true,
  // ... options
}), []);
```

### 2. Color Palette (Tutarlı Renk Paleti)
```tsx
const CHART_COLORS = {
  primary: '#3b82f6',    // blue-500
  success: '#10b981',    // green-500
  warning: '#f59e0b',    // amber-500
  danger: '#ef4444',     // red-500
  purple: '#8b5cf6',     // purple-500
  gray: '#6b7280',       // gray-500
};

const CHART_BG_COLORS = {
  primary: 'rgba(59, 130, 246, 0.1)',
  success: 'rgba(16, 185, 129, 0.1)',
  // ...
};
```

### 3. Reusable Chart Component
```tsx
interface ChartWrapperProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: any;
  options?: any;
}

function ChartWrapper({ title, type, data, options }: ChartWrapperProps) {
  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie,
    doughnut: Doughnut,
  }[type];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartComponent data={data} options={options} />
      </CardContent>
    </Card>
  );
}
```

---

## 📝 Pratik Ödevler

### Hafta Sonu Egzersizleri

#### Egzersiz 1: Simple Line Chart (30 min)
- [ ] Revenue line chart oluştur
- [ ] Son 7 günlük veri göster
- [ ] Tooltip'te Türk Lirası formatı
- [ ] Responsive yap

#### Egzersiz 2: Bar Chart with Multiple Datasets (30 min)
- [ ] Ekipman kategorileri bar chart
- [ ] 2024 vs 2025 karşılaştırması
- [ ] Custom colors
- [ ] Legend ekle

#### Egzersiz 3: Pie Chart (20 min)
- [ ] Revenue category breakdown
- [ ] 5 kategori göster
- [ ] Percentage labels ekle
- [ ] Custom tooltip

#### Egzersiz 4: Dynamic Chart (40 min)
- [ ] API'den veri çek
- [ ] Period seçici ekle (7d, 30d, 90d)
- [ ] Data değişince chart update
- [ ] Loading state ekle

#### Egzersiz 5: Reusable Component (30 min)
- [ ] Generic ChartWrapper component
- [ ] TypeScript interfaces
- [ ] Props validation
- [ ] Error handling

---

## 🔗 Kod Örnekleri Repository

Tüm örnekler `frontend/src/components/charts/examples/` klasöründe:

1. `SimpleLineChart.tsx` - Temel line chart
2. `MultiDatasetBarChart.tsx` - Çoklu dataset bar chart
3. `PieChartWithPercentages.tsx` - Percentage'lı pie chart
4. `DynamicRevenueChart.tsx` - API'den veri çeken dinamik chart
5. `ReusableChartWrapper.tsx` - Tekrar kullanılabilir component

---

## 📊 Örnek Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│                   Overview Tab                       │
├─────────────────────────┬───────────────────────────┤
│  Revenue Line Chart     │  Equipment Doughnut       │
│  (Last 30 days)         │  (Utilization %)          │
├─────────────────────────┴───────────────────────────┤
│  Top Categories Bar Chart (Horizontal)              │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Öğrenme Checklist

### Temel Seviye
- [ ] Chart.js kurulumu yaptım
- [ ] react-chartjs-2 entegrasyonunu anladım
- [ ] Line chart örneği çalıştırdım
- [ ] Bar chart örneği çalıştırdım
- [ ] Pie chart örneği çalıştırdım
- [ ] Doughnut chart örneği çalıştırdım
- [ ] Responsive design uyguladım
- [ ] Basic tooltip customization yaptım

### İleri Seviye
- [ ] Multiple datasets kullandım
- [ ] Dynamic data update yaptım
- [ ] Custom colors uyguladım
- [ ] Legend customization yaptım
- [ ] Axes customization yaptım
- [ ] Reusable component oluşturdum
- [ ] Performance optimization yaptım
- [ ] Error handling ekledim

### Canary Specific
- [ ] Revenue chart tasarladım
- [ ] Equipment chart tasarladım
- [ ] Customer chart tasarladım
- [ ] Order chart tasarladım
- [ ] 10 chart template oluşturdum
- [ ] Türk Lirası formatını ekledim
- [ ] Türkçe labels kullandım
- [ ] Mobile responsive yaptım

---

## 🎓 Sonraki Adımlar

1. **Pazartesi:** Backend report builder ile entegrasyon
2. **Salı:** Real data ile charts'ı doldur
3. **Çarşamba:** Export functionality (PDF charts)
4. **Perşembe:** Advanced analytics ve predictions

---

**Hazırlık Durumu:** ✅ Chart.js öğrenmeye hazırım!  
**Tahmini Süre:** 3-4 saat  
**Başarı Kriteri:** 5 farklı chart tipini rahatça kullanabiliyorum  
**Son Güncelleme:** 25 Ekim 2025

**Motto:** "Charts tell stories, make them beautiful!" 📊✨
