import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

interface UtilizationData {
  date: string;
  utilizationRate: number;
  activeRentals: number;
  totalEquipment: number;
}

interface UtilizationChartProps {
  data: UtilizationData[];
  isLoading?: boolean;
}

const UtilizationChart: React.FC<UtilizationChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const avgUtilization =
    data.reduce((sum, item) => sum + item.utilizationRate, 0) / data.length;
  const maxUtilization = Math.max(...data.map((d) => d.utilizationRate));
  const currentUtilization = data[data.length - 1]?.utilizationRate || 0;

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-red-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBg = (rate: number) => {
    if (rate >= 80) return 'bg-red-50';
    if (rate >= 60) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const rate = payload[0].value;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            {format(new Date(payload[0].payload.date), 'dd MMM yyyy')}
          </p>
          <div className="space-y-1">
            <p className="text-xs">
              📊 Kullanım: <span className="font-semibold">{rate.toFixed(1)}%</span>
            </p>
            <p className="text-xs text-gray-600">
              🔧 Aktif: {payload[0].payload.activeRentals} /{' '}
              {payload[0].payload.totalEquipment}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">📊 Ekipman Kullanım Oranı</h3>
          <p className="text-xs text-gray-500 mt-1">
            Kiralanan ekipman yüzdesi (günlük)
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getUtilizationColor(currentUtilization)}`}>
            {currentUtilization.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Güncel Oran</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${getUtilizationBg(avgUtilization)}`}>
          <div className="text-xs text-gray-600 mb-1">Ortalama</div>
          <div className={`text-xl font-bold ${getUtilizationColor(avgUtilization)}`}>
            {avgUtilization.toFixed(1)}%
          </div>
        </div>
        <div className={`p-3 rounded-lg ${getUtilizationBg(maxUtilization)}`}>
          <div className="text-xs text-gray-600 mb-1">En Yüksek</div>
          <div className={`text-xl font-bold ${getUtilizationColor(maxUtilization)}`}>
            {maxUtilization.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Toplam Ekipman</div>
          <div className="text-xl font-bold text-gray-700">
            {data[data.length - 1]?.totalEquipment || 0}
          </div>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-xs font-semibold text-blue-800 mb-1">
              Performans İpucu
            </p>
            <p className="text-xs text-blue-700">
              {avgUtilization >= 80
                ? 'Kullanım çok yüksek! Yeni ekipman alımı düşünülebilir.'
                : avgUtilization >= 60
                ? 'İyi bir kullanım oranı! Mevcut kapasite yeterli.'
                : 'Düşük kullanım. Pazarlama ve fiyatlandırma stratejisi gözden geçirilebilir.'}
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), 'dd MMM')}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#e5e7eb"
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#e5e7eb"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="utilizationRate"
            name="Kullanım Oranı (%)"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UtilizationChart;
