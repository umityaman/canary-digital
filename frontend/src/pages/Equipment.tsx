import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Package, 
  Eye,
  Edit,
  Trash2,
  Activity,
  AlertCircle,
  CheckCircle,
  Wrench
} from 'lucide-react';
import { equipmentAPI } from '../services/api';

interface Equipment {
  id: number;
  name: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: string;
  location: string;
  dailyRate: number;
  totalUsageDays: number;
}

export default function Equipment() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, [searchTerm, statusFilter, categoryFilter]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      };
      const response = await equipmentAPI.getAll(filters);
      setEquipment(response.data);
    } catch (error: any) {
      console.error('Failed to fetch equipment:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Ekipmanlar yüklenirken hata oluştu';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800',
      IN_USE: 'bg-neutral-100 text-neutral-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      OUT_OF_SERVICE: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="w-4 h-4" />;
      case 'IN_USE':
        return <Activity className="w-4 h-4" />;
      case 'MAINTENANCE':
        return <Wrench className="w-4 h-4" />;
      case 'OUT_OF_SERVICE':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
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
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-red-600 text-lg">⚠️ {error}</div>
        <button 
          onClick={fetchEquipment}
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Ekipman ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
        <button 
          onClick={() => navigate('/equipment/new')}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Yeni Ekipman</span>
          <span className="sm:hidden">Ekle</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value="">Tüm Durumlar</option>
              <option value="AVAILABLE">Kullanılabilir</option>
              <option value="IN_USE">Kullanımda</option>
              <option value="MAINTENANCE">Bakımda</option>
              <option value="OUT_OF_SERVICE">Servis Dışı</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Kategori</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value="">Tüm Kategoriler</option>
              <option value="CAMERA">Kamera</option>
              <option value="LENS">Objektif</option>
              <option value="LIGHTING">Aydınlatma</option>
              <option value="AUDIO">Ses</option>
              <option value="ACCESSORY">Aksesuar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-neutral-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                    <p className="text-sm text-neutral-600">{item.brand} {item.model}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  {item.status === 'AVAILABLE' && 'Müsait'}
                  {item.status === 'IN_USE' && 'Kullanımda'}
                  {item.status === 'MAINTENANCE' && 'Bakımda'}
                  {item.status === 'OUT_OF_SERVICE' && 'Servis Dışı'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Seri No:</span>
                  <span className="font-medium">#{item.serialNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tip:</span>
                  <span className="font-medium">{item.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Konum:</span>
                  <span className="font-medium">{item.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Günlük Ücret:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(item.dailyRate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Toplam Kullanım:</span>
                  <span className="font-medium">{item.totalUsageDays} gün</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/equipment/${item.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Detaylar</span>
                </button>
                <button
                  onClick={() => navigate(`/equipment/${item.id}/edit`)}
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 text-sm"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {/* Handle delete */}}
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {equipment.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Henüz ekipman bulunmuyor</h3>
          <p className="text-neutral-600 mb-4">İlk ekipmanınızı eklemek için başlayın.</p>
          <button 
            onClick={() => navigate('/equipment/new')}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
          >
            Ekipman Ekle
          </button>
        </div>
      )}
    </div>
  );
}