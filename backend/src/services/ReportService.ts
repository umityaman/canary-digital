import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const p = prisma as any;

export class ReportService {
  /**
   * Get dashboard summary statistics
   */
  async getDashboardStats(params: {
    companyId: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      const now = new Date();
      const startDate = params.startDate || new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = params.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Calculate previous period for comparison
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - periodDays);
      const previousEndDate = new Date(startDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);

      const where: any = { companyId: params.companyId };
      const currentWhere = {
        ...where,
        createdAt: { gte: startDate, lte: endDate },
      };
      const previousWhere = {
        ...where,
        createdAt: { gte: previousStartDate, lte: previousEndDate },
      };

      // Current period stats
      const [
        totalEquipment,
        totalReservations,
        activeReservations,
        completedReservations,
        currentRevenue,
        previousRevenue,
        topEquipment,
        lowStockEquipment,
        upcomingReservations,
      ] = await Promise.all([
        // Total equipment count
  p.equipment.count({ where }),

        // Total reservations in period
  p.reservation.count({ where: currentWhere }),

        // Active reservations (CONFIRMED or IN_PROGRESS)
        p.reservation.count({
          where: {
            ...where,
            status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        }),

        // Completed reservations
        p.reservation.count({
          where: {
            ...currentWhere,
            status: 'COMPLETED',
          },
        }),

        // Current period revenue
        p.reservation.aggregate({
          where: {
            ...currentWhere,
            status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
          },
          _sum: { totalAmount: true },
        }),

        // Previous period revenue
        p.reservation.aggregate({
          where: {
            ...previousWhere,
            status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
          },
          _sum: { totalAmount: true },
        }),

        // Top 5 most rented equipment
  p.$queryRaw<Array<any>>`
          SELECT 
            e.id,
            e.name,
            e.code,
            e.category,
            COUNT(DISTINCT ri.reservationId) as reservationCount,
            SUM(ri.quantity) as totalQuantityRented,
            SUM(ri.totalPrice) as totalRevenue
          FROM Equipment e
          LEFT JOIN ReservationItem ri ON ri.equipmentId = e.id
          LEFT JOIN Reservation r ON r.id = ri.reservationId
          WHERE e.companyId = ${params.companyId}
            AND r.createdAt >= ${startDate}
            AND r.createdAt <= ${endDate}
            AND r.status IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED')
          GROUP BY e.id, e.name, e.code, e.category
          ORDER BY reservationCount DESC
          LIMIT 5
        `,

        // Low stock equipment (quantity < 3)
        p.equipment.findMany({
          where: {
            ...where,
            quantity: { lt: 3 },
          },
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
            quantity: true,
          },
          take: 5,
        }),

        // Upcoming reservations (next 7 days)
        p.reservation.findMany({
          where: {
            ...where,
            status: 'CONFIRMED',
            startDate: {
              gte: now,
              lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            items: {
              include: {
                equipment: true,
              },
            },
          },
          orderBy: { startDate: 'asc' },
          take: 5,
        }),
      ]);

      // Calculate revenue change percentage
      const currentRevenueValue = currentRevenue._sum.totalAmount || 0;
      const previousRevenueValue = previousRevenue._sum.totalAmount || 0;
      const revenueChange =
        previousRevenueValue > 0
          ? ((currentRevenueValue - previousRevenueValue) / previousRevenueValue) * 100
          : 0;

      return {
        overview: {
          totalEquipment,
          totalReservations,
          activeReservations,
          completedReservations,
          currentRevenue: currentRevenueValue,
          previousRevenue: previousRevenueValue,
          revenueChange: Math.round(revenueChange * 100) / 100,
        },
        topEquipment: topEquipment.map((e: any) => ({
          id: e.id,
          name: e.name,
          code: e.code,
          category: e.category,
          reservationCount: Number(e.reservationCount),
          totalQuantityRented: Number(e.totalQuantityRented),
          totalRevenue: Number(e.totalRevenue),
        })),
        lowStockEquipment,
        upcomingReservations: upcomingReservations.map((res) => ({
          id: res.id,
          reservationNo: res.reservationNo,
          customerName: res.customerName,
          startDate: res.startDate,
          endDate: res.endDate,
          totalAmount: res.totalAmount,
          itemCount: res.items.length,
        })),
        period: {
          startDate,
          endDate,
          periodDays,
        },
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  /**
   * Get revenue report by period
   */
  async getRevenueReport(params: {
    companyId: number;
    startDate: Date;
    endDate: Date;
    groupBy: 'day' | 'week' | 'month';
  }): Promise<any> {
    try {
      const reservations = await p.reservation.findMany({
        where: {
          companyId: params.companyId,
          createdAt: {
            gte: params.startDate,
            lte: params.endDate,
          },
          status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
        },
        select: {
          createdAt: true,
          totalAmount: true,
          depositAmount: true,
          depositPaid: true,
          fullPayment: true,
          status: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      // Group by period
      const grouped = new Map<string, any>();

      reservations.forEach((res) => {
        let key: string;
        const date = new Date(res.createdAt);

        if (params.groupBy === 'day') {
          key = date.toISOString().split('T')[0];
        } else if (params.groupBy === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!grouped.has(key)) {
          grouped.set(key, {
            period: key,
            totalRevenue: 0,
            depositRevenue: 0,
            fullPaymentRevenue: 0,
            reservationCount: 0,
            confirmedCount: 0,
            inProgressCount: 0,
            completedCount: 0,
          });
        }

        const group = grouped.get(key);
        group.totalRevenue += res.totalAmount;
        group.reservationCount++;

        if (res.depositPaid) {
          group.depositRevenue += res.depositAmount;
        }
        if (res.fullPayment) {
          group.fullPaymentRevenue += res.totalAmount;
        }

        if (res.status === 'CONFIRMED') group.confirmedCount++;
        if (res.status === 'IN_PROGRESS') group.inProgressCount++;
        if (res.status === 'COMPLETED') group.completedCount++;
      });

      const data = Array.from(grouped.values()).sort((a, b) =>
        a.period.localeCompare(b.period)
      );

      // Calculate totals
      const totals = data.reduce(
        (acc, item) => ({
          totalRevenue: acc.totalRevenue + item.totalRevenue,
          depositRevenue: acc.depositRevenue + item.depositRevenue,
          fullPaymentRevenue: acc.fullPaymentRevenue + item.fullPaymentRevenue,
          reservationCount: acc.reservationCount + item.reservationCount,
        }),
        { totalRevenue: 0, depositRevenue: 0, fullPaymentRevenue: 0, reservationCount: 0 }
      );

      return {
        data,
        totals,
        groupBy: params.groupBy,
        startDate: params.startDate,
        endDate: params.endDate,
      };
    } catch (error) {
      console.error('Get revenue report error:', error);
      throw new Error('Failed to get revenue report');
    }
  }

  /**
   * Get equipment performance report
   */
  async getEquipmentReport(params: {
    companyId: number;
    startDate: Date;
    endDate: Date;
    equipmentId?: number;
  }): Promise<any> {
    try {
      const where: any = {
        companyId: params.companyId,
      };

      if (params.equipmentId) {
        where.id = params.equipmentId;
      }

      // Get equipment with their reservation stats
      const equipment = await p.equipment.findMany({
        where,
        include: {
          reservationItems: {
            where: {
              reservation: {
                createdAt: {
                  gte: params.startDate,
                  lte: params.endDate,
                },
                status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
              },
            },
            include: {
              reservation: true,
            },
          },
        },
      });

      const report = equipment.map((equip) => {
        const items = equip.reservationItems;
        const totalRentals = items.length;
        const totalRevenue = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const totalDays = items.reduce((sum, item) => {
          const start = new Date(item.reservation.startDate);
          const end = new Date(item.reservation.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);

        // Calculate utilization
        const periodDays = Math.ceil(
          (params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const utilization =
          periodDays > 0 ? (totalDays / periodDays) * 100 : 0;

        // Average rental price
        const avgRentalPrice = totalRentals > 0 ? totalRevenue / totalRentals : 0;

        return {
          equipmentId: equip.id,
          equipmentName: equip.name,
          equipmentCode: equip.code,
          category: equip.category,
          brand: equip.brand,
          model: equip.model,
          dailyPrice: equip.dailyPrice,
          quantity: equip.quantity,
          totalRentals,
          totalRevenue,
          totalDays,
          utilization: Math.round(utilization * 100) / 100,
          avgRentalPrice: Math.round(avgRentalPrice * 100) / 100,
          revenuePerDay: totalDays > 0 ? Math.round((totalRevenue / totalDays) * 100) / 100 : 0,
        };
      });

      // Sort by revenue
      report.sort((a, b) => b.totalRevenue - a.totalRevenue);

      return {
        equipment: report,
        summary: {
          totalEquipment: equipment.length,
          totalRentals: report.reduce((sum, e) => sum + e.totalRentals, 0),
          totalRevenue: report.reduce((sum, e) => sum + e.totalRevenue, 0),
          avgUtilization:
            report.length > 0
              ? Math.round(
                  (report.reduce((sum, e) => sum + e.utilization, 0) / report.length) * 100
                ) / 100
              : 0,
        },
        period: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      };
    } catch (error) {
      console.error('Get equipment report error:', error);
      throw new Error('Failed to get equipment report');
    }
  }

  /**
   * Get customer report
   */
  async getCustomerReport(params: {
    companyId: number;
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    try {
      const reservations = await p.reservation.findMany({
        where: {
          companyId: params.companyId,
          createdAt: {
            gte: params.startDate,
            lte: params.endDate,
          },
        },
        select: {
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          totalAmount: true,
          depositPaid: true,
          fullPayment: true,
          status: true,
          createdAt: true,
        },
      });

      // Group by customer
      const customerMap = new Map<string, any>();

      reservations.forEach((res) => {
        const key = res.customerEmail;

        if (!customerMap.has(key)) {
          customerMap.set(key, {
            customerName: res.customerName,
            customerEmail: res.customerEmail,
            customerPhone: res.customerPhone,
            totalReservations: 0,
            completedReservations: 0,
            cancelledReservations: 0,
            totalSpent: 0,
            avgOrderValue: 0,
            lastReservationDate: res.createdAt,
          });
        }

        const customer = customerMap.get(key);
        customer.totalReservations++;
        customer.totalSpent += res.totalAmount;

        if (res.status === 'COMPLETED') {
          customer.completedReservations++;
        }
        if (res.status === 'CANCELLED' || res.status === 'REJECTED') {
          customer.cancelledReservations++;
        }

        if (new Date(res.createdAt) > new Date(customer.lastReservationDate)) {
          customer.lastReservationDate = res.createdAt;
        }
      });

      const customers = Array.from(customerMap.values()).map((c) => ({
        ...c,
        avgOrderValue: Math.round((c.totalSpent / c.totalReservations) * 100) / 100,
        completionRate:
          c.totalReservations > 0
            ? Math.round((c.completedReservations / c.totalReservations) * 100 * 100) / 100
            : 0,
      }));

      // Sort by total spent
      customers.sort((a, b) => b.totalSpent - a.totalSpent);

      return {
        customers,
        summary: {
          totalCustomers: customers.length,
          totalReservations: reservations.length,
          totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
          avgCustomerValue:
            customers.length > 0
              ? Math.round(
                  (customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) * 100
                ) / 100
              : 0,
        },
        period: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      };
    } catch (error) {
      console.error('Get customer report error:', error);
      throw new Error('Failed to get customer report');
    }
  }

  /**
   * Get category performance report
   */
  async getCategoryReport(params: {
    companyId: number;
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    try {
  const result = await p.$queryRaw<Array<any>>`
        SELECT 
          e.category,
          COUNT(DISTINCT e.id) as equipmentCount,
          COUNT(DISTINCT ri.reservationId) as reservationCount,
          SUM(ri.quantity) as totalQuantityRented,
          SUM(ri.totalPrice) as totalRevenue,
          AVG(ri.totalPrice) as avgRevenuePerRental
        FROM Equipment e
        LEFT JOIN ReservationItem ri ON ri.equipmentId = e.id
        LEFT JOIN Reservation r ON r.id = ri.reservationId
        WHERE e.companyId = ${params.companyId}
          AND r.createdAt >= ${params.startDate}
          AND r.createdAt <= ${params.endDate}
          AND r.status IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED')
        GROUP BY e.category
        ORDER BY totalRevenue DESC
      `;

      const categories = result.map((cat: any) => ({
        category: cat.category || 'Uncategorized',
        equipmentCount: Number(cat.equipmentCount),
        reservationCount: Number(cat.reservationCount),
        totalQuantityRented: Number(cat.totalQuantityRented),
        totalRevenue: Number(cat.totalRevenue),
        avgRevenuePerRental: Number(cat.avgRevenuePerRental) || 0,
      }));

      const totalRevenue = categories.reduce((sum, cat) => sum + cat.totalRevenue, 0);

      return {
        categories: categories.map((cat) => ({
          ...cat,
          revenuePercentage:
            totalRevenue > 0
              ? Math.round((cat.totalRevenue / totalRevenue) * 100 * 100) / 100
              : 0,
        })),
        summary: {
          totalCategories: categories.length,
          totalRevenue,
          totalReservations: categories.reduce((sum, cat) => sum + cat.reservationCount, 0),
        },
        period: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      };
    } catch (error) {
      console.error('Get category report error:', error);
      throw new Error('Failed to get category report');
    }
  }
}
