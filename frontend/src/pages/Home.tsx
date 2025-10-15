import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Calendar,
  AlertCircle,
  CheckSquare,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { subDays, format } from 'date-fns';
import api from '../services/api';
import { analyticsAPI } from '../services/api';
import ClockWidget from '../components/widgets/ClockWidget';
import CalculatorWidget from '../components/widgets/CalculatorWidget';
import CurrencyWidget from '../components/widgets/CurrencyWidget';
import DateRangeSelector from '../components/charts/DateRangeSelector';
import RevenueChart from '../components/charts/RevenueChart';
import UtilizationChart from '../components/charts/UtilizationChart';
import StatusChart from '../components/charts/StatusChart';
import TopEquipmentChart from '../components/charts/TopEquipmentChart';
import ExportButtons from '../components/charts/ExportButtons';
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
  alerts?: {
    lowStock?: number;
    pendingInspections?: number;
  };
  calendar?: {
    upcomingEvents?: number;
  };
  recent?: {
    orders: Array<{
      id: number;
      orderNumber: string;
      customer: string;
      amount: number;
      status: string;
      date: string;
    }>;
  };
}

// Legacy interface for compatibility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [utilizationData, setUtilizationData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [topEquipmentData, setTopEquipmentData] = useState<any[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    label: 'Son 30 Gün',
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchChartsData();
  }, [dateRange]);

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
      
      const startDate = format(dateRange.startDate, 'yyyy-MM-dd');
      const endDate = format(dateRange.endDate, 'yyyy-MM-dd');
      
      // Fetch real data from analytics API with fallback to mock data
      try {
        const [revenueRes, utilizationRes, statusRes, topEquipmentRes] = await Promise.all([
          analyticsAPI.getRevenue(startDate, endDate),
          analyticsAPI.getUtilization(startDate, endDate),
          analyticsAPI.getStatus(),
          analyticsAPI.getTopEquipment(10),
        ]);
        
        setRevenueData(revenueRes.data);
        setUtilizationData(utilizationRes.data);
        setStatusData(statusRes.data);
        setTopEquipmentData(topEquipmentRes.data);
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
        // Fallback to mock data
        const mockRevenueData = generateMockRevenueData(dateRange.startDate, dateRange.endDate);
        const mockUtilizationData = generateMockUtilizationData(dateRange.startDate, dateRange.endDate);
        const mockStatusData = generateMockStatusData();
        const mockTopEquipmentData = generateMockTopEquipmentData();
        
        setRevenueData(mockRevenueData);
        setUtilizationData(mockUtilizationData);
        setStatusData(mockStatusData);
        setTopEquipmentData(mockTopEquipmentData);
      }
      
    } catch (error) {
      console.error('Failed to fetch charts data:', error);
    } finally {
      setChartsLoading(false);
    }
  };

  // Mock data generators
  const generateMockRevenueData = (start: Date, end: Date) => {
    const data = [];
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 15000) + 5000,
        orders: Math.floor(Math.random() * 20) + 5,
      });
    }
    return data;
  };

  const generateMockUtilizationData = (start: Date, end: Date) => {
    const data = [];
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const totalEquipment = 50;
      const activeRentals = Math.floor(Math.random() * 40) + 10;
      data.push({
        date: date.toISOString().split('T')[0],
        utilizationRate: (activeRentals / totalEquipment) * 100,
        activeRentals,
        totalEquipment,
      });
    }
    return data;
  };

  const generateMockStatusData = () => {
    return [
      { status: 'PENDING', count: 12, color: '#f59e0b' },
      { status: 'APPROVED', count: 8, color: '#10b981' },
      { status: 'ACTIVE', count: 25, color: '#3b82f6' },
      { status: 'COMPLETED', count: 45, color: '#6366f1' },
      { status: 'CANCELLED', count: 5, color: '#ef4444' },
    ];
  };

  const generateMockTopEquipmentData = () => {
    return [
      { name: 'Hilti TE 3000-AVR', rentCount: 45, revenue: 135000 },
      { name: 'Bosch GBH 5-40 DCE', rentCount: 38, revenue: 114000 },
      { name: 'Makita HR4013C', rentCount: 32, revenue: 96000 },
      { name: 'DeWalt D25901K', rentCount: 28, revenue: 84000 },
      { name: 'Milwaukee MXF368-2XC', rentCount: 25, revenue: 75000 },
      { name: 'Metabo KHE 96', rentCount: 22, revenue: 66000 },
      { name: 'Hitachi DH45ME', rentCount: 18, revenue: 54000 },
      { name: 'Ryobi RH850V', rentCount: 15, revenue: 45000 },
      { name: 'Black & Decker BEH850K', rentCount: 12, revenue: 36000 },
      { name: 'Einhell RT-RH 32', rentCount: 10, revenue: 30000 },
    ];
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
      {((stats.alerts?.pendingInspections || 0) > 0 || (stats.calendar?.upcomingEvents || 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(stats.alerts?.pendingInspections || 0) > 0 && (
            <div className="bg-neutral-50 border border-neutral-300 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-neutral-700 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">Bekleyen Kontroller</h3>
                  <p className="text-sm text-neutral-700">
                    <strong>{stats.alerts?.pendingInspections || 0}</strong> ekipman kontrol bekliyor
                  </p>
                </div>
              </div>
            </div>
          )}

          {(stats.calendar?.upcomingEvents || 0) > 0 && (
            <div className="bg-neutral-50 border border-neutral-300 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Calendar className="text-neutral-700 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">Yaklaşan Etkinlikler</h3>
                  <p className="text-sm text-neutral-700">
                    Önümüzdeki 7 gün içinde <strong>{stats.calendar?.upcomingEvents || 0}</strong> etkinlik
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
            {(stats.recent?.orders || []).map((order: any) => (
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

            {((stats.recent?.orders || []).length === 0) && (
              <p className="text-center text-neutral-600 py-8">Henüz sipariş bulunmuyor</p>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Dashboard Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">📊 Gelişmiş Dashboard</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Kapsamlı analiz ve raporlama araçları
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButtons
              data={revenueData}
              filename="dashboard-raporu"
              chartElementId="dashboard-charts-container"
            />
            <button 
              onClick={fetchChartsData}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              <span className="text-sm font-medium">Yenile</span>
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <DateRangeSelector
          selectedRange={dateRange}
          onRangeChange={setDateRange}
        />

        {/* Charts Container for Export */}
        <div id="dashboard-charts-container" className="space-y-6">
          {/* Revenue Chart - Full Width */}
          <div className="w-full">
            <RevenueChart 
              data={revenueData as any} 
              isLoading={chartsLoading}
            />
          </div>

          {/* Utilization and Status Charts - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UtilizationChart 
              data={utilizationData}
              isLoading={chartsLoading}
            />
            <StatusChart 
              data={statusData}
              isLoading={chartsLoading}
            />
          </div>

          {/* Top Equipment Chart - Full Width */}
          <div className="w-full">
            <TopEquipmentChart 
              data={topEquipmentData}
              isLoading={chartsLoading}
            />
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
