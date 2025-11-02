import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Users, TrendingUp, TrendingDown, DollarSign, Edit2, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface AccountCard {
  id: number
  code: string
  name: string
  type: string
  balance: number
  phone?: string
  email?: string
  taxNumber?: string
  isActive: boolean
  _count: {
    transactions: number
    invoices: number
    expenses: number
    customers: number
    suppliers: number
  }
}

const AccountCardList: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [accountCards, setAccountCards] = useState<AccountCard[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadAccountCards()
  }, [page, typeFilter, statusFilter])

  const loadAccountCards = async () => {
    try {
      setLoading(true)
      const params: any = { page, limit: 20 }
      
      if (typeFilter !== 'all') params.type = typeFilter
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active'
      if (search) params.search = search

      const response = await axios.get(`${API_URL}/account-cards`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      setAccountCards(response.data.accountCards)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error: any) {
      console.error('Load account cards error:', error)
      toast.error('Cari hesaplar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadAccountCards()
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      customer: 'Müşteri',
      supplier: 'Tedarikçi',
      both: 'Her İkisi'
    }
    return types[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      customer: 'bg-blue-100 text-blue-700',
      supplier: 'bg-orange-100 text-orange-700',
      both: 'bg-purple-100 text-purple-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const formatBalance = (balance: number) => {
    const absBalance = Math.abs(balance)
    const formatted = absBalance.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
    
    if (balance > 0) {
      return <span className="text-red-600 font-medium">₺{formatted} Borç</span>
    } else if (balance < 0) {
      return <span className="text-green-600 font-medium">₺{formatted} Alacak</span>
    }
    return <span className="text-gray-600">₺0,00</span>
  }

  const stats = accountCards.reduce((acc, card) => {
    if (card.balance > 0) acc.debit += card.balance
    if (card.balance < 0) acc.credit += Math.abs(card.balance)
    return acc
  }, { debit: 0, credit: 0 })

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Cari Hesaplar</h1>
              <p className="text-sm text-neutral-600 mt-1">
                Müşteri ve tedarikçi hesap kartları
              </p>
            </div>
            <button
              onClick={() => navigate('/account-cards/new')}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Yeni Cari Hesap
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Toplam Cari</p>
                <p className="text-2xl font-bold text-neutral-900">{accountCards.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Toplam Borç</p>
                <p className="text-2xl font-bold text-red-600">
                  ₺{stats.debit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Toplam Alacak</p>
                <p className="text-2xl font-bold text-green-600">
                  ₺{stats.credit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Cari hesap ara (kod, isim, vergi no)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-3 text-neutral-400" size={18} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="all">Tüm Tipler</option>
                <option value="customer">Müşteri</option>
                <option value="supplier">Tedarikçi</option>
                <option value="both">Her İkisi</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Cards List */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto"></div>
              <p className="mt-4 text-neutral-600">Yükleniyor...</p>
            </div>
          ) : accountCards.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="mx-auto text-neutral-400 mb-4" size={48} />
              <p className="text-lg font-medium">Cari hesap bulunamadı</p>
              <p className="text-sm mt-2 text-neutral-600">Yeni cari hesap oluşturarak başlayın</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Kod
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Cari Hesap
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Bakiye
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Aksiyon
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {accountCards.map((card) => (
                    <tr key={card.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-neutral-900">{card.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{card.name}</p>
                          {card.phone && (
                            <p className="text-xs text-neutral-500 mt-1">{card.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(card.type)}`}>
                          {getTypeLabel(card.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatBalance(card.balance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-600">
                          {card._count.transactions} işlem
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          card.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {card.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/account-cards/${card.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Detay"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/account-cards/${card.id}/edit`)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title="Düzenle"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <span className="text-sm text-neutral-600">
                Sayfa {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountCardList
