import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  Users,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-hot-toast';

interface FinancialReportsProps {
  invoices: any[];
  offers: any[];
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ invoices, offers }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const filteredInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.invoiceDate);
      return invDate >= new Date(dateRange.startDate) && invDate <= new Date(dateRange.endDate);
    });

    const filteredOffers = offers.filter(off => {
      const offDate = new Date(off.offerDate);
      return offDate >= new Date(dateRange.startDate) && offDate <= new Date(dateRange.endDate);
    });

    const totalInvoices = filteredInvoices.length;
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalCollected = filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pendingPayments = filteredInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const overdueInvoices = filteredInvoices.filter(inv => 
      new Date(inv.dueDate) < new Date() && inv.status !== 'paid' && inv.status !== 'cancelled'
    ).length;

    const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid').length;
    const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    const totalOffers = filteredOffers.length;
    const acceptedOffers = filteredOffers.filter(off => off.status === 'accepted').length;
    const offerAcceptanceRate = totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0;

    // Previous month comparison
    const lastMonthStart = new Date(new Date(dateRange.startDate).setMonth(new Date(dateRange.startDate).getMonth() - 1));
    const lastMonthEnd = new Date(dateRange.startDate);
    
    const lastMonthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.invoiceDate);
      return invDate >= lastMonthStart && invDate < lastMonthEnd;
    });
    
    const lastMonthRevenue = lastMonthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const revenueChange = lastMonthRevenue > 0 
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    return {
      totalInvoices,
      totalRevenue,
      totalCollected,
      pendingPayments,
      overdueInvoices,
      paidInvoices,
      averageInvoice,
      totalOffers,
      offerAcceptanceRate,
      revenueChange,
    };
  }, [invoices, offers, dateRange]);

  // Monthly revenue data
  const monthlyRevenueData = useMemo(() => {
    const months: { [key: string]: { revenue: number; paid: number; pending: number } } = {};

    invoices.forEach(inv => {
      const date = new Date(inv.invoiceDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { revenue: 0, paid: 0, pending: 0 };
      }
      
      months[monthKey].revenue += inv.grandTotal;
      months[monthKey].paid += inv.paidAmount;
      months[monthKey].pending += inv.remainingAmount;
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
        revenue: data.revenue,
        paid: data.paid,
        pending: data.pending,
      }));
  }, [invoices]);

  // Payment status distribution
  const paymentStatusData = useMemo(() => {
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const pending = invoices.filter(inv => inv.status === 'pending').length;
    const overdue = invoices.filter(inv => inv.status === 'overdue').length;
    const cancelled = invoices.filter(inv => inv.status === 'cancelled').length;

    return [
      { name: 'Ödendi', value: paid, color: '#10b981' },
      { name: 'Beklemede', value: pending, color: '#f59e0b' },
      { name: 'Gecikmiş', value: overdue, color: '#ef4444' },
      { name: 'İptal', value: cancelled, color: '#6b7280' },
    ].filter(item => item.value > 0);
  }, [invoices]);

  // Top customers by revenue
  const topCustomers = useMemo(() => {
    const customerRevenue: { [key: number]: { name: string; revenue: number } } = {};

    invoices.forEach(inv => {
      const customerId = inv.customer.id;
      if (!customerRevenue[customerId]) {
        customerRevenue[customerId] = {
          name: inv.customer.name,
          revenue: 0,
        };
      }
      customerRevenue[customerId].revenue += inv.grandTotal;
    });

    return Object.values(customerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [invoices]);

  // Offer status distribution
  const offerStatusData = useMemo(() => {
    const draft = offers.filter(off => off.status === 'draft').length;
    const sent = offers.filter(off => off.status === 'sent').length;
    const accepted = offers.filter(off => off.status === 'accepted').length;
    const rejected = offers.filter(off => off.status === 'rejected').length;

    return [
      { name: 'Taslak', value: draft, color: '#6b7280' },
      { name: 'Gönderildi', value: sent, color: '#3b82f6' },
      { name: 'Kabul', value: accepted, color: '#10b981' },
      { name: 'Red', value: rejected, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [offers]);

  const handleExportPDF = () => {
    toast.success('PDF export özelliği yakında eklenecek');
  };

  const handleExportExcel = () => {
    toast.success('Excel export özelliği yakında eklenecek');
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finansal Raporlar</h2>
          <p className="text-sm text-gray-500 mt-1">Gelir, gider ve ödeme analizleri</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Tarih Aralığı:</span>
          </div>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            {stats.revenueChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stats.revenueChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.revenueChange > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(stats.revenueChange).toFixed(1)}%
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Toplam Gelir</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.totalInvoices} fatura</p>
        </div>

        {/* Total Collected */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Toplam Tahsilat</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalRevenue > 0 
              ? `${((stats.totalCollected / stats.totalRevenue) * 100).toFixed(1)}% tahsil edildi`
              : '0% tahsil edildi'
            }
          </p>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Bekleyen Ödemeler</h3>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingPayments)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalInvoices - stats.paidInvoices} fatura beklemede
          </p>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Gecikmiş Faturalar</h3>
          <p className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</p>
          <p className="text-xs text-gray-500 mt-2">Vade tarihi geçmiş</p>
        </div>

        {/* Average Invoice */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Ortalama Fatura</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageInvoice)}</p>
          <p className="text-xs text-gray-500 mt-2">Fatura başına</p>
        </div>

        {/* Total Offers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Toplam Teklif</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOffers}</p>
          <p className="text-xs text-gray-500 mt-2">Oluşturulan teklif sayısı</p>
        </div>

        {/* Offer Acceptance Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Teklif Kabul Oranı</h3>
          <p className="text-2xl font-bold text-teal-600">{stats.offerAcceptanceRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-2">Kabul edilen teklifler</p>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Ödenmiş Faturalar</h3>
          <p className="text-2xl font-bold text-emerald-600">{stats.paidInvoices}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalInvoices > 0 
              ? `${((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1)}% tamamlandı`
              : '0% tamamlandı'
            }
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Gelir Grafiği</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Toplam Gelir" strokeWidth={2} />
              <Line type="monotone" dataKey="paid" stroke="#10b981" name="Tahsilat" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Bekleyen" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Durumu Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customers Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Çok Kazandıran Müşteriler</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCustomers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#3b82f6" name="Gelir" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Offer Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Durumları</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={offerStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {offerStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              En İyi Müşteriler
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gelir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(customer.revenue)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Overdue Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Gecikmiş Ödemeler
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices
                  .filter(inv => new Date(inv.dueDate) < new Date() && inv.status !== 'paid' && inv.status !== 'cancelled')
                  .slice(0, 5)
                  .map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{invoice.customer.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-red-600">{formatCurrency(invoice.remainingAmount)}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
