import { useState, useEffect } from 'react';
import {
  Wallet,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Download,
  Eye,
  Plus,
  X,
  Save,
} from 'lucide-react';
import { apiClient } from '../../utils/api';
import toast from 'react-hot-toast';
import { card, button, input, DESIGN_TOKENS, cx } from '../../styles/design-tokens';

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountType: string;
  iban: string;
  branch: string | null;
  balance: number;
  availableBalance: number;
  blockedBalance: number;
  currency: string;
  isActive: boolean;
}

interface CashTransaction {
  id: number;
  amount: number;
  type: 'in' | 'out';
  description: string;
  date: string;
  category: string;
  reference: string | null;
}

interface BankAccountSummary {
  accounts: BankAccount[];
  totals: {
    totalBalance: number;
    totalAvailable: number;
    totalBlocked: number;
    activeAccounts: number;
    totalAccounts: number;
  };
}

export default function CashBankManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bank' | 'cash' | 'cashflow'>('overview');
  const [bankAccounts, setBankAccounts] = useState<BankAccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Cash balance - loaded from API
  const [cashBalance, setCashBalance] = useState(0);
  const [cashInToday, setCashInToday] = useState(0);
  const [cashOutToday, setCashOutToday] = useState(0);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [cashFlowYear, setCashFlowYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'cashflow') {
      loadCashFlow();
    }
  }, [activeTab, cashFlowYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to load bank accounts
      try {
        const bankResponse = await apiClient.get('/company/bank-accounts');
        setBankAccounts(bankResponse.data);
      } catch (error) {
        console.warn('Bank accounts not available, using defaults');
        setBankAccounts({ accounts: [], totals: { totalBalance: 0, totalAvailable: 0, totalBlocked: 0, activeAccounts: 0, totalAccounts: 0 } });
      }

      // Try to load cash data (currently not implemented in backend)
      try {
        const [cashBalanceResponse, cashSummaryResponse, cashTransactionsResponse] = await Promise.all([
          apiClient.get('/cash/balance'),
          apiClient.get('/cash/summary'),
          apiClient.get('/cash/transactions?limit=10'),
        ]);
        setCashBalance(cashBalanceResponse.data.data.balance);
        setCashInToday(cashSummaryResponse.data.data.todayIn);
        setCashOutToday(cashSummaryResponse.data.data.todayOut);
        setCashTransactions(cashTransactionsResponse.data.data);
      } catch (error) {
        console.warn('Cash data not available, using defaults');
        setCashBalance(0);
        setCashInToday(0);
        setCashOutToday(0);
        setCashTransactions([]);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      // Silent fail - component will show with empty data
    } finally {
      setLoading(false);
    }
  };

  const loadCashFlow = async () => {
    try {
      const response = await apiClient.get(`/cash/cash-flow?year=${cashFlowYear}`);
      setCashFlowData(response.data.data);
    } catch (error: any) {
      console.warn('Cash flow data not available, using defaults');
      // Silent fail - component will show with empty data
      setCashFlowData([]);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSaveTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.description) {
      toast.error('Tutar ve açýklama zorunludur');
      return;
    }

    try {
      await apiClient.post('/cash/transactions', {
        type: transactionType,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description,
        date: transactionForm.date,
      });
      
      toast.success('Ýþlem kaydedildi');
      setShowTransactionForm(false);
      setTransactionForm({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
      
      // Reload data to show new transaction
      loadData();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast.error(error.response?.data?.message || 'Ýþlem kaydedilemedi');
    }
  };

  const totalBalance = (bankAccounts?.totals.totalBalance || 0) + cashBalance;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>Kasa ve Banka Yönetimi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Nakit akýþý, kasa ve banka hesaplarýnýzý takip edin
          </p>
        </div>
        <button
          onClick={() => setShowTransactionForm(true)}
          className={cx(button('md', 'primary', 'md'), 'gap-2')}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Ýþlem</span>
        </button>
      </div>

      {/* Summary Stats - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Wallet className="w-8 h-8 opacity-80" />
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/20 text-white">Toplam</span>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(totalBalance)}</p>
          <p className="text-sm opacity-90">Toplam Bakiye</p>
        </div>

        {/* Bank Accounts */}
        <div className={card('md', 'lg', 'default', 'xl')}>
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Banka</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(bankAccounts?.totals.totalBalance || 0)}
          </p>
          <p className="text-sm text-gray-600">
            {bankAccounts?.totals.activeAccounts || 0} Aktif Hesap
          </p>
        </div>

        {/* Cash Balance */}
        <div className={card('md', 'lg', 'default', 'xl')}>
          <div className="flex items-center justify-between mb-3">
            <Wallet className="w-8 h-8 text-green-600" />
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Kasa</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(cashBalance)}</p>
          <p className="text-sm text-gray-600">Nakit Bakiye</p>
        </div>

        {/* Today's Activity */}
        <div className={card('md', 'lg', 'default', 'xl')}>
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Bugün</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Giriþ</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(cashInToday)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600">Çýkýþ</span>
              </div>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(cashOutToday)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-1 -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={cx(
                'px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2',
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              )}
            >
              Genel Bakýþ
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={cx(
                'px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2',
                activeTab === 'bank'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              )}
            >
              Banka Hesaplarý
            </button>
            <button
              onClick={() => setActiveTab('cash')}
              className={cx(
                'px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2',
                activeTab === 'cash'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              )}
            >
              Kasa Hareketleri
            </button>
            <button
              onClick={() => setActiveTab('cashflow')}
              className={cx(
                'px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2',
                activeTab === 'cashflow'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              )}
            >
              Nakit Akýþý
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Daðýlýmý</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Banka Hesaplarý</span>
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-blue-600 mb-2`}>
                      {formatCurrency(bankAccounts?.totals.totalBalance || 0)}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {bankAccounts?.totals.totalAccounts || 0} Hesap
                      </span>
                      <span className="text-green-600">
                        {bankAccounts?.totals.activeAccounts || 0} Aktif
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Kasa</span>
                      <Wallet className="w-5 h-5 text-green-600" />
                    </div>
                    <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-green-600 mb-2`}>
                      {formatCurrency(cashBalance)}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Nakit</span>
                      <span className="text-blue-600">TRY</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Hareketler</h3>
                <div className="space-y-2">
                  {cashTransactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Henüz kasa hareketi bulunmuyor</p>
                      <button
                        onClick={() => setShowTransactionForm(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ýlk iþleminizi ekleyin
                      </button>
                    </div>
                  ) : (
                    cashTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === 'in' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {transaction.type === 'in' ? (
                            <ArrowDownLeft className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'in' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bank Accounts Tab */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Banka Hesaplarý</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Banka
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Hesap No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IBAN
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Bakiye
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Durum
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ýþlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bankAccounts?.accounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{account.bankName}</p>
                            {account.branch && (
                              <p className="text-sm text-gray-500">{account.branch}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{account.accountNumber}</td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-700">
                          {account.iban}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(account.balance)}
                            </p>
                            <p className="text-xs text-gray-500">{account.currency}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              account.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {account.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Detaylar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cash Transactions Tab */}
          {activeTab === 'cash' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Kasa Hareketleri</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <Filter className="w-4 h-4 mr-1" />
                    Filtrele
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <Download className="w-4 h-4 mr-1" />
                    Ýndir
                  </button>
                </div>
              </div>
              <div className="text-center py-12 text-gray-500">
                <Wallet className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Kasa hareketi yok</p>
                <p className="text-sm mt-1">Yeni bir iþlem ekleyerek baþlayýn</p>
              </div>
            </div>
          )}

          {/* Cash Flow Tab */}
          {activeTab === 'cashflow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Nakit Akýþý Raporu</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCashFlowYear(cashFlowYear - 1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ‹
                  </button>
                  <span className="text-sm font-medium px-4">{cashFlowYear}</span>
                  <button
                    onClick={() => setCashFlowYear(cashFlowYear + 1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ›
                  </button>
                </div>
              </div>

              {cashFlowData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Bu yýl için veri bulunamadý</p>
                  <p className="text-sm mt-1">Ýþlem eklediðinizde burada görünecektir</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Monthly Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Toplam Giriþ</span>
                      </div>
                      <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-green-600`}>
                        {formatCurrency(
                          cashFlowData.reduce((sum, month) => sum + month.income, 0)
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{cashFlowYear} yýlý</p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">Toplam Çýkýþ</span>
                      </div>
                      <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-red-600`}>
                        {formatCurrency(
                          cashFlowData.reduce((sum, month) => sum + month.expense, 0)
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{cashFlowYear} yýlý</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Net Akýþ</span>
                      </div>
                      <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-blue-600`}>
                        {formatCurrency(
                          cashFlowData.reduce((sum, month) => sum + month.net, 0)
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{cashFlowYear} yýlý</p>
                    </div>
                  </div>

                  {/* Monthly Breakdown Table */}
                  <div className={cx(card('md', 'none', 'default', 'md'), 'overflow-hidden')}>
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Ay
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Giriþ
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Çýkýþ
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Net
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {cashFlowData.map((monthData) => (
                          <tr key={monthData.month} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {new Date(cashFlowYear, monthData.month - 1).toLocaleDateString(
                                'tr-TR',
                                { month: 'long' }
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                              {formatCurrency(monthData.income)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                              {formatCurrency(monthData.expense)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-bold">
                              <span
                                className={
                                  monthData.net >= 0 ? 'text-blue-600' : 'text-red-600'
                                }
                              >
                                {formatCurrency(monthData.net)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={cx(card('md', 'lg', 'default', 'md'), 'w-full max-w-md')}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Yeni Ýþlem</h3>
              <button
                onClick={() => setShowTransactionForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ýþlem Tipi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTransactionType('in')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      transactionType === 'in'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ArrowDownLeft
                      className={`w-6 h-6 mx-auto mb-1 ${
                        transactionType === 'in' ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-sm font-medium">Giriþ</span>
                  </button>
                  <button
                    onClick={() => setTransactionType('out')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      transactionType === 'out'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ArrowUpRight
                      className={`w-6 h-6 mx-auto mb-1 ${
                        transactionType === 'out' ? 'text-red-600' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-sm font-medium">Çýkýþ</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tutar (?)</label>
                <input
                  type="number"
                  value={transactionForm.amount}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açýklama</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ýþlem açýklamasý"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={transactionForm.category}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                  <option value="transfer">Transfer</option>
                  <option value="other">Diðer</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveTransaction}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </button>
                <button
                  onClick={() => setShowTransactionForm(false)}
                  className={button('md', 'outline', 'md')}
                >
                  Ýptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
