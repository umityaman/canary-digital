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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">{initial?.id ? 'Çek Düzenle' : 'Yeni Çek'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="checkNumber" value={form.checkNumber} onChange={handleChange} placeholder="Çek No" className="w-full p-2 border rounded" />
          <input name="drawer" value={form.drawer} onChange={handleChange} placeholder="Düzenleyen" className="w-full p-2 border rounded" />
          <input name="bank" value={form.bank} onChange={handleChange} placeholder="Banka" className="w-full p-2 border rounded" />
          <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Tutar" className="w-full p-2 border rounded" />
          <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="w-full p-2 border rounded" />
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notlar" className="w-full p-2 border rounded" />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Kapat</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
