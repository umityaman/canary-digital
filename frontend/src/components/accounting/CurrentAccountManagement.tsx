import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  FileText,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { card, button, badge, DESIGN_TOKENS, cx } from '../../styles/design-tokens';
import { exportCurrentAccountsToExcel } from '../../utils/excelExport';

interface CurrentAccountTransaction {
  id: number;
  date: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  balance: number;
}

interface CurrentAccount {
  id: number;
  code: string;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  isActive: boolean;
  transactions?: CurrentAccountTransaction[];
}

export default function CurrentAccountManagement() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<CurrentAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [balanceFilter, setBalanceFilter] = useState<string>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<CurrentAccount | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [typeFilter, balanceFilter]);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (balanceFilter !== 'ALL') params.append('balanceType', balanceFilter);

      const response = await fetch(`/api/accounting/current-accounts?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load current accounts');

      const data = await response.json();
      setAccounts(data.data || data);
    } catch (error: any) {
      console.error('Failed to load current accounts:', error);
      toast.error('Cari hesaplar yüklenemedi: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const loadAccountTransactions = async (accountId: number) => {
    try {
      setTransactionsLoading(true);

      const response = await fetch(`/api/accounting/current-accounts/${accountId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load transactions');

      const data = await response.json();
      
      if (selectedAccount) {
        setSelectedAccount({
          ...selectedAccount,
          transactions: data.data || data,
        });
      }
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
      toast.error('Hareketler yüklenemedi: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleViewDetail = (account: CurrentAccount) => {
    navigate(`/accounting/current-account/${account.id}`);
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (!confirm('Bu cari hesabı silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/accounting/current-accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete account');

      toast.success('Cari hesap silindi');
      loadAccounts();
    } catch (error: any) {
      toast.error('Cari hesap silinemedi: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  const getAccountTypeBadge = (type: string) => {
    const config = type === 'CUSTOMER' 
      ? { label: 'Müşteri', color: 'bg-blue-100 text-blue-700' }
      : { label: 'Tedarikçi', color: 'bg-purple-100 text-purple-700' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getBalanceColor = (balance: number): string => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.taxNumber?.includes(searchQuery);

    return matchesSearch;
  });

  const totalDebit = filteredAccounts.reduce((sum, acc) => sum + acc.totalDebit, 0);
  const totalCredit = filteredAccounts.reduce((sum, acc) => sum + acc.totalCredit, 0);
  const totalBalance = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const customerCount = filteredAccounts.filter((a) => a.type === 'CUSTOMER').length;
  const supplierCount = filteredAccounts.filter((a) => a.type === 'SUPPLIER').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`${DESIGN_TOKENS?.typography?.heading.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>
            Cari Hesap Yönetimi
          </h2>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mt-1`}>
            Müşteri ve tedarikçi cari hesaplarını yönetin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={button('secondary', 'md', 'md')}
            onClick={() => {
              try {
                exportCurrentAccountsToExcel(accounts);
                toast.success('Cari hesaplar Excel olarak indirildi');
              } catch (error) {
                toast.error('Excel export başarısız oldu');
              }
            }}
          >
            <Download className="w-4 h-4" />
            Excel İndir
          </button>
          <button
            className={button('primary', 'md', 'md')}
            onClick={() => toast.success('Yeni cari hesap ekleme özelliği yakında eklenecek')}
          >
            <Plus className="w-4 h-4" />
            Yeni Cari Hesap
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
            {filteredAccounts.length}
          </p>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
            Toplam Cari
          </p>
          <p className={`${DESIGN_TOKENS?.typography?.body.xs} ${DESIGN_TOKENS?.colors?.text.tertiary} mt-1`}>
            {customerCount} Müşteri, {supplierCount} Tedarikçi
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-green-600`}>
            {formatCurrency(totalDebit)}
          </p>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
            Toplam Borç
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-red-600`}>
            {formatCurrency(totalCredit)}
          </p>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
            Toplam Alacak
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.md} ${getBalanceColor(totalBalance)}`}>
            {formatCurrency(totalBalance)}
          </p>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
            Net Bakiye
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
            {filteredAccounts.filter((a) => Math.abs(a.balance) > 0).length}
          </p>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
            Açık Bakiye
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={card('md', 'md', 'default', 'lg')}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari adı, kodu veya vergi no ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Tüm Tipler</option>
            <option value="CUSTOMER">Müşteri</option>
            <option value="SUPPLIER">Tedarikçi</option>
          </select>

          {/* Balance Filter */}
          <select
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Tüm Bakiyeler</option>
            <option value="POSITIVE">Alacaklı (Pozitif)</option>
            <option value="NEGATIVE">Borçlu (Negatif)</option>
            <option value="ZERO">Sıfır Bakiye</option>
          </select>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button onClick={loadAccounts} className={button('secondary', 'sm', 'md')}>
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>

          <button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('ALL');
              setBalanceFilter('ALL');
            }}
            className={button('secondary', 'sm', 'md')}
          >
            <Filter className="w-4 h-4" />
            Filtreleri Temizle
          </button>

          <button
            onClick={() => toast.success('Excel export özelliği yakında eklenecek')}
            className={button('secondary', 'sm', 'md')}
          >
            <Download className="w-4 h-4" />
            Excel İndir
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className={card('none', 'none', 'default', 'lg')}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <p className={`${DESIGN_TOKENS?.typography?.body.lg} ${DESIGN_TOKENS?.colors?.text.primary} mb-2`}>
              Cari Hesap Bulunamadı
            </p>
            <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>
              {searchQuery || typeFilter !== 'ALL' || balanceFilter !== 'ALL'
                ? 'Arama kriterlerinize uygun cari hesap bulunamadı'
                : 'Henüz cari hesap eklenmemiş'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cari Kodu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cari Adı
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borç
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alacak
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bakiye
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.primary} font-medium font-mono`}>
                          {account.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.primary} font-medium`}>
                          {account.name}
                        </p>
                        {account.taxNumber && (
                          <p className={`${DESIGN_TOKENS?.typography?.body.xs} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>
                            VKN: {account.taxNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getAccountTypeBadge(account.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`${DESIGN_TOKENS?.typography?.body.sm} text-green-600 font-medium`}>
                        {formatCurrency(account.totalDebit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`${DESIGN_TOKENS?.typography?.body.sm} text-red-600 font-medium`}>
                        {formatCurrency(account.totalCredit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`${DESIGN_TOKENS?.typography?.body.sm} font-bold ${getBalanceColor(account.balance)}`}>
                        {formatCurrency(account.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(account)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detayları Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toast.success('Düzenleme özelliği yakında eklenecek')}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`${DESIGN_TOKENS?.typography?.heading.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}>
                    Cari Hesap Detayı
                  </h3>
                  <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mt-1`}>
                    {selectedAccount.code} - {selectedAccount.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Account Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-1`}>
                    Tip
                  </p>
                  {getAccountTypeBadge(selectedAccount.type)}
                </div>
                <div>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-1`}>
                    Vergi No
                  </p>
                  <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
                    {selectedAccount.taxNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-1`}>
                    Telefon
                  </p>
                  <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
                    {selectedAccount.phone || '-'}
                  </p>
                </div>
                <div>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-1`}>
                    Email
                  </p>
                  <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
                    {selectedAccount.email || '-'}
                  </p>
                </div>
              </div>

              {/* Balance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={card('md', 'md', 'default', 'lg')}>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-2`}>
                    Toplam Borç
                  </p>
                  <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-green-600`}>
                    {formatCurrency(selectedAccount.totalDebit)}
                  </p>
                </div>
                <div className={card('md', 'md', 'default', 'lg')}>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-2`}>
                    Toplam Alacak
                  </p>
                  <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-red-600`}>
                    {formatCurrency(selectedAccount.totalCredit)}
                  </p>
                </div>
                <div className={card('md', 'md', 'default', 'lg')}>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-2`}>
                    Net Bakiye
                  </p>
                  <p className={`${DESIGN_TOKENS?.typography?.stat.md} ${getBalanceColor(selectedAccount.balance)}`}>
                    {formatCurrency(selectedAccount.balance)}
                  </p>
                </div>
              </div>

              {/* Transactions */}
              <div>
                <h4 className={`${DESIGN_TOKENS?.typography?.heading.h4} ${DESIGN_TOKENS?.colors?.text.primary} mb-4`}>
                  Hesap Hareketleri
                </h4>
                
                {transactionsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : !selectedAccount.transactions || selectedAccount.transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Henüz hareket bulunmamaktadır
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tarih
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Açıklama
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Fatura No
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
                      <tbody className="divide-y divide-gray-200">
                        {selectedAccount.transactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                              {formatDate(txn.date)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {txn.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-center">
                              {txn.invoiceNumber || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-green-600 font-medium text-right">
                              {txn.type === 'DEBIT' ? formatCurrency(txn.amount) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600 font-medium text-right">
                              {txn.type === 'CREDIT' ? formatCurrency(txn.amount) : '-'}
                            </td>
                            <td className={`px-4 py-3 text-sm font-medium text-right ${getBalanceColor(txn.balance)}`}>
                              {formatCurrency(txn.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className={button('secondary', 'md', 'md')}
              >
                Kapat
              </button>
              <button
                onClick={() => toast.success('Ekstre yazdırma özelliği yakında eklenecek')}
                className={button('primary', 'md', 'md')}
              >
                <FileText className="w-4 h-4" />
                Ekstre Yazdır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
