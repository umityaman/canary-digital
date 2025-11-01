import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RecordMovementParams {
  equipmentId: number;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer';
  movementReason: string;
  quantity: number;
  invoiceId?: number;
  deliveryNoteId?: number;
  orderId?: number;
  fromLocation?: string;
  toLocation?: string;
  reference?: string;
  notes?: string;
  performedBy?: number;
  companyId: number;
}

interface RecordSaleParams {
  equipmentId: number;
  quantity: number;
  invoiceId?: number;
  deliveryNoteId?: number;
  orderId?: number;
  performedBy?: number;
  companyId: number;
  notes?: string;
}

interface RecordReturnParams {
  equipmentId: number;
  quantity: number;
  invoiceId?: number;
  orderId?: number;
  performedBy?: number;
  companyId: number;
  notes?: string;
  reason?: string;
}

interface RecordTransferParams {
  equipmentId: number;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  requestedBy: number;
  companyId: number;
  notes?: string;
  expectedDate?: Date;
  carrier?: string;
  trackingNumber?: string;
}

interface StockAdjustmentParams {
  equipmentId: number;
  newQuantity: number;
  reason: string;
  performedBy: number;
  companyId: number;
  notes?: string;
}

export class StockMovementService {
  /**
   * Record a stock movement (generic)
   */
  async recordMovement(params: RecordMovementParams) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.equipmentId }
    });

    if (!equipment) {
      throw new Error('Equipment not found');
    }

    const stockBefore = equipment.quantity;
    let stockAfter: number;

    // Calculate new stock based on movement type
    if (params.movementType === 'in' || params.movementType === 'transfer' && params.toLocation) {
      stockAfter = stockBefore + params.quantity;
    } else if (params.movementType === 'out') {
      stockAfter = stockBefore - params.quantity;
      if (stockAfter < 0) {
        throw new Error('Insufficient stock');
      }
    } else if (params.movementType === 'adjustment') {
      stockAfter = params.quantity; // Direct adjustment
    } else {
      stockAfter = stockBefore; // No change for transfer out
    }

    // Create movement record
    const movement = await prisma.stockMovement.create({
      data: {
        equipmentId: params.equipmentId,
        movementType: params.movementType,
        movementReason: params.movementReason,
        quantity: params.quantity,
        invoiceId: params.invoiceId,
        deliveryNoteId: params.deliveryNoteId,
        orderId: params.orderId,
        fromLocation: params.fromLocation,
        toLocation: params.toLocation,
        stockBefore,
        stockAfter,
        reference: params.reference,
        notes: params.notes,
        performedBy: params.performedBy,
        companyId: params.companyId
      },
      include: {
        equipment: true,
        user: true,
        invoice: true,
        deliveryNote: true,
        order: true
      }
    });

    // Update equipment quantity
    await prisma.equipment.update({
      where: { id: params.equipmentId },
      data: { quantity: stockAfter }
    });

    // Check stock levels and generate alerts if needed
    await this.checkStockLevels(params.equipmentId, params.companyId);

    return movement;
  }

  /**
   * Record a sale (stock out)
   */
  async recordSale(params: RecordSaleParams) {
    return this.recordMovement({
      equipmentId: params.equipmentId,
      movementType: 'out',
      movementReason: 'sale',
      quantity: params.quantity,
      invoiceId: params.invoiceId,
      deliveryNoteId: params.deliveryNoteId,
      orderId: params.orderId,
      performedBy: params.performedBy,
      companyId: params.companyId,
      notes: params.notes
    });
  }

  /**
   * Record a return (stock in)
   */
  async recordReturn(params: RecordReturnParams) {
    return this.recordMovement({
      equipmentId: params.equipmentId,
      movementType: 'in',
      movementReason: params.reason || 'return',
      quantity: params.quantity,
      invoiceId: params.invoiceId,
      orderId: params.orderId,
      performedBy: params.performedBy,
      companyId: params.companyId,
      notes: params.notes
    });
  }

  /**
   * Record a stock transfer between locations
   */
  async recordTransfer(params: RecordTransferParams) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.equipmentId }
    });

    if (!equipment) {
      throw new Error('Equipment not found');
    }

    if (equipment.quantity < params.quantity) {
      throw new Error('Insufficient stock for transfer');
    }

    // Create transfer record
    const transferNumber = `TRF-${Date.now()}`;
    
    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNumber,
        equipmentId: params.equipmentId,
        quantity: params.quantity,
        fromLocation: params.fromLocation,
        toLocation: params.toLocation,
        status: 'pending',
        requestedBy: params.requestedBy,
        expectedDate: params.expectedDate,
        carrier: params.carrier,
        trackingNumber: params.trackingNumber,
        notes: params.notes,
        companyId: params.companyId
      },
      include: {
        equipment: true,
        requester: true
      }
    });

    // Record stock movement (out from source location)
    await this.recordMovement({
      equipmentId: params.equipmentId,
      movementType: 'transfer',
      movementReason: 'transfer',
      quantity: -params.quantity, // Negative for outgoing
      fromLocation: params.fromLocation,
      toLocation: params.toLocation,
      reference: transferNumber,
      performedBy: params.requestedBy,
      companyId: params.companyId,
      notes: `Transfer to ${params.toLocation}`
    });

    return transfer;
  }

  /**
   * Adjust stock quantity directly (for corrections)
   */
  async adjustStock(params: StockAdjustmentParams) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.equipmentId }
    });

    if (!equipment) {
      throw new Error('Equipment not found');
    }

    const difference = params.newQuantity - equipment.quantity;

    return this.recordMovement({
      equipmentId: params.equipmentId,
      movementType: 'adjustment',
      movementReason: params.reason,
      quantity: difference,
      performedBy: params.performedBy,
      companyId: params.companyId,
      notes: params.notes
    });
  }

  /**
   * Get movement history for an equipment
   */
  async getMovementHistory(equipmentId: number, options?: {
    limit?: number;
    offset?: number;
    movementType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { equipmentId };

    if (options?.movementType) {
      where.movementType = options.movementType;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          equipment: true,
          user: { select: { id: true, name: true, email: true } },
          invoice: { select: { id: true, invoiceNumber: true } },
          deliveryNote: { select: { id: true, deliveryNumber: true } },
          order: { select: { id: true, orderNumber: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0
      }),
      prisma.stockMovement.count({ where })
    ]);

    return {
      movements,
      total,
      limit: options?.limit || 50,
      offset: options?.offset || 0
    };
  }

  /**
   * Check stock levels and generate alerts
   */
  async checkStockLevels(equipmentId: number, companyId: number) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      return;
    }

    const currentStock = equipment.quantity;
    const minStock = 5; // TODO: Make this configurable per equipment
    const criticalStock = 2;

    // Check for existing active alerts
    const existingAlert = await prisma.stockAlert.findFirst({
      where: {
        equipmentId,
        status: 'active'
      }
    });

    // Determine if we need to create/update an alert
    let alertType: string | null = null;
    let severity: string | null = null;
    let message: string | null = null;

    if (currentStock === 0) {
      alertType = 'out_of_stock';
      severity = 'critical';
      message = `${equipment.name} is out of stock`;
    } else if (currentStock <= criticalStock) {
      alertType = 'low_stock';
      severity = 'critical';
      message = `${equipment.name} stock is critically low (${currentStock} units)`;
    } else if (currentStock <= minStock) {
      alertType = 'low_stock';
      severity = 'high';
      message = `${equipment.name} stock is low (${currentStock} units)`;
    }

    // Create or resolve alert
    if (alertType && !existingAlert) {
      await prisma.stockAlert.create({
        data: {
          equipmentId,
          alertType,
          severity,
          message,
          currentStock,
          thresholdValue: alertType === 'out_of_stock' ? 0 : minStock,
          status: 'active',
          companyId
        }
      });
    } else if (!alertType && existingAlert) {
      // Resolve existing alert if stock is back to normal
      await prisma.stockAlert.update({
        where: { id: existingAlert.id },
        data: {
          status: 'resolved',
          resolvedAt: new Date()
        }
      });
    }
  }

  /**
   * Generate alerts for all equipment
   */
  async generateAlerts(companyId: number) {
    const equipment = await prisma.equipment.findMany({
      where: { companyId }
    });

    for (const item of equipment) {
      await this.checkStockLevels(item.id, companyId);
    }

    // Get all active alerts
    const alerts = await prisma.stockAlert.findMany({
      where: {
        companyId,
        status: 'active'
      },
      include: {
        equipment: true
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return alerts;
  }

  /**
   * Get active stock alerts
   */
  async getActiveAlerts(companyId: number, options?: {
    severity?: string;
    alertType?: string;
    limit?: number;
  }) {
    const where: any = {
      companyId,
      status: 'active'
    };

    if (options?.severity) {
      where.severity = options.severity;
    }

    if (options?.alertType) {
      where.alertType = options.alertType;
    }

    const alerts = await prisma.stockAlert.findMany({
      where,
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
            quantity: true
          }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ],
      take: options?.limit || 50
    });

    return alerts;
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: number, userId: number) {
    const alert = await prisma.stockAlert.update({
      where: { id: alertId },
      data: {
        status: 'acknowledged',
        acknowledgedBy: userId,
        acknowledgedAt: new Date()
      },
      include: {
        equipment: true
      }
    });

    return alert;
  }

  /**
   * Get stock summary for all equipment
   */
  async getStockSummary(companyId: number, options?: {
    category?: string;
    lowStockOnly?: boolean;
  }) {
    const where: any = { companyId };

    if (options?.category) {
      where.category = options.category;
    }

    if (options?.lowStockOnly) {
      where.quantity = { lte: 5 }; // TODO: Make threshold configurable
    }

    const equipment = await prisma.equipment.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        category: true,
        quantity: true,
        status: true
      },
      orderBy: { quantity: 'asc' }
    });

    const summary = {
      totalItems: equipment.length,
      totalQuantity: equipment.reduce((sum, item) => sum + item.quantity, 0),
      lowStockItems: equipment.filter(item => item.quantity <= 5).length,
      outOfStockItems: equipment.filter(item => item.quantity === 0).length,
      categories: [...new Set(equipment.map(item => item.category).filter(Boolean))]
    };

    return {
      summary,
      equipment
    };
  }

  /**
   * Complete a stock transfer
   */
  async completeTransfer(transferId: number, receivedBy: number) {
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: transferId },
      include: { equipment: true }
    });

    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.status !== 'pending' && transfer.status !== 'in_transit') {
      throw new Error('Transfer cannot be completed');
    }

    // Update transfer status
    const updatedTransfer = await prisma.stockTransfer.update({
      where: { id: transferId },
      data: {
        status: 'completed',
        receivedBy,
        receivedDate: new Date()
      },
      include: {
        equipment: true,
        requester: true,
        receiver: true
      }
    });

    // Record stock movement (in to destination location)
    await this.recordMovement({
      equipmentId: transfer.equipmentId,
      movementType: 'transfer',
      movementReason: 'transfer',
      quantity: transfer.quantity,
      fromLocation: transfer.fromLocation,
      toLocation: transfer.toLocation,
      reference: transfer.transferNumber,
      performedBy: receivedBy,
      companyId: transfer.companyId,
      notes: `Transfer completed from ${transfer.fromLocation}`
    });

    return updatedTransfer;
  }
}

export default new StockMovementService();
