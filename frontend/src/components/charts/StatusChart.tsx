import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface StatusData {
  status: string;
  count: number;
  color: string;
}

interface StatusChartProps {
  data: StatusData[];
  isLoading?: boolean;
}

const StatusChart: React.FC<StatusChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const statusLabels: Record<string, string> = {
    PENDING: 'Beklemede',
    APPROVED: 'Onaylandı',
    ACTIVE: 'Aktif',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal Edildi',
  };

  const statusIcons: Record<string, string> = {
    PENDING: '⏳',
    APPROVED: '✅',
    ACTIVE: '🔄',
    COMPLETED: '✔️',
    CANCELLED: '❌',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            {statusIcons[payload[0].payload.status]}{' '}
            {statusLabels[payload[0].payload.status] || payload[0].payload.status}
          </p>
          <div className="space-y-1">
            <p className="text-xs">
              Sayı: <span className="font-semibold">{payload[0].value}</span>
            </p>
            <p className="text-xs text-gray-600">Oran: {percentage}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    const percentage = ((entry.count / total) * 100).toFixed(0);
    return `${percentage}%`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800">📋 Sipariş Durumu Dağılımı</h3>
        <p className="text-xs text-gray-500 mt-1">Mevcut siparişlerin durum analizi</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-xs text-blue-700 mb-1">Toplam Sipariş</div>
          <div className="text-3xl font-bold text-blue-600">{total}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-xs text-purple-700 mb-1">Aktif Durum</div>
          <div className="text-3xl font-bold text-purple-600">{data.length}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="count"
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-2">
        {data.map((item) => {
          const percentage = ((item.count / total) * 100).toFixed(1);
          return (
            <div
              key={item.status}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {statusIcons[item.status]} {statusLabels[item.status] || item.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-800">
                  {item.count} adet
                </span>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusChart;
