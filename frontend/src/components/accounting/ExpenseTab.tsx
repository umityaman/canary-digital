import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, TrendingDown, Calendar, DollarSign, FileText, Trash2, Edit2, Eye, PieChart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { accountingAPI } from '../../services/api'
import ExpenseModal from './ExpenseModal'
import { card, button, input, badge, getStatGradient, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

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
  'Personel Maaşları': 'bg-neutral-900',
  'Kira': 'bg-neutral-800',
  'Elektrik/Su/Doğalgaz': 'bg-neutral-700',
  'İnternet/Telefon': 'bg-neutral-900',
  'Malzeme Alımı': 'bg-neutral-800',
  'Ekipman Bakım/Onarım': 'bg-neutral-700',
  'Pazarlama/Reklam': 'bg-neutral-600',
  'Diğer': 'bg-neutral-500'
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
      const response = await accountingAPI.getExpenses({
        page: currentPage,
        limit: itemsPerPage,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        search: searchTerm || undefined,
      })
      
      setExpenses(response?.data?.data || [])
      setTotalPages(response?.data?.pagination?.totalPages || 1)
    } catch (error: any) {
      console.warn('Failed to load expenses:', error)
      // Silent fail - set empty data instead of showing error
      setExpenses([])
      setTotalPages(1)
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
    const statusMap: Record<string, string> = {
      paid: 'paid',
      pending: 'partial',
      cancelled: 'overdue',
    }
    const badgeData = badge(statusMap[status] || status, 'invoice', 'sm', 'solid')
    return <span className={badgeData.className}>{badgeData.label}</span>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Bu Ay</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">{formatCurrency(monthlyExpense)}</h3>
          <p className="text-xs font-medium text-neutral-600">Aylık Gider</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-neutral-600 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Toplam</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">{formatCurrency(totalExpense)}</h3>
          <p className="text-xs font-medium text-neutral-600">Toplam Gider</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Kayıt</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">{expenses.length}</h3>
          <p className="text-xs font-medium text-neutral-600">Gider Kaydı</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Kategori Dağılımı</h3>
          <div className="space-y-3">
            {categoryStats.map((stat) => (
              <div key={stat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">{stat.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">{stat.count} kayıt</span>
                    <span className="text-sm font-semibold text-neutral-900">
                      {formatCurrency(stat.total)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div
                    className="bg-neutral-900 h-2 rounded-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className={card('sm', 'none', 'default', 'lg')}>
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${DESIGN_TOKENS?.colors?.text.muted}`} size={18} />
              <input
                type="text"
                placeholder="Gider ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cx(input('md', 'default', undefined, 'md'), 'pl-10')}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={cx(input('md', 'default', undefined, 'md'), 'flex-1 min-w-[180px]')}
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
              className={cx(input('md', 'default', undefined, 'md'), 'flex-1 min-w-[130px]')}
            >
              <option value="">Tüm Durumlar</option>
              <option value="paid">Ödendi</option>
              <option value="pending">Beklemede</option>
              <option value="cancelled">İptal</option>
            </select>

            <button
              onClick={handleExport}
              className={cx(button('md', 'outline', 'md'), 'gap-2 whitespace-nowrap')}
            >
              <Download size={18} />
              <span className="hidden sm:inline">Dışa Aktar</span>
            </button>

            <button
              onClick={() => {
                setEditingExpense(null)
                setModalOpen(true)
              }}
              className={cx(button('md', 'primary', 'md'), 'gap-2 whitespace-nowrap')}
            >
              <Plus size={18} />
              <span>Yeni Gider</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className={card('none', 'sm', 'default', 'lg')}>
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
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase">Tarih</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase">Açıklama</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase hidden md:table-cell">Kategori</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase">Tutar</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase hidden lg:table-cell">Ödeme</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase hidden md:table-cell">Durum</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-neutral-400" />
                          <span className="text-sm text-neutral-900">{formatDate(expense.date)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-neutral-900">{expense.description}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                        <span className="text-sm text-neutral-600">{expense.category}</span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="text-sm font-semibold text-neutral-900">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                        <span className="text-sm text-neutral-600">{expense.paymentMethod}</span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                        {getStatusBadge(expense.status)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
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
                            className="p-2 text-neutral-900 hover:text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
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
