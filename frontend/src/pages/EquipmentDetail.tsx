import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, QrCode, Package, DollarSign, Calendar, Info, Tag } from 'lucide-react';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import api from '../services/api';

interface Equipment {
  id: number;
  code: string;
  name: string;
  brand: string;
  model: string;
  category: string | null;
  serialNumber: string | null;
  qrCode: string;
  barcode: string | null;
  quantity: number;
  dailyPrice: number | null;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  hourlyPrice: number | null;
  weekendPrice: number | null;
  replacementValue: number | null;
  depositAmount: number | null;
  minRentalPeriod: number | null;
  maxRentalPeriod: number | null;
  status: 'AVAILABLE' | 'RENTED' | 'RESERVED' | 'MAINTENANCE' | 'LOST' | 'BROKEN';
  description: string | null;
  imageUrl: string | null;
  companyId: number;
  booqableId: string | null;
  createdAt: string;
  updatedAt: string;
}


const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await api.get(`/equipment/${id}`);
        setEquipment(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Ekipman yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEquipment();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RENTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'BROKEN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'LOST':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Müsait';
      case 'RENTED': return 'Kiralandı';
      case 'RESERVED': return 'Rezerve';
      case 'MAINTENANCE': return 'Bakımda';
      case 'BROKEN': return 'Arızalı';
      case 'LOST': return 'Kayıp';
      default: return status;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu ekipmanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/equipment/${id}`);
      navigate('/inventory');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ekipman silinemedi');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="text-red-600 text-xl font-semibold mb-4">
            {error || 'Ekipman bulunamadı'}
          </div>
          <button
            onClick={() => navigate('/inventory')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Envantere Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/inventory')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Envantere Dön</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Kod
              </button>
              <button
                onClick={() => navigate(`/inventory/edit/${equipment.id}`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </button>
            </div>
          </div>

          <div className="flex items-start gap-6">
            {/* Equipment Image */}
            <div className="flex-shrink-0">
              {equipment.imageUrl ? (
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Equipment Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{equipment.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      {equipment.brand} {equipment.model}
                    </span>
                    {equipment.category && (
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {equipment.category}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-lg border font-medium ${getStatusColor(equipment.status)}`}>
                  {getStatusText(equipment.status)}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <span>Kod: <strong className="text-gray-900">{equipment.code}</strong></span>
                {equipment.serialNumber && (
                  <span>Seri No: <strong className="text-gray-900">{equipment.serialNumber}</strong></span>
                )}
                <span>Adet: <strong className="text-gray-900">{equipment.quantity}</strong></span>
              </div>

              {equipment.description && (
                <p className="text-gray-700 leading-relaxed">{equipment.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pricing Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Fiyatlandırma</h2>
          </div>
          <div className="space-y-3">
            {equipment.hourlyPrice && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Saatlik</span>
                <span className="font-semibold text-gray-900">{equipment.hourlyPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}
            {equipment.dailyPrice && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Günlük</span>
                <span className="font-semibold text-gray-900">{equipment.dailyPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}
            {equipment.weeklyPrice && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Haftalık</span>
                <span className="font-semibold text-gray-900">{equipment.weeklyPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}
            {equipment.monthlyPrice && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Aylık</span>
                <span className="font-semibold text-gray-900">{equipment.monthlyPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}
            {equipment.weekendPrice && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hafta Sonu</span>
                <span className="font-semibold text-gray-900">{equipment.weekendPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}
            {!equipment.hourlyPrice && !equipment.dailyPrice && !equipment.weeklyPrice && !equipment.monthlyPrice && (
              <p className="text-gray-500 text-sm">Fiyat bilgisi girilmemiş</p>
            )}
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Info className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Mali Bilgiler</h2>
          </div>
          <div className="space-y-3">
            {equipment.replacementValue && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Yenileme Bedeli</span>
                <span className="font-semibold text-gray-900">{equipment.replacementValue.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}
            {equipment.depositAmount && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Depozito</span>
                <span className="font-semibold text-gray-900">{equipment.depositAmount.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}
            {!equipment.replacementValue && !equipment.depositAmount && (
              <p className="text-gray-500 text-sm">Mali bilgi girilmemiş</p>
            )}
          </div>
        </div>

        {/* Rental Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Kiralama Bilgileri</h2>
          </div>
          <div className="space-y-3">
            {equipment.minRentalPeriod && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Min. Süre</span>
                <span className="font-semibold text-gray-900">{equipment.minRentalPeriod} gün</span>
              </div>
            )}
            {equipment.maxRentalPeriod && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Max. Süre</span>
                <span className="font-semibold text-gray-900">{equipment.maxRentalPeriod} gün</span>
              </div>
            )}
            {!equipment.minRentalPeriod && !equipment.maxRentalPeriod && (
              <p className="text-gray-500 text-sm">Kiralama süresi belirtilmemiş</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ek Bilgiler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Oluşturulma</span>
            <p className="font-medium text-gray-900 mt-1">
              {new Date(equipment.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Son Güncelleme</span>
            <p className="font-medium text-gray-900 mt-1">
              {new Date(equipment.updatedAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
          {equipment.qrCode && (
            <div>
              <span className="text-gray-600">QR Kod</span>
              <p className="font-medium text-gray-900 mt-1">{equipment.qrCode}</p>
            </div>
          )}
          {equipment.barcode && (
            <div>
              <span className="text-gray-600">Barkod</span>
              <p className="font-medium text-gray-900 mt-1">{equipment.barcode}</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && equipment && (
        <QRCodeGenerator
          equipmentId={equipment.id}
          equipmentName={equipment.name}
          serialNumber={equipment.serialNumber || equipment.code}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
};

export default EquipmentDetail;
