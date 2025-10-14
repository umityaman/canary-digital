/**
 * Cache Middleware for Express
 * Caches GET request responses using Redis
 */

import { Request, Response, NextFunction } from 'express';
import { getCache, setCache, CacheTTL } from './redis';
import { log } from './logger';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string; // Custom cache key generator
  condition?: (req: Request) => boolean; // Condition to cache
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request): string {
  const { path, query, user } = req;
  const userId = (user as any)?.id || 'anonymous';
  const queryString = JSON.stringify(query);
  return `cache:${userId}:${path}:${queryString}`;
}

/**
 * Cache middleware factory
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = CacheTTL.MEDIUM,
    keyGenerator = generateCacheKey,
    condition = () => true,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check condition
    if (!condition(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);

    try {
      // Try to get from cache
      const cached = await getCache(cacheKey);

      if (cached) {
        log.debug(`Cache HIT: ${cacheKey}`);
        return res.json({
          ...cached,
          _cached: true,
          _cacheKey: cacheKey,
        });
      }

      log.debug(`Cache MISS: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function (data: any) {
        // Cache the response
        setCache(cacheKey, data, ttl).catch((err) => {
          log.error(`Failed to cache response for ${cacheKey}:`, err);
        });

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error: any) {
      log.error(`Cache middleware error for ${cacheKey}:`, error.message);
      next(); // Continue without caching on error
    }
  };
}

/**
 * Cache invalidation middleware
 * Invalidates cache when data is modified (POST, PUT, DELETE)
 */
export function invalidateCacheMiddleware(patterns: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original send method
    const originalSend = res.send.bind(res);

    // Override send method to invalidate cache after successful response
    res.send = function (data: any) {
      // Only invalidate on successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache patterns asynchronously
        Promise.all(
          patterns.map(async (pattern) => {
            const { deleteCachePattern } = await import('./redis');
            const deleted = await deleteCachePattern(pattern);
            if (deleted > 0) {
              log.info(`Invalidated ${deleted} cache keys matching: ${pattern}`);
            }
          })
        ).catch((err) => {
          log.error('Cache invalidation error:', err);
        });
      }

      // Call original send method
      return originalSend(data);
    };

    next();
  };
}

/**
 * Pre-configured cache middleware for common routes
 */
export const cacheStrategies = {
  // Short-lived cache (1 minute) for frequently changing data
  shortLived: cacheMiddleware({ ttl: CacheTTL.SHORT }),

  // Medium cache (5 minutes) for semi-static data
  medium: cacheMiddleware({ ttl: CacheTTL.MEDIUM }),

  // Long cache (1 hour) for static data
  longLived: cacheMiddleware({ ttl: CacheTTL.LONG }),

  // Dashboard cache (5 minutes)
  dashboard: cacheMiddleware({
    ttl: CacheTTL.MEDIUM,
    keyGenerator: (req) => `cache:dashboard:stats`,
  }),

  // Equipment list cache (5 minutes)
  equipmentList: cacheMiddleware({
    ttl: CacheTTL.MEDIUM,
    keyGenerator: (req) => {
      const { status, category, search } = req.query;
      return `cache:equipment:list:${status}:${category}:${search}`;
    },
  }),

  // User-specific cache (1 minute)
  userSpecific: cacheMiddleware({
    ttl: CacheTTL.SHORT,
    keyGenerator: (req) => {
      const userId = (req as any).user?.id || 'anonymous';
      return `cache:user:${userId}:${req.path}`;
    },
  }),
};

/**
 * Cache invalidation patterns for common routes
 */
export const invalidationPatterns = {
  equipment: ['cache:*:equipment:*', 'cache:dashboard:*'],
  reservation: ['cache:*:reservation:*', 'cache:dashboard:*'],
  order: ['cache:*:order:*', 'cache:dashboard:*'],
  user: ['cache:user:*'],
  all: ['cache:*'],
};

export default cacheMiddleware;
