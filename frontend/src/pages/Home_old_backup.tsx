import { useEffect, useState } from 'react';
import {
  Plus,
  ShoppingCart,
  Package,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckSquare,
  DollarSign,
  Activity,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import ClockWidget from '../components/widgets/ClockWidget';
import CalculatorWidget from '../components/widgets/CalculatorWidget';
import CurrencyWidget from '../components/widgets/CurrencyWidget';

interface DashboardStats {
  orders: {
    total: number;
    active: number;
    completed: number;
    avgValue: number;
  };
  revenue: {
    total: number;
    monthly: number;
  };
  customers: {
    total: number;
  };
  equipment: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    utilization: number;
  };
  calendar: {
    upcomingEvents: number;
  };
  alerts: {
    lowStock: number;
    pendingInspections: number;
  };
  recent: {
    orders: Array<{
      id: number;
      orderNumber: string;
      customer: string;
      amount: number;
      status: string;
      date: string;
    }>;
    customers: Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      date: string;
    }>;
  };
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  date: string;
  icon: string;
}

export default function Home() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent-activity'),
      ]);
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-neutral-400" size={32} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
        <AlertCircle className="text-neutral-400 mx-auto mb-4" size={48} />
        <p className="text-neutral-600">Dashboard verileri yüklenemedi</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-neutral-100 text-neutral-700',
      CONFIRMED: 'bg-neutral-100 text-neutral-700',
      ACTIVE: 'bg-neutral-100 text-neutral-900',
      COMPLETED: 'bg-neutral-100 text-neutral-700',
      CANCELLED: 'bg-neutral-100 text-neutral-600',
    };

    const labels: Record<string, string> = {
      PENDING: 'Bekliyor',
      CONFIRMED: 'Onaylandı',
      ACTIVE: 'Aktif',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal',
    };

    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles[status] || 'bg-neutral-100 text-neutral-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const monthlyChange = stats.revenue.monthly > 0 
    ? ((stats.revenue.monthly / stats.revenue.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Toplam</span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">
            ₺{stats.revenue.total.toLocaleString('tr-TR')}
          </h3>
          <p className="text-sm text-neutral-600">Toplam Gelir</p>
          <div className="mt-4 flex items-center text-xs text-neutral-700">
            <TrendingUp size={14} className="mr-1" />
            Bu ay: ₺{stats.revenue.monthly.toLocaleString('tr-TR')}
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Aktif</span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">{stats.orders.active}</h3>
          <p className="text-sm text-neutral-600">Aktif Siparişler</p>
          <div className="mt-4 flex items-center text-xs text-neutral-700">
            <Activity size={14} className="mr-1" />
            Toplam: {stats.orders.total} sipariş
          </div>
        </div>

        {/* Equipment Utilization */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Package className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Kullanım</span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">%{stats.equipment.utilization}</h3>
          <p className="text-sm text-neutral-600">Ekipman Kullanımı</p>
          <div className="mt-4 flex items-center text-xs text-neutral-700">
            <CheckSquare size={14} className="mr-1" />
            {stats.equipment.rented}/{stats.equipment.total} kiralık
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Users className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Kayıtlı</span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">{stats.customers.total}</h3>
          <p className="text-sm text-neutral-600">Toplam Müşteri</p>
          <div className="mt-4 flex items-center text-xs text-neutral-700">
            <Users size={14} className="mr-1" />
            Aktif müşteri tabanı
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.alerts.pendingInspections > 0 || stats.calendar.upcomingEvents > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.alerts.pendingInspections > 0 && (
            <div className="bg-neutral-50 border border-neutral-300 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-neutral-700 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">Bekleyen Kontroller</h3>
                  <p className="text-sm text-neutral-700">
                    <strong>{stats.alerts.pendingInspections}</strong> ekipman kontrol bekliyor
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.calendar.upcomingEvents > 0 && (
            <div className="bg-neutral-50 border border-neutral-300 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Calendar className="text-neutral-700 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">Yaklaşan Etkinlikler</h3>
                  <p className="text-sm text-neutral-700">
                    Önümüzdeki 7 gün içinde <strong>{stats.calendar.upcomingEvents}</strong> etkinlik
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Equipment Status */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-6">Ekipman Durumu</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <div className="text-2xl font-bold text-neutral-900 mb-1">{stats.equipment.total}</div>
            <div className="text-xs text-neutral-600">Toplam</div>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <div className="text-2xl font-bold text-neutral-900 mb-1">{stats.equipment.available}</div>
            <div className="text-xs text-neutral-600">Müsait</div>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <div className="text-2xl font-bold text-neutral-900 mb-1">{stats.equipment.rented}</div>
            <div className="text-xs text-neutral-600">Kiralık</div>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <div className="text-2xl font-bold text-neutral-900 mb-1">{stats.equipment.maintenance}</div>
            <div className="text-xs text-neutral-600">Bakımda</div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900">Son Aktiviteler</h2>
            <button 
              onClick={fetchDashboardData}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <RefreshCw size={16} className="text-neutral-600" />
            </button>
          </div>

          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-neutral-50 rounded-xl transition-colors">
                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {activity.icon === 'ShoppingCart' && <ShoppingCart size={16} className="text-neutral-700" />}
                  {activity.icon === 'CheckSquare' && <CheckSquare size={16} className="text-neutral-700" />}
                  {activity.icon === 'Calendar' && <Calendar size={16} className="text-neutral-700" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{activity.title}</p>
                  <p className="text-xs text-neutral-600 truncate">{activity.description}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(activity.date).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {getStatusBadge(activity.status)}
              </div>
            ))}

            {activities.length === 0 && (
              <p className="text-center text-neutral-600 py-8">Henüz aktivite bulunmuyor</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900">Son Siparişler</h2>
            <a 
              href="/orders" 
              className="text-sm text-neutral-700 hover:text-neutral-900 font-medium"
            >
              Tümünü Gör →
            </a>
          </div>

          <div className="space-y-3">
            {stats.recent.orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900">{order.orderNumber}</p>
                  <p className="text-xs text-neutral-600">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-900">
                    ₺{order.amount.toLocaleString('tr-TR')}
                  </p>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}

            {stats.recent.orders.length === 0 && (
              <p className="text-center text-neutral-600 py-8">Henüz sipariş bulunmuyor</p>
            )}
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-6">Araçlar & Bilgi Merkezi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ClockWidget />
          <CalculatorWidget />
          <CurrencyWidget />
        </div>
      </div>
    </div>
  );
}
