import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = '@sync_queue';
const LAST_SYNC_KEY = '@last_sync';

class OfflineManager {
  private isOnline: boolean = true;
  private syncQueue: SyncQueueItem[] = [];
  private listeners: ((isOnline: boolean) => void)[] = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize offline manager
   */
  async initialize() {
    // Load sync queue from storage
    await this.loadSyncQueue();

    // Setup network listener
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected || false;

      // Notify listeners
      this.notifyListeners(this.isOnline);

      // If connection restored, sync queue
      if (!wasOnline && this.isOnline) {
        this.processSyncQueue();
      }
    });

    // Get initial connection state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected || false;
  }

  /**
   * Check if device is online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add network status listener
   */
  addNetworkListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(callback => callback(isOnline));
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(
    type: SyncQueueItem['type'],
    endpoint: string,
    data: any
  ): Promise<void> {
    const item: SyncQueueItem = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      endpoint,
      data,
      timestamp: Date.now(),
    };

    this.syncQueue.push(item);
    await this.saveSyncQueue();
  }

  /**
   * Process sync queue
   */
  async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    console.log(`Processing ${this.syncQueue.length} items in sync queue...`);

    const failedItems: SyncQueueItem[] = [];

    for (const item of this.syncQueue) {
      try {
        await this.syncItem(item);
      } catch (error) {
        console.error('Failed to sync item:', error);
        failedItems.push(item);
      }
    }

    // Keep only failed items in queue
    this.syncQueue = failedItems;
    await this.saveSyncQueue();

    // Update last sync time
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  }

  /**
   * Sync single item
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    // This will be implemented with actual API calls
    // For now, just log
    console.log('Syncing item:', item);
    
    // TODO: Implement actual API call based on item type
    // const api = require('./api').default;
    // switch (item.type) {
    //   case 'CREATE':
    //     await api.post(item.endpoint, item.data);
    //     break;
    //   case 'UPDATE':
    //     await api.put(item.endpoint, item.data);
    //     break;
    //   case 'DELETE':
    //     await api.delete(item.endpoint);
    //     break;
    // }
  }

  /**
   * Load sync queue from storage
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (queueJson) {
        this.syncQueue = JSON.parse(queueJson);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  /**
   * Save sync queue to storage
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(): Promise<number | null> {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return timestamp ? parseInt(timestamp) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  }

  /**
   * Get sync queue size
   */
  getSyncQueueSize(): number {
    return this.syncQueue.length;
  }

  /**
   * Cache data locally
   */
  async cacheData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`@cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  /**
   * Get cached data
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(`@cache_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('@cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default new OfflineManager();
