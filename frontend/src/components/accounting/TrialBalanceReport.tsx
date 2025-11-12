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
      toast.error('Mizan raporu y�klenemedi');
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
      toast.error('Excel export ba�ar�s�z oldu');
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
      ASSET: 'Varl�k',
      LIABILITY: 'Bor�',
      EQUITY: '�zkaynak',
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
            className={`${DESIGN_TOKENS?.typography?.heading.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}
          >
            Mizan Raporu (Trial Balance)
          </h2>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.secondary} mt-1`}
          >
            Hesap baz�nda bor�-alacak dengesi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadTrialBalance} className={cx(button('md', 'outline', 'lg'), 'gap-2')}>
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
          <button onClick={handlePrint} className={cx(button('md', 'outline', 'lg'), 'gap-2')}>
            <Eye className="w-4 h-4" />
            Yazd�r
          </button>
          <button onClick={handleExport} className={cx(button('md', 'primary', 'lg'), 'gap-2')}>
            <Download className="w-4 h-4" />
            Excel �ndir
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={card('sm', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <div className={statCardIcon('success')}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.lg} text-green-600 mb-1`}>
            {formatCurrency(summary.totalDebit)}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Toplam Bor�
          </p>
        </div>

        <div className={card('sm', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <div className={statCardIcon('error')}>
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.lg} text-red-600 mb-1`}>
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
            <div className={statCardIcon('warning')}>
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>
          <p
            className={`${DESIGN_TOKENS?.typography?.stat.lg} ${
              summary.difference === 0 ? 'text-green-600' : 'text-red-600'
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
            <div className={statCardIcon('info')}>
              <Scale className="w-4 h-4 text-white" />
            </div>
          </div>
          <p
            className={`${DESIGN_TOKENS?.typography?.stat.lg} ${
              summary.isBalanced ? 'text-green-600' : 'text-red-600'
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
              Ba�lang�� Tarihi
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
              className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Biti� Tarihi
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
              <option value="ALL">T�m�</option>
              <option value="ASSET">Varl�k</option>
              <option value="LIABILITY">Bor�</option>
              <option value="EQUITY">�zkaynak</option>
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
              <span className={`${DESIGN_TOKENS?.typography?.body.sm}`}>
                S�f�r bakiye g�ster
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
            Hesap Detaylar�
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
            <p>Se�ilen kriterlere uygun kay�t bulunamad�</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={DESIGN_TOKENS?.table?.header}>
                <tr>
                  <th className={TABLE_HEADER_CELL}>
                    Hesap Kodu
                  </th>
                  <th className={TABLE_HEADER_CELL}>
                    Hesap Ad�
                  </th>
                  <th className={`${TABLE_HEADER_CELL} text-center`}>
                    Tip
                  </th>
                  <th className={`${TABLE_HEADER_CELL} text-right`}>
                    Bor�
                  </th>
                  <th className={`${TABLE_HEADER_CELL} text-right`}>
                    Alacak
                  </th>
                  <th className={`${TABLE_HEADER_CELL} text-right`}>
                    Bakiye
                  </th>
                </tr>
              </thead>
              <tbody className={DESIGN_TOKENS?.table?.body}>
                {items.map((item, idx) => {
                  const balance = item.debit - item.credit;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className={TABLE_BODY_CELL}>
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {item.accountCode}
                        </span>
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <p className="text-sm text-gray-900 font-medium">
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
                        <span className="text-sm text-green-600 font-medium">
                          {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                        </span>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-right`}>
                        <span className="text-sm text-red-600 font-medium">
                          {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                        </span>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-right`}>
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg font-bold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-red-900 font-semibold mb-1">Mizan Dengesi Uyu�muyor</h4>
              <p className="text-red-700 text-sm mb-2">
                Toplam bor� ve alacak tutarlar� e�it de�il. Fark:{' '}
                {formatCurrency(Math.abs(summary.difference))}
              </p>
              <p className="text-red-600 text-xs">
                L�tfen yevmiye kay�tlar�n�z� kontrol edin. Her kay�tta bor� ve alacak
                toplamlar� e�it olmal�d�r.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

