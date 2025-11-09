import React, { useState } from 'react';
import {
  Filter,
  Calendar,
  Users,
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  X,
  Check,
  RefreshCw,
  Download,
  Search,
} from 'lucide-react';
import { button, badge, DESIGN_TOKENS } from '../../styles/design-tokens';

interface FilterOption {
  id: string;
  label: string;
  value: any;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: ReportFilters) => void;
  onReset: () => void;
  onExport?: (format: 'excel' | 'pdf') => void;
  loading?: boolean;
}

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  customers: string[];
  suppliers: string[];
  categories: string[];
  minAmount: number | null;
  maxAmount: number | null;
  status: string[];
  reportType: string;
  groupBy: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function AdvancedReportFilters({
  onFilterChange,
  onReset,
  onExport,
  loading = false,
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: '',
    dateTo: '',
    customers: [],
    suppliers: [],
    categories: [],
    minAmount: null,
    maxAmount: null,
    status: [],
    reportType: 'ALL',
    groupBy: 'DATE',
    sortBy: 'DATE',
    sortOrder: 'desc',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');

  // Mock data - gerçek uygulamada API'den gelecek
  const mockCustomers = [
    { id: '1', name: 'ABC Şirketi' },
    { id: '2', name: 'XYZ Ltd.' },
    { id: '3', name: 'DEF A.Ş.' },
    { id: '4', name: 'GHI Ticaret' },
  ];

  const mockSuppliers = [
    { id: '1', name: 'Tedarikçi A' },
    { id: '2', name: 'Tedarikçi B' },
    { id: '3', name: 'Tedarikçi C' },
  ];

  const categories = [
    { id: 'RENTAL', label: 'Kiralama' },
    { id: 'SALE', label: 'Satış' },
    { id: 'SERVICE', label: 'Hizmet' },
    { id: 'EXPENSE', label: 'Gider' },
    { id: 'OTHER', label: 'Diğer' },
  ];

  const statuses = [
    { id: 'DRAFT', label: 'Taslak' },
    { id: 'APPROVED', label: 'Onaylandı' },
    { id: 'PAID', label: 'Ödendi' },
    { id: 'CANCELLED', label: 'İptal' },
    { id: 'OVERDUE', label: 'Gecikmiş' },
  ];

  const handleFilterUpdate = (key: keyof ReportFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleMultiSelect = (key: keyof ReportFilters, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    handleFilterUpdate(key, newValues);
  };

  const handleReset = () => {
    const resetFilters: ReportFilters = {
      dateFrom: '',
      dateTo: '',
      customers: [],
      suppliers: [],
      categories: [],
      minAmount: null,
      maxAmount: null,
      status: [],
      reportType: 'ALL',
      groupBy: 'DATE',
      sortBy: 'DATE',
      sortOrder: 'desc',
    };
    setFilters(resetFilters);
    setCustomerSearch('');
    setSupplierSearch('');
    onReset();
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.customers.length > 0) count++;
    if (filters.suppliers.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.minAmount !== null) count++;
    if (filters.maxAmount !== null) count++;
    if (filters.status.length > 0) count++;
    if (filters.reportType !== 'ALL') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const filteredCustomers = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredSuppliers = mockSuppliers.filter((s) =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Quick Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date From */}
        <div>
          <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-1`}>
            Başlangıç Tarihi
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterUpdate('dateFrom', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-1`}>
            Bitiş Tarihi
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterUpdate('dateTo', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Report Type */}
        <div>
          <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-1`}>
            Rapor Tipi
          </label>
          <select
            value={filters.reportType}
            onChange={(e) => handleFilterUpdate('reportType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Tümü</option>
            <option value="INCOME">Gelir</option>
            <option value="EXPENSE">Gider</option>
            <option value="BALANCE">Bakiye</option>
            <option value="AGING">Yaşlandırma</option>
          </select>
        </div>

        {/* Advanced Toggle */}
        <div className="flex items-end">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`w-full ${button('secondary', 'md', 'md')} relative`}
          >
            <Filter className="w-4 h-4" />
            Gelişmiş Filtreler
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className={`${DESIGN_TOKENS?.typography?.heading.h4} ${DESIGN_TOKENS?.colors?.text.primary}`}>
              Gelişmiş Filtreleme Seçenekleri
            </h3>
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customers Multi-Select */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                <Users className="w-4 h-4 inline mr-1" />
                Müşteriler
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Müşteri ara..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                  {filteredCustomers.map((customer) => (
                    <label
                      key={customer.id}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.customers.includes(customer.id)}
                        onChange={() => handleMultiSelect('customers', customer.id)}
                        className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`${DESIGN_TOKENS?.typography?.body.sm}`}>{customer.name}</span>
                    </label>
                  ))}
                </div>
                {filters.customers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.customers.map((id) => {
                      const customer = mockCustomers.find((c) => c.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {customer?.name}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleMultiSelect('customers', id)}
                          />
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Suppliers Multi-Select */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                <Users className="w-4 h-4 inline mr-1" />
                Tedarikçiler
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tedarikçi ara..."
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                  {filteredSuppliers.map((supplier) => (
                    <label
                      key={supplier.id}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.suppliers.includes(supplier.id)}
                        onChange={() => handleMultiSelect('suppliers', supplier.id)}
                        className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`${DESIGN_TOKENS?.typography?.body.sm}`}>{supplier.name}</span>
                    </label>
                  ))}
                </div>
                {filters.suppliers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.suppliers.map((id) => {
                      const supplier = mockSuppliers.find((s) => s.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                        >
                          {supplier?.name}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleMultiSelect('suppliers', id)}
                          />
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                <Tag className="w-4 h-4 inline mr-1" />
                Kategoriler
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleMultiSelect('categories', cat.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.categories.includes(cat.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {filters.categories.includes(cat.id) && (
                      <Check className="w-3 h-3 inline mr-1" />
                    )}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                Durum
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => handleMultiSelect('status', status.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.status.includes(status.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {filters.status.includes(status.id) && (
                      <Check className="w-3 h-3 inline mr-1" />
                    )}
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                <DollarSign className="w-4 h-4 inline mr-1" />
                Tutar Aralığı
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleFilterUpdate('minAmount', e.target.value ? Number(e.target.value) : null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleFilterUpdate('maxAmount', e.target.value ? Number(e.target.value) : null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Group By */}
            <div>
              <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                Gruplandırma
              </label>
              <select
                value={filters.groupBy}
                onChange={(e) => handleFilterUpdate('groupBy', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="DATE">Tarihe Göre</option>
                <option value="CUSTOMER">Müşteriye Göre</option>
                <option value="CATEGORY">Kategoriye Göre</option>
                <option value="STATUS">Duruma Göre</option>
                <option value="NONE">Gruplandırma Yok</option>
              </select>
            </div>

            {/* Sort */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                  Sıralama Kriteri
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DATE">Tarih</option>
                  <option value="AMOUNT">Tutar</option>
                  <option value="CUSTOMER">Müşteri Adı</option>
                  <option value="STATUS">Durum</option>
                </select>
              </div>
              <div>
                <label className={`block ${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mb-2`}>
                  Sıralama Yönü
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterUpdate('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">
                    <TrendingUp className="inline w-4 h-4" /> Artan
                  </option>
                  <option value="desc">
                    <TrendingDown className="inline w-4 h-4" /> Azalan
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleReset}
          disabled={loading}
          className={button('secondary', 'sm', 'md')}
        >
          <RefreshCw className="w-4 h-4" />
          Filtreleri Sıfırla
        </button>

        {onExport && (
          <>
            <button
              onClick={() => onExport('excel')}
              disabled={loading}
              className={button('secondary', 'sm', 'md')}
            >
              <Download className="w-4 h-4" />
              Excel İndir
            </button>
            <button
              onClick={() => onExport('pdf')}
              disabled={loading}
              className={button('secondary', 'sm', 'md')}
            >
              <Download className="w-4 h-4" />
              PDF İndir
            </button>
          </>
        )}

        {activeFilterCount > 0 && (
          <span className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
            {activeFilterCount} filtre aktif
          </span>
        )}
      </div>
    </div>
  );
}
