import React, { useState, useEffect } from 'react';
import { pricingAPI } from '../../services/api';
import api from '../../services/api';

interface Equipment {
  id: number;
  name: string;
  category: string;
  dailyPrice: number;
  imageUrl?: string;
  status: string;
}

interface Bundle {
  id: number;
  name: string;
  description?: string;
  category: string;
  bundlePrice: number;
  isActive: boolean;
  bundleItems: Array<{
    equipment: Equipment;
    quantity: number;
  }>;
  savings?: {
    originalPrice: number;
    savings: number;
    savingsPercent: number;
  };
}

interface BundleItem {
  equipmentId: number;
  quantity: number;
}

const BundleBuilder: React.FC = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<BundleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    bundlePrice: 0,
    isActive: true
  });

  useEffect(() => {
    loadBundles();
    loadEquipment();
  }, []);

  const loadBundles = async () => {
    setLoading(true);
    try {
      const result = await pricingAPI.getBundles({ isActive: undefined });
      if (result.success) {
        // Load savings for each bundle
        const bundlesWithSavings = await Promise.all(
          result.data.map(async (bundle: Bundle) => {
            try {
              const savingsResult = await pricingAPI.getBundle(bundle.id);
              return {
                ...bundle,
                savings: savingsResult.data.savings
              };
            } catch {
              return bundle;
            }
          })
        );
        setBundles(bundlesWithSavings);
      }
    } catch (error) {
      console.error('Failed to load bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEquipment = async () => {
    try {
      const result = await api.get('/equipment');
      if (result.data.success) {
        setEquipmentList(result.data.data || result.data.equipment);
      }
    } catch (error) {
      console.error('Failed to load equipment:', error);
    }
  };

  const calculateTotalPrice = () => {
    return selectedEquipment.reduce((sum, item) => {
      const equipment = equipmentList.find(e => e.id === item.equipmentId);
      return sum + (equipment?.dailyPrice || 0) * item.quantity;
    }, 0);
  };

  const addEquipmentToBundle = (equipmentId: number) => {
    const existing = selectedEquipment.find(item => item.equipmentId === equipmentId);
    if (existing) {
      setSelectedEquipment(
        selectedEquipment.map(item =>
          item.equipmentId === equipmentId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedEquipment([...selectedEquipment, { equipmentId, quantity: 1 }]);
    }
  };

  const removeEquipmentFromBundle = (equipmentId: number) => {
    setSelectedEquipment(selectedEquipment.filter(item => item.equipmentId !== equipmentId));
  };

  const updateQuantity = (equipmentId: number, quantity: number) => {
    if (quantity < 1) {
      removeEquipmentFromBundle(equipmentId);
      return;
    }
    setSelectedEquipment(
      selectedEquipment.map(item =>
        item.equipmentId === equipmentId ? { ...item, quantity } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEquipment.length < 2) {
      alert('En az 2 ekipman seçmelisiniz');
      return;
    }

    try {
      await pricingAPI.createBundle({
        ...formData,
        items: selectedEquipment
      });

      setShowModal(false);
      resetForm();
      loadBundles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Paket oluşturulamadı');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu paketi silmek istediğinizden emin misiniz?')) return;

    try {
      await pricingAPI.deleteBundle(id);
      loadBundles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Silme başarısız');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      bundlePrice: 0,
      isActive: true
    });
    setSelectedEquipment([]);
    setSearchTerm('');
  };

  const filteredEquipment = equipmentList.filter(equipment =>
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPrice = calculateTotalPrice();
  const suggestedDiscount = totalPrice * 0.15; // 15% discount suggestion
  const suggestedPrice = totalPrice - suggestedDiscount;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ekipman Paketleri</h2>
          <p className="text-sm text-neutral-600 mt-1">Ekipmanları paketleyerek satın</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Yeni Paket
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-neutral-600">Yükleniyor...</p>
        </div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-neutral-600 mb-4">Henüz paket oluşturulmamış</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800"
          >
            İlk Paketi Oluştur
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-neutral-300"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800">{bundle.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    bundle.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-neutral-100 text-gray-800'
                  }`}>
                    {bundle.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                {bundle.description && (
                  <p className="text-sm text-neutral-600 mb-3">{bundle.description}</p>
                )}

                <div className="mb-4">
                  <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                    {bundle.category}
                  </span>
                </div>

                {/* Bundle Items */}
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold text-neutral-700 mb-2">Paket İçeriği:</p>
                  {bundle.bundleItems.map((item, index) => (
                    <div key={index} className="flex items-center text-sm bg-neutral-50 p-2 rounded">
                      <span className="flex-1">{item.equipment.name}</span>
                      <span className="text-neutral-600">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border-t pt-4">
                  {bundle.savings && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-neutral-600 mb-1">
                        <span>Bireysel Fiyat:</span>
                        <span className="line-through">{bundle.savings.originalPrice.toFixed(2)} TL</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-green-600 mb-2">
                        <span>Tasarruf:</span>
                        <span>-{bundle.savings.savings.toFixed(2)} TL (%{bundle.savings.savingsPercent.toFixed(0)})</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-neutral-900">
                      {bundle.bundlePrice.toFixed(2)} TL/gün
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleDelete(bundle.id)}
                    className="flex-1 px-3 py-2 text-sm bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200"
                  >
                    Sil
                  </button>
                  <button
                    className="flex-1 px-3 py-2 text-sm bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Bundle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Yeni Paket Oluştur</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bundle Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Paket Adı *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Profesyonel Fotoğraf Paketi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Kategori *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Photography"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Profesyonel fotoğraf çekimi için gereken tüm ekipmanlar"
                  />
                </div>

                {/* Equipment Selection */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3">Paket İçeriği</h4>
                  
                  {/* Search */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Ekipman ara..."
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-500 focus:border-neutral-500"
                    />
                  </div>

                  {/* Selected Equipment */}
                  {selectedEquipment.length > 0 && (
                    <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-700 mb-3">
                        Seçili Ekipmanlar ({selectedEquipment.length})
                      </p>
                      <div className="space-y-2">
                        {selectedEquipment.map((item) => {
                          const equipment = equipmentList.find(e => e.id === item.equipmentId);
                          if (!equipment) return null;
                          return (
                            <div key={item.equipmentId} className="flex items-center justify-between bg-white p-3 rounded">
                              <div className="flex-1">
                                <p className="font-medium">{equipment.name}</p>
                                <p className="text-sm text-neutral-600">{equipment.dailyPrice} TL/gün</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.equipmentId, item.quantity - 1)}
                                    className="w-8 h-8 bg-neutral-200 rounded hover:bg-gray-300"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.equipmentId, item.quantity + 1)}
                                    className="w-8 h-8 bg-neutral-200 rounded hover:bg-gray-300"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeEquipmentFromBundle(item.equipmentId)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available Equipment */}
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {filteredEquipment.map((equipment) => {
                      const isSelected = selectedEquipment.some(item => item.equipmentId === equipment.id);
                      return (
                        <div
                          key={equipment.id}
                          className={`flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-neutral-50 ${
                            isSelected ? 'bg-neutral-50' : ''
                          }`}
                        >
                          <div>
                            <p className="font-medium">{equipment.name}</p>
                            <p className="text-sm text-neutral-600">{equipment.category} • {equipment.dailyPrice} TL/gün</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addEquipmentToBundle(equipment.id)}
                            disabled={isSelected}
                            className={`px-3 py-1 text-sm rounded ${
                              isSelected
                                ? 'bg-neutral-200 text-gray-500 cursor-not-allowed'
                                : 'bg-neutral-900 text-white hover:bg-neutral-800'
                            }`}
                          >
                            {isSelected ? 'Eklendi' : 'Ekle'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing */}
                {selectedEquipment.length >= 2 && (
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-semibold mb-3">Fiyatlandırma</h4>
                    
                    <div className="bg-neutral-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-700">Toplam Bireysel Fiyat:</span>
                        <span className="font-bold">{totalPrice.toFixed(2)} TL/gün</span>
                      </div>
                      <div className="flex justify-between text-sm text-neutral-700">
                        <span>Önerilen İndirim (%15):</span>
                        <span className="font-bold">-{suggestedDiscount.toFixed(2)} TL</span>
                      </div>
                      <div className="flex justify-between text-sm text-neutral-900 mt-2 pt-2 border-t border-neutral-200">
                        <span>Önerilen Paket Fiyatı:</span>
                        <span className="font-bold">{suggestedPrice.toFixed(2)} TL/gün</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Paket Fiyatı (TL/gün) *
                      </label>
                      <input
                        type="number"
                        value={formData.bundlePrice}
                        onChange={(e) => setFormData({ ...formData, bundlePrice: parseFloat(e.target.value) })}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        placeholder={suggestedPrice.toFixed(2)}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, bundlePrice: suggestedPrice })}
                        className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                      >
                        Önerilen fiyatı kullan
                      </button>
                    </div>

                    {formData.bundlePrice > 0 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-700">
                          ✓ Müşteri tasarrufu: {(totalPrice - formData.bundlePrice).toFixed(2)} TL
                          ({(((totalPrice - formData.bundlePrice) / totalPrice) * 100).toFixed(0)}%)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-neutral-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-neutral-700">
                    Paketi aktif et
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
                    className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={selectedEquipment.length < 2}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Paketi Oluştur
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

export default BundleBuilder;
