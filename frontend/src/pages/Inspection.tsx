import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardCheck,
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Eye,
  Pencil,
  Trash2,
  FileDown,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useInspectionStore } from '../stores/inspectionStore';
import type { InspectionFilters } from '../types/inspection';

export default function Inspection() {
  const { 
    inspections, 
    loading, 
    error, 
    fetchInspections, 
    deleteInspection 
  } = useInspectionStore();

  const [filters, setFilters] = useState<InspectionFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInspections(filters);
  }, [filters]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu kontrolü silmek istediğinizden emin misiniz?')) {
      try {
        await deleteInspection(id);
      } catch (err) {
        console.error('Silme hatası:', err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      PENDING: {
        label: 'Beklemede',
        className: 'bg-yellow-100 text-yellow-800',
        icon: <Clock size={14} />
      },
      APPROVED: {
        label: 'Onaylandı',
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircle size={14} />
      },
      DAMAGE_FOUND: {
        label: 'Hasar Bulundu',
        className: 'bg-red-100 text-red-800',
        icon: <AlertCircle size={14} />
      }
    };

    const badge = badges[status] || badges.PENDING;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'CHECKOUT' 
      ? <span className="px-2 py-1 bg-neutral-100 text-neutral-800 rounded-full text-xs font-medium">Teslim Alış</span>
      : <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Teslim Ediş</span>;
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Button */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Sipariş numarası, ekipman veya müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
        <Link 
          to="/inspection/new"
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          Yeni Kontrol
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Ara
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-2"
          >
            <Filter size={20} />
            Filtrele
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Kontrol Tipi</label>
              <select 
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tümü</option>
                <option value="CHECKOUT">Teslim Alış</option>
                <option value="CHECKIN">Teslim Ediş</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Durum</label>
              <select 
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tümü</option>
                <option value="PENDING">Beklemede</option>
                <option value="APPROVED">Onaylandı</option>
                <option value="DAMAGE_FOUND">Hasar Bulundu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Başlangıç Tarihi</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Bitiş Tarihi</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Hata</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && inspections.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <ClipboardCheck size={48} className="mx-auto text-neutral-400 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Henüz kontrol kaydı yok</h3>
          <p className="text-neutral-600 mb-6">İlk kontrol kaydınızı oluşturarak başlayın</p>
          <Link 
            to="/inspection/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <Plus size={20} />
            Yeni Kontrol Oluştur
          </Link>
        </div>
      )}

      {/* Inspection Cards */}
      {!loading && inspections.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {inspections.map((inspection) => (
            <div 
              key={inspection.id} 
              className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Kontrol #{inspection.id}
                    </h3>
                    {getTypeBadge(inspection.inspectionType)}
                    {getStatusBadge(inspection.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(inspection.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                    {inspection.location && (
                      <span>📍 {inspection.location}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/inspection/${inspection.id}`}
                    className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Görüntüle"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    to={`/inspection/${inspection.id}/edit`}
                    className="p-2 text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Pencil size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(inspection.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="PDF İndir"
                  >
                    <FileDown size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-neutral-50 rounded-xl p-3">
                  <p className="text-xs text-neutral-600 mb-1">Ekipman</p>
                  <p className="font-semibold text-neutral-900">
                    {inspection.equipment?.name || 'Bilinmiyor'}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {inspection.equipment?.serialNumber}
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-xl p-3">
                  <p className="text-xs text-neutral-600 mb-1">Müşteri</p>
                  <p className="font-semibold text-neutral-900">
                    {inspection.customer?.name || 'Bilinmiyor'}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {inspection.customer?.phone}
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-xl p-3">
                  <p className="text-xs text-neutral-600 mb-1">Genel Durum</p>
                  {getConditionBadge(inspection.overallCondition)}
                  {inspection.damageReports && inspection.damageReports.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {inspection.damageReports.length} hasar kaydı
                    </p>
                  )}
                </div>
              </div>

              {inspection.notes && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                  <p className="text-sm text-neutral-900">
                    <strong>Not:</strong> {inspection.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {!loading && inspections.length > 0 && (
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-neutral-900">{inspections.length}</p>
              <p className="text-sm text-neutral-600">Toplam Kontrol</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {inspections.filter(i => i.status === 'PENDING').length}
              </p>
              <p className="text-sm text-neutral-600">Beklemede</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {inspections.filter(i => i.status === 'APPROVED').length}
              </p>
              <p className="text-sm text-neutral-600">Onaylanan</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {inspections.filter(i => i.status === 'DAMAGE_FOUND').length}
              </p>
              <p className="text-sm text-neutral-600">Hasarlı</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
