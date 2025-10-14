import React, { useEffect, useState } from 'react';
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
import { Line } from 'react-chartjs-2';
import { TrendingUp, DollarSign } from 'lucide-react';

// Register Chart.js components
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

interface RevenueData {
  labels: string[];
  data: number[];
  total: number;
  average: number;
  currency: string;
}

interface RevenueChartProps {
  data?: RevenueData;
  loading?: boolean;
  error?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ 
  data, 
  loading = false,
  error 
}) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (data) {
      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: 'Gelir (₺)',
            data: data.data,
            fill: true,
            borderColor: 'rgb(64, 64, 64)',
            backgroundColor: 'rgba(64, 64, 64, 0.1)',
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgb(64, 64, 64)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      });
    }
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return '₺' + context.parsed.y.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          callback: function(value: any) {
            return '₺' + value.toLocaleString('tr-TR');
          },
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
      x: {
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Gelir Analizi</h3>
          <DollarSign className="w-5 h-5 text-neutral-700" />
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
          <h3 className="text-lg font-semibold text-neutral-900">Gelir Analizi</h3>
          <DollarSign className="w-5 h-5 text-neutral-700" />
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
          <h3 className="text-lg font-semibold text-neutral-900">Gelir Analizi</h3>
          <DollarSign className="w-5 h-5 text-neutral-700" />
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
          <h3 className="text-lg font-semibold text-neutral-900">Gelir Analizi</h3>
          <p className="text-sm text-neutral-500 mt-1">Son 6 aylık gelir trendi</p>
        </div>
        <DollarSign className="w-5 h-5 text-neutral-700" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                ₺{data.total.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-neutral-700" />
          </div>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Aylık Ortalama</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                ₺{data.average.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="text-neutral-700 text-sm font-medium">
              /ay
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RevenueChart;
