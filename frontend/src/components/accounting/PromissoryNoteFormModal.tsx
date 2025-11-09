import React, { useState, useEffect } from 'react';
import { promissoryAPI } from '../../services/api';
import { X } from 'lucide-react';
import { card, button, input, DESIGN_TOKENS, cx } from '../../styles/design-tokens';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initial?: any;
}

export default function PromissoryNoteFormModal({ open, onClose, onSaved, initial }: Props) {
  const [form, setForm] = useState<any>({
    noteNumber: '',
    type: 'received', // received (alınan) or issued (verilen)
    drawer: '', // Düzenleyen
    beneficiary: '', // Lehtar
    amount: 0,
    issueDate: '',
    dueDate: '',
    issuePlace: '',
    paymentPlace: '',
    status: 'pending',
    customerId: undefined,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) setForm({ ...form, ...initial });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s: any) => ({ ...s, [name]: name === 'amount' ? parseFloat(value || '0') : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (initial?.id) {
        await promissoryAPI.update(initial.id, form);
      } else {
        await promissoryAPI.create(form);
      }
      onSaved && onSaved();
      onClose();
    } catch (err) {
      console.error('Promissory note save error', err);
      alert('Kaydetme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className={cx(card('lg', 'none', 'default', 'xl'), 'w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl')}>
        <div className={cx('sticky top-0 bg-white border-b border-neutral-200', DESIGN_TOKENS?.spacing?.padding.md, 'flex items-center justify-between')}>
          <h3 className={`${DESIGN_TOKENS?.typography?.h1} ${DESIGN_TOKENS?.colors?.text.primary}`}>
            {initial?.id ? 'Senet Düzenle' : 'Yeni Senet'}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-neutral-100 rounded-lg transition-colors`}
          >
            <X className={`w-5 h-5 ${DESIGN_TOKENS?.colors?.text.secondary}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={cx(DESIGN_TOKENS?.spacing?.padding.md, 'space-y-6')}>
          {/* Senet Tipi */}
          <div>
            <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
              Senet Tipi <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className={input('md', 'default', undefined, 'md')}
            >
              <option value="received">Alınan Senet</option>
              <option value="issued">Verilen Senet</option>
            </select>
          </div>

          {/* Senet No */}
          <div>
            <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
              Senet No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="noteNumber"
              value={form.noteNumber}
              onChange={handleChange}
              placeholder="SN-2025-001"
              required
              className={input('md', 'default', undefined, 'md')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Düzenleyen */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                Düzenleyen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="drawer"
                value={form.drawer}
                onChange={handleChange}
                placeholder="Düzenleyen Adı"
                required
                className={input('md', 'default', undefined, 'md')}
              />
            </div>

            {/* Lehtar */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                Lehtar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="beneficiary"
                value={form.beneficiary}
                onChange={handleChange}
                placeholder="Lehtar Adı"
                required
                className={input('md', 'default', undefined, 'md')}
              />
            </div>
          </div>

          {/* Tutar */}
          <div>
            <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
              Tutar (TRY) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
              min="0"
              className={input('md', 'default', undefined, 'md')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Düzenleme Tarihi */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                Düzenleme Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="issueDate"
                value={form.issueDate}
                onChange={handleChange}
                required
                className={input('md', 'default', undefined, 'md')}
              />
            </div>

            {/* Vade Tarihi */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                Vade Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                required
                className={input('md', 'default', undefined, 'md')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Düzenleme Yeri */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                Düzenleme Yeri
              </label>
              <input
                type="text"
                name="issuePlace"
                value={form.issuePlace}
                onChange={handleChange}
                placeholder="İstanbul"
                className={input('md', 'default', undefined, 'md')}
              />
            </div>

            {/* Ödeme Yeri */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                Ödeme Yeri
              </label>
              <input
                type="text"
                name="paymentPlace"
                value={form.paymentPlace}
                onChange={handleChange}
                placeholder="İstanbul"
                className={input('md', 'default', undefined, 'md')}
              />
            </div>
          </div>

          {/* Durum */}
          <div>
            <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
              Durum
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={input('md', 'default', undefined, 'md')}
            >
              <option value="pending">Beklemede</option>
              <option value="paid">Ödendi</option>
              <option value="cancelled">İptal Edildi</option>
              <option value="returned">İade Edildi</option>
            </select>
          </div>

          {/* Notlar */}
          <div>
            <label className={`block ${DESIGN_TOKENS?.typography?.body.sm} font-medium ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
              Notlar
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Senet ile ilgili notlar..."
              rows={4}
              className={input('md', 'default', undefined, 'md')}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={button('md', 'outline', 'md')}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className={button('md', 'primary', 'md')}
            >
              {saving ? 'Kaydediliyor...' : initial?.id ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
