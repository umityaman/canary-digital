import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Download, Printer, Share2, Mail, MessageSquare,
  Calendar, User, Building2, CreditCard, FileText, Clock,
  CheckCircle, XCircle, AlertCircle, Edit2, Trash2
} from 'lucide-react'
import { invoiceAPI } from '../services/api'
import toast from 'react-hot-toast'

interface InvoiceDetail {
  id: number
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  status: string
  customer: {
    id: number
    name: string
    email?: string
    phone?: string
    address?: string
    taxNumber?: string
  }
  items: Array<{
    id: number
    description: string
    quantity: number
    unitPrice: number
    total: number
    equipment?: {
      id: number
      name: string
      serialNumber?: string
    }
  }>
  subtotal: number
  taxAmount: number
  discountAmount?: number
  grandTotal: number
  paidAmount: number
  remainingAmount: number
  notes?: string
  paymentHistory?: Array<{
    id: number
    amount: number
    paymentDate: string
    paymentMethod: string
    notes?: string
  }>
  createdAt: string
  updatedAt: string
  createdBy?: {
    id: number
    name: string
  }
}

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadInvoice()
    }
  }, [id])

  const loadInvoice = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading invoice:', id)
      const response = await invoiceAPI.getById(Number(id))
      console.log('✅ Invoice loaded:', response.data)
      setInvoice(response.data.data || response.data)
    } catch (error: any) {
      console.error('❌ Failed to load invoice:', error)
      toast.error('Fatura yüklenemedi: ' + (error.response?.data?.message || error.message))
      // Navigate back after error
      setTimeout(() => navigate('/accounting?tab=invoice'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!invoice) return
    
    if (!confirm(`${invoice.invoiceNumber} numaralı faturayı silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      await invoiceAPI.delete(invoice.id)
      toast.success('Fatura başarıyla silindi')
      navigate('/accounting?tab=invoice')
    } catch (error: any) {
      console.error('Failed to delete invoice:', error)
      toast.error('Fatura silinemedi: ' + (error.response?.data?.message || error.message))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      toast.success('PDF indirme özelliği yakında eklenecek')
      // TODO: Implement PDF download
    } catch (error) {
      toast.error('PDF indirilemedi')
    }
  }

  const handleSendEmail = async () => {
    try {
      toast.success('E-posta gönderme özelliği yakında eklenecek')
      // TODO: Implement email sending
    } catch (error) {
      toast.error('E-posta gönderilemedi')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Fatura ${invoice?.invoiceNumber}`,
          text: `${invoice?.customer.name} - ${formatCurrency(invoice?.grandTotal || 0)}`,
          url: window.location.href,
        })
      } else {
        // Fallback: Copy link
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link kopyalandı')
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-800', icon: FileText },
      sent: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-800', icon: Mail },
      paid: { label: 'Ödendi', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { label: 'Vadesi Geçti', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { label: 'İptal', color: 'bg-gray-100 text-gray-800', icon: XCircle },
    }

    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-neutral-600">Fatura yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <FileText size={48} className="text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Fatura bulunamadı</h2>
          <p className="text-neutral-600 mb-4">Bu fatura silinmiş veya mevcut değil.</p>
          <Link
            to="/accounting?tab=invoice"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft size={18} />
            Fatura Listesine Dön
          </Link>
        </div>
      </div>
    )
  }

  const paymentProgress = invoice.grandTotal > 0 
    ? Math.round((invoice.paidAmount / invoice.grandTotal) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/accounting?tab=invoice')}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{invoice.invoiceNumber}</h1>
                <p className="text-sm text-neutral-600">{invoice.customer.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Paylaş"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title="PDF İndir"
              >
                <Download size={20} />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Yazdır"
              >
                <Printer size={20} />
              </button>
              <button
                onClick={handleSendEmail}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title="E-posta Gönder"
              >
                <Mail size={20} />
              </button>
              <button
                onClick={() => navigate(`/accounting/invoice/${invoice.id}/edit`)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
              >
                <Edit2 size={18} />
                Düzenle
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                title="Sil"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Info Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Fatura Bilgileri</h2>
                {getStatusBadge(invoice.status)}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                    <Calendar size={16} />
                    Fatura Tarihi
                  </div>
                  <p className="font-medium text-neutral-900">{formatDate(invoice.invoiceDate)}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                    <Clock size={16} />
                    Vade Tarihi
                  </div>
                  <p className="font-medium text-neutral-900">{formatDate(invoice.dueDate)}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Building2 size={20} />
                Müşteri Bilgileri
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Ad/Ünvan</p>
                  <p className="font-medium text-neutral-900">{invoice.customer.name}</p>
                </div>

                {invoice.customer.email && (
                  <div>
                    <p className="text-sm text-neutral-600">E-posta</p>
                    <p className="font-medium text-neutral-900">{invoice.customer.email}</p>
                  </div>
                )}

                {invoice.customer.phone && (
                  <div>
                    <p className="text-sm text-neutral-600">Telefon</p>
                    <p className="font-medium text-neutral-900">{invoice.customer.phone}</p>
                  </div>
                )}

                {invoice.customer.taxNumber && (
                  <div>
                    <p className="text-sm text-neutral-600">Vergi No</p>
                    <p className="font-medium text-neutral-900">{invoice.customer.taxNumber}</p>
                  </div>
                )}

                {invoice.customer.address && (
                  <div>
                    <p className="text-sm text-neutral-600">Adres</p>
                    <p className="font-medium text-neutral-900">{invoice.customer.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-900">Kalemler</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Açıklama</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Miktar</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Birim Fiyat</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-neutral-900">{item.description}</p>
                            {item.equipment && (
                              <p className="text-sm text-neutral-600">
                                {item.equipment.name}
                                {item.equipment.serialNumber && ` (${item.equipment.serialNumber})`}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-neutral-900">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-neutral-900">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-6 py-4 text-right font-medium text-neutral-900">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="p-6 bg-neutral-50 border-t border-neutral-200">
                <div className="max-w-sm ml-auto space-y-2">
                  <div className="flex justify-between text-neutral-700">
                    <span>Ara Toplam</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>

                  {invoice.discountAmount && invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-neutral-700">
                      <span>İndirim</span>
                      <span className="font-medium text-red-600">-{formatCurrency(invoice.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-700">
                    <span>KDV</span>
                    <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                    <span>Genel Toplam</span>
                    <span>{formatCurrency(invoice.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">Notlar</h2>
                <p className="text-neutral-700 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Ödeme Durumu
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-neutral-600 mb-2">
                    <span>Ödenen</span>
                    <span>{paymentProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Toplam Tutar</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(invoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Ödenen</span>
                    <span className="font-semibold text-green-600">{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-200">
                    <span className="text-neutral-900 font-medium">Kalan</span>
                    <span className="font-bold text-neutral-900">{formatCurrency(invoice.remainingAmount)}</span>
                  </div>
                </div>

                {invoice.remainingAmount > 0 && (
                  <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                    Ödeme Kaydet
                  </button>
                )}
              </div>
            </div>

            {/* Payment History */}
            {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Ödeme Geçmişi</h3>

                <div className="space-y-3">
                  {invoice.paymentHistory.map((payment) => (
                    <div key={payment.id} className="pb-3 border-b border-neutral-200 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-neutral-900">{formatCurrency(payment.amount)}</span>
                        <span className="text-xs text-neutral-600">{formatDate(payment.paymentDate)}</span>
                      </div>
                      <p className="text-sm text-neutral-600">{payment.paymentMethod}</p>
                      {payment.notes && (
                        <p className="text-xs text-neutral-500 mt-1">{payment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Log */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">İşlem Geçmişi</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Fatura oluşturuldu</p>
                    <p className="text-xs text-neutral-600">{formatDate(invoice.createdAt)}</p>
                    {invoice.createdBy && (
                      <p className="text-xs text-neutral-500">{invoice.createdBy.name}</p>
                    )}
                  </div>
                </div>

                {invoice.updatedAt !== invoice.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Fatura güncellendi</p>
                      <p className="text-xs text-neutral-600">{formatDate(invoice.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
