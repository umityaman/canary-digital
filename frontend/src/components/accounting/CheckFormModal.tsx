import React, { useState, useEffect } from 'react'
import { checksAPI } from '../../services/api'
import { card, button, input, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

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
      <div className={cx(card('lg', 'sm', 'elevated'), 'w-full max-w-3xl max-h-[90vh] overflow-y-auto')}>
        <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary} mb-6`}>{initial?.id ? 'Çek Düzenle' : 'Yeni Çek'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="checkNumber" value={form.checkNumber} onChange={handleChange} placeholder="Çek No" className={input('md')} />
            <input name="drawer" value={form.drawer} onChange={handleChange} placeholder="Düzenleyen" className={input('md')} />
            <input name="bank" value={form.bank} onChange={handleChange} placeholder="Banka" className={input('md')} />
            <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Tutar" className={input('md')} />
            <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className={input('md')} />
          </div>
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notlar" rows={4} className={input('md')} />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className={button('md', 'ghost')}>Kapat</button>
            <button type="submit" disabled={saving} className={button('md', 'primary')}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
