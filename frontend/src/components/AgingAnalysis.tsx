import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AgingBucket {
  label: string;
  minDays: number;
  maxDays: number | null;
  count: number;
  amount: number;
  items: any[];
}

interface AgingData {
  buckets: AgingBucket[];
  summary: {
    totalCount: number;
    totalAmount: number;
    [key: string]: number;
  };
}

interface AgingAnalysisProps {
  type: 'checks' | 'promissory-notes' | 'combined';
}

const AgingAnalysis: React.FC<AgingAnalysisProps> = ({ type }) => {
  const [data, setData] = useState<AgingData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgingData();
  }, [type]);

  const fetchAgingData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/aging/${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch aging data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching aging data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const exportToExcel = () => {
    if (!data) return;

    const ws_data = [
      ['Yaşlandırma Raporu'],
      [],
      ['Dönem', 'Adet', 'Tutar (₺)'],
      ...data.buckets.map((bucket) => [
        bucket.label,
        bucket.count,
        bucket.amount.toFixed(2),
      ]),
      [],
      ['Toplam', data.summary.totalCount, data.summary.totalAmount.toFixed(2)],
      [],
      ['Detaylı Liste'],
      [],
    ];

    // Add detailed items
    data.buckets.forEach((bucket) => {
      if (bucket.items.length > 0) {
        ws_data.push([bucket.label]);
        ws_data.push(['No', 'Tutar', 'Vade', 'Kalan Gün', 'Durum']);
        bucket.items.forEach((item: any) => {
          ws_data.push([
            item.checkNumber || item.noteNumber || item.number,
            item.amount.toFixed(2),
            new Date(item.dueDate).toLocaleDateString('tr-TR'),
            item.daysUntilDue,
            item.status,
          ]);
        });
        ws_data.push([]);
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Yaşlandırma Raporu');
    XLSX.writeFile(wb, `yaşlandırma-raporu-${type}-${Date.now()}.xlsx`);
  };

  const exportToPDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Yaşlandırma Raporu', 14, 20);

    // Summary table
    doc.setFontSize(12);
    doc.text('Özet', 14, 30);

    const summaryData = data.buckets.map((bucket) => [
      bucket.label,
      bucket.count.toString(),
      formatCurrency(bucket.amount),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Dönem', 'Adet', 'Tutar']],
      body: [
        ...summaryData,
        ['Toplam', data.summary.totalCount.toString(), formatCurrency(data.summary.totalAmount)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Detailed items
    let currentY = (doc as any).lastAutoTable.finalY + 10;

    data.buckets.forEach((bucket) => {
      if (bucket.items.length > 0) {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(14);
        doc.text(bucket.label, 14, currentY);
        currentY += 5;

        const detailData = bucket.items.map((item: any) => [
          item.checkNumber || item.noteNumber || item.number,
          formatCurrency(item.amount),
          new Date(item.dueDate).toLocaleDateString('tr-TR'),
          `${item.daysUntilDue} gün`,
          item.status,
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['No', 'Tutar', 'Vade', 'Kalan Gün', 'Durum']],
          body: detailData,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      }
    });

    doc.save(`yaşlandırma-raporu-${type}-${Date.now()}.pdf`);
  };

  const getBarColor = (label: string) => {
    switch (label) {
      case '0-30 Gün':
        return '#10b981'; // Green
      case '31-60 Gün':
        return '#f59e0b'; // Yellow
      case '61-90 Gün':
        return '#ef4444'; // Orange-Red
      case '90+ Gün':
        return '#dc2626'; // Dark Red
      case 'Vadesi Geçmiş':
        return '#7f1d1d'; // Very Dark Red
      default:
        return '#6b7280'; // Gray
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-8">
        Veri yüklenirken bir hata oluştu.
      </div>
    );
  }

  const chartData = data.buckets.map((bucket) => ({
    name: bucket.label,
    tutar: bucket.amount,
    adet: bucket.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yaşlandırma Raporu</h2>
          <p className="text-sm text-gray-600 mt-1">
            Toplam: {data.summary.totalCount} belge - {formatCurrency(data.summary.totalAmount)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Yaşlandırma Dağılımı</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === 'tutar') return formatCurrency(value);
                return value;
              }}
              labelFormatter={(label) => `Dönem: ${label}`}
            />
            <Legend
              formatter={(value) => {
                if (value === 'tutar') return 'Tutar (₺)';
                if (value === 'adet') return 'Adet';
                return value;
              }}
            />
            <Bar dataKey="tutar" name="tutar">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {data.buckets.map((bucket, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow"
            style={{ borderLeft: `4px solid ${getBarColor(bucket.label)}` }}
          >
            <div className="text-sm font-medium text-gray-600">{bucket.label}</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {bucket.count}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatCurrency(bucket.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Detaylı Liste</h3>
        </div>
        <div className="overflow-x-auto">
          {data.buckets.map((bucket, bucketIndex) => (
            bucket.items.length > 0 && (
              <div key={bucketIndex} className="border-b border-gray-200">
                <div className="px-6 py-3 bg-gray-50">
                  <h4 className="font-medium text-gray-900">
                    {bucket.label} ({bucket.count} belge - {formatCurrency(bucket.amount)})
                  </h4>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vade Tarihi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kalan/Geçen Gün
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      {type === 'combined' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tür
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bucket.items.map((item: any, itemIndex: number) => (
                      <tr key={itemIndex} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.checkNumber || item.noteNumber || item.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.dueDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`${
                              item.daysUntilDue < 0
                                ? 'text-red-600 font-semibold'
                                : 'text-gray-900'
                            }`}
                          >
                            {item.daysUntilDue < 0
                              ? `${Math.abs(item.daysUntilDue)} gün geçmiş`
                              : `${item.daysUntilDue} gün kaldı`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'portfolio'
                                ? 'bg-blue-100 text-blue-800'
                                : item.status === 'deposited'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        {type === 'combined' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.type === 'check'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {item.type === 'check' ? 'Çek' : 'Senet'}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgingAnalysis;
