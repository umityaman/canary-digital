import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Calendar } from 'lucide-react';
import api from '../../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountCardId: number;
  accountCardName: string;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  accountCardId,
  accountCardName,
}: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'debit' as 'debit' | 'credit',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '',
    reference: '',
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        type: 'debit',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        description: '',
        reference: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: any = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Geçerli bir tutar giriniz';
    }

    if (!formData.date) {
      newErrors.date = 'Tarih zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await api.post(`/account-cards/${accountCardId}/transactions`, {
        type: formData.type,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        description: formData.description || null,
        reference: formData.reference || null,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Add transaction error:', error);
      alert(error.response?.data?.message || 'İşlem eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manuel İşlem Ekle</h2>
              <p className="text-sm text-gray-500">{accountCardName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İşlem Tipi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'debit' })}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    formData.type === 'debit'
                      ? 'bg-red-50 border-red-300 text-red-800 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-lg">Borç</span>
                  </div>
                  <p className="text-xs text-gray-500">Müşteri bize borçlu</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'credit' })}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    formData.type === 'credit'
                      ? 'bg-green-50 border-green-300 text-green-800 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-lg">Alacak</span>
                  </div>
                  <p className="text-xs text-gray-500">Biz tedarikçiye borçlu</p>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tutar (TL) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  TL
                </div>
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İşlem Tarihi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vade Tarihi
                  <span className="text-gray-400 text-xs ml-1">(Opsiyonel)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min={formData.date}
                  />
                </div>
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referans
                <span className="text-gray-400 text-xs ml-1">(Opsiyonel)</span>
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Örn: Fatura No, Çek No, vb."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
                <span className="text-gray-400 text-xs ml-1">(Opsiyonel)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="İşlem hakkında notlar..."
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Özet</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">İşlem Tipi:</span>
                  <span
                    className={`text-sm font-semibold ${
                      formData.type === 'debit' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {formData.type === 'debit' ? 'Borç (+)' : 'Alacak (-)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tutar:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formData.amount ? parseFloat(formData.amount).toFixed(2) : '0.00'} TL
                  </span>
                </div>
                {formData.dueDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vade:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(formData.dueDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white transition-all flex items-center gap-2 disabled:opacity-50 ${
              formData.type === 'debit'
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                İşlemi Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
