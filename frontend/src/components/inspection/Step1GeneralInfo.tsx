import { useEffect, useState } from 'react';
import { Package, MapPin } from 'lucide-react';
import type { CreateInspectionDto } from '../../types/inspection';
import api from '../../services/api';

interface Step1Props {
  data: Partial<CreateInspectionDto>;
  onChange: (data: Partial<CreateInspectionDto>) => void;
}

export default function Step1GeneralInfo({ data, onChange }: Step1Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, equipmentRes, usersRes] = await Promise.all([
        api.get('/orders'),
        api.get('/equipment'),
        api.get('/auth/users'), // Assuming you have users endpoint
      ]);

      setOrders(ordersRes.data);
      setEquipment(equipmentRes.data);
      setInspectors(usersRes.data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      // If users endpoint doesn't exist, create mock data
      setInspectors([
        { id: 1, name: 'Admin Kullanıcı', email: 'admin@canary.com' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === parseInt(orderId));
    setSelectedOrder(order);
    
    if (order) {
      onChange({
        orderId: order.id,
        customerId: order.customerId,
        equipmentId: order.items?.[0]?.equipmentId, // Auto-select first equipment
      });
    }
  };

  const handleChange = (field: keyof CreateInspectionDto, value: any) => {
    onChange({ [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Genel Bilgiler</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Kontrol işleminin temel bilgilerini girin
        </p>
      </div>

      {/* Inspection Type */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Kontrol Tipi <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleChange('inspectionType', 'CHECKOUT')}
            className={`p-4 border-2 rounded-xl transition-all ${
              data.inspectionType === 'CHECKOUT'
                ? 'border-blue-600 bg-blue-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="text-center">
              <Package className="mx-auto mb-2 text-blue-600" size={24} />
              <p className="font-semibold text-neutral-900">Teslim Alış</p>
              <p className="text-xs text-neutral-600 mt-1">
                Müşteriye ekipman teslim edilirken yapılır
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange('inspectionType', 'CHECKIN')}
            className={`p-4 border-2 rounded-xl transition-all ${
              data.inspectionType === 'CHECKIN'
                ? 'border-purple-600 bg-purple-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="text-center">
              <Package className="mx-auto mb-2 text-purple-600" size={24} />
              <p className="font-semibold text-neutral-900">Teslim Ediş</p>
              <p className="text-xs text-neutral-600 mt-1">
                Müşteriden ekipman geri alınırken yapılır
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Order Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Sipariş <span className="text-red-500">*</span>
        </label>
        <select
          value={data.orderId || ''}
          onChange={(e) => handleOrderChange(e.target.value)}
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Sipariş seçin...</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              Sipariş #{order.id} - {order.customer?.name || 'Müşteri'} - {order.status}
            </option>
          ))}
        </select>
        {selectedOrder && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Müşteri:</strong> {selectedOrder.customer?.name}
            </p>
            <p className="text-sm text-blue-900">
              <strong>Tarih:</strong> {new Date(selectedOrder.startDate).toLocaleDateString('tr-TR')} - {new Date(selectedOrder.endDate).toLocaleDateString('tr-TR')}
            </p>
          </div>
        )}
      </div>

      {/* Equipment Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Ekipman <span className="text-red-500">*</span>
        </label>
        <select
          value={data.equipmentId || ''}
          onChange={(e) => handleChange('equipmentId', parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Ekipman seçin...</option>
          {equipment.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name} - {eq.serialNumber} ({eq.status})
            </option>
          ))}
        </select>
      </div>

      {/* Inspector Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Kontrol Eden <span className="text-red-500">*</span>
        </label>
        <select
          value={data.inspectorId || ''}
          onChange={(e) => handleChange('inspectorId', parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Kontrol eden kişiyi seçin...</option>
          {inspectors.map((inspector) => (
            <option key={inspector.id} value={inspector.id}>
              {inspector.name} - {inspector.email}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          <MapPin className="inline mr-1" size={16} />
          Konum
        </label>
        <input
          type="text"
          value={data.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Örn: İstanbul Merkez Depo, Ankara Şube..."
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-neutral-500 mt-1">
          Kontrolün yapıldığı fiziksel konum (opsiyonel)
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Notlar
        </label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Genel notlar, özel durumlar..."
          rows={4}
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Validation Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>ℹ️ Dikkat:</strong> Yıldızlı (*) alanlar zorunludur. İleri geçmeden önce lütfen tüm gerekli alanları doldurun.
        </p>
      </div>
    </div>
  );
}
