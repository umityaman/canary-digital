import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  companyId?: number;
}

// GET /api/dashboard/test - Test endpoint (no auth)
router.get('/test', async (req, res) => {
  res.json({
    message: 'Dashboard API is working',
    timestamp: new Date().toISOString()
  });
});

// GET /api/dashboard/mock - Mock dashboard data (no auth for testing)
router.get('/mock', async (req, res) => {
  res.json({
    orders: {
      total: 156,
      active: 23,
      completed: 133,
      avgValue: 2500
    },
    revenue: {
      total: 580000,
      monthly: 45000
    },
    customers: {
      total: 89
    },
    equipment: {
      total: 45,
      available: 23,
      rented: 18,
      maintenance: 4,
      utilization: 76
    },
    calendar: {
      upcomingEvents: 12
    },
    alerts: {
      lowStock: 3,
      pendingInspections: 7
    },
    recent: {
      orders: [
        {
          id: 1,
          orderNumber: "ORD-2024-001",
          customer: "ABC İnşaat Ltd.",
          amount: 15000,
          status: "ACTIVE",
          date: new Date().toISOString()
        },
        {
          id: 2,
          orderNumber: "ORD-2024-002", 
          customer: "XYZ Yapı A.Ş.",
          amount: 8500,
          status: "PENDING",
          date: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      customers: [
        {
          id: 1,
          name: "Mehmet Demir",
          email: "mehmet@abc.com",
          phone: "+90 555 123 45 67",
          date: new Date().toISOString()
        }
      ]
    }
  });
});

// GET /api/dashboard/stats - Dashboard KPI'ları
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    // Paralel olarak tüm istatistikleri çek
    const [
      totalOrders,
      activeOrders,
      completedOrders,
      totalRevenue,
      monthlyRevenue,
      totalCustomers,
      totalEquipment,
      availableEquipment,
      rentedEquipment,
      maintenanceEquipment,
      upcomingEvents,
      lowStockItems,
      pendingInspections,
      pendingPayments,
      recentOrders,
      recentCustomers,
    ] = await Promise.all([
      // Sipariş istatistikleri
      prisma.order.count({ where: { companyId } }),
      prisma.order.count({ 
        where: { 
          companyId,
          status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] }
        }
      }),
      prisma.order.count({ 
        where: { 
          companyId,
          status: 'COMPLETED'
        }
      }),
      
      // Gelir istatistikleri
      prisma.order.aggregate({
        where: { companyId },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: {
          companyId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { totalAmount: true }
      }),
      
      // Müşteri istatistikleri
      prisma.customer.count(),
      
      // Ekipman istatistikleri
      prisma.equipment.count({ where: { companyId } }),
      prisma.equipment.count({ 
        where: { companyId, status: 'AVAILABLE' }
      }),
      prisma.equipment.count({ 
        where: { companyId, status: 'RENTED' }
      }),
      prisma.equipment.count({ 
        where: { companyId, status: 'MAINTENANCE' }
      }),
      
      // Yaklaşan etkinlikler
      prisma.calendarEvent.count({
        where: {
          companyId,
          startDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün
          }
        }
      }),
      
      // Düşük stok (şimdilik 0, ileride eklenecek)
      Promise.resolve(0),
      
      // Bekleyen kontroller
      prisma.inspection.count({
        where: {
          status: 'PENDING',
          order: {
            companyId: companyId
          }
        }
      }),
      
      // Bekleyen ödemeler (ACTIVE status olanların toplamı)
      prisma.order.aggregate({
        where: {
          companyId,
          status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] }
        },
        _sum: { totalAmount: true }
      }),
      
      // Son siparişler
      prisma.order.findMany({
        where: { companyId },
        include: {
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Son müşteriler
      prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
    ]);

    // Performans metrikleri
    const avgOrderValue = totalOrders > 0 
      ? (totalRevenue._sum.totalAmount || 0) / totalOrders 
      : 0;
    
    const equipmentUtilization = totalEquipment > 0
      ? (rentedEquipment / totalEquipment) * 100
      : 0;

    res.json({
      // Sipariş Metrikleri
      orders: {
        total: totalOrders,
        active: activeOrders,
        completed: completedOrders,
        avgValue: Math.round(avgOrderValue),
      },
      
      // Gelir Metrikleri
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
        monthly: monthlyRevenue._sum.totalAmount || 0,
      },
      
      // Müşteri Metrikleri
      customers: {
        total: totalCustomers,
      },
      
      // Ekipman Metrikleri
      equipment: {
        total: totalEquipment,
        available: availableEquipment,
        rented: rentedEquipment,
        maintenance: maintenanceEquipment,
        utilization: Math.round(equipmentUtilization),
      },
      
      // Takvim & Uyarılar
      calendar: {
        upcomingEvents: upcomingEvents,
      },
      
      // Uyarılar
      alerts: {
        lowStock: lowStockItems,
        pendingInspections: pendingInspections,
      },
      
      // Ödemeler
      payments: {
        pending: pendingPayments._sum.totalAmount || 0,
      },
      
      // Son Aktiviteler
      recent: {
        orders: recentOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customer: order.customer.name,
          amount: order.totalAmount,
          status: order.status,
          date: order.createdAt,
        })),
        customers: recentCustomers.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          date: customer.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET /api/dashboard/upcoming-events - Yaklaşan etkinlikler
router.get('/upcoming-events', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const events = await prisma.calendarEvent.findMany({
      where: {
        companyId: companyId,
        startDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 gün
        }
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
          }
        }
      },
      orderBy: { startDate: 'asc' },
      take: 10
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// GET /api/dashboard/recent-activity - Son aktiviteler
router.get('/recent-activity', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    // Son 20 aktiviteyi çek (siparişler, kontroller, etkinlikler)
    const [orders, inspections, events] = await Promise.all([
      prisma.order.findMany({
        where: { companyId: companyId },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.inspection.findMany({
        where: {
          order: {
            companyId: companyId
          }
        },
        include: {
          equipment: true,
          customer: true,
          inspector: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.calendarEvent.findMany({
        where: { companyId: companyId },
        include: {
          customer: true,
          equipment: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
    ]);

    // Aktiviteleri birleştir ve sırala
    const activities: any[] = [];

    orders.forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        title: `Yeni sipariş: ${order.orderNumber}`,
        description: `${order.customer.name} - ₺${order.totalAmount}`,
        status: order.status,
        date: order.createdAt,
        icon: 'ShoppingCart',
      });
    });

    inspections.forEach(inspection => {
      activities.push({
        id: `inspection-${inspection.id}`,
        type: 'inspection',
        title: `Kontrol: ${inspection.equipment.name}`,
        description: `${inspection.inspectionType} - ${inspection.customer.name}`,
        status: inspection.status,
        date: inspection.createdAt,
        icon: 'CheckSquare',
      });
    });

    events.forEach(event => {
      activities.push({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        description: event.customer ? event.customer.name : 'Takvim etkinliği',
        status: 'SCHEDULED',
        date: event.createdAt,
        icon: 'Calendar',
      });
    });

    // Tarihe göre sırala
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(activities.slice(0, 20));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// GET /api/dashboard/performance - Performans metrikleri
router.get('/performance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    // Son 12 ayın gelir trendi
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const revenue = await prisma.order.aggregate({
        where: {
          companyId: companyId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          }
        },
        _sum: { totalAmount: true }
      });

      monthlyRevenue.push({
        month: date.toLocaleString('tr-TR', { month: 'short', year: 'numeric' }),
        revenue: revenue._sum.totalAmount || 0,
      });
    }

    // Ekipman performansı (en çok kiralanan)
    const topEquipment = await prisma.orderItem.groupBy({
      by: ['equipmentId'],
      _count: { equipmentId: true },
      _sum: { totalAmount: true },
      orderBy: {
        _count: { equipmentId: 'desc' }
      },
      take: 10
    });

    const equipmentDetails = await prisma.equipment.findMany({
      where: {
        id: { in: topEquipment.map(item => item.equipmentId) }
      }
    });

    const topEquipmentData = topEquipment.map(item => {
      const equipment = equipmentDetails.find(e => e.id === item.equipmentId);
      return {
        name: equipment?.name || 'Unknown',
        rentals: item._count.equipmentId,
        revenue: item._sum.totalAmount || 0,
      };
    });

    res.json({
      monthlyRevenue,
      topEquipment: topEquipmentData,
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// GET /api/dashboard/revenue - Revenue chart data (last 6 months)
router.get('/revenue', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    // Get date range (last 6 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    // Get all orders in the last 6 months
    const orders = await prisma.order.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Group revenue by month
    const revenueByMonth: { [key: string]: number } = {};
    const months: string[] = [];

    // Initialize months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      months.push(monthLabel);
      revenueByMonth[monthKey] = 0;
    }

    // Calculate revenue per month
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (revenueByMonth.hasOwnProperty(monthKey)) {
        revenueByMonth[monthKey] += order.totalAmount || 0;
      }
    });

    // Convert to array format
    const revenue = Object.values(revenueByMonth);
    const totalRevenue = revenue.reduce((sum, val) => sum + val, 0);
    const averageRevenue = totalRevenue / 6;

    res.json({
      labels: months,
      data: revenue,
      total: totalRevenue,
      average: averageRevenue,
      currency: 'TRY',
    });

  } catch (error) {
    console.error('Dashboard revenue error:', error);
    res.status(500).json({ error: 'Gelir istatistikleri alınırken hata oluştu' });
  }
});

// GET /api/dashboard/orders - Orders chart data with period filter
router.get('/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;
    const period = (req.query.period as string) || 'monthly'; // daily, weekly, monthly

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    let startDate = new Date();
    let labels: string[] = [];
    let dataPoints: number = 0;

    // Set date range and labels based on period
    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 30);
        dataPoints = 30;
        for (let i = dataPoints - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }));
        }
        break;
      
      case 'weekly':
        startDate.setDate(startDate.getDate() - 84); // 12 weeks
        dataPoints = 12;
        for (let i = dataPoints - 1; i >= 0; i--) {
          labels.push(`Hafta ${dataPoints - i}`);
        }
        break;
      
      case 'monthly':
      default:
        startDate.setMonth(startDate.getMonth() - 12);
        dataPoints = 12;
        for (let i = dataPoints - 1; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }));
        }
        break;
    }

    // Get all orders in the period
    const orders = await prisma.order.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group orders by period
    const orderCounts = new Array(dataPoints).fill(0);
    const statusBreakdown: { [key: string]: number[] } = {
      PENDING: new Array(dataPoints).fill(0),
      IN_PROGRESS: new Array(dataPoints).fill(0),
      COMPLETED: new Array(dataPoints).fill(0),
      CANCELLED: new Array(dataPoints).fill(0),
    };

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      let index = -1;

      switch (period) {
        case 'daily':
          const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
          index = dataPoints - 1 - daysDiff;
          break;
        
        case 'weekly':
          const weeksDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
          index = dataPoints - 1 - weeksDiff;
          break;
        
        case 'monthly':
          const monthsDiff = (now.getFullYear() - orderDate.getFullYear()) * 12 + 
                             (now.getMonth() - orderDate.getMonth());
          index = dataPoints - 1 - monthsDiff;
          break;
      }

      if (index >= 0 && index < dataPoints) {
        orderCounts[index]++;
        // Map order status to breakdown categories
        const statusMap: { [key: string]: string } = {
          'PENDING': 'PENDING',
          'CONFIRMED': 'IN_PROGRESS',
          'ACTIVE': 'IN_PROGRESS',
          'COMPLETED': 'COMPLETED',
          'CANCELLED': 'CANCELLED',
        };
        const mappedStatus = statusMap[order.status] || 'PENDING';
        if (statusBreakdown[mappedStatus]) {
          statusBreakdown[mappedStatus][index]++;
        }
      }
    });

    const totalOrders = orderCounts.reduce((sum, val) => sum + val, 0);

    res.json({
      labels,
      data: orderCounts,
      statusBreakdown,
      total: totalOrders,
      period,
    });

  } catch (error) {
    console.error('Dashboard orders error:', error);
    res.status(500).json({ error: 'Sipariş istatistikleri alınırken hata oluştu' });
  }
});

// GET /api/dashboard/equipment - Equipment utilization chart data
router.get('/equipment', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    // Get all equipment
    const equipmentList = await prisma.equipment.findMany({
      where: {
        companyId,
      },
    });

    // Count by status
    const statusCounts: { [key: string]: number } = {
      AVAILABLE: 0,
      IN_USE: 0,
      MAINTENANCE: 0,
      OUT_OF_SERVICE: 0,
    };

    const utilizationData: { [key: string]: number } = {
      'Kullanılabilir': 0,
      'Kullanımda': 0,
      'Bakımda': 0,
      'Servis Dışı': 0,
    };

    equipmentList.forEach(equipment => {
      const status = equipment.status || 'AVAILABLE';
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
      
      switch (status) {
        case 'AVAILABLE':
          utilizationData['Kullanılabilir']++;
          break;
        case 'RENTED':
        case 'IN_USE':
          statusCounts.IN_USE++;
          utilizationData['Kullanımda']++;
          break;
        case 'MAINTENANCE':
          utilizationData['Bakımda']++;
          break;
        case 'OUT_OF_SERVICE':
          utilizationData['Servis Dışı']++;
          break;
      }
    });

    const totalEquipment = equipmentList.length;
    const activeEquipment = statusCounts.IN_USE;
    const utilizationRate = totalEquipment > 0 
      ? Math.round((activeEquipment / totalEquipment) * 100) 
      : 0;

    // Get top 5 most used equipment
    const topEquipmentOrders = await prisma.order.groupBy({
      by: ['equipmentId'],
      where: {
        companyId,
        equipmentId: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const topEquipmentIds = topEquipmentOrders.map(item => item.equipmentId).filter((id): id is number => id !== null);
    
    const topEquipmentDetails = await prisma.equipment.findMany({
      where: {
        id: { in: topEquipmentIds },
      },
    });

    const topEquipment = topEquipmentOrders.map(item => {
      const equipment = topEquipmentDetails.find(e => e.id === item.equipmentId);
      return {
        name: equipment?.name || 'Unknown',
        type: equipment?.type || 'Unknown',
        totalOrders: item._count.id,
      };
    });

    res.json({
      labels: Object.keys(utilizationData),
      data: Object.values(utilizationData),
      statusCounts,
      total: totalEquipment,
      active: activeEquipment,
      utilizationRate,
      topEquipment,
    });

  } catch (error) {
    console.error('Dashboard equipment error:', error);
    res.status(500).json({ error: 'Ekipman istatistikleri alınırken hata oluştu' });
  }
});

export default router;
