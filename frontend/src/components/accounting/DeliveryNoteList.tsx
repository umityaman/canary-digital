import { useState, useEffect } from 'react'
import {
  Search, Download, Filter, Truck, Package, Eye, Plus, RefreshCw,
  FileText, Calendar, User, MapPin, CheckCircle, Clock, X, ArrowRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import DeliveryNoteForm from './DeliveryNoteForm'
import DeliveryNoteDetail from './DeliveryNoteDetail'
import { card, button, input, badge, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

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
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
        return
      }

      const response = await fetch('/api/accounting/delivery-notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load delivery notes')
      }

      const data = await response.json()
      const notes = data.data || data || []
      
      // Backend response mapping
      const mappedNotes: DeliveryNote[] = notes.map((note: any) => ({
        id: note.id,
        deliveryNumber: note.deliveryNumber || `IRS-${note.id}`,
        orderId: note.orderId,
        orderNumber: note.order?.orderNumber || note.orderNumber,
        customerId: note.customerId,
        customerName: note.customer?.name || note.customerName || 'N/A',
        deliveryDate: note.deliveryDate || note.createdAt,
        deliveryAddress: note.deliveryAddress || note.customer?.address || 'N/A',
        status: note.status || 'prepared',
        invoiceId: note.invoiceId,
        invoiceNumber: note.invoice?.invoiceNumber || note.invoiceNumber,
        items: note.items || note.deliveryNoteItems?.map((item: any) => ({
          description: item.description || item.equipment?.name || 'N/A',
          quantity: item.quantity || 0,
          unit: item.unit || 'Adet'
        })) || [],
        notes: note.notes,
        totalItems: note.items?.length || note.deliveryNoteItems?.length || 0,
        createdAt: note.createdAt
      }))
      
      setDeliveryNotes(mappedNotes)
      
      if (mappedNotes.length === 0) {
        toast('Henüz irsaliye kaydı bulunmuyor', { icon: 'ℹ️' })
      }
    } catch (error: any) {
      console.error('Failed to load delivery notes:', error)
      toast.error('İrsaliyeler yüklenemedi')
      setDeliveryNotes([])
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
    const statusMap: Record<string, { status: string; icon: JSX.Element }> = {
      prepared: { status: 'partial', icon: <Package size={14} /> },
      shipped: { status: 'partial', icon: <Truck size={14} /> },
      delivered: { status: 'paid', icon: <CheckCircle size={14} /> },
      cancelled: { status: 'overdue', icon: <X size={14} /> },
    }
    const mapped = statusMap[status] || statusMap.prepared
    const badgeData = badge(mapped.status, 'invoice', 'sm', 'solid')
    return (
      <span className={cx(badgeData.className, 'inline-flex items-center gap-1')}>
        {mapped.icon}
        {badgeData.label}
      </span>
    )
  }

  const handleConvertToInvoice = async (note: DeliveryNote) => {
    if (note.invoiceId) {
      toast.error('Bu irsaliye zaten faturaland�r�lm��')
      return
    }

    if (!confirm(`${note.deliveryNumber} numaral� irsaliye i�in fatura olu�turulsun mu?`)) {
      return
    }

    try {
      // Mock - ger�ek API ile de�i�tirilecek
      toast.success('�rsaliye faturaya d�n��t�r�ld�')
      loadDeliveryNotes()
    } catch (error: any) {
      console.error('Failed to convert to invoice:', error)
      toast.error('Fatura olu�turulamad�')
    }
  }

  const handleDownloadPDF = (note: DeliveryNote) => {
    toast.info('PDF indirme �zelli�i yak�nda eklenecek')
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
          <h2 className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>�rsaliye Y�netimi</h2>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mt-1`}>Sevkiyat ve teslimat takibi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadDeliveryNotes()}
            className={cx(button('md', 'outline', 'md'), 'gap-2')}
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Yenile</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className={cx(button('md', 'primary', 'md'), 'gap-2')}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Yeni �rsaliye</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className={cx(card('sm', 'sm', 'subtle', 'lg'), 'bg-white border-neutral-200')}>
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-neutral-900" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.md} text-neutral-900`}>{stats.total}</h3>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} text-neutral-800`}>Toplam �rsaliye</p>
        </div>

        <div className={cx(card('sm', 'sm', 'subtle', 'lg'), 'bg-white border-neutral-200')}>
          <div className="flex items-center justify-between mb-2">
            <Package className="text-neutral-900" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.md} text-neutral-900`}>{stats.prepared}</h3>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} text-neutral-800`}>Haz�rland�</p>
        </div>

        <div className={cx(card('sm', 'sm', 'subtle', 'lg'), 'bg-white border-neutral-200')}>
          <div className="flex items-center justify-between mb-2">
            <Truck className="text-neutral-900" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.md} text-orange-900`}>{stats.shipped}</h3>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} text-neutral-800`}>Yolda</p>
        </div>

        <div className={cx(card('sm', 'sm', 'subtle', 'lg'), 'bg-white border-neutral-200')}>
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-neutral-900" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.md} text-neutral-900`}>{stats.delivered}</h3>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} text-neutral-800`}>Teslim Edildi</p>
        </div>

        <div className={cx(card('sm', 'sm', 'subtle', 'lg'), 'bg-white border-neutral-200')}>
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-neutral-900" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.md} text-neutral-900`}>{stats.invoiced}</h3>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} text-neutral-800`}>Faturaland�</p>
        </div>

        <div className={cx(card('sm', 'sm', 'subtle', 'lg'), 'bg-white border-neutral-200')}>
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-neutral-900" size={20} />
          </div>
          <h3 className={`${DESIGN_TOKENS?.typography?.stat.md} text-neutral-900`}>{stats.pending}</h3>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} text-neutral-800`}>Fatura Bekliyor</p>
        </div>
      </div>

      {/* Filters */}
      <div className={card('sm', 'none', 'default', 'lg')}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${DESIGN_TOKENS?.colors?.text.muted}`} size={20} />
              <input
                type="text"
                placeholder="�rsaliye no, m��teri, sipari� no, adres ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cx(input('md', 'default', undefined, 'md'), 'pl-10')}
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className={input('md', 'default', undefined, 'md')}
          >
            <option value="all">T�m Durumlar</option>
            <option value="prepared">Haz�rland�</option>
            <option value="shipped">Yolda</option>
            <option value="delivered">Teslim Edildi</option>
            <option value="cancelled">�ptal</option>
          </select>
        </div>
      </div>

      {/* Delivery Notes List */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-600">Y�kleniyor...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="mx-auto text-neutral-400 mb-3" size={48} />
            <p className="text-neutral-600">
              {searchTerm || filterStatus !== 'all'
                ? 'Arama kriterlerine uygun irsaliye bulunamad�'
                : 'Hen�z irsaliye bulunmuyor'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              �lk �rsaliyeyi Olu�tur
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    �rsaliye Bilgileri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    M��teri
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
                    ��lemler
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
                            <span className="flex items-center gap-1 text-neutral-900">
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
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full text-xs font-medium">
                          <CheckCircle size={12} />
                          {note.invoiceNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500">�</span>
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
                            className="p-2 hover:bg-neutral-50 rounded-lg transition-colors"
                            title="Faturaya �evir"
                          >
                            <ArrowRight size={18} className="text-neutral-900" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDownloadPDF(note)}
                          className="p-2 hover:bg-neutral-50 rounded-lg transition-colors"
                          title="PDF �ndir"
                        >
                          <Download size={18} className="text-neutral-900" />
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
          {filteredNotes.length} irsaliye g�steriliyor
          {deliveryNotes.length !== filteredNotes.length && ` (toplam ${deliveryNotes.length} irsaliye)`}
        </div>
      )}
    </div>
  )
}


