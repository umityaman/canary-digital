import { useState } from 'react'
import { ArrowLeft, Download, Send, X, CheckCircle, FileText, Calendar, User, DollarSign, RefreshCw, File, Hash } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EInvoiceDetailProps {
  invoice: any
  onBack: () => void
  onUpdate: () => void
}

export default function EInvoiceDetail({ invoice, onBack, onUpdate }: EInvoiceDetailProps) {
  const [loading, setLoading] = useState(false)

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
      month: 'long',
      year: 'numeric'
    })
  }

  const handleSendEDocument = async () => {
    if (invoice.invoiceType === 'e-fatura') {
      const headers = buildHeaders()
      if (!headers) return

      setLoading(true)
      try {
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
        onUpdate()
      } catch (error: any) {
        console.error('Failed to send e-invoice:', error)
        toast.error(error.message || 'E-Fatura gönderilemedi')
      } finally {
        setLoading(false)
      }

      return
    }

    if (!invoice.parasutId) {
      toast.error('Paraşüt fatura ID bulunamadı')
      return
    }

    const headers = buildHeaders(true)
    if (!headers) return

    setLoading(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send-edocument`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.message || 'E-Arşiv gönderilemedi')
      }

      toast.success('E-Arşiv başarıyla oluşturuldu')
      onUpdate()
    } catch (error: any) {
      console.error('Failed to send e-document:', error)
      toast.error(error.message || 'E-Belge gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    if (invoice.invoiceType !== 'e-fatura') {
      return
    }

    const headers = buildHeaders()
    if (!headers) return

    setLoading(true)
    try {
      const response = await fetch(`/api/einvoice/status/${invoice.id}`, {
        method: 'GET',
        headers,
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.message || 'Durum sorgulanamadı')
      }

      toast.success(`GİB durumu: ${payload?.data?.status || 'bilinmiyor'}`)
      onUpdate()
    } catch (error: any) {
      console.error('Failed to check e-invoice status:', error)
      toast.error(error.message || 'Durum sorgulanamadı')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadXML = async () => {
    if (invoice.invoiceType !== 'e-fatura') {
      return
    }

    const headers = buildHeaders()
    if (!headers) return

    setLoading(true)
    try {
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
      setLoading(false)
    }
  }

  const handleCancelInvoice = async () => {
    if (!confirm('Bu faturayı iptal etmek istediğinize emin misiniz?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Failed to cancel invoice')

      toast.success('Fatura iptal edildi')
      onUpdate()
      onBack()
    } catch (error: any) {
      console.error('Failed to cancel invoice:', error)
      toast.error('Fatura iptal edilemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    toast.info('PDF indirme özelliği yakında eklenecek')
  }

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
      draft: { label: 'Taslak', color: 'text-neutral-700', bgColor: 'bg-neutral-100' },
      sent: { label: 'Gönderildi', color: 'text-neutral-800', bgColor: 'bg-neutral-100' },
      approved: { label: 'Onaylandı', color: 'text-neutral-800', bgColor: 'bg-neutral-100' },
      rejected: { label: 'Reddedildi', color: 'text-neutral-800', bgColor: 'bg-neutral-100' },
      cancelled: { label: 'İptal', color: 'text-neutral-800', bgColor: 'bg-neutral-100' },
      paid: { label: 'Ödendi', color: 'text-neutral-800', bgColor: 'bg-neutral-100' },
    }
    return statusMap[status] || statusMap.draft
  }

  const statusInfo = getStatusInfo(invoice.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Fatura #{invoice.invoiceNumber}</h2>
            <p className="text-sm text-neutral-600 mt-1">
              <span className={`font-medium ${invoice.invoiceType === 'e-fatura' ? 'text-neutral-900' : 'text-neutral-900'}`}>
                {invoice.invoiceType === 'e-fatura' ? 'E-Fatura' : 'E-Arşiv'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {invoice.status === 'draft' && (
            <button
              onClick={handleSendEDocument}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-50 text-white rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
              <span className="hidden sm:inline">E-Belge Gönder</span>
            </button>
          )}
          {invoice.invoiceType === 'e-fatura' && (
            <>
              <button
                onClick={handleCheckStatus}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-200 text-neutral-800 rounded-xl hover:bg-neutral-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Durum Sorgula</span>
              </button>
              <button
                onClick={handleDownloadXML}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-50 text-white rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <File size={18} />
                <span className="hidden sm:inline">XML İndir</span>
              </button>
            </>
          )}
          
          {invoice.parasutId && (
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-50 text-white rounded-xl hover:bg-neutral-50 transition-colors"
            >
              <Download size={18} />
              <span className="hidden sm:inline">PDF İndir</span>
            </button>
          )}
          
          {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
            <button
              onClick={handleCancelInvoice}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-50 text-white rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              <X size={18} />
              <span className="hidden sm:inline">İptal Et</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
          <CheckCircle size={16} />
          {statusInfo.label}
        </span>
        
        {invoice.invoiceType === 'e-fatura' ? (
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
            invoice.eInvoiceMeta?.gibStatus === 'sent'
              ? 'bg-neutral-100 text-neutral-800'
              : invoice.eInvoiceMeta?.gibStatus === 'delivered'
                ? 'bg-neutral-100 text-neutral-800'
                : 'bg-neutral-100 text-neutral-700'
          }`}>
            <Hash size={16} />
            {invoice.eInvoiceMeta?.gibStatus === 'sent'
              ? 'GİB Gönderildi'
              : invoice.eInvoiceMeta?.gibStatus === 'delivered'
                ? 'GİB Yanıtı Alındı'
                : 'XML Taslak'}
          </span>
        ) : (
          invoice.eDocumentStatus && (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
              invoice.eDocumentStatus === 'delivered' ? 'bg-neutral-100 text-neutral-800' : 'bg-neutral-100 text-neutral-800'
            }`}>
              {invoice.eDocumentStatus === 'delivered' ? 'E-Belge Teslim Edildi' : 'E-Belge İşleniyor'}
            </span>
          )
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info Cards */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Müşteri Bilgileri
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-neutral-600">Müşteri:</span>
                <div className="font-semibold text-neutral-900 mt-1">{invoice.customerName}</div>
              </div>
              
              {invoice.customer?.email && (
                <div>
                  <span className="text-neutral-600">E-posta:</span>
                  <div className="font-medium text-neutral-900 mt-1">{invoice.customer.email}</div>
                </div>
              )}
              
              {invoice.customerTaxNumber && (
                <>
                  <div>
                    <span className="text-neutral-600">Vergi No:</span>
                    <div className="font-medium text-neutral-900 mt-1">{invoice.customerTaxNumber}</div>
                  </div>
                  {invoice.customer?.taxOffice && (
                    <div>
                      <span className="text-neutral-600">Vergi Dairesi:</span>
                      <div className="font-medium text-neutral-900 mt-1">{invoice.customer.taxOffice}</div>
                    </div>
                  )}
                </>
              )}
              
              {invoice.customer?.address && (
                <div>
                  <span className="text-neutral-600">Adres:</span>
                  <div className="font-medium text-neutral-900 mt-1">{invoice.customer.address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Fatura Bilgileri
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-neutral-600">Fatura No:</span>
                <div className="font-semibold text-neutral-900 mt-1">#{invoice.invoiceNumber}</div>
              </div>
              
              {invoice.parasutInvoiceNo && (
                <div>
                  <span className="text-neutral-600">Paraşüt No:</span>
                  <div className="font-medium text-neutral-900 mt-1">{invoice.parasutInvoiceNo}</div>
                </div>
              )}
              
              <div>
                <span className="text-neutral-600">Fatura Tarihi:</span>
                <div className="font-medium text-neutral-900 mt-1 flex items-center gap-2">
                  <Calendar size={14} />
                  {formatDate(invoice.issueDate)}
                </div>
              </div>
              
              <div>
                <span className="text-neutral-600">Vade Tarihi:</span>
                <div className="font-medium text-neutral-900 mt-1 flex items-center gap-2">
                  <Calendar size={14} />
                  {formatDate(invoice.dueDate)}
                </div>
              </div>
              
              {invoice.description && (
                <div>
                  <span className="text-neutral-600">Açıklama:</span>
                  <div className="font-medium text-neutral-900 mt-1">{invoice.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Ödeme Bilgileri
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-800">Toplam Tutar:</span>
                <span className="text-xl font-bold text-neutral-900">{formatCurrency(invoice.grandTotal)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-800">Ödenen:</span>
                <span className="text-lg font-semibold text-neutral-800">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              
              <div className="pt-3 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-800">Kalan:</span>
                  <span className="text-xl font-bold text-neutral-800">
                    {formatCurrency(invoice.grandTotal - invoice.paidAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Items & Totals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Items */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Fatura Kalemleri</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Açıklama</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-neutral-700 uppercase">Miktar</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Birim Fiyat</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">İskonto</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">KDV</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {invoice.items?.map((item: any, index: number) => {
                    const subtotal = item.quantity * item.unitPrice
                    const discount = subtotal * (item.discountPercentage / 100)
                    const taxable = subtotal - discount
                    const tax = taxable * (item.taxRate / 100)
                    const total = taxable + tax

                    return (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-neutral-900">{item.description}</td>
                        <td className="px-4 py-3 text-center text-sm text-neutral-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-sm text-neutral-700">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right text-sm text-neutral-800">
                          {item.discountPercentage > 0 ? `%${item.discountPercentage}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-neutral-700">%{item.taxRate}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Fatura Özeti</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-neutral-700">
                <span>Ara Toplam:</span>
                <span className="font-semibold">{formatCurrency(invoice.subtotal || 0)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex items-center justify-between text-neutral-700">
                  <span>İskonto:</span>
                  <span className="font-semibold text-neutral-800">-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-neutral-700">
                <span>KDV:</span>
                <span className="font-semibold">{formatCurrency(invoice.taxAmount || 0)}</span>
              </div>

              <div className="pt-3 border-t-2 border-neutral-300">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-neutral-900">Genel Toplam:</span>
                  <span className="text-2xl font-bold text-neutral-900">{formatCurrency(invoice.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(invoice.description || invoice.notes) && (
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notlar</h3>
              <div className="space-y-3">
                {invoice.description && (
                  <div>
                    <span className="text-sm font-medium text-neutral-700">Açıklama:</span>
                    <p className="text-sm text-neutral-600 mt-1">{invoice.description}</p>
                  </div>
                )}
                
                {invoice.notes && (
                  <div>
                    <span className="text-sm font-medium text-neutral-700">Dahili Notlar:</span>
                    <p className="text-sm text-neutral-600 mt-1">{invoice.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


