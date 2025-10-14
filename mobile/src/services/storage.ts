import AsyncStorage from '@react-native-async-storage/async-storage';

// Generic storage helpers
export const storage = {
  // Get item
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  // Set item
  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  },

  // Remove item
  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  },

  // Clear all
  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  // Get multiple items
  async getMultiple(keys: string[]): Promise<Record<string, any>> {
    try {
      const values = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};
      
      values.forEach(([key, value]) => {
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  },

  // Set multiple items
  async setMultiple(items: Array<[string, any]>): Promise<boolean> {
    try {
      const serialized = items.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]) as Array<[string, string]>;
      
      await AsyncStorage.multiSet(serialized);
      return true;
    } catch (error) {
      console.error('Error setting multiple items:', error);
      return false;
    }
  },

  // Get all keys
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },
};

// Cache management with TTL
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const cache = {
  // Set cache with TTL
  async set<T>(key: string, data: T, ttlMs: number): Promise<boolean> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    return storage.setItem(key, cacheItem);
  },

  // Get cache if not expired
  async get<T>(key: string): Promise<T | null> {
    const cacheItem = await storage.getItem<CacheItem<T>>(key);
    
    if (!cacheItem) {
      return null;
    }
    
    const now = Date.now();
    const age = now - cacheItem.timestamp;
    
    if (age > cacheItem.ttl) {
      // Expired, remove it
      await storage.removeItem(key);
      return null;
    }
    
    return cacheItem.data;
  },

  // Check if cache is valid
  async isValid(key: string): Promise<boolean> {
    const cacheItem = await storage.getItem<CacheItem<any>>(key);
    
    if (!cacheItem) {
      return false;
    }
    
    const now = Date.now();
    const age = now - cacheItem.timestamp;
    
    return age <= cacheItem.ttl;
  },

  // Clear expired cache items
  async clearExpired(): Promise<number> {
    const keys = await storage.getAllKeys();
    let clearedCount = 0;
    
    for (const key of keys) {
      const isValid = await cache.isValid(key);
      if (!isValid) {
        await storage.removeItem(key);
        clearedCount++;
      }
    }
    
    return clearedCount;
  },

  // Clear all cache
  async clearAll(): Promise<boolean> {
    const keys = await storage.getAllKeys();
    const cacheKeys = keys.filter(key => key.includes('cache:'));
    
    for (const key of cacheKeys) {
      await storage.removeItem(key);
    }
    
    return true;
  },
};

export default storage;
