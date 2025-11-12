/**
 * Simple Line Chart Örneği
 * Kullanım: Revenue trend gösterimi için
 * Özellikler: Smooth curves, filled area, responsive
 */

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

// Chart.js componentlerini kaydet
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

export default function SimpleLineChart() {
  // Sample data - Son 7 günlük gelir
  const data = {
    labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
    datasets: [
      {
        label: 'Günlük Gelir (₺)',
        data: [12500, 18000, 15500, 21000, 19500, 23000, 17000],
        borderColor: 'rgb(59, 130, 246)', // Tailwind blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4, // Smooth curve
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Chart options
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
        text: 'Son 7 Günlük Gelir Trendi',
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
        borderColor: '#ddd',
        borderWidth: 1,
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
            return '₺' + value.toLocaleString('tr-TR');
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <Line data={data} options={options} />
    </div>
  );
}
