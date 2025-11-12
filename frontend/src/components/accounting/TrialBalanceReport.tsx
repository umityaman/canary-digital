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
import { card, button, DESIGN_TOKENS, statCardIcon, cx, input } from '../../styles/design-tokens';

// Hardcoded table cell classes (to avoid bundling issues)
const TABLE_HEADER_CELL = 'px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider bg-neutral-50'
const TABLE_BODY_CELL = 'px-6 py-4 text-sm text-neutral-900'
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
      toast.error('Mizan raporu yï¿½klenemedi');
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
      toast.error('Excel export baï¿½arï¿½sï¿½z oldu');
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
      ASSET: 'text-neutral-900',
      LIABILITY: 'text-neutral-900',
      EQUITY: 'text-neutral-900',
      REVENUE: 'text-neutral-900',
      EXPENSE: 'text-orange-600',
    };
    return colors[type] || 'text-neutral-600';
  };

  const getAccountTypeName = (type: string): string => {
    const names: Record<string, string> = {
      ASSET: 'Varlï¿½k',
      LIABILITY: 'Borï¿½',
      EQUITY: 'ï¿½zkaynak',
      REVENUE: 'Gelir',
      EXPENSE: 'Gider',
    };
    return names[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex justify-end items-center gap-2">
        <button onClick={loadTrialBalance} className={cx(button('md', 'outline', 'lg'), 'gap-2')}>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={card('sm', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <div className={statCardIcon('primary')}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.lg} text-neutral-900 mb-1`}>
            {formatCurrency(summary.totalDebit)}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Toplam Borç
          </p>
        </div>

        <div className={card('sm', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <div className={statCardIcon('primary')}>
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.lg} text-neutral-900 mb-1`}>
            {formatCurrency(summary.totalCredit)}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Toplam Alacak
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
              summary.difference === 0 ? 'text-neutral-900' : 'text-neutral-900'
            } mb-1`}
          >
            {formatCurrency(Math.abs(summary.difference))}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Fark
          </p>
        </div>

        <div className={card('sm', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <div className={statCardIcon('primary')}>
              <Scale className="w-4 h-4 text-white" />
            </div>
          </div>
          <p
            className={`${DESIGN_TOKENS?.typography?.stat.lg} ${
              summary.isBalanced ? 'text-neutral-900' : 'text-neutral-900'
            } mb-1`}
          >
            {summary.isBalanced ? '?' : '?'}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
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
              className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Baï¿½langï¿½ï¿½ Tarihi
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
            />
          </div>

          <div>
            <label
              className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Bitiï¿½ Tarihi
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
            />
          </div>

          <div>
            <label
              className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}
            >
              <Filter className="w-4 h-4 inline mr-1" />
              Hesap Tipi
            </label>
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className={input('md', 'default', undefined, 'lg')}
            >
              <option value="ALL">Tï¿½mï¿½</option>
              <option value="ASSET">Varlï¿½k</option>
              <option value="LIABILITY">Borï¿½</option>
              <option value="EQUITY">ï¿½zkaynak</option>
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
                className="w-4 h-4 text-neutral-900 rounded focus:ring-2 focus:ring-neutral-500"
              />
              <span className={`${DESIGN_TOKENS?.typography?.body.sm}`}>
                Sï¿½fï¿½r bakiye gï¿½ster
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className={card('md', 'md', 'default', 'lg')}>
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`${DESIGN_TOKENS?.typography?.heading.h4} ${DESIGN_TOKENS?.colors?.text.primary}`}
          >
            Hesap Detaylarï¿½
          </h3>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <FileSpreadsheet className="w-4 h-4" />
            <span>{items.length} hesap</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Seï¿½ilen kriterlere uygun kayï¿½t bulunamadï¿½</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead >
                <tr>
                  <th className={TABLE_HEADER_CELL}>
                    Hesap Kodu
                  </th>
                  <th className={TABLE_HEADER_CELL}>
                    Hesap Adï¿½
                  </th>
                  <th className={`${TABLE_HEADER_CELL} text-center`}>
                    Tip
                  </th>
                  <th className={`${TABLE_HEADER_CELL} text-right`}>
                    Borï¿½
                  </th>
                  <th className={`${TABLE_HEADER_CELL} text-right`}>
                    Alacak
                  </th>
                  <th className={`${TABLE_HEADER_CELL} text-right`}>
                    Bakiye
                  </th>
                </tr>
              </thead>
              <tbody >
                {items.map((item, idx) => {
                  const balance = item.debit - item.credit;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className={TABLE_BODY_CELL}>
                        <span className="font-mono text-sm font-medium text-neutral-900">
                          {item.accountCode}
                        </span>
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <p className="text-sm text-neutral-900 font-medium">
                          {item.accountName}
                        </p>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-center`}>
                        <span
                          className={`text-xs font-medium ${getAccountTypeColor(
                            item.accountType
                          )}`}
                        >
                          {getAccountTypeName(item.accountType)}
                        </span>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-right`}>
                        <span className="text-sm text-neutral-900 font-medium">
                          {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                        </span>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-right`}>
                        <span className="text-sm text-neutral-900 font-medium">
                          {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                        </span>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-right`}>
                        <span
                          className={`text-sm font-bold ${
                            balance > 0
                              ? 'text-neutral-900'
                              : balance < 0
                              ? 'text-neutral-900'
                              : 'text-neutral-600'
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
              <tfoot className="bg-neutral-100 border-t-2 border-neutral-300">
                <tr className="font-bold">
                  <td colSpan={3} className="px-4 py-3 text-right text-sm">
                    TOPLAM:
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-900">
                    {formatCurrency(summary.totalDebit)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-900">
                    {formatCurrency(summary.totalCredit)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        summary.difference === 0 ? 'text-neutral-900' : 'text-neutral-900'
                      }
                    >
                      {summary.isBalanced ? '? Dengede' : '? Dengesiz'}
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
        <div className="bg-neutral-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-neutral-50 rounded-full flex items-center justify-center">
                <span className="text-neutral-900 text-lg font-bold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-neutral-900 font-semibold mb-1">Mizan Dengesi Uyuï¿½muyor</h4>
              <p className="text-neutral-900 text-sm mb-2">
                Toplam borï¿½ ve alacak tutarlarï¿½ eï¿½it deï¿½il. Fark:{' '}
                {formatCurrency(Math.abs(summary.difference))}
              </p>
              <p className="text-neutral-900 text-xs">
                Lï¿½tfen yevmiye kayï¿½tlarï¿½nï¿½zï¿½ kontrol edin. Her kayï¿½tta borï¿½ ve alacak
                toplamlarï¿½ eï¿½it olmalï¿½dï¿½r.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




