import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { accountingAPI } from '../../services/api'
import { Expense, EXPENSE_CATEGORIES, EXPENSE_STATUS, PAYMENT_METHODS } from './ExpenseTab'

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingExpense: Expense | null
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  editingExpense,
}: ExpenseModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
    status: 'paid',
    paymentMethod: '',
    notes: '',
  })

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        description: editingExpense.description,
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        date: editingExpense.date.split('T')[0],
        status: editingExpense.status,
        paymentMethod: editingExpense.paymentMethod || '',
        notes: editingExpense.notes || '',
      })
    } else {
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        status: 'paid',
        paymentMethod: '',
        notes: '',
      })
    }
  }, [editingExpense, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
      toast.error('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    try {
      setLoading(true)
      
      const data = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        status: formData.status,
        paymentMethod: formData.paymentMethod || undefined,
        notes: formData.notes || undefined,
      }

      if (editingExpense) {
        await accountingAPI.updateExpense(editingExpense.id, data)
        toast.success('Gider kaydı güncellendi')
      } else {
        await accountingAPI.createExpense(data)
        toast.success('Gider kaydı oluşturuldu')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to save expense:', error)
      toast.error('Kayıt başarısız: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">
            {editingExpense ? 'Gider Kaydını Düzenle' : 'Yeni Gider Kaydı'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Açıklama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Örn: Elektrik Faturası"
              required
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tutar (TRY) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              >
                <option value="">Kategori Seçin</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tarih <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Durum
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {EXPENSE_STATUS.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Ödeme Yöntemi
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">Seçin</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Not
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              rows={3}
              placeholder="İsteğe bağlı notlar..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : editingExpense ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
