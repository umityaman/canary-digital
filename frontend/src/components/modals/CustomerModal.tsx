import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomerFormData) => Promise<void>;
  customer?: CustomerFormData | null;
  mode: 'create' | 'edit';
}

export interface CustomerFormData {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  taxNumber?: string;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  customer, 
  mode 
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    taxNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer && mode === 'edit') {
      setFormData(customer);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        taxNumber: ''
      });
    }
  }, [customer, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Müşteri adı zorunludur');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'create' ? 'Yeni Müşteri Ekle' : 'Müşteri Düzenle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-neutral-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Müşteri Adı */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Müşteri Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="Ahmet Yılmaz"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="ornek@email.com"
              />
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="+90 555 123 45 67"
              />
            </div>

            {/* Şirket */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Şirket Adı
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="ABC Ltd. Şti."
              />
            </div>

            {/* Vergi No */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Vergi No
              </label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="1234567890"
              />
            </div>

            {/* Adres */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Adres
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="Tam adres..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : mode === 'create' ? 'Ekle' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
