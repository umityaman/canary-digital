import { PrismaClient } from '@prisma/client';
import { BooqableService } from './booqable';

const prisma = new PrismaClient();

/**
 * Booqable Sync Service
 * Handles synchronization between Booqable and Canary
 */
export class BooqableSyncService {
  private booqableService: BooqableService;
  private companyId: number;
  private connectionId?: number;

  constructor(companyId: number, booqableService: BooqableService, connectionId?: number) {
    this.companyId = companyId;
    this.booqableService = booqableService;
    this.connectionId = connectionId;
  }

  /**
   * Perform initial full sync
   */
  async initialSync(): Promise<void> {
    console.log('[BooqableSync] Starting initial sync...');

    try {
      // Step 1: Sync products
      await this.syncProducts();
      
      // Step 2: Sync customers
      await this.syncCustomers();
      
      // Step 3: Sync orders (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      await this.syncOrders({ created_after: sixMonthsAgo.toISOString() });
      
      // Step 4: Update connection
      await prisma.booqableConnection.update({
        where: { id: this.connectionId },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: 'SUCCESS'
        }
      });

      console.log('[BooqableSync] Initial sync completed successfully');
    } catch (error) {
      console.error('[BooqableSync] Initial sync failed:', error);
      
      await prisma.booqableConnection.update({
        where: { id: this.connectionId },
        data: {
          lastSyncStatus: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      throw error;
    }
  }

  /**
   * Sync products from Booqable to Canary
   */
  async syncProducts(): Promise<void> {
    const syncRecord = await this.createSyncRecord('PRODUCT', 'IMPORT');
    const startTime = Date.now();

    try {
      let page = 1;
      let hasMore = true;
      let stats = { created: 0, updated: 0, failed: 0, skipped: 0 };

      while (hasMore) {
        const response = await this.booqableService.getProducts(page, 100);
        const products = response.data || response;

        for (const booqableProduct of products) {
          try {
            await this.syncSingleProduct(booqableProduct);
            
            // Check if created or updated
            const exists = await prisma.equipment.findUnique({
              where: { booqableId: booqableProduct.id }
            });
            
            if (exists) {
              stats.updated++;
            } else {
              stats.created++;
            }
          } catch (error) {
            console.error(`[BooqableSync] Failed to sync product ${booqableProduct.id}:`, error);
            stats.failed++;
          }
        }

        // Check if there are more pages
        hasMore = products.length === 100;
        page++;
      }

      const duration = Math.floor((Date.now() - startTime) / 1000);

      await prisma.booqableSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'SUCCESS',
          recordsProcessed: stats.created + stats.updated + stats.skipped,
          recordsCreated: stats.created,
          recordsUpdated: stats.updated,
          recordsFailed: stats.failed,
          recordsSkipped: stats.skipped,
          completedAt: new Date(),
          duration
        }
      });

      console.log(`[BooqableSync] Products synced: ${JSON.stringify(stats)}`);
    } catch (error) {
      await prisma.booqableSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        }
      });
      throw error;
    }
  }

  /**
   * Sync single product (can be called by webhooks)
   */
  async syncSingleProduct(booqableProduct: any): Promise<void> {
    const equipmentData = this.mapBooqableProduct(booqableProduct);

    await prisma.equipment.upsert({
      where: { booqableId: booqableProduct.id },
      update: {
        ...equipmentData,
        booqableUpdatedAt: new Date(booqableProduct.updated_at),
        syncStatus: 'SYNCED'
      },
      create: {
        ...equipmentData,
        companyId: this.companyId,
        booqableId: booqableProduct.id,
        booqableUpdatedAt: new Date(booqableProduct.updated_at),
        syncStatus: 'SYNCED'
      }
    });
  }

  /**
   * Sync customers from Booqable to Canary
   */
  async syncCustomers(): Promise<void> {
    const syncRecord = await this.createSyncRecord('CUSTOMER', 'IMPORT');
    const startTime = Date.now();

    try {
      let page = 1;
      let hasMore = true;
      let stats = { created: 0, updated: 0, failed: 0, skipped: 0 };

      while (hasMore) {
        const response = await this.booqableService.getCustomers(page, 100);
        const customers = response.data || response;

        for (const booqableCustomer of customers) {
          try {
            await this.syncSingleCustomer(booqableCustomer);
            
            const exists = await prisma.customer.findUnique({
              where: { booqableId: booqableCustomer.id }
            });
            
            if (exists) {
              stats.updated++;
            } else {
              stats.created++;
            }
          } catch (error) {
            console.error(`[BooqableSync] Failed to sync customer ${booqableCustomer.id}:`, error);
            stats.failed++;
          }
        }

        hasMore = customers.length === 100;
        page++;
      }

      const duration = Math.floor((Date.now() - startTime) / 1000);

      await prisma.booqableSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'SUCCESS',
          recordsProcessed: stats.created + stats.updated + stats.skipped,
          recordsCreated: stats.created,
          recordsUpdated: stats.updated,
          recordsFailed: stats.failed,
          recordsSkipped: stats.skipped,
          completedAt: new Date(),
          duration
        }
      });

      console.log(`[BooqableSync] Customers synced: ${JSON.stringify(stats)}`);
    } catch (error) {
      await prisma.booqableSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        }
      });
      throw error;
    }
  }

  /**
   * Sync single customer (can be called by webhooks)
   */
  async syncSingleCustomer(booqableCustomer: any): Promise<void> {
    const customerData = this.mapBooqableCustomer(booqableCustomer);

    await prisma.customer.upsert({
      where: { booqableId: booqableCustomer.id },
      update: {
        ...customerData,
        booqableUpdatedAt: new Date(booqableCustomer.updated_at),
        syncStatus: 'SYNCED'
      },
      create: {
        ...customerData,
        booqableId: booqableCustomer.id,
        booqableUpdatedAt: new Date(booqableCustomer.updated_at),
        syncStatus: 'SYNCED'
      }
    });
  }

  /**
   * Sync orders from Booqable to Canary
   */
  async syncOrders(filters?: any): Promise<void> {
    const syncRecord = await this.createSyncRecord('ORDER', 'IMPORT');
    const startTime = Date.now();

    try {
      let page = 1;
      let hasMore = true;
      let stats = { created: 0, updated: 0, failed: 0, skipped: 0 };

      while (hasMore) {
        const response = await this.booqableService.getOrders(filters, page, 100);
        const orders = response.data || response;

        for (const booqableOrder of orders) {
          try {
            await this.syncSingleOrder(booqableOrder);
            
            const exists = await prisma.order.findUnique({
              where: { booqableId: booqableOrder.id }
            });
            
            if (exists) {
              stats.updated++;
            } else {
              stats.created++;
            }
          } catch (error) {
            console.error(`[BooqableSync] Failed to sync order ${booqableOrder.id}:`, error);
            stats.failed++;
          }
        }

        hasMore = orders.length === 100;
        page++;
      }

      const duration = Math.floor((Date.now() - startTime) / 1000);

      await prisma.booqableSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'SUCCESS',
          recordsProcessed: stats.created + stats.updated + stats.skipped,
          recordsCreated: stats.created,
          recordsUpdated: stats.updated,
          recordsFailed: stats.failed,
          recordsSkipped: stats.skipped,
          completedAt: new Date(),
          duration
        }
      });

      console.log(`[BooqableSync] Orders synced: ${JSON.stringify(stats)}`);
    } catch (error) {
      await prisma.booqableSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        }
      });
      throw error;
    }
  }

  /**
   * Sync single order (can be called by webhooks)
   */
  async syncSingleOrder(booqableOrder: any): Promise<void> {
    // Find or create customer first
    let customer = await prisma.customer.findUnique({
      where: { booqableId: booqableOrder.customer_id }
    });

    if (!customer) {
      // Fetch customer from Booqable and sync
      const booqableCustomer = await this.booqableService.getCustomer(booqableOrder.customer_id);
      await this.syncSingleCustomer(booqableCustomer);
      customer = await prisma.customer.findUnique({
        where: { booqableId: booqableOrder.customer_id }
      });
    }

    if (!customer) {
      throw new Error(`Customer not found for order ${booqableOrder.id}`);
    }

    const orderData = this.mapBooqableOrder(booqableOrder, customer.id);

    await prisma.order.upsert({
      where: { booqableId: booqableOrder.id },
      update: {
        ...orderData,
        booqableUpdatedAt: new Date(booqableOrder.updated_at),
        syncStatus: 'SYNCED'
      },
      create: {
        ...orderData,
        companyId: this.companyId,
        booqableId: booqableOrder.id,
        booqableUpdatedAt: new Date(booqableOrder.updated_at),
        syncStatus: 'SYNCED'
      }
    });
  }

  // ==================== MAPPING FUNCTIONS ====================

  /**
   * Map Booqable product to Canary equipment
   */
  private mapBooqableProduct(product: any): any {
    return {
      name: product.name,
      description: product.description || null,
      brand: product.properties?.brand || null,
      model: product.properties?.model || null,
      category: product.category?.name || 'Uncategorized',
      serialNumber: product.sku || null,
      dailyPrice: product.price_structure?.day || 0,
      weeklyPrice: product.price_structure?.week || 0,
      monthlyPrice: product.price_structure?.month || 0,
      status: product.stock_count > 0 ? 'AVAILABLE' : 'RENTED',
      imageUrl: product.photo_url || null,
    };
  }

  /**
   * Map Booqable customer to Canary customer
   */
  private mapBooqableCustomer(customer: any): any {
    return {
      name: customer.name,
      email: customer.email || null,
      phone: customer.phone || null,
      address: customer.address || null,
      company: customer.properties?.company || null,
      taxNumber: customer.tax_id || null,
    };
  }

  /**
   * Map Booqable order to Canary order
   */
  private mapBooqableOrder(order: any, customerId: number): any {
    return {
      orderNumber: order.number || `BQ-${order.id}`,
      customerId: customerId,
      startDate: new Date(order.starts_at),
      endDate: new Date(order.stops_at),
      totalAmount: parseFloat(order.total_amount) || 0,
      status: BooqableService.mapOrderStatus(order.status),
      notes: order.note || null,
    };
  }

  // ==================== UTILITY ====================

  /**
   * Create sync record in database
   */
  private async createSyncRecord(syncType: string, direction: string): Promise<any> {
    if (!this.connectionId) {
      throw new Error('Connection ID is required for creating sync records');
    }
    
    return await prisma.booqableSync.create({
      data: {
        connectionId: this.connectionId,
        companyId: this.companyId,
        syncType,
        direction,
        status: 'IN_PROGRESS',
        triggeredBy: 'USER'
      }
    });
  }

  /**
   * Resolve conflicts (last-write-wins strategy)
   */
  private resolveConflict(localData: any, remoteData: any): any {
    const localUpdated = new Date(localData.updatedAt).getTime();
    const remoteUpdated = new Date(remoteData.updated_at).getTime();
    
    // Return the most recently updated data
    return remoteUpdated > localUpdated ? remoteData : localData;
  }
}
