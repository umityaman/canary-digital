import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, ChevronDown, ChevronUp, Calendar as CalendarIcon,
  Package, DollarSign, AlertCircle, Clock, User, MapPin, FileText,
  Mail, Phone, Tag, StickyNote, X, Eye, EyeOff
} from 'lucide-react';

type TabType = 'all' | 'upcoming' | 'late' | 'shortage';
type StatusFilter = 'draft' | 'reserved' | 'started' | 'returned' | 'archived' | 'canceled';
type PaymentFilter = 'payment_due' | 'partially_paid' | 'paid' | 'overpaid' | 'process_deposit';

const Reservations: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMetrics, setShowMetrics] = useState(true);
  
  // Filters
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([]);
  const [paymentFilters, setPaymentFilters] = useState<PaymentFilter[]>([]);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'yesterday' | 'tomorrow' | 'this_week' | 'last_week' | 'next_week' | 'this_month' | 'last_month' | 'next_month' | 'this_year' | 'last_year' | 'next_year'>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  
  // Sections
  const [statusOpen, setStatusOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(true);
  const [dateRangeOpen, setDateRangeOpen] = useState(true);

  // Mock stats data
  const stats = {
    orders: 12,
    itemsOrdered: 45,
    revenue: 15750.00,
    due: 3250.00
  };

  // Mock filter counts
  const statusCounts = {
    draft: 2,
    reserved: 5,
    started: 3,
    returned: 1,
    archived: 0,
    canceled: 1
  };

  const paymentCounts = {
    payment_due: 4,
    partially_paid: 3,
    paid: 4,
    overpaid: 0,
    process_deposit: 1
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

  return (
    <>
      <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Sipariş ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <button
          onClick={() => navigate('/orders/new')}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          Sipariş Ekle
        </button>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Sidebar - Filters */}
        <div className="w-64 bg-white rounded-lg shadow p-4 space-y-4">
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
                    <div 
                      onClick={() => {
                        console.log('Opening date picker modal');
                        setShowDatePicker(true);
                      }}
                      className="text-sm text-gray-700 px-2 py-1.5 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      Tüm zamanlar gösteriliyor
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <div className="border-t border-gray-200 pt-4">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <FileText className="w-4 h-4" />
                  Dışa Aktar
                </button>
              </div>
        </div>

          {/* Main Content Area */}
          <div className="flex-1">
              {/* Stats Cards with Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-end mb-3">
                  <button
                    onClick={() => setShowMetrics(!showMetrics)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {showMetrics ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Metrikleri gizle
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Metrikleri göster
                      </>
                    )}
                  </button>
                </div>
                
                {showMetrics && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="text-sm text-gray-600 mb-1">Siparişler</div>
                      <div className="text-3xl font-bold text-gray-900">{stats.orders}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="text-sm text-gray-600 mb-1">Sipariş Edilen Ürünler</div>
                      <div className="text-3xl font-bold text-gray-900">{stats.itemsOrdered}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="text-sm text-gray-600 mb-1">Gelir</div>
                      <div className="text-3xl font-bold text-gray-900">₺{stats.revenue.toFixed(2)}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="text-sm text-gray-600 mb-1">Bekleyen</div>
                      <div className="text-3xl font-bold text-gray-900">₺{stats.due.toFixed(2)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
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

                {/* Empty State */}
                <div className="p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">İlk siparişinizi oluşturun</h3>
                  <p className="text-gray-600 mb-1">Canlı müsaitlik ve otomatik fiyat hesaplamaları ile siparişlerinizi oluşturun ve yönetin.</p>
                  <p className="text-gray-600 mb-6">Ardından, iş akışına aşina olmak için bir siparişteki öğeleri rezerve etmeyi, almayı ve iade etmeyi deneyin.</p>
                  <button
                    onClick={() => navigate('/orders/new')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Sipariş Ekle
                  </button>
                </div>
              </div>
            </div>
      </div>
    </div>

    {/* Date Range Calendar Modal */}
    {showDatePicker && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-25" onClick={() => setShowDatePicker(false)}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex">
            {/* Left Side - Quick Select Options */}
            <div className="w-40 border-r border-gray-200 p-3">
              <div className="space-y-0.5">
                {[
                  { key: 'all' as const, label: 'Tüm zamanlar' },
                  { key: 'today' as const, label: 'Bugün' },
                  { key: 'yesterday' as const, label: 'Dün' },
                  { key: 'tomorrow' as const, label: 'Yarın' },
                  { key: 'this_week' as const, label: 'Bu hafta' },
                  { key: 'last_week' as const, label: 'Geçen hafta' },
                  { key: 'next_week' as const, label: 'Gelecek hafta' },
                  { key: 'this_month' as const, label: 'Bu ay' },
                  { key: 'last_month' as const, label: 'Geçen ay' },
                  { key: 'next_month' as const, label: 'Gelecek ay' },
                  { key: 'this_year' as const, label: 'Bu yıl' },
                  { key: 'last_year' as const, label: 'Geçen yıl' },
                  { key: 'next_year' as const, label: 'Gelecek yıl' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setDateRange(key);
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors ${
                      dateRange === key 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Calendar */}
            <div className="flex-1 p-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-3">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronDown className="w-4 h-4 rotate-90 text-gray-600" />
                </button>
                <h3 className="text-sm font-semibold text-gray-900">Ekim 2025</h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronDown className="w-4 h-4 -rotate-90 text-gray-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0.5 mb-3">
                {['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const isSelected = (customDateFrom && parseInt(customDateFrom.split('-')[2]) === day) || 
                                    (customDateTo && parseInt(customDateTo.split('-')[2]) === day);
                  const isInRange = customDateFrom && customDateTo && 
                                   day >= parseInt(customDateFrom.split('-')[2]) && 
                                   day <= parseInt(customDateTo.split('-')[2]);
                  
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        const dateStr = `2025-10-${day.toString().padStart(2, '0')}`;
                        if (!customDateFrom || (customDateFrom && customDateTo)) {
                          setCustomDateFrom(dateStr);
                          setCustomDateTo('');
                        } else {
                          if (day < parseInt(customDateFrom.split('-')[2])) {
                            setCustomDateTo(customDateFrom);
                            setCustomDateFrom(dateStr);
                          } else {
                            setCustomDateTo(dateStr);
                          }
                          setDateRange('all');
                        }
                      }}
                      className={`aspect-square flex items-center justify-center text-xs rounded transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold'
                          : isInRange
                          ? 'bg-blue-100 text-blue-900'
                          : day === 20 
                          ? 'font-bold text-gray-900' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* From/Till Selectors */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Başlangıç</label>
                  <input 
                    type="text"
                    value={customDateFrom ? new Date(customDateFrom).toLocaleDateString('tr-TR') : ''}
                    readOnly
                    placeholder="Seç..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bitiş</label>
                  <input 
                    type="text"
                    value={customDateTo ? new Date(customDateTo).toLocaleDateString('tr-TR') : ''}
                    readOnly
                    placeholder="Seç..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};



export default Reservations;
