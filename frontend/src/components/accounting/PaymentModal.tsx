import React, { useState, useMemo, useCallback } from 'react';
import { X, CreditCard, DollarSign, Calendar, FileText } from 'lucide-react';
import { invoiceAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice: {
    id: number;
    invoiceNumber: string;
    grandTotal: number;
    paidAmount: number;
    remainingAmount: number;
  };
}

const paymentMethods = [
  { value: 'cash', label: 'Nakit', icon: DollarSign },
  { value: 'credit_card', label: 'Kredi Kartı', icon: CreditCard },
  { value: 'bank_transfer', label: 'Banka Havalesi', icon: FileText },
  { value: 'check', label: 'Çek', icon: FileText },
  { value: 'promissory_note', label: 'Senet', icon: FileText },
];

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoice,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: invoice.remainingAmount,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    transactionId: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.amount <= 0) {
      toast.error('Ödeme tutarı 0\'dan büyük olmalıdır');
      return;
    }

    if (formData.amount > invoice.remainingAmount) {
      toast.error('Ödeme tutarı kalan tutardan büyük olamaz');
      return;
    }

    if (!formData.paymentDate) {
      toast.error('Ödeme tarihi gerekli');
      return;
    }

    if (!formData.paymentMethod) {
      toast.error('Ödeme yöntemi seçiniz');
      return;
    }

    try {
      setLoading(true);

      await invoiceAPI.recordPayment(invoice.id, {
        amount: formData.amount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || undefined,
        notes: formData.notes || undefined,
      });

      toast.success('Ödeme kaydedildi');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      toast.error(error.response?.data?.message || 'Ödeme kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = useCallback((value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({ ...prev, amount: numValue }));
    } else if (value === '') {
      setFormData(prev => ({ ...prev, amount: 0 }));
    }
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  }, []);

  // Memoize calculations
  const paymentPreview = useMemo(() => {
    const newPaidAmount = invoice.paidAmount + formData.amount;
    const newRemainingAmount = invoice.grandTotal - newPaidAmount;
    const isFullPayment = newRemainingAmount <= 0;

    return {
      newPaidAmount,
      newRemainingAmount: Math.max(0, newRemainingAmount),
      isFullPayment,
    };
  }, [invoice.paidAmount, invoice.grandTotal, formData.amount]);

  const selectedMethod = useMemo(
    () => paymentMethods.find((m) => m.value === formData.paymentMethod),
    [formData.paymentMethod]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ödeme Kaydet</h2>
              <p className="text-sm text-gray-500">Fatura #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Ödeme Özeti</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-700 mb-1">Toplam Tutar</p>
                <p className="font-bold text-blue-900">{formatCurrency(invoice.grandTotal)}</p>
              </div>
              <div>
                <p className="text-blue-700 mb-1">Ödenen</p>
                <p className="font-bold text-green-600">{formatCurrency(invoice.paidAmount)}</p>
              </div>
              <div>
                <p className="text-blue-700 mb-1">Kalan</p>
                <p className="font-bold text-red-600">
                  {formatCurrency(invoice.remainingAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ödeme Tutarı <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max={invoice.remainingAmount}
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                placeholder="0.00"
                required
              />
              <DollarSign
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, amount: invoice.remainingAmount / 2 })
                }
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Yarısı
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, amount: invoice.remainingAmount })
                }
                className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
              >
                Tamamı
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödeme Tarihi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentDate: e.target.value })
                  }
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödeme Yöntemi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  required
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                {selectedMethod && (
                  <selectedMethod.icon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction ID (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İşlem / Referans Numarası (İsteğe bağlı)
            </label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={(e) =>
                setFormData({ ...formData, transactionId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: TRX123456, Çek No: 789456"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notlar (İsteğe bağlı)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ödeme hakkında ek notlar..."
            />
          </div>

          {/* Payment Preview */}
          {formData.amount > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Ödeme Sonrası</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Toplam Ödenen</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(paymentPreview.newPaidAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Kalan Borç</p>
                  <p className="font-semibold text-red-600">
                    {formatCurrency(paymentPreview.newRemainingAmount)}
                  </p>
                </div>
              </div>
              {paymentPreview.isFullPayment && (
                <div className="mt-3 flex items-center gap-2 text-green-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">Fatura tamamen ödenecek</span>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || formData.amount <= 0}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard size={18} />
            {loading ? 'Kaydediliyor...' : 'Ödemeyi Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
