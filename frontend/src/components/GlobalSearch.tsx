import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Users, ShoppingCart, X } from 'lucide-react';
import api from '../services/api';
import { debounce } from 'lodash';

interface GlobalSearchProps {
  onClose?: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({
    equipment: [],
    customers: [],
    orders: [],
  });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const performSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults({ equipment: [], customers: [], orders: [] });
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/search/global', {
        params: { q: searchQuery, limit: 5 },
      });
      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    performSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    setResults({ equipment: [], customers: [], orders: [] });
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleItemClick = (type: string, id: number) => {
    // Navigate to detail page
    // You can use react-router or your navigation method here
    console.log(`Navigate to ${type}:`, id);
    onClose?.();
  };

  const totalResults = 
    results.equipment.length + 
    results.customers.length + 
    results.orders.length;

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
          size={20} 
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search equipment, customers, orders..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
          Searching...
        </div>
      )}

      {/* Results Dropdown */}
      {showResults && !loading && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {totalResults === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Equipment Results */}
              {results.equipment.length > 0 && (
                <div className="p-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Package size={14} />
                    Equipment ({results.equipment.length})
                  </div>
                  {results.equipment.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick('equipment', item.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.code} • {item.brand} {item.model}
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                          item.status === 'AVAILABLE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Customer Results */}
              {results.customers.length > 0 && (
                <div className="p-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users size={14} />
                    Customers ({results.customers.length})
                  </div>
                  {results.customers.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick('customers', item.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.company && `${item.company} • `}
                        {item.email || item.phone}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Order Results */}
              {results.orders.length > 0 && (
                <div className="p-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ShoppingCart size={14} />
                    Orders ({results.orders.length})
                  </div>
                  {results.orders.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick('orders', item.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {item.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center justify-between">
                        <span>
                          {item.customer.name} • 
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            item.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800' 
                              : item.status === 'ACTIVE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </span>
                        <span className="font-medium">
                          ${item.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View All Results */}
          {totalResults > 0 && (
            <div className="border-t border-gray-100 p-3">
              <button className="w-full px-4 py-2 text-center text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                View all {totalResults} results
              </button>
            </div>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Press <kbd className="px-2 py-1 bg-gray-100 rounded">ESC</kbd> to close
      </div>
    </div>
  );
};

export default GlobalSearch;
