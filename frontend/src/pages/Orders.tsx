import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  X,
  User,
  Package,
  ChevronDown,
  ChevronUp,
  Calendar,
  Plug,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../services/api';
import OrderModal, { OrderFormData } from '../components/modals/OrderModal';

interface Order {
  id: number;
  orderNumber: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  orderItems: Array<{
    id: number;
    quantity: number;
    equipment: {
      id: number;
      name: string;
      model: string;
    };
  }>;
  createdAt: string;
  booqableId?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type SortField = 'orderNumber' | 'customer' | 'startDate' | 'totalAmount' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [accordions, setAccordions] = useState({
    status: false,
    dateRange: false,
    amount: false,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  const toggleAccordion = (key: 'status' | 'dateRange' | 'amount') => {
    setAccordions({ ...accordions, [key]: !accordions[key] });
  };

  // Sorting
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderModalMode, setOrderModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, sortBy, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      });

      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const handleSelectOrder = (id: number) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oid => oid !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedOrders.length === 0) return;

    try {
      await api.post('/orders/bulk/update-status', {
        orderIds: selectedOrders,
        status
      });
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    
    if (!confirm(`${selectedOrders.length} siparişi silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await api.post('/orders/bulk/delete', {
        orderIds: selectedOrders
      });
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleCreateOrder = () => {
    setOrderModalMode('create');
    setShowOrderModal(true);
  };

  const handleSaveOrder = async (data: OrderFormData) => {
    try {
      if (orderModalMode === 'create') {
        await api.post('/orders', data);
      } else {
        // Edit mode - implement later
        await api.put(`/orders/${data.id}`, data);
      }
      fetchOrders();
    } catch (error) {
      console.error('Save order failed:', error);
      throw error;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Sipariş No', 'Müşteri', 'Başlangıç', 'Bitiş', 'Tutar', 'Durum'];
    const rows = orders.map(order => [
      order.orderNumber,
      order.customer.name,
      new Date(order.startDate).toLocaleDateString('tr-TR'),
      new Date(order.endDate).toLocaleDateString('tr-TR'),
      order.totalAmount.toLocaleString('tr-TR'),
      getStatusLabel(order.status)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `siparisler-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-neutral-100 text-neutral-700',
      CONFIRMED: 'bg-neutral-100 text-neutral-700',
      ACTIVE: 'bg-neutral-900 text-white',
      COMPLETED: 'bg-neutral-100 text-neutral-700',
      CANCELLED: 'bg-neutral-100 text-neutral-600',
    };

    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles[status] || 'bg-neutral-100 text-neutral-700'}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Bekliyor',
      CONFIRMED: 'Onaylandı',
      ACTIVE: 'Aktif',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal',
    };
    return labels[status] || status;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronDown size={14} className="text-neutral-400" />;
    return sortOrder === 'asc' 
      ? <ChevronUp size={14} className="text-neutral-900" />
      : <ChevronDown size={14} className="text-neutral-900" />;
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Siparişler</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Toplam {pagination.total} sipariş
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors ${
              showFilters 
                ? 'bg-neutral-900 text-white border-neutral-900' 
                : 'border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <Filter size={18} />
            Filtreler
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <Download size={18} />
            CSV İndir
          </button>

          <button 
            onClick={handleCreateOrder}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <Plus size={18} />
            Yeni Sipariş
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Arama</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Sipariş no, notlar..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Status Accordion */}
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleAccordion('status')}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <span className="font-medium text-neutral-900">Durum Filtresi</span>
              {accordions.status ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {accordions.status && (
              <div className="p-4 border-t border-neutral-200">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">Tümü</option>
                  <option value="PENDING">Bekliyor</option>
                  <option value="CONFIRMED">Onaylandı</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="COMPLETED">Tamamlandı</option>
                  <option value="CANCELLED">İptal</option>
                </select>
              </div>
            )}
          </div>

          {/* Date Range Accordion */}
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleAccordion('dateRange')}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <span className="font-medium text-neutral-900">Tarih Aralığı</span>
              {accordions.dateRange ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {accordions.dateRange && (
              <div className="p-4 border-t border-neutral-200">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tarih Aralığı Seçin
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" size={18} />
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      setDateRange(update);
                      if (update[0]) {
                        setFilters({ ...filters, startDate: update[0].toISOString().split('T')[0] });
                      }
                      if (update[1]) {
                        setFilters({ ...filters, endDate: update[1].toISOString().split('T')[0] });
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Başlangıç - Bitiş tarihi seçin"
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    isClearable={true}
                    monthsShown={2}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      setDateRange([today, today]);
                      setFilters({ ...filters, startDate: today.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] });
                    }}
                    className="px-3 py-1.5 text-xs bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    Bugün
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastWeek = new Date(today);
                      lastWeek.setDate(today.getDate() - 7);
                      setDateRange([lastWeek, today]);
                      setFilters({ ...filters, startDate: lastWeek.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] });
                    }}
                    className="px-3 py-1.5 text-xs bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    Son 7 Gün
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(today);
                      lastMonth.setDate(today.getDate() - 30);
                      setDateRange([lastMonth, today]);
                      setFilters({ ...filters, startDate: lastMonth.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] });
                    }}
                    className="px-3 py-1.5 text-xs bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    Son 30 Gün
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                      setDateRange([firstDay, today]);
                      setFilters({ ...filters, startDate: firstDay.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] });
                    }}
                    className="px-3 py-1.5 text-xs bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    Bu Ay
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Amount Accordion */}
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleAccordion('amount')}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <span className="font-medium text-neutral-900">Tutar Aralığı</span>
              {accordions.amount ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {accordions.amount && (
              <div className="p-4 border-t border-neutral-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Min. Tutar</label>
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Max. Tutar</label>
                  <input
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                    placeholder="999999"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              onClick={() => {
                setFilters({
                  search: '',
                  status: '',
                  startDate: '',
                  endDate: '',
                  minAmount: '',
                  maxAmount: '',
                });
                setDateRange([null, null]);
              }}
              className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Temizle
            </button>
            <button
              onClick={() => {
                setPagination({ ...pagination, page: 1 });
                fetchOrders();
              }}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Filtrele
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-neutral-900 text-white rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedOrders.length} sipariş seçildi</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkStatusUpdate('CONFIRMED')}
                className="px-4 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors text-sm font-medium"
              >
                Onayla
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('COMPLETED')}
                className="px-4 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors text-sm font-medium"
              >
                Tamamla
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('CANCELLED')}
                className="px-4 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors text-sm font-medium"
              >
                İptal Et
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Trash2 size={16} className="inline mr-2" />
                Sil
              </button>
              <button
                onClick={() => setSelectedOrders([])}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-neutral-400" size={32} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto text-neutral-300 mb-4" size={48} />
            <p className="text-neutral-600 mb-4">Henüz sipariş bulunmuyor</p>
            <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
              <Plus size={16} className="inline mr-2" />
              İlk Siparişi Oluştur
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-neutral-300"
                      />
                    </th>
                    <th 
                      onClick={() => handleSort('orderNumber')}
                      className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase cursor-pointer hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Sipariş No
                        <SortIcon field="orderNumber" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('customer')}
                      className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase cursor-pointer hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Müşteri
                        <SortIcon field="customer" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('startDate')}
                      className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase cursor-pointer hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Tarih
                        <SortIcon field="startDate" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">
                      Ekipman
                    </th>
                    <th 
                      onClick={() => handleSort('totalAmount')}
                      className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase cursor-pointer hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Tutar
                        <SortIcon field="totalAmount" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase cursor-pointer hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Durum
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-700 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="rounded border-neutral-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-900">{order.orderNumber}</span>
                          {order.booqableId && (
                            <div 
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                              title={`Booqable ID: ${order.booqableId}`}
                            >
                              <Plug size={12} />
                              <span>Booqable</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{order.customer.name}</div>
                          <div className="text-xs text-neutral-600">{order.customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900">
                          {new Date(order.startDate).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-xs text-neutral-600">
                          {new Date(order.endDate).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900">
                          {order.orderItems.length} ekipman
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-neutral-900">
                          ₺{order.totalAmount.toLocaleString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                            className="p-1 hover:bg-neutral-100 rounded transition-colors"
                          >
                            <Eye size={16} className="text-neutral-600" />
                          </button>
                          <button className="p-1 hover:bg-neutral-100 rounded transition-colors">
                            <Edit size={16} className="text-neutral-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
              <div className="text-sm text-neutral-600">
                {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="px-4 py-2 text-sm font-medium">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-neutral-600 mt-1">{selectedOrder.customer.name}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase">Durum</label>
                  <div className="mt-2">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase">Tutar</label>
                  <div className="mt-2 text-lg font-bold text-neutral-900">
                    ₺{selectedOrder.totalAmount.toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-neutral-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-medium text-neutral-600 uppercase">Başlangıç</label>
                    <div className="text-sm font-semibold text-neutral-900 mt-1">
                      {new Date(selectedOrder.startDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-neutral-400">→</div>
                  <div className="text-right">
                    <label className="text-xs font-medium text-neutral-600 uppercase">Bitiş</label>
                    <div className="text-sm font-semibold text-neutral-900 mt-1">
                      {new Date(selectedOrder.endDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase mb-3 block">Ekipmanlar</label>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-neutral-700" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{item.equipment.name}</div>
                          <div className="text-xs text-neutral-600">{item.equipment.model}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-neutral-700">
                        {item.quantity}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-neutral-50 rounded-xl p-4">
                <label className="text-xs font-medium text-neutral-600 uppercase mb-3 block">Müşteri Bilgileri</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-neutral-600" />
                    <span className="text-neutral-900">{selectedOrder.customer.name}</span>
                  </div>
                  {selectedOrder.customer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-600">✉️</span>
                      <span className="text-neutral-900">{selectedOrder.customer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Create/Edit Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onSave={handleSaveOrder}
        mode={orderModalMode}
      />
    </div>
  );
}
