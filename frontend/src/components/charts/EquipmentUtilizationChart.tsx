import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Activity, TrendingUp } from 'lucide-react';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface EquipmentData {
  labels: string[];
  data: number[];
  statusCounts: {
    AVAILABLE: number;
    IN_USE: number;
    MAINTENANCE: number;
    OUT_OF_SERVICE: number;
  };
  total: number;
  active: number;
  utilizationRate: number;
  topEquipment: Array<{
    name: string;
    type: string;
    totalOrders: number;
  }>;
}

interface EquipmentUtilizationChartProps {
  data?: EquipmentData;
  loading?: boolean;
  error?: string;
}

export const EquipmentUtilizationChart: React.FC<EquipmentUtilizationChartProps> = ({ 
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
            label: 'Ekipman Sayısı',
            data: data.data,
            backgroundColor: [
              'rgba(38, 38, 38, 0.9)',    // Available - Dark Gray
              'rgba(64, 64, 64, 0.9)',    // In Use - Gray
              'rgba(115, 115, 115, 0.9)', // Maintenance - Medium Gray
              'rgba(163, 163, 163, 0.9)', // Out of Service - Light Gray
            ],
            borderColor: [
              'rgb(38, 38, 38)',
              'rgb(64, 64, 64)',
              'rgb(115, 115, 115)',
              'rgb(163, 163, 163)',
            ],
            borderWidth: 2,
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
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
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
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ekipman Kullanımı</h3>
          <Activity className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ekipman Kullanımı</h3>
          <Activity className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex items-center justify-center h-64 text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !chartData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ekipman Kullanımı</h3>
          <Activity className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Veri bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Ekipman Kullanımı</h3>
          <p className="text-sm text-neutral-500 mt-1">Mevcut durum analizi</p>
        </div>
        <Activity className="w-5 h-5 text-neutral-700" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Toplam Ekipman</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">
                {data.total}
              </p>
            </div>
            <Activity className="w-8 h-8 text-neutral-700" />
          </div>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Kullanım Oranı</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">
                {data.utilizationRate}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-neutral-700" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Top Equipment List */}
      {data.topEquipment && data.topEquipment.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">
            En Çok Kullanılan Ekipmanlar
          </h4>
          <div className="space-y-2">
            {data.topEquipment.map((equipment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-900 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{equipment.name}</p>
                    <p className="text-xs text-neutral-500">{equipment.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-neutral-900">
                    {equipment.totalOrders}
                  </p>
                  <p className="text-xs text-neutral-500">sipariş</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Legend with Counts */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neutral-900"></div>
          <span className="text-sm text-neutral-600">
            Kullanılabilir: <span className="font-semibold">{data.statusCounts.AVAILABLE}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
          <span className="text-sm text-neutral-600">
            Kullanımda: <span className="font-semibold">{data.statusCounts.IN_USE}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neutral-500"></div>
          <span className="text-sm text-neutral-600">
            Bakımda: <span className="font-semibold">{data.statusCounts.MAINTENANCE}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neutral-300"></div>
          <span className="text-sm text-neutral-600">
            Servis Dışı: <span className="font-semibold">{data.statusCounts.OUT_OF_SERVICE}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default EquipmentUtilizationChart;
