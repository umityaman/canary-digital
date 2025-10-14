import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Calendar,
  AlertCircle,
  CheckSquare,
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
} from 'lucide-react';
import api from '../services/api';
import { dashboardAPI } from '../services/api';
import ClockWidget from '../components/widgets/ClockWidget';
import CalculatorWidget from '../components/widgets/CalculatorWidget';
import CurrencyWidget from '../components/widgets/CurrencyWidget';
import RevenueChart from '../components/charts/RevenueChart';
import OrdersChart from '../components/charts/OrdersChart';
import EquipmentUtilizationChart from '../components/charts/EquipmentUtilizationChart';
import AnalyticsGrid from '../components/analytics/AnalyticsGrid';
import TimeAnalytics from '../components/analytics/TimeAnalytics';
import RealTimeDashboard from '../components/analytics/RealTimeDashboard';

interface DashboardStats {
  revenue: {
    total: number;
    monthly: number;
    change: number;
  };
  reservations: {
    total: number;
    active: number;
    completed: number;
    change: number;
  };
  equipment: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  };
  recentReservations: any[];
  upcomingReservations: any[];
}

// Legacy interface for compatibility
interface LegacyDashboardStats {
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Chart data states
  const [revenueData, setRevenueData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);
  const [equipmentData, setEquipmentData] = useState<any>(null);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [ordersPeriod, setOrdersPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    fetchDashboardData();
    fetchChartsData();
  }, []);

  useEffect(() => {
    fetchOrdersData(ordersPeriod);
  }, [ordersPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Use mock endpoint for testing (avoiding authentication issues)
      const statsRes = await api.get('/dashboard/mock');
      setStats(statsRes.data);
      
      // Mock activities for now (will be implemented later)
      setActivities([
        {
          id: '1',
          type: 'order',
          title: 'Yeni Sipariş',
          description: 'Sipariş #1001 oluşturuldu',
          status: 'PENDING',
          date: new Date().toISOString(),
          icon: 'ShoppingCart',
        },
        {
          id: '2',
          type: 'inspection',
          title: 'Kontrol Tamamlandı',
          description: 'Ekipman #45 kontrolü tamamlandı',
          status: 'COMPLETED',
          date: new Date(Date.now() - 3600000).toISOString(),
          icon: 'CheckSquare',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartsData = async () => {
    try {
      setChartsLoading(true);
      const [revenueRes, ordersRes, equipmentRes] = await Promise.all([
        dashboardAPI.getRevenue(),
        dashboardAPI.getOrders('monthly'),
        dashboardAPI.getEquipmentUtilization(),
      ]);
      setRevenueData(revenueRes.data);
      setOrdersData(ordersRes.data);
      setEquipmentData(equipmentRes.data);
    } catch (error) {
      console.error('Failed to fetch charts data:', error);
    } finally {
      setChartsLoading(false);
    }
  };

  const fetchOrdersData = async (period: 'daily' | 'weekly' | 'monthly') => {
    try {
      const ordersRes = await dashboardAPI.getOrders(period);
      setOrdersData(ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch orders data:', error);
    }
  };

  const handleOrdersPeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setOrdersPeriod(period);
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

  return (
    <div className="space-y-6">
      {/* Advanced Analytics Grid */}
      <AnalyticsGrid 
        stats={stats} 
        loading={loading}
        onRefresh={fetchDashboardData}
      />

      {/* Real-time Dashboard */}
      <RealTimeDashboard 
        connected={true}
        onConnect={() => console.log('Real-time monitoring connected')}
        onDisconnect={() => console.log('Real-time monitoring disconnected')}
      />

      {/* Time-based Analytics */}
      <TimeAnalytics 
        data={stats}
        loading={chartsLoading}
      />

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

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">Detaylı Analizler</h2>
          <button 
            onClick={fetchChartsData}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            <span className="text-sm font-medium">Yenile</span>
          </button>
        </div>

        {/* Revenue Chart - Full Width */}
        <div className="w-full">
          <RevenueChart 
            data={revenueData} 
            loading={chartsLoading}
            error={revenueData === null && !chartsLoading ? 'Veri yüklenemedi' : undefined}
          />
        </div>

        {/* Orders and Equipment Charts - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrdersChart 
            data={ordersData}
            loading={chartsLoading}
            error={ordersData === null && !chartsLoading ? 'Veri yüklenemedi' : undefined}
            onPeriodChange={handleOrdersPeriodChange}
          />
          <EquipmentUtilizationChart 
            data={equipmentData}
            loading={chartsLoading}
            error={equipmentData === null && !chartsLoading ? 'Veri yüklenemedi' : undefined}
          />
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
