import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ShoppingCart, Calendar } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface OrdersData {
  labels: string[];
  data: number[];
  statusBreakdown: {
    PENDING: number[];
    IN_PROGRESS: number[];
    COMPLETED: number[];
    CANCELLED: number[];
  };
  total: number;
  period: string;
}

interface OrdersChartProps {
  data?: OrdersData;
  loading?: boolean;
  error?: string;
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly') => void;
}

export const OrdersChart: React.FC<OrdersChartProps> = ({ 
  data, 
  loading = false,
  error,
  onPeriodChange 
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (data) {
      if (showBreakdown && data.statusBreakdown) {
        // Stacked bar chart with status breakdown
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: 'Beklemede',
              data: data.statusBreakdown.PENDING,
              backgroundColor: 'rgba(64, 64, 64, 0.9)',
              borderColor: 'rgb(64, 64, 64)',
              borderWidth: 1,
            },
            {
              label: 'Devam Ediyor',
              data: data.statusBreakdown.IN_PROGRESS,
              backgroundColor: 'rgba(115, 115, 115, 0.9)',
              borderColor: 'rgb(115, 115, 115)',
              borderWidth: 1,
            },
            {
              label: 'Tamamlandı',
              data: data.statusBreakdown.COMPLETED,
              backgroundColor: 'rgba(38, 38, 38, 0.9)',
              borderColor: 'rgb(38, 38, 38)',
              borderWidth: 1,
            },
            {
              label: 'İptal',
              data: data.statusBreakdown.CANCELLED,
              backgroundColor: 'rgba(163, 163, 163, 0.9)',
              borderColor: 'rgb(163, 163, 163)',
              borderWidth: 1,
            },
          ],
        });
      } else {
        // Simple bar chart
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: 'Sipariş Sayısı',
              data: data.data,
              backgroundColor: 'rgba(64, 64, 64, 0.9)',
              borderColor: 'rgb(64, 64, 64)',
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        });
      }
    }
  }, [data, showBreakdown]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showBreakdown,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: showBreakdown,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          precision: 0,
        },
      },
      x: {
        stacked: showBreakdown,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Sipariş Analizi</h3>
          <ShoppingCart className="w-5 h-5 text-neutral-700" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Sipariş Analizi</h3>
          <ShoppingCart className="w-5 h-5 text-neutral-700" />
        </div>
        <div className="flex items-center justify-center h-64 text-neutral-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !chartData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Sipariş Analizi</h3>
          <ShoppingCart className="w-5 h-5 text-neutral-700" />
        </div>
        <div className="flex items-center justify-center h-64 text-neutral-500">
          <p>Veri bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Sipariş Analizi</h3>
          <p className="text-sm text-neutral-500 mt-1">
            {selectedPeriod === 'daily' && 'Son 30 günlük sipariş trendi'}
            {selectedPeriod === 'weekly' && 'Son 12 haftalık sipariş trendi'}
            {selectedPeriod === 'monthly' && 'Son 12 aylık sipariş trendi'}
          </p>
        </div>
        <ShoppingCart className="w-5 h-5 text-neutral-700" />
      </div>

      {/* Period Toggle Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex rounded-lg border border-neutral-200 p-1">
          <button
            onClick={() => handlePeriodChange('daily')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedPeriod === 'daily'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Günlük
          </button>
          <button
            onClick={() => handlePeriodChange('weekly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedPeriod === 'weekly'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Haftalık
          </button>
          <button
            onClick={() => handlePeriodChange('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedPeriod === 'monthly'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Aylık
          </button>
        </div>

        {/* Breakdown Toggle */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          {showBreakdown ? 'Basit Görünüm' : 'Durum Analizi'}
        </button>
      </div>

      {/* Total Orders Card */}
      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Toplam Sipariş</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {data.total}
            </p>
          </div>
          <div className="text-purple-500 text-sm font-medium">
            {selectedPeriod === 'daily' && '30 gün'}
            {selectedPeriod === 'weekly' && '12 hafta'}
            {selectedPeriod === 'monthly' && '12 ay'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default OrdersChart;
