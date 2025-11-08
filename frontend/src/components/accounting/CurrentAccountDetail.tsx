import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Filter,
  RefreshCw,
  Plus,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { card, button, badge, DESIGN_TOKENS, cx } from '../../styles/design-tokens';

interface CurrentAccountTransaction {
  id: number;
  date: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  balance: number;
  referenceType?: string;
  referenceId?: number;
}

interface CurrentAccount {
  id: number;
  code: string;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  taxNumber: string;
  taxOffice: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  isActive: boolean;
  creditLimit?: number;
  paymentTerm?: number;
  createdAt: string;
  lastTransactionDate?: string;
}

interface Payment {
  id: number;
  date: string;
  amount: number;
  method: string;
  description: string;
  status: string;
}

export default function CurrentAccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [account, setAccount] = useState<CurrentAccount | null>(null);
  const [transactions, setTransactions] = useState<CurrentAccountTransaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (id) {
      loadAccount();
      loadTransactions();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadTransactions();
    }
  }, [dateFrom, dateTo, typeFilter, currentPage]);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accounting/current-accounts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load account');

      const data = await response.json();
      setAccount(data.data || data);
    } catch (error: any) {
      console.error('Failed to load account:', error);
      toast.error('Cari hesap yüklenemedi');
      navigate('/accounting');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setTransactionsLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (dateFrom) params.append('startDate', dateFrom);
      if (dateTo) params.append('endDate', dateTo);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);

      const response = await fetch(
        `/api/accounting/current-accounts/${id}/transactions?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load transactions');

      const data = await response.json();
      setTransactions(data.data || data.transactions || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
      toast.error('Hareketler yüklenemedi');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleExportStatement = () => {
    toast.success('Ekstre export özelliği yakında eklenecek');
  };

  const handleSendStatement = () => {
    toast.success('Email gönderme özelliği yakında eklenecek');
  };

  const getAccountTypeBadge = (type: string) => {
    const config =
      type === 'CUSTOMER'
        ? { label: 'Müşteri', color: 'bg-blue-100 text-blue-700' }
        : { label: 'Tedarikçi', color: 'bg-purple-100 text-purple-700' };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
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
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || !account) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/accounting')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1
              className={`${DESIGN_TOKENS.typography.heading.h1} ${DESIGN_TOKENS.colors.text.primary}`}
            >
              {account.name}
            </h1>
            {getAccountTypeBadge(account.type)}
            {!account.isActive && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                Pasif
              </span>
            )}
          </div>
          <p
            className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Cari Kodu: {account.code}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendStatement}
            className={button('secondary', 'md', 'md')}
          >
            <Mail className="w-4 h-4" />
            Ekstre Gönder
          </button>
          <button
            onClick={handleExportStatement}
            className={button('primary', 'md', 'md')}
          >
            <Download className="w-4 h-4" />
            Ekstre İndir
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p
            className={`${DESIGN_TOKENS.typography.stat.lg} text-green-600 mb-1`}
          >
            {formatCurrency(account.totalDebit)}
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
            {formatCurrency(account.totalCredit)}
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
            className={`${DESIGN_TOKENS.typography.stat.lg} ${getBalanceColor(
              account.balance
            )} mb-1`}
          >
            {formatCurrency(account.balance)}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Net Bakiye
          </p>
          {account.balance > 0 && (
            <p className="text-xs text-green-600 mt-1">Alacaklı</p>
          )}
          {account.balance < 0 && (
            <p className="text-xs text-red-600 mt-1">Borçlu</p>
          )}
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
          <p
            className={`${DESIGN_TOKENS.typography.stat.lg} ${DESIGN_TOKENS.colors.text.primary} mb-1`}
          >
            {account.creditLimit ? formatCurrency(account.creditLimit) : '∞'}
          </p>
          <p
            className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
          >
            Kredi Limiti
          </p>
          {account.creditLimit && account.balance < 0 && (
            <p className="text-xs text-gray-600 mt-1">
              Kullanılan: {formatCurrency(Math.abs(account.balance))}
            </p>
          )}
        </div>
      </div>

      {/* Contact & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Information */}
        <div className={card('md', 'md', 'default', 'lg')}>
          <h3
            className={`${DESIGN_TOKENS.typography.heading.h4} ${DESIGN_TOKENS.colors.text.primary} mb-4`}
          >
            İletişim Bilgileri
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p
                  className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary}`}
                >
                  Vergi Bilgileri
                </p>
                <p
                  className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.primary}`}
                >
                  VKN: {account.taxNumber || '-'}
                </p>
                <p
                  className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
                >
                  {account.taxOffice || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p
                  className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary}`}
                >
                  Telefon
                </p>
                <p
                  className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.primary}`}
                >
                  {account.phone || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p
                  className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary}`}
                >
                  Email
                </p>
                <p
                  className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.primary}`}
                >
                  {account.email || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p
                  className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary}`}
                >
                  Adres
                </p>
                <p
                  className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.primary}`}
                >
                  {account.address || '-'}
                </p>
                <p
                  className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}
                >
                  {account.city || '-'}, {account.country || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className={card('md', 'md', 'default', 'lg')}>
          <h3
            className={`${DESIGN_TOKENS.typography.heading.h4} ${DESIGN_TOKENS.colors.text.primary} mb-4`}
          >
            Hesap Bilgileri
          </h3>
          <div className="space-y-3">
            <div>
              <p
                className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary} mb-1`}
              >
                Ödeme Vadesi
              </p>
              <p
                className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.primary}`}
              >
                {account.paymentTerm ? `${account.paymentTerm} gün` : 'Tanımsız'}
              </p>
            </div>

            <div>
              <p
                className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary} mb-1`}
              >
                Hesap Açılış Tarihi
              </p>
              <p
                className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.primary}`}
              >
                {formatDate(account.createdAt)}
              </p>
            </div>

            <div>
              <p
                className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary} mb-1`}
              >
                Son İşlem Tarihi
              </p>
              <p
                className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.primary}`}
              >
                {account.lastTransactionDate
                  ? formatDate(account.lastTransactionDate)
                  : 'Henüz işlem yok'}
              </p>
            </div>

            <div>
              <p
                className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary} mb-1`}
              >
                Durum
              </p>
              <p
                className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.primary}`}
              >
                {account.isActive ? (
                  <span className="text-green-600 font-medium">✓ Aktif</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ Pasif</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className={card('md', 'md', 'default', 'lg')}>
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`${DESIGN_TOKENS.typography.heading.h3} ${DESIGN_TOKENS.colors.text.primary}`}
          >
            Hesap Hareketleri
          </h3>
          <button
            onClick={() => toast.success('Yeni hareket ekleme özelliği yakında')}
            className={button('secondary', 'sm', 'md')}
          >
            <Plus className="w-4 h-4" />
            Yeni Hareket
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label
              className={`block ${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.primary} mb-1`}
            >
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
              İşlem Tipi
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Tümü</option>
              <option value="DEBIT">Borç</option>
              <option value="CREDIT">Alacak</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={loadTransactions}
              className={button('secondary', 'md', 'md')}
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setTypeFilter('ALL');
                setCurrentPage(1);
              }}
              className={button('secondary', 'md', 'md')}
            >
              <Filter className="w-4 h-4" />
              Temizle
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        {transactionsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Henüz hareket bulunmamaktadır</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tarih
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Açıklama
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Referans
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
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(txn.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <p>{txn.description}</p>
                          {txn.paymentMethod && (
                            <p className="text-xs text-gray-500 mt-1">
                              {txn.paymentMethod}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {txn.invoiceNumber ? (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                            {txn.invoiceNumber}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium text-right whitespace-nowrap">
                        {txn.type === 'DEBIT' ? formatCurrency(txn.amount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 font-medium text-right whitespace-nowrap">
                        {txn.type === 'CREDIT' ? formatCurrency(txn.amount) : '-'}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-bold text-right whitespace-nowrap ${getBalanceColor(
                          txn.balance
                        )}`}
                      >
                        {formatCurrency(txn.balance)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            toast.success('Detay görüntüleme özelliği yakında')
                          }
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Detay"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="text-sm text-gray-600">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
