import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, Filter, TrendingUp, Clock, CheckCircle, Calendar,
  Eye, Download, Mail, Edit
} from 'lucide-react'
import { card, button, input, badge, statCardIcon, DESIGN_TOKENS, cx } from '../../styles/design-tokens'
import { offerAPI } from '../../services/api'

const TABLE_HEADER_CELL = 'px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider bg-neutral-50'
const TABLE_BODY_CELL = 'px-6 py-4 text-sm text-neutral-900'

interface Offer {
  id: number
  offerNumber: string
  customer: {
    id: number
    name: string
  }
  offerDate: string
  validUntil: string
  grandTotal: number
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED' | 'EXPIRED'
}

const OfferList: React.FC = () => {
  const navigate = useNavigate()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const response = await offerAPI.getAll()
      setOffers(response.data || [])
    } catch (error) {
      console.error('Teklifler yüklenirken hata:', error)
      setOffers([])
    } finally {
      setLoading(false)
    }
  }

  // Stats calculations
  const totalValue = offers.reduce((sum, offer) => sum + (offer.grandTotal || 0), 0)
  const acceptedOffers = offers.filter(o => o.status === 'ACCEPTED')
  const acceptedValue = acceptedOffers.reduce((sum, offer) => sum + (offer.grandTotal || 0), 0)
  const pendingOffers = offers.filter(o => o.status === 'SENT' || o.status === 'DRAFT')
  const pendingValue = pendingOffers.reduce((sum, offer) => sum + (offer.grandTotal || 0), 0)

  // Filtering
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = searchTerm === '' || 
      offer.offerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === '' || offer.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Taslak', variant: 'neutral' as const },
      SENT: { label: 'Gönderildi', variant: 'info' as const },
      ACCEPTED: { label: 'Kabul Edildi', variant: 'success' as const },
      REJECTED: { label: 'Reddedildi', variant: 'danger' as const },
      CONVERTED: { label: 'Faturaya Dönüştü', variant: 'success' as const },
      EXPIRED: { label: 'Süresi Doldu', variant: 'warning' as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'neutral' as const }
    return (
      <span className={badge('sm', config.variant, 'full')}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
      </div>
    )
  }

  return (
    <div 
      className="space-y-6"
      style={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Stats Cards */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        style={{ boxSizing: 'border-box' }}
      >
        {/* Total Quotes Value */}
        <div 
          className={cx(card('md', 'default', 'lg'), 'p-6')}
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`${DESIGN_TOKENS?.typography?.label?.lg} ${DESIGN_TOKENS?.colors?.text?.tertiary} mb-1`}>
                Toplam Teklif Değeri
              </p>
              <p className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text?.primary} mb-2`}>
                {formatCurrency(totalValue)}
              </p>
              <p className={`${DESIGN_TOKENS?.typography?.body?.sm} ${DESIGN_TOKENS?.colors?.text?.tertiary}`}>
                {offers.length} teklif
              </p>
            </div>
            <div className={statCardIcon('primary')}>
              <TrendingUp size={16} />
            </div>
          </div>
        </div>

        {/* Accepted Quotes */}
        <div 
          className={cx(card('md', 'default', 'lg'), 'p-6')}
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`${DESIGN_TOKENS?.typography?.label?.lg} ${DESIGN_TOKENS?.colors?.text?.tertiary} mb-1`}>
                Kabul Edilen
              </p>
              <p className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text?.primary} mb-2`}>
                {formatCurrency(acceptedValue)}
              </p>
              <p className={`${DESIGN_TOKENS?.typography?.body?.sm} ${DESIGN_TOKENS?.colors?.text?.tertiary}`}>
                {acceptedOffers.length} teklif
              </p>
            </div>
            <div className={statCardIcon('success')}>
              <CheckCircle size={16} />
            </div>
          </div>
        </div>

        {/* Pending Offers */}
        <div 
          className={cx(card('md', 'default', 'lg'), 'p-6')}
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`${DESIGN_TOKENS?.typography?.label?.lg} ${DESIGN_TOKENS?.colors?.text?.tertiary} mb-1`}>
                Bekleyen
              </p>
              <p className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text?.primary} mb-2`}>
                {formatCurrency(pendingValue)}
              </p>
              <p className={`${DESIGN_TOKENS?.typography?.body?.sm} ${DESIGN_TOKENS?.colors?.text?.tertiary}`}>
                {pendingOffers.length} teklif
              </p>
            </div>
            <div className={statCardIcon('warning')}>
              <Clock size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div 
        className={cx(card('md', 'default', 'lg'), 'p-4')}
        style={{ boxSizing: 'border-box' }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-3 ${DESIGN_TOKENS?.colors?.text?.muted}`} size={18} />
            <input
              type="text"
              placeholder="Teklif ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cx(input('md', 'default', undefined, 'md'), 'pl-10 w-full')}
              style={{ boxSizing: 'border-box' }}
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[180px]">
            <Filter className={`absolute left-3 top-3 ${DESIGN_TOKENS?.colors?.text?.muted}`} size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cx(input('md', 'default', undefined, 'md'), 'pl-10 w-full appearance-none')}
              style={{ boxSizing: 'border-box' }}
            >
              <option value="">Tüm Durumlar</option>
              <option value="DRAFT">Taslak</option>
              <option value="SENT">Gönderildi</option>
              <option value="ACCEPTED">Kabul Edildi</option>
              <option value="REJECTED">Reddedildi</option>
              <option value="CONVERTED">Faturaya Dönüştü</option>
              <option value="EXPIRED">Süresi Doldu</option>
            </select>
          </div>

          {/* New Quote Button */}
          <button
            onClick={() => navigate('/accounting/quote/new')}
            className={cx(button('md', 'primary', 'md'), 'whitespace-nowrap')}
          >
            Yeni Teklif
          </button>
        </div>
      </div>

      {/* Table */}
      <div 
        className={cx(card('md', 'default', 'lg'), 'overflow-hidden')}
        style={{ 
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <div 
          className="overflow-x-auto"
          style={{ 
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <table 
            className="w-full"
            style={{
              tableLayout: 'fixed',
              width: '100%',
              maxWidth: '100%'
            }}
          >
            <thead>
              <tr>
                <th className={TABLE_HEADER_CELL} style={{ width: '12%' }}>Teklif No</th>
                <th className={TABLE_HEADER_CELL} style={{ width: '18%' }}>Müşteri</th>
                <th className={TABLE_HEADER_CELL} style={{ width: '12%' }}>Tarih</th>
                <th className={TABLE_HEADER_CELL} style={{ width: '12%' }}>Geçerlilik</th>
                <th className={TABLE_HEADER_CELL} style={{ width: '15%' }}>Tutar</th>
                <th className={TABLE_HEADER_CELL} style={{ width: '13%' }}>Durum</th>
                <th className={TABLE_HEADER_CELL} style={{ width: '18%' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className={DESIGN_TOKENS?.colors?.text?.muted} size={48} />
                      <p className={`${DESIGN_TOKENS?.typography?.body?.lg} ${DESIGN_TOKENS?.colors?.text?.secondary}`}>
                        {searchTerm || statusFilter ? 'Arama kriterlerine uygun teklif bulunamadı' : 'Henüz teklif bulunmuyor'}
                      </p>
                      {!searchTerm && !statusFilter && (
                        <button
                          onClick={() => navigate('/accounting/quote/new')}
                          className={cx(button('md', 'primary', 'md'), 'mt-2')}
                        >
                          İlk Teklifi Oluştur
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-neutral-50 transition-colors">
                    <td className={TABLE_BODY_CELL}>
                      <div className="font-medium">{offer.offerNumber || `#${offer.id}`}</div>
                    </td>
                    <td className={TABLE_BODY_CELL}>
                      <div className="font-medium">{offer.customer?.name || '-'}</div>
                    </td>
                    <td className={TABLE_BODY_CELL}>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className={DESIGN_TOKENS?.colors?.text?.muted} />
                        {formatDate(offer.offerDate)}
                      </div>
                    </td>
                    <td className={TABLE_BODY_CELL}>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={DESIGN_TOKENS?.colors?.text?.muted} />
                        {formatDate(offer.validUntil)}
                      </div>
                    </td>
                    <td className={TABLE_BODY_CELL}>
                      <div className="font-semibold">{formatCurrency(offer.grandTotal)}</div>
                    </td>
                    <td className={TABLE_BODY_CELL}>
                      {renderStatusBadge(offer.status)}
                    </td>
                    <td className={TABLE_BODY_CELL}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/accounting/quote/${offer.id}`)}
                          className={`${DESIGN_TOKENS?.colors?.text?.secondary} hover:${DESIGN_TOKENS?.colors?.text?.primary} transition-colors`}
                          title="Görüntüle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/accounting/quote/${offer.id}/edit`)}
                          className={`${DESIGN_TOKENS?.colors?.text?.secondary} hover:${DESIGN_TOKENS?.colors?.text?.primary} transition-colors`}
                          title="Düzenle"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {/* PDF download handler */}}
                          className={`${DESIGN_TOKENS?.colors?.text?.secondary} hover:${DESIGN_TOKENS?.colors?.text?.primary} transition-colors`}
                          title="PDF İndir"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => {/* Email handler */}}
                          className={`${DESIGN_TOKENS?.colors?.text?.secondary} hover:${DESIGN_TOKENS?.colors?.text?.primary} transition-colors`}
                          title="Email Gönder"
                        >
                          <Mail size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OfferList
