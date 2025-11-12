import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { card, button, DESIGN_TOKENS, statCardIcon, tableHeaderCell, tableBodyCell, cx, input } from '../../styles/design-tokens';
import { exportBalanceSheetToExcel } from '../../utils/excelExport';

interface BalanceSheetItem {
  accountCode: string;
  accountName: string;
  amount: number;
  percentage: number;
  children?: BalanceSheetItem[];
}

interface BalanceSheetData {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equity: BalanceSheetItem[];
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
    difference: number;
  };
}

export default function BalanceSheetReport() {
  const [data, setData] = useState<BalanceSheetData>({
    assets: [],
    liabilities: [],
    equity: [],
    summary: {
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalLiabilitiesAndEquity: 0,
      isBalanced: true,
      difference: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['assets', 'liabilities', 'equity']));

  useEffect(() => {
    loadBalanceSheet();
  }, [reportDate]);

  const loadBalanceSheet = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        date: reportDate,
      });

      const response = await fetch(`/api/accounting/reports/balance-sheet?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load balance sheet');
      }

      const responseData = await response.json();
      setData(responseData.data || responseData);
    } catch (error: any) {
      console.error('Failed to load balance sheet:', error);
      toast.error('Bilanço yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      exportBalanceSheetToExcel(
        data.assets,
        data.liabilities,
        data.equity,
        data.summary,
        reportDate
      );
      toast.success('Bilanço Excel olarak indirildi');
    } catch (error) {
      toast.error('Excel export başarısız oldu');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const renderAccountItem = (item: BalanceSheetItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.accountCode);

    return (
      <div key={item.accountCode}>
        <div
          className={`flex justify-between items-center py-2 px-3 hover:bg-neutral-50 transition-colors ${
            level > 0 ? 'border-l-2 border-neutral-200' : ''
          }`}
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleSection(item.accountCode)}
                className="p-1 hover:bg-neutral-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-neutral-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                )}
              </button>
            )}
            <div className="flex-1">
              <p
                className={`text-sm ${
                  level === 0 ? 'font-bold text-neutral-900' : 'font-medium text-neutral-700'
                }`}
              >
                {item.accountName}
              </p>
              <p className="text-xs text-gray-500 font-mono">{item.accountCode}</p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`text-sm ${
                level === 0 ? 'font-bold text-neutral-900' : 'font-medium text-neutral-700'
              }`}
            >
              {formatCurrency(item.amount)}
            </p>
            <p className="text-xs text-gray-500">{formatPercentage(item.percentage)}</p>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>{item.children!.map((child) => renderAccountItem(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex justify-end items-center gap-2">
        <button onClick={loadBalanceSheet} className={cx(button('md', 'outline', 'lg'), 'gap-2')}>
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
        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-8 h-8 text-neutral-900" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.lg} text-neutral-900 mb-1`}>
            {formatCurrency(data.summary.totalAssets)}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Toplam Varlıklar
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-neutral-800" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.lg} text-neutral-900 mb-1`}>
            {formatCurrency(data.summary.totalLiabilities)}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Toplam Borçlar
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-neutral-700" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.lg} text-neutral-900 mb-1`}>
            {formatCurrency(data.summary.totalEquity)}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            Özkaynak
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <Scale className="w-8 h-8 text-neutral-600" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.lg} text-neutral-900 mb-1`}>
            {data.summary.isBalanced ? '✓' : '✗'}
          </p>
          <p
            className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}
          >
            {data.summary.isBalanced ? 'Dengede' : 'Dengesiz'}
          </p>
        </div>
      </div>

      {/* Report Date */}
      <div className={card('md', 'md', 'default', 'lg')}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label
              className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Rapor Tarihi
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-600 mb-1">Bilanço Denklemi:</p>
            <p className="text-lg font-mono font-bold text-neutral-900">
              Varlıklar = Borçlar + Özkaynak
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets Section */}
          <div className={card('md', 'md', 'default', 'lg')}>
            <div className="border-b border-neutral-200 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <h3
                  className={`${DESIGN_TOKENS?.typography?.heading.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}
                >
                  Varlıklar (Assets)
                </h3>
                <button
                  onClick={() => toggleSection('assets')}
                  className="p-1 hover:bg-neutral-100 rounded"
                >
                  {expandedSections.has('assets') ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-neutral-900 font-bold text-xl mt-1">
                {formatCurrency(data.summary.totalAssets)}
              </p>
            </div>

            {expandedSections.has('assets') && (
              <div className="space-y-1">
                {data.assets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Varlık kaydı bulunamadı</p>
                  </div>
                ) : (
                  data.assets.map((item) => renderAccountItem(item))
                )}
              </div>
            )}
          </div>

          {/* Liabilities & Equity Section */}
          <div className="space-y-6">
            {/* Liabilities */}
            <div className={card('md', 'md', 'default', 'lg')}>
              <div className="border-b border-neutral-200 pb-3 mb-4">
                <div className="flex items-center justify-between">
                  <h3
                    className={`${DESIGN_TOKENS?.typography?.heading.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}
                  >
                    Borçlar (Liabilities)
                  </h3>
                  <button
                    onClick={() => toggleSection('liabilities')}
                    className="p-1 hover:bg-neutral-100 rounded"
                  >
                    {expandedSections.has('liabilities') ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-neutral-900 font-bold text-xl mt-1">
                  {formatCurrency(data.summary.totalLiabilities)}
                </p>
              </div>

              {expandedSections.has('liabilities') && (
                <div className="space-y-1">
                  {data.liabilities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Borç kaydı bulunamadı</p>
                    </div>
                  ) : (
                    data.liabilities.map((item) => renderAccountItem(item))
                  )}
                </div>
              )}
            </div>

            {/* Equity */}
            <div className={card('md', 'md', 'default', 'lg')}>
              <div className="border-b border-neutral-200 pb-3 mb-4">
                <div className="flex items-center justify-between">
                  <h3
                    className={`${DESIGN_TOKENS?.typography?.heading.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}
                  >
                    Özkaynak (Equity)
                  </h3>
                  <button
                    onClick={() => toggleSection('equity')}
                    className="p-1 hover:bg-neutral-100 rounded"
                  >
                    {expandedSections.has('equity') ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-neutral-900 font-bold text-xl mt-1">
                  {formatCurrency(data.summary.totalEquity)}
                </p>
              </div>

              {expandedSections.has('equity') && (
                <div className="space-y-1">
                  {data.equity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Özkaynak kaydı bulunamadı</p>
                    </div>
                  ) : (
                    data.equity.map((item) => renderAccountItem(item))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Balance Equation Verification */}
      <div className={`${card('md', 'md', 'default', 'lg')} bg-neutral-50 border-neutral-200`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-neutral-100">
            <Scale className="w-6 h-6 text-neutral-900" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-1 text-neutral-900">
              {data.summary.isBalanced ? 'Bilanço Dengede' : 'Bilanço Dengesiz'}
            </h4>
            <div className="flex items-center gap-4 text-sm text-neutral-700">
              <span>Varlıklar: {formatCurrency(data.summary.totalAssets)}</span>
              <span>=</span>
              <span>
                Borçlar + Özkaynak:{' '}
                {formatCurrency(data.summary.totalLiabilitiesAndEquity)}
              </span>
              {!data.summary.isBalanced && (
                <span className="font-bold">
                  (Fark: {formatCurrency(Math.abs(data.summary.difference))})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning if unbalanced */}
      {!data.summary.isBalanced && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-neutral-900 mt-0.5" />
            <div>
              <h4 className="text-neutral-900 font-semibold mb-1">Bilanço Dengesi Uyuşmuyor</h4>
              <p className="text-neutral-700 text-sm mb-2">
                Varlıklar toplamı, borçlar ve özkaynak toplamına eşit değil. Fark:{' '}
                {formatCurrency(Math.abs(data.summary.difference))}
              </p>
              <p className="text-neutral-600 text-xs">
                Lütfen hesap kayıtlarınızı ve yevmiye defterini kontrol edin. Muhasebenin
                temel denklemi: Varlıklar = Borçlar + Özkaynak
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Report Date Info */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-neutral-900 mt-0.5" />
          <div>
            <h4 className="text-neutral-900 font-semibold mb-1">Rapor Tarihi</h4>
            <p className="text-neutral-700 text-sm">
              {new Date(reportDate).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-neutral-600 text-xs mt-1">
              Bu bilanço, belirtilen tarih itibariyle şirketin finansal durumunu gösterir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

