import { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { accountingAPI } from '../../services/api'

interface ExpenseModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  initial?: Expense | null
}

interface Expense {
  id?: number
  description: string
  amount: number
  category: string
  date: string
  status: string
  paymentMethod: string
  notes?: string
  receiptUrl?: string
}

const EXPENSE_CATEGORIES = [
  'Personel Maaşları',
  'Kira',
  'Elektrik/Su/Doğalgaz',
  'İnternet/Telefon',
  'Malzeme Alımı',
  'Ekipman Bakım/Onarım',
  'Pazarlama/Reklam',
  'Sigorta',
  'Vergi/Harçlar',
  'Yakıt',
  'Seyahat/Konaklama',
  'Yemek',
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
  { value: 'paid', label: 'Ödendi' },
  { value: 'pending', label: 'Beklemede' },
  { value: 'cancelled', label: 'İptal' }
]

export default function ExpenseModal({ open, onClose, onSaved, initial }: ExpenseModalProps) {
  const [formData, setFormData] = useState<Expense>({
    description: '',
    amount: 0,
    category: 'Malzeme Alımı',
    date: new Date().toISOString().split('T')[0],
    status: 'paid',
    paymentMethod: 'Nakit',
    notes: '',
    receiptUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)

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
        category: 'Malzeme Alımı',
        date: new Date().toISOString().split('T')[0],
        status: 'paid',
        paymentMethod: 'Nakit',
        notes: '',
        receiptUrl: ''
      })
    }
  }, [initial, open])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu en fazla 5MB olabilir')
      return
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Sadece JPG, PNG veya PDF dosyaları yüklenebilir')
      return
    }

    setUploadingReceipt(true)
    try {
      // TODO: Implement file upload to server
      // For now, just create a local URL
      const url = URL.createObjectURL(file)
      setFormData({ ...formData, receiptUrl: url })
      toast.success('Makbuz yüklendi')
    } catch (error) {
      toast.error('Makbuz yüklenirken hata oluştu')
    } finally {
      setUploadingReceipt(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description || formData.amount <= 0) {
      toast.error('Lütfen zorunlu alanları doldurun')
      return
    }

    setLoading(true)
    try {
      if (initial?.id) {
        await accountingAPI.updateExpense(initial.id, formData)
        toast.success('Gider güncellendi')
      } else {
        await accountingAPI.createExpense(formData)
        toast.success('Gider kaydedildi')
      }
      
      onSaved()
      onClose()
    } catch (error: any) {
      console.error('Expense save error:', error)
      toast.error(error.response?.data?.message || error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">
            {initial ? 'Gider Düzenle' : 'Yeni Gider'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Açıklama *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              rows={3}
              placeholder="Gider açıklaması..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tutar */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tutar (₺) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="0.00"
                required
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Kategori *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
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
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tarih *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
            </div>

            {/* Ödeme Yöntemi */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Ödeme Yöntemi *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Durum *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Makbuz/Fatura Yükleme */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Makbuz/Fatura
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                  <Upload size={18} />
                  <span className="text-sm">
                    {uploadingReceipt ? 'Yükleniyor...' : 'Dosya Seç'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingReceipt}
                />
              </label>
              {formData.receiptUrl && (
                <a
                  href={formData.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Makbuzu Görüntüle
                </a>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              JPG, PNG veya PDF (max 5MB)
            </p>
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              rows={2}
              placeholder="Ek notlar..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : (initial ? 'Güncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
