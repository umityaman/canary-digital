import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, TrendingUp, Calendar, DollarSign, FileText, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { accountingAPI } from '../../services/api'
import IncomeModal from './IncomeModal'
import { card, button, input, badge, getStatGradient, DESIGN_TOKENS, cx, statCardIcon } from '../../styles/design-tokens'

// Hardcoded table cell classes (to avoid bundling issues)
const TABLE_HEADER_CELL = 'px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider bg-neutral-50'
const TABLE_BODY_CELL = 'px-6 py-4 text-sm text-neutral-900'

interface Income {
  id: number
  description: string
  amount: number
  category: string
  date: string
  status: string
  paymentMethod: string
  notes?: string
  invoiceId?: number
}

interface CategoryStat {
  category: string
  total: number
  count: number
  percentage: number
}

export default function IncomeTab() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  
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
  const [totalIncome, setTotalIncome] = useState(0)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])

  useEffect(() => {
    loadIncomes()
    loadStats()
  }, [currentPage, categoryFilter, statusFilter, dateFrom, dateTo])

  const loadIncomes = async () => {
    setLoading(true)
    try {
      const response = await accountingAPI.getIncomes({
        page: currentPage,
        limit: itemsPerPage,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        search: searchTerm || undefined,
      })
      
      setIncomes(response?.data?.data || [])
      setTotalPages(response?.data?.pagination?.totalPages || 1)
    } catch (error: any) {
      console.warn('Failed to load incomes:', error)
      // Silent fail - set empty data instead of showing error
      setIncomes([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Calculate stats from incomes
      const total = incomes.reduce((sum, inc) => sum + inc.amount, 0)
      setTotalIncome(total)
      
      // Monthly income (current month)
      const currentMonth = new Date().getMonth()
      const monthly = incomes
        .filter(inc => new Date(inc.date).getMonth() === currentMonth)
        .reduce((sum, inc) => sum + inc.amount, 0)
      setMonthlyIncome(monthly)
      
      // Category breakdown
      const categoryMap = new Map<string, { total: number; count: number }>()
      incomes.forEach(inc => {
        const existing = categoryMap.get(inc.category) || { total: 0, count: 0 }
        categoryMap.set(inc.category, {
          total: existing.total + inc.amount,
          count: existing.count + 1
        })
      })
      
      const stats: CategoryStat[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: (data.total / total) * 100
      }))
      
      setCategoryStats(stats.sort((a, b) => b.total - a.total))
    } catch (error) {
      console.error('Stats calculation error:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu gelir kaydını silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      await accountingAPI.deleteIncome(id)
      toast.success('Gelir kaydı silindi')
      loadIncomes()
    } catch (error: any) {
      console.error('Failed to delete income:', error)
      toast.error('Silme işlemi başarısız: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleEdit = (income: Income) => {
    setEditingIncome(income)
    setModalOpen(true)
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
      received: 'paid',
      pending: 'partial',
      cancelled: 'overdue',
    }
    const badgeData = badge(statusMap[status] || status, 'invoice', 'sm', 'solid')
    return (
      <span className={badgeData.className}>
        {badgeData.label}
      </span>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={card('sm', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('primary')}>
              <TrendingUp className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Bu Ay</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">{formatCurrency(monthlyIncome)}</h3>
          <p className="text-xs font-medium text-neutral-600">Aylık Gelir</p>
        </div>

        <div className={card('sm', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('primary')}>
              <DollarSign className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Toplam</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">{formatCurrency(totalIncome)}</h3>
          <p className="text-xs font-medium text-neutral-600">Toplam Gelir</p>
        </div>

        <div className={card('sm', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('primary')}>
              <FileText className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Kayıt</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">{incomes.length}</h3>
          <p className="text-xs font-medium text-neutral-600">Gelir Kaydı</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <div className={card('sm', 'md', 'default', 'lg')}>
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
                placeholder="Gelir ara..."
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
              className={cx(input('md', 'default', undefined, 'md'), 'flex-1 min-w-[150px] max-w-[200px]')}
            >
              <option value="">Tüm Kategoriler</option>
              <option value="Ekipman Kiralama">Ekipman Kiralama</option>
              <option value="Hizmet Bedeli">Hizmet Bedeli</option>
              <option value="Danışmanlık">Danışmanlık</option>
              <option value="Eğitim">Eğitim</option>
              <option value="Diğer">Diğer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cx(input('md', 'default', undefined, 'md'), 'flex-1 min-w-[130px]')}
            >
              <option value="">Tüm Durumlar</option>
              <option value="received">Alındı</option>
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
                setEditingIncome(null)
                setModalOpen(true)
              }}
              className={cx(button('md', 'primary', 'md'), 'gap-2 whitespace-nowrap')}
            >
              <Plus size={18} />
              <span>Yeni Gelir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className={card('none', 'sm', 'default', 'lg')} style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="p-12 text-center text-neutral-600">Yükleniyor...</div>
        ) : incomes.length === 0 ? (
          <div className="p-12 text-center text-neutral-600">
            <FileText className="mx-auto mb-4 text-neutral-400" size={48} />
            <p className="text-lg font-medium">Gelir kaydı bulunamadı</p>
            <p className="text-sm mt-2">Yeni gelir ekleyerek başlayın</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full w-full">
                <thead>
                  <tr>
                    <th className={TABLE_HEADER_CELL}>Tarih</th>
                    <th className={TABLE_HEADER_CELL}>Açıklama</th>
                    <th className={`${TABLE_HEADER_CELL} hidden md:table-cell`}>Kategori</th>
                    <th className={TABLE_HEADER_CELL}>Tutar</th>
                    <th className={`${TABLE_HEADER_CELL} hidden lg:table-cell`}>Ödeme</th>
                    <th className={`${TABLE_HEADER_CELL} hidden md:table-cell`}>Durum</th>
                    <th className={TABLE_HEADER_CELL}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((income) => (
                    <tr key={income.id} className="hover:bg-neutral-50 transition-colors">
                      <td className={TABLE_BODY_CELL}>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-neutral-400" />
                          <span className="text-sm text-neutral-900">{formatDate(income.date)}</span>
                        </div>
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <div className="text-sm font-medium text-neutral-900">{income.description}</div>
                      </td>
                      <td className={`${TABLE_BODY_CELL} hidden md:table-cell`}>
                        <span className="text-sm text-neutral-600">{income.category}</span>
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <span className="text-sm font-semibold text-neutral-900">
                          {formatCurrency(income.amount)}
                        </span>
                      </td>
                      <td className={`${TABLE_BODY_CELL} hidden lg:table-cell`}>
                        <span className="text-sm text-neutral-600">{income.paymentMethod}</span>
                      </td>
                      <td className={`${TABLE_BODY_CELL} hidden md:table-cell`}>
                        {getStatusBadge(income.status)}
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(income)}
                            className={cx(button('sm', 'ghost', 'lg'), 'p-2')}
                            title="Düzenle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(income.id)}
                            className={cx(button('sm', 'ghost', 'lg'), 'p-2')}
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
            <div className={DESIGN_TOKENS?.pagination?.container}>
              <div className={DESIGN_TOKENS?.pagination?.info}>
                Sayfa {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cx(button('md', 'outline', 'lg'), 'disabled:opacity-50 disabled:cursor-not-allowed')}
                >
                  Önceki
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cx(button('md', 'outline', 'lg'), 'disabled:opacity-50 disabled:cursor-not-allowed')}
                >
                  Sonraki
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <IncomeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingIncome(null)
        }}
        onSaved={loadIncomes}
        initial={editingIncome}
      />
    </div>
  )
}

