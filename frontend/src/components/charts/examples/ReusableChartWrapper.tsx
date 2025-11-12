/**
 * Reusable Chart Wrapper Component
 * Kullanım: Generic chart component for any chart type
 * Özellikler: Type-safe, reusable, error handling
 */

import React from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';

interface ChartWrapperProps {
  type: ChartType;
  title?: string;
  data: any;
  options?: any;
  loading?: boolean;
  error?: string | null;
  className?: string;
  showExport?: boolean;
  onExport?: (format: 'png' | 'csv') => void;
}

export default function ReusableChartWrapper({
  type,
  title,
  data,
  options = {},
  loading = false,
  error = null,
  className = '',
  showExport = false,
  onExport,
}: ChartWrapperProps) {
  // Select the appropriate chart component
  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie,
    doughnut: Doughnut,
  }[type];

  // Default options merged with custom options
  const defaultOptions = {
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
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
      },
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
    },
  };

  // Handle export
  const handleExport = (format: 'png' | 'csv') => {
    if (onExport) {
      onExport(format);
    } else {
      console.log(`Exporting chart as ${format}...`);
      // Default export logic could go here
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-neutral-200 ${className}`}>
      {/* Header */}
      {(title || showExport) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>}
          {showExport && (
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('png')}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                PNG
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
              >
                CSV
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-500 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Grafik yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-neutral-600">Grafik yüklenirken hata oluştu</p>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && (
        <div className="chart-container">
          <ChartComponent data={data} options={mergedOptions} />
        </div>
      )}
    </div>
  );
}

// Example usage:
export function ExampleUsage() {
  const lineData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs'],
    datasets: [
      {
        label: 'Gelir',
        data: [45000, 52000, 48000, 61000, 58000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };

  const barData = {
    labels: ['Kamera', 'Lens', 'Işık', 'Ses'],
    datasets: [
      {
        label: 'Kullanım',
        data: [85, 72, 68, 45],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <ReusableChartWrapper
        type="line"
        title="Aylık Gelir Trendi"
        data={lineData}
        showExport
        onExport={(format) => console.log(`Export as ${format}`)}
      />

      <ReusableChartWrapper
        type="bar"
        title="Ekipman Kullanımı"
        data={barData}
        loading={false}
      />

      <ReusableChartWrapper
        type="line"
        title="Yükleniyor..."
        data={lineData}
        loading={true}
      />

      <ReusableChartWrapper
        type="line"
        title="Hata Örneği"
        data={lineData}
        error="Veri yüklenemedi"
      />
    </div>
  );
}
