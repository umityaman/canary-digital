# 📚 Chart.js Öğrenme Materyalleri

**Sprint 1 - Reporting & Analytics için hazırlanmış kapsamlı Chart.js eğitim paketi**

---

## 📁 Klasör Yapısı

```
Documents/Eğitim Materyalleri/
├── CHARTJS_LEARNING_GUIDE.md       # Kapsamlı öğrenme rehberi (3-4 saat)
└── CHARTJS_QUICK_REFERENCE.md      # Hızlı referans kartları (yazdır!)

frontend/src/components/charts/examples/
├── SimpleLineChart.tsx              # Temel line chart
├── MultiDatasetBarChart.tsx         # Çoklu dataset bar chart
├── PieChartWithPercentages.tsx      # Percentage'lı pie chart
├── DynamicRevenueChart.tsx          # Period selector ile dinamik chart
└── ReusableChartWrapper.tsx         # Generic, tekrar kullanılabilir component

frontend/src/pages/
└── ChartExamplesPage.tsx            # Tüm örnekleri gösteren demo sayfası
```

---

## 🎯 Nasıl Kullanılır?

### 1. Öğrenme Aşaması (Cumartesi - 3-4 saat)

#### Adım 1: Dökümanları Oku (1 saat)
```bash
# Quick Reference'ı aç - Hızlı başlangıç
Documents/Eğitim Materyalleri/CHARTJS_QUICK_REFERENCE.md

# Learning Guide'ı detaylı incele
Documents/Eğitim Materyalleri/CHARTJS_LEARNING_GUIDE.md
```

#### Adım 2: Resmi Dökümanları İncele (1 saat)
- **Chart.js**: https://www.chartjs.org/docs/latest/
- **react-chartjs-2**: https://react-chartjs-2.js.org/
- Examples sayfasını gez

#### Adım 3: Kod Örneklerini İncele (1 saat)
```bash
# Her örneği tek tek aç ve kodu incele
frontend/src/components/charts/examples/

# Örnekler:
# 1. SimpleLineChart.tsx - En basit başlangıç
# 2. MultiDatasetBarChart.tsx - Çoklu dataset
# 3. PieChartWithPercentages.tsx - Pie chart
# 4. DynamicRevenueChart.tsx - API entegrasyonu
# 5. ReusableChartWrapper.tsx - Advanced pattern
```

#### Adım 4: Demo Sayfasını Çalıştır (30 min)
```bash
# Frontend'i başlat
cd frontend
npm run dev

# Tarayıcıda aç (route'u App.tsx'e eklenmeli):
# http://localhost:5173/chart-examples
```

#### Adım 5: Kendi Örneklerini Oluştur (30 min)
```bash
# Yeni bir örnek oluştur
cd frontend/src/components/charts/examples
# SimpleLineChart.tsx'i kopyala ve özelleştir
```

---

### 2. Demo Sayfasını Aktifleştirme

`ChartExamplesPage.tsx` oluşturuldu ama route eklenmedi. Eklemek için:

#### App.tsx'e Route Ekle
```typescript
// frontend/src/App.tsx
import ChartExamplesPage from './pages/ChartExamplesPage';

// Routes içine ekle:
<Route path="/chart-examples" element={<ChartExamplesPage />} />
```

#### Sidebar'a Link Ekle (Opsiyonel)
```typescript
// frontend/src/components/Sidebar.tsx
// Geliştirme amaçlı geçici link ekle
{
  name: '📊 Chart Examples',
  path: '/chart-examples',
  icon: ChartBarIcon, // veya başka bir icon
}
```

---

## 🚀 Hızlı Başlangıç

### Chart.js Kurulumu
```bash
cd frontend
npm install chart.js react-chartjs-2
```

### İlk Chart'ı Oluştur
```typescript
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function MyFirstChart() {
  const data = {
    labels: ['Ocak', 'Şubat', 'Mart'],
    datasets: [{
      label: 'Gelir',
      data: [45000, 52000, 48000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Aylık Gelir' }
    }
  };

  return <Line data={data} options={options} />;
}
```

---

## 📋 Öğrenme Checklist

### Temel Seviye (2 saat)
- [ ] Chart.js ve react-chartjs-2 kurulumu
- [ ] SimpleLineChart örneğini çalıştır
- [ ] MultiDatasetBarChart örneğini çalıştır
- [ ] PieChartWithPercentages örneğini çalıştır
- [ ] Data structure'ı anla
- [ ] Options configuration'ı anla
- [ ] Responsive design uygula
- [ ] Tooltip customize et

### İleri Seviye (1-2 saat)
- [ ] DynamicRevenueChart'ı çalıştır (API entegrasyonu)
- [ ] ReusableChartWrapper'ı incele
- [ ] Multiple datasets kullan
- [ ] Custom colors uygula
- [ ] Türk Lirası formatını ekle
- [ ] Loading state ekle
- [ ] Error handling ekle
- [ ] Performance optimization yap

### Canary Specific (Sprint 1 için)
- [ ] Revenue chart tasarla
- [ ] Equipment chart tasarla
- [ ] Customer chart tasarla
- [ ] Order chart tasarla
- [ ] 10 chart template planla
- [ ] Mobile responsive test et

---

## 💡 Öğrenme İpuçları

1. **Hands-on Practice**: Sadece okuma, bol bol kod yaz
2. **Start Simple**: SimpleLineChart'tan başla, karmaşıklaştır
3. **Experiment**: Options'ları değiştir, farklı değerler dene
4. **Real Data**: Kendi verilerinle test et
5. **Mobile First**: Her zaman mobil görünümü test et
6. **Reference Docs**: Chart.js docs'u her zaman açık tut
7. **Copy-Paste**: Örnekleri kopyala, sonra customize et
8. **Performance**: Büyük veri setleriyle test et

---

## 🎨 Kullanılabilir Chart Tipleri

| Chart | Kullanım | Canary Örneği |
|-------|---------|--------------|
| Line | Trend, zaman serisi | Revenue trend, Order volume |
| Bar | Kategori karşılaştırma | Equipment types, Monthly comparison |
| Pie | Yüzde dağılımı | Category breakdown, Customer segments |
| Doughnut | Modern dağılım | Equipment availability, Payment status |
| Radar | Çok boyutlu karşılaştırma | Performance metrics |
| Polar Area | Dağılım + değer | Category importance |

---

## 📊 Sprint 1 Chart Plan

### Overview Tab (3 charts)
1. **Revenue Line Chart** - Son 30 gün trend
2. **Equipment Doughnut** - Kullanım oranı
3. **Top Categories Bar** - En popüler 5 kategori

### Revenue Tab (3 charts)
1. **Monthly Revenue Line** - 2024 vs 2025 karşılaştırma
2. **Category Pie** - Kategoriye göre gelir dağılımı
3. **Payment Status Doughnut** - Ödendi vs Bekliyor

### Equipment Tab (3 charts)
1. **Utilization Bar** - Ekipman tiplerine göre kullanım
2. **Availability Doughnut** - Müsait vs Kirada vs Bakımda
3. **Popular Equipment Line** - Popüler ekipman trendi

### Customer Tab (3 charts)
1. **New Customers Line** - Yeni müşteri trendi
2. **Customer Segments Pie** - Bireysel vs Kurumsal
3. **Top Customers Bar** - En çok gelir getiren 10 müşteri

---

## 🔗 Kaynak Linkler

### Resmi Dökümanlar
- **Chart.js**: https://www.chartjs.org/docs/latest/
- **react-chartjs-2**: https://react-chartjs-2.js.org/
- **Chart.js Examples**: https://www.chartjs.org/docs/latest/samples/
- **Configuration**: https://www.chartjs.org/docs/latest/configuration/

### Öğrenme Kaynakları
- **Chart.js GitHub**: https://github.com/chartjs/Chart.js
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/chart.js
- **CodePen Examples**: https://codepen.io/tag/chartjs

### Video Tutorials (Opsiyonel)
- YouTube'da "Chart.js tutorial" ara
- "react-chartjs-2 tutorial" videolarını izle

---

## 🎯 Sonraki Adımlar

### Pazartesi (Sprint 1 Day 1)
1. Backend report builder ile entegrasyon
2. Real data ile charts doldur
3. API endpoints'leri bağla
4. Period selector'ları aktif et

### Salı (Sprint 1 Day 2)
1. Export functionality (PDF/Excel ile charts)
2. Email reports ile chart images
3. Performance optimization
4. Mobile responsive fixes

---

## 📞 Yardım ve Destek

### Sorun mu yaşıyorsun?

1. **Quick Reference'a bak**: `CHARTJS_QUICK_REFERENCE.md` - Çoğu sorun burada
2. **Örneklere bak**: `frontend/src/components/charts/examples/` - Working code
3. **Chart.js Docs**: https://www.chartjs.org/docs/latest/
4. **Console Errors**: Browser console'u kontrol et
5. **Stack Overflow**: Spesifik sorunlar için

### Common Issues
- Chart görünmüyor → Register components kontrol et
- Responsive çalışmıyor → Options'da responsive: true
- Data update olmuyor → New object oluştur (immutable)
- Tooltip formatı yanlış → callbacks.label customize et

---

## ✅ Başarı Kriterleri

Sprint 1 başlamadan önce:
- [ ] 4 temel chart tipini rahatça kullanabiliyorum
- [ ] Data structure'ı anlıyorum
- [ ] Options'ları configure edebiliyorum
- [ ] Responsive design yapabiliyorum
- [ ] Türk Lirası formatını ekleyebiliyorum
- [ ] Custom colors uygulayabiliyorum
- [ ] Loading state ekleyebiliyorum
- [ ] En az 5 farklı chart örneği oluşturdum

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 25 Ekim 2025  
**Durum:** ✅ Eğitim Materyalleri Hazır  
**Süre:** 3-4 saat öğrenme + pratik

**Motto:** "Learn by doing! 🚀"
