import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Search, X, Filter, Clock, Star } from 'lucide-react-native';
import api from '../../services/api';
import { colors } from '../../constants/colors';

interface AdvancedSearchProps {
  entity: 'equipment' | 'customers' | 'orders';
  onResultSelect?: (result: any) => void;
  onSearch?: (results: any) => void;
}

export const AdvancedSearchMobile: React.FC<AdvancedSearchProps> = ({
  entity,
  onResultSelect,
  onSearch,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({
    data: [],
    total: 0,
    page: 1,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({
    sortBy: entity === 'equipment' ? 'name' : 'createdAt',
    sortOrder: 'asc',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadSavedSearches();
    loadSearchHistory();
  }, [entity]);

  const loadSavedSearches = async () => {
    try {
      const response = await api.get('/search/saved', { params: { entity } });
      setSavedSearches(response.data.slice(0, 5));
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

  const performSearch = async (searchQuery: string, searchFilters: any = filters) => {
    if (!searchQuery && Object.keys(searchFilters).length === 3) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/search/${entity}`, {
        query: searchQuery,
        ...searchFilters,
      });
      setResults(response.data);
      onSearch?.(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.length >= 2) {
      // Debounce would be implemented here
      performSearch(text);
    } else if (text.length === 0) {
      setResults({ data: [], total: 0, page: 1, hasMore: false });
    }
  };

  const applySavedSearch = async (search: any) => {
    try {
      const parsedFilters = JSON.parse(search.filters);
      setQuery(parsedFilters.query || '');
      setFilters(parsedFilters);
      await performSearch(parsedFilters.query || '', parsedFilters);
      
      // Update usage
      await api.put(`/search/saved/${search.id}/use`);
      loadSavedSearches();
    } catch (error) {
      console.error('Failed to apply saved search:', error);
    }
  };

  const renderSearchResult = ({ item }: { item: any }) => {
    if (entity === 'equipment') {
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => onResultSelect?.(item)}
        >
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{item.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'AVAILABLE' ? colors.success + '20' : colors.warning + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: item.status === 'AVAILABLE' ? colors.success : colors.warning }
              ]}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.resultSubtitle}>
            {item.code} • {item.brand} {item.model}
          </Text>
          {item.rentalPrice && (
            <Text style={styles.resultPrice}>${item.rentalPrice}/day</Text>
          )}
        </TouchableOpacity>
      );
    } else if (entity === 'customers') {
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => onResultSelect?.(item)}
        >
          <Text style={styles.resultTitle}>{item.name}</Text>
          <Text style={styles.resultSubtitle}>
            {item.company && `${item.company} • `}
            {item.email || item.phone}
          </Text>
          {item._count && (
            <Text style={styles.resultMeta}>
              {item._count.orders} orders
            </Text>
          )}
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => onResultSelect?.(item)}
        >
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{item.orderNumber}</Text>
            <Text style={styles.resultPrice}>${item.totalAmount.toFixed(2)}</Text>
          </View>
          <Text style={styles.resultSubtitle}>
            {item.customer?.name}
          </Text>
          <View style={styles.resultFooter}>
            <Text style={styles.resultMeta}>
              {new Date(item.startDate).toLocaleDateString()}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getOrderStatusColor(item.status) + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getOrderStatusColor(item.status) }
              ]}>
                {item.status}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return colors.success;
      case 'ACTIVE': return colors.primary;
      case 'CANCELLED': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${entity}...`}
          value={query}
          onChangeText={handleQueryChange}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleQueryChange('')}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Saved Searches */}
      {query === '' && savedSearches.length > 0 && (
        <View style={styles.savedSearches}>
          <Text style={styles.sectionTitle}>Saved Searches</Text>
          <FlatList
            horizontal
            data={savedSearches}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.savedSearchChip}
                onPress={() => applySavedSearch(item)}
              >
                {item.isPinned && <Star size={12} color={colors.warning} />}
                <Text style={styles.savedSearchText}>{item.name}</Text>
                <Text style={styles.savedSearchCount}>{item.usageCount}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Search History */}
      {query === '' && searchHistory.length > 0 && (
        <View style={styles.searchHistory}>
          <View style={styles.historyHeader}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Recent Searches</Text>
          </View>
          <FlatList
            horizontal
            data={searchHistory}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyChip}
                onPress={() => handleQueryChange(item.query)}
              >
                <Text style={styles.historyText}>{item.query}</Text>
                <Text style={styles.historyCount}>{item.resultCount}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <>
          {results.total > 0 && (
            <Text style={styles.resultCount}>
              {results.total} result{results.total !== 1 ? 's' : ''} found
            </Text>
          )}
          <FlatList
            data={results.data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSearchResult}
            contentContainerStyle={styles.resultsList}
            ListEmptyComponent={
              query.length >= 2 ? (
                <View style={styles.emptyState}>
                  <Search size={48} color={colors.textDisabled} />
                  <Text style={styles.emptyText}>No results found</Text>
                  <Text style={styles.emptySubtext}>Try a different search term</Text>
                </View>
              ) : null
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    marginLeft: 8,
    padding: 4,
  },
  savedSearches: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchHistory: {
    padding: 16,
    backgroundColor: colors.background,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  savedSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  savedSearchText: {
    fontSize: 14,
    color: colors.primary,
  },
  savedSearchCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  historyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  historyText: {
    fontSize: 14,
    color: colors.text,
  },
  historyCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resultCount: {
    padding: 16,
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.white,
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  resultMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
});

export default AdvancedSearchMobile;
