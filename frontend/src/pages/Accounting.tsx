import { useState, useEffect } from 'react'
import {
  Calculator, DollarSign, TrendingUp, TrendingDown, FileText, Users,
  CreditCard, Banknote, Building2, Receipt, Package, BarChart3,
  PieChart, Settings, Download, Upload, RefreshCw, Clock, Globe,
  Search, Filter, ChevronLeft, ChevronRight, Check, X
} from 'lucide-react'
import { accountingAPI, invoiceAPI, offerAPI, checksAPI, promissoryAPI, agingAPI } from '../services/api'
// import CheckFormModal from '../components/accounting/CheckFormModal' // TODO: Add this component later
import IncomeTab from '../components/accounting/IncomeTab'
import ExpenseTab from '../components/accounting/ExpenseTab'
import AccountingDashboard from '../components/accounting/AccountingDashboard'
import AccountCardList from '../components/accounting/AccountCardList'
import EInvoiceList from '../components/accounting/EInvoiceList'
import DeliveryNoteList from '../components/accounting/DeliveryNoteList'
import { toast } from 'react-hot-toast'

type Tab = 'dashboard' | 'preaccounting' | 'income' | 'expense' | 'reports' | 'invoice' | 'offer' | 'ebelge' | 'integration' | 'tools' | 'advisor' | 'support' | 'checks' | 'promissory' | 'aging' | 'cari' | 'delivery'

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

  // Checks state
  const [checks, setChecks] = useState<any[]>([])
  const [checksLoading, setChecksLoading] = useState(false)

  // Promissory notes state
  const [promissory, setPromissory] = useState<any[]>([])
  const [promissoryLoading, setPromissoryLoading] = useState(false)

  // Aging state
  const [agingData, setAgingData] = useState<any | null>(null)
  const [agingLoading, setAgingLoading] = useState(false)

  // Cari (account cards)
  const [cariSummary, setCariSummary] = useState<any[]>([])
  const [cariLoading, setCariLoading] = useState(false)

  // Checks modal state
  const [checkModalOpen, setCheckModalOpen] = useState(false)
  const [editingCheck, setEditingCheck] = useState<any | null>(null)

  // Load accounting stats on mount
  useEffect(() => {
    loadStats()
  }, [])

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

  // Load checks when checks tab active
  useEffect(() => {
    if (activeTab === 'checks') {
      loadChecks()
    }
  }, [activeTab])

  // Load promissory notes when promissory tab active
  useEffect(() => {
    if (activeTab === 'promissory') {
      loadPromissory()
    }
  }, [activeTab])

  // Load aging when aging tab active
  useEffect(() => {
    if (activeTab === 'aging') {
      loadAging()
    }
  }, [activeTab])

  // Load cari summary when cari tab active
  useEffect(() => {
    if (activeTab === 'cari') {
      loadCari()
    }
  }, [activeTab])

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

  const loadCari = async () => {
    try {
      setCariLoading(true)
      const res = await accountingAPI.getCariSummary()
      setCariSummary(res.data.data || res.data)
    } catch (error: any) {
      console.error('Failed to load cari summary:', error)
      toast.error('Cari özet yüklenemedi: ' + (error.response?.data?.message || error.message))
    } finally {
      setCariLoading(false)
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
    { id: 'preaccounting' as const, label: 'Ön Muhasebe', icon: <Calculator size={18} /> },
    { id: 'reports' as const, label: 'Raporlar', icon: <PieChart size={18} /> },
    { id: 'invoice' as const, label: 'Fatura Takibi', icon: <FileText size={18} /> },
    { id: 'offer' as const, label: 'Teklif Yönetimi', icon: <Receipt size={18} /> },
    { id: 'ebelge' as const, label: 'e-Belge', icon: <CreditCard size={18} /> },
    { id: 'delivery' as const, label: 'İrsaliye', icon: <Package size={18} /> },
    { id: 'integration' as const, label: 'Entegrasyonlar', icon: <RefreshCw size={18} /> },
    { id: 'tools' as const, label: 'İşletme Kolaylıkları', icon: <Settings size={18} /> },
    { id: 'advisor' as const, label: 'Mali Müşavir', icon: <Users size={18} /> },
    { id: 'support' as const, label: 'Yardım & Araçlar', icon: <Globe size={18} /> },
    { id: 'cari' as const, label: 'Cari Hesaplar', icon: <Users size={18} /> },
    { id: 'checks' as const, label: 'Çekler', icon: <Check size={18} /> },
    { id: 'promissory' as const, label: 'Senetler', icon: <FileText size={18} /> },
    { id: 'aging' as const, label: 'Yaşlandırma', icon: <Clock size={18} /> },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            {loading ? '...' : stats ? formatCurrency(stats.totalRevenue) : '₺0'}
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
            {loading ? '...' : stats ? formatCurrency(stats.totalExpenses) : '₺0'}
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
        <div className="flex">
          {/* Sidebar Tabs */}
          <nav className="w-64 border-r border-neutral-200 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && <AccountingDashboard />}

            {/* Income Tab */}
            {activeTab === 'income' && <IncomeTab />}

            {/* Expense Tab */}
            {activeTab === 'expense' && <ExpenseTab />}

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

            {/* Cari (Account Cards) Tab */}
            {activeTab === 'cari' && <AccountCardList />}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Muhasebe Raporları</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Tahsilat Raporları', icon: <Download size={20} />, color: 'blue' },
                    { name: 'Nakit Akışı', icon: <TrendingUp size={20} />, color: 'green' },
                    { name: 'Gelir-Gider', icon: <BarChart3 size={20} />, color: 'purple' },
                    { name: 'Kasa Banka', icon: <Building2 size={20} />, color: 'indigo' },
                    { name: 'Satışlar', icon: <Package size={20} />, color: 'pink' },
                    { name: 'KDV Raporu', icon: <FileText size={20} />, color: 'orange' },
                    { name: 'Giderler', icon: <TrendingDown size={20} />, color: 'red' },
                    { name: 'Ödemeler', icon: <CreditCard size={20} />, color: 'cyan' },
                  ].map((report) => (
                    <button key={report.name} className="bg-white rounded-2xl p-4 border border-neutral-200 hover:shadow-md transition-all text-left">
                      <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mb-3">
                        <div className="text-neutral-700">{report.icon}</div>
                      </div>
                      <h3 className="font-medium text-neutral-900 text-sm">{report.name}</h3>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Checks Tab */}
            {activeTab === 'checks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-900">Çekler</h2>
                  <div>
                    <button
                      onClick={() => { setEditingCheck(null); setCheckModalOpen(true) }}
                      className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
                    >
                      <FileText size={18} />
                      Yeni Çek
                    </button>
                  </div>
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Promissory Notes Tab */}
            {activeTab === 'promissory' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-900">Senetler</h2>
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Aging Tab */}
            {activeTab === 'aging' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-900">Yaşlandırma Raporu</h2>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                  {agingLoading ? (
                    <div className="p-12 text-center text-neutral-600">Yükleniyor...</div>
                  ) : !agingData ? (
                    <div className="p-12 text-center text-neutral-600">Yaşlandırma verisi yok</div>
                  ) : (
                    <pre className="text-xs text-neutral-700 overflow-auto">{JSON.stringify(agingData, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}

            {/* Invoice Tab */}
            {activeTab === 'invoice' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-900">Fatura Listesi</h2>
                  <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2">
                    <FileText size={18} />
                    Yeni Fatura
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
                      className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      Ara
                    </button>
                  </div>
                </div>

                {/* Invoice Table */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
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
                        <table className="w-full">
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
                                  <button className="text-neutral-900 hover:text-neutral-700 font-medium">
                                    Detay
                                  </button>
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
                  <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2">
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
                        <table className="w-full">
                          <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
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
                                  <div className="flex items-center gap-2">
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
                                        className="text-neutral-900 hover:text-neutral-700 font-medium text-sm"
                                        title="Faturaya Dönüştür"
                                      >
                                        Faturala
                                      </button>
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
            {activeTab === 'ebelge' && <EInvoiceList />}

            {/* Delivery Note Tab */}
            {activeTab === 'delivery' && <DeliveryNoteList />}

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
      {/* Check Modal - TODO: Add CheckFormModal component later */}
      {/* {checkModalOpen && (
        <CheckFormModal
          open={checkModalOpen}
          onClose={() => setCheckModalOpen(false)}
          onSaved={() => loadChecks()}
          initial={editingCheck || undefined}
        />
      )} */}
    </div>
  )
}
