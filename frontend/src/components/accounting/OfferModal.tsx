import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText } from 'lucide-react';
import { offerAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

interface OfferItem {
  equipmentId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  days: number;
  discountPercentage: number;
  subtotal: number;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
}

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingOffer?: any | null;
}

const OfferModal: React.FC<OfferModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingOffer 
}) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: 0,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    offerNumber: '',
    offerDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vatRate: 20,
    notes: '',
  });

  const [items, setItems] = useState<OfferItem[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      days: 1,
      discountPercentage: 0,
      subtotal: 0,
    },
  ]);

  useEffect(() => {
    if (editingOffer) {
      loadOfferData(editingOffer);
    }
  }, [editingOffer]);

  const loadOfferData = async (offer: any) => {
    setFormData({
      customerId: offer.customer?.id || 0,
      customerName: offer.customer?.name || '',
      customerEmail: offer.customer?.email || '',
      customerPhone: offer.customer?.phone || '',
      customerCompany: offer.customer?.company || '',
      offerNumber: offer.offerNumber || '',
      offerDate: offer.offerDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      validUntil: offer.validUntil?.split('T')[0] || new Date().toISOString().split('T')[0],
      vatRate: 20,
      notes: offer.notes || '',
    });

    // Load offer items from JSON
    if (offer.items && Array.isArray(offer.items)) {
      const offerItems = offer.items.map((item: any) => ({
        equipmentId: item.equipmentId,
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        days: item.days || 1,
        discountPercentage: item.discountPercentage || 0,
        subtotal: calculateItemSubtotal(
          item.quantity || 1,
          item.unitPrice || 0,
          item.days || 1,
          item.discountPercentage || 0
        ),
      }));
      setItems(offerItems);
    }
  };

  const calculateItemSubtotal = (
    quantity: number,
    unitPrice: number,
    days: number,
    discountPercentage: number
  ) => {
    const baseAmount = quantity * unitPrice * days;
    const discountAmount = baseAmount * (discountPercentage / 100);
    return baseAmount - discountAmount;
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        days: 1,
        discountPercentage: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error('En az bir kalem olmalı');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OfferItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate subtotal
    const item = updatedItems[index];
    item.subtotal = calculateItemSubtotal(
      item.quantity,
      item.unitPrice,
      item.days,
      item.discountPercentage
    );
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const vatAmount = subtotal * (formData.vatRate / 100);
    const grandTotal = subtotal + vatAmount;
    
    return { subtotal, vatAmount, grandTotal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerName.trim()) {
      toast.error('Müşteri adı gerekli');
      return;
    }

    if (!formData.customerEmail.trim()) {
      toast.error('Müşteri e-postası gerekli');
      return;
    }

    if (items.some((item) => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
      toast.error('Tüm kalem bilgilerini eksiksiz doldurun');
      return;
    }

    // Check valid until date is after offer date
    if (new Date(formData.validUntil) <= new Date(formData.offerDate)) {
      toast.error('Geçerlilik tarihi teklif tarihinden sonra olmalı');
      return;
    }

    try {
      setLoading(true);
      const totals = calculateTotals();

      const payload = {
        customerId: formData.customerId || null,
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          company: formData.customerCompany,
        },
        offerNumber: formData.offerNumber || undefined,
        offerDate: formData.offerDate,
        validUntil: formData.validUntil,
        items: items.map((item) => ({
          equipmentId: item.equipmentId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          days: item.days,
          discountPercentage: item.discountPercentage,
        })),
        totalAmount: totals.subtotal,
        vatAmount: totals.vatAmount,
        grandTotal: totals.grandTotal,
        notes: formData.notes,
      };

      if (editingOffer) {
        await offerAPI.update(editingOffer.id, payload);
        toast.success('Teklif güncellendi');
      } else {
        await offerAPI.create(payload);
        toast.success('Teklif oluşturuldu');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save offer:', error);
      toast.error(error.response?.data?.message || 'Teklif kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!editingOffer) return;

    if (!window.confirm('Bu teklifi faturaya dönüştürmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      await offerAPI.convertToInvoice(editingOffer.id);
      toast.success('Teklif faturaya dönüştürüldü');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to convert offer:', error);
      toast.error(error.response?.data?.message || 'Dönüştürme başarısız');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totals = calculateTotals();
  const canConvertToInvoice = editingOffer && (editingOffer.status === 'accepted' || editingOffer.status === 'sent');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingOffer ? 'Teklif Düzenle' : 'Yeni Teklif'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müşteri Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şirket
                </label>
                <input
                  type="text"
                  value={formData.customerCompany}
                  onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Offer Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Detayları</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teklif No (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Otomatik oluşturulacak"
                  value={formData.offerNumber}
                  onChange={(e) => setFormData({ ...formData, offerNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teklif Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.offerDate}
                  onChange={(e) => setFormData({ ...formData, offerDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geçerlilik Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KDV Oranı (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.vatRate}
                  onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Kalemler</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Kalem Ekle
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Açıklama</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Miktar</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Birim Fiyat</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Gün</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">İndirim %</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Toplam</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Ekipman/Hizmet açıklaması"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.days}
                          onChange={(e) => updateItem(index, 'days', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercentage}
                          onChange={(e) => updateItem(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 font-medium">
                        ₺{item.subtotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={items.length === 1}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mb-6 bg-gray-50 rounded-xl p-6">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ara Toplam:</span>
                <span className="font-medium">₺{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">KDV ({formData.vatRate}%):</span>
                <span className="font-medium">₺{totals.vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Genel Toplam:</span>
                <span className="text-blue-600">₺{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Teklif hakkında notlar..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div>
            {canConvertToInvoice && (
              <button
                type="button"
                onClick={handleConvertToInvoice}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FileText size={18} />
                Faturaya Dönüştür
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
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
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kaydediliyor...' : editingOffer ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;
