import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { accountingAPI } from '../../services/api'
import { card, button, input, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

interface IncomeModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  initial?: Income | null
}

interface Income {
  id?: number
  description: string
  amount: number
  category: string
  date: string
  status: string
  paymentMethod: string
  notes?: string
  invoiceId?: number
}

const INCOME_CATEGORIES = [
  'Ekipman Kiralama',
  'Hizmet Bedeli',
  'Ürün Satışı',
  'Danışmanlık',
  'Eğitim',
  'Diğer'
]

const PAYMENT_METHODS = [
  'Nakit',
  'Banka Transferi',
  'Kredi Kartı',
  'Çek',
  'Senet'
]

const STATUSES = [
  { value: 'received', label: 'Alındı' },
  { value: 'pending', label: 'Beklemede' },
  { value: 'cancelled', label: 'İptal' }
]

export default function IncomeModal({ open, onClose, onSaved, initial }: IncomeModalProps) {
  const [formData, setFormData] = useState<Income>({
    description: '',
    amount: 0,
    category: 'Ekipman Kiralama',
    date: new Date().toISOString().split('T')[0],
    status: 'received',
    paymentMethod: 'Nakit',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initial) {
      setFormData({
        ...initial,
        date: initial.date.split('T')[0]
      })
    } else {
      setFormData({
        description: '',
        amount: 0,
        category: 'Ekipman Kiralama',
        date: new Date().toISOString().split('T')[0],
        status: 'received',
        paymentMethod: 'Nakit',
        notes: ''
      })
    }
  }, [initial, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description || formData.amount <= 0) {
      toast.error('Lütfen zorunlu alanları doldurun')
      return
    }

    setLoading(true)
    try {
      if (initial?.id) {
        await accountingAPI.updateIncome(initial.id, formData)
        toast.success('Gelir güncellendi')
      } else {
        await accountingAPI.createIncome(formData)
        toast.success('Gelir kaydedildi')
      }
      
      onSaved()
      onClose()
    } catch (error: any) {
      console.error('Income save error:', error)
      toast.error(error.response?.data?.message || error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={cx(card('lg', 'none', 'default', 'xl'), 'w-full max-w-2xl max-h-[90vh] overflow-y-auto')}>
        <div className={cx('sticky top-0 bg-white border-b border-neutral-200', DESIGN_TOKENS.spacing.padding.md, 'flex items-center justify-between')}>
          <h2 className={`${DESIGN_TOKENS.typography.h2} ${DESIGN_TOKENS.colors.text.primary}`}>
            {initial ? 'Gelir Düzenle' : 'Yeni Gelir'}
          </h2>
          <button
            onClick={onClose}
            className={`${DESIGN_TOKENS.colors.text.muted} hover:text-neutral-600 transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={cx(DESIGN_TOKENS.spacing.padding.md, 'space-y-4')}>
          {/* Açıklama */}
          <div>
            <label className={`block ${DESIGN_TOKENS.typography.body.sm} font-medium ${DESIGN_TOKENS.colors.text.secondary} mb-2`}>
              Açıklama *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={input('md', 'default', undefined, 'md')}
              rows={3}
              placeholder="Gelir açıklaması..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tutar */}
            <div>
              <label className={`block ${DESIGN_TOKENS.typography.body.sm} font-medium ${DESIGN_TOKENS.colors.text.secondary} mb-2`}>
                Tutar (₺) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className={input('md', 'default', undefined, 'md')}
                placeholder="0.00"
                required
              />
            </div>

            {/* Kategori */}
            <div>
              <label className={`block ${DESIGN_TOKENS.typography.body.sm} font-medium ${DESIGN_TOKENS.colors.text.secondary} mb-2`}>
                Kategori *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={input('md', 'default', undefined, 'md')}
              >
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tarih */}
            <div>
              <label className={`block ${DESIGN_TOKENS.typography.body.sm} font-medium ${DESIGN_TOKENS.colors.text.secondary} mb-2`}>
                Tarih *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={input('md', 'default', undefined, 'md')}
                required
              />
            </div>

            {/* Ödeme Yöntemi */}
            <div>
              <label className={`block ${DESIGN_TOKENS.typography.body.sm} font-medium ${DESIGN_TOKENS.colors.text.secondary} mb-2`}>
                Ödeme Yöntemi *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className={input('md', 'default', undefined, 'md')}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Durum */}
          <div>
            <label className={`block ${DESIGN_TOKENS.typography.body.sm} font-medium ${DESIGN_TOKENS.colors.text.secondary} mb-2`}>
              Durum *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={input('md', 'default', undefined, 'md')}
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notlar */}
          <div>
            <label className={`block ${DESIGN_TOKENS.typography.body.sm} font-medium ${DESIGN_TOKENS.colors.text.secondary} mb-2`}>
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={input('md', 'default', undefined, 'md')}
              rows={2}
              placeholder="Ek notlar..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className={button('md', 'outline', 'md')}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={button('md', 'dark', 'md')}
            >
              {loading ? 'Kaydediliyor...' : (initial ? 'Güncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
