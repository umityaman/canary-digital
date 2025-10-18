import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  status: 'available' | 'rented' | 'maintenance';
  totalBookings: number;
  revenue: number;
  availability: number; // percentage
}

const RentalManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'bookings' | 'calendar'>('products');

  const products: Product[] = [
    {
      id: 1,
      name: 'Sony A7 IV',
      category: 'Kamera',
      dailyPrice: 450,
      weeklyPrice: 2700,
      monthlyPrice: 9000,
      status: 'rented',
      totalBookings: 45,
      revenue: 125000,
      availability: 65,
    },
    {
      id: 2,
      name: 'Canon EOS R6',
      category: 'Kamera',
      dailyPrice: 400,
      weeklyPrice: 2400,
      monthlyPrice: 8000,
      status: 'available',
      totalBookings: 32,
      revenue: 89000,
      availability: 85,
    },
    {
      id: 3,
      name: 'DJI Ronin RS3',
      category: 'Gimbal',
      dailyPrice: 200,
      weeklyPrice: 1200,
      monthlyPrice: 4000,
      status: 'maintenance',
      totalBookings: 28,
      revenue: 67000,
      availability: 0,
    },
  ];

  const bookings = [
    {
      id: 1,
      productName: 'Sony A7 IV',
      customerName: 'Ahmet Yılmaz',
      startDate: '20 Eki 2025',
      endDate: '27 Eki 2025',
      duration: '7 gün',
      totalPrice: 2700,
      status: 'active',
      paymentStatus: 'paid',
    },
    {
      id: 2,
      productName: 'Canon EOS R6',
      customerName: 'Mehmet Demir',
      startDate: '25 Eki 2025',
      endDate: '28 Eki 2025',
      duration: '3 gün',
      totalPrice: 1200,
      status: 'confirmed',
      paymentStatus: 'pending',
    },
    {
      id: 3,
      productName: 'DJI Ronin RS3',
      customerName: 'Ayşe Kaya',
      startDate: '15 Eki 2025',
      endDate: '20 Eki 2025',
      duration: '5 gün',
      totalPrice: 1000,
      status: 'completed',
      paymentStatus: 'paid',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-neutral-900 text-white',
      rented: 'bg-neutral-600 text-white',
      maintenance: 'bg-neutral-400 text-white',
      active: 'bg-neutral-900 text-white',
      confirmed: 'bg-neutral-700 text-white',
      completed: 'bg-neutral-500 text-white',
      cancelled: 'bg-neutral-400 text-white',
    };
    return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-900';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      available: 'Müsait',
      rented: 'Kiralandı',
      maintenance: 'Bakımda',
      active: 'Aktif',
      confirmed: 'Onaylandı',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
      paid: 'Ödendi',
      pending: 'Beklemede',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const totalRevenue = products.reduce((acc, p) => acc + p.revenue, 0);
  const totalBookings = products.reduce((acc, p) => acc + p.totalBookings, 0);
  const activeBookings = bookings.filter((b) => b.status === 'active').length;
  const availableProducts = products.filter((p) => p.status === 'available').length;

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <ShoppingBag size={32} className="text-neutral-900" />
              Kiralama Yönetimi
            </h1>
            <p className="text-neutral-600 mt-1">Ürünler ve rezervasyonları yönetin</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Ürün
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Gelir</span>
              <DollarSign size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              ₺{totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Rezervasyon</span>
              <Calendar size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{totalBookings}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Aktif Kiralama</span>
              <Clock size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{activeBookings}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Müsait Ürün</span>
              <Package size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{availableProducts}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'products'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Ürünler
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'bookings'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Rezervasyonlar
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'calendar'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Takvim
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Ürün veya müşteri ara..."
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors">
          <Filter size={20} />
          Filtrele
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Günlük Fiyat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Haftalık
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Aylık
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Müsaitlik
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Rezervasyon
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Gelir
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 text-right">
                      ₺{product.dailyPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 text-right">
                      ₺{product.weeklyPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 text-right">
                      ₺{product.monthlyPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {product.status === 'available' ? (
                          <CheckCircle2 size={14} />
                        ) : product.status === 'rented' ? (
                          <Clock size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-neutral-100 rounded-full h-2">
                          <div
                            className="bg-neutral-900 h-2 rounded-full"
                            style={{ width: `${product.availability}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-neutral-600">{product.availability}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 text-right">
                      {product.totalBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-neutral-900 text-right">
                      ₺{product.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Eye size={16} className="text-neutral-700" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Edit size={16} className="text-neutral-700" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-neutral-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Başlangıç
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Bitiş
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Süre
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Ödeme
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">
                        {booking.productName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {booking.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {booking.startDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {booking.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 text-center">
                      {booking.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-neutral-900 text-right">
                      ₺{booking.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.paymentStatus
                        )}`}
                      >
                        {getStatusLabel(booking.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Eye size={16} className="text-neutral-700" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Edit size={16} className="text-neutral-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Rezervasyon Takvimi</h3>
            <p className="text-neutral-600">Takvim görünümü yakında eklenecek</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalManagement;
