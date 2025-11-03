import { useState } from 'react';
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomerAging {
  customerId: number;
  customerName: string;
  totalDebt: number;
  current: number; // 0-30 days
  days30: number; // 31-60 days
  days60: number; // 61-90 days
  days90Plus: number; // 90+ days
  overdueAmount: number;
  currency: string;
}

interface AgingReportData {
  customers: CustomerAging[];
  summary: {
    totalDebt: number;
    totalCurrent: number;
    totalDays30: number;
    totalDays60: number;
    totalDays90Plus: number;
    customerCount: number;
  };
}

interface AgingReportTableProps {
  data: AgingReportData | null;
  loading?: boolean;
}

export default function AgingReportTable({ data, loading }: AgingReportTableProps) {
  const [sortField, setSortField] = useState<keyof CustomerAging>('totalDebt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatPercentage = (amount: number, total: number): string => {
    if (total === 0) return '0%';
    return `${((amount / total) * 100).toFixed(1)}%`;
  };

  const handleSort = (field: keyof CustomerAging) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedCustomers = () => {
    if (!data?.customers) return [];
    
    const sorted = [...data.customers].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal, 'tr') 
          : bVal.localeCompare(aVal, 'tr');
      }
      
      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    
    return sorted;
  };

  const getAgeGroupColor = (days: number): string => {
    if (days === 0) return 'bg-green-100 text-green-800'; // 0-30 days
    if (days === 30) return 'bg-yellow-100 text-yellow-800'; // 31-60 days
    if (days === 60) return 'bg-orange-100 text-orange-800'; // 61-90 days
    return 'bg-red-100 text-red-800'; // 90+ days
  };

  const handleExportExcel = () => {
    toast.success('Excel dışa aktarma özelliği yakında eklenecek');
    // TODO: Implement Excel export
  };

  const handleExportPDF = () => {
    toast.success('PDF dışa aktarma özelliği yakında eklenecek');
    // TODO: Implement PDF export
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || !data.customers || data.customers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">Yaşlandırma Verisi Bulunamadı</p>
        <p className="text-sm text-gray-500">
          Müşterilerinizin borç durumunu görmek için fatura ve tahsilat işlemlerini kaydedin.
        </p>
      </div>
    );
  }

  const sortedCustomers = getSortedCustomers();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Toplam</span>
          </div>
          <p className="text-2xl font-bold mb-1">{formatCurrency(data.summary.totalDebt)}</p>
          <p className="text-sm opacity-90">{data.summary.customerCount} Müşteri</p>
        </div>

        <div className="bg-white border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">0-30 Gün</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(data.summary.totalCurrent)}
          </p>
          <p className="text-sm text-gray-600">
            {formatPercentage(data.summary.totalCurrent, data.summary.totalDebt)}
          </p>
        </div>

        <div className="bg-white border-2 border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">31-60 Gün</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(data.summary.totalDays30)}
          </p>
          <p className="text-sm text-gray-600">
            {formatPercentage(data.summary.totalDays30, data.summary.totalDebt)}
          </p>
        </div>

        <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">61-90 Gün</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(data.summary.totalDays60)}
          </p>
          <p className="text-sm text-gray-600">
            {formatPercentage(data.summary.totalDays60, data.summary.totalDebt)}
          </p>
        </div>

        <div className="bg-white border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">90+ Gün</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(data.summary.totalDays90Plus)}
          </p>
          <p className="text-sm text-gray-600">
            {formatPercentage(data.summary.totalDays90Plus, data.summary.totalDebt)}
          </p>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Excel İndir
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FileText className="w-4 h-4" />
          PDF İndir
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th
                  onClick={() => handleSort('customerName')}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase cursor-pointer hover:bg-neutral-100"
                >
                  Müşteri
                  {sortField === 'customerName' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  onClick={() => handleSort('totalDebt')}
                  className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase cursor-pointer hover:bg-neutral-100"
                >
                  Toplam Borç
                  {sortField === 'totalDebt' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  onClick={() => handleSort('current')}
                  className="px-6 py-3 text-right text-xs font-medium text-green-700 uppercase cursor-pointer hover:bg-green-50"
                >
                  0-30 Gün
                  {sortField === 'current' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  onClick={() => handleSort('days30')}
                  className="px-6 py-3 text-right text-xs font-medium text-yellow-700 uppercase cursor-pointer hover:bg-yellow-50"
                >
                  31-60 Gün
                  {sortField === 'days30' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  onClick={() => handleSort('days60')}
                  className="px-6 py-3 text-right text-xs font-medium text-orange-700 uppercase cursor-pointer hover:bg-orange-50"
                >
                  61-90 Gün
                  {sortField === 'days60' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  onClick={() => handleSort('days90Plus')}
                  className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase cursor-pointer hover:bg-red-50"
                >
                  90+ Gün
                  {sortField === 'days90Plus' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {sortedCustomers.map((customer) => {
                const riskLevel =
                  customer.days90Plus > 0
                    ? 'critical'
                    : customer.days60 > 0
                    ? 'high'
                    : customer.days30 > 0
                    ? 'medium'
                    : 'low';

                return (
                  <tr
                    key={customer.customerId}
                    className={`hover:bg-neutral-50 transition-colors ${
                      riskLevel === 'critical'
                        ? 'bg-red-50/30'
                        : riskLevel === 'high'
                        ? 'bg-orange-50/30'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-gray-900">{customer.customerName}</p>
                          {customer.overdueAmount > 0 && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {formatCurrency(customer.overdueAmount)} vadesi geçmiş
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(customer.totalDebt)}</p>
                      <p className="text-xs text-gray-500">{customer.currency}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getAgeGroupColor(0)}`}>
                        {formatCurrency(customer.current)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatPercentage(customer.current, customer.totalDebt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getAgeGroupColor(30)}`}>
                        {formatCurrency(customer.days30)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatPercentage(customer.days30, customer.totalDebt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getAgeGroupColor(60)}`}>
                        {formatCurrency(customer.days60)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatPercentage(customer.days60, customer.totalDebt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getAgeGroupColor(90)}`}>
                        {formatCurrency(customer.days90Plus)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatPercentage(customer.days90Plus, customer.totalDebt)}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
