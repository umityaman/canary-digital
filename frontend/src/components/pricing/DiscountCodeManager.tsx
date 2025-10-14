import React, { useState, useEffect } from 'react';
import { pricingAPI } from '../../services/api';

interface DiscountCode {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY';
  discountValue: number;
  appliesTo: 'ALL' | 'CATEGORY' | 'SPECIFIC_ITEMS';
  categoryFilter?: string;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUsage?: number;
  maxUsagePerUser: number;
  currentUsage: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

const DiscountCodeManager: React.FC = () => {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [formData, setFormData] = useState<Partial<DiscountCode>>({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    appliesTo: 'ALL',
    maxUsagePerUser: 1,
    currentUsage: 0,
    isActive: true
  });

  useEffect(() => {
    loadCodes();
  }, [filter]);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === 'active') {
        params.isActive = true;
        params.validNow = true;
      }

      const result = await pricingAPI.getDiscounts(params);
      if (result.success) {
        let filteredCodes = result.data;
        
        if (filter === 'expired') {
          const now = new Date();
          filteredCodes = result.data.filter((code: DiscountCode) => 
            new Date(code.validTo) < now
          );
        }

        setCodes(filteredCodes);
      }
    } catch (error) {
      console.error('Failed to load discount codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Generate code if empty
    if (!formData.code) {
      const randomCode = `CODE${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      formData.code = randomCode;
    }

    try {
      await pricingAPI.createDiscount(formData);
      setShowModal(false);
      resetForm();
      loadCodes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Kod oluşturulamadı');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      appliesTo: 'ALL',
      maxUsagePerUser: 1,
      currentUsage: 0,
      isActive: true
    });
  };

  const getUsageProgress = (code: DiscountCode) => {
    if (!code.maxUsage) return 0;
    return (code.currentUsage / code.maxUsage) * 100;
  };

  const isExpired = (code: DiscountCode) => {
    return new Date(code.validTo) < new Date();
  };

  const isNotStarted = (code: DiscountCode) => {
    return new Date(code.validFrom) > new Date();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Kod kopyalandı!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">İndirim Kodları</h2>
          <p className="text-sm text-gray-600 mt-1">Promosyon kodlarını yönetin</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kod
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tümü ({codes.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-md ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Aktif
        </button>
        <button
          onClick={() => setFilter('expired')}
          className={`px-4 py-2 rounded-md ${
            filter === 'expired'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Süresi Dolmuş
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-gray-600 mb-4">Henüz indirim kodu eklenmemiş</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            İlk Kodu Ekle
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {codes.map((code) => (
            <div
              key={code.id}
              className={`bg-white rounded-lg shadow p-5 border-l-4 ${
                isExpired(code)
                  ? 'border-gray-400 opacity-75'
                  : isNotStarted(code)
                  ? 'border-yellow-500'
                  : code.isActive
                  ? 'border-green-500'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <code className="text-2xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                        {code.code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Kopyala"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    {isExpired(code) && (
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                        Süresi Dolmuş
                      </span>
                    )}
                    {isNotStarted(code) && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Yakında Başlayacak
                      </span>
                    )}
                    {!isExpired(code) && !isNotStarted(code) && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        code.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {code.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{code.name}</h3>
                  {code.description && (
                    <p className="text-sm text-gray-600 mb-3">{code.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {/* Discount Value */}
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">İndirim</p>
                      <p className="font-bold text-green-600">
                        {code.discountType === 'PERCENTAGE' && `%${code.discountValue}`}
                        {code.discountType === 'FIXED_AMOUNT' && `${code.discountValue} TL`}
                        {code.discountType === 'FREE_DELIVERY' && 'Ücretsiz Teslimat'}
                      </p>
                    </div>

                    {/* Valid Period */}
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">Geçerlilik</p>
                      <p className="font-medium text-xs">
                        {new Date(code.validFrom).toLocaleDateString('tr-TR')}
                        <br />→{' '}
                        {new Date(code.validTo).toLocaleDateString('tr-TR')}
                      </p>
                    </div>

                    {/* Usage */}
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">Kullanım</p>
                      <p className="font-bold text-purple-600">
                        {code.currentUsage} / {code.maxUsage || '∞'}
                      </p>
                      {code.maxUsage && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full"
                            style={{ width: `${getUsageProgress(code)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Per User Limit */}
                    <div className="bg-orange-50 p-3 rounded">
                      <p className="text-xs text-gray-600 mb-1">Kullanıcı Başına</p>
                      <p className="font-bold text-orange-600">{code.maxUsagePerUser}x</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {code.minOrderAmount && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        Min. Sipariş: {code.minOrderAmount} TL
                      </span>
                    )}
                    {code.maxDiscount && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        Max. İndirim: {code.maxDiscount} TL
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {code.appliesTo === 'ALL' && 'Tüm Ürünler'}
                      {code.appliesTo === 'CATEGORY' && `Kategori: ${code.categoryFilter}`}
                      {code.appliesTo === 'SPECIFIC_ITEMS' && 'Belirli Ürünler'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Yeni İndirim Kodu</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kod (Boş bırakılırsa otomatik oluşturulur)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 uppercase"
                    placeholder="SUMMER2025"
                    maxLength={20}
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İsim *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Yaz Kampanyası"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Yaz aylarında tüm ürünlerde geçerli"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İndirim Tipi *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="PERCENTAGE">Yüzde (%)</option>
                      <option value="FIXED_AMOUNT">Sabit Tutar (TL)</option>
                      <option value="FREE_DELIVERY">Ücretsiz Teslimat</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.discountType === 'PERCENTAGE' ? 'İndirim (%)' : 'İndirim (TL)'} *
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Applies To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geçerli Olduğu Alan *
                  </label>
                  <select
                    value={formData.appliesTo}
                    onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value as any })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="ALL">Tüm Ürünler</option>
                    <option value="CATEGORY">Belirli Kategori</option>
                    <option value="SPECIFIC_ITEMS">Belirli Ürünler</option>
                  </select>
                </div>

                {/* Category Filter */}
                {formData.appliesTo === 'CATEGORY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <input
                      type="text"
                      value={formData.categoryFilter}
                      onChange={(e) => setFormData({ ...formData, categoryFilter: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Camera"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Min Order Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min. Sipariş Tutarı (TL)
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount || ''}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || undefined })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* Max Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max. İndirim Tutarı (TL)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount || ''}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || undefined })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Max Usage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Toplam Kullanım Limiti
                    </label>
                    <input
                      type="number"
                      value={formData.maxUsage || ''}
                      onChange={(e) => setFormData({ ...formData, maxUsage: parseInt(e.target.value) || undefined })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Sınırsız için boş bırakın"
                    />
                  </div>

                  {/* Max Usage Per User */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kullanıcı Başına Limit *
                    </label>
                    <input
                      type="number"
                      value={formData.maxUsagePerUser}
                      onChange={(e) => setFormData({ ...formData, maxUsagePerUser: parseInt(e.target.value) })}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlangıç Tarihi *
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bitiş Tarihi *
                    </label>
                    <input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Aktif
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Oluştur
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCodeManager;
