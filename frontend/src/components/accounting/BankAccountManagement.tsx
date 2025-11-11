import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FaSync,
  FaExchangeAlt,
  FaDownload,
  FaFilter,
  FaSearch,
  FaUniversity,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

interface BankAccount {
  id: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  accountName: string;
  accountType: string;
  balance: number;
  availableBalance: number;
  currency: string;
  isActive: boolean;
  lastSyncAt: string | null;
}

interface BankTransaction {
  id: number;
  accountId: number;
  transactionNumber: string;
  date: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  counterpartyName: string | null;
  counterpartyAccount: string | null;
  referenceNumber: string | null;
  status: string;
  isReconciled: boolean;
  account?: {
    accountName: string;
    bankName: string;
  };
}

interface BankStats {
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  recentTransactions: number;
  unreconciledCount: number;
}

const BankAccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [stats, setStats] = useState<BankStats | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [registeredBanks, setRegisteredBanks] = useState<string[]>([]);

  // Filters
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const companyId = 1; // TODO: Get from auth context

  useEffect(() => {
    fetchAccounts();
    fetchStats();
    fetchRegisteredBanks();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions();
    }
  }, [selectedAccount, currentPage, dateFilter, typeFilter, statusFilter]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/bank/accounts?companyId=${companyId}`);
      if (response.data.success) {
        setAccounts(response.data.data);
      }
    } catch (error: any) {
      toast.error('Hesaplar yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/bank/stats?companyId=${companyId}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      console.error('Stats fetch error:', error);
    }
  };

  const fetchRegisteredBanks = async () => {
    try {
      const response = await axios.get('/api/bank/banks');
      if (response.data.success) {
        setRegisteredBanks(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch registered banks:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        accountId: selectedAccount!.toString(),
        page: currentPage.toString(),
        limit: '20',
      });

      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`/api/bank/transactions?${params}`);
      if (response.data.success) {
        setTransactions(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error: any) {
      toast.error('İşlemler yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAccounts = async (bankCode?: string) => {
    try {
      setSyncing(true);
      if (bankCode) {
        // Sync single bank
        const response = await axios.post('/api/bank/sync/accounts', {
          bankCode,
          companyId,
        });
        toast.success(response.data.message);
      } else {
        // Sync all banks
        const response = await axios.post('/api/bank/sync/all', {
          companyId,
          days: 7,
        });
        toast.success(response.data.message);
      }
      await fetchAccounts();
      await fetchStats();
    } catch (error: any) {
      toast.error('Senkronizasyon hatası: ' + error.response?.data?.message || error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncTransactions = async () => {
    if (!selectedAccount) {
      toast.error('Lütfen bir hesap seçin');
      return;
    }

    try {
      setSyncing(true);
      const account = accounts.find((a) => a.id === selectedAccount);
      if (!account) return;

      const response = await axios.post('/api/bank/sync/transactions', {
        bankCode: account.bankCode,
        accountId: selectedAccount,
        companyId,
        startDate: dateFilter.startDate || undefined,
        endDate: dateFilter.endDate || undefined,
      });
      toast.success(response.data.message);
      await fetchTransactions();
      await fetchStats();
    } catch (error: any) {
      toast.error('İşlem senkronizasyonu hatası: ' + error.response?.data?.message || error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleExportTransactions = () => {
    // TODO: Implement Excel export
    toast.info('Excel export yakında eklenecek');
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTransactions = transactions.filter((txn) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        txn.description?.toLowerCase().includes(query) ||
        txn.counterpartyName?.toLowerCase().includes(query) ||
        txn.transactionNumber?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Toplam Hesap</div>
            <div className="text-2xl font-bold">{stats.totalAccounts}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Aktif Hesap</div>
            <div className="text-2xl font-bold text-neutral-900">{stats.activeAccounts}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Toplam Bakiye</div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Son 7 Gün İşlem</div>
            <div className="text-2xl font-bold">{stats.recentTransactions}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Mutabakat Bekleyen</div>
            <div className="text-2xl font-bold text-neutral-900">{stats.unreconciledCount}</div>
          </div>
        </div>
      )}

      {/* Bank Accounts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FaUniversity className="text-blue-600" />
            Banka Hesapları
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleSyncAccounts()}
              disabled={syncing || registeredBanks.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:bg-gray-400"
            >
              <FaSync className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Senkronize Ediliyor...' : 'Tümünü Senkronize Et'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaUniversity className="mx-auto text-4xl mb-2 opacity-50" />
            <p>Henüz banka hesabı yok</p>
            <p className="text-sm mt-2">
              {registeredBanks.length === 0
                ? '.env dosyasında banka API bilgilerinizi yapılandırın'
                : 'Senkronize Et butonuna basarak hesaplarınızı çekin'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                onClick={() => setSelectedAccount(account.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedAccount === account.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{account.accountName}</h3>
                    <p className="text-sm text-gray-500">{account.bankName}</p>
                  </div>
                  {account.isActive ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">IBAN: {account.iban}</p>
                  <p className="text-gray-600">Hesap No: {account.accountNumber}</p>
                  <p className="text-gray-600">Tür: {account.accountType}</p>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Bakiye:</span>
                    <span className="font-bold text-lg">{formatCurrency(account.balance, account.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">Kullanılabilir:</span>
                    <span className="font-semibold">
                      {formatCurrency(account.availableBalance, account.currency)}
                    </span>
                  </div>
                </div>
                {account.lastSyncAt && (
                  <p className="text-xs text-gray-400 mt-2">Son senkr: {formatDate(account.lastSyncAt)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions Section */}
      {selectedAccount && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FaExchangeAlt className="text-green-600" />
              Hesap Hareketleri
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleSyncTransactions}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:bg-gray-400"
              >
                <FaSync className={syncing ? 'animate-spin' : ''} />
                İşlemleri Senkronize Et
              </button>
              <button
                onClick={handleExportTransactions}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <FaDownload />
                Excel İndir
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Tipi</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Tümü</option>
                <option value="DEBIT">Giden</option>
                <option value="CREDIT">Gelen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ara</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Açıklama, karşı taraf..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karşı Taraf</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mutabakat</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      İşlem bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(txn.date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono">{txn.transactionNumber}</td>
                      <td className="px-4 py-3 text-sm">{txn.description}</td>
                      <td className="px-4 py-3 text-sm">{txn.counterpartyName || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                          {txn.type === 'DEBIT' ? 'Giden' : 'Gelen'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-neutral-900">
                        {txn.type === 'DEBIT' ? '-' : '+'}
                        {formatCurrency(Math.abs(txn.amount))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {txn.isReconciled ? (
                          <FaCheckCircle className="text-neutral-900 mx-auto" />
                        ) : (
                          <FaTimesCircle className="text-neutral-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Önceki
              </button>
              <span className="text-sm text-gray-600">
                Sayfa {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BankAccountManagement;
