import React, { useState, useEffect } from 'react';
import { X, Save, User, Building2, Phone, Mail, MapPin, CreditCard, FileText } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface AccountCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountCard?: any;
}

export default function AccountCardModal({ isOpen, onClose, onSuccess, accountCard }: AccountCardModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'bank' | 'other'>('general');
  
  const [formData, setFormData] = useState({
    // Genel Bilgiler
    code: '',
    name: '',
    type: 'customer' as 'customer' | 'supplier' | 'both',
    taxNumber: '',
    taxOffice: '',
    creditLimit: '',
    paymentTerm: '',
    
    // İletişim Bilgileri
    email: '',
    phone: '',
    mobile: '',
    fax: '',
    website: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    country: 'Türkiye',
    
    // İlgili Kişi
    contactPerson: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    
    // Banka Bilgileri
    iban: '',
    bankName: '',
    bankBranch: '',
    accountHolder: '',
    
    // Diğer
    notes: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (accountCard) {
      setFormData({
        code: accountCard.code || '',
        name: accountCard.name || '',
        type: accountCard.type || 'customer',
        taxNumber: accountCard.taxNumber || '',
        taxOffice: accountCard.taxOffice || '',
        creditLimit: accountCard.creditLimit?.toString() || '',
        paymentTerm: accountCard.paymentTerm?.toString() || '',
        email: accountCard.email || '',
        phone: accountCard.phone || '',
        mobile: accountCard.mobile || '',
        fax: accountCard.fax || '',
        website: accountCard.website || '',
        address: accountCard.address || '',
        city: accountCard.city || '',
        district: accountCard.district || '',
        postalCode: accountCard.postalCode || '',
        country: accountCard.country || 'Türkiye',
        contactPerson: accountCard.contactPerson || '',
        contactTitle: accountCard.contactTitle || '',
        contactEmail: accountCard.contactEmail || '',
        contactPhone: accountCard.contactPhone || '',
        iban: accountCard.iban || '',
        bankName: accountCard.bankName || '',
        bankBranch: accountCard.bankBranch || '',
        accountHolder: accountCard.accountHolder || '',
        notes: accountCard.notes || '',
        isActive: accountCard.isActive ?? true,
      });
    } else {
      // Reset form for new card
      setFormData({
        code: '',
        name: '',
        type: 'customer',
        taxNumber: '',
        taxOffice: '',
        creditLimit: '',
        paymentTerm: '',
        email: '',
        phone: '',
        mobile: '',
        fax: '',
        website: '',
        address: '',
        city: '',
        district: '',
        postalCode: '',
        country: 'Türkiye',
        contactPerson: '',
        contactTitle: '',
        contactEmail: '',
        contactPhone: '',
        iban: '',
        bankName: '',
        bankBranch: '',
        accountHolder: '',
        notes: '',
        isActive: true,
      });
    }
    setErrors({});
    setActiveTab('general');
  }, [accountCard, isOpen]);

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Cari adı zorunludur';
    }

    if (!formData.type) {
      newErrors.type = 'Cari tipi zorunludur';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Geçerli bir e-posta adresi giriniz';
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
      const submitData = {
        ...formData,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
        paymentTerm: formData.paymentTerm ? parseInt(formData.paymentTerm) : null,
      };

      if (accountCard) {
        await api.put(`/account-cards/${accountCard.id}`, submitData);
      } else {
        await api.post('/account-cards', submitData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Account card save error:', error);
      alert(error.response?.data?.message || 'Cari hesap kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const typeLabels = {
    customer: 'Müşteri',
    supplier: 'Tedarikçi',
    both: 'Her İkisi',
  };

  const typeColors = {
    customer: 'bg-blue-100 text-blue-800 border-blue-200',
    supplier: 'bg-orange-100 text-orange-800 border-orange-200',
    both: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {accountCard ? 'Cari Hesap Düzenle' : 'Yeni Cari Hesap'}
              </h2>
              {accountCard && (
                <p className="text-sm text-gray-500">
                  {accountCard.code} • Bakiye: {accountCard.balance?.toFixed(2)} TL
                </p>
              )}
              {!accountCard && (
                <p className="text-sm text-gray-500">
                  Kod otomatik oluşturulacak ({formData.type === 'customer' ? 'M-' : formData.type === 'supplier' ? 'T-' : 'C-'}XXXXX)
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Genel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'contact'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Phone className="w-4 h-4 inline mr-2" />
            İletişim
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'bank'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Banka Bilgileri
          </button>
          <button
            onClick={() => setActiveTab('other')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'other'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Diğer
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Tipi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['customer', 'supplier', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`p-3 rounded-lg border-2 font-medium transition-all ${
                        formData.type === type
                          ? typeColors[type] + ' shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {typeLabels[type]}
                    </button>
                  ))}
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Cari hesap adı"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tax Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vergi Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="XXXXXXXXXX"
                  />
                </div>

                {/* Tax Office */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vergi Dairesi
                  </label>
                  <input
                    type="text"
                    value={formData.taxOffice}
                    onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Vergi dairesi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Credit Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kredi Limiti (TL)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Payment Term */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ödeme Vadesi (Gün)
                  </label>
                  <input
                    type="number"
                    value={formData.paymentTerm}
                    onChange={(e) => setFormData({ ...formData, paymentTerm: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="ornek@firma.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0212 XXX XX XX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cep Telefonu
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="05XX XXX XX XX"
                  />
                </div>

                {/* Fax */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faks
                  </label>
                  <input
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0212 XXX XX XX"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.ornek.com"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Açık adres"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="İstanbul"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İlçe
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Beşiktaş"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posta Kodu
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="34XXX"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ülke
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Türkiye"
                  />
                </div>
              </div>

              {/* Contact Person Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">İlgili Kişi</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="İlgili kişi adı"
                    />
                  </div>

                  {/* Contact Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ünvan
                    </label>
                    <input
                      type="text"
                      value={formData.contactTitle}
                      onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Satış Müdürü"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* Contact Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.contactEmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="ilgili@firma.com"
                    />
                    {errors.contactEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                    )}
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bank Tab */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              {/* IBAN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IBAN
                </label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banka Adı
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Banka adı"
                  />
                </div>

                {/* Bank Branch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şube
                  </label>
                  <input
                    type="text"
                    value={formData.bankBranch}
                    onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Şube adı"
                  />
                </div>
              </div>

              {/* Account Holder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hesap Sahibi
                </label>
                <input
                  type="text"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hesap sahibi adı"
                />
              </div>
            </div>
          )}

          {/* Other Tab */}
          {activeTab === 'other' && (
            <div className="space-y-4">
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cari hesap hakkında notlar..."
                />
              </div>
            </div>
          )}
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
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
