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
import { card, button, DESIGN_TOKENS, statCardIcon, tableHeaderCell, tableBodyCell, cx, input } from '../../styles/design-tokens';
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Actions Bar */}
      <div className="flex justify-end items-center gap-2">
        <button onClick={loadIncomeStatement} className={cx(button('md', 'outline', 'lg'), 'gap-2')}>
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
        <button onClick={handlePrint} className={cx(button('md', 'outline', 'lg'), 'gap-2')}>
          <Eye className="w-4 h-4" />
          Yazdır
        </button>
        <button onClick={handleExport} className={cx(button('md', 'primary', 'lg'), 'gap-2')}>
          <Download className="w-4 h-4" />
          Excel İndir
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        <div className={card('sm', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <div className={statCardIcon('primary')}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.lg} text-neutral-900 mb-1`}>
            {formatCurrency(data.summary.totalRevenue)}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Toplam Gelir
          </p>
        </div>

        <div className={card('sm', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <div className={statCardIcon('primary')}>
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.lg} text-neutral-900 mb-1`}>
            {formatCurrency(data.summary.totalExpense)}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Toplam Gider
          </p>
        </div>

        <div className={card('sm', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <div className={statCardIcon('primary')}>
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
          </div>
          <p
            className={`${DESIGN_TOKENS?.typography?.stat.lg} ${
              data.summary.grossProfit >= 0 ? 'text-neutral-900' : 'text-neutral-900'
            } mb-1`}
          >
            {formatCurrency(Math.abs(data.summary.grossProfit))}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Brüt Kar/Zarar
          </p>
        </div>

        <div className={card('sm', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <div className={statCardIcon('primary')}>
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>
          <p
            className={`${DESIGN_TOKENS?.typography?.stat.lg} ${
              isProfitable ? 'text-neutral-900' : 'text-neutral-900'
            } mb-1`}
          >
            {formatCurrency(Math.abs(data.summary.netProfit))}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Net Kar/Zarar
          </p>
        </div>

        <div className={card('sm', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <div className={statCardIcon('primary')}>
              <PieChart className="w-4 h-4 text-white" />
            </div>
          </div>
          <p
            className={`${DESIGN_TOKENS?.typography?.stat.lg} ${
              data.summary.profitMargin >= 0 ? 'text-neutral-900' : 'text-neutral-900'
            } mb-1`}
          >
            {formatPercentage(data.summary.profitMargin)}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
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
              className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={input('md', 'default', undefined, 'lg')}
            />
          </div>

          <div>
            <label
              className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={input('md', 'default', undefined, 'lg')}
            />
          </div>

          <div>
            <label
              className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}
            >
              Görünüm Tipi
            </label>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as 'detailed' | 'summary')}
              className={input('md', 'default', undefined, 'lg')}
            >
              <option value="detailed">Detaylı</option>
              <option value="summary">Özet</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Section */}
          <div className={card('md', 'md', 'default', 'lg')}>
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`${DESIGN_TOKENS?.typography?.heading.h4} ${DESIGN_TOKENS?.colors?.text.primary}`}
              >
                Gelirler (Revenue)
              </h3>
              <span className="text-neutral-900 font-bold text-lg">
                {formatCurrency(data.summary.totalRevenue)}
              </span>
            </div>

            {data.revenues.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Gelir kaydı bulunamadı</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.revenues.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 px-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">
                        {item.accountName}
                      </p>
                      {viewType === 'detailed' && (
                        <p className="text-xs text-neutral-500 font-mono">
                          {item.accountCode}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900">
                        {formatCurrency(item.amount)}
                      </p>
                      {viewType === 'detailed' && (
                        <p className="text-xs text-neutral-500">
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
                className={`${DESIGN_TOKENS?.typography?.heading.h4} ${DESIGN_TOKENS?.colors?.text.primary}`}
              >
                Giderler (Expenses)
              </h3>
              <span className="text-neutral-900 font-bold text-lg">
                {formatCurrency(data.summary.totalExpense)}
              </span>
            </div>

            {data.expenses.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Gider kaydı bulunamadı</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.expenses.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 px-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">
                        {item.accountName}
                      </p>
                      {viewType === 'detailed' && (
                        <p className="text-xs text-neutral-500 font-mono">
                          {item.accountCode}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900">
                        {formatCurrency(item.amount)}
                      </p>
                      {viewType === 'detailed' && (
                        <p className="text-xs text-neutral-500">
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
          isProfitable ? 'bg-neutral-50 border-green-200' : 'bg-neutral-50 border-red-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isProfitable ? 'bg-neutral-50' : 'bg-neutral-50'
            }`}
          >
            {isProfitable ? (
              <TrendingUp className="w-6 h-6 text-neutral-900" />
            ) : (
              <TrendingDown className="w-6 h-6 text-neutral-900" />
            )}
          </div>
          <div className="flex-1">
            <h4
              className={`text-lg font-bold mb-1 ${
                isProfitable ? 'text-neutral-900' : 'text-neutral-900'
              }`}
            >
              {isProfitable ? 'Kar (Profit)' : 'Zarar (Loss)'}
            </h4>
            <p className={`text-sm ${isProfitable ? 'text-neutral-900' : 'text-neutral-900'}`}>
              Dönem sonucu: {formatCurrency(Math.abs(data.summary.netProfit))}
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-3xl font-bold ${
                isProfitable ? 'text-neutral-900' : 'text-neutral-900'
              }`}
            >
              {isProfitable ? '+' : '-'}
              {formatCurrency(Math.abs(data.summary.netProfit))}
            </p>
            <p className={`text-sm ${isProfitable ? 'text-neutral-900' : 'text-neutral-900'}`}>
              Kar Marjı: {formatPercentage(data.summary.profitMargin)}
            </p>
          </div>
        </div>
      </div>

      {/* Period Info */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-neutral-900 mt-0.5" />
          <div>
            <h4 className="text-neutral-900 font-semibold mb-1">Rapor Dönemi</h4>
            <p className="text-neutral-900 text-sm">
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
            <p className="text-neutral-900 text-xs mt-1">
              Bu rapor seçilen tarih aralığındaki tüm gelir ve gider Hesaplarını içerir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


