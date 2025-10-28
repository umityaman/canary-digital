import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calculator, DollarSign, TrendingUp, TrendingDown, FileText, Users,
  CreditCard, Banknote, Building2, Receipt, BarChart3,
  PieChart, Settings, Download, Upload, RefreshCw, Clock, Globe,
  Search, Filter, ChevronLeft, ChevronRight, Check, X, Plug
} from 'lucide-react'
import { accountingAPI, invoiceAPI, offerAPI } from '../services/api'
import { toast } from 'react-hot-toast'
import IncomeTab from '../components/accounting/IncomeTab'
import ExpenseTab from '../components/accounting/ExpenseTab'
import IncomeModal from '../components/accounting/IncomeModal'
import ExpenseModal from '../components/accounting/ExpenseModal'
import InvoiceModal from '../components/accounting/InvoiceModal'
import OfferModal from '../components/accounting/OfferModal'
import ChecksTab from '../components/accounting/ChecksTab'
import PromissoryNotesTab from '../components/accounting/PromissoryNotesTab'
import AgingAnalysis from '../components/AgingAnalysis'
import AccountCards from '../components/AccountCards'
import Integrations from './Integrations'
import AdvancedFilter, { FilterState } from '../components/AdvancedFilter'
import { IncomeExpenseChart } from '../components/accounting/IncomeExpenseChart'
import { CategoryPieChart } from '../components/accounting/CategoryPieChart'
import { DateRangePicker } from '../components/common/DateRangePicker'
import { exportFinancialSummaryToPDF } from '../utils/exportUtils'
import FinancialReports from '../components/accounting/FinancialReports'
import type { Income } from '../components/accounting/IncomeTab'
import type { Expense } from '../components/accounting/ExpenseTab'

type Tab = 'dashboard' | 'income' | 'expense' | 'checks' | 'promissory-notes' | 'aging' | 'account-cards' | 'preaccounting' | 'reports' | 'invoice' | 'offer' | 'ebelge' | 'integration' | 'tools' | 'advisor' | 'support'

interface AccountingStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  totalCollections: number
  totalOverdue: number
  invoiceCount: number
  period: {
    start: string
    end: string
  }
}

interface Invoice {
  id: number
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  vatAmount: number
  grandTotal: number
  paidAmount: number
  status: string
  type: string
  customer: {
    id: number
    name: string
    email: string
    phone: string
    taxNumber?: string
  }
  order?: {
    id: number
    orderNumber?: string
    orderItems?: Array<{
      equipment: {
        name: string
      }
    }>
  }
  payments: Array<{
    id: number
    amount: number
    paymentDate: string
    paymentMethod: string
  }>
}

interface Offer {
  id: number
  offerNumber: string
  offerDate: string
  validUntil: string
  totalAmount: number
  vatAmount: number
  grandTotal: number
  status: string
  notes?: string
  customer: {
    id: number
    name: string
    email: string
    phone: string
    company?: string
  }
  items: Array<{
    equipmentId: number
    description: string
    quantity: number
    unitPrice: number
    days: number
    discountPercentage?: number
  }>
}

export default function Accounting() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [agingType, setAgingType] = useState<'checks' | 'promissory-notes' | 'combined'>('combined')
  const [stats, setStats] = useState<AccountingStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Chart data state
  const [chartData, setChartData] = useState<any>(null)
  const [chartLoading, setChartLoading] = useState(false)
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null)
  
  // Invoice list state
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Offer list state
  const [offers, setOffers] = useState<Offer[]>([])
  const [offersLoading, setOffersLoading] = useState(false)
  const [offerSearch, setOfferSearch] = useState('')
  const [offerStatusFilter, setOfferStatusFilter] = useState<string>('')
  const [offerCurrentPage, setOfferCurrentPage] = useState(1)
  const [offerTotalPages, setOfferTotalPages] = useState(1)

  // Income list state
  const [incomes, setIncomes] = useState<Income[]>([])
  const [incomesLoading, setIncomesLoading] = useState(false)
  const [incomeSearch, setIncomeSearch] = useState('')
  const [incomeCategoryFilter, setIncomeCategoryFilter] = useState<string>('')
  const [incomeStatusFilter, setIncomeStatusFilter] = useState<string>('')
  const [incomeCurrentPage, setIncomeCurrentPage] = useState(1)
  const [incomeTotalPages, setIncomeTotalPages] = useState(1)
  const [incomeTotal, setIncomeTotal] = useState(0)

  // Expense list state
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expensesLoading, setExpensesLoading] = useState(false)
  const [expenseSearch, setExpenseSearch] = useState('')
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('')
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<string>('')
  const [expenseCurrentPage, setExpenseCurrentPage] = useState(1)
  const [expenseTotalPages, setExpenseTotalPages] = useState(1)
  const [expenseTotal, setExpenseTotal] = useState(0)

  // Advanced filter state
  const [incomeAdvancedFilters, setIncomeAdvancedFilters] = useState<FilterState>({})
  const [expenseAdvancedFilters, setExpenseAdvancedFilters] = useState<FilterState>({})

  // Modal state
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)

  // Load accounting stats on mount and when date range changes
  useEffect(() => {
    loadStats()
    loadChartData()
  }, [dateRange])

  // Load invoices when invoice tab is active
  useEffect(() => {
    if (activeTab === 'invoice') {
      loadInvoices()
    }
  }, [activeTab, currentPage, invoiceStatusFilter])

  // Load offers when offer tab is active
  useEffect(() => {
    if (activeTab === 'offer') {
      loadOffers()
    }
  }, [activeTab, offerCurrentPage, offerStatusFilter])

  // Load incomes when income tab is active
  useEffect(() => {
    if (activeTab === 'income') {
      loadIncomes()
    }
  }, [activeTab, incomeCurrentPage, incomeCategoryFilter, incomeStatusFilter, incomeAdvancedFilters])

  // Load expenses when expense tab is active
  useEffect(() => {
    if (activeTab === 'expense') {
      loadExpenses()
    }
  }, [activeTab, expenseCurrentPage, expenseCategoryFilter, expenseStatusFilter, expenseAdvancedFilters])

  const loadStats = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading accounting stats...', dateRange ? 'with date range' : 'all time')
      const params = dateRange ? { 
        startDate: dateRange.startDate, 
        endDate: dateRange.endDate 
      } : undefined
      const response = await accountingAPI.getStats(params)
      console.log('✅ Stats response:', response.data)
      setStats(response.data.data)
    } catch (error: any) {
      console.error('❌ Failed to load accounting stats:', error)
      console.error('Error details:', error.response?.data)
      toast.error('İstatistikler yüklenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async () => {
    try {
      setChartLoading(true)
      console.log('📊 Loading chart data...', dateRange ? 'with date range' : '12 months')
      const params = dateRange ? {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      } : { months: 12 }
      const response = await accountingAPI.getChartData(params)
      console.log('✅ Chart data response:', response.data)
      setChartData(response.data.data)
    } catch (error: any) {
      console.error('❌ Failed to load chart data:', error)
      toast.error('Grafik verileri yüklenemedi')
    } finally {
      setChartLoading(false)
    }
  }

  const loadInvoices = async () => {
    try {
      setInvoicesLoading(true)
      console.log('🔍 Loading invoices...', { invoiceStatusFilter, invoiceSearch, currentPage })
      const response = await invoiceAPI.getAll({
        status: invoiceStatusFilter || undefined,
        search: invoiceSearch || undefined,
        page: currentPage,
        limit: 10,
      })
      console.log('✅ Invoices response:', response.data)
      setInvoices(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error: any) {
      console.error('❌ Failed to load invoices:', error)
      console.error('Error details:', error.response?.data)
      toast.error('Faturalar yüklenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setInvoicesLoading(false)
    }
  }

  const handleSearchInvoices = () => {
    setCurrentPage(1)
    loadInvoices()
  }

  const loadOffers = async () => {
    try {
      setOffersLoading(true)
      console.log('🔍 Loading offers...', { offerStatusFilter, offerSearch, offerCurrentPage })
      const response = await offerAPI.getAll({
        status: offerStatusFilter || undefined,
        search: offerSearch || undefined,
        page: offerCurrentPage,
        limit: 10,
      })
      console.log('✅ Offers response:', response.data)
      setOffers(response.data.data)
      setOfferTotalPages(response.data.pagination.totalPages)
    } catch (error: any) {
      console.error('❌ Failed to load offers:', error)
      console.error('Error details:', error.response?.data)
      toast.error('Teklifler yüklenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setOffersLoading(false)
    }
  }

  const handleSearchOffers = () => {
    setOfferCurrentPage(1)
    loadOffers()
  }

  const handleOfferStatusUpdate = async (offerId: number, status: string) => {
    try {
      await offerAPI.updateStatus(offerId, status)
      toast.success('Teklif durumu güncellendi')
      loadOffers()
    } catch (error: any) {
      console.error('Failed to update offer status:', error)
      toast.error('Durum güncellenemedi')
    }
  }

  const loadIncomes = async () => {
    try {
      setIncomesLoading(true)
      console.log('🔍 Loading incomes...', { incomeCategoryFilter, incomeStatusFilter, incomeSearch, incomeCurrentPage, incomeAdvancedFilters })
      
      // Build query params from both simple and advanced filters
      const queryParams: any = {
        page: incomeCurrentPage,
        limit: 10,
      };

      // Simple filters (for backward compatibility)
      if (incomeCategoryFilter) queryParams.category = incomeCategoryFilter;
      if (incomeStatusFilter) queryParams.status = incomeStatusFilter;
      if (incomeSearch) queryParams.search = incomeSearch;

      // Advanced filters override
      if (incomeAdvancedFilters.categories && incomeAdvancedFilters.categories.length > 0) {
        queryParams.category = incomeAdvancedFilters.categories.join(',');
      }
      if (incomeAdvancedFilters.status && incomeAdvancedFilters.status.length > 0) {
        queryParams.status = incomeAdvancedFilters.status.join(',');
      }
      if (incomeAdvancedFilters.searchTerm) {
        queryParams.search = incomeAdvancedFilters.searchTerm;
      }
      if (incomeAdvancedFilters.amountMin !== undefined) {
        queryParams.minAmount = incomeAdvancedFilters.amountMin;
      }
      if (incomeAdvancedFilters.amountMax !== undefined) {
        queryParams.maxAmount = incomeAdvancedFilters.amountMax;
      }
      if (incomeAdvancedFilters.dateRange?.start) {
        queryParams.startDate = incomeAdvancedFilters.dateRange.start;
      }
      if (incomeAdvancedFilters.dateRange?.end) {
        queryParams.endDate = incomeAdvancedFilters.dateRange.end;
      }
      
      const response = await accountingAPI.getIncomes(queryParams)
      console.log('✅ Incomes response:', response.data)
      setIncomes(response.data.data)
      setIncomeTotalPages(response.data.pagination?.totalPages || 1)
      setIncomeTotal(response.data.total || 0)
    } catch (error: any) {
      console.error('❌ Failed to load incomes:', error)
      console.error('Error details:', error.response?.data)
      toast.error('Gelirler yüklenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setIncomesLoading(false)
    }
  }

  const handleSearchIncomes = () => {
    setIncomeCurrentPage(1)
    loadIncomes()
  }

  const handleCreateIncome = () => {
    setEditingIncome(null)
    setShowIncomeModal(true)
  }

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income)
    setShowIncomeModal(true)
  }

  const handleDeleteIncome = async (id: number) => {
    if (!window.confirm('Bu gelir kaydını silmek istediğinize emin misiniz?')) return
    
    try {
      await accountingAPI.deleteIncome(id)
      toast.success('Gelir kaydı silindi')
      loadIncomes()
    } catch (error: any) {
      console.error('Failed to delete income:', error)
      toast.error('Silme işlemi başarısız')
    }
  }

  const loadExpenses = async () => {
    try {
      setExpensesLoading(true)
      console.log('🔍 Loading expenses...', { expenseCategoryFilter, expenseStatusFilter, expenseSearch, expenseCurrentPage, expenseAdvancedFilters })
      
      // Build query params from both simple and advanced filters
      const queryParams: any = {
        page: expenseCurrentPage,
        limit: 10,
      };

      // Simple filters (for backward compatibility)
      if (expenseCategoryFilter) queryParams.category = expenseCategoryFilter;
      if (expenseStatusFilter) queryParams.status = expenseStatusFilter;
      if (expenseSearch) queryParams.search = expenseSearch;

      // Advanced filters override
      if (expenseAdvancedFilters.categories && expenseAdvancedFilters.categories.length > 0) {
        queryParams.category = expenseAdvancedFilters.categories.join(',');
      }
      if (expenseAdvancedFilters.status && expenseAdvancedFilters.status.length > 0) {
        queryParams.status = expenseAdvancedFilters.status.join(',');
      }
      if (expenseAdvancedFilters.searchTerm) {
        queryParams.search = expenseAdvancedFilters.searchTerm;
      }
      if (expenseAdvancedFilters.amountMin !== undefined) {
        queryParams.minAmount = expenseAdvancedFilters.amountMin;
      }
      if (expenseAdvancedFilters.amountMax !== undefined) {
        queryParams.maxAmount = expenseAdvancedFilters.amountMax;
      }
      if (expenseAdvancedFilters.dateRange?.start) {
        queryParams.startDate = expenseAdvancedFilters.dateRange.start;
      }
      if (expenseAdvancedFilters.dateRange?.end) {
        queryParams.endDate = expenseAdvancedFilters.dateRange.end;
      }
      
      const response = await accountingAPI.getExpenses(queryParams)
      console.log('✅ Expenses response:', response.data)
      setExpenses(response.data.data)
      setExpenseTotalPages(response.data.pagination?.totalPages || 1)
      setExpenseTotal(response.data.total || 0)
    } catch (error: any) {
      console.error('❌ Failed to load expenses:', error)
      console.error('Error details:', error.response?.data)
      toast.error('Giderler yüklenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setExpensesLoading(false)
    }
  }

  const handleSearchExpenses = () => {
    setExpenseCurrentPage(1)
    loadExpenses()
  }

  const handleCreateExpense = () => {
    setEditingExpense(null)
    setShowExpenseModal(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setShowExpenseModal(true)
  }

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm('Bu gider kaydını silmek istediğinize emin misiniz?')) return
    
    try {
      await accountingAPI.deleteExpense(id)
      toast.success('Gider kaydı silindi')
      loadExpenses()
    } catch (error: any) {
      console.error('Failed to delete expense:', error)
      toast.error('Silme işlemi başarısız')
    }
  }

  // Advanced filter handlers
  const handleApplyIncomeFilter = (filters: FilterState) => {
    setIncomeAdvancedFilters(filters)
    setIncomeCurrentPage(1)
  }

  const handleClearIncomeFilter = () => {
    setIncomeAdvancedFilters({})
    setIncomeCurrentPage(1)
  }

  const handleApplyExpenseFilter = (filters: FilterState) => {
    setExpenseAdvancedFilters(filters)
    setExpenseCurrentPage(1)
  }

  const handleClearExpenseFilter = () => {
    setExpenseAdvancedFilters({})
    setExpenseCurrentPage(1)
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
      draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-700' },
      sent: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-700' },
      paid: { label: 'Ödendi', color: 'bg-green-100 text-green-700' },
      partial_paid: { label: 'Kısmi Ödeme', color: 'bg-yellow-100 text-yellow-700' },
      cancelled: { label: 'İptal', color: 'bg-red-100 text-red-700' },
      overdue: { label: 'Vadesi Geçmiş', color: 'bg-orange-100 text-orange-700' },
    }
    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const getOfferStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-700' },
      sent: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-700' },
      accepted: { label: 'Kabul Edildi', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
      converted: { label: 'Faturaya Dönüştü', color: 'bg-purple-100 text-purple-700' },
      expired: { label: 'Süresi Doldu', color: 'bg-orange-100 text-orange-700' },
    }
    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Ana Sayfa', icon: <BarChart3 size={18} /> },
    { id: 'income' as const, label: 'Gelirler', icon: <TrendingUp size={18} /> },
    { id: 'expense' as const, label: 'Giderler', icon: <TrendingDown size={18} /> },
    { id: 'checks' as const, label: 'Çekler', icon: <Banknote size={18} /> },
    { id: 'promissory-notes' as const, label: 'Senetler', icon: <FileText size={18} /> },
    { id: 'aging' as const, label: 'Yaşlandırma Raporu', icon: <Clock size={18} /> },
    // { id: 'account-cards' as const, label: 'Cari Hesap', icon: <Users size={18} /> }, // TEMPORARILY HIDDEN: DB migration needed
    { id: 'preaccounting' as const, label: 'Ön Muhasebe', icon: <Calculator size={18} /> },
    { id: 'reports' as const, label: 'Raporlar', icon: <PieChart size={18} /> },
    { id: 'invoice' as const, label: 'Fatura Takibi', icon: <Receipt size={18} /> },
    { id: 'offer' as const, label: 'Teklif Yönetimi', icon: <CreditCard size={18} /> },
    { id: 'ebelge' as const, label: 'e-Belge', icon: <Building2 size={18} /> },
    { id: 'integration' as const, label: 'Entegrasyonlar', icon: <Plug size={18} /> },
    { id: 'tools' as const, label: 'İşletme Kolaylıkları', icon: <Settings size={18} /> },
    { id: 'advisor' as const, label: 'Mali Müşavir', icon: <Users size={18} /> },
    { id: 'support' as const, label: 'Yardım & Araçlar', icon: <Globe size={18} /> },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Bu Ay Gelir */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-neutral-700" size={20} />
            </div>
            {stats && stats.invoiceCount > 0 && (
              <span className="text-xs text-neutral-700 font-medium">
                {stats.invoiceCount} fatura
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">
            {loading ? '...' : stats ? formatCurrency(stats.totalRevenue) : '₺0'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600">Bu Ay Gelir</p>
        </div>

        {/* Bu Ay Gider */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-neutral-700" size={20} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">
            {loading ? '...' : stats ? formatCurrency(stats.totalExpenses) : '₺0'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600">Bu Ay Gider</p>
        </div>

        {/* Net Kâr */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-neutral-700" size={20} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Net</span>
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold mb-1 ${
            stats && stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {loading ? '...' : stats ? formatCurrency(stats.netProfit) : '₺0'}
          </h3>
          <p className="text-sm text-neutral-600">Net Kâr</p>
        </div>

        {/* Tahsilat / Bekleyen */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Clock className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bekleyen</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">
            {loading ? '...' : stats ? formatCurrency(stats.totalOverdue) : '₺0'}
          </h3>
          <p className="text-sm text-neutral-600">Vade Geçmiş</p>
          {stats && stats.totalCollections > 0 && (
            <p className="text-xs text-green-600 mt-2">
              Bu ay: {formatCurrency(stats.totalCollections)}
            </p>
          )}
        </div>
      </div>

      {/* Tabs - Vertical Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Tabs - Horizontal scroll on mobile, vertical on desktop */}
          <nav className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-neutral-200 flex-shrink-0 overflow-x-auto lg:overflow-x-visible">
            <div className="flex lg:flex-col min-w-max lg:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-auto lg:w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-3 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
            </div>
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-4 sm:p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-900">Genel Bakış</h2>
                  
                  <div className="flex gap-2 items-center">
                    {/* Export Financial Summary */}
                    {incomes.length > 0 && expenses.length > 0 && (
                      <button
                        onClick={() => exportFinancialSummaryToPDF(incomes, expenses)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
                        title="Mali Özet PDF"
                      >
                        <Download size={18} />
                        Mali Özet PDF
                      </button>
                    )}
                    
                    {/* Date Range Filter */}
                    <DateRangePicker
                      value={dateRange || undefined}
                      onChange={(range) => setDateRange(range)}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-medium text-neutral-700 mb-3">Hızlı İşlemler</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => navigate('/invoices/create')}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-neutral-900">Hızlı Fatura Kes</h3>
                      <FileText className="text-neutral-700" size={24} />
                    </div>
                    <p className="text-sm text-neutral-600">Yeni fatura oluştur</p>
                  </button>

                  <button 
                    onClick={handleCreateIncome}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-neutral-900">Gelir Ekle</h3>
                      <TrendingUp className="text-neutral-700" size={24} />
                    </div>
                    <p className="text-sm text-neutral-600">Yeni gelir kaydı</p>
                  </button>

                  <button 
                    onClick={handleCreateExpense}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-neutral-900">Gider Ekle</h3>
                      <TrendingDown className="text-neutral-700" size={24} />
                    </div>
                    <p className="text-sm text-neutral-600">Yeni gider kaydı</p>
                  </button>
                </div>

                {/* Charts Section */}
                {chartLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="animate-spin text-neutral-400" size={32} />
                  </div>
                ) : chartData ? (
                  <>
                    {/* Trend Chart */}
                    <div className="mt-8">
                      <IncomeExpenseChart data={chartData.trend} />
                    </div>

                    {/* Category Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <CategoryPieChart
                        data={chartData.incomeCategories}
                        title="Gelir Kategorileri (Son 3 Ay)"
                        type="income"
                      />
                      <CategoryPieChart
                        data={chartData.expenseCategories}
                        title="Gider Kategorileri (Son 3 Ay)"
                        type="expense"
                      />
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* Pre-Accounting Tab */}
            {activeTab === 'preaccounting' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Ön Muhasebe Yönetimi</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <TrendingUp className="mr-2 text-neutral-700" size={20} />
                      Gelir-Gider Takibi
                    </h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Gelir Takibi</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Gider Takibi</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Gider Kategorileri</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Banka Mutabakatı</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Users className="mr-2 text-neutral-700" size={20} />
                      Cari Hesap Takibi
                    </h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Cari Hesap Ekstresi</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>İşlem Geçmişi</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Çek/Nakit Girişi</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Banknote className="mr-2 text-neutral-700" size={20} />
                      Nakit Yönetimi
                    </h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Kasa ve Banka</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Ödeme Hatırlatma</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>Çek Takibi</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <FinancialReports invoices={invoices} offers={offers} />
            )}

            {/* Income Tab */}
            {activeTab === 'income' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <AdvancedFilter
                    onApplyFilter={handleApplyIncomeFilter}
                    onClearFilter={handleClearIncomeFilter}
                    availableCategories={[
                      'Ürün Satışı',
                      'Hizmet Bedeli',
                      'Ekipman Kiralama',
                      'Danışmanlık',
                      'Eğitim',
                      'Komisyon',
                      'Faiz Geliri',
                      'Diğer Gelir',
                    ]}
                    availableStatuses={['paid', 'pending', 'cancelled']}
                    availablePaymentMethods={['Nakit', 'Kredi Kartı', 'Banka Transferi', 'Çek', 'Senet']}
                  />
                </div>
                <IncomeTab
                  incomes={incomes}
                  loading={incomesLoading}
                  search={incomeSearch}
                  categoryFilter={incomeCategoryFilter}
                  statusFilter={incomeStatusFilter}
                  currentPage={incomeCurrentPage}
                  totalPages={incomeTotalPages}
                  total={incomeTotal}
                  onSearchChange={setIncomeSearch}
                  onCategoryChange={setIncomeCategoryFilter}
                  onStatusChange={setIncomeStatusFilter}
                  onSearch={handleSearchIncomes}
                  onPageChange={setIncomeCurrentPage}
                  onEdit={handleEditIncome}
                  onDelete={handleDeleteIncome}
                  onCreate={handleCreateIncome}
                />
              </div>
            )}

            {/* Expense Tab */}
            {activeTab === 'expense' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <AdvancedFilter
                    onApplyFilter={handleApplyExpenseFilter}
                    onClearFilter={handleClearExpenseFilter}
                    availableCategories={[
                      'Maaşlar',
                      'Kira',
                      'Elektrik',
                      'Su',
                      'İnternet',
                      'Telefon',
                      'Ofis Malzemeleri',
                      'Yemek',
                      'Ulaşım',
                      'Pazarlama',
                      'Muhasebe',
                      'Vergi',
                      'Sigorta',
                      'Bakım Onarım',
                      'Diğer Gider',
                    ]}
                    availableStatuses={['paid', 'pending', 'cancelled']}
                    availablePaymentMethods={['Nakit', 'Kredi Kartı', 'Banka Transferi', 'Çek', 'Senet']}
                  />
                </div>
                <ExpenseTab
                  expenses={expenses}
                  loading={expensesLoading}
                  search={expenseSearch}
                  categoryFilter={expenseCategoryFilter}
                  statusFilter={expenseStatusFilter}
                  currentPage={expenseCurrentPage}
                  totalPages={expenseTotalPages}
                  total={expenseTotal}
                  onSearchChange={setExpenseSearch}
                  onCategoryChange={setExpenseCategoryFilter}
                  onStatusChange={setExpenseStatusFilter}
                  onSearch={handleSearchExpenses}
                  onPageChange={setExpenseCurrentPage}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
                  onCreate={handleCreateExpense}
                />
              </div>
            )}

            {/* Checks Tab */}
            {activeTab === 'checks' && (
              <ChecksTab />
            )}

            {/* Promissory Notes Tab */}
            {activeTab === 'promissory-notes' && (
              <PromissoryNotesTab />
            )}

            {/* Aging Analysis Tab */}
            {activeTab === 'aging' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Yaşlandırma Raporu</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Çek ve senetlerinizin vade durumunu analiz edin
                  </p>
                </div>

                {/* Sub-tabs for different analysis types */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                  <div className="flex gap-4">
                    <button
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        agingType === 'checks'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setAgingType('checks')}
                    >
                      Çekler
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        agingType === 'promissory-notes'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setAgingType('promissory-notes')}
                    >
                      Senetler
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        agingType === 'combined'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setAgingType('combined')}
                    >
                      Tümü
                    </button>
                  </div>
                </div>

                <AgingAnalysis type={agingType} />
              </div>
            )}

            {/* Account Cards Tab */}
            {activeTab === 'account-cards' && (
              <AccountCards />
            )}

            {/* Invoice Tab */}
            {activeTab === 'invoice' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <h2 className="text-xl font-semibold text-neutral-900">Fatura Listesi</h2>
                  <button 
                    onClick={() => navigate('/invoices/create')}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 w-full sm:w-auto"
                  >
                    <FileText size={18} />
                    Yeni Fatura
                  </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 border border-neutral-200 max-w-full sm:max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-neutral-400" size={18} />
                      <input
                        type="text"
                        placeholder="Fatura no veya müşteri ara..."
                        value={invoiceSearch}
                        onChange={(e) => setInvoiceSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchInvoices()}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-3 text-neutral-400" size={18} />
                      <select
                        value={invoiceStatusFilter}
                        onChange={(e) => {
                          setInvoiceStatusFilter(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 appearance-none"
                      >
                        <option value="">Tüm Durumlar</option>
                        <option value="draft">Taslak</option>
                        <option value="sent">Gönderildi</option>
                        <option value="paid">Ödendi</option>
                        <option value="partial_paid">Kısmi Ödeme</option>
                        <option value="cancelled">İptal</option>
                      </select>
                    </div>

                    {/* Search Button */}
                    <button
                      onClick={handleSearchInvoices}
                      className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors w-full sm:w-auto"
                    >
                      Ara
                    </button>
                  </div>
                </div>

                {/* Invoice Table */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-x-auto max-w-full sm:max-w-5xl mx-auto">
                  {invoicesLoading ? (
                    <div className="p-12 text-center text-neutral-600">
                      <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
                      Faturalar yükleniyor...
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="p-12 text-center text-neutral-600">
                      <FileText className="mx-auto mb-4 text-neutral-400" size={48} />
                      <p className="text-lg font-medium">Fatura bulunamadı</p>
                      <p className="text-sm mt-2">Yeni fatura oluşturarak başlayın</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-[700px] w-full">
                          <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Fatura No
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Müşteri
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Ekipman
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Tarih
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Tutar
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Ödenen
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Durum
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                İşlemler
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {invoices.map((invoice) => (
                              <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {invoice.invoiceNumber || `#${invoice.id}`}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {invoice.type === 'rental' ? 'Kiralama' : invoice.type}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {invoice.customer?.name || '-'}
                                  </div>
                                  <div className="text-xs text-neutral-500">{invoice.customer?.email || '-'}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-neutral-900">
                                    {invoice.order?.orderItems?.[0]?.equipment?.name || invoice.order?.orderNumber || '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-neutral-900">
                                    {formatDate(invoice.invoiceDate)}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    Vade: {formatDate(invoice.dueDate)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {formatCurrency(invoice.grandTotal)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-neutral-900">
                                    {formatCurrency(invoice.paidAmount)}
                                  </div>
                                  {invoice.paidAmount > 0 && invoice.paidAmount < invoice.grandTotal && (
                                    <div className="text-xs text-neutral-500">
                                      {Math.round((invoice.paidAmount / invoice.grandTotal) * 100)}%
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(invoice.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                                      className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      Detay
                                    </button>
                                    <button 
                                      onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                                      className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      Düzenle
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
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
            )}

            {/* Offer Tab */}
            {activeTab === 'offer' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-900">Teklif Listesi</h2>
                  <button 
                    onClick={() => navigate('/offers/create')}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <Receipt size={18} />
                    Yeni Teklif
                  </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 border border-neutral-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-neutral-400" size={18} />
                      <input
                        type="text"
                        placeholder="Teklif no veya müşteri ara..."
                        value={offerSearch}
                        onChange={(e) => setOfferSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchOffers()}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-3 text-neutral-400" size={18} />
                      <select
                        value={offerStatusFilter}
                        onChange={(e) => {
                          setOfferStatusFilter(e.target.value)
                          setOfferCurrentPage(1)
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 appearance-none"
                      >
                        <option value="">Tüm Durumlar</option>
                        <option value="draft">Taslak</option>
                        <option value="sent">Gönderildi</option>
                        <option value="accepted">Kabul Edildi</option>
                        <option value="rejected">Reddedildi</option>
                        <option value="converted">Faturaya Dönüştü</option>
                        <option value="expired">Süresi Doldu</option>
                      </select>
                    </div>

                    {/* Search Button */}
                    <button
                      onClick={handleSearchOffers}
                      className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      Ara
                    </button>
                  </div>
                </div>

                {/* Offer Table */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                  {offersLoading ? (
                    <div className="p-12 text-center text-neutral-600">
                      <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
                      Teklifler yükleniyor...
                    </div>
                  ) : offers.length === 0 ? (
                    <div className="p-12 text-center text-neutral-600">
                      <Receipt className="mx-auto mb-4 text-neutral-400" size={48} />
                      <p className="text-lg font-medium">Teklif bulunamadı</p>
                      <p className="text-sm mt-2">Yeni teklif oluşturarak başlayın</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                          <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider whitespace-nowrap">
                                Teklif No
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider whitespace-nowrap">
                                Müşteri
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider whitespace-nowrap">
                                Tarih
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider whitespace-nowrap">
                                Geçerlilik
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider whitespace-nowrap">
                                Tutar
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider whitespace-nowrap">
                                Durum
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider whitespace-nowrap">
                                İşlemler
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {offers.map((offer) => (
                              <tr key={offer.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {offer.offerNumber}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {offer.items?.length || 0} kalem
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {offer.customer.name}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-neutral-900">
                                    {formatDate(offer.offerDate)}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className={`text-sm ${
                                    new Date(offer.validUntil) < new Date() 
                                      ? 'text-red-600 font-medium' 
                                      : 'text-neutral-900'
                                  }`}>
                                    {formatDate(offer.validUntil)}
                                  </div>
                                  {new Date(offer.validUntil) < new Date() && (
                                    <div className="text-xs text-red-500">Süresi doldu</div>
                                  )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {formatCurrency(offer.grandTotal)}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  {getOfferStatusBadge(offer.status)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => navigate(`/offers/${offer.id}`)}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      title="Detay"
                                    >
                                      Detay
                                    </button>
                                    <button
                                      onClick={() => navigate(`/offers/${offer.id}/edit`)}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      title="Düzenle"
                                    >
                                      Düzenle
                                    </button>
                                    {offer.status === 'draft' && (
                                      <button
                                        onClick={() => handleOfferStatusUpdate(offer.id, 'sent')}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Gönder"
                                      >
                                        <Upload size={16} />
                                      </button>
                                    )}
                                    {offer.status === 'sent' && (
                                      <>
                                        <button
                                          onClick={() => handleOfferStatusUpdate(offer.id, 'accepted')}
                                          className="text-green-600 hover:text-green-800"
                                          title="Kabul Et"
                                        >
                                          <Check size={16} />
                                        </button>
                                        <button
                                          onClick={() => handleOfferStatusUpdate(offer.id, 'rejected')}
                                          className="text-red-600 hover:text-red-800"
                                          title="Reddet"
                                        >
                                          <X size={16} />
                                        </button>
                                      </>
                                    )}
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
                          Sayfa {offerCurrentPage} / {offerTotalPages}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOfferCurrentPage(p => Math.max(1, p - 1))}
                            disabled={offerCurrentPage === 1}
                            className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={() => setOfferCurrentPage(p => Math.min(offerTotalPages, p + 1))}
                            disabled={offerCurrentPage === offerTotalPages}
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
            )}

            {/* e-Belge Tab */}
            {activeTab === 'ebelge' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">e-Belge Çözümleri</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'e-Fatura', desc: 'GİB uyumlu e-fatura sistemi' },
                    { name: 'e-Arşiv', desc: 'Dijital fatura kesme' },
                    { name: 'e-İrsaliye', desc: 'Dijital sevkiyat belgeleri' },
                    { name: 'e-SMM', desc: 'Serbest meslek makbuzu' },
                  ].map((item) => (
                    <div key={item.name} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                        <CreditCard className="text-neutral-600" size={24} />
                      </div>
                      <p className="text-sm text-neutral-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integration Tab */}
            {activeTab === 'integration' && (
              <Integrations />
            )}

            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">İşletme Kolaylıkları</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Etiketleme', desc: 'Gelir-giderleri sınıflandır' },
                    { name: 'Hatırlatmalar', desc: 'Ödeme bildirimleri' },
                    { name: 'Ekstre Paylaşımı', desc: 'Müşterilere ekstre gönder' },
                    { name: 'Barkod Okuma', desc: 'Hızlı fatura oluştur' },
                  ].map((item) => (
                    <div key={item.name} className="bg-white rounded-2xl p-6 border border-neutral-200">
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <p className="text-sm text-neutral-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advisor Tab */}
            {activeTab === 'advisor' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Mali Müşavirler İçin</h2>
                
                <div className="bg-white rounded-2xl p-8 border border-neutral-200">
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Users className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-900 mb-2">Veri Aktarımı</h3>
                      <p className="text-neutral-600 mb-4">
                        Mükelleflerin verilerini tek tıkla muhasebe programına aktarın.
                      </p>
                      <button className="bg-neutral-900 text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors">
                        Hemen Başla
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Yardım ve Destek</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <Calculator className="text-neutral-700 mb-4" size={32} />
                    <h3 className="font-semibold mb-2">Hesaplama Araçları</h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>• Personel Maliyet Hesaplama</li>
                      <li>• Amortisman Hesaplama</li>
                      <li>• KDV Hesaplama</li>
                      <li>• Stopaj Hesaplama</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                    <Globe className="text-neutral-700 mb-4" size={32} />
                    <h3 className="font-semibold mb-2">Destek Merkezi</h3>
                    <p className="text-sm text-neutral-600 mb-4">7/24 destek ekibimiz hazır</p>
                    <div className="space-y-2">
                      <button className="w-full bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                        Canlı Destek
                      </button>
                      <button className="w-full bg-neutral-100 text-neutral-700 py-2 rounded-xl hover:bg-neutral-200 transition-colors">
                        Dokümantasyon
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <IncomeModal
        isOpen={showIncomeModal}
        onClose={() => {
          setShowIncomeModal(false)
          setEditingIncome(null)
        }}
        onSuccess={() => {
          loadIncomes()
          loadStats()
        }}
        editingIncome={editingIncome}
      />

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false)
          setEditingExpense(null)
        }}
        onSuccess={() => {
          loadExpenses()
          loadStats()
        }}
        editingExpense={editingExpense}
      />

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false)
          setEditingInvoice(null)
        }}
        onSuccess={() => {
          loadInvoices()
          loadStats()
        }}
        editingInvoice={editingInvoice}
      />

      <OfferModal
        isOpen={showOfferModal}
        onClose={() => {
          setShowOfferModal(false)
          setEditingOffer(null)
        }}
        onSuccess={() => {
          loadOffers()
          loadStats()
        }}
        editingOffer={editingOffer}
      />
    </div>
  )
}
