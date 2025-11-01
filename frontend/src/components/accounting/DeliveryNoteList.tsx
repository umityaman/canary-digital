import { useState, useEffect } from 'react'
import {
  Search, Download, Filter, Truck, Package, Eye, Plus, RefreshCw,
  FileText, Calendar, User, MapPin, CheckCircle, Clock, X, ArrowRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import DeliveryNoteForm from './DeliveryNoteForm'
import DeliveryNoteDetail from './DeliveryNoteDetail'

interface DeliveryNote {
  id: number
  deliveryNumber: string
  orderId: number | null
  orderNumber: string | null
  customerId: number
  customerName: string
  deliveryDate: string
  deliveryAddress: string
  status: 'prepared' | 'shipped' | 'delivered' | 'cancelled'
  invoiceId: number | null
  invoiceNumber: string | null
  items: Array<{
    description: string
    quantity: number
    unit: string
  }>
  notes: string | null
  totalItems: number
  createdAt: string
}

export default function DeliveryNoteList() {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([])
  const [filteredNotes, setFilteredNotes] = useState<DeliveryNote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'prepared' | 'shipped' | 'delivered' | 'cancelled'>('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    loadDeliveryNotes()
  }, [])

  useEffect(() => {
    filterNotes()
  }, [deliveryNotes, searchTerm, filterStatus])

  const loadDeliveryNotes = async () => {
    setLoading(true)
    try {
      // Mock data - gerçek API geldiğinde değiştirilecek
      const mockData: DeliveryNote[] = [
        {
          id: 1,
          deliveryNumber: 'IRS-2024-001',
          orderId: 1,
          orderNumber: 'ORD-2024-001',
          customerId: 2,
          customerName: 'ABC Prodüksiyon',
          deliveryDate: '2024-11-01',
          deliveryAddress: 'Beyoğlu, İstanbul',
          status: 'delivered',
          invoiceId: 1,
          invoiceNumber: 'INV-2024-001',
          items: [
            { description: 'Canon EOS 5D Mark IV', quantity: 2, unit: 'Adet' },
            { description: 'Sony A7 III', quantity: 1, unit: 'Adet' }
          ],
          notes: 'Dikkatli taşınsın',
          totalItems: 3,
          createdAt: '2024-10-28'
        },
        {
          id: 2,
          deliveryNumber: 'IRS-2024-002',
          orderId: 2,
          orderNumber: 'ORD-2024-002',
          customerId: 3,
          customerName: 'XYZ Film',
          deliveryDate: '2024-11-02',
          deliveryAddress: 'Kadıköy, İstanbul',
          status: 'shipped',
          invoiceId: null,
          invoiceNumber: null,
          items: [
            { description: 'DJI Ronin 4D', quantity: 1, unit: 'Adet' },
            { description: 'Tripod', quantity: 2, unit: 'Adet' }
          ],
          notes: null,
          totalItems: 3,
          createdAt: '2024-10-29'
        },
        {
          id: 3,
          deliveryNumber: 'IRS-2024-003',
          orderId: null,
          orderNumber: null,
          customerId: 4,
          customerName: 'Test Müşteri',
          deliveryDate: '2024-11-03',
          deliveryAddress: 'Şişli, İstanbul',
          status: 'prepared',
          invoiceId: null,
          invoiceNumber: null,
          items: [
            { description: 'Işık Seti', quantity: 1, unit: 'Set' }
          ],
          notes: 'Akşam teslimat',
          totalItems: 1,
          createdAt: '2024-10-30'
        }
      ]
      
      setDeliveryNotes(mockData)
    } catch (error: any) {
      console.error('Failed to load delivery notes:', error)
      toast.error('İrsaliyeler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = [...deliveryNotes]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(note => note.status === filterStatus)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredNotes(filtered)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      prepared: { label: 'Hazırlandı', color: 'bg-blue-100 text-blue-700', icon: <Package size={14} /> },
      shipped: { label: 'Yolda', color: 'bg-orange-100 text-orange-700', icon: <Truck size={14} /> },
      delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> },
      cancelled: { label: 'İptal', color: 'bg-red-100 text-red-700', icon: <X size={14} /> },
    }
    const badge = badges[status as keyof typeof badges] || badges.prepared
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    )
  }

  const handleConvertToInvoice = async (note: DeliveryNote) => {
    if (note.invoiceId) {
      toast.error('Bu irsaliye zaten faturalandırılmış')
      return
    }

    if (!confirm(`${note.deliveryNumber} numaralı irsaliye için fatura oluşturulsun mu?`)) {
      return
    }

    try {
      // Mock - gerçek API ile değiştirilecek
      toast.success('İrsaliye faturaya dönüştürüldü')
      loadDeliveryNotes()
    } catch (error: any) {
      console.error('Failed to convert to invoice:', error)
      toast.error('Fatura oluşturulamadı')
    }
  }

  const handleDownloadPDF = (note: DeliveryNote) => {
    toast.info('PDF indirme özelliği yakında eklenecek')
  }

  const calculateStats = () => {
    return {
      total: deliveryNotes.length,
      prepared: deliveryNotes.filter(n => n.status === 'prepared').length,
      shipped: deliveryNotes.filter(n => n.status === 'shipped').length,
      delivered: deliveryNotes.filter(n => n.status === 'delivered').length,
      invoiced: deliveryNotes.filter(n => n.invoiceId !== null).length,
      pending: deliveryNotes.filter(n => n.invoiceId === null && n.status !== 'cancelled').length,
    }
  }

  const stats = calculateStats()

  if (showForm) {
    return (
      <DeliveryNoteForm
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false)
          loadDeliveryNotes()
        }}
      />
    )
  }

  if (showDetail && selectedNote) {
    return (
      <DeliveryNoteDetail
        deliveryNote={selectedNote}
        onBack={() => {
          setShowDetail(false)
          setSelectedNote(null)
        }}
        onUpdate={loadDeliveryNotes}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">İrsaliye Yönetimi</h2>
          <p className="text-sm text-neutral-600 mt-1">Sevkiyat ve teslimat takibi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadDeliveryNotes()}
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
            <span className="hidden sm:inline">Yeni İrsaliye</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-blue-600" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-blue-900">{stats.total}</h3>
          <p className="text-xs text-blue-700">Toplam İrsaliye</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="text-indigo-600" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-indigo-900">{stats.prepared}</h3>
          <p className="text-xs text-indigo-700">Hazırlandı</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Truck className="text-orange-600" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-orange-900">{stats.shipped}</h3>
          <p className="text-xs text-orange-700">Yolda</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-green-900">{stats.delivered}</h3>
          <p className="text-xs text-green-700">Teslim Edildi</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-purple-600" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-purple-900">{stats.invoiced}</h3>
          <p className="text-xs text-purple-700">Faturalandı</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-yellow-600" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-yellow-900">{stats.pending}</h3>
          <p className="text-xs text-yellow-700">Fatura Bekliyor</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="İrsaliye no, müşteri, sipariş no, adres ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="prepared">Hazırlandı</option>
            <option value="shipped">Yolda</option>
            <option value="delivered">Teslim Edildi</option>
            <option value="cancelled">İptal</option>
          </select>
        </div>
      </div>

      {/* Delivery Notes List */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-600">Yükleniyor...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="mx-auto text-neutral-400 mb-3" size={48} />
            <p className="text-neutral-600">
              {searchTerm || filterStatus !== 'all'
                ? 'Arama kriterlerine uygun irsaliye bulunamadı'
                : 'Henüz irsaliye bulunmuyor'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              İlk İrsaliyeyi Oluştur
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    İrsaliye Bilgileri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Teslimat
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Kalem
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Fatura
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredNotes.map((note) => (
                  <tr
                    key={note.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-neutral-900">{note.deliveryNumber}</div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(note.deliveryDate)}
                          </span>
                          {note.orderNumber && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Package size={12} />
                              {note.orderNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{note.customerName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-neutral-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-neutral-700">{note.deliveryAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                        <Package size={14} />
                        {note.totalItems}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(note.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {note.invoiceNumber ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle size={12} />
                          {note.invoiceNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedNote(note)
                            setShowDetail(true)
                          }}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Detay"
                        >
                          <Eye size={18} className="text-neutral-600" />
                        </button>
                        
                        {!note.invoiceId && note.status !== 'cancelled' && (
                          <button
                            onClick={() => handleConvertToInvoice(note)}
                            className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Faturaya Çevir"
                          >
                            <ArrowRight size={18} className="text-purple-600" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDownloadPDF(note)}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="PDF İndir"
                        >
                          <Download size={18} className="text-green-600" />
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

      {/* Results Info */}
      {!loading && filteredNotes.length > 0 && (
        <div className="text-sm text-neutral-600 text-center">
          {filteredNotes.length} irsaliye gösteriliyor
          {deliveryNotes.length !== filteredNotes.length && ` (toplam ${deliveryNotes.length} irsaliye)`}
        </div>
      )}
    </div>
  )
}
