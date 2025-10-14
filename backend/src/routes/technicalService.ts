import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// WORK ORDERS
// ============================================

// Get all work orders
router.get('/work-orders', async (req: Request, res: Response) => {
  try {
    const { status, priority, assignedTo, search } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = parseInt(assignedTo as string);
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search as string } },
        { equipmentName: { contains: search as string } },
        { serialNumber: { contains: search as string } },
        { customerName: { contains: search as string } },
      ];
    }

    const workOrders = await prisma.workOrder.findMany({
      where,
      include: {
        equipment: true,
        customer: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        technician: true,
        parts: {
          include: {
            part: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(workOrders);
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// Get single work order
router.get('/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        equipment: true,
        customer: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        technician: true,
        parts: {
          include: {
            part: true,
          },
        },
      },
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    res.json(workOrder);
  } catch (error) {
    console.error('Get work order error:', error);
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
});

// Create work order
router.post('/work-orders', async (req: Request, res: Response) => {
  try {
    const {
      equipmentId,
      equipmentName,
      serialNumber,
      brand,
      model,
      customerId,
      customerName,
      customerContact,
      issue,
      description,
      priority,
      assignedToId,
      technicianId,
      estimatedCompletion,
      laborCost,
      partsCost,
    } = req.body;

    // Generate ticket number
    const count = await prisma.workOrder.count();
    const ticketNumber = `WO-${(count + 1).toString().padStart(6, '0')}`;

    const workOrder = await prisma.workOrder.create({
      data: {
        ticketNumber,
        title: `${equipmentName} - ${issue}`,
        equipmentId: equipmentId || undefined,
        equipmentName,
        serialNumber,
        brand,
        model,
        customerId: customerId || undefined,
        customerName,
        customerContact,
        issue,
        description,
        priority: priority || 'MEDIUM',
        status: 'NEW',
        assignedToId: assignedToId || undefined,
        technicianId: technicianId || undefined,
        estimatedCompletion: new Date(estimatedCompletion),
        laborCost: laborCost || 0,
        partsCost: partsCost || 0,
        totalCost: (laborCost || 0) + (partsCost || 0),
      },
      include: {
        equipment: true,
        customer: true,
        assignedTo: true,
        technician: true,
      },
    });

    res.status(201).json(workOrder);
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({ error: 'Failed to create work order' });
  }
});

// Update work order
router.put('/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      priority,
      assignedToId,
      technicianId,
      diagnosis,
      workPerformed,
      testResults,
      laborCost,
      partsCost,
      completedDate,
      returnedDate,
      internalNotes,
      customerNotes,
    } = req.body;

    const updateData: any = {};

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (technicianId !== undefined) updateData.technicianId = technicianId;
    if (diagnosis) updateData.diagnosis = diagnosis;
    if (workPerformed) updateData.workPerformed = workPerformed;
    if (testResults) updateData.testResults = testResults;
    if (laborCost !== undefined) updateData.laborCost = laborCost;
    if (partsCost !== undefined) updateData.partsCost = partsCost;
    if (internalNotes) updateData.internalNotes = internalNotes;
    if (customerNotes) updateData.customerNotes = customerNotes;

    // Calculate total cost
    if (laborCost !== undefined || partsCost !== undefined) {
      const current = await prisma.workOrder.findUnique({
        where: { id: parseInt(id) },
        select: { laborCost: true, partsCost: true },
      });
      updateData.totalCost = (laborCost || current?.laborCost || 0) + (partsCost || current?.partsCost || 0);
    }

    // Set dates based on status
    if (status === 'COMPLETED' && !completedDate) {
      updateData.completedDate = new Date();
    }
    if (status === 'RETURNED' && !returnedDate) {
      updateData.returnedDate = new Date();
    }
    if (status === 'REPAIRING' && !updateData.startDate) {
      const current = await prisma.workOrder.findUnique({
        where: { id: parseInt(id) },
        select: { startDate: true },
      });
      if (!current?.startDate) {
        updateData.startDate = new Date();
      }
    }

    const workOrder = await prisma.workOrder.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        equipment: true,
        customer: true,
        assignedTo: true,
        technician: true,
        parts: {
          include: {
            part: true,
          },
        },
      },
    });

    res.json(workOrder);
  } catch (error) {
    console.error('Update work order error:', error);
    res.status(500).json({ error: 'Failed to update work order' });
  }
});

// Delete work order
router.delete('/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.workOrder.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Work order deleted successfully' });
  } catch (error) {
    console.error('Delete work order error:', error);
    res.status(500).json({ error: 'Failed to delete work order' });
  }
});

// Add part to work order
router.post('/work-orders/:id/parts', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { partId, quantity, unitCost } = req.body;

    const totalCost = quantity * unitCost;

    const workOrderPart = await prisma.workOrderPart.create({
      data: {
        workOrderId: parseInt(id),
        partId,
        quantity,
        unitCost,
        totalCost,
      },
      include: {
        part: true,
      },
    });

    // Update work order parts cost
    const parts = await prisma.workOrderPart.findMany({
      where: { workOrderId: parseInt(id) },
    });
    const partsCost = parts.reduce((sum, p) => sum + p.totalCost, 0);

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(id) },
      select: { laborCost: true },
    });

    await prisma.workOrder.update({
      where: { id: parseInt(id) },
      data: {
        partsCost,
        totalCost: (workOrder?.laborCost || 0) + partsCost,
      },
    });

    // Decrease part stock
    await prisma.servicePart.update({
      where: { id: partId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    res.status(201).json(workOrderPart);
  } catch (error) {
    console.error('Add part to work order error:', error);
    res.status(500).json({ error: 'Failed to add part to work order' });
  }
});

// Remove part from work order
router.delete('/work-orders/:id/parts/:partId', async (req: Request, res: Response) => {
  try {
    const { id, partId } = req.params;

    const workOrderPart = await prisma.workOrderPart.findFirst({
      where: {
        workOrderId: parseInt(id),
        id: parseInt(partId),
      },
    });

    if (!workOrderPart) {
      return res.status(404).json({ error: 'Part not found in work order' });
    }

    // Return stock
    await prisma.servicePart.update({
      where: { id: workOrderPart.partId },
      data: {
        stock: {
          increment: workOrderPart.quantity,
        },
      },
    });

    await prisma.workOrderPart.delete({
      where: { id: parseInt(partId) },
    });

    // Update work order costs
    const parts = await prisma.workOrderPart.findMany({
      where: { workOrderId: parseInt(id) },
    });
    const partsCost = parts.reduce((sum, p) => sum + p.totalCost, 0);

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(id) },
      select: { laborCost: true },
    });

    await prisma.workOrder.update({
      where: { id: parseInt(id) },
      data: {
        partsCost,
        totalCost: (workOrder?.laborCost || 0) + partsCost,
      },
    });

    res.json({ message: 'Part removed from work order' });
  } catch (error) {
    console.error('Remove part from work order error:', error);
    res.status(500).json({ error: 'Failed to remove part from work order' });
  }
});

// ============================================
// SERVICE ASSETS
// ============================================

// Get all service assets
router.get('/assets', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { serialNumber: { contains: search as string } },
        { assetCode: { contains: search as string } },
      ];
    }

    const assets = await prisma.serviceAsset.findMany({
      where,
      include: {
        equipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get single asset
router.get('/assets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const asset = await prisma.serviceAsset.findUnique({
      where: { id: parseInt(id) },
      include: {
        equipment: true,
      },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// Create asset
router.post('/assets', async (req: Request, res: Response) => {
  try {
    const {
      name,
      brand,
      model,
      serialNumber,
      assetCode,
      equipmentId,
      status,
      condition,
      purchaseDate,
      purchasePrice,
      supplier,
      warrantyExpiry,
      lastMaintenance,
      nextMaintenance,
      location,
      notes,
    } = req.body;

    const asset = await prisma.serviceAsset.create({
      data: {
        name,
        brand,
        model,
        serialNumber,
        assetCode,
        equipmentId: equipmentId || undefined,
        status: status || 'AVAILABLE',
        condition,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        purchasePrice,
        supplier,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : undefined,
        lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : undefined,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : undefined,
        location,
        notes,
        currentValue: purchasePrice,
      },
      include: {
        equipment: true,
      },
    });

    res.status(201).json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Update asset
router.put('/assets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects
    if (updateData.purchaseDate) updateData.purchaseDate = new Date(updateData.purchaseDate);
    if (updateData.warrantyExpiry) updateData.warrantyExpiry = new Date(updateData.warrantyExpiry);
    if (updateData.lastMaintenance) updateData.lastMaintenance = new Date(updateData.lastMaintenance);
    if (updateData.nextMaintenance) updateData.nextMaintenance = new Date(updateData.nextMaintenance);

    const asset = await prisma.serviceAsset.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        equipment: true,
      },
    });

    res.json(asset);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// Delete asset
router.delete('/assets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.serviceAsset.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// ============================================
// SERVICE PARTS
// ============================================

// Get all parts
router.get('/parts', async (req: Request, res: Response) => {
  try {
    const { lowStock, search } = req.query;

    const where: any = {};

    if (lowStock === 'true') {
      where.stock = { lte: prisma.servicePart.fields.minStock };
    }

    if (search) {
      where.OR = [
        { code: { contains: search as string } },
        { name: { contains: search as string } },
      ];
    }

    const parts = await prisma.servicePart.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(parts);
  } catch (error) {
    console.error('Get parts error:', error);
    res.status(500).json({ error: 'Failed to fetch parts' });
  }
});

// Get single part
router.get('/parts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const part = await prisma.servicePart.findUnique({
      where: { id: parseInt(id) },
      include: {
        workOrders: {
          include: {
            workOrder: true,
          },
        },
      },
    });

    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }

    res.json(part);
  } catch (error) {
    console.error('Get part error:', error);
    res.status(500).json({ error: 'Failed to fetch part' });
  }
});

// Create part
router.post('/parts', async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      description,
      category,
      stock,
      minStock,
      maxStock,
      reorderPoint,
      unitCost,
      sellingPrice,
      supplier,
      supplierPartNumber,
      location,
      notes,
    } = req.body;

    const part = await prisma.servicePart.create({
      data: {
        code,
        name,
        description,
        category,
        stock: stock || 0,
        minStock: minStock || 0,
        maxStock,
        reorderPoint,
        unitCost,
        sellingPrice,
        supplier,
        supplierPartNumber,
        location,
        notes,
      },
    });

    res.status(201).json(part);
  } catch (error) {
    console.error('Create part error:', error);
    res.status(500).json({ error: 'Failed to create part' });
  }
});

// Update part
router.put('/parts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const part = await prisma.servicePart.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(part);
  } catch (error) {
    console.error('Update part error:', error);
    res.status(500).json({ error: 'Failed to update part' });
  }
});

// Delete part
router.delete('/parts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.servicePart.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    console.error('Delete part error:', error);
    res.status(500).json({ error: 'Failed to delete part' });
  }
});

// Update part stock
router.patch('/parts/:id/stock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

    const part = await prisma.servicePart.update({
      where: { id: parseInt(id) },
      data: {
        stock: {
          [operation === 'add' ? 'increment' : 'decrement']: quantity,
        },
      },
    });

    res.json(part);
  } catch (error) {
    console.error('Update part stock error:', error);
    res.status(500).json({ error: 'Failed to update part stock' });
  }
});

// ============================================
// TECHNICIANS
// ============================================

// Get all technicians
router.get('/technicians', async (req: Request, res: Response) => {
  try {
    const { status, available } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (available !== undefined) where.isAvailable = available === 'true';

    const technicians = await prisma.technician.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        workOrders: {
          where: {
            status: { notIn: ['COMPLETED', 'RETURNED', 'SCRAPPED'] },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(technicians);
  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({ error: 'Failed to fetch technicians' });
  }
});

// Get single technician
router.get('/technicians/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const technician = await prisma.technician.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        workOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json(technician);
  } catch (error) {
    console.error('Get technician error:', error);
    res.status(500).json({ error: 'Failed to fetch technician' });
  }
});

// Create technician
router.post('/technicians', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      employeeId,
      userId,
      skills,
      certifications,
      specialization,
      hireDate,
      department,
    } = req.body;

    const technician = await prisma.technician.create({
      data: {
        name,
        email,
        phone,
        employeeId,
        userId: userId || undefined,
        skills,
        certifications,
        specialization,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        department,
      },
    });

    res.status(201).json(technician);
  } catch (error) {
    console.error('Create technician error:', error);
    res.status(500).json({ error: 'Failed to create technician' });
  }
});

// Update technician
router.put('/technicians/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.hireDate) updateData.hireDate = new Date(updateData.hireDate);

    const technician = await prisma.technician.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(technician);
  } catch (error) {
    console.error('Update technician error:', error);
    res.status(500).json({ error: 'Failed to update technician' });
  }
});

// Delete technician
router.delete('/technicians/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.technician.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Technician deleted successfully' });
  } catch (error) {
    console.error('Delete technician error:', error);
    res.status(500).json({ error: 'Failed to delete technician' });
  }
});

// ============================================
// STATISTICS & REPORTS
// ============================================

// Get dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const openWorkOrders = await prisma.workOrder.count({
      where: { status: { notIn: ['COMPLETED', 'RETURNED', 'SCRAPPED'] } },
    });

    const completedWorkOrders = await prisma.workOrder.findMany({
      where: { status: 'COMPLETED', completedDate: { not: null } },
      select: { receivedDate: true, completedDate: true },
    });

    let avgRepairTime = 0;
    if (completedWorkOrders.length > 0) {
      const totalDays = completedWorkOrders.reduce((sum, wo) => {
        const days = Math.ceil(
          (wo.completedDate!.getTime() - wo.receivedDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgRepairTime = Math.round(totalDays / completedWorkOrders.length);
    }

    const lowStockItems = await prisma.servicePart.count({
      where: {
        stock: { lte: prisma.servicePart.fields.minStock },
      },
    });

    const activeTechnicians = await prisma.technician.count({
      where: { status: 'ACTIVE', isAvailable: true },
    });

    const slaCritical = await prisma.workOrder.count({
      where: {
        status: { notIn: ['COMPLETED', 'RETURNED', 'SCRAPPED'] },
        estimatedCompletion: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000) }, // Within 24 hours
      },
    });

    res.json({
      openWorkOrders,
      avgRepairTime,
      lowStockItems,
      activeTechnicians,
      slaCritical,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
