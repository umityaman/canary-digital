import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Package, DollarSign } from 'lucide-react';
import { useCustomerStore } from '../../stores/customerStore';
import { useEquipmentStore } from '../../stores/equipmentStore';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OrderFormData) => Promise<void>;
  order?: OrderFormData | null;
  mode: 'create' | 'edit';
}

export interface OrderFormData {
  id?: number;
  customerId: number;
  equipmentId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status?: string;
  notes?: string;
}

const OrderModal: React.FC<OrderModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  order, 
  mode 
}) => {
  const { customers, fetchCustomers } = useCustomerStore();
  const { equipment, fetchEquipment } = useEquipmentStore();
  
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: 0,
    equipmentId: 0,
    startDate: '',
    endDate: '',
    totalPrice: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchEquipment();
    }
  }, [isOpen]);

  useEffect(() => {
    if (order && mode === 'edit') {
      setFormData(order);
    } else {
      setFormData({
        customerId: 0,
        equipmentId: 0,
        startDate: '',
        endDate: '',
        totalPrice: 0,
        notes: ''
      });
    }
  }, [order, mode, isOpen]);

  const calculatePrice = () => {
    const selected = equipment.find(e => e.id === Number(formData.equipmentId));
    if (!selected || !formData.startDate || !formData.endDate) {
      return 0;
    }
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const dailyRate = (selected as any)?.dailyRate || 0;
    return days * dailyRate;
  };

  useEffect(() => {
    if (formData.equipmentId && formData.startDate && formData.endDate) {
      const price = calculatePrice();
      setFormData(prev => ({ ...prev, totalPrice: price }));
    }
  }, [formData.equipmentId, formData.startDate, formData.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.customerId) {
      setError('M��teri se�imi zorunludur');
      return;
    }
    if (!formData.equipmentId) {
      setError('Ekipman se�imi zorunludur');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Ba�lang�� ve biti� tarihleri zorunludur');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bir hata olu�tu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'create' ? 'Yeni Sipari� Olu�tur' : 'Sipari� D�zenle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-neutral-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                <User size={16} />
                M��teri *
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="0">M��teri Se�in...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                <Package size={16} />
                Ekipman *
              </label>
              <select
                required
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="0">Ekipman Seçin...</option>
                {equipment.filter(e => e.status === 'AVAILABLE').map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {(item as any)?.dailyRate || 0}₺/gün
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                <Calendar size={16} />
                Ba�lang�� Tarihi *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                <Calendar size={16} />
                Biti� Tarihi *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-700">
                <DollarSign size={20} />
                <span className="font-medium">Toplam Tutar:</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">
                {formData.totalPrice.toLocaleString('tr-TR')} ?
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="�zel notlar, talepler vb."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              disabled={loading}
            >
              �ptal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : mode === 'create' ? 'Sipari� Olu�tur' : 'G�ncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;

