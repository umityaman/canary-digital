/**
 * Pie Chart with Percentages Örneği
 * Kullanım: Revenue category breakdown
 * Özellikler: Custom colors, percentage labels, legend
 */

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChartWithPercentages() {
  const categoryData = [
    { name: 'Kamera Ekipmanları', value: 125000, color: '#3b82f6' },
    { name: 'Lens Kiralama', value: 89000, color: '#10b981' },
    { name: 'Işık Sistemi', value: 67000, color: '#f59e0b' },
    { name: 'Ses Ekipmanları', value: 45000, color: '#ef4444' },
    { name: 'Drone & Gimbal', value: 34000, color: '#8b5cf6' },
  ];

  const total = categoryData.reduce((sum, item) => sum + item.value, 0);

  const data = {
    labels: categoryData.map((item) => item.name),
    datasets: [
      {
        label: 'Gelir',
        data: categoryData.map((item) => item.value),
        backgroundColor: categoryData.map((item) => item.color),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          color: '#374151',
          font: { size: 12, weight: '500' },
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      title: {
        display: true,
        text: 'Kategorilere Göre Gelir Dağılımı',
        color: '#111827',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ₺${value.toLocaleString('tr-TR')} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <Pie data={data} options={options} />

      {/* Category Details */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-semibold text-neutral-700 mb-3">Detaylı Dağılım</h4>
        {categoryData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-neutral-600">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-900">
                  ₺{item.value.toLocaleString('tr-TR')}
                </p>
                <p className="text-xs text-gray-500">{percentage}%</p>
              </div>
            </div>
          );
        })}
        <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-700">Toplam</span>
          <span className="text-lg font-bold text-neutral-900">
            ₺{total.toLocaleString('tr-TR')}
          </span>
        </div>
      </div>
    </div>
  );
}
