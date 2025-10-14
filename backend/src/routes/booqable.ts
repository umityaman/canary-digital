import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';
import { BooqableService } from '../services/booqable';
import { BooqableSyncService } from '../services/booqableSync';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// Webhook signature verification
function verifyWebhookSignature(payload: any, signature: string | undefined, secret: string): boolean {
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const calculatedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

// ==================== CONNECTION ====================

/**
 * Connect to Booqable
 * POST /api/booqable/connect
 */
router.post('/connect', authenticateToken, async (req, res) => {
  try {
    const { apiKey, accountUrl } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Test the API key
    const booqableService = new BooqableService(apiKey, accountUrl);
    const isValid = await booqableService.testConnection();

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid API key or connection failed' });
    }

    // Check if connection already exists
    const existingConnection = await prisma.booqableConnection.findUnique({
      where: { companyId: req.companyId }
    });

    if (existingConnection) {
      // Update existing connection
      const connection = await prisma.booqableConnection.update({
        where: { id: existingConnection.id },
        data: {
          apiKey, // TODO: Encrypt this
          accountUrl,
          isActive: true,
          errorMessage: null
        }
      });

      return res.json({
        message: 'Booqable connection updated successfully',
        connection: {
          id: connection.id,
          accountUrl: connection.accountUrl,
          isActive: connection.isActive,
          lastSyncAt: connection.lastSyncAt
        }
      });
    }

    // Create new connection
    const connection = await prisma.booqableConnection.create({
      data: {
        companyId: req.companyId,
        apiKey, // TODO: Encrypt this
        accountUrl: accountUrl || 'https://api.booqable.com',
        isActive: true
      }
    });

    res.json({
      message: 'Connected to Booqable successfully',
      connection: {
        id: connection.id,
        accountUrl: connection.accountUrl,
        isActive: connection.isActive
      }
    });
  } catch (error) {
    console.error('[Booqable] Connection failed:', error);
    res.status(500).json({ error: 'Failed to connect to Booqable' });
  }
});

/**
 * Disconnect from Booqable
 * DELETE /api/booqable/disconnect
 */
router.delete('/disconnect', authenticateToken, async (req, res) => {
  try {
    const connection = await prisma.booqableConnection.findUnique({
      where: { companyId: req.companyId }
    });

    if (!connection) {
      return res.status(404).json({ error: 'No Booqable connection found' });
    }

    await prisma.booqableConnection.update({
      where: { id: connection.id },
      data: { isActive: false }
    });

    res.json({ message: 'Disconnected from Booqable successfully' });
  } catch (error) {
    console.error('[Booqable] Disconnect failed:', error);
    res.status(500).json({ error: 'Failed to disconnect from Booqable' });
  }
});

/**
 * Get connection status
 * GET /api/booqable/status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const connection = await prisma.booqableConnection.findUnique({
      where: { companyId: req.companyId },
      include: {
        syncs: {
          orderBy: { startedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!connection) {
      return res.json({
        connected: false,
        message: 'No Booqable connection found'
      });
    }

    res.json({
      connected: connection.isActive,
      accountUrl: connection.accountUrl,
      lastSyncAt: connection.lastSyncAt,
      lastSyncStatus: connection.lastSyncStatus,
      errorMessage: connection.errorMessage,
      recentSyncs: connection.syncs
    });
  } catch (error) {
    console.error('[Booqable] Status check failed:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
});

// ==================== MANUAL SYNC ====================

/**
 * Sync all products
 * POST /api/booqable/sync/products
 */
router.post('/sync/products', authenticateToken, async (req, res) => {
  try {
    const connection = await prisma.booqableConnection.findUnique({
      where: { companyId: req.companyId }
    });

    if (!connection || !connection.isActive) {
      return res.status(400).json({ error: 'No active Booqable connection found' });
    }

    const booqableService = new BooqableService(connection.apiKey, connection.accountUrl);
    const syncService = new BooqableSyncService(
      req.companyId,
      booqableService,
      connection.id
    );

    // Run sync in background
    syncService.syncProducts().catch(error => {
      console.error('[Booqable] Product sync error:', error);
    });

    res.json({
      message: 'Product sync started',
      status: 'IN_PROGRESS'
    });
  } catch (error) {
    console.error('[Booqable] Product sync failed:', error);
    res.status(500).json({ error: 'Failed to start product sync' });
  }
});

/**
 * Sync all customers
 * POST /api/booqable/sync/customers
 */
router.post('/sync/customers', authenticateToken, async (req, res) => {
  try {
    const connection = await prisma.booqableConnection.findUnique({
      where: { companyId: req.companyId }
    });

    if (!connection || !connection.isActive) {
      return res.status(400).json({ error: 'No active Booqable connection found' });
    }

    const booqableService = new BooqableService(connection.apiKey, connection.accountUrl);
    const syncService = new BooqableSyncService(
      req.companyId,
      booqableService,
      connection.id
    );

    // Run sync in background
    syncService.syncCustomers().catch(error => {
      console.error('[Booqable] Customer sync error:', error);
    });

    res.json({
      message: 'Customer sync started',
      status: 'IN_PROGRESS'
    });
  } catch (error) {
    console.error('[Booqable] Customer sync failed:', error);
    res.status(500).json({ error: 'Failed to start customer sync' });
  }
});

/**
 * Sync all orders
 * POST /api/booqable/sync/orders
 */
router.post('/sync/orders', authenticateToken, async (req, res) => {
  try {
    const connection = await prisma.booqableConnection.findUnique({
      where: { companyId: req.companyId }
    });

    if (!connection || !connection.isActive) {
      return res.status(400).json({ error: 'No active Booqable connection found' });
    }

    const booqableService = new BooqableService(connection.apiKey, connection.accountUrl);
    const syncService = new BooqableSyncService(
      req.companyId,
      booqableService,
      connection.id
    );

    // Run sync in background
    syncService.syncOrders().catch(error => {
      console.error('[Booqable] Order sync error:', error);
    });

    res.json({
      message: 'Order sync started',
      status: 'IN_PROGRESS'
    });
  } catch (error) {
    console.error('[Booqable] Order sync failed:', error);
    res.status(500).json({ error: 'Failed to start order sync' });
  }
});

/**
 * Sync all (full sync)
 * POST /api/booqable/sync/all
 */
router.post('/sync/all', authenticateToken, async (req, res) => {
  try {
    const connection = await prisma.booqableConnection.findUnique({
      where: { companyId: req.companyId }
    });

    if (!connection || !connection.isActive) {
      return res.status(400).json({ error: 'No active Booqable connection found' });
    }

    const booqableService = new BooqableService(connection.apiKey, connection.accountUrl);
    const syncService = new BooqableSyncService(
      req.companyId,
      booqableService,
      connection.id
    );

    // Run initial sync in background
    syncService.initialSync().catch(error => {
      console.error('[Booqable] Full sync error:', error);
    });

    res.json({
      message: 'Full sync started (products, customers, orders)',
      status: 'IN_PROGRESS'
    });
  } catch (error) {
    console.error('[Booqable] Full sync failed:', error);
    res.status(500).json({ error: 'Failed to start full sync' });
  }
});

// ==================== WEBHOOK ====================

/**
 * Receive webhooks from Booqable
 * POST /api/booqable/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, data, account_id } = req.body;

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.BOOQABLE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-booqable-signature'] as string;
      const isValid = verifyWebhookSignature(req.body, signature, webhookSecret);
      
      if (!isValid) {
        console.error('[Booqable Webhook] Invalid signature');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    console.log(`[Booqable Webhook] Received: ${event} from account ${account_id}`);

    // Find the connection for this account
    const connection = await prisma.booqableConnection.findFirst({
      where: { 
        accountUrl: { contains: account_id },
        isActive: true 
      }
    });

    if (!connection) {
      console.warn(`[Booqable Webhook] No active connection found for account ${account_id}`);
      return res.status(404).json({ error: 'Connection not found' });
    }

    const booqableService = new BooqableService(connection.apiKey, connection.accountUrl);
    const syncService = new BooqableSyncService(connection.companyId, booqableService);

    // Handle different event types
    switch (event) {
      case 'product.created':
      case 'product.updated':
        if (data?.id) {
          console.log(`[Booqable Webhook] Syncing product ${data.id}`);
          const product = await booqableService.getProduct(data.id);
          await syncService.syncSingleProduct(product);
        }
        break;
      
      case 'product.deleted':
        if (data?.id) {
          console.log(`[Booqable Webhook] Soft deleting product ${data.id}`);
          await prisma.equipment.updateMany({
            where: { booqableId: data.id.toString() },
            data: { 
              status: 'LOST',
              syncStatus: 'DELETED'
            }
          });
        }
        break;
      
      case 'order.created':
      case 'order.updated':
        if (data?.id) {
          console.log(`[Booqable Webhook] Syncing order ${data.id}`);
          const order = await booqableService.getOrder(data.id);
          await syncService.syncSingleOrder(order);
        }
        break;
      
      case 'order.deleted':
        if (data?.id) {
          console.log(`[Booqable Webhook] Soft deleting order ${data.id}`);
          await prisma.order.updateMany({
            where: { booqableId: data.id.toString() },
            data: { 
              status: 'CANCELLED',
              syncStatus: 'DELETED'
            }
          });
        }
        break;
      
      case 'customer.created':
      case 'customer.updated':
        if (data?.id) {
          console.log(`[Booqable Webhook] Syncing customer ${data.id}`);
          const customer = await booqableService.getCustomer(data.id);
          await syncService.syncSingleCustomer(customer);
        }
        break;
      
      default:
        console.log(`[Booqable Webhook] Unknown event: ${event}`);
    }

    // Respond immediately (webhook processing is async)
    res.json({ success: true, event });
  } catch (error) {
    console.error('[Booqable Webhook] Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ==================== SYNC HISTORY ====================

/**
 * Get sync history
 * GET /api/booqable/sync-history
 */
router.get('/sync-history', authenticateToken, async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const syncs = await prisma.booqableSync.findMany({
      where: { companyId: req.companyId },
      orderBy: { startedAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum
    });

    const total = await prisma.booqableSync.count({
      where: { companyId: req.companyId }
    });

    res.json({
      syncs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('[Booqable] Failed to fetch sync history:', error);
    res.status(500).json({ error: 'Failed to fetch sync history' });
  }
});

/**
 * Get sync detail
 * GET /api/booqable/sync/:id
 */
router.get('/sync/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const sync = await prisma.booqableSync.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.companyId
      }
    });

    if (!sync) {
      return res.status(404).json({ error: 'Sync record not found' });
    }

    res.json(sync);
  } catch (error) {
    console.error('[Booqable] Failed to fetch sync detail:', error);
    res.status(500).json({ error: 'Failed to fetch sync detail' });
  }
});

export default router;
