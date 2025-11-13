import { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  DollarSign, TrendingUp, TrendingDown, FileText, Users,
  CreditCard, Banknote, Building2, Receipt, Package, BarChart3,
  PieChart, Settings, Download, Upload, Clock, Globe,
  Search, Filter, ChevronLeft, ChevronRight, Check, X, Tag, Edit2, Trash2,
  MoreVertical, Mail, MessageCircle, Printer, Copy, Link2, Calendar, Plus,
  Bell, AlertCircle, XCircle, CheckCircle
} from 'lucide-react'
import { accountingAPI, invoiceAPI, offerAPI, checksAPI, promissoryAPI, agingAPI } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'
import CheckFormModal from '../components/accounting/CheckFormModal'
import PromissoryNoteFormModal from '../components/accounting/PromissoryNoteFormModal'
import AgingReportTable from '../components/accounting/AgingReportTable'
import JournalEntryList from '../components/accounting/JournalEntryList'
import ChartOfAccountsManagement from '../components/accounting/ChartOfAccountsManagement'
import CurrentAccountManagement from '../components/accounting/CurrentAccountManagement'
import EInvoiceManagement from '../components/accounting/EInvoiceManagement'
import BankAccountManagement from '../components/accounting/BankAccountManagement'
import TrialBalanceReport from '../components/accounting/TrialBalanceReport'
import IncomeStatementReport from '../components/accounting/IncomeStatementReport'
import BalanceSheetReport from '../components/accounting/BalanceSheetReport'
import CardSkeleton from '../components/ui/CardSkeleton'
import TableSkeleton from '../components/ui/TableSkeleton'
import LoadingFallback from '../components/ui/LoadingFallback'
import ErrorBoundary from '../components/ErrorBoundary'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { card, button, input, badge, getStatGradient, statCardIcon, tab, DESIGN_TOKENS, cx } from '../styles/design-tokens'

// Hardcoded table cell classes (to avoid bundling issues)
const TABLE_HEADER_CELL = 'px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider bg-neutral-50'
const TABLE_BODY_CELL = 'px-6 py-4 text-sm text-neutral-900'

// Lazy load heavy components for better performance
const IncomeTab = lazy(() => import('../components/accounting/IncomeTab'))
const ExpenseTab = lazy(() => import('../components/accounting/ExpenseTab'))
const InvoiceList = lazy(() => import('../components/accounting/InvoiceList'))
const OfferList = lazy(() => import('../components/accounting/OfferList'))
const AccountingDashboard = lazy(() => import('../components/accounting/AccountingDashboard'))
const AccountCardList = lazy(() => import('../components/accounting/AccountCardList'))
const EInvoiceList = lazy(() => import('../components/accounting/EInvoiceList'))
const BankReconciliation = lazy(() => import('../components/accounting/BankReconciliation'))
const DeliveryNoteList = lazy(() => import('../components/delivery-notes/DeliveryNoteList'))
const InventoryAccounting = lazy(() => import('../components/accounting/InventoryAccounting'))
const AdvancedReporting = lazy(() => import('../components/accounting/AdvancedReporting'))
const CompanyInfo = lazy(() => import('../components/accounting/CompanyInfo'))
const CashBankManagement = lazy(() => import('../components/accounting/CashBankManagement'))
const ReminderManagement = lazy(() => import('../components/reminders/ReminderManagement'))
const StatementSharing = lazy(() => import('../components/statements/StatementSharing'))
const BarcodeScanner = lazy(() => import('../components/barcode/BarcodeScanner'))
const NotificationsTab = lazy(() => import('../components/accounting/tabs/NotificationsTab'))
const ToolsTab = lazy(() => import('../components/accounting/tabs/ToolsTab'))
// Mali M��avir tab removed
const SupportTab = lazy(() => import('../components/accounting/tabs/SupportTab'))
const IntegrationsTab = lazy(() => import('../components/accounting/tabs/IntegrationsTab'))
const CostAccounting = lazy(() => import('../components/accounting/CostAccounting'))

type Tab = 'dashboard' | 'income' | 'expense' | 'reports' | 'invoice' | 'offer' | 'ebelge' | 'tools' | 'support' | 'receivables' | 'cari' | 'delivery' | 'reconciliation' | 'inventory' | 'cost-accounting' | 'company' | 'cash-bank' | 'bank-integration' | 'reminders' | 'statements' | 'barcode' | 'notifications' | 'integrations' | 'journal-entries' | 'chart-of-accounts' | 'current-accounts' | 'gib-einvoice'

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
  // Guard: If DESIGN_TOKENS is undefined, show error
  if (!DESIGN_TOKENS || !DESIGN_TOKENS.typography || !DESIGN_TOKENS.typography.h2) {
    console.error('? DESIGN_TOKENS is undefined or incomplete!')
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Design System Error</h2>
          <p className="text-neutral-700 mb-4">DESIGN_TOKENS failed to load. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<AccountingStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Invoice list state
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const debouncedInvoiceSearch = useDebounce(invoiceSearch, 500)
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Advanced filters for invoices
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | 'custom'>('all')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Bulk selection state for invoices
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([])

  // Offer list state
  const [offers, setOffers] = useState<Offer[]>([])
  const [offersLoading, setOffersLoading] = useState(false)
  const [offerSearch, setOfferSearch] = useState('')
  const debouncedOfferSearch = useDebounce(offerSearch, 500)
  const [offerStatusFilter, setOfferStatusFilter] = useState<string>('')
  const [offerCurrentPage, setOfferCurrentPage] = useState(1)
  const [offerTotalPages, setOfferTotalPages] = useState(1)

  // Bulk selection state for offers
  const [selectedOffers, setSelectedOffers] = useState<number[]>([])

  // Offer advanced filters
  const [offerDateRange, setOfferDateRange] = useState<'all' | '7days' | '30days' | 'custom'>('all')
  const [offerCustomDateFrom, setOfferCustomDateFrom] = useState('')
  const [offerCustomDateTo, setOfferCustomDateTo] = useState('')
  const [offerMinAmount, setOfferMinAmount] = useState('')
  const [offerMaxAmount, setOfferMaxAmount] = useState('')
  const [showOfferAdvancedFilters, setShowOfferAdvancedFilters] = useState(false)

  // Quick actions dropdown state
  const [openInvoiceDropdown, setOpenInvoiceDropdown] = useState<number | null>(null)
  const [openOfferDropdown, setOpenOfferDropdown] = useState<number | null>(null)

  // Checks state
  const [checks, setChecks] = useState<any[]>([])
  const [checksLoading, setChecksLoading] = useState(false)

  // Promissory notes state
  const [promissory, setPromissory] = useState<any[]>([])
  const [promissoryLoading, setPromissoryLoading] = useState(false)

  // Aging state
  const [agingData, setAgingData] = useState<any | null>(null)
  const [agingLoading, setAgingLoading] = useState(false)

  // Checks modal state
  const [checkModalOpen, setCheckModalOpen] = useState(false)
  const [editingCheck, setEditingCheck] = useState<any | null>(null)

  // Promissory notes modal state
  const [promissoryModalOpen, setPromissoryModalOpen] = useState(false)
  const [editingPromissory, setEditingPromissory] = useState<any | null>(null)

  // Receivables sub-tab state
  const [receivablesSubTab, setReceivablesSubTab] = useState<'checks' | 'promissory' | 'aging'>('checks')
  
  // Reports sub-tab state
  const [reportsSubTab, setReportsSubTab] = useState<'advanced' | 'trial-balance' | 'income-statement' | 'balance-sheet'>('advanced')

  // Navigation and search params
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Load accounting stats on mount
  useEffect(() => {
    loadStats()
  }, [])

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam as Tab)
    }
  }, [searchParams])

  // Load invoices when invoice tab is active
  useEffect(() => {
    if (activeTab === 'invoice') {
      setCurrentPage(1) // Reset to first page on search
      loadInvoices()
    }
  }, [activeTab, debouncedInvoiceSearch, invoiceStatusFilter])

  // Load invoices when page changes
  useEffect(() => {
    if (activeTab === 'invoice') {
      loadInvoices()
    }
  }, [currentPage])

  // Load offers when offer tab is active
  useEffect(() => {
    if (activeTab === 'offer') {
      setOfferCurrentPage(1) // Reset to first page on search
      loadOffers()
    }
  }, [activeTab, debouncedOfferSearch, offerStatusFilter])

  // Load offers when page changes
  useEffect(() => {
    if (activeTab === 'offer') {
      loadOffers()
    }
  }, [offerCurrentPage])

  // Load receivables data when receivables tab is active (checks, promissory, aging)
  useEffect(() => {
    if (activeTab === 'receivables') {
      if (receivablesSubTab === 'checks') {
        loadChecks()
      } else if (receivablesSubTab === 'promissory') {
        loadPromissory()
      } else if (receivablesSubTab === 'aging') {
        loadAging()
      }
    }
  }, [activeTab, receivablesSubTab])

  const loadStats = async () => {
    try {
      setLoading(true)
      console.log('?? Loading accounting stats...')
      const response = await accountingAPI.getStats()
      console.log('? Stats response:', response.data)
      setStats(response.data.data)
    } catch (error: any) {
      console.error('? Failed to load accounting stats:', error)
      console.error('Error details:', error.response?.data)
      toast.error('�statistikler y�klenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const loadInvoices = async () => {
    try {
      setInvoicesLoading(true)
      console.log('?? Loading invoices...', { invoiceStatusFilter, debouncedInvoiceSearch, currentPage })
      const response = await invoiceAPI.getAll({
        status: invoiceStatusFilter || undefined,
        search: debouncedInvoiceSearch || undefined,
        page: currentPage,
        limit: 10,
      })
      console.log('? Invoices response:', response.data)
      setInvoices(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error: any) {
      console.error('? Failed to load invoices:', error)
      console.error('Error details:', error.response?.data)
      toast.error('Faturalar y�klenemedi: ' + (error.response?.data?.message || error.message))
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
      console.log('?? Loading offers...', { offerStatusFilter, debouncedOfferSearch, offerCurrentPage })
      const response = await offerAPI.getAll({
        status: offerStatusFilter || undefined,
        search: debouncedOfferSearch || undefined,
        page: offerCurrentPage,
        limit: 10,
      })
      console.log('? Offers response:', response.data)
      setOffers(response.data.data)
      setOfferTotalPages(response.data.pagination.totalPages)
    } catch (error: any) {
      console.error('? Failed to load offers:', error)
      console.error('Error details:', error.response?.data)
      toast.error('Teklifler y�klenemedi: ' + (error.response?.data?.message || error.message))
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
      toast.success('Teklif durumu g�ncellendi')
      loadOffers()
    } catch (error: any) {
      console.error('Failed to update offer status:', error)
      toast.error('Durum g�ncellenemedi')
    }
  }

  const handleConvertToInvoice = async (offerId: number) => {
    if (!confirm('Bu teklifi faturaya d�n��t�rmek istedi�inizden emin misiniz?')) {
      return
    }
    
    try {
      // Note: Bu endpoint i�in orderId, startDate, endDate gerekiyor
      // Basitle�tirilmi� versiyon - ger�ek implementasyonda modal ile bu bilgileri almal�s�n�z
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      
      const response = await offerAPI.convertToInvoice(offerId, {
        orderId: offerId, // Ge�ici olarak offerId kullan�yoruz
        startDate: today,
        endDate: nextMonth,
        notes: 'Tekliften otomatik olu�turuldu'
      })
      
      toast.success('Teklif ba�ar�yla faturaya d�n��t�r�ld�')
      navigate(`/accounting/invoice/${response.data.invoice.id}`)
    } catch (error: any) {
      console.error('Failed to convert offer:', error)
      toast.error('D�n��t�rme ba�ar�s�z: ' + (error.response?.data?.message || error.message))
    }
  }

  // Bulk selection handlers for invoices
  const handleSelectInvoice = (invoiceId: number) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const handleSelectAllInvoices = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(invoices.map(inv => inv.id))
    }
  }

  const handleBulkDeleteInvoices = async () => {
    if (!confirm(`${selectedInvoices.length} faturay� silmek istedi�inizden emin misiniz?`)) {
      return
    }
    
    try {
      // Bu i�lem her faturay� tek tek silecek - idealde backend'de bulk delete endpoint olmal�
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      for (const id of selectedInvoices) {
        await axios.delete(`${API_URL}/invoices/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        })
      }
      toast.success(`${selectedInvoices.length} fatura silindi`)
      setSelectedInvoices([])
      loadInvoices()
    } catch (error: any) {
      console.error('Bulk delete failed:', error)
      toast.error('Toplu silme ba�ar�s�z')
    }
  }

  // Bulk selection handlers for offers
  const handleSelectOffer = (offerId: number) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    )
  }

  const handleSelectAllOffers = () => {
    if (selectedOffers.length === offers.length) {
      setSelectedOffers([])
    } else {
      setSelectedOffers(offers.map(offer => offer.id))
    }
  }

  const handleBulkDeleteOffers = async () => {
    if (!confirm(`${selectedOffers.length} teklifi silmek istedi�inizden emin misiniz?`)) {
      return
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      for (const id of selectedOffers) {
        await axios.delete(`${API_URL}/quotes/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        })
      }
      toast.success(`${selectedOffers.length} teklif silindi`)
      setSelectedOffers([])
      loadOffers()
    } catch (error: any) {
      console.error('Bulk delete failed:', error)
      toast.error('Toplu silme ba�ar�s�z')
    }
  }

  // Advanced filter handlers
  const handleResetFilters = () => {
    setInvoiceStatusFilter('')
    setInvoiceSearch('')
    setDateRange('all')
    setCustomDateFrom('')
    setCustomDateTo('')
    setMinAmount('')
    setMaxAmount('')
    setCurrentPage(1)
  }

  const getDateRangeValues = () => {
    const now = new Date()
    switch (dateRange) {
      case '7days':
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return { from: sevenDaysAgo.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
      case '30days':
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return { from: thirtyDaysAgo.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
      case 'custom':
        return { from: customDateFrom, to: customDateTo }
      default:
        return { from: '', to: '' }
    }
  }

  // Handle reset offer filters
  const handleResetOfferFilters = () => {
    setOfferDateRange('all')
    setOfferCustomDateFrom('')
    setOfferCustomDateTo('')
    setOfferMinAmount('')
    setOfferMaxAmount('')
    setOfferSearch('')
    setOfferStatusFilter('')
    setOfferCurrentPage(1)
  }

  // Get offer date range values
  const getOfferDateRangeValues = () => {
    const now = new Date()
    switch (offerDateRange) {
      case 'all':
        return { from: '', to: '' }
      case '7days':
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return { from: sevenDaysAgo.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
      case '30days':
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return { from: thirtyDaysAgo.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
      case 'custom':
        return { from: offerCustomDateFrom, to: offerCustomDateTo }
      default:
        return { from: '', to: '' }
    }
  }

  // Quick action handlers
  const handleDownloadPDF = async (invoice: any) => {
    try {
      toast.loading('PDF indiriliyor...')
      const response = await axios.get(`/api/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `fatura-${invoice.invoiceNumber || invoice.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.dismiss()
      toast.success('PDF indirildi!')
    } catch (error) {
      toast.dismiss()
      toast.error('PDF indirilemedi')
      console.error('Download error:', error)
    }
    setOpenInvoiceDropdown(null)
  }

  const handleSendEmail = (_invoice: any) => {
    toast('Email g�nderme �zelli�i yak�nda eklenecek!', { icon: '??' })
    setOpenInvoiceDropdown(null)
  }

  const handleSendWhatsApp = (invoice: any) => {
    const customer = invoice.customer
    if (!customer?.phone) {
      toast.error('M��terinin telefon numaras� bulunamad�')
      return
    }
    const message = `Merhaba, ${invoice.invoiceNumber} numaral� faturan�z haz�r. Toplam: ${invoice.total?.toFixed(2)} TL`
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    toast.success('WhatsApp a��l�yor...')
    setOpenInvoiceDropdown(null)
  }

  const handlePrint = (invoice: any) => {
    navigate(`/accounting/invoice/${invoice.id}`)
    setTimeout(() => window.print(), 500)
    setOpenInvoiceDropdown(null)
  }

  const handleCopyInvoice = async (invoice: any) => {
    try {
      const invoiceText = `Fatura No: ${invoice.invoiceNumber}\nM��teri: ${invoice.customer?.name}\nTutar: ${invoice.total?.toFixed(2)} TL`
      await navigator.clipboard.writeText(invoiceText)
      toast.success('Fatura bilgileri kopyaland�!')
    } catch (error) {
      toast.error('Kopyalama ba�ar�s�z')
    }
    setOpenInvoiceDropdown(null)
  }

  // Offer quick actions
  const handleDownloadOfferPDF = async (offer: any) => {
    try {
      toast.loading('PDF indiriliyor...')
      const response = await axios.get(`/api/offers/${offer.id}/pdf`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `teklif-${offer.offerNumber || offer.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.dismiss()
      toast.success('PDF indirildi!')
    } catch (error) {
      toast.dismiss()
      toast.error('PDF indirilemedi')
      console.error('Download error:', error)
    }
    setOpenOfferDropdown(null)
  }

  const handleSendOfferEmail = (_offer: any) => {
    toast('Email g�nderme �zelli�i yak�nda eklenecek!', { icon: '??' })
    setOpenOfferDropdown(null)
  }

  const handleSendOfferWhatsApp = (offer: any) => {
    const customer = offer.customer
    if (!customer?.phone) {
      toast.error('M��terinin telefon numaras� bulunamad�')
      return
    }
    const message = `Merhaba, ${offer.offerNumber} numaral� teklifimiz haz�r. Toplam: ${offer.total?.toFixed(2)} TL`
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    toast.success('WhatsApp a��l�yor...')
    setOpenOfferDropdown(null)
  }

  const handlePrintOffer = (offer: any) => {
    navigate(`/accounting/quote/${offer.id}`)
    setTimeout(() => window.print(), 500)
    setOpenOfferDropdown(null)
  }

  const handleCopyOffer = async (offer: any) => {
    try {
      const offerText = `Teklif No: ${offer.offerNumber}\nM��teri: ${offer.customer?.name}\nTutar: ${offer.total?.toFixed(2)} TL`
      await navigator.clipboard.writeText(offerText)
      toast.success('Teklif bilgileri kopyaland�!')
    } catch (error) {
      toast.error('Kopyalama ba�ar�s�z')
    }
    setOpenOfferDropdown(null)
  }

  const loadChecks = async () => {
    try {
      setChecksLoading(true)
      const res = await checksAPI.getAll({ limit: 50 })
      setChecks(res.data.data || res.data)
    } catch (error: any) {
      console.error('Failed to load checks:', error)
      toast.error('�ekler y�klenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setChecksLoading(false)
    }
  }

  const loadPromissory = async () => {
    try {
      setPromissoryLoading(true)
      const res = await promissoryAPI.getAll({ limit: 50 })
      setPromissory(res.data.data || res.data)
    } catch (error: any) {
      console.error('Failed to load promissory notes:', error)
      toast.error('Senetler y�klenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setPromissoryLoading(false)
    }
  }

  const handleDeleteCheck = async (id: number) => {
    if (!confirm('Bu �eki silmek istedi�inizden emin misiniz?')) {
      return
    }
    
    try {
      await checksAPI.delete(id)
      toast.success('�ek ba�ar�yla silindi')
      loadChecks()
    } catch (error: any) {
      console.error('Failed to delete check:', error)
      toast.error('�ek silinemedi: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeletePromissory = async (id: number) => {
    if (!confirm('Bu senedi silmek istedi�inizden emin misiniz?')) {
      return
    }
    
    try {
      await promissoryAPI.delete(id)
      toast.success('Senet ba�ar�yla silindi')
      loadPromissory()
    } catch (error: any) {
      console.error('Failed to delete promissory note:', error)
      toast.error('Senet silinemedi: ' + (error.response?.data?.message || error.message))
    }
  }

  const loadAging = async () => {
    try {
      setAgingLoading(true)
      const res = await agingAPI.getCombinedAging()
      setAgingData(res.data.data || res.data)
    } catch (error: any) {
      console.error('Failed to load aging data:', error)
      toast.error('Ya�land�rma verisi al�namad�: ' + (error.response?.data?.message || error.message))
    } finally {
      setAgingLoading(false)
    }
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
    const badgeData = badge(status, 'invoice', 'md', 'solid')
    return (
      <span className={badgeData.className}>
        {badgeData.label}
      </span>
    )
  }

  const getOfferStatusBadge = (status: string) => {
    const badgeData = badge(status, 'offer', 'md', 'solid')
    return (
      <span className={badgeData.className}>
        {badgeData.label}
      </span>
    )
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Ana Sayfa', icon: <BarChart3 size={18} /> },
    { id: 'income' as const, label: 'Gelirler', icon: <TrendingUp size={18} /> },
    { id: 'expense' as const, label: 'Giderler', icon: <TrendingDown size={18} /> },
    { id: 'reports' as const, label: 'Raporlar', icon: <PieChart size={18} /> },
    { id: 'invoice' as const, label: 'Fatura Takibi', icon: <FileText size={18} /> },
    { id: 'offer' as const, label: 'Teklif Y�netimi', icon: <Receipt size={18} /> },
    { id: 'current-accounts' as const, label: 'Cari Hesaplar', icon: <Users size={18} /> },
    { id: 'receivables' as const, label: 'Alacak Y�netimi', icon: <DollarSign size={18} /> },
    { id: 'chart-of-accounts' as const, label: 'Hesap Plan�', icon: <BarChart3 size={18} /> },
    { id: 'inventory' as const, label: 'Stok Muhasebesi', icon: <Package size={18} /> },
    { id: 'company' as const, label: '�irket Bilgileri', icon: <Building2 size={18} /> },
    { id: 'cash-bank' as const, label: 'Kasa & Banka', icon: <Banknote size={18} /> },
    { id: 'delivery' as const, label: '�rsaliye', icon: <Package size={18} /> },
    { id: 'reconciliation' as const, label: 'Banka Mutabakat', icon: <Building2 size={18} /> },
    { id: 'tools' as const, label: '��letme Kolayl�klar�', icon: <Settings size={18} /> },
    { id: 'support' as const, label: 'Yard�m & Ara�lar', icon: <Globe size={18} /> },
  ]

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 space-y-4 pb-10">
      {/* Quick Stats */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bu Ay Gelir */}
          <div className={card('sm', 'sm', 'default', 'xl')}>
            <div className="flex items-center justify-between mb-3">
              <div className={statCardIcon('success')}>
                <TrendingUp size={20} />
              </div>
              {stats && stats.invoiceCount > 0 && (
                <span className={DESIGN_TOKENS?.statCard?.badge}>
                  {stats.invoiceCount} fatura
                </span>
              )}
            </div>
            <h3 className={DESIGN_TOKENS?.statCard?.value}>
              {stats ? formatCurrency(stats.totalRevenue) : '?0'}
            </h3>
            <p className={DESIGN_TOKENS?.statCard?.label}>Bu Ay Gelir</p>
          </div>

          {/* Bu Ay Gider */}
          <div className={card('sm', 'sm', 'default', 'xl')}>
            <div className="flex items-center justify-between mb-3">
              <div className={statCardIcon('error')}>
                <TrendingDown size={20} />
              </div>
            </div>
            <h3 className={DESIGN_TOKENS?.statCard?.value}>
              {stats ? formatCurrency(stats.totalExpenses) : '?0'}
            </h3>
            <p className={DESIGN_TOKENS?.statCard?.label}>Bu Ay Gider</p>
          </div>

          {/* Net K�r */}
          <div className={card('sm', 'sm', 'default', 'xl')}>
            <div className="flex items-center justify-between mb-3">
              <div className={statCardIcon('info')}>
                <DollarSign size={20} />
              </div>
              <span className={DESIGN_TOKENS?.statCard?.badge}>Net</span>
            </div>
            <h3 className={DESIGN_TOKENS?.statCard?.value}>
              {stats ? formatCurrency(stats.netProfit) : '?0'}
            </h3>
            <p className={DESIGN_TOKENS?.statCard?.label}>Net K�r</p>
          </div>

          {/* Tahsilat / Bekleyen */}
          <div className={card('sm', 'sm', 'default', 'xl')}>
            <div className="flex items-center justify-between mb-3">
              <div className={statCardIcon('warning')}>
                <Clock size={20} />
              </div>
              <span className={DESIGN_TOKENS?.statCard?.badge}>Bekleyen</span>
            </div>
            <h3 className={DESIGN_TOKENS?.statCard?.value}>
              {stats ? formatCurrency(stats.totalOverdue) : '?0'}
            </h3>
            <p className={DESIGN_TOKENS?.statCard?.label}>Vade Ge�mi�</p>
            {stats && stats.totalCollections > 0 && (
              <p className={DESIGN_TOKENS?.statCard?.subtitle}>
                Bu ay: {formatCurrency(stats.totalCollections)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs - Vertical Layout */}
      <div className={card('none', 'sm', 'default', 'xl')}>
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Tabs */}
          <nav className="flex flex-row gap-1 overflow-x-auto border-b border-neutral-200 lg:border-b-0 lg:border-r lg:w-56 lg:flex-col p-2 flex-shrink-0">
            {tabs.map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setActiveTab(tabItem.id)}
                className={tab(activeTab === tabItem.id, 'vertical')}
              >
                {tabItem.icon}
                <span className="whitespace-nowrap">{tabItem.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <ErrorBoundary fallbackTitle="Muhasebe Mod�l� Hatas�" fallbackMessage="Muhasebe mod�l�nde bir sorun olu�tu. L�tfen sayfay� yenileyin.">
              <Suspense fallback={<LoadingFallback message="��erik y�kleniyor..." />}>
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && <AccountingDashboard />}

                {/* Income Tab */}
                {activeTab === 'income' && <IncomeTab />}

                {/* Expense Tab */}
                {activeTab === 'expense' && <ExpenseTab />}

                {/* Chart of Accounts Tab */}
                {activeTab === 'chart-of-accounts' && <ChartOfAccountsManagement />}

                {/* Current Accounts Tab */}
                {activeTab === 'current-accounts' && <AccountCardList />}

            {/* Reports Tab - Advanced Reporting with Sub-tabs */}
            {activeTab === 'reports' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <h2 className={DESIGN_TOKENS?.typography?.h2}>
                  Raporlar
                </h2>
                
                {/* Sub-tabs for Reports */}
                <div className="flex gap-4 border-b border-neutral-200 mb-6">
                  <button
                    onClick={() => setReportsSubTab('advanced')}
                    className={tab(reportsSubTab === 'advanced', 'underline')}
                  >
                    Geli�mi� Raporlar
                  </button>
                  <button
                    onClick={() => setReportsSubTab('trial-balance')}
                    className={tab(reportsSubTab === 'trial-balance', 'underline')}
                  >
                    Mizan
                  </button>
                  <button
                    onClick={() => setReportsSubTab('income-statement')}
                    className={tab(reportsSubTab === 'income-statement', 'underline')}
                  >
                    Gelir-Gider Tablosu
                  </button>
                  <button
                    onClick={() => setReportsSubTab('balance-sheet')}
                    className={tab(reportsSubTab === 'balance-sheet', 'underline')}
                  >
                    Bilan�o
                  </button>
                </div>

                {/* Sub-tab content */}
                {reportsSubTab === 'advanced' && <AdvancedReporting />}
                {reportsSubTab === 'trial-balance' && <TrialBalanceReport />}
                {reportsSubTab === 'income-statement' && <IncomeStatementReport />}
                {reportsSubTab === 'balance-sheet' && <BalanceSheetReport />}
              </div>
            )}

            {/* Receivables Management Tab - �ekler, Senetler, Ya�land�rma */}
            {activeTab === 'receivables' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <h2 className={DESIGN_TOKENS?.typography?.h2}>Alacak Y�netimi</h2>
                
                {/* Sub-tabs for Checks, Promissory, Aging */}
                <div className="flex gap-4 border-b border-neutral-200 mb-6">
                  <button
                    onClick={() => setReceivablesSubTab('checks')}
                    className={tab(receivablesSubTab === 'checks', 'underline')}
                  >
                    �ekler
                  </button>
                  <button
                    onClick={() => setReceivablesSubTab('promissory')}
                    className={tab(receivablesSubTab === 'promissory', 'underline')}
                  >
                    Senetler
                  </button>
                  <button
                    onClick={() => setReceivablesSubTab('aging')}
                    className={tab(receivablesSubTab === 'aging', 'underline')}
                  >
                    Ya�land�rma Raporu
                  </button>
                </div>

                {/* Checks Sub-tab */}
                {receivablesSubTab === 'checks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className={DESIGN_TOKENS?.typography?.h3}>�ekler</h3>
                      <button
                        onClick={() => { setEditingCheck(null); setCheckModalOpen(true) }}
                        className={cx(button('md', 'primary', 'xl'), 'gap-2')}
                      >
                        <FileText size={18} />
                        Yeni �ek
                      </button>
                    </div>

                    <div className={card('none', 'sm', 'default', 'xl')}>
                      {checksLoading ? (
                        <div className="p-12 text-center text-neutral-600">�ekler y�kleniyor...</div>
                      ) : checks.length === 0 ? (
                        <div className="p-12 text-center text-neutral-600">�ek bulunamad�</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                              <tr>
                                <th className={TABLE_HEADER_CELL}>No</th>
                                <th className={TABLE_HEADER_CELL}>M��teri</th>
                                <th className={TABLE_HEADER_CELL}>Tutar</th>
                                <th className={TABLE_HEADER_CELL}>Vade</th>
                                <th className={TABLE_HEADER_CELL}>Durum</th>
                                <th className={TABLE_HEADER_CELL}>��lemler</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100">
                              {checks.map((c: any) => (
                                <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                                  <td className={TABLE_BODY_CELL}>{c.documentNumber || `#${c.id}`}</td>
                                  <td className={TABLE_BODY_CELL}>{c.customer?.name || c.customerName || '-'}</td>
                                  <td className={TABLE_BODY_CELL}>{formatCurrency(c.amount || 0)}</td>
                                  <td className={TABLE_BODY_CELL}>{c.dueDate ? formatDate(c.dueDate) : '-'}</td>
                                  <td className={TABLE_BODY_CELL}>{c.status || '-'}</td>
                                  <td className={`${TABLE_BODY_CELL} whitespace-nowrap`}>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => { setEditingCheck(c); setCheckModalOpen(true) }}
                                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                                        title="D�zenle"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCheck(c.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
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
                      )}
                    </div>
                  </div>
                )}

                {/* Promissory Notes Sub-tab */}
                {receivablesSubTab === 'promissory' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className={DESIGN_TOKENS?.typography?.h3}>Senetler</h3>
                      <button
                        onClick={() => { setEditingPromissory(null); setPromissoryModalOpen(true) }}
                        className={cx(button('md', 'primary', 'xl'), 'gap-2')}
                      >
                        <FileText size={18} />
                        Yeni Senet
                      </button>
                    </div>

                    <div className={card('none', 'sm', 'default', 'xl')}>
                      {promissoryLoading ? (
                        <div className="p-12 text-center text-neutral-600">Senetler y�kleniyor...</div>
                      ) : promissory.length === 0 ? (
                        <div className="p-12 text-center text-neutral-600">Senet bulunamad�</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                              <tr>
                                <th className={TABLE_HEADER_CELL}>No</th>
                                <th className={TABLE_HEADER_CELL}>M��teri</th>
                                <th className={TABLE_HEADER_CELL}>Tutar</th>
                                <th className={TABLE_HEADER_CELL}>Vade</th>
                                <th className={TABLE_HEADER_CELL}>Durum</th>
                                <th className={TABLE_HEADER_CELL}>��lemler</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100">
                              {promissory.map((p: any) => (
                                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                                  <td className={TABLE_BODY_CELL}>{p.documentNumber || `#${p.id}`}</td>
                                  <td className={TABLE_BODY_CELL}>{p.customer?.name || p.customerName || '-'}</td>
                                  <td className={TABLE_BODY_CELL}>{formatCurrency(p.amount || 0)}</td>
                                  <td className={TABLE_BODY_CELL}>{p.dueDate ? formatDate(p.dueDate) : '-'}</td>
                                  <td className={TABLE_BODY_CELL}>{p.status || '-'}</td>
                                  <td className={`${TABLE_BODY_CELL} whitespace-nowrap`}>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => { setEditingPromissory(p); setPromissoryModalOpen(true) }}
                                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                                        title="D�zenle"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePromissory(p.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
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
                      )}
                    </div>
                  </div>
                )}

                {/* Aging Report Sub-tab */}
                {receivablesSubTab === 'aging' && (
                  <div>
                    <AgingReportTable data={agingData} loading={agingLoading} />
                  </div>
                )}
              </div>
            )}

            {/* Invoice Tab */}
            {activeTab === 'invoice' && (
              <ErrorBoundary fallbackTitle="Fatura Listesi Hatas�" fallbackMessage="Fatura listesi y�klenirken bir sorun olu�tu.">
                <Suspense fallback={<div className="p-8 text-center">Y�kleniyor...</div>}>
                  <InvoiceList />
                </Suspense>
              </ErrorBoundary>
            )}

            {/* Offer Tab */}
            {activeTab === 'offer' && (
              <ErrorBoundary fallbackTitle="Teklif Listesi Hatası" fallbackMessage="Teklif listesi yüklenirken bir sorun oluştu.">
                <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
                  <OfferList />
                </Suspense>
              </ErrorBoundary>
            )}

            {/* Delivery Note Tab */}
            {activeTab === 'delivery' && <DeliveryNoteList />}

            {/* Bank Reconciliation Tab */}
            {activeTab === 'reconciliation' && <BankReconciliation />}

            {/* Inventory Accounting Tab */}
            {activeTab === 'inventory' && <InventoryAccounting />}

            {/* Company Information Tab */}
            {activeTab === 'company' && <CompanyInfo />}

            {/* Cash & Bank Management Tab */}
            {activeTab === 'cash-bank' && <CashBankManagement />}

            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <ErrorBoundary>
                <ToolsTab onNavigate={(tab) => setActiveTab(tab as Tab)} />
              </ErrorBoundary>
            )}

            {/* Tools Tab OLD - BACKUP */}
            {false && activeTab === 'tools' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">��letme Kolayl�klar�</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Hat�rlatmalar */}
                  <button
                    onClick={() => setActiveTab('reminders')}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-neutral-900 rounded-xl flex items-center justify-center transition-colors">
                        <Clock className="text-neutral-700 group-hover:text-white transition-colors" size={24} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Hat�rlatmalar</h3>
                    </div>
                    <p className="text-sm text-neutral-600">�deme bildirimleri ve vade uyar�lar�</p>
                  </button>

                  {/* Ekstre Payla��m� */}
                  <button
                    onClick={() => setActiveTab('statements')}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-neutral-900 rounded-xl flex items-center justify-center transition-colors">
                        <FileText className="text-neutral-700 group-hover:text-white transition-colors" size={24} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Ekstre Payla��m�</h3>
                    </div>
                    <p className="text-sm text-neutral-600">M��terilere hesap ekstresi g�nderin</p>
                  </button>

                  {/* Barkod Okuma */}
                  <button
                    onClick={() => setActiveTab('barcode')}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-neutral-900 rounded-xl flex items-center justify-center transition-colors">
                        <Package className="text-neutral-700 group-hover:text-white transition-colors" size={24} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Barkod Okuma</h3>
                    </div>
                    <p className="text-sm text-neutral-600">H�zl� fatura ve stok giri�i</p>
                  </button>

                  {/* Toplu Email */}
                  <button
                    onClick={() => toast('Toplu email �zelli�i haz�rlan�yor!', { icon: '??', duration: 3000 })}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-neutral-900 rounded-xl flex items-center justify-center transition-colors">
                        <Mail className="text-neutral-700 group-hover:text-white transition-colors" size={24} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Toplu Email</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Fatura ve teklifleri toplu g�nderin</p>
                    <div className="mt-3 text-xs text-orange-600 font-medium">Yak�nda</div>
                  </button>

                  {/* Raporlar */}
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-neutral-900 rounded-xl flex items-center justify-center transition-colors">
                        <BarChart3 className="text-neutral-700 group-hover:text-white transition-colors" size={24} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Geli�mi� Raporlar</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Detayl� analiz ve �zel raporlar</p>
                  </button>
                </div>

                {/* Quick Stats for Tools */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-900">Aktif Etiketler</h4>
                      <Tag className="text-blue-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-blue-900">12</p>
                    <p className="text-xs text-blue-600 mt-1">Son 30 g�n</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-green-900">Hat�rlatmalar</h4>
                      <Clock className="text-green-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-green-900">5</p>
                    <p className="text-xs text-green-600 mt-1">Bu hafta</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-purple-900">G�nderilen Ekstre</h4>
                      <FileText className="text-purple-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-purple-900">28</p>
                    <p className="text-xs text-purple-600 mt-1">Bu ay</p>
                  </div>
                </div>
              </div>
            )}

            {/* Advisor Tab */}
            {activeTab === 'advisor' && (
              <ErrorBoundary>
                <AdvisorTab />
              </ErrorBoundary>
            )}

            {/* Advisor Tab OLD - BACKUP */}
            {false && activeTab === 'advisor' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Mali M��avir Paneli</h2>
                  <p className="text-sm text-neutral-600 mt-1">M�kellef y�netimi ve toplu i�lemler</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-900">Toplam M�kellef</h4>
                      <Users className="text-blue-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-blue-900">42</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-green-900">Aktif D�nem</h4>
                      <Calendar className="text-green-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-green-900">2025/10</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-orange-900">Bu Ay ��lem</h4>
                      <FileText className="text-orange-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-orange-900">1,247</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-purple-900">E-Belge</h4>
                      <Globe className="text-purple-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-purple-900">384</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button onClick={() => toast('XML d��a aktarma haz�rlan�yor...', { icon: '??' })} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors">
                        <Download className="text-blue-600 group-hover:text-white" size={24} />
                      </div>
                      <h3 className="font-semibold">XML D��a Aktar</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Toplu veri aktar�m�</p>
                  </button>

                  <button onClick={() => toast('Excel raporu olu�turuluyor...', { icon: '??' })} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-100 group-hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors">
                        <BarChart3 className="text-green-600 group-hover:text-white" size={24} />
                      </div>
                      <h3 className="font-semibold">Excel Rapor</h3>
                    </div>
                    <p className="text-sm text-neutral-600">D�nem sonu raporlar�</p>
                  </button>

                  <button onClick={() => toast('E-Belge g�nderimi ba�lat�l�yor...', { icon: '??' })} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-600 rounded-xl flex items-center justify-center transition-colors">
                        <Mail className="text-purple-600 group-hover:text-white" size={24} />
                      </div>
                      <h3 className="font-semibold">Toplu E-Belge</h3>
                    </div>
                    <p className="text-sm text-neutral-600">G�B'e toplu g�nderim</p>
                  </button>
                </div>

                {/* Client List */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-4">M�kellef Listesi</h3>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-bold">
                            {String.fromCharCode(64 + i)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">M�kellef {i}</p>
                            <p className="text-sm text-neutral-600">VKN: 123456789{i}</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm">
                          Detay
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <ErrorBoundary>
                <SupportTab />
              </ErrorBoundary>
            )}

            {/* Support Tab OLD - BACKUP */}
            {false && activeTab === 'support' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Destek Sistemi</h2>
                  <p className="text-sm text-neutral-600 mt-1">Yard�m, dok�mantasyon ve canl� destek</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={() => toast('Canl� destek ba�lat�l�yor...', { icon: '??' })} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-all text-left group">
                    <MessageCircle className="text-blue-600 mb-3" size={32} />
                    <h3 className="font-semibold text-blue-900 mb-2">Canl� Destek</h3>
                    <p className="text-sm text-blue-700">7/24 online destek ekibi</p>
                  </button>

                  <button onClick={() => toast('Dok�mantasyon a��l�yor...', { icon: '??' })} className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all text-left group">
                    <FileText className="text-green-600 mb-3" size={32} />
                    <h3 className="font-semibold text-green-900 mb-2">Dok�mantasyon</h3>
                    <p className="text-sm text-green-700">Kapsaml� kullan�m k�lavuzu</p>
                  </button>

                  <button onClick={() => toast('Video e�itimleri haz�rlan�yor...', { icon: '??' })} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all text-left group">
                    <Globe className="text-purple-600 mb-3" size={32} />
                    <h3 className="font-semibold text-purple-900 mb-2">Video E�itimler</h3>
                    <p className="text-sm text-purple-700">Ad�m ad�m videolar</p>
                  </button>
                </div>

                {/* Support Tickets */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-900">Destek Talepleri</h3>
                    <button onClick={() => toast('Yeni destek talebi olu�turuluyor...', { icon: '??' })} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      <Plus size={16} />
                      Yeni Talep
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { id: 1, subject: 'E-Fatura Entegrasyonu', status: 'open', priority: 'high' },
                      { id: 2, subject: 'Ekstre G�nderimi Sorunu', status: 'in-progress', priority: 'medium' },
                      { id: 3, subject: 'Barkod Okuma Deste�i', status: 'resolved', priority: 'low' },
                    ].map(ticket => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-medium text-neutral-900">#{ticket.id} - {ticket.subject}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              ticket.status === 'open' ? 'bg-orange-100 text-orange-700' :
                              ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {ticket.status === 'open' ? 'A��k' : ticket.status === 'in-progress' ? '��lemde' : '��z�ld�'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                              ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {ticket.priority === 'high' ? 'Y�ksek' : ticket.priority === 'medium' ? 'Orta' : 'D���k'}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600">2 saat �nce g�ncellendi</p>
                        </div>
                        <button className="px-4 py-2 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors">
                          Detay
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-4">S�k Sorulan Sorular</h3>
                  <div className="space-y-3">
                    {[
                      'E-Fatura nas�l olu�turulur?',
                      'Barkod okuyucu nas�l kullan�l�r?',
                      'Ekstre payla��m� nas�l yap�l�r?',
                      'Hat�rlatmalar nas�l ayarlan�r?',
                      'Mali m��avir paneli �zellikleri nelerdir?',
                    ].map((q, i) => (
                      <button key={i} onClick={() => toast('Cevap a��l�yor...', { icon: '?' })} className="w-full text-left p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                        <p className="text-sm text-neutral-900">{q}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
              <ErrorBoundary>
                <ReminderManagement />
              </ErrorBoundary>
            )}

            {/* Statements Tab */}
            {activeTab === 'statements' && (
              <ErrorBoundary>
                <StatementSharing />
              </ErrorBoundary>
            )}

            {/* Barcode Tab */}
            {activeTab === 'barcode' && (
              <ErrorBoundary>
                <BarcodeScanner />
              </ErrorBoundary>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <ErrorBoundary>
                <NotificationsTab />
              </ErrorBoundary>
            )}

            {/* Notifications Tab OLD - BACKUP */}
            {false && activeTab === 'notifications' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Bildirim Merkezi</h2>
                    <p className="text-sm text-neutral-600 mt-1">T�m sistem bildirimleri ve uyar�lar</p>
                  </div>
                  <button onClick={() => toast('T�m bildirimler okundu olarak i�aretlendi', { icon: '?' })} className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors">
                    T�m�n� Okundu ��aretle
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-neutral-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-900">Toplam</h4>
                      <Bell className="text-blue-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-blue-900">127</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-orange-900">Okunmam��</h4>
                      <AlertCircle className="text-orange-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-orange-900">8</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-red-900">Acil</h4>
                      <XCircle className="text-red-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-red-900">3</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-green-900">Bu Hafta</h4>
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-green-900">42</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 border border-neutral-200">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Filter size={20} className="text-neutral-600" />
                    {['T�m�', 'Okunmam��', '�demeler', 'Faturalar', 'Hat�rlatmalar', 'Sistem'].map(filter => (
                      <button key={filter} className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-900 hover:text-white transition-colors">
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                  {[
                    { id: 1, type: 'payment', title: '�deme Hat�rlatmas�', message: 'ABC Ltd.�ti. i�in 15,000 ? �deme vadesi yar�n dolacak', time: '5 dk �nce', unread: true, urgent: true },
                    { id: 2, type: 'invoice', title: 'Yeni Fatura', message: 'XYZ A.�. i�in #INV-2025-042 numaral� fatura olu�turuldu', time: '1 saat �nce', unread: true, urgent: false },
                    { id: 3, type: 'reminder', title: 'Vade Tarihi Yakla��yor', message: '3 fatura i�in vade tarihi bu hafta i�inde', time: '2 saat �nce', unread: true, urgent: false },
                    { id: 4, type: 'system', title: 'Sistem G�ncellemesi', message: 'Yeni �zellikler eklendi: Barkod okuyucu aktif', time: '3 saat �nce', unread: false, urgent: false },
                    { id: 5, type: 'statement', title: 'Ekstre G�nderildi', message: 'DEF Ticaret i�in hesap ekstresi email ile g�nderildi', time: '5 saat �nce', unread: false, urgent: false },
                    { id: 6, type: 'payment', title: '�deme Al�nd�', message: 'GHI Ltd. 8,500 ? �deme ger�ekle�tirdi', time: '1 g�n �nce', unread: false, urgent: false },
                  ].map(notif => (
                    <div key={notif.id} className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${
                      notif.unread ? 'border-neutral-200 bg-blue-50' : 'border-neutral-200'
                    } ${notif.urgent ? 'ring-2 ring-red-300' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          notif.type === 'payment' ? 'bg-green-100' :
                          notif.type === 'invoice' ? 'bg-blue-100' :
                          notif.type === 'reminder' ? 'bg-orange-100' :
                          notif.type === 'statement' ? 'bg-purple-100' :
                          'bg-neutral-100'
                        }`}>
                          {notif.type === 'payment' && <DollarSign className="text-green-600" size={24} />}
                          {notif.type === 'invoice' && <FileText className="text-blue-600" size={24} />}
                          {notif.type === 'reminder' && <Clock className="text-orange-600" size={24} />}
                          {notif.type === 'statement' && <Mail className="text-purple-600" size={24} />}
                          {notif.type === 'system' && <Settings className="text-neutral-600" size={24} />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-neutral-900">{notif.title}</h3>
                            {notif.unread && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                            {notif.urgent && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                AC�L
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 mb-2">{notif.message}</p>
                          <p className="text-xs text-neutral-500">{notif.time}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {notif.unread && (
                            <button onClick={() => toast('Bildirim okundu olarak i�aretlendi', { icon: '?' })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Okundu i�aretle">
                              <CheckCircle size={20} />
                            </button>
                          )}
                          <button onClick={() => toast('Bildirim silindi', { icon: '???' })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Settings */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-4">Bildirim Tercihleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Email Bildirimleri', checked: true },
                      { label: 'SMS Bildirimleri', checked: false },
                      { label: 'Push Bildirimleri', checked: true },
                      { label: '�deme Hat�rlatmalar�', checked: true },
                      { label: 'Fatura Bildirimleri', checked: true },
                      { label: 'Sistem G�ncellemeleri', checked: false },
                    ].map((pref, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer">
                        <input type="checkbox" defaultChecked={pref.checked} className="w-5 h-5 text-neutral-900 rounded" />
                        <span className="text-sm text-neutral-700">{pref.label}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={() => toast('Tercihler kaydedildi', { icon: '??' })} className="w-full mt-4 bg-neutral-900 text-white py-3 rounded-xl hover:bg-neutral-800 transition-colors">
                    Tercihleri Kaydet
                  </button>
                </div>
              </div>
            )}
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
      {/* Check Modal */}
      {checkModalOpen && (
        <CheckFormModal
          open={checkModalOpen}
          onClose={() => setCheckModalOpen(false)}
          onSaved={() => loadChecks()}
          initial={editingCheck || undefined}
        />
      )}

      {/* Promissory Note Modal */}
      {promissoryModalOpen && (
        <PromissoryNoteFormModal
          open={promissoryModalOpen}
          onClose={() => setPromissoryModalOpen(false)}
          onSaved={() => loadPromissory()}
          initial={editingPromissory || undefined}
        />
      )}
    </div>
  )
}



