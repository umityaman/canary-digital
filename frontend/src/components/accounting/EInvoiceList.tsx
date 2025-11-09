import { useState, useEffect } from 'react'
import {
  Search, Download, FileText, Send, X, CheckCircle,
  Clock, AlertCircle, Eye, Plus, RefreshCw, ExternalLink, File,
  Calendar, User, DollarSign, Hash, Archive, Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import EInvoiceForm from './EInvoiceForm'
import EInvoiceDetail from './EInvoiceDetail'
import { card, button, input, badge, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

interface EInvoiceMeta {
  uuid: string
  gibStatus: string
  ettn?: string | null
  sentDate?: string | null
  responseDate?: string | null
  xmlHash?: string | null
}

interface EInvoice {
  id: number
  invoiceNumber: string
  invoiceType: 'e-fatura' | 'e-arsiv'
  issueDate: string
  dueDate: string
  customerId: number
  customerName: string
  customerTaxNumber: string | null
  grandTotal: number
  paidAmount: number
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'cancelled' | 'paid'
  description: string | null
  parasutId: string | null
  parasutInvoiceNo: string | null
  eDocumentStatus: 'pending' | 'sent' | 'delivered' | 'failed' | 'draft' | null
  eInvoiceMeta?: EInvoiceMeta | null
}

export default function EInvoiceList() {
  const [invoices, setInvoices] = useState<EInvoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<EInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'e-fatura' | 'e-arsiv'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'approved' | 'cancelled'>('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<EInvoice | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [actionInvoiceId, setActionInvoiceId] = useState<number | null>(null)

  const buildHeaders = (withJson = false) => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Oturum bilgisi bulunamadı')
      return null
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    }

    if (withJson) {
      headers['Content-Type'] = 'application/json'
    }

    return headers
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, filterType, filterStatus])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/invoices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Failed to load invoices')

      const data = await response.json()
      const invoicesList = data.data || data

      const mappedInvoices = invoicesList.map((inv: any) => {
        const invoiceType = inv.customer?.taxNumber ? 'e-fatura' : 'e-arsiv'
        const eInvoiceMeta = inv.eInvoice
          ? {
              uuid: inv.eInvoice.uuid,
              gibStatus: inv.eInvoice.gibStatus,
              ettn: inv.eInvoice.ettn,
              sentDate: inv.eInvoice.sentDate,
              responseDate: inv.eInvoice.responseDate,
              xmlHash: inv.eInvoice.xmlHash,
            }
          : null

        const eDocumentStatus = invoiceType === 'e-fatura'
          ? (eInvoiceMeta?.gibStatus || 'draft')
          : inv.parasutId
            ? 'delivered'
            : null

        return {
          ...inv,
          invoiceType,
          customerName: inv.customer?.fullName || inv.customer?.name || 'Bilinmeyen',
          customerTaxNumber: inv.customer?.taxNumber || null,
          eDocumentStatus,
          eInvoiceMeta,
        }
      })

      setInvoices(mappedInvoices)
    } catch (error: any) {
      console.error('Failed to load invoices:', error)
      toast.error('Faturalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = [...invoices]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerTaxNumber?.includes(searchTerm) ||
        inv.parasutInvoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(inv => inv.invoiceType === filterType)
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(inv => inv.status === filterStatus)
    }

    setFilteredInvoices(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleSendEDocument = async (invoice: EInvoice) => {
    if (invoice.invoiceType === 'e-fatura') {
      const headers = buildHeaders()
      if (!headers) return

      try {
        setActionInvoiceId(invoice.id)

        const generateResponse = await fetch(`/api/einvoice/generate/${invoice.id}`, {
          method: 'POST',
          headers,
        })
        const generatePayload = await generateResponse.json().catch(() => ({}))
        if (!generateResponse.ok) {
          throw new Error(generatePayload?.message || 'E-Fatura XML oluşturulamadı')
        }

        const sendResponse = await fetch(`/api/einvoice/send/${invoice.id}`, {
          method: 'POST',
          headers,
        })
        const sendPayload = await sendResponse.json().catch(() => ({}))
        if (!sendResponse.ok) {
          throw new Error(sendPayload?.message || 'E-Fatura gönderilemedi')
        }

        toast.success('E-Fatura GİB\'e gönderildi')
        loadInvoices()
      } catch (error: any) {
        console.error('Failed to send e-invoice:', error)
        toast.error(error.message || 'E-Fatura gönderilemedi')
      } finally {
        setActionInvoiceId(null)
      }

      return
    }

    if (!invoice.parasutId) {
      toast.error('Paraşüt fatura ID bulunamadı')
      return
    }

    const headers = buildHeaders(true)
    if (!headers) return

    try {
      setActionInvoiceId(invoice.id)

      const response = await fetch(`/api/invoices/${invoice.id}/send-edocument`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.message || 'E-Arşiv gönderilemedi')
      }

      toast.success('E-Arşiv başarıyla oluşturuldu')
      loadInvoices()
    } catch (error: any) {
      console.error('Failed to send e-archive:', error)
      toast.error(error.message || 'E-Arşiv gönderilemedi')
    } finally {
      setActionInvoiceId(null)
    }
  }

  const handleCheckEInvoiceStatus = async (invoice: EInvoice) => {
    if (invoice.invoiceType !== 'e-fatura') {
      return
    }

    const headers = buildHeaders()
    if (!headers) return

    try {
      setActionInvoiceId(invoice.id)

      const response = await fetch(`/api/einvoice/status/${invoice.id}`, {
        method: 'GET',
        headers,
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.message || 'Durum sorgulanamadı')
      }

      toast.success(`GİB durumu: ${payload?.data?.status || 'bilinmiyor'}`)
      loadInvoices()
    } catch (error: any) {
      console.error('Failed to check e-invoice status:', error)
      toast.error(error.message || 'Durum sorgulanamadı')
    } finally {
      setActionInvoiceId(null)
    }
  }

  const handleDownloadXML = async (invoice: EInvoice) => {
    if (invoice.invoiceType !== 'e-fatura') {
      return
    }

    const headers = buildHeaders()
    if (!headers) return

    try {
      setActionInvoiceId(invoice.id)

      const response = await fetch(`/api/einvoice/xml/${invoice.id}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.message || 'XML indirilemedi')
      }

      const xml = await response.text()
      const blob = new Blob([xml], { type: 'application/xml' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoice.invoiceNumber || invoice.id}-efatura.xml`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('E-Fatura XML indirildi')
    } catch (error: any) {
      console.error('Failed to download e-invoice XML:', error)
      toast.error(error.message || 'XML indirilemedi')
    } finally {
      setActionInvoiceId(null)
    }
  }

  const handleCancelInvoice = async (invoice: EInvoice) => {
    if (!confirm(`${invoice.invoiceNumber} numaralı faturayı iptal etmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to cancel invoice')

      toast.success('Fatura iptal edildi')
      loadInvoices()
    } catch (error: any) {
      console.error('Failed to cancel invoice:', error)
      toast.error('Fatura iptal edilemedi')
    }
  }

  const handleDownloadPDF = async (invoice: EInvoice) => {
    try {
      toast.info('PDF indirme özelliği yakında eklenecek')
      // TODO: Implement PDF download
    } catch (error: any) {
      console.error('Failed to download PDF:', error)
      toast.error('PDF indirilemedi')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-700', icon: <File size={14} /> },
      sent: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-700', icon: <Send size={14} /> },
      approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> },
      rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-700', icon: <X size={14} /> },
      cancelled: { label: 'İptal', color: 'bg-orange-100 text-orange-700', icon: <AlertCircle size={14} /> },
      paid: { label: 'Ödendi', color: 'bg-purple-100 text-purple-700', icon: <CheckCircle size={14} /> },
    }
    const badge = badges[status as keyof typeof badges] || badges.draft
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    )
  }

  const getEDocumentStatusBadge = (invoice: EInvoice) => {
    if (invoice.invoiceType === 'e-fatura') {
      const status = invoice.eInvoiceMeta?.gibStatus || 'draft'
      const badges = {
        draft: { label: 'XML Taslak', color: 'bg-gray-100 text-gray-700', icon: <File size={12} /> },
        sent: { label: 'GİB Gönderildi', color: 'bg-blue-100 text-blue-700', icon: <Send size={12} /> },
        delivered: { label: 'Yanıt Alındı', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
        failed: { label: 'Hata', color: 'bg-red-100 text-red-700', icon: <AlertCircle size={12} /> },
      }
      const badge = badges[status as keyof typeof badges] || badges.draft

      return (
        <div className="flex flex-col items-center gap-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
            {badge.icon}
            {badge.label}
          </span>
          {invoice.eInvoiceMeta?.uuid && (
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
              <Hash size={11} />
              {invoice.eInvoiceMeta.uuid.slice(0, 8)}...
            </span>
          )}
          {invoice.eInvoiceMeta?.ettn && (
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
              <Hash size={11} />
              {invoice.eInvoiceMeta.ettn}
            </span>
          )}
        </div>
      )
    }

    const status = invoice.eDocumentStatus
    if (!status) return null

    const badges = {
      pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
      sent: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-700', icon: <Send size={12} /> },
      delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
      failed: { label: 'Başarısız', color: 'bg-red-100 text-red-700', icon: <AlertCircle size={12} /> },
    }
    const badge = badges[status as keyof typeof badges] || badges.pending

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    )
  }

  const calculateStats = () => {
    const stats = {
      total: invoices.length,
      eFatura: invoices.filter(inv => inv.invoiceType === 'e-fatura').length,
      eArsiv: invoices.filter(inv => inv.invoiceType === 'e-arsiv').length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
      paidAmount: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
      unpaid: invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').length,
    }
    return stats
  }

  const stats = calculateStats()

  if (showForm) {
    return (
      <EInvoiceForm
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false)
          loadInvoices()
        }}
      />
    )
  }

  if (showDetail && selectedInvoice) {
    return (
      <EInvoiceDetail
        invoice={selectedInvoice}
        onBack={() => {
          setShowDetail(false)
          setSelectedInvoice(null)
        }}
        onUpdate={loadInvoices}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>E-Fatura & E-Arşiv</h2>
          <p className="text-sm text-neutral-600 mt-1">Elektronik belge yönetimi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadInvoices()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Yenile</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Yeni Fatura</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className={cx(card('md', 'sm', 'subtle', 'lg'), 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200')}>
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-blue-600" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.md} text-blue-900`}>{stats.total}</h3>
          <p className="text-xs text-blue-700">Toplam Fatura</p>
        </div>

        <div className={cx(card('md', 'sm', 'subtle', 'lg'), 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200')}>
          <div className="flex items-center justify-between mb-2">
            <Zap className="text-purple-600" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.md} text-purple-900`}>{stats.eFatura}</h3>
          <p className="text-xs text-purple-700">E-Fatura</p>
        </div>

        <div className={cx(card('md', 'sm', 'subtle', 'lg'), 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200')}>
          <div className="flex items-center justify-between mb-2">
            <Archive className="text-indigo-600" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.md} text-indigo-900`}>{stats.eArsiv}</h3>
          <p className="text-xs text-indigo-700">E-Arşiv</p>
        </div>

        <div className={cx(card('md', 'sm', 'subtle', 'lg'), 'bg-gradient-to-br from-green-50 to-green-100 border-green-200')}>
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.sm} font-bold text-green-900`}>{formatCurrency(stats.totalAmount)}</h3>
          <p className="text-xs text-green-700">Toplam Tutar</p>
        </div>

        <div className={cx(card('md', 'sm', 'subtle', 'lg'), 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200')}>
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-emerald-600" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.sm} font-bold text-emerald-900`}>{formatCurrency(stats.paidAmount)}</h3>
          <p className="text-xs text-emerald-700">Tahsil Edilen</p>
        </div>

        <div className={cx(card('md', 'sm', 'subtle', 'lg'), 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200')}>
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-orange-600" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.md} text-orange-900`}>{stats.unpaid}</h3>
          <p className="text-xs text-orange-700">Ödenmemiş</p>
        </div>
      </div>

      {/* Filters */}
      <div className={card('md', 'sm', 'default', 'lg')}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Fatura no, müşteri, vergi no ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className={input('md', 'default', undefined, 'md')}
          >
            <option value="all">Tüm Tipler</option>
            <option value="e-fatura">E-Fatura</option>
            <option value="e-arsiv">E-Arşiv</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className={input('md', 'default', undefined, 'md')}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="draft">Taslak</option>
            <option value="sent">Gönderildi</option>
            <option value="approved">Onaylandı</option>
            <option value="cancelled">İptal</option>
          </select>
        </div>
      </div>

      {/* Invoice List */}
      <div className={cx(card('md', 'none', 'default', 'lg'), 'overflow-hidden')}>
        {loading ? (
          <div className="p-12 text-center text-neutral-600">Yükleniyor...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-neutral-400 mb-3" size={48} />
            <p className="text-neutral-600">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Arama kriterlerine uygun fatura bulunamadı'
                : 'Henüz fatura bulunmuyor'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              İlk Faturayı Oluştur
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Fatura Bilgileri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    E-Belge
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-neutral-900">#{invoice.invoiceNumber}</div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(invoice.issueDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Vade: {formatDate(invoice.dueDate)}
                          </span>
                        </div>
                        {invoice.parasutInvoiceNo && (
                          <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <ExternalLink size={12} />
                            Paraşüt: {invoice.parasutInvoiceNo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-neutral-900">{invoice.customerName}</div>
                        {invoice.customerTaxNumber && (
                          <div className="text-xs text-neutral-600 mt-1">
                            VN: {invoice.customerTaxNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.invoiceType === 'e-fatura'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {invoice.invoiceType === 'e-fatura' ? <Zap size={12} /> : <Archive size={12} />}
                        {invoice.invoiceType === 'e-fatura' ? 'E-Fatura' : 'E-Arşiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-neutral-900">{formatCurrency(invoice.grandTotal)}</div>
                      {invoice.paidAmount > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          Ödenen: {formatCurrency(invoice.paidAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getEDocumentStatusBadge(invoice)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setShowDetail(true)
                          }}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Detay"
                        >
                          <Eye size={18} className="text-neutral-600" />
                        </button>
                        
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => handleSendEDocument(invoice)}
                            disabled={actionInvoiceId === invoice.id}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                            title="E-Belge Gönder"
                          >
                            <Send size={18} className="text-blue-600" />
                          </button>
                        )}

                        {invoice.invoiceType === 'e-fatura' && (
                          <>
                            <button
                              onClick={() => handleCheckEInvoiceStatus(invoice)}
                              disabled={actionInvoiceId === invoice.id}
                              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                              title="GİB Durumunu Sorgula"
                            >
                              <RefreshCw size={18} className="text-neutral-600" />
                            </button>
                            <button
                              onClick={() => handleDownloadXML(invoice)}
                              disabled={actionInvoiceId === invoice.id}
                              className="p-2 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                              title="E-Fatura XML İndir"
                            >
                              <File size={18} className="text-purple-600" />
                            </button>
                          </>
                        )}
                        
                        {invoice.parasutId && (
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            disabled={actionInvoiceId === invoice.id}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                            title="PDF İndir"
                          >
                            <Download size={18} className="text-green-600" />
                          </button>
                        )}
                        
                        {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                          <button
                            onClick={() => handleCancelInvoice(invoice)}
                            disabled={actionInvoiceId === invoice.id}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                            title="İptal Et"
                          >
                            <X size={18} className="text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Info */}
      {!loading && filteredInvoices.length > 0 && (
        <div className="text-sm text-neutral-600 text-center">
          {filteredInvoices.length} fatura gösteriliyor
          {invoices.length !== filteredInvoices.length && ` (toplam ${invoices.length} fatura)`}
        </div>
      )}
    </div>
  )
}
