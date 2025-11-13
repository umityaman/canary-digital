import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  Download,
  Filter,
  Users,
  ShoppingCart,
  Percent,
  Search,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { card, button, input, statCardIcon, cx } from '../../styles/design-tokens';

interface Payment {
  id: number;
  orderNo: string;
  customerName: string;
  seller: string;
  amount: number;
  commission: number;
  method: string;
  status: string;
  date: string;
}

interface SellerReport {
  id: number;
  name: string;
  totalSales: number;
  commission: number;
  orders: number;
  avgOrderValue: number;
}

const FinanceReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'sellers'>(
    'overview'
  );

  const revenueData = [
    { month: 'Oca', revenue: 125000, expenses: 45000 },
    { month: 'Şub', revenue: 145000, expenses: 52000 },
    { month: 'Mar', revenue: 165000, expenses: 48000 },
    { month: 'Nis', revenue: 185000, expenses: 55000 },
    { month: 'May', revenue: 210000, expenses: 58000 },
    { month: 'Haz', revenue: 235000, expenses: 62000 },
  ];

  const categoryData = [
    { category: 'Kamera', amount: 125000 },
    { category: 'Objektif', amount: 85000 },
    { category: 'Aydınlatma', amount: 65000 },
    { category: 'Ses', amount: 48000 },
    { category: 'Aksesuar', amount: 32000 },
  ];

  const payments: Payment[] = [
    {
      id: 1,
      orderNo: '#ORD-1245',
      customerName: 'Ahmet Yılmaz',
      seller: 'Canary Digital',
      amount: 15000,
      commission: 1500,
      method: 'Kredi Kartı',
      status: 'completed',
      date: '15 Eki 2024',
    },
    {
      id: 2,
      orderNo: '#ORD-1246',
      customerName: 'Mehmet Demir',
      seller: 'Tech Rental',
      amount: 8500,
      commission: 850,
      method: 'Havale',
      status: 'completed',
      date: '15 Eki 2024',
    },
    {
      id: 3,
      orderNo: '#ORD-1247',
      customerName: 'Ayşe Kaya',
      seller: 'Canary Digital',
      amount: 12000,
      commission: 1200,
      method: 'Kredi Kartı',
      status: 'pending',
      date: '14 Eki 2024',
    },
  ];

  const sellers: SellerReport[] = [
    {
      id: 1,
      name: 'Canary Digital',
      totalSales: 235000,
      commission: 23500,
      orders: 145,
      avgOrderValue: 1621,
    },
    {
      id: 2,
      name: 'Tech Rental',
      totalSales: 185000,
      commission: 18500,
      orders: 112,
      avgOrderValue: 1652,
    },
    {
      id: 3,
      name: 'Pro Equipment',
      totalSales: 125000,
      commission: 12500,
      orders: 78,
      avgOrderValue: 1603,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-neutral-900 text-white';
      case 'pending':
        return 'bg-neutral-200 text-neutral-700';
      case 'failed':
        return 'bg-neutral-500 text-white';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'pending':
        return 'Beklemede';
      case 'failed':
        return 'Başarısız';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
          <DollarSign size={32} className="text-neutral-900" />
          Finans & Raporlama
        </h1>
        <p className="text-neutral-600 mt-1">
          Gelir-gider takibi ve mali raporlar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ boxSizing: 'border-box' }}>
        <div className={card('md', 'sm', 'default', 'xl')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('success')}>
              <TrendingUp className="text-green-700" size={20} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Bu Ay</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-0.5">₺355K</h3>
          <p className="text-xs font-medium text-neutral-600">Toplam Gelir</p>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <TrendingUp size={12} />
            +18% artış
          </div>
        </div>

        <div className={card('md', 'sm', 'default', 'xl')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('error')}>
              <TrendingDown className="text-red-700" size={20} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Bu Ay</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-0.5">₺120K</h3>
          <p className="text-xs font-medium text-neutral-600">Toplam Gider</p>
          <div className="flex items-center gap-1 text-xs text-neutral-600 mt-1">
            <TrendingDown size={12} />
            -5% azalış
          </div>
        </div>

        <div className={card('md', 'sm', 'default', 'xl')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('info')}>
              <DollarSign className="text-blue-700" size={20} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Kar Marjı</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-0.5">₺235K</h3>
          <p className="text-xs font-medium text-neutral-600">Net Kar</p>
          <div className="text-xs text-neutral-600 mt-1">%66 marj oranı</div>
        </div>

        <div className={card('md', 'sm', 'default', 'xl')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('warning')}>
              <Percent className="text-orange-700" size={20} />
            </div>
            <span className="text-xs font-medium text-neutral-600">335 Sipariş</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-0.5">₺54.5K</h3>
          <p className="text-xs font-medium text-neutral-600">Komisyon Geliri</p>
          <div className="text-xs text-neutral-600 mt-1">Ort. ₺163/sipariş</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className={card('sm', 'sm', 'default', 'lg')}>
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Rapor ara..."
                className={cx(input('md', 'default', undefined, 'md'), 'pl-10')}
              />
            </div>
          </div>

          {/* Filters + Action Buttons */}
          <div className="flex flex-wrap gap-2" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <select className="flex-1 min-w-[150px] max-w-[200px] px-4 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all">
              <option value="">Rapor Tipi</option>
              <option value="financial">Finansal Raporlar</option>
              <option value="customer">Müşteri Raporları</option>
              <option value="inventory">Stok Raporları</option>
              <option value="tax">Vergi Raporları</option>
            </select>

            <select className="flex-1 min-w-[130px] px-4 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all">
              <option value="">Tarih Aralığı</option>
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="quarter">Bu Çeyrek</option>
              <option value="year">Bu Yıl</option>
              <option value="custom">Özel Aralık</option>
            </select>

            <button className={cx(button('md', 'outline', 'md'), 'gap-2 whitespace-nowrap')}>
              <Filter size={18} />
              <span className="hidden sm:inline">Filtrele</span>
            </button>

            <button className={cx(button('md', 'primary', 'md'), 'gap-2 whitespace-nowrap')}>
              <Download size={18} />
              <span>Excel İndir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={activeTab === 'overview' ? button('md', 'primary', 'lg') : button('md', 'outline', 'lg')}
        >
          Genel Bakış
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={activeTab === 'payments' ? button('md', 'primary', 'lg') : button('md', 'outline', 'lg')}
        >
          Ödemeler
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={activeTab === 'sellers' ? button('md', 'primary', 'lg') : button('md', 'outline', 'lg')}
        >
          Satıcı Raporları
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Chart */}
          <div className={card('md', 'sm', 'default', 'xl')}>
            <h3 className="text-lg font-bold text-neutral-900 mb-6">
              Gelir-Gider Grafiği
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#171717"
                  strokeWidth={3}
                  name="Gelir"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#737373"
                  strokeWidth={3}
                  name="Gider"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Performance */}
          <div className={card('md', 'sm', 'default', 'xl')}>
            <h3 className="text-lg font-bold text-neutral-900 mb-6">
              Kategori Bazlı Gelir
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="category" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="amount" fill="#171717" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={card('md', 'sm', 'default', 'xl')}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-neutral-600">Ödeme Yöntemleri</h4>
                <CreditCard size={20} className="text-neutral-700" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Kredi Kartı</span>
                  <span className="text-sm font-bold text-neutral-900">₺285K (80%)</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div className="bg-neutral-900 h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Havale</span>
                  <span className="text-sm font-bold text-neutral-900">₺70K (20%)</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div className="bg-neutral-700 h-full rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>

            <div className={card('md', 'sm', 'default', 'xl')}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-neutral-600">Müşteri Dağılımı</h4>
                <Users size={20} className="text-neutral-700" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Kurumsal</span>
                  <span className="text-sm font-bold text-neutral-900">₺215K (60%)</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div className="bg-neutral-900 h-full rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Bireysel</span>
                  <span className="text-sm font-bold text-neutral-900">₺140K (40%)</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div className="bg-neutral-700 h-full rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>

            <div className={card('md', 'sm', 'default', 'xl')}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-neutral-600">Sipariş İstatistikleri</h4>
                <ShoppingCart size={20} className="text-neutral-700" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Toplam Sipariş</span>
                  <span className="text-sm font-bold text-neutral-900">335</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Ortalama Tutar</span>
                  <span className="text-sm font-bold text-neutral-900">₺1,059</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">Tekrar Müşteri</span>
                  <span className="text-sm font-bold text-neutral-900">42%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className={card('flat', 'sm', 'default', 'xl')}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Sipariş No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Satıcı
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Komisyon
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Ödeme Yöntemi
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono font-medium text-neutral-900">
                        {payment.orderNo}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {payment.seller}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-neutral-900 text-right">
                      ₺{payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-700 text-right">
                      ₺{payment.commission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <CreditCard size={14} className="text-neutral-700" />
                        <span className="text-sm text-neutral-700">{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-neutral-700">
                        <Calendar size={14} />
                        {payment.date}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sellers Tab */}
      {activeTab === 'sellers' && (
        <div className={card('flat', 'sm', 'default', 'xl')}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Satıcı Adı
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Toplam Satış
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Komisyon
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Sipariş Sayısı
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                    Ortalama Sipariş
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold">
                          {seller.name[0]}
                        </div>
                        <span className="text-sm font-medium text-neutral-900">
                          {seller.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-neutral-900 text-right">
                      ₺{seller.totalSales.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-700 text-right">
                      ₺{seller.commission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 text-right">
                      {seller.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 text-right">
                      ₺{seller.avgOrderValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="px-4 py-2 bg-neutral-900 text-white text-xs rounded-lg hover:bg-neutral-800 transition-colors">
                        Detaylı Rapor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReports;
