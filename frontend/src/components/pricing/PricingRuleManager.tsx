import React, { useState, useEffect } from 'react';
import { pricingAPI } from '../../services/api';

interface PricingRule {
  id: number;
  name: string;
  description?: string;
  equipmentId?: number;
  ruleType: 'DURATION' | 'QUANTITY' | 'SEASONAL' | 'CUSTOM';
  durationType?: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  minDuration?: number;
  maxDuration?: number;
  minQuantity?: number;
  maxQuantity?: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'SPECIAL_RATE';
  discountValue: number;
  startDate?: string;
  endDate?: string;
  priority: number;
  isActive: boolean;
}

const PricingRuleManager: React.FC = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [formData, setFormData] = useState<Partial<PricingRule>>({
    name: '',
    description: '',
    ruleType: 'DURATION',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    priority: 1,
    isActive: true
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      // Load all rules (you can add equipment filter)
      const result = await pricingAPI.getRules(0); // 0 = all rules
      if (result.success) {
        setRules(result.data);
      }
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRule) {
        await pricingAPI.updateRule(editingRule.id, formData);
      } else {
        await pricingAPI.createRule(formData);
      }

      setShowModal(false);
      setEditingRule(null);
      resetForm();
      loadRules();
    } catch (error: any) {
      alert(error.response?.data?.message || 'İşlem başarısız');
    }
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData(rule);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kuralı silmek istediğinizden emin misiniz?')) return;

    try {
      await pricingAPI.deleteRule(id);
      loadRules();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Silme başarısız');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ruleType: 'DURATION',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      priority: 1,
      isActive: true
    });
  };

  const getRuleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DURATION: 'Süre Bazlı',
      QUANTITY: 'Miktar Bazlı',
      SEASONAL: 'Mevsimsel',
      CUSTOM: 'Özel Kural'
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Fiyatlandırma Kuralları</h2>
        <button
          onClick={() => {
            resetForm();
            setEditingRule(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800"
        >
          + Yeni Kural
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Henüz fiyatlandırma kuralı eklenmemiş</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800"
          >
            İlk Kuralı Ekle
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                rule.isActive ? 'border-green-500' : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{rule.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rule.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-full">
                      {getRuleTypeLabel(rule.ruleType)}
                    </span>
                  </div>
                  
                  {rule.description && (
                    <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Discount Info */}
                    <div>
                      <span className="text-gray-600">İndirim: </span>
                      <span className="font-medium text-green-600">
                        {rule.discountType === 'PERCENTAGE' && `%${rule.discountValue}`}
                        {rule.discountType === 'FIXED_AMOUNT' && `${rule.discountValue} TL`}
                        {rule.discountType === 'SPECIAL_RATE' && `${rule.discountValue} TL (özel)`}
                      </span>
                    </div>

                    {/* Priority */}
                    <div>
                      <span className="text-gray-600">Öncelik: </span>
                      <span className="font-medium">{rule.priority}</span>
                    </div>

                    {/* Duration Info */}
                    {rule.ruleType === 'DURATION' && (
                      <>
                        <div>
                          <span className="text-gray-600">Minimum Süre: </span>
                          <span className="font-medium">{rule.minDuration} {rule.durationType?.toLowerCase()}</span>
                        </div>
                        {rule.maxDuration && (
                          <div>
                            <span className="text-gray-600">Maximum Süre: </span>
                            <span className="font-medium">{rule.maxDuration} {rule.durationType?.toLowerCase()}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Quantity Info */}
                    {rule.ruleType === 'QUANTITY' && (
                      <>
                        <div>
                          <span className="text-gray-600">Minimum Miktar: </span>
                          <span className="font-medium">{rule.minQuantity}</span>
                        </div>
                        {rule.maxQuantity && (
                          <div>
                            <span className="text-gray-600">Maximum Miktar: </span>
                            <span className="font-medium">{rule.maxQuantity}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Date Range */}
                    {rule.startDate && rule.endDate && (
                      <>
                        <div>
                          <span className="text-gray-600">Başlangıç: </span>
                          <span className="font-medium">
                            {new Date(rule.startDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bitiş: </span>
                          <span className="font-medium">
                            {new Date(rule.endDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingRule ? 'Kuralı Düzenle' : 'Yeni Kural Ekle'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kural Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Haftalık İndirim"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="7 gün ve üzeri kiralamalar için %10 indirim"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Rule Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kural Tipi *
                    </label>
                    <select
                      value={formData.ruleType}
                      onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as any })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="DURATION">Süre Bazlı</option>
                      <option value="QUANTITY">Miktar Bazlı</option>
                      <option value="SEASONAL">Mevsimsel</option>
                      <option value="CUSTOM">Özel Kural</option>
                    </select>
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İndirim Tipi *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PERCENTAGE">Yüzde (%)</option>
                      <option value="FIXED_AMOUNT">Sabit Tutar (TL)</option>
                      <option value="SPECIAL_RATE">Özel Fiyat</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İndirim Değeri *
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Öncelik
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Duration Fields */}
                {formData.ruleType === 'DURATION' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Süre Tipi
                      </label>
                      <select
                        value={formData.durationType}
                        onChange={(e) => setFormData({ ...formData, durationType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="HOURLY">Saatlik</option>
                        <option value="DAILY">Günlük</option>
                        <option value="WEEKLY">Haftalık</option>
                        <option value="MONTHLY">Aylık</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Süre
                      </label>
                      <input
                        type="number"
                        value={formData.minDuration || ''}
                        onChange={(e) => setFormData({ ...formData, minDuration: parseInt(e.target.value) })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Süre
                      </label>
                      <input
                        type="number"
                        value={formData.maxDuration || ''}
                        onChange={(e) => setFormData({ ...formData, maxDuration: parseInt(e.target.value) || undefined })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Quantity Fields */}
                {formData.ruleType === 'QUANTITY' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Miktar
                      </label>
                      <input
                        type="number"
                        value={formData.minQuantity || ''}
                        onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Miktar
                      </label>
                      <input
                        type="number"
                        value={formData.maxQuantity || ''}
                        onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || undefined })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlangıç Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                      setEditingRule(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800"
                  >
                    {editingRule ? 'Güncelle' : 'Oluştur'}
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

export default PricingRuleManager;
