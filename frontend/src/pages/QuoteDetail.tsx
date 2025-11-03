import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Download, Printer, Share2, Mail, MessageSquare,
  Calendar, User, Building2, CreditCard, FileText, Clock,
  CheckCircle, XCircle, AlertCircle, Edit2, Trash2, Send, Ban
} from 'lucide-react'
import { offerAPI } from '../services/api'
import DetailSkeleton from '../components/ui/DetailSkeleton'
import toast from 'react-hot-toast'

interface QuoteDetail {
  id: number
  quoteNumber: string
  quoteDate: string
  validUntil: string
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
    days: number
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
  notes?: string
  termsAndConditions?: string
  createdAt: string
  updatedAt: string
  createdBy?: {
    id: number
    name: string
  }
}

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadQuote()
    }
  }, [id])

  const loadQuote = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading quote:', id)
      const response = await offerAPI.getById(Number(id))
      console.log('✅ Quote loaded:', response.data)
      setQuote(response.data.data || response.data)
    } catch (error: any) {
      console.error('❌ Failed to load quote:', error)
      toast.error('Teklif yüklenemedi: ' + (error.response?.data?.message || error.message))
      setTimeout(() => navigate('/accounting?tab=offer'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!quote) return
    
    if (!confirm(`${quote.quoteNumber} numaralı teklifi silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      await offerAPI.delete(quote.id)
      toast.success('Teklif başarıyla silindi')
      navigate('/accounting?tab=offer')
    } catch (error: any) {
      console.error('Failed to delete quote:', error)
      toast.error('Teklif silinemedi: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!quote) return

    try {
      await offerAPI.updateStatus(quote.id, status)
      toast.success('Teklif durumu güncellendi')
      loadQuote()
    } catch (error: any) {
      console.error('Failed to update status:', error)
      toast.error('Durum güncellenemedi: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleConvertToInvoice = async () => {
    if (!quote) return

    if (!confirm('Bu teklifi faturaya dönüştürmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      
      const response = await offerAPI.convertToInvoice(quote.id, {
        orderId: quote.id,
        startDate: today,
        endDate: nextMonth,
        notes: 'Tekliften otomatik oluşturuldu'
      })
      
      toast.success('Teklif başarıyla faturaya dönüştürüldü')
      navigate(`/accounting/invoice/${response.data.invoice.id}`)
    } catch (error: any) {
      console.error('Failed to convert quote:', error)
      toast.error('Dönüştürme başarısız: ' + (error.response?.data?.message || error.message))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      toast.success('PDF indirme özelliği yakında eklenecek')
    } catch (error) {
      toast.error('PDF indirilemedi')
    }
  }

  const handleSendEmail = async () => {
    try {
      toast.success('E-posta gönderme özelliği yakında eklenecek')
    } catch (error) {
      toast.error('E-posta gönderilemedi')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Teklif ${quote?.quoteNumber}`,
          text: `${quote?.customer.name} - ${formatCurrency(quote?.grandTotal || 0)}`,
          url: window.location.href,
        })
      } else {
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
      sent: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-800', icon: Send },
      accepted: { label: 'Kabul Edildi', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircle },
      expired: { label: 'Süresi Doldu', color: 'bg-orange-100 text-orange-800', icon: Clock },
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

  const isExpired = quote && new Date(quote.validUntil) < new Date()

  if (loading) {
    return <DetailSkeleton />
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <FileText size={48} className="text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Teklif bulunamadı</h2>
          <p className="text-neutral-600 mb-4">Bu teklif silinmiş veya mevcut değil.</p>
          <Link
            to="/accounting?tab=offer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft size={18} />
            Teklif Listesine Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/accounting?tab=offer')}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{quote.quoteNumber}</h1>
                <p className="text-sm text-neutral-600">{quote.customer.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {quote.status === 'draft' && (
                <button
                  onClick={() => handleStatusUpdate('sent')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Send size={18} />
                  Gönder
                </button>
              )}

              {quote.status === 'sent' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('accepted')}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Kabul Et
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <XCircle size={18} />
                    Reddet
                  </button>
                </>
              )}

              {(quote.status === 'accepted' || quote.status === 'sent') && (
                <button
                  onClick={handleConvertToInvoice}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Faturala
                </button>
              )}

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
                onClick={() => navigate(`/accounting/quote/${quote.id}/edit`)}
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
            {/* Quote Info Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Teklif Bilgileri</h2>
                <div className="flex items-center gap-2">
                  {getStatusBadge(quote.status)}
                  {isExpired && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      <Clock size={14} />
                      Süresi Doldu
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                    <Calendar size={16} />
                    Teklif Tarihi
                  </div>
                  <p className="font-medium text-neutral-900">{formatDate(quote.quoteDate)}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                    <Clock size={16} />
                    Geçerlilik Tarihi
                  </div>
                  <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-neutral-900'}`}>
                    {formatDate(quote.validUntil)}
                  </p>
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
                  <p className="font-medium text-neutral-900">{quote.customer.name}</p>
                </div>

                {quote.customer.email && (
                  <div>
                    <p className="text-sm text-neutral-600">E-posta</p>
                    <p className="font-medium text-neutral-900">{quote.customer.email}</p>
                  </div>
                )}

                {quote.customer.phone && (
                  <div>
                    <p className="text-sm text-neutral-600">Telefon</p>
                    <p className="font-medium text-neutral-900">{quote.customer.phone}</p>
                  </div>
                )}

                {quote.customer.taxNumber && (
                  <div>
                    <p className="text-sm text-neutral-600">Vergi No</p>
                    <p className="font-medium text-neutral-900">{quote.customer.taxNumber}</p>
                  </div>
                )}

                {quote.customer.address && (
                  <div>
                    <p className="text-sm text-neutral-600">Adres</p>
                    <p className="font-medium text-neutral-900">{quote.customer.address}</p>
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Gün</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Birim Fiyat</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {quote.items.map((item) => (
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
                        <td className="px-6 py-4 text-right text-neutral-900">{item.days}</td>
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
                    <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                  </div>

                  {quote.discountAmount && quote.discountAmount > 0 && (
                    <div className="flex justify-between text-neutral-700">
                      <span>İndirim</span>
                      <span className="font-medium text-red-600">-{formatCurrency(quote.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-700">
                    <span>KDV</span>
                    <span className="font-medium">{formatCurrency(quote.taxAmount)}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                    <span>Genel Toplam</span>
                    <span>{formatCurrency(quote.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">Notlar</h2>
                <p className="text-neutral-700 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}

            {/* Terms and Conditions */}
            {quote.termsAndConditions && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">Şartlar ve Koşullar</h2>
                <p className="text-neutral-700 whitespace-pre-wrap text-sm">{quote.termsAndConditions}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Hızlı İşlemler</h3>

              <div className="space-y-2">
                {quote.status === 'draft' && (
                  <button
                    onClick={() => handleStatusUpdate('sent')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Müşteriye Gönder
                  </button>
                )}

                {quote.status === 'sent' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('accepted')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Kabul Edildi
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reddedildi
                    </button>
                  </>
                )}

                {(quote.status === 'accepted' || quote.status === 'sent') && !isExpired && (
                  <button
                    onClick={handleConvertToInvoice}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Faturaya Dönüştür
                  </button>
                )}

                <button
                  onClick={() => navigate(`/accounting/quote/${quote.id}/edit`)}
                  className="w-full px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} />
                  Düzenle
                </button>
              </div>
            </div>

            {/* Status History */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Durum Geçmişi</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Teklif oluşturuldu</p>
                    <p className="text-xs text-neutral-600">{formatDate(quote.createdAt)}</p>
                    {quote.createdBy && (
                      <p className="text-xs text-neutral-500">{quote.createdBy.name}</p>
                    )}
                  </div>
                </div>

                {quote.updatedAt !== quote.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Teklif güncellendi</p>
                      <p className="text-xs text-neutral-600">{formatDate(quote.updatedAt)}</p>
                    </div>
                  </div>
                )}

                {quote.status === 'sent' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Müşteriye gönderildi</p>
                    </div>
                  </div>
                )}

                {quote.status === 'accepted' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Teklif kabul edildi</p>
                    </div>
                  </div>
                )}

                {quote.status === 'rejected' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Teklif reddedildi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Özet</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Toplam Tutar</span>
                  <span className="font-semibold text-neutral-900">{formatCurrency(quote.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Geçerlilik</span>
                  <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-neutral-900'}`}>
                    {formatDate(quote.validUntil)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Durum</span>
                  <span>{getStatusBadge(quote.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
