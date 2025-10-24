import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useCustomerStore } from '../stores/customerStore';
import { CustomerFormData } from '../components/modals/CustomerModal';

const CustomerCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createCustomer } = useCustomerStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    taxNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createCustomer(formData);
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Müşteri oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Müşteri Ekle</h1>
            <p className="text-sm text-gray-500 mt-1">Yeni müşteri bilgilerini girin</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={18} />
            İptal
          </button>
          <button
            type="submit"
            form="customer-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form id="customer-form" onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Ahmet Yılmaz"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-posta <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="ahmet@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="+90 555 123 4567"
            />
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Şirket
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Yılmaz Ltd. Şti."
            />
          </div>

          {/* Tax Number */}
          <div>
            <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Vergi Numarası
            </label>
            <input
              type="text"
              id="taxNumber"
              name="taxNumber"
              value={formData.taxNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="1234567890"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Adres
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Tam adres..."
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerCreate;
