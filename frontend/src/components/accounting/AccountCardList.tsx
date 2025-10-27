import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Users, Building2, DollarSign, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import AccountCardModal from './AccountCardModal';

interface AccountCard {
  id: number;
  code: string;
  name: string;
  type: 'customer' | 'supplier' | 'both';
  balance: number;
  taxNumber?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  _count?: {
    transactions: number;
    invoices: number;
    expenses: number;
  };
}

interface AccountCardListProps {
  onSelectCard?: (card: AccountCard) => void;
}

export default function AccountCardList({ onSelectCard }: AccountCardListProps) {
  const { user } = useAuth();
  const [accountCards, setAccountCards] = useState<AccountCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<AccountCard | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    isActive: '',
    hasBalance: '',
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    customers: 0,
    suppliers: 0,
    both: 0,
    active: 0,
    totalDebit: 0,
    totalCredit: 0,
    netBalance: 0,
  });

  useEffect(() => {
    fetchAccountCards();
    fetchStats();
  }, [filters]);

  const fetchAccountCards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive) params.append('isActive', filters.isActive);
      if (filters.hasBalance) params.append('hasBalance', filters.hasBalance);

      const response = await api.get(`/account-cards?${params.toString()}`);
      setAccountCards(response.data.data || []);
    } catch (error) {
      console.error('Fetch account cards error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/account-cards/stats');
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleEdit = (card: AccountCard) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  const handleDelete = async (card: AccountCard) => {
    if (!confirm(`${card.name} cari hesabını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await api.delete(`/account-cards/${card.id}`);
      fetchAccountCards();
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Cari hesap silinemedi');
    }
  };

  const handleSuccess = () => {
    fetchAccountCards();
    fetchStats();
  };

  const typeLabels = {
    customer: 'Müşteri',
    supplier: 'Tedarikçi',
    both: 'Her İkisi',
  };

  const typeColors = {
    customer: 'bg-blue-100 text-blue-800',
    supplier: 'bg-orange-100 text-orange-800',
    both: 'bg-purple-100 text-purple-800',
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600 font-semibold'; // Borç (kırmızı)
    if (balance < 0) return 'text-green-600 font-semibold'; // Alacak (yeşil)
    return 'text-gray-600';
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `${balance.toFixed(2)} TL Borç`;
    if (balance < 0) return `${Math.abs(balance).toFixed(2)} TL Alacak`;
    return '0.00 TL';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Cari</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>Müşteri: {stats.customers}</span>
            <span>Tedarikçi: {stats.suppliers}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif Cari</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Pasif: {stats.total - stats.active}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Borç</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.totalDebit.toFixed(0)} TL
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Alacaklarımız
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Bakiye</p>
              <p className={`text-2xl font-bold mt-1 ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.netBalance.toFixed(0)} TL
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Borç - Alacak
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari adı, kod veya vergi no ile ara..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtreler
          </button>

          {/* Add Button */}
          <button
            onClick={() => {
              setSelectedCard(undefined);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Cari Hesap
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tümü</option>
                <option value="customer">Müşteri</option>
                <option value="supplier">Tedarikçi</option>
                <option value="both">Her İkisi</option>
              </select>
            </div>

            {/* Active Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tümü</option>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </div>

            {/* Balance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bakiye
              </label>
              <select
                value={filters.hasBalance}
                onChange={(e) => setFilters({ ...filters, hasBalance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tümü</option>
                <option value="true">Bakiyesi Olan</option>
                <option value="false">Bakiyesi Olmayan</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cari Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vergi No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bakiye
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksiyonlar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500">Yükleniyor...</span>
                    </div>
                  </td>
                </tr>
              ) : accountCards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Henüz cari hesap kaydı yok</p>
                    <button
                      onClick={() => {
                        setSelectedCard(undefined);
                        setShowModal(true);
                      }}
                      className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      İlk cari hesabı oluştur
                    </button>
                  </td>
                </tr>
              ) : (
                accountCards.map((card) => (
                  <tr
                    key={card.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onSelectCard && onSelectCard(card)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">{card.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{card.name}</div>
                        {card.email && (
                          <div className="text-xs text-gray-500">{card.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[card.type]}`}>
                        {typeLabels[card.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.taxNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm ${getBalanceColor(card.balance)}`}>
                        {getBalanceText(card.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <span>{card._count?.transactions || 0} işlem</span>
                        <span>•</span>
                        <span>{card._count?.invoices || 0} fatura</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCard && onSelectCard(card);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Detay"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(card);
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(card);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AccountCardModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCard(undefined);
          }}
          onSuccess={handleSuccess}
          accountCard={selectedCard}
        />
      )}
    </div>
  );
}
