import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

interface EquipmentData {
  name: string;
  rentCount: number;
  revenue: number;
}

interface TopEquipmentChartProps {
  data: EquipmentData[];
  isLoading?: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
];

const TopEquipmentChart: React.FC<TopEquipmentChartProps> = ({ data, isLoading }) => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalRents = data.reduce((sum, item) => sum + item.rentCount, 0);
  const topPerformer = data[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            🔧 {payload[0].payload.name}
          </p>
          <div className="space-y-1">
            <p className="text-xs">
              📦 Kiralama: <span className="font-semibold">{payload[0].value} kez</span>
            </p>
            <p className="text-xs text-green-600">
              💰 Gelir: {formatCurrency(payload[0].payload.revenue)}
            </p>
            <p className="text-xs text-gray-500">
              Ort: {formatCurrency(payload[0].payload.revenue / payload[0].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800">🏆 En Popüler Ekipmanlar</h3>
        <p className="text-xs text-gray-500 mt-1">Kiralama sıklığına göre sıralama</p>
      </div>

      {topPerformer && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🥇</div>
              <div>
                <div className="text-sm font-bold text-gray-800">
                  {topPerformer.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  En çok kiralanan ekipman
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">
                {topPerformer.rentCount}
              </div>
              <div className="text-xs text-gray-600">kiralama</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Toplam Kiralama</div>
          <div className="text-xl font-bold text-blue-600">{totalRents}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Toplam Gelir</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#e5e7eb" />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            stroke="#e5e7eb"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Bar
            dataKey="rentCount"
            name="Kiralama Sayısı"
            radius={[0, 8, 8, 0]}
            animationDuration={1000}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-xs font-semibold text-blue-800 mb-1">Strateji Önerisi</p>
            <p className="text-xs text-blue-700">
              En popüler ekipmanlarınızın stoğunu artırarak daha fazla gelir elde
              edebilirsiniz. Ayrıca benzer ekipman yatırımları düşünülebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopEquipmentChart;
