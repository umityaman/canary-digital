import { create } from 'zustand';

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: number;
  type: 'equipment' | 'reservation' | 'global';
}

interface SearchStore {
  searchHistory: SearchHistory[];
  recentSearches: string[];
  addToHistory: (query: string, type: SearchHistory['type']) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getHistoryByType: (type: SearchHistory['type']) => SearchHistory[];
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  searchHistory: [],
  recentSearches: [],

  addToHistory: (query: string, type: SearchHistory['type']) => {
    if (!query.trim()) return;

    const newEntry: SearchHistory = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now(),
      type,
    };

    set((state) => {
      // Remove duplicates and add new entry
      const filtered = state.searchHistory.filter(
        (item) => item.query.toLowerCase() !== query.toLowerCase() || item.type !== type
      );
      
      // Keep only last 50 searches
      const history = [newEntry, ...filtered].slice(0, 50);
      
      // Update recent searches (last 5 unique queries)
      const recent = [...new Set([query, ...state.recentSearches])]
        .slice(0, 5);

      return {
        searchHistory: history,
        recentSearches: recent,
      };
    });
  },

  removeFromHistory: (id: string) => {
    set((state) => ({
      searchHistory: state.searchHistory.filter((item) => item.id !== id),
    }));
  },

  clearHistory: () => {
    set({ searchHistory: [], recentSearches: [] });
  },

  getHistoryByType: (type: SearchHistory['type']) => {
    return get().searchHistory.filter((item) => item.type === type);
  },
}));
