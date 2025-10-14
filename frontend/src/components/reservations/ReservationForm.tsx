import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Truck,
  Search,
} from 'lucide-react';
import { reservationAPI, equipmentAPI } from '../../services/api';

interface Equipment {
  id: number;
  name: string;
  code?: string;
  category?: string;
  dailyPrice?: number;
  status: string;
  quantity: number;
}

interface ReservationFormProps {
  companyId: number;
  onSuccess?: (reservation: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  companyId,
  onSuccess,
  onCancel,
  initialData,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availabilityChecking, setAvailabilityChecking] = useState(false);

  // Equipment selection
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<
    Array<{ equipmentId: number; equipment?: Equipment; quantity: number }>
  >([]);

  // Form data
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    startDate: '',
    endDate: '',
    pickupTime: '09:00',
    returnTime: '18:00',
    pickupLocation: '',
    returnLocation: '',
    deliveryRequired: false,
    deliveryAddress: '',
    deliveryFee: 0,
    discountCode: '',
    notes: '',
    specialRequests: '',
  });

  // Pricing
  const [pricing, setPricing] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const result = await equipmentAPI.getAll({ status: 'AVAILABLE' });
      setEquipmentList(result.data || []);
    } catch (error) {
      console.error('Failed to load equipment:', error);
    }
  };

  const addEquipmentItem = (equipment: Equipment) => {
    if (selectedItems.find((item) => item.equipmentId === equipment.id)) {
      return; // Already added
    }

    setSelectedItems([
      ...selectedItems,
      {
        equipmentId: equipment.id,
        equipment,
        quantity: 1,
      },
    ]);
    setSearchTerm('');
  };

  const removeEquipmentItem = (equipmentId: number) => {
    setSelectedItems(selectedItems.filter((item) => item.equipmentId !== equipmentId));
  };

  const updateQuantity = (equipmentId: number, quantity: number) => {
    if (quantity < 1) return;
    setSelectedItems(
      selectedItems.map((item) =>
        item.equipmentId === equipmentId ? { ...item, quantity } : item
      )
    );
  };

  const checkAvailability = async () => {
    if (!formData.startDate || !formData.endDate || selectedItems.length === 0) {
      setError('Lütfen tarih ve ekipman seçin');
      return;
    }

    try {
      setAvailabilityChecking(true);
      setError('');

      const result = await reservationAPI.checkBulkAvailability({
        items: selectedItems.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
        })),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      setAvailability(result);

      if (!result.allAvailable) {
        const unavailableItems = result.items
          .filter((item: any) => !item.available)
          .map((item: any) => {
            const equipment = selectedItems.find(
              (si) => si.equipmentId === item.equipmentId
            )?.equipment;
            return `${equipment?.name} (${item.availableQuantity}/${item.requestedQuantity})`;
          });

        setError(
          `Bazı ekipmanlar seçilen tarihte müsait değil: ${unavailableItems.join(', ')}`
        );
        return;
      }

      // Calculate pricing
      await calculatePricing();
      setStep(3); // Move to review step
    } catch (error: any) {
      setError(error.response?.data?.message || 'Müsaitlik kontrolü başarısız');
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const calculatePricing = async () => {
    try {
      const result = await reservationAPI.calculatePrice({
        companyId,
        items: selectedItems.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
        })),
        startDate: formData.startDate,
        endDate: formData.endDate,
        discountCode: formData.discountCode || undefined,
      });

      setPricing(result);
    } catch (error: any) {
      console.error('Pricing calculation failed:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const reservationData = {
        companyId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress || undefined,
        items: selectedItems.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
        })),
        startDate: formData.startDate,
        endDate: formData.endDate,
        pickupTime: formData.pickupTime,
        returnTime: formData.returnTime,
        pickupLocation: formData.pickupLocation || undefined,
        returnLocation: formData.returnLocation || undefined,
        deliveryRequired: formData.deliveryRequired,
        deliveryAddress: formData.deliveryAddress || undefined,
        deliveryFee: formData.deliveryFee || undefined,
        discountCode: formData.discountCode || undefined,
        notes: formData.notes || undefined,
        specialRequests: formData.specialRequests || undefined,
      };

      const result = await reservationAPI.create(reservationData);

      if (result.success) {
        onSuccess?.(result.reservation);
      } else {
        setError(result.message || 'Rezervasyon oluşturulamadı');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Rezervasyon oluşturma başarısız');
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipmentList.filter(
    (eq) =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Yeni Rezervasyon</h2>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mt-6 flex items-center justify-between">
          {[
            { num: 1, label: 'Müşteri Bilgileri' },
            { num: 2, label: 'Ekipman Seçimi' },
            { num: 3, label: 'İnceleme & Onay' },
          ].map((s, index) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num
                      ? 'bg-white text-blue-600'
                      : 'bg-white/20 text-white/60'
                  }`}
                >
                  {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step >= s.num ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded ${
                    step > s.num ? 'bg-white' : 'bg-white/20'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Step 1: Customer Information */}
      {step === 1 && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Müşteri Adı *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ahmet Yılmaz"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                E-posta *
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefon *
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+90 555 123 4567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Adres
              </label>
              <input
                type="text"
                value={formData.customerAddress}
                onChange={(e) =>
                  setFormData({ ...formData, customerAddress: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="İstanbul, Türkiye"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Başlangıç Tarihi *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Bitiş Tarihi *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Delivery Option */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.deliveryRequired}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryRequired: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Teslimat İstiyorum</span>
              </div>
            </label>

            {formData.deliveryRequired && (
              <div className="mt-4 space-y-4">
                <input
                  type="text"
                  value={formData.deliveryAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryAddress: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Teslimat adresi"
                />
                <input
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Teslimat ücreti (TL)"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (
                  !formData.customerName ||
                  !formData.customerEmail ||
                  !formData.customerPhone ||
                  !formData.startDate ||
                  !formData.endDate
                ) {
                  setError('Lütfen gerekli alanları doldurun');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Devam Et →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Equipment Selection */}
      {step === 2 && (
        <div className="p-6 space-y-6">
          {/* Equipment Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Ekipman Ara
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ekipman adı, kod veya kategori ara..."
            />
          </div>

          {/* Equipment List */}
          {searchTerm && (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredEquipment.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Ekipman bulunamadı</div>
              ) : (
                filteredEquipment.map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => addEquipmentItem(eq)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{eq.name}</div>
                        <div className="text-xs text-gray-500">
                          {eq.code} • {eq.category} • Stok: {eq.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-blue-600">
                        {eq.dailyPrice?.toFixed(2)} TL/gün
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Selected Equipment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Seçilen Ekipmanlar ({selectedItems.length})
            </h3>

            {selectedItems.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Henüz ekipman seçilmedi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.equipmentId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {item.equipment?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.equipment?.code} • {item.equipment?.dailyPrice?.toFixed(2)}{' '}
                        TL/gün
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.equipmentId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.equipmentId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeEquipmentItem(item.equipmentId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              İndirim Kodu (Opsiyonel)
            </label>
            <input
              type="text"
              value={formData.discountCode}
              onChange={(e) =>
                setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              placeholder="SUMMER25"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Özel istekler veya notlar..."
            ></textarea>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ← Geri
            </button>
            <button
              onClick={checkAvailability}
              disabled={selectedItems.length === 0 || availabilityChecking}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {availabilityChecking ? 'Kontrol Ediliyor...' : 'Müsaitlik Kontrol Et →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && pricing && (
        <div className="p-6 space-y-6">
          {/* Customer Info Summary */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Müşteri Bilgileri</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Ad Soyad:</span>
                <span className="ml-2 font-medium">{formData.customerName}</span>
              </div>
              <div>
                <span className="text-gray-600">E-posta:</span>
                <span className="ml-2 font-medium">{formData.customerEmail}</span>
              </div>
              <div>
                <span className="text-gray-600">Telefon:</span>
                <span className="ml-2 font-medium">{formData.customerPhone}</span>
              </div>
              <div>
                <span className="text-gray-600">Tarih:</span>
                <span className="ml-2 font-medium">
                  {new Date(formData.startDate).toLocaleDateString('tr-TR')} -{' '}
                  {new Date(formData.endDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Equipment Summary */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Ekipmanlar</h3>
            <div className="space-y-2">
              {pricing.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <div className="font-medium">{item.equipmentName}</div>
                    <div className="text-xs text-gray-500">
                      {item.quantity}x • {item.duration} gün • {item.unitPrice.toFixed(2)}{' '}
                      TL/gün
                    </div>
                  </div>
                  <div className="font-semibold">{item.totalPrice.toFixed(2)} TL</div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Fiyat Detayı
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ara Toplam:</span>
                <span className="font-medium">{pricing.subtotal.toFixed(2)} TL</span>
              </div>
              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim:</span>
                  <span className="font-medium">-{pricing.discountAmount.toFixed(2)} TL</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">KDV (%20):</span>
                <span className="font-medium">{pricing.taxAmount.toFixed(2)} TL</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-gray-800">Toplam:</span>
                  <span className="font-bold text-blue-600">
                    {pricing.totalAmount.toFixed(2)} TL
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Depozito (%30):</span>
                <span className="font-semibold text-orange-600">
                  {(pricing.totalAmount * 0.3).toFixed(2)} TL
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ← Geri
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Rezervasyonu Oluştur
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
