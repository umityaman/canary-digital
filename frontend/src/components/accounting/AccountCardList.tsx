import { useState, useEffect } from 'react'
import {
  Search, Download, Filter, Users, TrendingUp, TrendingDown,
  Eye, FileText, Clock, AlertCircle, ChevronRight, Phone, Mail
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import AccountCardDetail from './AccountCardDetail'

interface AccountCard {
  customerId: number
  customerName: string
  email: string
  phone: string | null
  totalDebt: number
  overdueDebt: number
  invoiceCount: number
}

export default function AccountCardList() {
  const [accounts, setAccounts] = useState<AccountCard[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<AccountCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'active'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'debt' | 'overdue'>('debt')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)

  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    filterAndSortAccounts()
  }, [accounts, searchTerm, filterType, sortBy])

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const { accountingAPI } = await import('../../services/api')
      const res = await accountingAPI.getCariSummary()
      const data = res.data.data || res.data
      setAccounts(data)
    } catch (error: any) {
      console.error('Failed to load accounts:', error)
      toast.error('Cari hesaplar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortAccounts = () => {
    let filtered = [...accounts]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.phone?.includes(searchTerm)
      )
    }

    // Type filter
    if (filterType === 'overdue') {
      filtered = filtered.filter(account => account.overdueDebt > 0)
    } else if (filterType === 'active') {
      filtered = filtered.filter(account => account.totalDebt > 0)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.customerName.localeCompare(b.customerName, 'tr')
        case 'debt':
          return b.totalDebt - a.totalDebt
        case 'overdue':
          return b.overdueDebt - a.overdueDebt
        default:
          return 0
      }
    })

    setFilteredAccounts(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calculateTotalDebt = () => {
    return accounts.reduce((sum, account) => sum + account.totalDebt, 0)
  }

  const calculateOverdueDebt = () => {
    return accounts.reduce((sum, account) => sum + account.overdueDebt, 0)
  }

  const getOverdueAccountsCount = () => {
    return accounts.filter(account => account.overdueDebt > 0).length
  }

  const exportToExcel = () => {
    toast.success('Excel dışa aktarma özelliği yakında eklenecek')
  }

  if (selectedCustomerId) {
    return (
      <AccountCardDetail
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Cari Hesap Kartları</h2>
          <p className="text-sm text-neutral-600 mt-1">Müşteri bazlı alacak-borç takibi</p>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Dışa Aktar</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 mb-1">{accounts.length}</h3>
          <p className="text-sm text-blue-700">Toplam Cari</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-1">{formatCurrency(calculateTotalDebt())}</h3>
          <p className="text-sm text-green-700">Toplam Alacak</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-white" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-red-900 mb-1">{formatCurrency(calculateOverdueDebt())}</h3>
          <p className="text-sm text-red-700">Vadesi Geçmiş</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-orange-900 mb-1">{getOverdueAccountsCount()}</h3>
          <p className="text-sm text-orange-700">Gecikmiş Hesap</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Müşteri adı, email veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          >
            <option value="all">Tüm Hesaplar</option>
            <option value="active">Aktif Borçlar</option>
            <option value="overdue">Vadesi Geçmiş</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          >
            <option value="debt">Borca Göre</option>
            <option value="overdue">Vadeye Göre</option>
            <option value="name">İsme Göre</option>
          </select>
        </div>
      </div>

      {/* Account List */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-600">Yükleniyor...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-neutral-400 mb-3" size={48} />
            <p className="text-neutral-600">
              {searchTerm || filterType !== 'all' 
                ? 'Arama kriterlerine uygun cari hesap bulunamadı' 
                : 'Henüz cari hesap bulunmuyor'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Müşteri Bilgileri
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Toplam Borç
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Vadesi Geçmiş
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Fatura Sayısı
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredAccounts.map((account) => (
                  <tr
                    key={account.customerId}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomerId(account.customerId)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-neutral-900">{account.customerName}</div>
                        <div className="flex flex-col gap-1 mt-1">
                          {account.email && (
                            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                              <Mail size={14} />
                              <span>{account.email}</span>
                            </div>
                          )}
                          {account.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                              <Phone size={14} />
                              <span>{account.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(account.totalDebt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {account.overdueDebt > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-bold text-red-600">
                            {formatCurrency(account.overdueDebt)}
                          </span>
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                            Gecikmiş
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <FileText size={14} />
                        {account.invoiceCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCustomerId(account.customerId)
                        }}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors text-sm font-medium"
                      >
                        <Eye size={16} />
                        <span>Detay</span>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Info */}
      {!loading && filteredAccounts.length > 0 && (
        <div className="text-sm text-neutral-600 text-center">
          {filteredAccounts.length} cari hesap gösteriliyor
          {accounts.length !== filteredAccounts.length && ` (toplam ${accounts.length} hesap)`}
        </div>
      )}
    </div>
  )
}
