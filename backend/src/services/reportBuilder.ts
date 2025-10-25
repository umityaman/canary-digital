import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReportConfig {
  dataSource: string; // 'orders', 'equipment', 'customers', 'payments'
  fields: string[]; // Column names to include
  filters: Record<string, any>; // Dynamic filters
  groupBy?: string[]; // Group by columns
  aggregations?: Record<string, 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX'>; // Aggregation functions
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
}

export interface QueryResult {
  data: any[];
  total: number;
  fields: string[];
}

export class ReportBuilder {
  /**
   * Main entry point for generating a report
   */
  async generateReport(config: ReportConfig): Promise<QueryResult> {
    // Validate configuration
    if (!this.validateConfig(config)) {
      throw new Error('Invalid report configuration');
    }

    // Build and execute query
    const data = await this.executeQuery(config);
    
    return {
      data,
      total: data.length,
      fields: config.fields,
    };
  }

  /**
   * Validate report configuration
   */
  validateConfig(config: ReportConfig): boolean {
    // Check required fields
    if (!config.dataSource || !config.fields || config.fields.length === 0) {
      return false;
    }

    // Validate data source
    const validDataSources = ['orders', 'equipment', 'customers', 'payments', 'reservations'];
    if (!validDataSources.includes(config.dataSource)) {
      return false;
    }

    return true;
  }

  /**
   * Execute query based on configuration
   */
  private async executeQuery(config: ReportConfig): Promise<any[]> {
    const { dataSource, filters, orderBy, limit } = config;

    // Build where clause from filters
    const whereClause = this.buildWhereClause(filters);

    // Build order by clause
    const orderByClause = this.buildOrderByClause(orderBy);

    // Execute query based on data source
    switch (dataSource) {
      case 'orders':
        return await this.queryOrders(whereClause, orderByClause, limit);
      
      case 'equipment':
        return await this.queryEquipment(whereClause, orderByClause, limit);
      
      case 'customers':
        return await this.queryCustomers(whereClause, orderByClause, limit);
      
      case 'payments':
        return await this.queryPayments(whereClause, orderByClause, limit);
      
      case 'reservations':
        return await this.queryReservations(whereClause, orderByClause, limit);
      
      default:
        throw new Error(`Unsupported data source: ${dataSource}`);
    }
  }

  /**
   * Build WHERE clause from filters
   */
  private buildWhereClause(filters: Record<string, any>): any {
    const where: any = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined) continue;

      // Handle date range filters
      if (key === 'dateFrom' || key === 'dateTo') {
        if (!where.createdAt) where.createdAt = {};
        if (key === 'dateFrom') {
          where.createdAt.gte = new Date(value);
        } else {
          where.createdAt.lte = new Date(value);
        }
      }
      // Handle status filters
      else if (key === 'status' && Array.isArray(value)) {
        where.status = { in: value };
      }
      // Handle exact match
      else {
        where[key] = value;
      }
    }

    return where;
  }

  /**
   * Build ORDER BY clause
   */
  private buildOrderByClause(orderBy?: { field: string; direction: 'asc' | 'desc' }[]): any {
    if (!orderBy || orderBy.length === 0) {
      return { createdAt: 'desc' }; // Default sorting
    }

    return orderBy.reduce((acc, item) => {
      acc[item.field] = item.direction;
      return acc;
    }, {} as any);
  }

  /**
   * Query Orders
   */
  private async queryOrders(where: any, orderBy: any, limit?: number): Promise<any[]> {
    return await prisma.order.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        orderItems: {
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Query Equipment
   */
  private async queryEquipment(where: any, orderBy: any, limit?: number): Promise<any[]> {
    return await prisma.equipment.findMany({
      where,
      orderBy,
      take: limit,
    });
  }

  /**
   * Query Customers
   */
  private async queryCustomers(where: any, orderBy: any, limit?: number): Promise<any[]> {
    return await prisma.customer.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /**
   * Query Payments
   */
  private async queryPayments(where: any, orderBy: any, limit?: number): Promise<any[]> {
    return await prisma.payment.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Query Reservations
   */
  private async queryReservations(where: any, orderBy: any, limit?: number): Promise<any[]> {
    return await prisma.reservation.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Apply aggregations to data
   */
  applyAggregations(
    data: any[],
    groupBy: string[],
    aggregations: Record<string, 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX'>
  ): any[] {
    if (!groupBy || groupBy.length === 0) {
      return data;
    }

    // Group data
    const grouped = new Map<string, any[]>();
    
    for (const row of data) {
      const key = groupBy.map(field => row[field]).join('|');
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(row);
    }

    // Apply aggregations
    const result: any[] = [];
    
    for (const [key, rows] of grouped.entries()) {
      const aggregated: any = {};
      
      // Set group by fields
      groupBy.forEach((field, index) => {
        aggregated[field] = key.split('|')[index];
      });

      // Apply aggregation functions
      for (const [field, func] of Object.entries(aggregations)) {
        const values = rows.map(row => parseFloat(row[field]) || 0);
        
        switch (func) {
          case 'SUM':
            aggregated[field] = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'AVG':
            aggregated[field] = values.reduce((sum, val) => sum + val, 0) / values.length;
            break;
          case 'COUNT':
            aggregated[field] = values.length;
            break;
          case 'MIN':
            aggregated[field] = Math.min(...values);
            break;
          case 'MAX':
            aggregated[field] = Math.max(...values);
            break;
        }
      }

      result.push(aggregated);
    }

    return result;
  }
}

export default new ReportBuilder();
