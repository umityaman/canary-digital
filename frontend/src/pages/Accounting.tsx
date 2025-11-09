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
import { card, button, input, badge, getStatGradient, DESIGN_TOKENS, cx } from '../styles/design-tokens'

// Lazy load heavy components for better performance
const IncomeTab = lazy(() => import('../components/accounting/IncomeTab'))
const ExpenseTab = lazy(() => import('../components/accounting/ExpenseTab'))
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
const AdvisorTab = lazy(() => import('../components/accounting/tabs/AdvisorTab'))
const SupportTab = lazy(() => import('../components/accounting/tabs/SupportTab'))
const IntegrationsTab = lazy(() => import('../components/accounting/tabs/IntegrationsTab'))
const CostAccounting = lazy(() => import('../components/accounting/CostAccounting'))

type Tab = 'dashboard' | 'income' | 'expense' | 'reports' | 'invoice' | 'offer' | 'ebelge' | 'tools' | 'advisor' | 'support' | 'receivables' | 'cari' | 'delivery' | 'reconciliation' | 'inventory' | 'cost-accounting' | 'company' | 'cash-bank' | 'bank-integration' | 'reminders' | 'statements' | 'barcode' | 'notifications' | 'integrations' | 'journal-entries' | 'chart-of-accounts' | 'current-accounts' | 'gib-einvoice'

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N - New invoice/offer
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        if (activeTab === 'invoice') {
          navigate('/accounting/invoice/new')
          toast.success('Yeni fatura oluşturuluyor...')
        } else if (activeTab === 'offer') {
          navigate('/accounting/quote/new')
          toast.success('Yeni teklif oluşturuluyor...')
        }
      }
      
      // Ctrl+F - Focus search input
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        if (activeTab === 'invoice') {
          const searchInput = document.querySelector('input[placeholder*="Fatura no veya müşteri ara"]') as HTMLInputElement
          searchInput?.focus()
          toast('Arama kutusuna odaklandı', { icon: '🔍', duration: 1500 })
        } else if (activeTab === 'offer') {
          const searchInput = document.querySelector('input[placeholder*="Teklif no veya müşteri ara"]') as HTMLInputElement
          searchInput?.focus()
          toast('Arama kutusuna odaklandı', { icon: '🔍', duration: 1500 })
        }
      }
      
      // Ctrl+P - Print
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault()
        window.print()
        toast.success('Yazdırma penceresi açılıyor...')
      }
      
      // Esc - Close dropdowns and deselect
      if (e.key === 'Escape') {
        setOpenInvoiceDropdown(null)
        setOpenOfferDropdown(null)
        setSelectedInvoices([])
        setSelectedOffers([])
        setShowAdvancedFilters(false)
        setShowOfferAdvancedFilters(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, navigate])

  const loadStats = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading accounting stats...')
      const response = await accountingAPI.getStats()
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

  const loadInvoices = async () => {
    try {
      setInvoicesLoading(true)
      console.log('🔍 Loading invoices...', { invoiceStatusFilter, debouncedInvoiceSearch, currentPage })
      const response = await invoiceAPI.getAll({
        status: invoiceStatusFilter || undefined,
        search: debouncedInvoiceSearch || undefined,
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
      console.log('🔍 Loading offers...', { offerStatusFilter, debouncedOfferSearch, offerCurrentPage })
      const response = await offerAPI.getAll({
        status: offerStatusFilter || undefined,
        search: debouncedOfferSearch || undefined,
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

  const handleConvertToInvoice = async (offerId: number) => {
    if (!confirm('Bu teklifi faturaya dönüştürmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      // Note: Bu endpoint için orderId, startDate, endDate gerekiyor
      // Basitleştirilmiş versiyon - gerçek implementasyonda modal ile bu bilgileri almalısınız
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      
      const response = await offerAPI.convertToInvoice(offerId, {
        orderId: offerId, // Geçici olarak offerId kullanıyoruz
        startDate: today,
        endDate: nextMonth,
        notes: 'Tekliften otomatik oluşturuldu'
      })
      
      toast.success('Teklif başarıyla faturaya dönüştürüldü')
      navigate(`/accounting/invoice/${response.data.invoice.id}`)
    } catch (error: any) {
      console.error('Failed to convert offer:', error)
      toast.error('Dönüştürme başarısız: ' + (error.response?.data?.message || error.message))
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
    if (!confirm(`${selectedInvoices.length} faturayı silmek istediğinizden emin misiniz?`)) {
      return
    }
    
    try {
      // Bu işlem her faturayı tek tek silecek - idealde backend'de bulk delete endpoint olmalı
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
      toast.error('Toplu silme başarısız')
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
    if (!confirm(`${selectedOffers.length} teklifi silmek istediğinizden emin misiniz?`)) {
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
      toast.error('Toplu silme başarısız')
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
    toast('Email gönderme özelliği yakında eklenecek!', { icon: 'ℹ️' })
    setOpenInvoiceDropdown(null)
  }

  const handleSendWhatsApp = (invoice: any) => {
    const customer = invoice.customer
    if (!customer?.phone) {
      toast.error('Müşterinin telefon numarası bulunamadı')
      return
    }
    const message = `Merhaba, ${invoice.invoiceNumber} numaralı faturanız hazır. Toplam: ${invoice.total?.toFixed(2)} TL`
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    toast.success('WhatsApp açılıyor...')
    setOpenInvoiceDropdown(null)
  }

  const handlePrint = (invoice: any) => {
    navigate(`/accounting/invoice/${invoice.id}`)
    setTimeout(() => window.print(), 500)
    setOpenInvoiceDropdown(null)
  }

  const handleCopyInvoice = async (invoice: any) => {
    try {
      const invoiceText = `Fatura No: ${invoice.invoiceNumber}\nMüşteri: ${invoice.customer?.name}\nTutar: ${invoice.total?.toFixed(2)} TL`
      await navigator.clipboard.writeText(invoiceText)
      toast.success('Fatura bilgileri kopyalandı!')
    } catch (error) {
      toast.error('Kopyalama başarısız')
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
    toast('Email gönderme özelliği yakında eklenecek!', { icon: 'ℹ️' })
    setOpenOfferDropdown(null)
  }

  const handleSendOfferWhatsApp = (offer: any) => {
    const customer = offer.customer
    if (!customer?.phone) {
      toast.error('Müşterinin telefon numarası bulunamadı')
      return
    }
    const message = `Merhaba, ${offer.offerNumber} numaralı teklifimiz hazır. Toplam: ${offer.total?.toFixed(2)} TL`
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    toast.success('WhatsApp açılıyor...')
    setOpenOfferDropdown(null)
  }

  const handlePrintOffer = (offer: any) => {
    navigate(`/accounting/quote/${offer.id}`)
    setTimeout(() => window.print(), 500)
    setOpenOfferDropdown(null)
  }

  const handleCopyOffer = async (offer: any) => {
    try {
      const offerText = `Teklif No: ${offer.offerNumber}\nMüşteri: ${offer.customer?.name}\nTutar: ${offer.total?.toFixed(2)} TL`
      await navigator.clipboard.writeText(offerText)
      toast.success('Teklif bilgileri kopyalandı!')
    } catch (error) {
      toast.error('Kopyalama başarısız')
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
      toast.error('Çekler yüklenemedi: ' + (error.response?.data?.message || error.message))
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
      toast.error('Senetler yüklenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setPromissoryLoading(false)
    }
  }

  const handleDeleteCheck = async (id: number) => {
    if (!confirm('Bu çeki silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      await checksAPI.delete(id)
      toast.success('Çek başarıyla silindi')
      loadChecks()
    } catch (error: any) {
      console.error('Failed to delete check:', error)
      toast.error('Çek silinemedi: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeletePromissory = async (id: number) => {
    if (!confirm('Bu senedi silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      await promissoryAPI.delete(id)
      toast.success('Senet başarıyla silindi')
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
      toast.error('Yaşlandırma verisi alınamadı: ' + (error.response?.data?.message || error.message))
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
    { id: 'journal-entries' as const, label: 'Muhasebe Fişleri', icon: <FileText size={18} /> },
    { id: 'chart-of-accounts' as const, label: 'Hesap Planı', icon: <BarChart3 size={18} /> },
    { id: 'current-accounts' as const, label: 'Cari Hesaplar', icon: <Users size={18} /> },
    { id: 'cost-accounting' as const, label: 'Maliyet Muhasebesi', icon: <DollarSign size={18} /> },
    { id: 'inventory' as const, label: 'Stok Muhasebesi', icon: <Package size={18} /> },
    { id: 'company' as const, label: 'Şirket Bilgileri', icon: <Building2 size={18} /> },
    { id: 'cash-bank' as const, label: 'Kasa & Banka', icon: <Banknote size={18} /> },
    { id: 'bank-integration' as const, label: 'Banka Entegrasyonu', icon: <Building2 size={18} /> },
    { id: 'reports' as const, label: 'Raporlar', icon: <PieChart size={18} /> },
    { id: 'invoice' as const, label: 'Fatura Takibi', icon: <FileText size={18} /> },
    { id: 'offer' as const, label: 'Teklif Yönetimi', icon: <Receipt size={18} /> },
    { id: 'ebelge' as const, label: 'e-Belge', icon: <CreditCard size={18} /> },
    { id: 'gib-einvoice' as const, label: 'GIB e-Fatura', icon: <FileText size={18} /> },
    { id: 'delivery' as const, label: 'İrsaliye', icon: <Package size={18} /> },
    { id: 'reconciliation' as const, label: 'Banka Mutabakat', icon: <Building2 size={18} /> },
    { id: 'integrations' as const, label: 'Entegrasyonlar', icon: <Link2 size={18} /> },
    { id: 'tools' as const, label: 'İşletme Kolaylıkları', icon: <Settings size={18} /> },
    { id: 'advisor' as const, label: 'Mali Müşavir', icon: <Users size={18} /> },
    { id: 'support' as const, label: 'Yardım & Araçlar', icon: <Globe size={18} /> },
    { id: 'cari' as const, label: 'Cari Hesaplar', icon: <Users size={18} /> },
    { id: 'receivables' as const, label: 'Alacak Yönetimi', icon: <DollarSign size={18} /> },
  ]

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 space-y-4 pb-10">
      {/* Keyboard Shortcuts Info */}
      <div className={`${DESIGN_TOKENS?.colors?.bg.subtle} ${DESIGN_TOKENS?.colors?.border.light} border ${DESIGN_TOKENS.radius.md} ${DESIGN_TOKENS.spacing.sm.padding} flex items-center ${DESIGN_TOKENS.spacing.md.gap} ${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>
        <div className="flex items-center gap-2">
          <kbd className={`px-2 py-1 ${DESIGN_TOKENS?.colors?.bg.base} ${DESIGN_TOKENS?.colors?.border.dark} border ${DESIGN_TOKENS.radius.sm} ${DESIGN_TOKENS.shadow.sm} font-mono`}>Ctrl+N</kbd>
          <span>Yeni Oluştur</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className={`px-2 py-1 ${DESIGN_TOKENS?.colors?.bg.base} ${DESIGN_TOKENS?.colors?.border.dark} border ${DESIGN_TOKENS.radius.sm} ${DESIGN_TOKENS.shadow.sm} font-mono`}>Ctrl+F</kbd>
          <span>Ara</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className={`px-2 py-1 ${DESIGN_TOKENS?.colors?.bg.base} ${DESIGN_TOKENS?.colors?.border.dark} border ${DESIGN_TOKENS.radius.sm} ${DESIGN_TOKENS.shadow.sm} font-mono`}>Ctrl+P</kbd>
          <span>Yazdır</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className={`px-2 py-1 ${DESIGN_TOKENS?.colors?.bg.base} ${DESIGN_TOKENS?.colors?.border.dark} border ${DESIGN_TOKENS.radius.sm} ${DESIGN_TOKENS.shadow.sm} font-mono`}>Esc</kbd>
          <span>Kapat</span>
        </div>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Bu Ay Gelir */}
          <div className={card('md', 'sm', 'default', 'lg')}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${getStatGradient('revenue')} ${DESIGN_TOKENS.radius.md} flex items-center justify-center`}>
                <TrendingUp className={DESIGN_TOKENS.colors.semantic.success.text} size={24} />
              </div>
              {stats && stats.invoiceCount > 0 && (
                <span className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
                  {stats.invoiceCount} fatura
                </span>
              )}
            </div>
            <h3 className={`${DESIGN_TOKENS?.typography?.stat.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}>
              {stats ? formatCurrency(stats.totalRevenue) : '₺0'}
            </h3>
            <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>Bu Ay Gelir</p>
          </div>

          {/* Bu Ay Gider */}
          <div className={card('md', 'sm', 'default', 'lg')}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${getStatGradient('expense')} ${DESIGN_TOKENS.radius.md} flex items-center justify-center`}>
                <TrendingDown className={DESIGN_TOKENS.colors.semantic.error.text} size={24} />
              </div>
            </div>
            <h3 className={`${DESIGN_TOKENS?.typography?.stat.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}>
              {stats ? formatCurrency(stats.totalExpenses) : '₺0'}
            </h3>
            <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>Bu Ay Gider</p>
          </div>

          {/* Net Kâr */}
          <div className={card('md', 'sm', 'default', 'lg')}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${getStatGradient('profit', stats?.netProfit)} ${DESIGN_TOKENS.radius.md} flex items-center justify-center`}>
                <DollarSign className={stats && stats.netProfit >= 0 ? DESIGN_TOKENS.colors.semantic.info.text : DESIGN_TOKENS.colors.semantic.error.text} size={24} />
              </div>
              <span className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>Net</span>
            </div>
            <h3 className={`${DESIGN_TOKENS?.typography?.stat.sm} mb-1 ${
              stats && stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats ? formatCurrency(stats.netProfit) : '₺0'}
            </h3>
            <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>Net Kâr</p>
          </div>

          {/* Tahsilat / Bekleyen */}
          <div className={card('md', 'sm', 'default', 'lg')}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${getStatGradient('overdue')} ${DESIGN_TOKENS.radius.md} flex items-center justify-center`}>
                <Clock className={DESIGN_TOKENS.colors.semantic.error.text} size={24} />
              </div>
              <span className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>Bekleyen</span>
            </div>
            <h3 className={`${DESIGN_TOKENS?.typography?.stat.sm} ${DESIGN_TOKENS?.colors?.text.primary} mb-1`}>
              {stats ? formatCurrency(stats.totalOverdue) : '₺0'}
            </h3>
            <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>Vade Geçmiş</p>
            {stats && stats.totalCollections > 0 && (
              <p className={`text-xs ${DESIGN_TOKENS?.colors?.semantic.success.text} mt-2`}>
                Bu ay: {formatCurrency(stats.totalCollections)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs - Vertical Layout */}
      <div className={`${card('sm', 'sm', 'default', 'lg')} overflow-hidden`}>
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Tabs */}
          <nav className={`flex flex-row ${DESIGN_TOKENS.spacing.xs.gap} overflow-x-auto ${DESIGN_TOKENS?.colors?.border.light} border-b lg:border-b-0 lg:border-r lg:w-56 lg:flex-col lg:gap-0 flex-shrink-0`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-[9rem] items-center space-x-2 px-3 py-2.5 ${DESIGN_TOKENS?.typography?.label.lg} transition-colors lg:min-w-0 lg:w-full ${
                  activeTab === tab.id
                    ? `${DESIGN_TOKENS?.colors?.interactive.default}`
                    : `${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle}`
                }`}
              >
                {tab.icon}
                <span className="text-xs lg:text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className={`flex-1 ${DESIGN_TOKENS.spacing.md.padding} lg:${DESIGN_TOKENS.spacing.lg.padding}`}>
            <ErrorBoundary fallbackTitle="Muhasebe Modülü Hatası" fallbackMessage="Muhasebe modülünde bir sorun oluştu. Lütfen sayfayı yenileyin.">
              <Suspense fallback={<LoadingFallback message="İçerik yükleniyor..." />}>
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && <AccountingDashboard />}

                {/* Income Tab */}
                {activeTab === 'income' && <IncomeTab />}

                {/* Expense Tab */}
                {activeTab === 'expense' && <ExpenseTab />}

                {/* Journal Entries Tab */}
                {activeTab === 'journal-entries' && <JournalEntryList />}

                {/* Chart of Accounts Tab */}
                {activeTab === 'chart-of-accounts' && <ChartOfAccountsManagement />}

                {/* Current Accounts Tab */}
                {activeTab === 'current-accounts' && <CurrentAccountManagement />}

                {/* GIB e-Invoice Management Tab */}
                {activeTab === 'gib-einvoice' && <EInvoiceManagement />}

                {/* Bank Integration Tab */}
                {activeTab === 'bank-integration' && <BankAccountManagement />}

            {/* Cari (Current Accounts) Tab - Direct to Account Cards */}
            {activeTab === 'cari' && <AccountCardList />}

            {/* Reports Tab - Advanced Reporting with Sub-tabs */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h2 className={`${DESIGN_TOKENS?.typography?.heading.h2} ${DESIGN_TOKENS?.colors?.text.primary} mb-6`}>
                  Raporlar
                </h2>
                
                {/* Sub-tabs for Reports */}
                <div className={`flex gap-2 border-b border-gray-200 mb-6`}>
                  <button
                    onClick={() => setReportsSubTab('advanced')}
                    className={`px-6 py-3 ${DESIGN_TOKENS?.typography?.label.lg} transition-colors ${
                      reportsSubTab === 'advanced'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Gelişmiş Raporlar
                  </button>
                  <button
                    onClick={() => setReportsSubTab('trial-balance')}
                    className={`px-6 py-3 ${DESIGN_TOKENS?.typography?.label.lg} transition-colors ${
                      reportsSubTab === 'trial-balance'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mizan
                  </button>
                  <button
                    onClick={() => setReportsSubTab('income-statement')}
                    className={`px-6 py-3 ${DESIGN_TOKENS?.typography?.label.lg} transition-colors ${
                      reportsSubTab === 'income-statement'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Gelir-Gider Tablosu
                  </button>
                  <button
                    onClick={() => setReportsSubTab('balance-sheet')}
                    className={`px-6 py-3 ${DESIGN_TOKENS?.typography?.label.lg} transition-colors ${
                      reportsSubTab === 'balance-sheet'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bilanço
                  </button>
                </div>

                {/* Sub-tab content */}
                {reportsSubTab === 'advanced' && <AdvancedReporting />}
                {reportsSubTab === 'trial-balance' && <TrialBalanceReport />}
                {reportsSubTab === 'income-statement' && <IncomeStatementReport />}
                {reportsSubTab === 'balance-sheet' && <BalanceSheetReport />}
              </div>
            )}

            {/* Receivables Management Tab - Çekler, Senetler, Yaşlandırma */}
            {activeTab === 'receivables' && (
              <div className="space-y-6">
                <h2 className={`${DESIGN_TOKENS?.typography?.h2 || 'text-xl font-semibold'} ${DESIGN_TOKENS?.colors?.text?.primary || 'text-neutral-900'} mb-6`}>Alacak Yönetimi</h2>
                
                {/* Sub-tabs for Checks, Promissory, Aging */}
                <div className={`flex gap-2 ${DESIGN_TOKENS?.colors?.border.light} border-b mb-6`}>
                  <button
                    onClick={() => setReceivablesSubTab('checks')}
                    className={`px-6 py-3 ${DESIGN_TOKENS?.typography?.label.lg} transition-colors ${
                      receivablesSubTab === 'checks'
                        ? `border-b-2 ${DESIGN_TOKENS?.colors?.interactive.default} ${DESIGN_TOKENS?.colors?.text.primary}`
                        : `${DESIGN_TOKENS?.colors?.text.tertiary} hover:${DESIGN_TOKENS?.colors?.text.primary}`
                    }`}
                  >
                    Çekler
                  </button>
                  <button
                    onClick={() => setReceivablesSubTab('promissory')}
                    className={`px-6 py-3 ${DESIGN_TOKENS?.typography?.label.lg} transition-colors ${
                      receivablesSubTab === 'promissory'
                        ? `border-b-2 ${DESIGN_TOKENS?.colors?.interactive.default} ${DESIGN_TOKENS?.colors?.text.primary}`
                        : `${DESIGN_TOKENS?.colors?.text.tertiary} hover:${DESIGN_TOKENS?.colors?.text.primary}`
                    }`}
                  >
                    Senetler
                  </button>
                  <button
                    onClick={() => setReceivablesSubTab('aging')}
                    className={`px-6 py-3 ${DESIGN_TOKENS?.typography?.label.lg} transition-colors ${
                      receivablesSubTab === 'aging'
                        ? `border-b-2 ${DESIGN_TOKENS?.colors?.interactive.default} ${DESIGN_TOKENS?.colors?.text.primary}`
                        : `${DESIGN_TOKENS?.colors?.text.tertiary} hover:${DESIGN_TOKENS?.colors?.text.primary}`
                    }`}
                  >
                    Yaşlandırma Raporu
                  </button>
                </div>

                {/* Checks Sub-tab */}
                {receivablesSubTab === 'checks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}>Çekler</h3>
                      <button
                        onClick={() => { setEditingCheck(null); setCheckModalOpen(true) }}
                        className={cx(button('md', 'primary', 'md'), 'gap-2')}
                      >
                        <FileText size={18} />
                        Yeni Çek
                      </button>
                    </div>

                    <div className={card('sm', 'sm', 'default', 'lg')}>
                      {checksLoading ? (
                        <div className={`p-12 text-center ${DESIGN_TOKENS?.colors?.text.tertiary}`}>Çekler yükleniyor...</div>
                      ) : checks.length === 0 ? (
                        <div className={`p-12 text-center ${DESIGN_TOKENS?.colors?.text.tertiary}`}>Çek bulunamadı</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className={`${DESIGN_TOKENS?.colors?.bg.subtle} ${DESIGN_TOKENS?.colors?.border.light} border-b`}>
                              <tr>
                                <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase`}>No</th>
                                <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase`}>Müşteri</th>
                                <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase`}>Tutar</th>
                                <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase`}>Vade</th>
                                <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase`}>Durum</th>
                                <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase`}>İşlemler</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                              {checks.map((c: any) => (
                                <tr key={c.id} className="hover:bg-neutral-50">
                                  <td className="px-6 py-4">{c.documentNumber || `#${c.id}`}</td>
                                  <td className="px-6 py-4">{c.customer?.name || c.customerName || '-'}</td>
                                  <td className="px-6 py-4">{formatCurrency(c.amount || 0)}</td>
                                  <td className="px-6 py-4">{c.dueDate ? formatDate(c.dueDate) : '-'}</td>
                                  <td className="px-6 py-4">{c.status || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => { setEditingCheck(c); setCheckModalOpen(true) }}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Düzenle"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCheck(c.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
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
                      <h3 className="text-lg font-semibold text-neutral-900">Senetler</h3>
                      <button
                        onClick={() => { setEditingPromissory(null); setPromissoryModalOpen(true) }}
                        className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
                      >
                        <FileText size={18} />
                        Yeni Senet
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                      {promissoryLoading ? (
                        <div className="p-12 text-center text-neutral-600">Senetler yükleniyor...</div>
                      ) : promissory.length === 0 ? (
                        <div className="p-12 text-center text-neutral-600">Senet bulunamadı</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Müşteri</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Tutar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Vade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Durum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">İşlemler</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                              {promissory.map((p: any) => (
                                <tr key={p.id} className="hover:bg-neutral-50">
                                  <td className="px-6 py-4">{p.documentNumber || `#${p.id}`}</td>
                                  <td className="px-6 py-4">{p.customer?.name || p.customerName || '-'}</td>
                                  <td className="px-6 py-4">{formatCurrency(p.amount || 0)}</td>
                                  <td className="px-6 py-4">{p.dueDate ? formatDate(p.dueDate) : '-'}</td>
                                  <td className="px-6 py-4">{p.status || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => { setEditingPromissory(p); setPromissoryModalOpen(true) }}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Düzenle"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePromissory(p.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
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
              <ErrorBoundary fallbackTitle="Fatura Listesi Hatası" fallbackMessage="Fatura listesi yüklenirken bir sorun oluştu.">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`${DESIGN_TOKENS?.typography?.h2 || 'text-xl font-semibold'} ${DESIGN_TOKENS?.colors?.text?.primary || 'text-neutral-900'}`}>Fatura Yönetimi</h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setActiveTab('ebelge')}
                        className={cx(button('md', 'outline', 'md'), 'gap-2')}
                        title="E-Fatura oluştur ve gönder"
                      >
                        <Globe size={18} />
                        E-Belge
                      </button>
                      <button 
                        onClick={() => navigate('/accounting/invoice/new')}
                        className={cx(button('md', 'primary', 'md'), 'gap-2')}
                      >
                        <FileText size={18} />
                        Yeni Fatura
                      </button>
                    </div>
                </div>

                {/* Filters */}
                <div className={`${card('sm', 'flat', 'default', 'lg')} space-y-4`}>
                  {/* Basic Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className={`absolute left-3 top-3 ${DESIGN_TOKENS?.colors?.text.muted}`} size={18} />
                      <input
                        type="text"
                        placeholder="Fatura no veya müşteri ara..."
                        value={invoiceSearch}
                        onChange={(e) => setInvoiceSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchInvoices()}
                        className={cx(input('md', 'default', undefined, 'md'), 'pl-10')}
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                      <Filter className={`absolute left-3 top-3 ${DESIGN_TOKENS?.colors?.text.muted}`} size={18} />
                      <select
                        value={invoiceStatusFilter}
                        onChange={(e) => {
                          setInvoiceStatusFilter(e.target.value)
                          setCurrentPage(1)
                        }}
                        className={cx(input('md', 'default', undefined, 'md'), 'pl-10 appearance-none')}
                      >
                        <option value="">Tüm Durumlar</option>
                        <option value="draft">Taslak</option>
                        <option value="sent">Gönderildi</option>
                        <option value="paid">Ödendi</option>
                        <option value="partial_paid">Kısmi Ödeme</option>
                        <option value="cancelled">İptal</option>
                      </select>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className={cx(button('md', 'outline', 'md'), 'gap-2 justify-center')}
                    >
                      <Filter size={18} />
                      {showAdvancedFilters ? 'Filtreleri Gizle' : 'Gelişmiş Filtre'}
                    </button>

                    {/* Search Button */}
                    <button
                      onClick={handleSearchInvoices}
                      className={button('md', 'primary', 'md')}
                    >
                      Ara
                    </button>
                  </div>

                  {/* Advanced Filters */}
                  {showAdvancedFilters && (
                    <div className={`pt-4 ${DESIGN_TOKENS?.colors?.border.light} border-t space-y-4`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date Range Preset */}
                        <div>
                          <label className={`block ${DESIGN_TOKENS?.typography?.label.lg} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                            Tarih Aralığı
                          </label>
                          <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as any)}
                            className={input('md', 'default', undefined, 'md')}
                          >
                            <option value="all">Tüm Zamanlar</option>
                            <option value="7days">Son 7 Gün</option>
                            <option value="30days">Son 30 Gün</option>
                            <option value="custom">Özel Tarih</option>
                          </select>
                        </div>

                        {/* Min Amount */}
                        <div>
                          <label className={`block ${DESIGN_TOKENS?.typography?.label.lg} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                            Min. Tutar (₺)
                          </label>
                          <input
                            type="number"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className={input('md', 'default', undefined, 'md')}
                          />
                        </div>

                        {/* Max Amount */}
                        <div>
                          <label className={`block ${DESIGN_TOKENS?.typography?.label.lg} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                            Max. Tutar (₺)
                          </label>
                          <input
                            type="number"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            placeholder="999999"
                            min="0"
                            step="0.01"
                            className={input('md', 'default', undefined, 'md')}
                          />
                        </div>
                      </div>

                      {/* Custom Date Range */}
                      {dateRange === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={`block ${DESIGN_TOKENS?.typography?.label.lg} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                              Başlangıç Tarihi
                            </label>
                            <input
                              type="date"
                              value={customDateFrom}
                              onChange={(e) => setCustomDateFrom(e.target.value)}
                              className={input('md', 'default', undefined, 'md')}
                            />
                          </div>
                          <div>
                            <label className={`block ${DESIGN_TOKENS?.typography?.label.lg} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                              Bitiş Tarihi
                            </label>
                            <input
                              type="date"
                              value={customDateTo}
                              onChange={(e) => setCustomDateTo(e.target.value)}
                              className={input('md', 'default', undefined, 'md')}
                            />
                          </div>
                        </div>
                      )}

                      {/* Reset Filters Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={handleResetFilters}
                          className={cx(button('md', 'ghost', 'md'), 'gap-2')}
                        >
                          <X size={18} />
                          Filtreleri Temizle
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Table */}
                <div className={`${card('sm', 'sm', 'default', 'lg')} overflow-hidden`}>
                  {invoicesLoading ? (
                    <TableSkeleton rows={10} columns={8} showHeader={true} />
                  ) : invoices.length === 0 ? (
                    <div className={`p-12 text-center ${DESIGN_TOKENS?.colors?.text.tertiary}`}>
                      <FileText className={`mx-auto mb-4 ${DESIGN_TOKENS?.colors?.text.muted}`} size={48} />
                      <p className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.secondary}`}>Fatura bulunamadı</p>
                      <p className={`${DESIGN_TOKENS?.typography?.body.md} mt-2`}>Yeni fatura oluşturarak başlayın</p>
                    </div>
                  ) : (
                    <>
                      {/* Bulk Actions Bar */}
                      {selectedInvoices.length > 0 && (
                        <div className={`${DESIGN_TOKENS?.colors?.interactive.default} px-6 py-3 flex items-center justify-between ${DESIGN_TOKENS.radius.lg} rounded-b-none`}>
                          <div className="flex items-center gap-4">
                            <span className={DESIGN_TOKENS.typography.label.lg}>{selectedInvoices.length} fatura seçildi</span>
                            <button
                              onClick={() => setSelectedInvoices([])}
                              className={`${DESIGN_TOKENS?.typography?.body.md} text-neutral-300 hover:text-white`}
                            >
                              Seçimi Temizle
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleBulkDeleteInvoices}
                              className={button('md', 'danger', 'md')}
                            >
                              Toplu Sil
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className={`${DESIGN_TOKENS?.colors?.bg.subtle} ${DESIGN_TOKENS?.colors?.border.light} border-b`}>
                            <tr>
                              <th className={`px-6 py-3 text-left`}>
                                <input
                                  type="checkbox"
                                  checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                                  onChange={handleSelectAllInvoices}
                                  className={`${DESIGN_TOKENS.radius.sm} border-neutral-300 text-neutral-900 focus:ring-neutral-900`}
                                />
                              </th>
                              <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Fatura No
                              </th>
                              <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Müşteri
                              </th>
                              <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Ekipman
                              </th>
                              <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Tarih
                              </th>
                              <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Tutar
                              </th>
                              <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Ödenen
                              </th>
                              <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Durum
                              </th>
                              <th className={`px-6 py-3 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                İşlemler
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {invoices.map((invoice) => (
                              <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedInvoices.includes(invoice.id)}
                                    onChange={() => handleSelectInvoice(invoice.id)}
                                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                  />
                                </td>
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
                                    {invoice.customer.name}
                                  </div>
                                  <div className="text-xs text-neutral-500">{invoice.customer.email}</div>
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
                                      onClick={() => navigate(`/accounting/invoice/${invoice.id}`)}
                                      className="text-neutral-900 hover:text-neutral-700 font-medium hover:underline transition-all"
                                    >
                                      Detay
                                    </button>
                                    <div className="relative">
                                      <button
                                        onClick={() => setOpenInvoiceDropdown(openInvoiceDropdown === invoice.id ? null : invoice.id)}
                                        className={`p-1 hover:${DESIGN_TOKENS?.colors?.bg.muted} ${DESIGN_TOKENS.radius.md} transition-colors`}
                                      >
                                        <MoreVertical size={18} className={DESIGN_TOKENS.colors.text.tertiary} />
                                      </button>
                                      {openInvoiceDropdown === invoice.id && (
                                        <>
                                          <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setOpenInvoiceDropdown(null)}
                                          />
                                          <div className={`absolute right-0 mt-2 w-48 ${DESIGN_TOKENS?.colors?.bg.base} ${DESIGN_TOKENS.radius.md} ${DESIGN_TOKENS.shadow.lg} ${DESIGN_TOKENS?.colors?.border.light} border py-1 z-20`}>
                                            <button
                                              onClick={() => handleDownloadPDF(invoice)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <Download size={16} />
                                              PDF İndir
                                            </button>
                                            <button
                                              onClick={() => handleSendEmail(invoice)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <Mail size={16} />
                                              Email Gönder
                                            </button>
                                            <button
                                              onClick={() => handleSendWhatsApp(invoice)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <MessageCircle size={16} />
                                              WhatsApp Gönder
                                            </button>
                                            <button
                                              onClick={() => handlePrint(invoice)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <Printer size={16} />
                                              Yazdır
                                            </button>
                                            <button
                                              onClick={() => handleCopyInvoice(invoice)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <Copy size={16} />
                                              Kopyala
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className={`${DESIGN_TOKENS?.colors?.bg.subtle} px-6 py-4 flex items-center justify-between ${DESIGN_TOKENS?.colors?.border.light} border-t`}>
                        <div className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>
                          Sayfa {currentPage} / {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={cx(button('md', 'outline', 'md'), 'disabled:opacity-50 disabled:cursor-not-allowed')}
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={cx(button('md', 'outline', 'md'), 'disabled:opacity-50 disabled:cursor-not-allowed')}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                </div>
              </ErrorBoundary>
            )}

            {/* Offer Tab */}
            {activeTab === 'offer' && (
              <ErrorBoundary fallbackTitle="Teklif Listesi Hatası" fallbackMessage="Teklif listesi yüklenirken bir sorun oluştu.">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`${DESIGN_TOKENS?.typography?.h2 || 'text-xl font-semibold'} ${DESIGN_TOKENS?.colors?.text?.primary || 'text-neutral-900'}`}>Teklif Listesi</h2>
                  <button 
                    onClick={() => navigate('/accounting/quote/new')}
                    className={cx(button('md', 'primary', 'md'), 'gap-2')}
                  >
                    <Receipt size={18} />
                    Yeni Teklif
                  </button>
                </div>

                {/* Filters */}
                <div className={cx(card('sm', 'flat', 'default', 'lg'), 'max-w-full')}>
                  {/* Basic Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className={`absolute left-3 top-3 ${DESIGN_TOKENS?.colors?.text.muted}`} size={18} />
                      <input
                        type="text"
                        placeholder="Teklif no veya müşteri ara..."
                        value={offerSearch}
                        onChange={(e) => setOfferSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchOffers()}
                        className={cx(input('md', 'default', undefined, 'md'), 'pl-10')}
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                      <Filter className={`absolute left-3 top-3 ${DESIGN_TOKENS?.colors?.text.muted}`} size={18} />
                      <select
                        value={offerStatusFilter}
                        onChange={(e) => {
                          setOfferStatusFilter(e.target.value)
                          setOfferCurrentPage(1)
                        }}
                        className={cx(input('md', 'default', undefined, 'md'), 'pl-10 appearance-none')}
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

                    {/* Advanced Filters Toggle */}
                    <button
                      onClick={() => setShowOfferAdvancedFilters(!showOfferAdvancedFilters)}
                      className={cx(button('md', 'outline', 'md'), 'gap-2 justify-center')}
                    >
                      <Filter size={18} />
                      {showOfferAdvancedFilters ? 'Filtreleri Gizle' : 'Gelişmiş Filtre'}
                    </button>

                    {/* Search Button */}
                    <button
                      onClick={handleSearchOffers}
                      className={button('md', 'primary', 'md')}
                    >
                      Ara
                    </button>
                  </div>

                  {/* Advanced Filters */}
                  {showOfferAdvancedFilters && (
                    <div className={`pt-4 ${DESIGN_TOKENS?.colors?.border.light} border-t space-y-4 max-w-full`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Date Range Preset */}
                        <div>
                          <label className={`block ${DESIGN_TOKENS?.typography?.label.lg} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                            Tarih Aralığı
                          </label>
                          <select
                            value={offerDateRange}
                            onChange={(e) => setOfferDateRange(e.target.value as any)}
                            className={input('md', 'default', undefined, 'md')}
                          >
                            <option value="all">Tüm Zamanlar</option>
                            <option value="7days">Son 7 Gün</option>
                            <option value="30days">Son 30 Gün</option>
                            <option value="custom">Özel Tarih</option>
                          </select>
                        </div>

                        {/* Min Amount */}
                        <div>
                          <label className={`block ${DESIGN_TOKENS?.typography?.label.lg} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                            Min. Tutar (₺)
                          </label>
                          <input
                            type="number"
                            value={offerMinAmount}
                            onChange={(e) => setOfferMinAmount(e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className={input('md', 'default', undefined, 'md')}
                          />
                        </div>

                        {/* Max Amount */}
                        <div>
                          <label className={`block ${DESIGN_TOKENS?.typography?.label.lg} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                            Max. Tutar (₺)
                          </label>
                          <input
                            type="number"
                            value={offerMaxAmount}
                            onChange={(e) => setOfferMaxAmount(e.target.value)}
                            placeholder="999999"
                            min="0"
                            step="0.01"
                            className={input('md', 'default', undefined, 'md')}
                          />
                        </div>
                      </div>

                      {/* Custom Date Range */}
                      {offerDateRange === 'custom' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className={`block ${DESIGN_TOKENS?.typography?.label.lg} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                              Başlangıç Tarihi
                            </label>
                            <input
                              type="date"
                              value={offerCustomDateFrom}
                              onChange={(e) => setOfferCustomDateFrom(e.target.value)}
                              className={input('md', 'default', undefined, 'md')}
                            />
                          </div>
                          <div>
                            <label className={`block ${DESIGN_TOKENS?.typography?.label.lg} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                              Bitiş Tarihi
                            </label>
                            <input
                              type="date"
                              value={offerCustomDateTo}
                              onChange={(e) => setOfferCustomDateTo(e.target.value)}
                              className={input('md', 'default', undefined, 'md')}
                            />
                          </div>
                        </div>
                      )}

                      {/* Reset Filters Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={handleResetOfferFilters}
                          className={cx(button('md', 'ghost', 'md'), 'gap-2')}
                        >
                          <X size={18} />
                          Filtreleri Temizle
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Offer Table */}
                <div className={cx(card('sm', 'sm', 'default', 'lg'), 'overflow-hidden max-w-full')}>
                  {offersLoading ? (
                    <TableSkeleton rows={10} columns={7} showHeader={true} />
                  ) : offers.length === 0 ? (
                    <div className={`p-12 text-center ${DESIGN_TOKENS?.colors?.text.tertiary}`}>
                      <Receipt className={`mx-auto mb-4 ${DESIGN_TOKENS?.colors?.text.muted}`} size={48} />
                      <p className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.secondary}`}>Teklif bulunamadı</p>
                      <p className={`${DESIGN_TOKENS?.typography?.body.md} mt-2`}>Yeni teklif oluşturarak başlayın</p>
                    </div>
                  ) : (
                    <>
                      {/* Bulk Actions Bar */}
                      {selectedOffers.length > 0 && (
                        <div className={`${DESIGN_TOKENS?.colors?.interactive.default} text-white px-6 py-3 flex items-center justify-between rounded-t-${DESIGN_TOKENS.radius.lg}`}>
                          <div className="flex items-center gap-4">
                            <span className={DESIGN_TOKENS.typography.label.lg}>{selectedOffers.length} teklif seçildi</span>
                            <button
                              onClick={() => setSelectedOffers([])}
                              className={`${DESIGN_TOKENS?.typography?.label.md} text-neutral-300 hover:text-white`}
                            >
                              Seçimi Temizle
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleBulkDeleteOffers}
                              className={button('md', 'danger', 'md')}
                            >
                              Toplu Sil
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className={`${DESIGN_TOKENS?.colors?.bg.subtle} ${DESIGN_TOKENS?.colors?.border.light} border-b`}>
                            <tr>
                              <th className="w-12 px-2 py-2 text-left">
                                <input
                                  type="checkbox"
                                  checked={selectedOffers.length === offers.length && offers.length > 0}
                                  onChange={handleSelectAllOffers}
                                  className={`${DESIGN_TOKENS.radius.sm} rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900`}
                                />
                              </th>
                              <th className={`w-32 px-3 py-2 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Teklif No
                              </th>
                              <th className={`min-w-[200px] px-3 py-2 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Müşteri
                              </th>
                              <th className={`hidden xl:table-cell w-28 px-3 py-2 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Tarih
                              </th>
                              <th className={`hidden lg:table-cell w-28 px-3 py-2 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Geçerlilik
                              </th>
                              <th className={`w-28 px-3 py-2 text-right ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Tutar
                              </th>
                              <th className={`w-28 px-3 py-2 text-center ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                Durum
                              </th>
                              <th className={`w-40 px-3 py-2 text-center ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} uppercase tracking-wider`}>
                                İşlemler
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {offers.map((offer) => (
                              <tr key={offer.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-2 py-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedOffers.includes(offer.id)}
                                    onChange={() => handleSelectOffer(offer.id)}
                                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                  />
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {offer.offerNumber}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {offer.items?.length || 0} kalem
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {offer.customer.name}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {offer.customer.email}
                                  </div>
                                </td>
                                <td className="hidden xl:table-cell px-3 py-3 whitespace-nowrap">
                                  <div className="text-sm text-neutral-900">
                                    {formatDate(offer.offerDate)}
                                  </div>
                                </td>
                                <td className="hidden lg:table-cell px-3 py-3 whitespace-nowrap">
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
                                <td className="px-3 py-3 whitespace-nowrap text-right">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {formatCurrency(offer.grandTotal)}
                                  </div>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                  {getOfferStatusBadge(offer.status)}
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
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
                                    {(offer.status === 'accepted' || offer.status === 'sent') && (
                                      <button
                                        onClick={() => handleConvertToInvoice(offer.id)}
                                        className="text-neutral-900 hover:text-neutral-700 font-medium text-sm hover:underline transition-all"
                                        title="Faturaya Dönüştür"
                                      >
                                        Faturala
                                      </button>
                                    )}
                                    <div className="relative">
                                      <button
                                        onClick={() => setOpenOfferDropdown(openOfferDropdown === offer.id ? null : offer.id)}
                                        className={`p-1 hover:${DESIGN_TOKENS?.colors?.bg.subtle} ${DESIGN_TOKENS.radius.md} rounded transition-colors`}
                                      >
                                        <MoreVertical size={18} className={DESIGN_TOKENS.colors.text.tertiary} />
                                      </button>
                                      {openOfferDropdown === offer.id && (
                                        <>
                                          <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setOpenOfferDropdown(null)}
                                          />
                                          <div className={`absolute right-0 mt-2 w-48 bg-white ${DESIGN_TOKENS.radius.md} rounded ${DESIGN_TOKENS.shadow.lg} ${DESIGN_TOKENS?.colors?.border.light} border py-1 z-20`}>
                                            <button
                                              onClick={() => navigate(`/accounting/quote/${offer.id}`)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <FileText size={16} />
                                              Detay Görüntüle
                                            </button>
                                            <button
                                              onClick={() => handleDownloadOfferPDF(offer)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <Download size={16} />
                                              PDF İndir
                                            </button>
                                            <button
                                              onClick={() => handleSendOfferEmail(offer)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <Mail size={16} />
                                              Email Gönder
                                            </button>
                                            <button
                                              onClick={() => handleSendOfferWhatsApp(offer)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <MessageCircle size={16} />
                                              WhatsApp Gönder
                                            </button>
                                            <button
                                              onClick={() => handlePrintOffer(offer)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <Printer size={16} />
                                              Yazdır
                                            </button>
                                            <button
                                              onClick={() => handleCopyOffer(offer)}
                                              className={`w-full px-4 py-2 text-left ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.secondary} hover:${DESIGN_TOKENS?.colors?.bg.subtle} flex items-center gap-2`}
                                            >
                                              <Copy size={16} />
                                              Kopyala
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className={`${DESIGN_TOKENS?.colors?.bg.subtle} px-6 py-4 flex items-center justify-between ${DESIGN_TOKENS?.colors?.border.light} border-t`}>
                        <div className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>
                          Sayfa {offerCurrentPage} / {offerTotalPages}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOfferCurrentPage(p => Math.max(1, p - 1))}
                            disabled={offerCurrentPage === 1}
                            className={cx(button('md', 'outline', 'md'), 'disabled:opacity-50 disabled:cursor-not-allowed')}
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={() => setOfferCurrentPage(p => Math.min(offerTotalPages, p + 1))}
                            disabled={offerCurrentPage === offerTotalPages}
                            className={cx(button('md', 'outline', 'md'), 'disabled:opacity-50 disabled:cursor-not-allowed')}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                </div>
              </ErrorBoundary>
            )}

            {/* e-Belge Tab */}
            {activeTab === 'ebelge' && (
              <div className="space-y-4">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Globe className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium">E-Belge ve GIB Entegrasyonu</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Buradan e-fatura ve e-arşiv fatura oluşturabilir, GIB'e gönderebilir ve resmileştirebilirsiniz.
                      <button 
                        onClick={() => setActiveTab('invoice')}
                        className="ml-2 text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Normal faturalara dön →
                      </button>
                    </p>
                  </div>
                </div>
                <EInvoiceList />
              </div>
            )}

            {/* Delivery Note Tab */}
            {activeTab === 'delivery' && <DeliveryNoteList />}

            {/* Bank Reconciliation Tab */}
            {activeTab === 'reconciliation' && <BankReconciliation />}

            {/* Cost Accounting Tab */}
            {activeTab === 'cost-accounting' && <CostAccounting />}

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
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">İşletme Kolaylıkları</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Hatırlatmalar */}
                  <button
                    onClick={() => setActiveTab('reminders')}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-neutral-900 rounded-xl flex items-center justify-center transition-colors">
                        <Clock className="text-neutral-700 group-hover:text-white transition-colors" size={24} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Hatırlatmalar</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Ödeme bildirimleri ve vade uyarıları</p>
                  </button>

                  {/* Ekstre Paylaşımı */}
                  <button
                    onClick={() => setActiveTab('statements')}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-neutral-900 rounded-xl flex items-center justify-center transition-colors">
                        <FileText className="text-neutral-700 group-hover:text-white transition-colors" size={24} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Ekstre Paylaşımı</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Müşterilere hesap ekstresi gönderin</p>
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
                    <p className="text-sm text-neutral-600">Hızlı fatura ve stok girişi</p>
                  </button>

                  {/* Toplu Email */}
                  <button
                    onClick={() => toast('Toplu email özelliği hazırlanıyor!', { icon: '📧', duration: 3000 })}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-neutral-900 rounded-xl flex items-center justify-center transition-colors">
                        <Mail className="text-neutral-700 group-hover:text-white transition-colors" size={24} />
                      </div>
                      <h3 className="font-semibold text-neutral-900">Toplu Email</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Fatura ve teklifleri toplu gönderin</p>
                    <div className="mt-3 text-xs text-orange-600 font-medium">Yakında</div>
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
                      <h3 className="font-semibold text-neutral-900">Gelişmiş Raporlar</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Detaylı analiz ve özel raporlar</p>
                  </button>
                </div>

                {/* Quick Stats for Tools */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-900">Aktif Etiketler</h4>
                      <Tag className="text-blue-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-blue-900">12</p>
                    <p className="text-xs text-blue-600 mt-1">Son 30 gün</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-green-900">Hatırlatmalar</h4>
                      <Clock className="text-green-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-green-900">5</p>
                    <p className="text-xs text-green-600 mt-1">Bu hafta</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-purple-900">Gönderilen Ekstre</h4>
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Mali Müşavir Paneli</h2>
                  <p className="text-sm text-neutral-600 mt-1">Mükellef yönetimi ve toplu işlemler</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-900">Toplam Mükellef</h4>
                      <Users className="text-blue-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-blue-900">42</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-green-900">Aktif Dönem</h4>
                      <Calendar className="text-green-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-green-900">2025/10</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-orange-900">Bu Ay İşlem</h4>
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
                  <button onClick={() => toast('XML dışa aktarma hazırlanıyor...', { icon: '📄' })} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors">
                        <Download className="text-blue-600 group-hover:text-white" size={24} />
                      </div>
                      <h3 className="font-semibold">XML Dışa Aktar</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Toplu veri aktarımı</p>
                  </button>

                  <button onClick={() => toast('Excel raporu oluşturuluyor...', { icon: '📊' })} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-100 group-hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors">
                        <BarChart3 className="text-green-600 group-hover:text-white" size={24} />
                      </div>
                      <h3 className="font-semibold">Excel Rapor</h3>
                    </div>
                    <p className="text-sm text-neutral-600">Dönem sonu raporları</p>
                  </button>

                  <button onClick={() => toast('E-Belge gönderimi başlatılıyor...', { icon: '📧' })} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all text-left group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-600 rounded-xl flex items-center justify-center transition-colors">
                        <Mail className="text-purple-600 group-hover:text-white" size={24} />
                      </div>
                      <h3 className="font-semibold">Toplu E-Belge</h3>
                    </div>
                    <p className="text-sm text-neutral-600">GİB'e toplu gönderim</p>
                  </button>
                </div>

                {/* Client List */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-4">Mükellef Listesi</h3>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-bold">
                            {String.fromCharCode(64 + i)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">Mükellef {i}</p>
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

            {/* Integrations Tab - Combined Bank, E-Commerce and GIB */}
            {activeTab === 'integrations' && (
              <ErrorBoundary>
                <IntegrationsTab />
              </ErrorBoundary>
            )}

            {/* Support Tab OLD - BACKUP */}
            {false && activeTab === 'support' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Destek Sistemi</h2>
                  <p className="text-sm text-neutral-600 mt-1">Yardım, dokümantasyon ve canlı destek</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={() => toast('Canlı destek başlatılıyor...', { icon: '💬' })} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all text-left group">
                    <MessageCircle className="text-blue-600 mb-3" size={32} />
                    <h3 className="font-semibold text-blue-900 mb-2">Canlı Destek</h3>
                    <p className="text-sm text-blue-700">7/24 online destek ekibi</p>
                  </button>

                  <button onClick={() => toast('Dokümantasyon açılıyor...', { icon: '📚' })} className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all text-left group">
                    <FileText className="text-green-600 mb-3" size={32} />
                    <h3 className="font-semibold text-green-900 mb-2">Dokümantasyon</h3>
                    <p className="text-sm text-green-700">Kapsamlı kullanım kılavuzu</p>
                  </button>

                  <button onClick={() => toast('Video eğitimleri hazırlanıyor...', { icon: '🎥' })} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all text-left group">
                    <Globe className="text-purple-600 mb-3" size={32} />
                    <h3 className="font-semibold text-purple-900 mb-2">Video Eğitimler</h3>
                    <p className="text-sm text-purple-700">Adım adım videolar</p>
                  </button>
                </div>

                {/* Support Tickets */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-900">Destek Talepleri</h3>
                    <button onClick={() => toast('Yeni destek talebi oluşturuluyor...', { icon: '🎫' })} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors">
                      <Plus size={16} />
                      Yeni Talep
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { id: 1, subject: 'E-Fatura Entegrasyonu', status: 'open', priority: 'high' },
                      { id: 2, subject: 'Ekstre Gönderimi Sorunu', status: 'in-progress', priority: 'medium' },
                      { id: 3, subject: 'Barkod Okuma Desteği', status: 'resolved', priority: 'low' },
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
                              {ticket.status === 'open' ? 'Açık' : ticket.status === 'in-progress' ? 'İşlemde' : 'Çözüldü'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                              ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {ticket.priority === 'high' ? 'Yüksek' : ticket.priority === 'medium' ? 'Orta' : 'Düşük'}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600">2 saat önce güncellendi</p>
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
                  <h3 className="font-semibold text-neutral-900 mb-4">Sık Sorulan Sorular</h3>
                  <div className="space-y-3">
                    {[
                      'E-Fatura nasıl oluşturulur?',
                      'Barkod okuyucu nasıl kullanılır?',
                      'Ekstre paylaşımı nasıl yapılır?',
                      'Hatırlatmalar nasıl ayarlanır?',
                      'Mali müşavir paneli özellikleri nelerdir?',
                    ].map((q, i) => (
                      <button key={i} onClick={() => toast('Cevap açılıyor...', { icon: '❓' })} className="w-full text-left p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Bildirim Merkezi</h2>
                    <p className="text-sm text-neutral-600 mt-1">Tüm sistem bildirimleri ve uyarılar</p>
                  </div>
                  <button onClick={() => toast('Tüm bildirimler okundu olarak işaretlendi', { icon: '✅' })} className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors">
                    Tümünü Okundu İşaretle
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-900">Toplam</h4>
                      <Bell className="text-blue-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-blue-900">127</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-orange-900">Okunmamış</h4>
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
                    {['Tümü', 'Okunmamış', 'Ödemeler', 'Faturalar', 'Hatırlatmalar', 'Sistem'].map(filter => (
                      <button key={filter} className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-900 hover:text-white transition-colors">
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                  {[
                    { id: 1, type: 'payment', title: 'Ödeme Hatırlatması', message: 'ABC Ltd.Şti. için 15,000 ₺ ödeme vadesi yarın dolacak', time: '5 dk önce', unread: true, urgent: true },
                    { id: 2, type: 'invoice', title: 'Yeni Fatura', message: 'XYZ A.Ş. için #INV-2025-042 numaralı fatura oluşturuldu', time: '1 saat önce', unread: true, urgent: false },
                    { id: 3, type: 'reminder', title: 'Vade Tarihi Yaklaşıyor', message: '3 fatura için vade tarihi bu hafta içinde', time: '2 saat önce', unread: true, urgent: false },
                    { id: 4, type: 'system', title: 'Sistem Güncellemesi', message: 'Yeni özellikler eklendi: Barkod okuyucu aktif', time: '3 saat önce', unread: false, urgent: false },
                    { id: 5, type: 'statement', title: 'Ekstre Gönderildi', message: 'DEF Ticaret için hesap ekstresi email ile gönderildi', time: '5 saat önce', unread: false, urgent: false },
                    { id: 6, type: 'payment', title: 'Ödeme Alındı', message: 'GHI Ltd. 8,500 ₺ ödeme gerçekleştirdi', time: '1 gün önce', unread: false, urgent: false },
                  ].map(notif => (
                    <div key={notif.id} className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${
                      notif.unread ? 'border-blue-200 bg-blue-50' : 'border-neutral-200'
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
                                ACİL
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 mb-2">{notif.message}</p>
                          <p className="text-xs text-neutral-500">{notif.time}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {notif.unread && (
                            <button onClick={() => toast('Bildirim okundu olarak işaretlendi', { icon: '✓' })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Okundu işaretle">
                              <CheckCircle size={20} />
                            </button>
                          )}
                          <button onClick={() => toast('Bildirim silindi', { icon: '🗑️' })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
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
                      { label: 'Ödeme Hatırlatmaları', checked: true },
                      { label: 'Fatura Bildirimleri', checked: true },
                      { label: 'Sistem Güncellemeleri', checked: false },
                    ].map((pref, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer">
                        <input type="checkbox" defaultChecked={pref.checked} className="w-5 h-5 text-neutral-900 rounded" />
                        <span className="text-sm text-neutral-700">{pref.label}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={() => toast('Tercihler kaydedildi', { icon: '💾' })} className="w-full mt-4 bg-neutral-900 text-white py-3 rounded-xl hover:bg-neutral-800 transition-colors">
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
