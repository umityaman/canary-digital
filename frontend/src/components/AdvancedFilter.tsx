import React, { useState } from 'react';
import { Filter, X, RotateCcw, Save, Trash2 } from 'lucide-react';

export interface FilterState {
  categories?: string[];
  amountMin?: number;
  amountMax?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  paymentMethod?: string[];
  searchTerm?: string;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
}

interface AdvancedFilterProps {
  onApplyFilter: (filters: FilterState) => void;
  onClearFilter: () => void;
  availableCategories?: string[];
  availableStatuses?: string[];
  availablePaymentMethods?: string[];
  showCategoryFilter?: boolean;
  showAmountFilter?: boolean;
  showDateFilter?: boolean;
  showStatusFilter?: boolean;
  showPaymentMethodFilter?: boolean;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  onApplyFilter,
  onClearFilter,
  availableCategories = [],
  availableStatuses = [],
  availablePaymentMethods = [],
  showCategoryFilter = true,
  showAmountFilter = true,
  showDateFilter = true,
  showStatusFilter = true,
  showPaymentMethodFilter = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => {
      const categories = prev.categories || [];
      const newCategories = categories.includes(category)
        ? categories.filter((c) => c !== category)
        : [...categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => {
      const statuses = prev.status || [];
      const newStatuses = statuses.includes(status)
        ? statuses.filter((s) => s !== status)
        : [...statuses, status];
      return { ...prev, status: newStatuses };
    });
  };

  const handlePaymentMethodToggle = (method: string) => {
    setFilters((prev) => {
      const methods = prev.paymentMethod || [];
      const newMethods = methods.includes(method)
        ? methods.filter((m) => m !== method)
        : [...methods, method];
      return { ...prev, paymentMethod: newMethods };
    });
  };

  const handleApply = () => {
    onApplyFilter(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    onClearFilter();
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: { ...filters },
    };

    setSavedFilters((prev) => [...prev, newFilter]);
    setFilterName('');
    setShowSaveDialog(false);

    // Save to localStorage
    const savedFiltersJson = JSON.stringify([...savedFilters, newFilter]);
    localStorage.setItem('canary_saved_filters', savedFiltersJson);
  };

  const handleLoadFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
    onApplyFilter(savedFilter.filters);
    setIsOpen(false);
  };

  const handleDeleteFilter = (filterId: string) => {
    const newFilters = savedFilters.filter((f) => f.id !== filterId);
    setSavedFilters(newFilters);
    localStorage.setItem('canary_saved_filters', JSON.stringify(newFilters));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.amountMin || filters.amountMax) count++;
    if (filters.dateRange) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.paymentMethod && filters.paymentMethod.length > 0) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  React.useEffect(() => {
    // Load saved filters from localStorage
    const savedFiltersJson = localStorage.getItem('canary_saved_filters');
    if (savedFiltersJson) {
      try {
        setSavedFilters(JSON.parse(savedFiltersJson));
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
      >
        <Filter className="w-4 h-4" />
        <span>Gelişmiş Filtre</span>
        {getActiveFilterCount() > 0 && (
          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {getActiveFilterCount()}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[600px] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 className="font-semibold text-gray-900">Gelişmiş Filtre</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Search Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ara</label>
              <input
                type="text"
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="Açıklama, kategori, vb..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            {showCategoryFilter && availableCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategoriler</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableCategories.map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories?.includes(category) || false}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Amount Range Filter */}
            {showAmountFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tutar Aralığı</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={filters.amountMin || ''}
                      onChange={(e) => setFilters({ ...filters, amountMin: parseFloat(e.target.value) || undefined })}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={filters.amountMax || ''}
                      onChange={(e) => setFilters({ ...filters, amountMax: parseFloat(e.target.value) || undefined })}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Date Range Filter */}
            {showDateFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Aralığı</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={filters.dateRange?.start || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dateRange: { start: e.target.value, end: filters.dateRange?.end || '' },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={filters.dateRange?.end || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dateRange: { start: filters.dateRange?.start || '', end: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Status Filter */}
            {showStatusFilter && availableStatuses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <div className="space-y-2">
                  {availableStatuses.map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(status) || false}
                        onChange={() => handleStatusToggle(status)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Method Filter */}
            {showPaymentMethodFilter && availablePaymentMethods.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Yöntemi</label>
                <div className="space-y-2">
                  {availablePaymentMethods.map((method) => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.paymentMethod?.includes(method) || false}
                        onChange={() => handlePaymentMethodToggle(method)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kayıtlı Filtreler</label>
                <div className="space-y-2">
                  {savedFilters.map((savedFilter) => (
                    <div key={savedFilter.id} className="flex items-center gap-2">
                      <button
                        onClick={() => handleLoadFilter(savedFilter)}
                        className="flex-1 px-3 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {savedFilter.name}
                      </button>
                      <button
                        onClick={() => handleDeleteFilter(savedFilter.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 flex gap-2 sticky bottom-0 bg-white">
            <button
              onClick={handleClear}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Temizle
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Uygula
            </button>
          </div>

          {/* Save Filter Dialog */}
          {showSaveDialog && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white rounded-lg p-6 w-80">
                <h3 className="text-lg font-semibold mb-4">Filtreyi Kaydet</h3>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Filtre adı girin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSaveFilter}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
