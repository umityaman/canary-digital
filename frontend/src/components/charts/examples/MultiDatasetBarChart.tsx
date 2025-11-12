/**
 * Multi-Dataset Bar Chart Örneği
 * Kullanım: Yıllık karşılaştırma (2024 vs 2025)
 * Özellikler: Grouped bars, custom colors, legend
 */

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MultiDatasetBarChart() {
  const data = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    datasets: [
      {
        label: '2024 Gelir',
        data: [45000, 52000, 48000, 61000, 58000, 63000],
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: '2025 Gelir',
        data: [51000, 58000, 55000, 68000, 65000, 72000],
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // green-500
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#374151',
          font: { size: 12, weight: '500' },
          padding: 15,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Aylık Gelir Karşılaştırması (2024 vs 2025)',
        color: '#111827',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
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
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const percentage = context.datasetIndex === 1 && context.dataIndex < 6
              ? ((value / data.datasets[0].data[context.dataIndex] - 1) * 100).toFixed(1)
              : null;
            
            let text = `${label}: ₺${value.toLocaleString('tr-TR')}`;
            if (percentage && parseFloat(percentage) > 0) {
              text += ` (+${percentage}%)`;
            }
            return text;
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
          font: { size: 11 },
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <Bar data={data} options={options} />
      
      {/* Summary Statistics */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-neutral-600">2024 Toplam</p>
          <p className="text-2xl font-bold text-blue-600">
            ₺{data.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString('tr-TR')}
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-neutral-600">2025 Toplam</p>
          <p className="text-2xl font-bold text-green-600">
            ₺{data.datasets[1].data.reduce((a, b) => a + b, 0).toLocaleString('tr-TR')}
          </p>
        </div>
      </div>
    </div>
  );
}
