import { createClient, RedisClientType } from 'redis';
import { log } from './logger';

let redisClient: RedisClientType | null = null;
let isRedisConnected = false;

/**
 * Initialize Redis client
 */
export async function initializeRedis(): Promise<void> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const isProduction = process.env.NODE_ENV === 'production';

  // Skip Redis in development if not available
  if (!isProduction && !process.env.REDIS_URL) {
    log.info('⚠️  Redis not configured. Caching disabled in development.');
    return;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            log.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return retries * 500; // Exponential backoff
        },
      },
    });

    redisClient.on('error', (err) => {
      log.error('Redis error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      log.info('✅ Redis connected');
      isRedisConnected = true;
    });

    redisClient.on('disconnect', () => {
      log.warn('⚠️  Redis disconnected');
      isRedisConnected = false;
    });

    await redisClient.connect();
  } catch (error: any) {
    log.error('Failed to initialize Redis:', error.message);
    if (isProduction) {
      throw error; // Fail in production
    }
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): RedisClientType | null {
  return redisClient;
}

/**
 * Check if Redis is connected
 */
export function isRedisAvailable(): boolean {
  return isRedisConnected && redisClient !== null;
}

/**
 * Set value in cache with expiration (seconds)
 */
export async function setCache(
  key: string,
  value: any,
  expirationInSeconds: number = 3600
): Promise<boolean> {
  if (!isRedisAvailable()) return false;

  try {
    const serialized = JSON.stringify(value);
    await redisClient!.setEx(key, expirationInSeconds, serialized);
    return true;
  } catch (error: any) {
    log.error(`Cache set error for key ${key}:`, error.message);
    return false;
  }
}

/**
 * Get value from cache
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  if (!isRedisAvailable()) return null;

  try {
    const cached = await redisClient!.get(key);
    if (!cached) return null;
    // cached may sometimes already be an object depending on client usage
    if (typeof cached === 'string') {
      return JSON.parse(cached) as T;
    }
    return cached as unknown as T;
  } catch (error: any) {
    log.error(`Cache get error for key ${key}:`, error.message);
    return null;
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  if (!isRedisAvailable()) return false;

  try {
    await redisClient!.del(key);
    return true;
  } catch (error: any) {
    log.error(`Cache delete error for key ${key}:`, error.message);
    return false;
  }
}

/**
 * Delete multiple keys matching pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  if (!isRedisAvailable()) return 0;

  try {
    const keys = await redisClient!.keys(pattern);
    if (keys.length === 0) return 0;
    
    await redisClient!.del(keys);
    return keys.length;
  } catch (error: any) {
    log.error(`Cache pattern delete error for pattern ${pattern}:`, error.message);
    return 0;
  }
}

/**
 * Check if key exists in cache
 */
export async function existsInCache(key: string): Promise<boolean> {
  if (!isRedisAvailable()) return false;

  try {
    const exists = await redisClient!.exists(key);
    return exists === 1;
  } catch (error: any) {
    log.error(`Cache exists check error for key ${key}:`, error.message);
    return false;
  }
}

/**
 * Get cache TTL (time to live) in seconds
 */
export async function getCacheTTL(key: string): Promise<number> {
  if (!isRedisAvailable()) return -1;

  try {
    return await redisClient!.ttl(key);
  } catch (error: any) {
    log.error(`Cache TTL error for key ${key}:`, error.message);
    return -1;
  }
}

/**
 * Increment value in cache
 */
export async function incrementCache(key: string, amount: number = 1): Promise<number> {
  if (!isRedisAvailable()) return 0;

  try {
    return await redisClient!.incrBy(key, amount);
  } catch (error: any) {
    log.error(`Cache increment error for key ${key}:`, error.message);
    return 0;
  }
}

/**
 * Clear all cache (use with caution!)
 */
export async function clearAllCache(): Promise<boolean> {
  if (!isRedisAvailable()) return false;

  try {
    await redisClient!.flushDb();
    log.info('All cache cleared');
    return true;
  } catch (error: any) {
    log.error('Cache clear error:', error.message);
    return false;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    log.info('Redis connection closed');
  }
}

// Cache key generators
export const CacheKeys = {
  equipment: (id?: number) => id ? `equipment:${id}` : 'equipment:all',
  equipmentList: (filters: any) => `equipment:list:${JSON.stringify(filters)}`,
  reservation: (id: number) => `reservation:${id}`,
  reservationList: (filters: any) => `reservation:list:${JSON.stringify(filters)}`,
  dashboard: () => 'dashboard:stats',
  user: (id: number) => `user:${id}`,
  notifications: (userId: number) => `notifications:${userId}`,
};

// Cache TTL (Time To Live) in seconds
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

export default {
  initialize: initializeRedis,
  client: getRedisClient,
  isAvailable: isRedisAvailable,
  set: setCache,
  get: getCache,
  delete: deleteCache,
  deletePattern: deleteCachePattern,
  exists: existsInCache,
  ttl: getCacheTTL,
  increment: incrementCache,
  clear: clearAllCache,
  close: closeRedis,
  keys: CacheKeys,
  ttlValues: CacheTTL,
};
