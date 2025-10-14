import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  taxNumber?: string;
  category?: string;
  rating?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  onSave: (data: SupplierFormData) => Promise<void>;
}

export interface SupplierFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  category?: string;
  website?: string;
  taxNumber?: string;
  notes?: string;
  isActive: boolean;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, supplier, onSave }) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    category: '',
    website: '',
    taxNumber: '',
    notes: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        contactPerson: supplier.contactPerson || '',
        category: supplier.category || '',
        website: supplier.website || '',
        taxNumber: supplier.taxNumber || '',
        notes: supplier.notes || '',
        isActive: supplier.isActive
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        category: '',
        website: '',
        taxNumber: '',
        notes: '',
        isActive: true
      });
    }
    setErrors({});
  }, [supplier, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tedarikçi adı zorunludur';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website http:// veya https:// ile başlamalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.error || 'Bir hata oluştu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-neutral-900">
            {supplier ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} className="text-neutral-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900">Temel Bilgiler</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Tedarikçi Adı *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-neutral-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900`}
                  placeholder="Örn: ABC Teknoloji Ltd."
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                  Kategori
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">Seçiniz</option>
                  <option value="Kamera">Kamera</option>
                  <option value="Lens">Lens</option>
                  <option value="Aydınlatma">Aydınlatma</option>
                  <option value="Ses">Ses</option>
                  <option value="Aksesuar">Aksesuar</option>
                  <option value="Tripod">Tripod</option>
                  <option value="Gimbal">Gimbal</option>
                  <option value="Drone">Drone</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-neutral-700 mb-2">
                  İlgili Kişi
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="Örn: Ahmet Yılmaz"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900">İletişim Bilgileri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-neutral-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900`}
                  placeholder="ornek@firma.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="0555 123 45 67"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-neutral-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.website ? 'border-red-500' : 'border-neutral-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900`}
                  placeholder="https://www.firma.com"
                />
                {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
              </div>

              <div>
                <label htmlFor="taxNumber" className="block text-sm font-medium text-neutral-700 mb-2">
                  Vergi Numarası
                </label>
                <input
                  type="text"
                  id="taxNumber"
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="1234567890"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-2">
                  Adres
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="Firma adresi..."
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900">Ek Bilgiler</h3>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-2">
                Notlar
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="Tedarikçi hakkında notlar..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-neutral-700">
                Aktif tedarikçi
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : supplier ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
