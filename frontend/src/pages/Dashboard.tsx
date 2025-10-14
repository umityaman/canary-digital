import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Wrench,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

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

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('İstatistikler yüklenemedi');
      }
    } catch (err: any) {
      console.error('Dashboard stats error:', err);
      setError(err.response?.data?.message || 'Bir hata oluştu');
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

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="ml-1">{Math.abs(value).toFixed(1)}%</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Genel Bakış ve İstatistikler</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              {formatPercentage(stats.revenue.change)}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Aylık Gelir</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(stats.revenue.monthly)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Toplam: {formatCurrency(stats.revenue.total)}
            </p>
          </div>

          {/* Total Reservations Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              {formatPercentage(stats.reservations.change)}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Toplam Rezervasyon</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.reservations.total}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Tamamlanan: {stats.reservations.completed}
            </p>
          </div>

          {/* Active Reservations Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="text-orange-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Aktif Rezervasyon</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.reservations.active}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Devam eden işlemler
            </p>
          </div>

          {/* Equipment Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Toplam Ekipman</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.equipment.total}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Uygun: {stats.equipment.available}
            </p>
          </div>
        </div>

        {/* Equipment Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Equipment Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ekipman Durumu
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600 mr-3" size={20} />
                  <span className="text-gray-700">Uygun</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.equipment.available}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="text-orange-600 mr-3" size={20} />
                  <span className="text-gray-700">Kullanımda</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.equipment.inUse}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wrench className="text-red-600 mr-3" size={20} />
                  <span className="text-gray-700">Bakımda</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.equipment.maintenance}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Reservations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Son Rezervasyonlar
            </h3>
            <div className="space-y-3">
              {stats.recentReservations.length > 0 ? (
                stats.recentReservations.map((reservation: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {reservation.reservationNo || `#${reservation.id}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {reservation.customerName || 'Müşteri'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        reservation.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : reservation.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Henüz rezervasyon yok
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Yaklaşan Rezervasyonlar
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Rezervasyon No
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Müşteri
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Başlangıç
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingReservations.length > 0 ? (
                  stats.upcomingReservations.map((reservation: any, index: number) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {reservation.reservationNo || `#${reservation.id}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {reservation.customerName || 'Müşteri'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(reservation.startDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            reservation.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      Yaklaşan rezervasyon yok
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
