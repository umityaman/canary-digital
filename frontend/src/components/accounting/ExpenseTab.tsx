import { 
  TrendingDown, Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  Edit2, Trash2, Plus, Download, FileText
} from 'lucide-react'
import { exportExpenseToExcel, exportExpenseToPDF } from '../../utils/exportUtils'

interface Expense {
  id: number
  companyId: number
  description: string
  amount: number
  category: string
  date: string
  status: string
  paymentMethod?: string
  notes?: string
  invoiceId?: number
  createdAt: string
  updatedAt: string
}

interface ExpenseTabProps {
  expenses: Expense[]
  loading: boolean
  search: string
  categoryFilter: string
  statusFilter: string
  currentPage: number
  totalPages: number
  total: number
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSearch: () => void
  onPageChange: (page: number) => void
  onEdit: (expense: Expense) => void
  onDelete: (id: number) => void
  onCreate: () => void
}

const EXPENSE_CATEGORIES = [
  'Personel Maaşı',
  'Kira',
  'Elektrik',
  'Su',
  'İnternet',
  'Telefon',
  'Yakıt',
  'Bakım Onarım',
  'Malzeme Alımı',
  'Vergi',
  'Sigorta',
  'Pazarlama',
  'Nakliye',
  'Danışmanlık',
  'Diğer Gider',
]

const EXPENSE_STATUS = [
  { value: 'paid', label: 'Ödendi' },
  { value: 'pending', label: 'Bekliyor' },
  { value: 'cancelled', label: 'İptal' },
]

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Nakit' },
  { value: 'bank_transfer', label: 'Banka Transferi' },
  { value: 'credit_card', label: 'Kredi Kartı' },
  { value: 'check', label: 'Çek' },
  { value: 'other', label: 'Diğer' },
]

export default function ExpenseTab({
  expenses,
  loading,
  search,
  categoryFilter,
  statusFilter,
  currentPage,
  totalPages,
  total,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSearch,
  onPageChange,
  onEdit,
  onDelete,
  onCreate,
}: ExpenseTabProps) {
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
      pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-700' },
      cancelled: { label: 'İptal', color: 'bg-red-100 text-red-700' },
    }
    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return '-'
    const pm = PAYMENT_METHODS.find(p => p.value === method)
    return pm?.label || method
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Gider Listesi</h2>
          {total > 0 && (
            <p className="text-sm text-neutral-600 mt-1">
              Toplam Gider: <span className="font-bold text-red-600">{formatCurrency(total)}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {/* Export Buttons */}
          {expenses.length > 0 && (
            <>
              <button
                onClick={() => exportExpenseToExcel(expenses)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                title="Excel'e Aktar"
              >
                <Download size={18} />
                Excel
              </button>
              <button
                onClick={() => exportExpenseToPDF(expenses)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                title="PDF'e Aktar"
              >
                <FileText size={18} />
                PDF
              </button>
            </>
          )}
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Yeni Gider Ekle
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Açıklama ara..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-neutral-400" size={18} />
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 appearance-none"
            >
              <option value="">Tüm Kategoriler</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-neutral-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 appearance-none"
            >
              <option value="">Tüm Durumlar</option>
              {EXPENSE_STATUS.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Ara
          </button>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-600">
            <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
            Giderler yükleniyor...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-neutral-600">
            <TrendingDown className="mx-auto mb-4 text-neutral-400" size={48} />
            <p className="text-lg font-medium">Gider kaydı bulunamadı</p>
            <p className="text-sm mt-2">Yeni gider kaydı oluşturarak başlayın</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-neutral-700 uppercase w-24">
                      Tarih
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-neutral-700 uppercase w-40">
                      Açıklama
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-neutral-700 uppercase w-28">
                      Kategori
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-neutral-700 uppercase w-24">
                      Tutar
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-neutral-700 uppercase w-28">
                      Ödeme
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-neutral-700 uppercase w-24">
                      Durum
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-neutral-700 uppercase w-20">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-2 py-2">
                        <div className="text-xs font-medium text-neutral-900 truncate max-w-[160px]" title={expense.description}>
                          {expense.description}
                        </div>
                        {expense.notes && (
                          <div className="text-xs text-neutral-500 truncate max-w-[160px]" title={expense.notes}>
                            {expense.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">{expense.category}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-bold text-red-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        {getPaymentMethodLabel(expense.paymentMethod)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        {getStatusBadge(expense.status)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEdit(expense)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Düzenle"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(expense.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Sil"
                          >
                            <Trash2 size={14} />
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
                Sayfa {currentPage} / {totalPages} ({expenses.length} kayıt)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { EXPENSE_CATEGORIES, EXPENSE_STATUS, PAYMENT_METHODS }
export type { Expense }
