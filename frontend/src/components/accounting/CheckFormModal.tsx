import React, { useState, useEffect } from 'react'
import { checksAPI } from '../../services/api'

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
  initial?: any
}

export default function CheckFormModal({ open, onClose, onSaved, initial }: Props) {
  const [form, setForm] = useState<any>({
    checkNumber: '',
    drawer: '',
    bank: '',
    branch: '',
    accountNumber: '',
    amount: 0,
    issueDate: '',
    dueDate: '',
    status: 'pending',
    customerId: undefined,
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initial) setForm({ ...form, ...initial })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  if (!open) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((s: any) => ({ ...s, [name]: name === 'amount' ? parseFloat(value || '0') : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (initial?.id) {
        await checksAPI.update(initial.id, form)
      } else {
        await checksAPI.create(form)
      }
      onSaved && onSaved()
      onClose()
    } catch (err) {
      console.error('Check save error', err)
      alert('Kaydetme sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-6 text-gray-900">{initial?.id ? 'Çek Düzenle' : 'Yeni Çek'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="checkNumber" value={form.checkNumber} onChange={handleChange} placeholder="Çek No" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <input name="drawer" value={form.drawer} onChange={handleChange} placeholder="Düzenleyen" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <input name="bank" value={form.bank} onChange={handleChange} placeholder="Banka" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Tutar" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notlar" rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Kapat</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
