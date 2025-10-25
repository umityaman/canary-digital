/**
 * Dynamic Revenue Chart Örneği
 * Kullanım: API'den veri çekme, period selector
 * Özellikler: Dynamic data loading, period filter, loading state
 */

import { useState, useEffect } from 'react';
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
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Period = '7d' | '30d' | '90d' | '1y';

interface ChartData {
  labels: string[];
  values: number[];
}

export default function DynamicRevenueChart() {
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    values: [],
  });

  // Simulate API call
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data based on period
      const mockData = generateMockData(period);
      setChartData(mockData);
      setLoading(false);
    };

    fetchData();
  }, [period]);

  // Generate mock data based on period
  const generateMockData = (period: Period): ChartData => {
    const now = new Date();
    const data: ChartData = { labels: [], values: [] };

    switch (period) {
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          data.labels.push(
            date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' })
          );
          data.values.push(Math.floor(Math.random() * 15000) + 10000);
        }
        break;
      case '30d':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          data.labels.push(date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }));
          data.values.push(Math.floor(Math.random() * 20000) + 12000);
        }
        break;
      case '90d':
        for (let i = 12; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i * 7);
          data.labels.push(`Hafta ${13 - i}`);
          data.values.push(Math.floor(Math.random() * 50000) + 40000);
        }
        break;
      case '1y':
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          data.labels.push(date.toLocaleDateString('tr-TR', { month: 'short' }));
          data.values.push(Math.floor(Math.random() * 100000) + 80000);
        }
        break;
    }

    return data;
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Gelir (₺)',
        data: chartData.values,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        callbacks: {
          label: function (context: any) {
            return `Gelir: ₺${context.parsed.y.toLocaleString('tr-TR')}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: function (value: any) {
            return '₺' + (value / 1000) + 'K';
          },
        },
      },
    },
  };

  // Calculate statistics
  const total = chartData.values.reduce((sum, val) => sum + val, 0);
  const average = total / chartData.values.length || 0;
  const max = Math.max(...chartData.values, 0);
  const min = Math.min(...chartData.values, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Gelir Trendi</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
          <option value="90d">Son 90 Gün</option>
          <option value="1y">Son 1 Yıl</option>
        </select>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Line data={data} options={options} />
      )}

      {/* Statistics */}
      {!loading && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Toplam</p>
            <p className="text-lg font-bold text-blue-600">
              ₺{total.toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Ortalama</p>
            <p className="text-lg font-bold text-green-600">
              ₺{Math.round(average).toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">En Yüksek</p>
            <p className="text-lg font-bold text-purple-600">
              ₺{max.toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">En Düşük</p>
            <p className="text-lg font-bold text-orange-600">
              ₺{min.toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
