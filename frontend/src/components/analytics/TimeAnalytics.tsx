import React, { useState } from 'react';
import { Calendar, TrendingUp, BarChart3, PieChart, LineChart } from 'lucide-react';

interface TimeAnalyticsProps {
  data: any;
  loading?: boolean;
}

type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';
type ChartType = 'line' | 'bar' | 'area' | 'pie';

const TimeAnalytics: React.FC<TimeAnalyticsProps> = ({ data: _data, loading = false }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [selectedChart, setSelectedChart] = useState<ChartType>('line');

  const periods = [
    { key: 'today', label: 'Bugün', icon: Calendar },
    { key: 'week', label: 'Bu Hafta', icon: Calendar },
    { key: 'month', label: 'Bu Ay', icon: Calendar },
    { key: 'quarter', label: 'Bu Çeyrek', icon: Calendar },
    { key: 'year', label: 'Bu Yıl', icon: Calendar },
  ];

  const chartTypes = [
    { key: 'line', label: 'Çizgi', icon: LineChart },
    { key: 'bar', label: 'Çubuk', icon: BarChart3 },
    { key: 'area', label: 'Alan', icon: TrendingUp },
    { key: 'pie', label: 'Pasta', icon: PieChart },
  ];

  const getPeriodData = (period: TimePeriod) => {
    // Mock data based on period selection
    const baseData = {
      today: {
        revenue: [120, 150, 180, 200, 175, 190, 220],
        orders: [5, 8, 12, 15, 10, 14, 18],
        customers: [2, 3, 5, 4, 6, 7, 8],
        labels: ['6:00', '9:00', '12:00', '15:00', '18:00', '21:00', '24:00']
      },
      week: {
        revenue: [1200, 1800, 1500, 2200, 1900, 2100, 2400],
        orders: [25, 35, 28, 42, 38, 45, 52],
        customers: [8, 12, 10, 15, 13, 16, 18],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      month: {
        revenue: [15000, 18000, 22000, 19000, 25000, 23000, 28000, 26000, 30000, 32000, 29000, 35000],
        orders: [120, 150, 180, 160, 200, 185, 220, 210, 240, 260, 230, 280],
        customers: [45, 52, 48, 55, 62, 58, 65, 72, 68, 75, 78, 82],
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      },
      quarter: {
        revenue: [75000, 85000, 95000],
        orders: [650, 720, 810],
        customers: [180, 200, 220],
        labels: ['Q1', 'Q2', 'Q3']
      },
      year: {
        revenue: [120000, 135000, 150000, 145000, 165000, 170000, 180000, 175000, 190000, 195000, 185000, 200000],
        orders: [1200, 1350, 1500, 1450, 1650, 1700, 1800, 1750, 1900, 1950, 1850, 2000],
        customers: [350, 380, 420, 450, 480, 510, 540, 570, 600, 630, 660, 690],
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      }
    };
    return baseData[period];
  };

  const currentData = getPeriodData(selectedPeriod);

  const calculateGrowth = (data: number[]) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getTotalValue = (data: number[]) => {
    return data.reduce((sum, value) => sum + value, 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-neutral-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Zaman Bazlı Analitik</h3>
          <p className="text-neutral-600">Farklı zaman dilimlerinde performans trendlerini takip edin</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
          {/* Period Selector */}
          <div className="flex bg-neutral-100 rounded-xl p-1">
            {periods.map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as TimePeriod)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedPeriod === period.key
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex bg-neutral-100 rounded-xl p-1">
            {chartTypes.map((chart) => (
              <button
                key={chart.key}
                onClick={() => setSelectedChart(chart.key as ChartType)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  selectedChart === chart.key
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title={chart.label}
              >
                <chart.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Toplam Gelir</p>
              <p className="text-2xl font-bold text-neutral-900">
                ₺{getTotalValue(currentData.revenue).toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="text-neutral-700">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-2 text-sm text-neutral-600">
            {calculateGrowth(currentData.revenue)}% önceki döneme göre
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Toplam Sipariş</p>
              <p className="text-2xl font-bold text-neutral-900">
                {getTotalValue(currentData.orders).toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="text-neutral-700">
              <BarChart3 size={24} />
            </div>
          </div>
          <div className="mt-2 text-sm text-neutral-600">
            {calculateGrowth(currentData.orders)}% önceki döneme göre
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm font-medium">Yeni Müşteriler</p>
              <p className="text-2xl font-bold text-neutral-900">
                {getTotalValue(currentData.customers).toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="text-neutral-700">
              <PieChart size={24} />
            </div>
          </div>
          <div className="mt-2 text-sm text-neutral-600">
            {calculateGrowth(currentData.customers)}% önceki döneme göre
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-64 bg-neutral-50 rounded-xl flex items-center justify-center">
        <div className="text-center text-neutral-500">
          <LineChart size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">İnteraktif Grafik</p>
          <p className="text-sm">
            {periods.find(p => p.key === selectedPeriod)?.label} için {chartTypes.find(c => c.key === selectedChart)?.label.toLowerCase()} grafik gösteriliyor
          </p>
          <p className="text-xs mt-2 text-neutral-400">
            Chart.js entegrasyonu burada yer alacak
          </p>
        </div>
      </div>

      {/* Data Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-50 rounded-xl p-4">
          <h4 className="font-semibold text-neutral-900 mb-2">📈 Önemli İçgörüler</h4>
          <ul className="space-y-1 text-sm text-neutral-600">
            <li>• Bu dönem gelir artışı %{calculateGrowth(currentData.revenue)}</li>
            <li>• Sipariş hacmi %{calculateGrowth(currentData.orders)} arttı</li>
            <li>• Müşteri kazanımı %{calculateGrowth(currentData.customers)} yükseldi</li>
          </ul>
        </div>
        
        <div className="bg-neutral-50 rounded-xl p-4">
          <h4 className="font-semibold text-neutral-900 mb-2">🎯 Öneriler</h4>
          <ul className="space-y-1 text-sm text-neutral-600">
            <li>• Yüksek performanslı dönemlere odaklanın</li>
            <li>• Düşük dönüşümlü zaman dilimlerini optimize edin</li>
            <li>• Başarılı pazarlama kampanyalarını ölçeklendirin</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeAnalytics;