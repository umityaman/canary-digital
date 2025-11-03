import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Calculator, DollarSign, TrendingUp, TrendingDown, FileText, Users,
  CreditCard, Banknote, Building2, Receipt, Package, BarChart3,
  PieChart, Settings, Download, Upload, RefreshCw, Clock, Globe,
  Search, Filter, ChevronLeft, ChevronRight, Check, X, Tag, Edit2, Trash2,
  MoreVertical, Mail, MessageCircle, Printer, Copy
} from 'lucide-react'
import { accountingAPI, invoiceAPI, offerAPI, checksAPI, promissoryAPI, agingAPI } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'
import CheckFormModal from '../components/accounting/CheckFormModal'
import PromissoryNoteFormModal from '../components/accounting/PromissoryNoteFormModal'
import AgingReportTable from '../components/accounting/AgingReportTable'
import IncomeTab from '../components/accounting/IncomeTab'
import ExpenseTab from '../components/accounting/ExpenseTab'
import AccountingDashboard from '../components/accounting/AccountingDashboard'
import AccountCardList from '../components/accounting/AccountCardList'
import EInvoiceList from '../components/accounting/EInvoiceList'
import BankReconciliation from '../components/accounting/BankReconciliation'
import DeliveryNoteList from '../components/delivery-notes/DeliveryNoteList'
import CurrentAccountList from '../components/current-accounts/CurrentAccountList'
import InventoryAccounting from '../components/accounting/InventoryAccounting'
import AdvancedReporting from '../components/accounting/AdvancedReporting'
import GIBIntegration from '../components/accounting/GIBIntegration'
import CostAccountingTab from '../components/accounting/CostAccountingTab'
import CategoryTagManagement from '../components/accounting/CategoryTagManagement'
import CompanyInfo from '../components/accounting/CompanyInfo'
import CashBankManagement from '../components/accounting/CashBankManagement'
import CardSkeleton from '../components/ui/CardSkeleton'
import TableSkeleton from '../components/ui/TableSkeleton'
import { toast } from 'react-hot-toast'
import axios from 'axios'

type Tab = 'dashboard' | 'income' | 'expense' | 'reports' | 'invoice' | 'offer' | 'ebelge' | 'tools' | 'advisor' | 'support' | 'receivables' | 'cari' | 'delivery' | 'reconciliation' | 'inventory' | 'gib' | 'cost-accounting' | 'categories' | 'company' | 'cash-bank' | 'integration'

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
    { id: 'cost-accounting' as const, label: 'Maliyet Muhasebesi', icon: <DollarSign size={18} /> },
    { id: 'inventory' as const, label: 'Stok Muhasebesi', icon: <Package size={18} /> },
    { id: 'categories' as const, label: 'Kategoriler & Etiketler', icon: <Tag size={18} /> },
    { id: 'company' as const, label: 'Şirket Bilgileri', icon: <Building2 size={18} /> },
    { id: 'cash-bank' as const, label: 'Kasa & Banka', icon: <Banknote size={18} /> },
    { id: 'reports' as const, label: 'Raporlar', icon: <PieChart size={18} /> },
    { id: 'invoice' as const, label: 'Fatura Takibi', icon: <FileText size={18} /> },
    { id: 'offer' as const, label: 'Teklif Yönetimi', icon: <Receipt size={18} /> },
    { id: 'ebelge' as const, label: 'e-Belge', icon: <CreditCard size={18} /> },
    { id: 'delivery' as const, label: 'İrsaliye', icon: <Package size={18} /> },
    { id: 'reconciliation' as const, label: 'Banka Mutabakat', icon: <Building2 size={18} /> },
    { id: 'gib' as const, label: 'GİB Entegrasyonu', icon: <Globe size={18} /> },
    { id: 'tools' as const, label: 'İşletme Kolaylıkları', icon: <Settings size={18} /> },
    { id: 'advisor' as const, label: 'Mali Müşavir', icon: <Users size={18} /> },
    { id: 'support' as const, label: 'Yardım & Araçlar', icon: <Globe size={18} /> },
    { id: 'cari' as const, label: 'Cari Hesaplar', icon: <Users size={18} /> },
    { id: 'receivables' as const, label: 'Alacak Yönetimi', icon: <DollarSign size={18} /> },
  ]

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-10">
      {/* Quick Stats */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Bu Ay Gelir */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-neutral-700" size={24} />
              </div>
              {stats && stats.invoiceCount > 0 && (
                <span className="text-xs text-neutral-700 font-medium">
                  {stats.invoiceCount} fatura
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-1">
              {stats ? formatCurrency(stats.totalRevenue) : '₺0'}
            </h3>
            <p className="text-sm text-neutral-600">Bu Ay Gelir</p>
          </div>

          {/* Bu Ay Gider */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="text-neutral-700" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-1">
              {stats ? formatCurrency(stats.totalExpenses) : '₺0'}
            </h3>
            <p className="text-sm text-neutral-600">Bu Ay Gider</p>
          </div>

          {/* Net Kâr */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-neutral-700" size={24} />
              </div>
              <span className="text-xs text-neutral-700 font-medium">Net</span>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${
              stats && stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats ? formatCurrency(stats.netProfit) : '₺0'}
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
              {stats ? formatCurrency(stats.totalOverdue) : '₺0'}
            </h3>
            <p className="text-sm text-neutral-600">Vade Geçmiş</p>
            {stats && stats.totalCollections > 0 && (
              <p className="text-xs text-green-600 mt-2">
                Bu ay: {formatCurrency(stats.totalCollections)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs - Vertical Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Tabs */}
          <nav className="flex flex-row gap-2 overflow-x-auto border-b border-neutral-200 lg:border-b-0 lg:border-r lg:w-56 lg:flex-col lg:gap-0 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-[9rem] items-center space-x-2 px-3 py-2.5 text-sm font-medium transition-colors lg:min-w-0 lg:w-full ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {tab.icon}
                <span className="text-xs lg:text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-6 lg:p-8">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && <AccountingDashboard />}

            {/* Income Tab */}
            {activeTab === 'income' && <IncomeTab />}

            {/* Expense Tab */}
            {activeTab === 'expense' && <ExpenseTab />}

            {/* Cari (Account Cards) Tab */}
            {activeTab === 'cari' && <CurrentAccountList />}

            {/* Reports Tab - Advanced Reporting */}
            {activeTab === 'reports' && <AdvancedReporting />}

            {/* Receivables Management Tab - Çekler, Senetler, Yaşlandırma */}
            {activeTab === 'receivables' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Alacak Yönetimi</h2>
                
                {/* Sub-tabs for Checks, Promissory, Aging */}
                <div className="flex gap-2 border-b border-neutral-200 mb-6">
                  <button
                    onClick={() => setReceivablesSubTab('checks')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      receivablesSubTab === 'checks'
                        ? 'border-b-2 border-neutral-900 text-neutral-900'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Çekler
                  </button>
                  <button
                    onClick={() => setReceivablesSubTab('promissory')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      receivablesSubTab === 'promissory'
                        ? 'border-b-2 border-neutral-900 text-neutral-900'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Senetler
                  </button>
                  <button
                    onClick={() => setReceivablesSubTab('aging')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      receivablesSubTab === 'aging'
                        ? 'border-b-2 border-neutral-900 text-neutral-900'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Yaşlandırma Raporu
                  </button>
                </div>

                {/* Checks Sub-tab */}
                {receivablesSubTab === 'checks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-neutral-900">Çekler</h3>
                      <button
                        onClick={() => { setEditingCheck(null); setCheckModalOpen(true) }}
                        className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
                      >
                        <FileText size={18} />
                        Yeni Çek
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                      {checksLoading ? (
                        <div className="p-12 text-center text-neutral-600">Çekler yükleniyor...</div>
                      ) : checks.length === 0 ? (
                        <div className="p-12 text-center text-neutral-600">Çek bulunamadı</div>
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
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-900">Fatura Listesi</h2>
                  <button 
                    onClick={() => navigate('/accounting/invoice/new')}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <FileText size={18} />
                    Yeni Fatura
                  </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 border border-neutral-200 space-y-4">
                  {/* Basic Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                    {/* Advanced Filters Toggle */}
                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-2 justify-center"
                    >
                      <Filter size={18} />
                      {showAdvancedFilters ? 'Filtreleri Gizle' : 'Gelişmiş Filtre'}
                    </button>

                    {/* Search Button */}
                    <button
                      onClick={handleSearchInvoices}
                      className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      Ara
                    </button>
                  </div>

                  {/* Advanced Filters */}
                  {showAdvancedFilters && (
                    <div className="pt-4 border-t border-neutral-200 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date Range Preset */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Tarih Aralığı
                          </label>
                          <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as any)}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          >
                            <option value="all">Tüm Zamanlar</option>
                            <option value="7days">Son 7 Gün</option>
                            <option value="30days">Son 30 Gün</option>
                            <option value="custom">Özel Tarih</option>
                          </select>
                        </div>

                        {/* Min Amount */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Min. Tutar (₺)
                          </label>
                          <input
                            type="number"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>

                        {/* Max Amount */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Max. Tutar (₺)
                          </label>
                          <input
                            type="number"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            placeholder="999999"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>
                      </div>

                      {/* Custom Date Range */}
                      {dateRange === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Başlangıç Tarihi
                            </label>
                            <input
                              type="date"
                              value={customDateFrom}
                              onChange={(e) => setCustomDateFrom(e.target.value)}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Bitiş Tarihi
                            </label>
                            <input
                              type="date"
                              value={customDateTo}
                              onChange={(e) => setCustomDateTo(e.target.value)}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* Reset Filters Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <X size={18} />
                          Filtreleri Temizle
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Table */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                  {invoicesLoading ? (
                    <TableSkeleton rows={10} columns={8} showHeader={true} />
                  ) : invoices.length === 0 ? (
                    <div className="p-12 text-center text-neutral-600">
                      <FileText className="mx-auto mb-4 text-neutral-400" size={48} />
                      <p className="text-lg font-medium">Fatura bulunamadı</p>
                      <p className="text-sm mt-2">Yeni fatura oluşturarak başlayın</p>
                    </div>
                  ) : (
                    <>
                      {/* Bulk Actions Bar */}
                      {selectedInvoices.length > 0 && (
                        <div className="bg-neutral-900 text-white px-6 py-3 flex items-center justify-between rounded-t-2xl">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{selectedInvoices.length} fatura seçildi</span>
                            <button
                              onClick={() => setSelectedInvoices([])}
                              className="text-sm text-neutral-300 hover:text-white"
                            >
                              Seçimi Temizle
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleBulkDeleteInvoices}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              Toplu Sil
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                              <th className="px-6 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                                  onChange={handleSelectAllInvoices}
                                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                />
                              </th>
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
                                        className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                                      >
                                        <MoreVertical size={18} className="text-neutral-600" />
                                      </button>
                                      {openInvoiceDropdown === invoice.id && (
                                        <>
                                          <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setOpenInvoiceDropdown(null)}
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20">
                                            <button
                                              onClick={() => handleDownloadPDF(invoice)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                            >
                                              <Download size={16} />
                                              PDF İndir
                                            </button>
                                            <button
                                              onClick={() => handleSendEmail(invoice)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                            >
                                              <Mail size={16} />
                                              Email Gönder
                                            </button>
                                            <button
                                              onClick={() => handleSendWhatsApp(invoice)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                            >
                                              <MessageCircle size={16} />
                                              WhatsApp Gönder
                                            </button>
                                            <button
                                              onClick={() => handlePrint(invoice)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                            >
                                              <Printer size={16} />
                                              Yazdır
                                            </button>
                                            <button
                                              onClick={() => handleCopyInvoice(invoice)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
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
                    onClick={() => navigate('/accounting/quote/new')}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <Receipt size={18} />
                    Yeni Teklif
                  </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 border border-neutral-200 space-y-4">
                  {/* Basic Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                    {/* Advanced Filters Toggle */}
                    <button
                      onClick={() => setShowOfferAdvancedFilters(!showOfferAdvancedFilters)}
                      className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-2 justify-center"
                    >
                      <Filter size={18} />
                      {showOfferAdvancedFilters ? 'Filtreleri Gizle' : 'Gelişmiş Filtre'}
                    </button>

                    {/* Search Button */}
                    <button
                      onClick={handleSearchOffers}
                      className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      Ara
                    </button>
                  </div>

                  {/* Advanced Filters */}
                  {showOfferAdvancedFilters && (
                    <div className="pt-4 border-t border-neutral-200 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date Range Preset */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Tarih Aralığı
                          </label>
                          <select
                            value={offerDateRange}
                            onChange={(e) => setOfferDateRange(e.target.value as any)}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          >
                            <option value="all">Tüm Zamanlar</option>
                            <option value="7days">Son 7 Gün</option>
                            <option value="30days">Son 30 Gün</option>
                            <option value="custom">Özel Tarih</option>
                          </select>
                        </div>

                        {/* Min Amount */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Min. Tutar (₺)
                          </label>
                          <input
                            type="number"
                            value={offerMinAmount}
                            onChange={(e) => setOfferMinAmount(e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>

                        {/* Max Amount */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Max. Tutar (₺)
                          </label>
                          <input
                            type="number"
                            value={offerMaxAmount}
                            onChange={(e) => setOfferMaxAmount(e.target.value)}
                            placeholder="999999"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>
                      </div>

                      {/* Custom Date Range */}
                      {offerDateRange === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Başlangıç Tarihi
                            </label>
                            <input
                              type="date"
                              value={offerCustomDateFrom}
                              onChange={(e) => setOfferCustomDateFrom(e.target.value)}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Bitiş Tarihi
                            </label>
                            <input
                              type="date"
                              value={offerCustomDateTo}
                              onChange={(e) => setOfferCustomDateTo(e.target.value)}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* Reset Filters Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={handleResetOfferFilters}
                          className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <X size={18} />
                          Filtreleri Temizle
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Offer Table */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                  {offersLoading ? (
                    <TableSkeleton rows={10} columns={7} showHeader={true} />
                  ) : offers.length === 0 ? (
                    <div className="p-12 text-center text-neutral-600">
                      <Receipt className="mx-auto mb-4 text-neutral-400" size={48} />
                      <p className="text-lg font-medium">Teklif bulunamadı</p>
                      <p className="text-sm mt-2">Yeni teklif oluşturarak başlayın</p>
                    </div>
                  ) : (
                    <>
                      {/* Bulk Actions Bar */}
                      {selectedOffers.length > 0 && (
                        <div className="bg-neutral-900 text-white px-6 py-3 flex items-center justify-between rounded-t-2xl">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{selectedOffers.length} teklif seçildi</span>
                            <button
                              onClick={() => setSelectedOffers([])}
                              className="text-sm text-neutral-300 hover:text-white"
                            >
                              Seçimi Temizle
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleBulkDeleteOffers}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              Toplu Sil
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                          <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                              <th className="px-6 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={selectedOffers.length === offers.length && offers.length > 0}
                                  onChange={handleSelectAllOffers}
                                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                />
                              </th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Teklif No
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Müşteri
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Tarih
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Geçerlilik
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                                Tutar
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
                            {offers.map((offer) => (
                              <tr key={offer.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedOffers.includes(offer.id)}
                                    onChange={() => handleSelectOffer(offer.id)}
                                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {offer.offerNumber}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {offer.items?.length || 0} kalem
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {offer.customer.name}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {offer.customer.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-neutral-900">
                                    {formatDate(offer.offerDate)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {formatCurrency(offer.grandTotal)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getOfferStatusBadge(offer.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
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
                                        className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                                      >
                                        <MoreVertical size={18} className="text-neutral-600" />
                                      </button>
                                      {openOfferDropdown === offer.id && (
                                        <>
                                          <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setOpenOfferDropdown(null)}
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20">
                                            <button
                                              onClick={() => navigate(`/accounting/quote/${offer.id}`)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                            >
                                              <FileText size={16} />
                                              Detay Görüntüle
                                            </button>
                                            <button
                                              onClick={() => handleDownloadOfferPDF(offer)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                            >
                                              <Download size={16} />
                                              PDF İndir
                                            </button>
                                            <button
                                              onClick={() => handleSendOfferEmail(offer)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                            >
                                              <Mail size={16} />
                                              Email Gönder
                                            </button>
                                            <button
                                              onClick={() => handleSendOfferWhatsApp(offer)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                            >
                                              <MessageCircle size={16} />
                                              WhatsApp Gönder
                                            </button>
                                            <button
                                              onClick={() => handlePrintOffer(offer)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                            >
                                              <Printer size={16} />
                                              Yazdır
                                            </button>
                                            <button
                                              onClick={() => handleCopyOffer(offer)}
                                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
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
            {activeTab === 'ebelge' && <EInvoiceList />}

            {/* Delivery Note Tab */}
            {activeTab === 'delivery' && <DeliveryNoteList />}

            {/* Bank Reconciliation Tab */}
            {activeTab === 'reconciliation' && <BankReconciliation />}

            {/* Cost Accounting Tab */}
            {activeTab === 'cost-accounting' && <CostAccountingTab />}

            {/* Inventory Accounting Tab */}
            {activeTab === 'inventory' && <InventoryAccounting />}

            {/* Category and Tag Management Tab */}
            {activeTab === 'categories' && <CategoryTagManagement />}

            {/* Company Information Tab */}
            {activeTab === 'company' && <CompanyInfo />}

            {/* Cash & Bank Management Tab */}
            {activeTab === 'cash-bank' && <CashBankManagement />}

            {/* GIB Integration Tab */}
            {activeTab === 'gib' && <GIBIntegration />}

            {/* Integration Tab */}
            {activeTab === 'integration' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Entegrasyonlar</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'Banka Entegrasyonu', desc: 'Hesap hareketlerini otomatik aktar', icon: <Building2 size={24} /> },
                    { name: 'Online Tahsilat', desc: 'Müşterilerden online ödeme al', icon: <CreditCard size={24} /> },
                    { name: 'Stok Yönetimi', desc: 'Ürün hareketlerini izle', icon: <Package size={24} /> },
                  ].map((item) => (
                    <div key={item.name} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-all">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <div className="text-neutral-700">{item.icon}</div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-neutral-600">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
