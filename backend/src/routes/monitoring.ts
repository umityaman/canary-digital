import express from 'express';
import { 
  getPerformanceStats, 
  getSlowestEndpoints, 
  getRecentSlowRequests,
  clearMetrics 
} from '../config/performance';
import { log } from '../config/logger';

const router = express.Router();

/**
 * GET /api/monitoring/performance
 * Get overall performance statistics
 */
router.get('/performance', (req, res) => {
  try {
    const stats = getPerformanceStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    log.error('Error fetching performance stats', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/monitoring/slow-endpoints
 * Get slowest endpoints
 */
router.get('/slow-endpoints', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const slowest = getSlowestEndpoints(limit);
    
    res.json({
      success: true,
      data: slowest,
    });
  } catch (error: any) {
    log.error('Error fetching slow endpoints', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/monitoring/slow-requests
 * Get recent slow requests
 */
router.get('/slow-requests', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const slowRequests = getRecentSlowRequests(limit);
    
    res.json({
      success: true,
      data: slowRequests,
    });
  } catch (error: any) {
    log.error('Error fetching slow requests', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/monitoring/clear-metrics
 * Clear performance metrics
 */
router.post('/clear-metrics', (req, res) => {
  try {
    clearMetrics();
    res.json({
      success: true,
      message: 'Performance metrics cleared',
    });
  } catch (error: any) {
    log.error('Error clearing metrics', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/monitoring/health
 * Enhanced health check with system info
 */
router.get('/health', (req, res) => {
  try {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    const stats = getPerformanceStats();

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        formatted: formatUptime(uptime),
      },
      memory: {
        rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`,
      },
      performance: {
        totalRequests: stats.totalRequests,
        averageResponseTime: `${stats.averageResponseTime}ms`,
        slowRequests: stats.slowRequests,
      },
      environment: process.env.NODE_ENV,
    });
  } catch (error: any) {
    log.error('Error in health check', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
    });
  }
});

/**
 * Format uptime to human readable string
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export default router;
