import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ChevronDown, ChevronUp, Calendar as CalendarIcon,
  Package, DollarSign, AlertCircle, Clock, User, MapPin, FileText,
  Mail, Phone, Tag, StickyNote, X
} from 'lucide-react';

type TabType = 'all' | 'upcoming' | 'late' | 'shortage';
type StatusFilter = 'draft' | 'reserved' | 'started' | 'returned' | 'archived' | 'canceled';
type PaymentFilter = 'payment_due' | 'partially_paid' | 'paid' | 'overpaid' | 'process_deposit';

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-gray-700" />
              <h1 className="text-2xl font-semibold text-gray-900">Siparişler</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
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
                Sipariş Ekle
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
                    <div className="text-xs text-gray-600 mb-2 px-2">Tüm zamanlar gösteriliyor</div>
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
                        onClick={() => setDateRange(key)}
                        className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors ${
                          dateRange === key ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    
                    {/* Custom Date Range Button */}
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors ${
                        showDatePicker ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Özel aralık seç
                    </button>

                    {/* Calendar Widget */}
                    {showDatePicker && (
                      <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Tarih Seç</span>
                          <button
                            onClick={() => setShowDatePicker(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Başlangıç</label>
                            <input
                              type="date"
                              value={customDateFrom}
                              onChange={(e) => setCustomDateFrom(e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Bitiş</label>
                            <input
                              type="date"
                              value={customDateTo}
                              onChange={(e) => setCustomDateTo(e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <button
                            onClick={() => {
                              if (customDateFrom && customDateTo) {
                                setShowDatePicker(false);
                              }
                            }}
                            className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Uygula
                          </button>
                        </div>
                      </div>
                    )}
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
          </div>

          {/* Main Content Area */}
          {showForm ? (
            <NewOrderForm onClose={() => setShowForm(false)} />
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-sm text-gray-600 mb-1">Siparişler</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.orders}</div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-sm text-gray-600 mb-1">Sipariş Edilen Ürünler</div>
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
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Sipariş Ekle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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

export default Orders;
