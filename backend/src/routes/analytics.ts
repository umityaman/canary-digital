import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: number;
  companyId?: number;
}

// GET /api/analytics/revenue - Revenue data for date range
router.get('/revenue', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(403).json({ error: 'Company context missing' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Parse and normalize date range (midnight UTC)
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        companyId,
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          in: ['APPROVED', 'ACTIVE', 'COMPLETED'],
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Group by date
    const revenueByDate = new Map<string, { revenue: number; orders: number }>();

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const existing = revenueByDate.get(dateKey) || { revenue: 0, orders: 0 };
      revenueByDate.set(dateKey, {
        revenue: existing.revenue + Number(order.totalAmount),
        orders: existing.orders + 1,
      });
    });

    // Convert to array format
    const data = Array.from(revenueByDate.entries()).map(([date, stats]) => ({
      date,
      revenue: stats.revenue,
      orders: stats.orders,
    }));

    // Sort by date
    data.sort((a, b) => a.date.localeCompare(b.date));

    res.json(data);
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

// GET /api/analytics/utilization - Equipment utilization data
router.get('/utilization', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.companyId;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const totalEquipment = await prisma.equipment.count({
      where: { companyId },
    });

    // Get orders in date range
    const orders = await prisma.order.findMany({
      where: {
        companyId,
        status: {
          in: ['APPROVED', 'ACTIVE'],
        },
        OR: [
          {
            startDate: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          },
          {
            endDate: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          },
        ],
      },
      include: {
        orderItems: true,
      },
    });

    // Calculate utilization by date
    // Parse and normalize date range
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    const data = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];

      // Count active rentals on this date
      const checkDate = new Date(dateKey + 'T00:00:00Z');
      const activeRentals = orders.filter((order) => {
        // Guard: ensure startDate/endDate exist on the order
        if (!order.startDate || !order.endDate) return false;
        const orderStart = new Date(order.startDate);
        const orderEnd = new Date(order.endDate);
        return orderStart <= checkDate && checkDate <= orderEnd;
      }).length;

      const utilizationRate = totalEquipment > 0 ? (activeRentals / totalEquipment) * 100 : 0;

      data.push({
        date: dateKey,
        utilizationRate: Math.round(utilizationRate * 10) / 10,
        activeRentals,
        totalEquipment,
      });

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    res.json(data);
  } catch (error) {
    console.error('Utilization analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch utilization data' });
  }
});

// GET /api/analytics/status - Order status distribution
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: { companyId },
      _count: true,
    });

    const statusColors: Record<string, string> = {
      PENDING: '#f59e0b',
      APPROVED: '#10b981',
      ACTIVE: '#3b82f6',
      COMPLETED: '#6366f1',
      CANCELLED: '#ef4444',
    };

    const data = statusCounts.map((item) => ({
      status: item.status,
      count: item._count,
      color: statusColors[item.status] || '#6b7280',
    }));

    res.json(data);
  } catch (error) {
    console.error('Status analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch status data' });
  }
});

// GET /api/analytics/top-equipment - Top rented equipment
router.get('/top-equipment', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!companyId) {
      return res.status(403).json({ error: 'Company context missing' });
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          companyId,
          status: {
            in: ['APPROVED', 'ACTIVE', 'COMPLETED'],
          },
        },
      },
      include: {
        equipment: {
          select: {
            name: true,
          },
        },
      },
    });

    // Group by equipmentId (prefer stable id over name)
    const equipmentStats = new Map<
      number | string,
      { equipmentId?: number; name: string; rentCount: number; revenue: number }
    >();

    orderItems.forEach((item) => {
      const eqId = item.equipmentId ?? 'unknown';
      const name = item.equipment?.name || 'Unknown';
      const existing = equipmentStats.get(eqId) || { equipmentId: typeof eqId === 'number' ? eqId : undefined, name, rentCount: 0, revenue: 0 };
      equipmentStats.set(eqId, {
        equipmentId: typeof eqId === 'number' ? eqId : existing.equipmentId,
        name,
        rentCount: existing.rentCount + (item.quantity || 0),
        revenue: existing.revenue + Number(item.totalAmount || 0),
      });
    });

    // Convert to array and sort by rentCount
    const data = Array.from(equipmentStats.values())
      .sort((a, b) => b.rentCount - a.rentCount)
      .slice(0, limit);

    res.json(data);
  } catch (error) {
    console.error('Top equipment analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch top equipment data' });
  }
});

export default router;
