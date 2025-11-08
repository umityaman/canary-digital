import React, { useState, useEffect } from 'react';
import {
  Scale,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { card, button, DESIGN_TOKENS } from '../../styles/design-tokens';
import { exportTrialBalanceToExcel } from '../../utils/excelExport';

interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
}

interface TrialBalanceSummary {
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
}

export default function TrialBalanceReport() {
  const [items, setItems] = useState<TrialBalanceItem[]>([]);
  const [summary, setSummary] = useState<TrialBalanceSummary>({
    totalDebit: 0,
    totalCredit: 0,
    difference: 0,
    isBalanced: true,
  });
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('ALL');
  const [showZeroBalances, setShowZeroBalances] = useState(false);

  useEffect(() => {
    loadTrialBalance();
  }, [dateFrom, dateTo, accountTypeFilter, showZeroBalances]);

  const loadTrialBalance = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (dateFrom) params.append('startDate', dateFrom);
      if (dateTo) params.append('endDate', dateTo);
      if (accountTypeFilter !== 'ALL') params.append('accountType', accountTypeFilter);
      params.append('includeZeroBalance', showZeroBalances.toString());

      const response = await fetch(`/api/accounting/reports/trial-balance?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load trial balance');
      }

      const data = await response.json();
      setItems(data.items || []);
      setSummary(data.summary || {
        totalDebit: 0,
        totalCredit: 0,
        difference: 0,
        isBalanced: true,
      });
    } catch (error: any) {
      console.error('Failed to load trial balance:', error);
      toast.error('Mizan raporu yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      exportTrialBalanceToExcel(items, summary, {
        from: dateFrom,
        to: dateTo,
      });
      toast.success('Mizan raporu Excel olarak indirildi');
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

  const getAccountTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      ASSET: 'text-green-600',
      LIABILITY: 'text-red-600',
      EQUITY: 'text-purple-600',
      REVENUE: 'text-blue-600',
      EXPENSE: 'text-orange-600',
    };
    return colors[type] || 'text-gray-600';
  };

  const getAccountTypeName = (type: string): string => {
    const names: Record<string, string> = {
      ASSET: 'Varlık',
      LIABILITY: 'Borç',
      EQUITY: 'Özkaynak',
      REVENUE: 'Gelir',
      EXPENSE: 'Gider',
    };
    return names[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2
            className={`${DESIGN_TOKENS.typography.heading.h2} ${DESIGN_TOKENS.colors.text.primary}`}
          >
            Mizan Raporu (Trial Balance)
          </h2>
          <p
            className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.secondary} mt-1`}
          >
            Hesap bazında borç-alacak dengesi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadTrialBalance} className={button('secondary', 'md', 'md')}>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className={`${DESIGN_TOKENS.typography.stat.lg} text-green-600 mb-1`}>
            {formatCurrency(summary.totalDebit)}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Toplam Borç
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <p className={`${DESIGN_TOKENS.typography.stat.lg} text-red-600 mb-1`}>
            {formatCurrency(summary.totalCredit)}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Toplam Alacak
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
          <p
            className={`${DESIGN_TOKENS.typography.stat.lg} ${
              summary.difference === 0 ? 'text-green-600' : 'text-red-600'
            } mb-1`}
          >
            {formatCurrency(Math.abs(summary.difference))}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Fark
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <Scale className="w-8 h-8 text-blue-500" />
          </div>
          <p
            className={`${DESIGN_TOKENS.typography.stat.lg} ${
              summary.isBalanced ? 'text-green-600' : 'text-red-600'
            } mb-1`}
          >
            {summary.isBalanced ? '✓' : '✗'}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            {summary.isBalanced ? 'Dengede' : 'Dengesiz'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={card('md', 'md', 'default', 'lg')}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Filter className="w-4 h-4 inline mr-1" />
              Hesap Tipi
            </label>
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Tümü</option>
              <option value="ASSET">Varlık</option>
              <option value="LIABILITY">Borç</option>
              <option value="EQUITY">Özkaynak</option>
              <option value="REVENUE">Gelir</option>
              <option value="EXPENSE">Gider</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showZeroBalances}
                onChange={(e) => setShowZeroBalances(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className={`${DESIGN_TOKENS.typography.body.sm}`}>
                Sıfır bakiye göster
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className={card('md', 'md', 'default', 'lg')}>
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`${DESIGN_TOKENS.typography.heading.h4} ${DESIGN_TOKENS.colors.text.primary}`}
          >
            Hesap Detayları
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileSpreadsheet className="w-4 h-4" />
            <span>{items.length} hesap</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Seçilen kriterlere uygun kayıt bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hesap Kodu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hesap Adı
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Tip
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Borç
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Alacak
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Bakiye
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, idx) => {
                  const balance = item.debit - item.credit;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {item.accountCode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 font-medium">
                          {item.accountName}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs font-medium ${getAccountTypeColor(
                            item.accountType
                          )}`}
                        >
                          {getAccountTypeName(item.accountType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-green-600 font-medium">
                          {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-red-600 font-medium">
                          {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-sm font-bold ${
                            balance > 0
                              ? 'text-green-600'
                              : balance < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {formatCurrency(Math.abs(balance))}
                          {balance > 0 ? ' B' : balance < 0 ? ' A' : ''}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr className="font-bold">
                  <td colSpan={3} className="px-4 py-3 text-right text-sm">
                    TOPLAM:
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    {formatCurrency(summary.totalDebit)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {formatCurrency(summary.totalCredit)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        summary.difference === 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {summary.isBalanced ? '✓ Dengede' : '✗ Dengesiz'}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Balance Warning */}
      {!summary.isBalanced && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg font-bold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-red-900 font-semibold mb-1">Mizan Dengesi Uyuşmuyor</h4>
              <p className="text-red-700 text-sm mb-2">
                Toplam borç ve alacak tutarları eşit değil. Fark:{' '}
                {formatCurrency(Math.abs(summary.difference))}
              </p>
              <p className="text-red-600 text-xs">
                Lütfen yevmiye kayıtlarınızı kontrol edin. Her kayıtta borç ve alacak
                toplamları eşit olmalıdır.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
