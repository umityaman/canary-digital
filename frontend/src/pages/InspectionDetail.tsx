import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Camera,
  MapPin,
  Calendar,
  User,
  Package,
  Users,
  FileText
} from 'lucide-react';
import { useInspectionStore } from '../stores/inspectionStore';
import inspectionApi from '../services/inspectionApi';

export default function InspectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedInspection, 
    loading, 
    error, 
    getInspection, 
    deleteInspection 
  } = useInspectionStore();

  useEffect(() => {
    if (id) {
      getInspection(parseInt(id));
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Bu kontrolü silmek istediğinizden emin misiniz?')) {
      try {
        await deleteInspection(parseInt(id!));
        navigate('/inspection');
      } catch (err) {
        console.error('Silme hatası:', err);
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await inspectionApi.generatePDF(parseInt(id!));
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspection-${id}-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      alert('PDF indirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <AlertCircle className="text-red-600 mb-2" size={32} />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Hata</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate('/inspection')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Listeye Dön
          </button>
        </div>
      </div>
    );
  }

  if (!selectedInspection) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Kontrol bulunamadı</p>
      </div>
    );
  }

  const inspection = selectedInspection;
  const checklist = typeof inspection.checklistData === 'string' 
    ? JSON.parse(inspection.checklistData || '[]')
    : inspection.checklistData || [];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      PENDING: {
        label: 'Beklemede',
        className: 'bg-yellow-100 text-yellow-800',
        icon: <Clock size={16} />
      },
      APPROVED: {
        label: 'Onaylandı',
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircle size={16} />
      },
      DAMAGE_FOUND: {
        label: 'Hasar Bulundu',
        className: 'bg-red-100 text-red-800',
        icon: <AlertCircle size={16} />
      }
    };

    const badge = badges[status] || badges.PENDING;
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${badge.className}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getConditionBadge = (condition: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      EXCELLENT: { label: 'Mükemmel', className: 'bg-green-100 text-green-800' },
      GOOD: { label: 'İyi', className: 'bg-neutral-100 text-neutral-800' },
      FAIR: { label: 'Orta', className: 'bg-yellow-100 text-yellow-800' },
      POOR: { label: 'Kötü', className: 'bg-red-100 text-red-800' }
    };
    
    const badge = badges[condition] || badges.FAIR;
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/inspection')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200 rounded-xl"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <FileDown size={18} />
            PDF İndir
          </button>
          <Link
            to={`/inspection/${inspection.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <Edit size={18} />
            Düzenle
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            <Trash2 size={18} />
            Sil
          </button>
        </div>
      </div>

      {/* Status & Type */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-neutral-600 mb-1">Durum</p>
            {getStatusBadge(inspection.status)}
          </div>
          <div className="h-12 w-px bg-neutral-200"></div>
          <div>
            <p className="text-sm text-neutral-600 mb-1">Kontrol Tipi</p>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              inspection.inspectionType === 'CHECKOUT'
                ? 'bg-neutral-100 text-neutral-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {inspection.inspectionType === 'CHECKOUT' ? 'Teslim Alış' : 'Teslim Ediş'}
            </span>
          </div>
          <div className="h-12 w-px bg-neutral-200"></div>
          <div>
            <p className="text-sm text-neutral-600 mb-1">Genel Durum</p>
            {inspection.overallCondition && getConditionBadge(inspection.overallCondition)}
          </div>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipment Info */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-neutral-700" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Ekipman Bilgileri</h3>
              <p className="text-sm text-neutral-600">Kontrol edilen ekipman</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-600">Ekipman Adı</p>
              <p className="font-semibold text-neutral-900">
                {inspection.equipment?.name || 'Bilinmiyor'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-600">Seri Numarası</p>
              <p className="font-medium text-neutral-700">
                {inspection.equipment?.serialNumber || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-600">Durum</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                (inspection.equipment as any)?.status === 'AVAILABLE' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(inspection.equipment as any)?.status || 'Bilinmiyor'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Müşteri Bilgileri</h3>
              <p className="text-sm text-neutral-600">İlgili müşteri</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-600">Müşteri Adı</p>
              <p className="font-semibold text-neutral-900">
                {inspection.customer?.name || 'Bilinmiyor'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-600">Telefon</p>
              <p className="font-medium text-neutral-700">
                {inspection.customer?.phone || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-600">E-posta</p>
              <p className="font-medium text-neutral-700">
                {inspection.customer?.email || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Inspector Info */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <User size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Kontrol Eden</h3>
              <p className="text-sm text-neutral-600">Yetkili personel</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-600">Ad Soyad</p>
              <p className="font-semibold text-neutral-900">
                {inspection.inspector?.name || 'Bilinmiyor'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-600">E-posta</p>
              <p className="font-medium text-neutral-700">
                {inspection.inspector?.email || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Location & Date */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <MapPin size={20} className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Konum & Tarih</h3>
              <p className="text-sm text-neutral-600">Detay bilgiler</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-600">Konum</p>
              <p className="font-medium text-neutral-900">
                {inspection.location || 'Belirtilmemiş'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-600">Kontrol Tarihi</p>
              <div className="flex items-center gap-2 text-neutral-900">
                <Calendar size={16} />
                <span className="font-medium">
                  {new Date(inspection.inspectionDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      {checklist.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-neutral-700" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Kontrol Listesi</h3>
              <p className="text-sm text-neutral-600">
                {checklist.filter((item: any) => item.checked).length} / {checklist.length} tamamlandı
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {checklist.map((item: any, index: number) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  item.checked ? 'bg-green-50' : 'bg-neutral-50'
                }`}
              >
                <div className="mt-0.5">
                  {item.checked ? (
                    <CheckCircle size={18} className="text-green-600" />
                  ) : (
                    <AlertCircle size={18} className="text-neutral-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    item.checked ? 'text-green-900' : 'text-neutral-700'
                  }`}>
                    {item.category} - {item.label}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-neutral-600 mt-1">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {inspection.photos && inspection.photos.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Camera size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Fotoğraflar</h3>
              <p className="text-sm text-neutral-600">{inspection.photos.length} fotoğraf</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inspection.photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.photoUrl}
                  alt={photo.caption || 'Inspection photo'}
                  className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                />
                {photo.caption && (
                  <p className="text-xs text-neutral-600 mt-1">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Damage Reports */}
      {inspection.damageReports && inspection.damageReports.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Hasar Raporları</h3>
              <p className="text-sm text-red-700">{inspection.damageReports.length} hasar kaydı</p>
            </div>
          </div>
          <div className="space-y-4">
            {inspection.damageReports.map((damage) => (
              <div key={damage.id} className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-red-900">{damage.damageType}</h4>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                      damage.severity === 'MINOR' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : damage.severity === 'MODERATE'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {damage.severity}
                    </span>
                  </div>
                  {damage.estimatedCost && (
                    <div className="text-right">
                      <p className="text-xs text-red-700">Tahmini Maliyet</p>
                      <p className="font-bold text-red-900">₺{damage.estimatedCost}</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-red-800">{damage.description}</p>
                {damage.location && (
                  <p className="text-xs text-red-600 mt-2">📍 {damage.location}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {inspection.notes && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
          <h3 className="font-semibold text-neutral-900 mb-2">Notlar</h3>
          <p className="text-neutral-800">{inspection.notes}</p>
        </div>
      )}

      {/* Signatures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inspection.customerSignature && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Müşteri İmzası</h3>
            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
              <img
                src={inspection.customerSignature}
                alt="Customer signature"
                className="max-h-32 mx-auto"
              />
            </div>
          </div>
        )}
        {inspection.inspectorSignature && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Kontrol Eden İmzası</h3>
            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
              <img
                src={inspection.inspectorSignature}
                alt="Inspector signature"
                className="max-h-32 mx-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
