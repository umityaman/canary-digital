import { useState } from 'react'
import { ArrowLeft, Package, User, MapPin, FileText, CheckCircle, Truck, Clock, Download, Receipt, X, Edit2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DeliveryNoteDetailProps {
  note: any
  onClose: () => void
  onEdit: () => void
  onStatusChange: () => void
  onConvertToInvoice: () => void
}

export default function DeliveryNoteDetail({
  note,
  onClose,
  onEdit,
  onStatusChange,
  onConvertToInvoice
}: DeliveryNoteDetailProps) {
  const [loading, setLoading] = useState(false)

  const handleUpdateStatus = async (newStatus: string) => {
    setLoading(true)
    try {
      // Mock - gerçek API ile değiştirilecek
      console.log('Updating status to:', newStatus)
      toast.success('Durum güncellendi')
      onStatusChange()
    } catch (error: any) {
      console.error('Failed to update status:', error)
      toast.error('Durum güncellenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleConvertToInvoice = async () => {
    if (note.invoiceId) {
      toast.info('Bu irsaliye zaten faturalandırılmış')
      return
    }

    setLoading(true)
    try {
      // Mock - gerçek API ile değiştirilecek
      console.log('Converting to invoice:', note.id)
      toast.success('Fatura oluşturuldu')
      onConvertToInvoice()
    } catch (error: any) {
      console.error('Failed to convert to invoice:', error)
      toast.error('Fatura oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    toast.info('PDF indirme özelliği yakında eklenecek')
  }

  const handleCancel = async () => {
    if (note.status === 'cancelled') {
      toast.error('İrsaliye zaten iptal edilmiş')
      return
    }

    if (!confirm('İrsaliyeyi iptal etmek istediğinizden emin misiniz?')) {
      return
    }

    setLoading(true)
    try {
      // Mock - gerçek API ile değiştirilecek
      console.log('Cancelling delivery note:', note.id)
      toast.success('İrsaliye iptal edildi')
      onStatusChange()
    } catch (error: any) {
      console.error('Failed to cancel delivery note:', error)
      toast.error('İrsaliye iptal edilemedi')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'prepared':
        return { label: 'Hazırlandı', color: 'indigo', icon: Package }
      case 'shipped':
        return { label: 'Yolda', color: 'orange', icon: Truck }
      case 'delivered':
        return { label: 'Teslim Edildi', color: 'green', icon: CheckCircle }
      case 'cancelled':
        return { label: 'İptal', color: 'red', icon: X }
      default:
        return { label: status, color: 'neutral', icon: Clock }
    }
  }

  const statusInfo = getStatusInfo(note.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">İrsaliye Detayı</h2>
            <p className="text-sm text-neutral-600 mt-1">{note.deliveryNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {note.status !== 'cancelled' && !note.invoiceId && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl hover:bg-neutral-200 transition-colors"
            >
              <Edit2 size={18} />
              <span className="hidden sm:inline">Düzenle</span>
            </button>
          )}

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">PDF İndir</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info Cards */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <div className={`bg-gradient-to-br from-${statusInfo.color}-500 to-${statusInfo.color}-600 rounded-lg p-5 text-white bg-neutral-800`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Durum</h3>
              <StatusIcon size={24} />
            </div>
            <div className="text-3xl font-bold mb-2">{statusInfo.label}</div>
            <div className="text-sm opacity-90">
              {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Müşteri Bilgileri
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-neutral-600 mb-1">Müşteri Adı</div>
                <div className="font-semibold text-neutral-900">{note.customerName}</div>
              </div>

              {note.orderId && (
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Sipariş No</div>
                  <div className="font-semibold text-neutral-900">{note.orderNumber}</div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Truck size={20} />
              Teslimat Bilgileri
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-neutral-600 mb-1">Teslimat Tarihi</div>
                <div className="font-semibold text-neutral-900">
                  {new Date(note.deliveryDate).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm text-neutral-600 mb-1 flex items-center gap-1">
                  <MapPin size={14} />
                  Teslimat Adresi
                </div>
                <div className="font-medium text-neutral-900 text-sm">
                  {note.deliveryAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          {note.invoiceId && (
            <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Receipt size={20} />
                Fatura Bilgisi
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-900">Fatura No:</span>
                  <span className="font-semibold text-neutral-900">{note.invoiceNumber}</span>
                </div>
                <div className="mt-3">
                  <button className="w-full px-4 py-2 bg-neutral-50 text-white rounded-xl hover:bg-neutral-50 transition-colors text-sm">
                    Faturayı Görüntüle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Items & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Package size={20} />
              Sevk Edilen Malzemeler
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">#</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Açıklama</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">Miktar</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">Birim</th>
                  </tr>
                </thead>
                <tbody>
                  {note.items.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-neutral-600">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">{item.description}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-neutral-900">{item.quantity}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm text-neutral-600">{item.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-neutral-700 font-medium">Toplam Kalem</span>
              <span className="text-2xl font-bold text-neutral-900">{note.totalItems}</span>
            </div>
          </div>

          {/* Notes */}
          {note.notes && (
            <div className="bg-amber-50 rounded-lg p-6 border border-neutral-200">
              <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <FileText size={20} />
                Notlar
              </h3>
              <p className="text-amber-800 text-sm leading-relaxed">{note.notes}</p>
            </div>
          )}

          {/* Status Timeline */}
          {note.status !== 'cancelled' && (
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Durum Takibi</h3>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-neutral-200"></div>

                {/* Timeline steps */}
                <div className="space-y-6">
                  {/* Prepared */}
                  <div className="flex items-start gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      ['prepared', 'shipped', 'delivered'].includes(note.status)
                        ? 'bg-neutral-50 text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      <Package size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-neutral-900">Hazırlandı</div>
                      <div className="text-sm text-neutral-600">İrsaliye oluşturuldu</div>
                    </div>
                  </div>

                  {/* Shipped */}
                  <div className="flex items-start gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      ['shipped', 'delivered'].includes(note.status)
                        ? 'bg-orange-500 text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      <Truck size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-neutral-900">Yolda</div>
                      <div className="text-sm text-neutral-600">Teslimat için gönderildi</div>
                      {note.status === 'prepared' && (
                        <button
                          onClick={() => handleUpdateStatus('shipped')}
                          disabled={loading}
                          className="mt-2 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          Yola Çıktı Olarak İşaretle
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className="flex items-start gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      note.status === 'delivered'
                        ? 'bg-neutral-50 text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      <CheckCircle size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-neutral-900">Teslim Edildi</div>
                      <div className="text-sm text-neutral-600">Müşteriye teslim edildi</div>
                      {note.status === 'shipped' && (
                        <button
                          onClick={() => handleUpdateStatus('delivered')}
                          disabled={loading}
                          className="mt-2 px-3 py-1.5 bg-neutral-50 text-white text-sm rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                        >
                          Teslim Edildi Olarak İşaretle
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">İşlemler</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {!note.invoiceId && note.status !== 'cancelled' && (
                <button
                  onClick={handleConvertToInvoice}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-50 text-white rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  <Receipt size={18} />
                  <span>Faturaya Çevir</span>
                </button>
              )}

              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <Download size={18} />
                <span>PDF İndir</span>
              </button>

              {note.status !== 'cancelled' && !note.invoiceId && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-50 text-white rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                  <span>İrsaliyeyi İptal Et</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


