import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  PieChart,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { card, button, DESIGN_TOKENS } from '../../styles/design-tokens';
import { exportIncomeStatementToExcel } from '../../utils/excelExport';

interface IncomeStatementItem {
  accountCode: string;
  accountName: string;
  amount: number;
  percentage: number;
}

interface IncomeStatementData {
  revenues: IncomeStatementItem[];
  expenses: IncomeStatementItem[];
  summary: {
    totalRevenue: number;
    totalExpense: number;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
  };
}

export default function IncomeStatementReport() {
  const [data, setData] = useState<IncomeStatementData>({
    revenues: [],
    expenses: [],
    summary: {
      totalRevenue: 0,
      totalExpense: 0,
      grossProfit: 0,
      netProfit: 0,
      profitMargin: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [viewType, setViewType] = useState<'detailed' | 'summary'>('detailed');

  useEffect(() => {
    loadIncomeStatement();
  }, [dateFrom, dateTo]);

  const loadIncomeStatement = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        startDate: dateFrom,
        endDate: dateTo,
      });

      const response = await fetch(`/api/accounting/reports/income-statement?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load income statement');
      }

      const responseData = await response.json();
      setData(responseData.data || responseData);
    } catch (error: any) {
      console.error('Failed to load income statement:', error);
      toast.error('Gelir-Gider Tablosu yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      exportIncomeStatementToExcel(
        data.revenues,
        data.expenses,
        data.summary,
        { from: dateFrom, to: dateTo }
      );
      toast.success('Gelir-Gider tablosu Excel olarak indirildi');
    } catch (error) {
      toast.error('Excel export başarısız oldu');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const isProfitable = data.summary.netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2
            className={`${DESIGN_TOKENS.typography.heading.h2} ${DESIGN_TOKENS.colors.text.primary}`}
          >
            Gelir-Gider Tablosu (Income Statement)
          </h2>
          <p
            className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.secondary} mt-1`}
          >
            Dönemsel gelir ve gider analizi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadIncomeStatement} className={button('secondary', 'md', 'md')}>
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
          <button onClick={handlePrint} className={button('secondary', 'md', 'md')}>
            <Eye className="w-4 h-4" />
            Yazdır
          </button>
          <button onClick={handleExport} className={button('primary', 'md', 'md')}>
            <Download className="w-4 h-4" />
            Excel İndir
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className={`${DESIGN_TOKENS.typography.stat.lg} text-green-600 mb-1`}>
            {formatCurrency(data.summary.totalRevenue)}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Toplam Gelir
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <p className={`${DESIGN_TOKENS.typography.stat.lg} text-red-600 mb-1`}>
            {formatCurrency(data.summary.totalExpense)}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Toplam Gider
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
          <p
            className={`${DESIGN_TOKENS.typography.stat.lg} ${
              data.summary.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'
            } mb-1`}
          >
            {formatCurrency(Math.abs(data.summary.grossProfit))}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Brüt Kar/Zarar
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
          <p
            className={`${DESIGN_TOKENS.typography.stat.lg} ${
              isProfitable ? 'text-green-600' : 'text-red-600'
            } mb-1`}
          >
            {formatCurrency(Math.abs(data.summary.netProfit))}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Net Kar/Zarar
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <PieChart className="w-8 h-8 text-orange-500" />
          </div>
          <p
            className={`${DESIGN_TOKENS.typography.stat.lg} ${
              data.summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
            } mb-1`}
          >
            {formatPercentage(data.summary.profitMargin)}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Kar Marjı
          </p>
        </div>
      </div>

      {/* Date Range & View Type */}
      <div className={card('md', 'md', 'default', 'lg')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              className={`block ${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.primary} mb-1`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              className={`block ${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.primary} mb-1`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              className={`block ${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.primary} mb-1`}
            >
              Görünüm Tipi
            </label>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as 'detailed' | 'summary')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="detailed">Detaylı</option>
              <option value="summary">Özet</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Section */}
          <div className={card('md', 'md', 'default', 'lg')}>
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`${DESIGN_TOKENS.typography.heading.h4} ${DESIGN_TOKENS.colors.text.primary}`}
              >
                Gelirler (Revenue)
              </h3>
              <span className="text-green-600 font-bold text-lg">
                {formatCurrency(data.summary.totalRevenue)}
              </span>
            </div>

            {data.revenues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Gelir kaydı bulunamadı</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.revenues.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 px-3 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.accountName}
                      </p>
                      {viewType === 'detailed' && (
                        <p className="text-xs text-gray-500 font-mono">
                          {item.accountCode}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(item.amount)}
                      </p>
                      {viewType === 'detailed' && (
                        <p className="text-xs text-gray-500">
                          {formatPercentage(item.percentage)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense Section */}
          <div className={card('md', 'md', 'default', 'lg')}>
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`${DESIGN_TOKENS.typography.heading.h4} ${DESIGN_TOKENS.colors.text.primary}`}
              >
                Giderler (Expenses)
              </h3>
              <span className="text-red-600 font-bold text-lg">
                {formatCurrency(data.summary.totalExpense)}
              </span>
            </div>

            {data.expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Gider kaydı bulunamadı</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.expenses.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 px-3 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.accountName}
                      </p>
                      {viewType === 'detailed' && (
                        <p className="text-xs text-gray-500 font-mono">
                          {item.accountCode}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {formatCurrency(item.amount)}
                      </p>
                      {viewType === 'detailed' && (
                        <p className="text-xs text-gray-500">
                          {formatPercentage(item.percentage)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profit/Loss Summary */}
      <div
        className={`${card('md', 'md', 'default', 'lg')} ${
          isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isProfitable ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {isProfitable ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <h4
              className={`text-lg font-bold mb-1 ${
                isProfitable ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {isProfitable ? 'Kar (Profit)' : 'Zarar (Loss)'}
            </h4>
            <p className={`text-sm ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>
              Dönem sonucu: {formatCurrency(Math.abs(data.summary.netProfit))}
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-3xl font-bold ${
                isProfitable ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isProfitable ? '+' : '-'}
              {formatCurrency(Math.abs(data.summary.netProfit))}
            </p>
            <p className={`text-sm ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
              Kar Marjı: {formatPercentage(data.summary.profitMargin)}
            </p>
          </div>
        </div>
      </div>

      {/* Period Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-blue-900 font-semibold mb-1">Rapor Dönemi</h4>
            <p className="text-blue-700 text-sm">
              {new Date(dateFrom).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              -{' '}
              {new Date(dateTo).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Bu rapor seçilen tarih aralığındaki tüm gelir ve gider hesaplarını içerir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
