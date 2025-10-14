/**
 * Performance Monitoring Middleware
 * Tracks response times and slow queries
 */

import { Request, Response, NextFunction } from 'express';
import { log } from './logger';
import { addBreadcrumb } from './sentry';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userId?: number;
}

// Store recent performance metrics
const recentMetrics: PerformanceMetrics[] = [];
const MAX_METRICS = 1000;

// Slow query threshold (ms)
const SLOW_QUERY_THRESHOLD = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10);

/**
 * Express middleware to track response time
 */
export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Listen for response finish event
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const metrics: PerformanceMetrics = {
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
      userId: (req as any).user?.id,
    };

    // Store metrics
    recentMetrics.push(metrics);
    if (recentMetrics.length > MAX_METRICS) {
      recentMetrics.shift(); // Remove oldest
    }

    // Log slow requests
    if (responseTime > SLOW_QUERY_THRESHOLD) {
      log.warn(`⚠️  Slow request detected`, {
        endpoint: req.path,
        method: req.method,
        responseTime: `${responseTime}ms`,
        query: req.query,
        params: req.params,
      });

      // Add breadcrumb to Sentry
      addBreadcrumb('Slow Request', 'performance', {
        endpoint: req.path,
        method: req.method,
        responseTime,
      });
    }

    // Log all requests in debug mode
    if (process.env.NODE_ENV === 'development') {
      const emoji = responseTime > SLOW_QUERY_THRESHOLD ? '🐢' : '⚡';
      log.debug(
        `${emoji} ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms`
      );
    }
  });

  next();
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  if (recentMetrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      endpoints: {},
    };
  }

  const totalRequests = recentMetrics.length;
  const totalResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
  const averageResponseTime = totalResponseTime / totalRequests;
  const slowRequests = recentMetrics.filter(m => m.responseTime > SLOW_QUERY_THRESHOLD).length;

  // Group by endpoint
  const endpointStats: Record<string, {
    count: number;
    avgTime: number;
    maxTime: number;
    minTime: number;
  }> = {};

  recentMetrics.forEach(metric => {
    const key = `${metric.method} ${metric.endpoint}`;
    if (!endpointStats[key]) {
      endpointStats[key] = {
        count: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity,
      };
    }

    const stats = endpointStats[key];
    stats.count++;
    stats.avgTime = ((stats.avgTime * (stats.count - 1)) + metric.responseTime) / stats.count;
    stats.maxTime = Math.max(stats.maxTime, metric.responseTime);
    stats.minTime = Math.min(stats.minTime, metric.responseTime);
  });

  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    slowRequests,
    slowRequestsPercentage: ((slowRequests / totalRequests) * 100).toFixed(2),
    endpoints: endpointStats,
    timeWindow: {
      oldest: recentMetrics[0]?.timestamp,
      newest: recentMetrics[recentMetrics.length - 1]?.timestamp,
    },
  };
}

/**
 * Get slowest endpoints
 */
export function getSlowestEndpoints(limit = 10) {
  const stats = getPerformanceStats();
  
  return Object.entries(stats.endpoints)
    .map(([endpoint, data]) => ({ endpoint, ...data }))
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, limit);
}

/**
 * Get recent slow requests
 */
export function getRecentSlowRequests(limit = 20) {
  return recentMetrics
    .filter(m => m.responseTime > SLOW_QUERY_THRESHOLD)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Clear metrics
 */
export function clearMetrics() {
  recentMetrics.length = 0;
  log.info('Performance metrics cleared');
}

export default performanceMiddleware;
