import { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Package,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Barcode,
  Settings,
  ClipboardList,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

type Tab = 'dashboard' | 'work-orders' | 'assets' | 'parts' | 'technicians' | 'reports';
type WorkOrderStatus = 'NEW' | 'INSPECTING' | 'WAITING_PARTS' | 'REPAIRING' | 'TESTING' | 'COMPLETED' | 'RETURNED' | 'SCRAPPED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface Stats {
  openWorkOrders: number;
  avgRepairTime: number;
  lowStockItems: number;
  activeTechnicians: number;
  slaCritical: number;
}

interface WorkOrder {
  id: number;
  ticketNumber: string;
  equipmentName: string;
  serialNumber: string;
  customerName: string;
  status: WorkOrderStatus;
  priority: Priority;
  assignedToName?: string;
  estimatedCompletion: string;
  laborCost: number;
  partsCost: number;
  issue: string;
}

interface ServiceAsset {
  id: number;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  assetCode: string;
  status: string;
  warrantyExpiry: string;
  lastMaintenance: string;
}

interface Part {
  id: number;
  code: string;
  name: string;
  stock: number;
  minStock: number;
  unitCost: number;
  supplier: string;
}

export default function TechnicalService() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Data states
  const [stats, setStats] = useState<Stats>({
    openWorkOrders: 0,
    avgRepairTime: 0,
    lowStockItems: 0,
    activeTechnicians: 0,
    slaCritical: 0,
  });
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<ServiceAsset[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  // Fetch data on mount and tab change
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
      fetchWorkOrders();
      fetchParts();
    } else if (activeTab === 'work-orders') {
      fetchWorkOrders();
    } else if (activeTab === 'assets') {
      fetchAssets();
    } else if (activeTab === 'parts') {
      fetchParts();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/technical-service/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/technical-service/work-orders');
      setWorkOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/technical-service/assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/technical-service/parts');
      setParts(response.data);
    } catch (error) {
      console.error('Failed to fetch parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    const labels = {
      NEW: 'Yeni',
      INSPECTING: 'İnceleniyor',
      WAITING_PARTS: 'Parça Bekliyor',
      REPAIRING: 'Onarımda',
      TESTING: 'Test Ediliyor',
      COMPLETED: 'Tamamlandı',
      RETURNED: 'İade Edildi',
      SCRAPPED: 'Hurda',
    };

    return (
      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-700">
        {labels[status]}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const styles = {
      LOW: 'bg-neutral-100 text-neutral-600',
      MEDIUM: 'bg-neutral-100 text-neutral-700',
      HIGH: 'bg-neutral-100 text-neutral-900',
      URGENT: 'bg-neutral-900 text-white',
    };

    const labels = {
      LOW: 'Düşük',
      MEDIUM: 'Orta',
      HIGH: 'Yüksek',
      URGENT: 'Acil',
    };

    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Aktif</span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">{stats.openWorkOrders}</h3>
          <p className="text-sm text-neutral-600">Açık İş Emirleri</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Clock className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Ortalama</span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">{stats.avgRepairTime} gün</h3>
          <p className="text-sm text-neutral-600">Tamir Süresi (MTTR)</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Package className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Alarm</span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">{stats.lowStockItems}</h3>
          <p className="text-sm text-neutral-600">Düşük Stok Uyarısı</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Çalışıyor</span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">{stats.activeTechnicians}</h3>
          <p className="text-sm text-neutral-600">Aktif Teknisyen</p>
        </div>
      </div>

      {/* SLA Critical Alerts */}
      {stats.slaCritical > 0 && (
        <div className="bg-neutral-50 border border-neutral-300 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-neutral-700 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">SLA Riski Uyarısı</h3>
              <p className="text-sm text-neutral-700">
                <strong>{stats.slaCritical}</strong> iş emri teslim tarihini aşmak üzere. Hemen aksiyon alın!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Work Orders */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-900">Son İş Emirleri</h2>
          <button
            onClick={() => setActiveTab('work-orders')}
            className="text-sm text-neutral-700 hover:text-neutral-900 font-medium"
          >
            Tümünü Gör →
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="animate-spin text-neutral-400" size={24} />
          </div>
        ) : workOrders.length === 0 ? (
          <p className="text-center text-neutral-600 py-8">Henüz iş emri bulunmuyor</p>
        ) : (
          <div className="space-y-4">
            {workOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-neutral-900">{order.ticketNumber}</span>
                      {getPriorityBadge(order.priority)}
                      {getStatusBadge(order.status)}
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900">{order.equipmentName}</h3>
                    <p className="text-xs text-neutral-600">{order.serialNumber} • {order.customerName}</p>
                  </div>
                  <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Eye size={18} className="text-neutral-600" />
                  </button>
                </div>

                <p className="text-sm text-neutral-700 mb-3">{order.issue}</p>

                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>👤 {order.assignedToName || 'Atanmamış'}</span>
                  <span>📅 Teslim: {new Date(order.estimatedCompletion).toLocaleDateString('tr-TR')}</span>
                  <span>💰 ₺{(order.laborCost + order.partsCost).toLocaleString('tr-TR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Parts Alert */}
      {parts.filter(p => p.stock <= p.minStock).length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900">Düşük Stok Uyarısı</h2>
            <button
              onClick={() => setActiveTab('parts')}
              className="text-sm text-neutral-700 hover:text-neutral-900 font-medium"
            >
              Tümünü Gör →
            </button>
          </div>

          <div className="space-y-3">
            {parts.filter(p => p.stock <= p.minStock).slice(0, 3).map((part) => (
              <div
                key={part.id}
                className="flex items-center justify-between border border-neutral-200 bg-neutral-50 rounded-xl p-4"
              >
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{part.name}</h3>
                  <p className="text-xs text-neutral-600">{part.code} • {part.supplier}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-neutral-900">
                    {part.stock} / {part.minStock} adet
                  </span>
                  <p className="text-xs text-neutral-600">₺{part.unitCost.toLocaleString('tr-TR')}/adet</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderWorkOrders = () => (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="İş emri no, seri no, müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          <Filter size={20} />
          Filtreler
        </button>

        <button 
          onClick={fetchWorkOrders}
          className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw size={20} />
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
          <Plus size={20} />
          Yeni İş Emri
        </button>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-neutral-400" size={32} />
          </div>
        ) : workOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 mb-4">Henüz iş emri bulunmuyor</p>
            <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
              İlk İş Emrini Oluştur
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">İş Emri</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Ekipman</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Müşteri</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Durum</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Öncelik</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Teknisyen</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Teslim</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Maliyet</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {workOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-neutral-900">{order.ticketNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">{order.equipmentName}</div>
                      <div className="text-xs text-neutral-600">{order.serialNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{order.customerName}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4">{getPriorityBadge(order.priority)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{order.assignedToName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {new Date(order.estimatedCompletion).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                      ₺{(order.laborCost + order.partsCost).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 hover:bg-neutral-100 rounded transition-colors">
                          <Eye size={16} className="text-neutral-600" />
                        </button>
                        <button className="p-1 hover:bg-neutral-100 rounded transition-colors">
                          <Edit size={16} className="text-neutral-600" />
                        </button>
                        <button className="p-1 hover:bg-neutral-100 rounded transition-colors">
                          <Trash2 size={16} className="text-neutral-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderAssets = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Ekipman adı, seri no ara..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <button 
          onClick={fetchAssets}
          className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw size={20} />
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap">
          <Plus size={20} />
          Yeni Ekipman
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-neutral-400" size={32} />
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-600 mb-4">Henüz kayıtlı ekipman bulunmuyor</p>
          <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
            İlk Ekipmanı Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{asset.name}</h3>
                  <p className="text-sm text-neutral-600">{asset.brand} • {asset.model}</p>
                </div>
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-700">
                  {asset.status === 'IN_SERVICE' ? 'Hizmette' :
                   asset.status === 'IN_REPAIR' ? 'Tamirde' :
                   asset.status === 'AVAILABLE' ? 'Müsait' : 'Hizmet Dışı'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Seri No:</span>
                  <span className="font-medium text-neutral-900">{asset.serialNumber}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Varlık Kodu:</span>
                  <span className="font-medium text-neutral-900">{asset.assetCode}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Garanti:</span>
                  <span className="font-medium text-neutral-900">
                    {new Date(asset.warrantyExpiry).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Son Bakım:</span>
                  <span className="font-medium text-neutral-900">
                    {new Date(asset.lastMaintenance).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                  <Barcode size={18} />
                  <span className="text-sm">QR Kod</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                  <FileText size={18} />
                  <span className="text-sm">Geçmiş</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderParts = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Parça kodu, isim ara..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <button 
          onClick={fetchParts}
          className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw size={20} />
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap">
          <Plus size={20} />
          Yeni Parça
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-neutral-400" size={32} />
          </div>
        ) : parts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 mb-4">Henüz parça kaydı bulunmuyor</p>
            <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
              İlk Parçayı Ekle
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Parça Kodu</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Parça Adı</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Stok</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Min. Stok</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Birim Maliyet</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">Tedarikçi</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-700 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {parts.map((part) => (
                  <tr
                    key={part.id}
                    className={`hover:bg-neutral-50 transition-colors ${
                      part.stock <= part.minStock ? 'bg-neutral-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-neutral-900">{part.code}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{part.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-neutral-900">
                        {part.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{part.minStock}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                      ₺{part.unitCost.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{part.supplier}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 hover:bg-neutral-100 rounded transition-colors">
                          <Eye size={16} className="text-neutral-600" />
                        </button>
                        <button className="p-1 hover:bg-neutral-100 rounded transition-colors">
                          <Edit size={16} className="text-neutral-600" />
                        </button>
                        <button className="p-1 hover:bg-neutral-100 rounded transition-colors">
                          <Trash2 size={16} className="text-neutral-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderTechnicians = () => (
    <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
      <Users size={48} className="text-neutral-400 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-neutral-900 mb-2">Teknisyen Yönetimi</h3>
      <p className="text-neutral-600 mb-6">Teknisyen modülü yakında eklenecek</p>
      <button className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
        Yakında
      </button>
    </div>
  );

  const renderReports = () => (
    <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
      <FileText size={48} className="text-neutral-400 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-neutral-900 mb-2">Raporlama</h3>
      <p className="text-neutral-600 mb-6">Detaylı raporlama modülü yakında eklenecek</p>
      <button className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
        Yakında
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'work-orders':
        return renderWorkOrders();
      case 'assets':
        return renderAssets();
      case 'parts':
        return renderParts();
      case 'technicians':
        return renderTechnicians();
      case 'reports':
        return renderReports();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <TrendingUp size={18} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('work-orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'work-orders'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <ClipboardList size={18} />
            İş Emirleri
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'assets'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Settings size={18} />
            Ekipman
          </button>

          <button
            onClick={() => setActiveTab('parts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'parts'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Package size={18} />
            Parça Stok
          </button>

          <button
            onClick={() => setActiveTab('technicians')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'technicians'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Users size={18} />
            Teknisyenler
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <FileText size={18} />
            Raporlar
          </button>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
