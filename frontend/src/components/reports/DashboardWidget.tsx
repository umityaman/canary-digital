import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  Users,
  AlertTriangle,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { reportAPI } from '../../services/api';

interface DashboardStats {
  overview: {
    totalEquipment: number;
    totalReservations: number;
    activeReservations: number;
    completedReservations: number;
    currentRevenue: number;
    previousRevenue: number;
    revenueChange: number;
  };
  topEquipment: Array<{
    id: number;
    name: string;
    code: string;
    category: string;
    reservationCount: number;
    totalQuantityRented: number;
    totalRevenue: number;
  }>;
  lowStockEquipment: Array<{
    id: number;
    name: string;
    code: string;
    category: string;
    quantity: number;
  }>;
  upcomingReservations: Array<{
    id: number;
    reservationNo: string;
    customerName: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    itemCount: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
    periodDays: number;
  };
}

interface DashboardWidgetProps {
  companyId: number;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ companyId }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadDashboard();
  }, [companyId, dateRange]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      let endDate = new Date(now);

      if (dateRange === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (dateRange === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      const response = await reportAPI.getDashboard({
        companyId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        Dashboard verisi yüklenemedi
      </div>
    );
  }

  const { overview, topEquipment, lowStockEquipment, upcomingReservations } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(stats.period.startDate)} - {formatDate(stats.period.endDate)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 text-sm ${
                dateRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Bu Ay
            </button>
            <button
              onClick={() => setDateRange('quarter')}
              className={`px-4 py-2 text-sm border-l ${
                dateRange === 'quarter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Çeyrek
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-4 py-2 text-sm border-l ${
                dateRange === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Yıl
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadDashboard}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            {overview.revenueChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm ${
                  overview.revenueChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {overview.revenueChange > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(overview.revenueChange).toFixed(1)}%
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Toplam Gelir</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {formatCurrency(overview.currentRevenue)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Önceki dönem: {formatCurrency(overview.previousRevenue)}
            </p>
          </div>
        </div>

        {/* Reservations Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Toplam Rezervasyon</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {overview.totalReservations}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Aktif: {overview.activeReservations} • Tamamlanan: {overview.completedReservations}
            </p>
          </div>
        </div>

        {/* Equipment Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Toplam Ekipman</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {overview.totalEquipment}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Düşük stok: {lowStockEquipment.length} adet
            </p>
          </div>
        </div>

        {/* Active Reservations Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Aktif Rezervasyonlar</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {overview.activeReservations}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Yaklaşan: {upcomingReservations.length} adet
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Equipment */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">En Çok Kiralanan Ekipmanlar</h3>
          </div>
          <div className="p-6">
            {topEquipment.length > 0 ? (
              <div className="space-y-4">
                {topEquipment.map((equip, idx) => (
                  <div key={equip.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{equip.name}</p>
                      <p className="text-sm text-gray-500">
                        {equip.code} • {equip.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {formatCurrency(equip.totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {equip.reservationCount} rezervasyon
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Veri bulunamadı</p>
            )}
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Yaklaşan Rezervasyonlar</h3>
          </div>
          <div className="p-6">
            {upcomingReservations.length > 0 ? (
              <div className="space-y-4">
                {upcomingReservations.map((res) => (
                  <div key={res.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{res.reservationNo}</p>
                      <p className="text-sm text-gray-600">{res.customerName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(res.startDate)} - {formatDate(res.endDate)} •{' '}
                        {res.itemCount} ekipman
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 text-sm">
                        {formatCurrency(res.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Yaklaşan rezervasyon yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockEquipment.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 mb-2">Düşük Stok Uyarısı</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockEquipment.map((equip) => (
                  <div key={equip.id} className="bg-white rounded p-3">
                    <p className="font-medium text-gray-800 text-sm">{equip.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {equip.code} • {equip.category}
                    </p>
                    <p className="text-xs text-yellow-600 font-semibold mt-1">
                      Stok: {equip.quantity} adet
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardWidget;
