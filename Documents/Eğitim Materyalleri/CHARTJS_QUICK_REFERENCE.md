# 📋 Chart.js Quick Reference (Hızlı Referans)

**Hızlı Erişim Kartları** - Sprint 1 sırasında yanınızda bulundurun! 💪

---

## 🚀 Kurulum

```bash
# Frontend klasöründe
npm install chart.js react-chartjs-2
```

---

## 📊 Chart Tipleri - Kullanım Alanları

| Chart Tipi | Kullanım Alanı | Canary Örneği | Import |
|-----------|---------------|--------------|--------|
| **Line** | Zaman serisi, trendler | Revenue trend, Order volume | `import { Line } from 'react-chartjs-2'` |
| **Bar** | Kategori karşılaştırma | Equipment by type, Monthly comparison | `import { Bar } from 'react-chartjs-2'` |
| **Pie** | Yüzde dağılımı | Category breakdown, Customer segments | `import { Pie } from 'react-chartjs-2'` |
| **Doughnut** | Modern dağılım | Equipment availability, Payment status | `import { Doughnut } from 'react-chartjs-2'` |

---

## 🎨 Renk Paleti (Tailwind)

```typescript
const COLORS = {
  blue: '#3b82f6',      // Primary
  green: '#10b981',     // Success
  amber: '#f59e0b',     // Warning
  red: '#ef4444',       // Danger
  purple: '#8b5cf6',    // Info
  gray: '#6b7280',      // Neutral
};

const BG_COLORS = {
  blue: 'rgba(59, 130, 246, 0.1)',
  green: 'rgba(16, 185, 129, 0.1)',
  // ... add 0.1 alpha to RGB
};
```

---

## 🔧 Temel Kullanım Pattern

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
  Legend,
} from 'chart.js';

// Register components
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
  const data = { /* ... */ };
  const options = { /* ... */ };
  return <Line data={data} options={options} />;
}
```

---

## 📐 Data Structure

```typescript
const data = {
  labels: ['Ocak', 'Şubat', 'Mart'],
  datasets: [
    {
      label: 'Dataset Label',
      data: [12, 19, 3],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
  ],
};
```

---

## ⚙️ Options - En Sık Kullanılanlar

### Responsive Settings
```typescript
const options = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2, // width/height
};
```

### Legend
```typescript
plugins: {
  legend: {
    display: true,
    position: 'top', // 'top' | 'bottom' | 'left' | 'right'
    labels: {
      color: '#374151',
      font: { size: 12 },
      usePointStyle: true,
    },
  },
}
```

### Tooltip
```typescript
plugins: {
  tooltip: {
    enabled: true,
    mode: 'index', // 'point' | 'nearest' | 'index'
    callbacks: {
      label: function(context) {
        return `${context.label}: ₺${context.parsed.y}`;
      }
    },
  },
}
```

### Scales (Axes)
```typescript
scales: {
  x: {
    grid: { display: false },
    ticks: { color: '#6b7280' },
  },
  y: {
    beginAtZero: true,
    grid: { color: 'rgba(0,0,0,0.05)' },
    ticks: {
      callback: function(value) {
        return '₺' + value.toLocaleString('tr-TR');
      }
    },
  },
}
```

---

## 💡 Türk Lirası Formatı

```typescript
// Tooltip'te
callbacks: {
  label: function(context: any) {
    return `Gelir: ₺${context.parsed.y.toLocaleString('tr-TR')}`;
  }
}

// Y axis'te
ticks: {
  callback: function(value: any) {
    return '₺' + value.toLocaleString('tr-TR');
  }
}

// Kısa format (K, M)
ticks: {
  callback: function(value: any) {
    if (value >= 1000000) {
      return '₺' + (value / 1000000) + 'M';
    } else if (value >= 1000) {
      return '₺' + (value / 1000) + 'K';
    }
    return '₺' + value;
  }
}
```

---

## 🎯 Dataset Properties - Line Chart

```typescript
{
  label: 'Revenue',
  data: [12, 19, 3, 5, 2, 3],
  
  // Line styling
  borderColor: 'rgb(59, 130, 246)',
  borderWidth: 2,
  tension: 0.4, // 0 = straight, 1 = very curved
  
  // Fill area
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  fill: true,
  
  // Points
  pointRadius: 5,
  pointHoverRadius: 7,
  pointBackgroundColor: 'rgb(59, 130, 246)',
  pointBorderColor: '#fff',
  pointBorderWidth: 2,
}
```

---

## 🎯 Dataset Properties - Bar Chart

```typescript
{
  label: 'Revenue',
  data: [12, 19, 3, 5, 2, 3],
  
  // Bar styling
  backgroundColor: 'rgba(59, 130, 246, 0.8)',
  borderColor: 'rgb(59, 130, 246)',
  borderWidth: 1,
  borderRadius: 4,
  
  // Bar size
  barThickness: 'flex', // or number
  maxBarThickness: 50,
}
```

---

## 🎯 Dataset Properties - Pie/Doughnut

```typescript
{
  label: 'Categories',
  data: [35, 25, 20, 12, 8],
  
  // Colors (array for each slice)
  backgroundColor: [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
  ],
  
  borderColor: '#fff',
  borderWidth: 2,
  
  // Hover effect
  hoverOffset: 10,
}
```

---

## 🔄 Dynamic Data Update

```typescript
const [chartData, setChartData] = useState(initialData);

useEffect(() => {
  fetch('/api/analytics')
    .then(res => res.json())
    .then(data => {
      setChartData({
        labels: data.labels,
        datasets: [{
          label: 'Revenue',
          data: data.values,
          // ... styling
        }]
      });
    });
}, [period]); // Re-fetch when period changes
```

---

## 📱 Responsive Best Practices

```typescript
// Option 1: Container with max height
<div style={{ maxHeight: '400px' }}>
  <Line data={data} options={options} />
</div>

// Option 2: Fixed aspect ratio
const options = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2, // 2:1 ratio
};

// Option 3: Mobile breakpoints
const options = {
  aspectRatio: window.innerWidth < 768 ? 1 : 2,
};
```

---

## 🚀 Performance Tips

```typescript
// 1. Memoize data and options
const chartData = useMemo(() => ({
  labels: data.labels,
  datasets: data.datasets,
}), [data]);

const chartOptions = useMemo(() => ({
  // ... options
}), []);

// 2. React.memo for chart components
const RevenueChart = React.memo(({ data, options }) => {
  return <Line data={data} options={options} />;
});

// 3. Disable animations for large datasets
const options = {
  animation: {
    duration: data.length > 100 ? 0 : 1000,
  },
};
```

---

## 🎨 Multiple Datasets

```typescript
const data = {
  labels: ['Ocak', 'Şubat', 'Mart'],
  datasets: [
    {
      label: '2024',
      data: [45, 52, 48],
      borderColor: 'rgb(59, 130, 246)',
    },
    {
      label: '2025',
      data: [51, 58, 55],
      borderColor: 'rgb(16, 185, 129)',
    },
  ],
};
```

---

## 🔀 Mixed Chart Types

```typescript
const data = {
  datasets: [
    {
      type: 'line' as const,
      label: 'Revenue',
      data: [45, 52, 48],
    },
    {
      type: 'bar' as const,
      label: 'Orders',
      data: [120, 145, 135],
    },
  ],
};

// Import Chart component instead of specific type
import { Chart } from 'react-chartjs-2';
<Chart type='bar' data={data} options={options} />
```

---

## 🐛 Common Issues & Solutions

### Issue: Chart not updating
```typescript
// ❌ Wrong - mutating data
chartData.datasets[0].data.push(newValue);

// ✅ Correct - new object
setChartData({
  ...chartData,
  datasets: chartData.datasets.map(ds => ({
    ...ds,
    data: [...ds.data, newValue]
  }))
});
```

### Issue: Chart too small
```typescript
// Add min-height to container
<div style={{ minHeight: '300px' }}>
  <Line data={data} options={options} />
</div>
```

### Issue: Chart not responsive
```typescript
// Ensure responsive options are set
const options = {
  responsive: true,
  maintainAspectRatio: false, // Try false if chart not resizing
};
```

---

## 📦 Register Components by Chart Type

### Line Chart
```typescript
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // For fill: true
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);
```

### Bar Chart
```typescript
import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
);
```

### Pie/Doughnut
```typescript
import {
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);
```

---

## 📝 Checklist - Yeni Chart Eklerken

- [ ] Chart.js component'lerini import et
- [ ] ChartJS.register() ile kaydet
- [ ] Data structure'ı doğru şekilde oluştur
- [ ] Options'ları configure et
- [ ] Responsive ayarları kontrol et
- [ ] Türk Lirası formatını ekle
- [ ] Tooltip'leri customize et
- [ ] Legend'ı düzenle
- [ ] Renk paletini uygula
- [ ] Loading state ekle
- [ ] Error handling ekle
- [ ] Performance test et (büyük veri)
- [ ] Mobile görünümü test et

---

## 🔗 Hızlı Linkler

- **Chart.js Docs**: https://www.chartjs.org/docs/latest/
- **react-chartjs-2**: https://react-chartjs-2.js.org/
- **Examples**: https://www.chartjs.org/docs/latest/samples/
- **Configuration**: https://www.chartjs.org/docs/latest/configuration/
- **Plugins**: https://www.chartjs.org/docs/latest/developers/plugins.html

---

## 💪 Sprint 1 Chart Listesi

### Overview Tab (3 charts)
1. Revenue Line Chart - Son 30 gün
2. Equipment Doughnut - Kullanım oranı
3. Top Categories Bar - En popüler 5

### Revenue Tab (3 charts)
1. Monthly Revenue Line - 2024 vs 2025
2. Category Pie - Gelir dağılımı
3. Payment Status Doughnut

### Equipment Tab (3 charts)
1. Utilization Bar - Ekipman tiplerine göre
2. Availability Doughnut - Müsait vs Kirada
3. Popular Line - Trend

### Customer Tab (3 charts)
1. New Customers Line
2. Segments Pie
3. Top Customers Bar

---

**Yazdır ve masanızda tutun! 📌**  
**Sprint 1 boyunca hızlı referans için hazırlandı.**

---

**Son Güncelleme:** 25 Ekim 2025  
**Hazırlayan:** GitHub Copilot
