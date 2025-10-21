import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Plus, Search, ChevronDown, ChevronUp, Calendar as CalendarIcon,
  Package, DollarSign, AlertCircle, Clock, User, MapPin, FileText,
  Mail, Phone, Tag, StickyNote
} from 'lucide-react';
import Layout from '../components/Layout';

type TabType = 'all' | 'upcoming' | 'late' | 'shortage';
type StatusFilter = 'draft' | 'reserved' | 'started' | 'returned' | 'archived' | 'canceled';
type PaymentFilter = 'payment_due' | 'partially_paid' | 'paid' | 'overpaid' | 'process_deposit';

const Reservations: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([]);
  const [paymentFilters, setPaymentFilters] = useState<PaymentFilter[]>([]);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'yesterday' | 'tomorrow' | 'this_week' | 'last_week' | 'next_week' | 'this_month' | 'last_month' | 'next_month' | 'this_year' | 'last_year' | 'next_year' | 'custom'>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Customer Filter
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<number | null>(null);
  const [showCustomerFilter, setShowCustomerFilter] = useState(false);
  const [customerFilterOpen, setCustomerFilterOpen] = useState(true);
  
  // Sorting
  const [sortBy, setSortBy] = useState<'date' | 'customer' | 'total' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Bulk Actions
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Data Loading
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sections
  const [statusOpen, setStatusOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(true);
  const [dateRangeOpen, setDateRangeOpen] = useState(true);

  // Calculate real stats from orders
  const stats = {
    orders: orders.length,
    itemsOrdered: orders.reduce((sum, order) => sum + (order.orderItems?.length || 0), 0),
    revenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    due: orders
      .filter(o => o.paymentStatus?.toLowerCase() === 'payment_due' || o.paymentStatus?.toLowerCase() === 'partially_paid')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  };
  
  // Get unique customers from orders
  const uniqueCustomers = Array.from(
    new Map(
      orders
        .filter(o => o.customer)
        .map(o => [o.customer.id, o.customer])
    ).values()
  );

  // Calculate filter counts from real data
  const statusCounts = {
    draft: orders.filter(o => o.status?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'draft').length,
    reserved: orders.filter(o => o.status?.toLowerCase() === 'confirmed' || o.status?.toLowerCase() === 'reserved').length,
    started: orders.filter(o => o.status?.toLowerCase() === 'active' || o.status?.toLowerCase() === 'started').length,
    returned: orders.filter(o => o.status?.toLowerCase() === 'completed' || o.status?.toLowerCase() === 'returned').length,
    archived: orders.filter(o => o.status?.toLowerCase() === 'archived').length,
    canceled: orders.filter(o => o.status?.toLowerCase() === 'cancelled' || o.status?.toLowerCase() === 'canceled').length
  };

  const paymentCounts = {
    payment_due: orders.filter(o => o.paymentStatus?.toLowerCase() === 'payment_due' || o.paymentStatus?.toLowerCase() === 'pending').length,
    partially_paid: orders.filter(o => o.paymentStatus?.toLowerCase() === 'partially_paid').length,
    paid: orders.filter(o => o.paymentStatus?.toLowerCase() === 'paid').length,
    overpaid: orders.filter(o => o.paymentStatus?.toLowerCase() === 'overpaid').length,
    process_deposit: orders.filter(o => o.paymentStatus?.toLowerCase() === 'process_deposit').length
  };

  const toggleStatusFilter = (status: StatusFilter) => {
    setStatusFilters(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePaymentFilter = (payment: PaymentFilter) => {
    setPaymentFilters(prev =>
      prev.includes(payment) ? prev.filter(p => p !== payment) : [...prev, payment]
    );
  };

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data || []);
      } catch (err: any) {
        console.error('Fetch orders error:', err);
        setError(err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Sorting handler
  const handleSort = (field: 'date' | 'customer' | 'total' | 'status') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Bulk selection handlers
  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === sortedOrders.length && sortedOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(sortedOrders.map(o => o.id));
    }
  };

  // Bulk actions handlers
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', `${selectedOrders.length} kiralama başarıyla güncellendi`);
      setSelectedOrders([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk update failed:', error);
      showNotification('error', 'Toplu güncelleme başarısız oldu');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    
    const confirmed = window.confirm(`${selectedOrders.length} kiralamayı silmek istediğinizden emin misiniz?`);
    if (!confirmed) return;
    
    setBulkActionLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', `${selectedOrders.length} kiralama başarıyla silindi`);
      setSelectedOrders([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      showNotification('error', 'Toplu silme başarısız oldu');
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  // Export to CSV Handler
  const handleExportToCSV = () => {
    // Prepare CSV data
    const headers = ['Kiralama #', 'Tarih', 'Müşteri', 'Durum', 'Ödeme Durumu', 'Toplam Tutar'];
    const csvData = sortedOrders.map(order => [
      order.orderNumber || `#${order.id}`,
      new Date(order.createdAt || order.startDate).toLocaleDateString(),
      order.customer?.name || 'Yok',
      order.status || 'BEKLEMEDE',
      order.paymentStatus || 'ödeme_bekleniyor',
      `₺${(order.totalAmount || 0).toFixed(2)}`
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilters.length > 0 && !statusFilters.includes(order.status?.toLowerCase())) {
      return false;
    }
    
    // Customer filter
    if (selectedCustomerFilter && order.customerId !== selectedCustomerFilter) {
      return false;
    }
    
    // Date range filter
    if (dateRange !== 'all') {
      const orderDate = new Date(order.createdAt || order.startDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateRange) {
        case 'today':
          if (orderDate < today || orderDate >= new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
            return false;
          }
          break;
        case 'yesterday':
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          if (orderDate < yesterday || orderDate >= today) {
            return false;
          }
          break;
        case 'this_week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          if (orderDate < weekStart) {
            return false;
          }
          break;
        case 'this_month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          if (orderDate < monthStart) {
            return false;
          }
          break;
        case 'custom':
          if (customStartDate && orderDate < new Date(customStartDate)) {
            return false;
          }
          if (customEndDate && orderDate > new Date(customEndDate)) {
            return false;
          }
          break;
      }
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(query);
      const matchesCustomer = order.customer?.name?.toLowerCase().includes(query);
      if (!matchesOrderNumber && !matchesCustomer) {
        return false;
      }
    }
    
    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'date':
        compareValue = new Date(a.createdAt || a.startDate || 0).getTime() - 
                      new Date(b.createdAt || b.startDate || 0).getTime();
        break;
      case 'customer':
        compareValue = (a.customer?.name || '').localeCompare(b.customer?.name || '');
        break;
      case 'total':
        compareValue = (a.totalAmount || 0) - (b.totalAmount || 0);
        break;
      case 'status':
        compareValue = (a.status || '').localeCompare(b.status || '');
        break;
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-gray-700" />
              <h1 className="text-2xl font-semibold text-gray-900">Kiralamalar</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Yeni Kiralama
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Filters */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Status Filter */}
              <div>
                <button
                  onClick={() => setStatusOpen(!statusOpen)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
                >
                  <span>Durum</span>
                  {statusOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {statusOpen && (
                  <div className="space-y-2">
                    {[
                      { key: 'draft' as StatusFilter, label: 'Taslak' },
                      { key: 'reserved' as StatusFilter, label: 'Rezerve' },
                      { key: 'started' as StatusFilter, label: 'Başladı' },
                      { key: 'returned' as StatusFilter, label: 'İade Edildi' },
                      { key: 'archived' as StatusFilter, label: 'Arşivlendi' },
                      { key: 'canceled' as StatusFilter, label: 'İptal' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={statusFilters.includes(key)}
                            onChange={() => toggleStatusFilter(key)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{label}</span>
                        </div>
                        <span className="text-gray-400 text-xs">({statusCounts[key]})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                {/* Payment Status Filter */}
                <button
                  onClick={() => setPaymentOpen(!paymentOpen)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
                >
                  <span>Ödeme Durumu</span>
                  {paymentOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {paymentOpen && (
                  <div className="space-y-2">
                    {[
                      { key: 'payment_due' as PaymentFilter, label: 'Ödeme Bekliyor' },
                      { key: 'partially_paid' as PaymentFilter, label: 'Kısmi Ödendi' },
                      { key: 'paid' as PaymentFilter, label: 'Ödendi' },
                      { key: 'overpaid' as PaymentFilter, label: 'Fazla Ödeme' },
                      { key: 'process_deposit' as PaymentFilter, label: 'Depozito İşlemi' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={paymentFilters.includes(key)}
                            onChange={() => togglePaymentFilter(key)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{label}</span>
                        </div>
                        <span className="text-gray-400 text-xs">({paymentCounts[key]})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                {/* Date Range Filter */}
                <button
                  onClick={() => setDateRangeOpen(!dateRangeOpen)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
                >
                  <span>Tarih Aralığı</span>
                  {dateRangeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {dateRangeOpen && (
                  <div className="space-y-1">
                    {[
                      { key: 'all' as const, label: 'Tüm zamanlar' },
                      { key: 'today' as const, label: 'Bugün' },
                      { key: 'this_week' as const, label: 'Bu hafta' },
                      { key: 'this_month' as const, label: 'Bu ay' },
                      { key: 'custom' as const, label: 'Özel tarih aralığı' }
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setDateRange(key);
                          if (key === 'custom') {
                            setShowDatePicker(true);
                          }
                        }}
                        className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors ${
                          dateRange === key ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    
                    {/* Custom Date Picker */}
                    {dateRange === 'custom' && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Başlangıç</label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Bitiş</label>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setCustomStartDate('');
                            setCustomEndDate('');
                            setDateRange('all');
                          }}
                          className="w-full px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                        >
                          Temizle
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Customer Filter */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setCustomerFilterOpen(!customerFilterOpen)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
                >
                  <span>Müşteri</span>
                  {customerFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {customerFilterOpen && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSelectedCustomerFilter(null)}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors ${
                        selectedCustomerFilter === null ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Tüm Müşteriler ({orders.length})
                    </button>
                    {uniqueCustomers.map(customer => {
                      const customerOrderCount = orders.filter(o => o.customerId === customer.id).length;
                      return (
                        <button
                          key={customer.id}
                          onClick={() => setSelectedCustomerFilter(customer.id)}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            selectedCustomerFilter === customer.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          <span className="truncate">{customer.name}</span>
                          <span className="text-xs text-gray-400 ml-2">({customerOrderCount})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Export Button */}
              <div className="border-t border-gray-200 pt-4">
                <button 
                  onClick={handleExportToCSV}
                  disabled={sortedOrders.length === 0 || loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4" />
                  Dışa Aktar ({sortedOrders.length})
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {showForm ? (
            <NewOrderForm onClose={() => setShowForm(false)} />
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-sm text-gray-600 mb-1">Kiralamalar</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.orders}</div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-sm text-gray-600 mb-1">Kiralanan Ürünler</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.itemsOrdered}</div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-sm text-gray-600 mb-1">Gelir</div>
                  <div className="text-3xl font-bold text-gray-900">₺{stats.revenue.toFixed(2)}</div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-sm text-gray-600 mb-1">Bekleyen</div>
                  <div className="text-3xl font-bold text-gray-900">₺{stats.due.toFixed(2)}</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                  <div className="flex gap-6">
                    {[
                      { key: 'all' as TabType, label: 'Tümü' },
                      { key: 'upcoming' as TabType, label: 'Yaklaşan' },
                      { key: 'late' as TabType, label: 'Geciken' },
                      { key: 'shortage' as TabType, label: 'Eksik Stoklu' }
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === key
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Metrikleri Gizle ⌃
                  </button>
                </div>

                {/* Bulk Actions Toolbar */}
                {selectedOrders.length > 0 && (
                  <div className="border-b border-gray-200 px-6 py-3 bg-blue-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-900">
                        {selectedOrders.length} seçildi
                      </span>
                      <button
                        onClick={() => setSelectedOrders([])}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Seçimi temizle
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setShowBulkActions(!showBulkActions)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                          Durumu Güncelle
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        
                        {showBulkActions && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleBulkStatusUpdate('reserved')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg"
                              disabled={bulkActionLoading}
                            >
                              Rezerve olarak işaretle
                            </button>
                            <button
                              onClick={() => handleBulkStatusUpdate('started')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                              disabled={bulkActionLoading}
                            >
                              Başladı olarak işaretle
                            </button>
                            <button
                              onClick={() => handleBulkStatusUpdate('returned')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                              disabled={bulkActionLoading}
                            >
                              İade edildi olarak işaretle
                            </button>
                            <button
                              onClick={() => handleBulkStatusUpdate('canceled')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 last:rounded-b-lg"
                              disabled={bulkActionLoading}
                            >
                              İptal edildi olarak işaretle
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={handleBulkDelete}
                        disabled={bulkActionLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bulkActionLoading ? 'Siliniyor...' : 'Sil'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Kiralamalar yükleniyor...</p>
                  </div>
                )}
                
                {/* Error State */}
                {error && !loading && (
                  <div className="p-12 text-center">
                    <div className="text-red-600 mb-4">
                      <AlertCircle className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-900 font-medium mb-2">Kiralamalar yüklenemedi</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Tekrar Dene
                    </button>
                  </div>
                )}

                {/* Orders Table */}
                {!loading && !error && sortedOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedOrders.length === sortedOrders.length && sortedOrders.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('date')}
                              className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase hover:text-gray-900"
                            >
                              Tarih
                              {sortBy === 'date' && (
                                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <span className="text-xs font-semibold text-gray-700 uppercase">Kiralama #</span>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('customer')}
                              className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase hover:text-gray-900"
                            >
                              Müşteri
                              {sortBy === 'customer' && (
                                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('status')}
                              className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase hover:text-gray-900"
                            >
                              Durum
                              {sortBy === 'status' && (
                                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <span className="text-xs font-semibold text-gray-700 uppercase">Ödeme</span>
                          </th>
                          <th className="px-6 py-3 text-right">
                            <button
                              onClick={() => handleSort('total')}
                              className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase hover:text-gray-900 ml-auto"
                            >
                              Toplam
                              {sortBy === 'total' && (
                                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sortedOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order.id)}
                                onChange={() => toggleOrderSelection(order.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {new Date(order.createdAt || order.startDate).toLocaleDateString('tr-TR')}
                            </td>
                            <td 
                              className="px-6 py-4 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              {order.orderNumber || `#${order.id}`}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {order.customer?.name || 'Yok'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status?.toUpperCase() === 'CONFIRMED' || order.status?.toLowerCase() === 'reserved' ? 'bg-blue-100 text-blue-800' :
                                order.status?.toUpperCase() === 'ACTIVE' || order.status?.toLowerCase() === 'started' ? 'bg-green-100 text-green-800' :
                                order.status?.toUpperCase() === 'COMPLETED' || order.status?.toLowerCase() === 'returned' ? 'bg-gray-100 text-gray-800' :
                                order.status?.toUpperCase() === 'PENDING' || order.status?.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status || 'BEKLEMEDE'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.paymentStatus?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus?.toLowerCase() === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.paymentStatus || 'ödeme_bekleniyor'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                              ₺{(order.totalAmount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : !loading && !error ? (
                  /* Empty State */
                  <div className="p-12 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">İlk kiralamanızı oluşturun</h3>
                    <p className="text-gray-600 mb-1">Canlı müsaitlik ve otomatik fiyat hesaplamaları ile kiralamalarınızı oluşturun ve yönetin.</p>
                    <p className="text-gray-600 mb-6">Ardından, iş akışına aşina olmak için bir kiralamataki öğeleri rezerve etmeyi, almayı ve iade etmeyi deneyin.</p>
                    <button
                      onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Kiralama Ekle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// New Order Form Component
const NewOrderForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [searchProducts, setSearchProducts] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Siparişler
          </button>
          <span className="text-gray-400">›</span>
          <h2 className="text-xl font-semibold text-gray-900">Yeni sipariş</h2>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Yeni</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Taslak olarak kaydet
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            •••
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            E-posta gönder
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="col-span-2 space-y-6">
            {/* Customer Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Müşteri ara"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pickup Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teslim Alma</h3>
              
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm">
                <MapPin className="w-4 h-4" />
                Fatura adresi ekle
              </button>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teslim alma</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İade</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ürün eklemek için ara"
                  value={searchProducts}
                  onChange={(e) => setSearchProducts(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="py-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">Bu sipariş boş. Bazı ürünler veya özel bir satır ekleyerek başlayın.</p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4">
                  + Özel satır ekle
                </button>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ara toplam</span>
                    <span className="font-medium">₺0,00</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">İndirim ekle</button>
                    <span className="text-gray-400">•</span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Kupon ekle</button>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Toplam indirim</span>
                    <span className="font-medium">₺0,00</span>
                  </div>

                  <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                    <span className="text-gray-600">Vergiler dahil toplam</span>
                    <span className="font-bold text-lg">₺0,00</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div>
                      <div className="text-sm text-gray-600">Güvenlik deposu</div>
                      <div className="text-xs text-gray-500">%100 ürün güvenlik deposu değeri</div>
                    </div>
                    <span className="font-medium">₺0,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Belgeler</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>Paketleme fişi</span>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Faturalar</h3>
              <p className="text-sm text-gray-500">Fatura bulunamadı.</p>
            </div>

            {/* Payments */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Ödemeler</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ödenen</span>
                  <span className="font-medium">₺0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vadesi gelen</span>
                  <span className="font-medium">₺0,00</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Etiketler</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm">
                + Etiket ekle
              </button>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Notlar</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Yeni not ekle"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
