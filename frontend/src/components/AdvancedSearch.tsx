import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Save, Star, Clock, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { debounce } from 'lodash';

interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  category?: string[];
  brand?: string[];
  model?: string[];
  availability?: 'available' | 'rented' | 'maintenance' | 'all';
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface AdvancedSearchProps {
  entity: 'equipment' | 'customers' | 'orders';
  onSearch: (results: any) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  entity,
  onSearch,
  onFiltersChange,
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: entity === 'equipment' ? 'name' : 'createdAt',
    sortOrder: 'asc',
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Load saved searches and history
  useEffect(() => {
    loadSavedSearches();
    loadSearchHistory();
    if (entity === 'equipment') {
      loadFilterOptions();
    }
  }, [entity]);

  const loadSavedSearches = async () => {
    try {
      const response = await api.get('/search/saved', { params: { entity } });
      setSavedSearches(response.data);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const response = await api.get('/search/history', { 
        params: { entity, limit: 5 } 
      });
      setSearchHistory(response.data);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const response = await api.get('/search/filters/equipment');
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: SearchFilters) => {
      if (!searchQuery && Object.keys(searchFilters).length === 3) {
        // No query and only default filters
        return;
      }

      setLoading(true);
      try {
        const response = await api.post(`/search/${entity}`, {
          query: searchQuery,
          ...searchFilters,
        });
        onSearch(response.data);
        onFiltersChange?.(searchFilters);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    [entity, onSearch, onFiltersChange]
  );

  // Handle query change
  const handleQueryChange = (value: string) => {
    setQuery(value);
    const newFilters = { ...filters, query: value, page: 1 };
    setFilters(newFilters);
    debouncedSearch(value, newFilters);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    debouncedSearch(query, newFilters);
  };

  // Apply saved search
  const applySavedSearch = async (search: any) => {
    try {
      const parsedFilters = JSON.parse(search.filters);
      setQuery(parsedFilters.query || '');
      setFilters(parsedFilters);
      debouncedSearch(parsedFilters.query || '', parsedFilters);
      
      // Update usage
      await api.put(`/search/saved/${search.id}/use`);
      loadSavedSearches();
    } catch (error) {
      console.error('Failed to apply saved search:', error);
    }
  };

  // Save current search
  const saveCurrentSearch = async (name: string, description?: string) => {
    try {
      await api.post('/search/save', {
        name,
        description,
        entity,
        filters: { query, ...filters },
      });
      setShowSaveModal(false);
      loadSavedSearches();
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  // Delete saved search
  const deleteSavedSearch = async (searchId: number) => {
    try {
      await api.delete(`/search/saved/${searchId}`);
      loadSavedSearches();
    } catch (error) {
      console.error('Failed to delete search:', error);
    }
  };

  // Toggle pin
  const togglePin = async (searchId: number) => {
    try {
      await api.put(`/search/saved/${searchId}/pin`);
      loadSavedSearches();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setQuery('');
    setFilters({
      sortBy: entity === 'equipment' ? 'name' : 'createdAt',
      sortOrder: 'asc',
      page: 1,
      limit: 20,
    });
    onSearch({ data: [], total: 0, page: 1, limit: 20, totalPages: 0, hasMore: false });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${entity}...`}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-neutral-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-2"
        >
          <Filter size={20} />
          Filters
          <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {(query || Object.keys(filters).length > 3) && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={20} />
            Save
          </button>
        )}
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {savedSearches.slice(0, 5).map((search) => (
            <button
              key={search.id}
              onClick={() => applySavedSearch(search)}
              className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-full text-sm flex items-center gap-2 group"
            >
              {search.isPinned && <Star size={14} className="text-yellow-500" />}
              {search.name}
              <span className="text-gray-500">{search.usageCount}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(search.id);
                }}
                className="opacity-0 group-hover:opacity-100"
              >
                <Star size={14} className={search.isPinned ? 'text-yellow-500' : 'text-gray-400'} />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && query === '' && (
        <div className="border-t pt-4">
          <div className="text-sm text-neutral-600 mb-2 flex items-center gap-2">
            <Clock size={16} />
            Recent Searches
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQueryChange(item.query)}
                className="px-3 py-1 bg-neutral-50 hover:bg-neutral-100 rounded-full text-sm text-neutral-700"
              >
                {item.query}
                <span className="ml-2 text-gray-400">{item.resultCount}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="border border-neutral-200 rounded-lg p-4 space-y-4 bg-neutral-50">
          {entity === 'equipment' && (
            <>
              {/* Brand Filter */}
              {filterOptions.brands && filterOptions.brands.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Brand
                  </label>
                  <select
                    multiple
                    value={filters.brand || []}
                    onChange={(e) => handleFilterChange('brand', Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  >
                    {filterOptions.brands.map((brand: any) => (
                      <option key={brand.value} value={brand.value}>
                        {brand.value} ({brand.count})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={filters.priceMin || ''}
                    onChange={(e) => handleFilterChange('priceMin', parseFloat(e.target.value))}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={filters.priceMax || ''}
                    onChange={(e) => handleFilterChange('priceMax', parseFloat(e.target.value))}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability || 'all'}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg p-2"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </>
          )}

          {entity === 'orders' && (
            <>
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    value={filters.amountMin || ''}
                    onChange={(e) => handleFilterChange('amountMin', parseFloat(e.target.value))}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    value={filters.amountMax || ''}
                    onChange={(e) => handleFilterChange('amountMax', parseFloat(e.target.value))}
                    className="w-full border border-neutral-300 rounded-lg p-2"
                    placeholder="10000"
                  />
                </div>
              </div>
            </>
          )}

          {/* Sort */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full border border-neutral-300 rounded-lg p-2"
              >
                <option value="name">Name</option>
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                {entity === 'equipment' && <option value="rentalPrice">Price</option>}
                {entity === 'orders' && <option value="totalAmount">Amount</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full border border-neutral-300 rounded-lg p-2"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 text-neutral-700"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-500 py-4">
          Searching...
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
