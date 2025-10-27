import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeliveryNoteItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
  taxAmount: number;
}

interface Customer {
  id: number;
  name: string;
  taxId?: string;
}

interface DeliveryNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  deliveryNote?: any;
}

const DeliveryNoteModal: React.FC<DeliveryNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  deliveryNote
}) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [formData, setFormData] = useState({
    customerId: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'draft'
  });

  const [items, setItems] = useState<DeliveryNoteItem[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      taxRate: 20,
      taxAmount: 0
    }
  ]);

  // Müşterileri yükle
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  // Düzenleme modunda veriyi yükle
  useEffect(() => {
    if (deliveryNote) {
      setFormData({
        customerId: deliveryNote.customerId?.toString() || '',
        deliveryDate: deliveryNote.deliveryDate 
          ? new Date(deliveryNote.deliveryDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes: deliveryNote.notes || '',
        status: deliveryNote.status || 'draft'
      });

      if (deliveryNote.items && deliveryNote.items.length > 0) {
        setItems(deliveryNote.items.map((item: any) => ({
          productId: item.productId,
          description: item.description || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          total: item.total || 0,
          taxRate: item.taxRate || 20,
          taxAmount: item.taxAmount || 0
        })));
      }
    }
  }, [deliveryNote]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const calculateItemTotal = (item: DeliveryNoteItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = (subtotal * item.taxRate) / 100;
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  };

  const handleItemChange = (index: number, field: keyof DeliveryNoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Toplam hesapla
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
      const calc = calculateItemTotal(newItems[index]);
      newItems[index].taxAmount = calc.taxAmount;
      newItems[index].total = calc.total;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        taxRate: 20,
        taxAmount: 0
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error('En az bir ürün olmalıdır');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = subtotal + taxTotal;

    return { subtotal, taxTotal, grandTotal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      toast.error('Lütfen müşteri seçin');
      return;
    }

    if (items.length === 0 || items.every(item => !item.description)) {
      toast.error('Lütfen en az bir ürün ekleyin');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = deliveryNote
        ? `/api/delivery-notes/${deliveryNote.id}`
        : '/api/delivery-notes';
      
      const method = deliveryNote ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          customerId: parseInt(formData.customerId),
          items: items.filter(item => item.description) // Boş ürünleri filtrele
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(deliveryNote ? 'İrsaliye güncellendi' : 'İrsaliye oluşturuldu');
        onSave();
        onClose();
        resetForm();
      } else {
        toast.error(data.message || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Error saving delivery note:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'draft'
    });
    setItems([
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        taxRate: 20,
        taxAmount: 0
      }
    ]);
  };

  const { subtotal, taxTotal, grandTotal } = calculateTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Package className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">
              {deliveryNote ? 'İrsaliye Düzenle' : 'Yeni İrsaliye'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Müşteri ve Tarih */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Müşteri *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Müşteri Seçin</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.taxId ? `(${customer.taxId})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İrsaliye Tarihi *
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Durum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={deliveryNote?.status === 'invoiced'}
            >
              <option value="draft">Taslak</option>
              <option value="approved">Onaylandı</option>
              <option value="delivered">Teslim Edildi</option>
              {deliveryNote?.status === 'invoiced' && (
                <option value="invoiced">Faturaya Dönüştürüldü</option>
              )}
            </select>
          </div>

          {/* Ürünler Tablosu */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Ürünler *
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus size={16} />
                Ürün Ekle
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Açıklama
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                      Miktar
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                      Birim Fiyat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                      KDV %
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                      Toplam
                    </th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Ürün açıklaması"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {item.total.toFixed(2)} ₺
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
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

          {/* Toplam Özeti */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ara Toplam:</span>
              <span className="font-medium">{subtotal.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Toplam KDV:</span>
              <span className="font-medium">{taxTotal.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
              <span>Genel Toplam:</span>
              <span className="text-blue-600">{grandTotal.toFixed(2)} ₺</span>
            </div>
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="İrsaliye ile ilgili notlar..."
            />
          </div>

          {/* Faturaya Dönüştürülmüş Uyarısı */}
          {deliveryNote?.status === 'invoiced' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Bu irsaliye faturaya dönüştürülmüştür. Sadece notları düzenleyebilirsiniz.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : (deliveryNote ? 'Güncelle' : 'Oluştur')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryNoteModal;
