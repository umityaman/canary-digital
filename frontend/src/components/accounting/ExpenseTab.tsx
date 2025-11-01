import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, TrendingDown, Calendar, DollarSign, FileText, Trash2, Edit2, Eye, PieChart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ExpenseModal from './ExpenseModal'

interface Expense {
  id: number
  description: string
  amount: number
  category: string
  date: string
  status: string
  paymentMethod: string
  notes?: string
  receiptUrl?: string
}

interface CategoryStat {
  category: string
  total: number
  count: number
  percentage: number
  color: string
}

const CATEGORY_COLORS: Record<string, string> = {
  'Personel Maaşları': 'bg-blue-500',
  'Kira': 'bg-purple-500',
  'Elektrik/Su/Doğalgaz': 'bg-yellow-500',
  'İnternet/Telefon': 'bg-green-500',
  'Malzeme Alımı': 'bg-red-500',
  'Ekipman Bakım/Onarım': 'bg-orange-500',
  'Pazarlama/Reklam': 'bg-pink-500',
  'Diğer': 'bg-gray-500'
}

export default function ExpenseTab() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  
  // Stats
  const [totalExpense, setTotalExpense] = useState(0)
  const [monthlyExpense, setMonthlyExpense] = useState(0)
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])

  useEffect(() => {
    loadExpenses()
    loadStats()
  }, [currentPage, categoryFilter, statusFilter, dateFrom, dateTo])

  const loadExpenses = async () => {
    setLoading(true)
    try {
      const { accountingAPI } = await import('../../services/api')
      
      const response = await accountingAPI.getExpenses({
        page: currentPage,
        limit: itemsPerPage,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        search: searchTerm || undefined,
      })
      
      setExpenses(response.data.data || [])
      setTotalPages(response.data.pagination?.totalPages || 1)
    } catch (error: any) {
      console.error('Failed to load expenses:', error)
      toast.error('Giderler yüklenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Calculate stats from expenses
      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)
      setTotalExpense(total)
      
      // Monthly expense (current month)
      const currentMonth = new Date().getMonth()
      const monthly = expenses
        .filter(exp => new Date(exp.date).getMonth() === currentMonth)
        .reduce((sum, exp) => sum + exp.amount, 0)
      setMonthlyExpense(monthly)
      
      // Category breakdown
      const categoryMap = new Map<string, { total: number; count: number }>()
      expenses.forEach(exp => {
        const existing = categoryMap.get(exp.category) || { total: 0, count: 0 }
        categoryMap.set(exp.category, {
          total: existing.total + exp.amount,
          count: existing.count + 1
        })
      })
      
      const stats: CategoryStat[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: (data.total / total) * 100,
        color: CATEGORY_COLORS[category] || 'bg-gray-500'
      }))
      
      setCategoryStats(stats.sort((a, b) => b.total - a.total))
    } catch (error) {
      console.error('Stats calculation error:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu gider kaydını silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const { accountingAPI } = await import('../../services/api')
      await accountingAPI.deleteExpense(id)
      toast.success('Gider kaydı silindi')
      loadExpenses()
    } catch (error: any) {
      console.error('Failed to delete expense:', error)
      toast.error('Silme işlemi başarısız: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  const handleViewReceipt = (receiptUrl?: string) => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank')
    } else {
      toast.error('Makbuz bulunamadı')
    }
  }

  const handleExport = () => {
    // TODO: Implement CSV/Excel export
    toast.success('Dışa aktarma başlatıldı')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      paid: { label: 'Ödendi', color: 'bg-green-100 text-green-700' },
      pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
      cancelled: { label: 'İptal', color: 'bg-red-100 text-red-700' },
    }
    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
            <span className="text-sm opacity-90">Bu Ay</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{formatCurrency(monthlyExpense)}</h3>
          <p className="text-sm opacity-90">Aylık Gider</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <span className="text-sm opacity-90">Toplam</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{formatCurrency(totalExpense)}</h3>
          <p className="text-sm opacity-90">Toplam Gider</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText size={24} />
            </div>
            <span className="text-sm opacity-90">Kayıt</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{expenses.length}</h3>
          <p className="text-sm opacity-90">Gider Kaydı</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <PieChart size={20} />
              Kategori Dağılımı
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart Visualization (simplified) */}
            <div className="space-y-3">
              {categoryStats.slice(0, 5).map((stat) => (
                <div key={stat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                      <span className="text-sm font-medium text-neutral-700">{stat.category}</span>
                    </div>
                    <span className="text-sm text-neutral-600">{stat.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div
                      className={`${stat.color} h-2 rounded-full transition-all`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Top Categories */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3">En Yüksek Giderler</h4>
              {categoryStats.slice(0, 5).map((stat) => (
                <div key={stat.category} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{stat.category}</div>
                    <div className="text-xs text-neutral-600">{stat.count} kayıt</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neutral-900">
                      {formatCurrency(stat.total)}
                    </div>
                    <div className="text-xs text-neutral-600">{stat.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Gider ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">Tüm Kategoriler</option>
              <option value="Personel Maaşları">Personel Maaşları</option>
              <option value="Kira">Kira</option>
              <option value="Elektrik/Su/Doğalgaz">Elektrik/Su/Doğalgaz</option>
              <option value="Ekipman Bakım/Onarım">Ekipman Bakım/Onarım</option>
              <option value="Diğer">Diğer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">Tüm Durumlar</option>
              <option value="paid">Ödendi</option>
              <option value="pending">Beklemede</option>
              <option value="cancelled">İptal</option>
            </select>

            <button
              onClick={handleExport}
              className="px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              <span className="hidden lg:inline">Dışa Aktar</span>
            </button>

            <button
              onClick={() => {
                setEditingExpense(null)
                setModalOpen(true)
              }}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Yeni Gider</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-600">Yükleniyor...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-neutral-600">
            <FileText className="mx-auto mb-4 text-neutral-400" size={48} />
            <p className="text-lg font-medium">Gider kaydı bulunamadı</p>
            <p className="text-sm mt-2">Yeni gider ekleyerek başlayın</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Tutar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Ödeme</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Makbuz</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-neutral-400" />
                          <span className="text-sm text-neutral-900">{formatDate(expense.date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-900">{expense.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-neutral-600">{expense.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-red-600">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-neutral-600">{expense.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(expense.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {expense.receiptUrl ? (
                          <button
                            onClick={() => handleViewReceipt(expense.receiptUrl)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Eye size={16} />
                            <span className="text-xs">Görüntüle</span>
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-neutral-50 px-6 py-4 flex items-center justify-between border-t border-neutral-200">
              <div className="text-sm text-neutral-600">
                Sayfa {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <ExpenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingExpense(null)
        }}
        onSaved={loadExpenses}
        initial={editingExpense}
      />
    </div>
  )
}
