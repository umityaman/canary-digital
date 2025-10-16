import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchFilters {
  // Common filters
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  category?: string[];
  
  // Equipment specific
  brand?: string[];
  model?: string[];
  availability?: 'available' | 'rented' | 'maintenance' | 'all';
  priceMin?: number;
  priceMax?: number;
  
  // Customer specific
  customerType?: string[];
  hasOrders?: boolean;
  
  // Order specific
  orderStatus?: string[];
  amountMin?: number;
  amountMax?: number;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export class AdvancedSearchService {
  /**
   * Search Equipment with advanced filters
   */
  static async searchEquipment(
    companyId: number,
    filters: SearchFilters
  ): Promise<SearchResult<any>> {
    const {
      query,
      brand,
      model,
      category,
      availability,
      priceMin,
      priceMax,
      status,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { companyId };

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
        { serialNumber: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Brand filter
    if (brand && brand.length > 0) {
      where.brand = { in: brand };
    }

    // Model filter
    if (model && model.length > 0) {
      where.model = { in: model };
    }

    // Category filter
    if (category && category.length > 0) {
      where.category = { in: category };
    }

    // Status filter
    if (status && status.length > 0) {
      where.status = { in: status };
    }

    // Availability filter
    if (availability && availability !== 'all') {
      where.status = availability.toUpperCase();
    }

    // Price range
    if (priceMin !== undefined || priceMax !== undefined) {
      where.rentalPrice = {};
      if (priceMin !== undefined) where.rentalPrice.gte = priceMin;
      if (priceMax !== undefined) where.rentalPrice.lte = priceMax;
    }

    // Execute query
    const [data, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          orderItems: {
            where: { order: { status: { in: ['CONFIRMED', 'ACTIVE'] } } },
            include: { order: true },
          },
        },
      }),
      prisma.equipment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Search Customers with advanced filters
   */
  static async searchCustomers(
    companyId: number,
    filters: SearchFilters
  ): Promise<SearchResult<any>> {
    const {
      query,
      customerType,
      hasOrders,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = { companyId };

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
        { taxNumber: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Has orders filter
    if (hasOrders !== undefined) {
      if (hasOrders) {
        where.orders = { some: {} };
      } else {
        where.orders = { none: {} };
      }
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
            },
          },
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Search Orders with advanced filters
   */
  static async searchOrders(
    companyId: number,
    filters: SearchFilters
  ): Promise<SearchResult<any>> {
    const {
      query,
      orderStatus,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = { companyId };

    // Text search
    if (query) {
      where.OR = [
        { orderNumber: { contains: query, mode: 'insensitive' } },
        { customer: { name: { contains: query, mode: 'insensitive' } } },
        { notes: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (orderStatus && orderStatus.length > 0) {
      where.status = { in: orderStatus };
    }

    // Date range
    if (dateFrom || dateTo) {
      where.startDate = {};
      if (dateFrom) where.startDate.gte = new Date(dateFrom);
      if (dateTo) where.startDate.lte = new Date(dateTo);
    }

    // Amount range
    if (amountMin !== undefined || amountMax !== undefined) {
      where.totalAmount = {};
      if (amountMin !== undefined) where.totalAmount.gte = amountMin;
      if (amountMax !== undefined) where.totalAmount.lte = amountMax;
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
                  code: true,
                },
              },
            },
          },
          _count: {
            select: { orderItems: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Global search across all entities
   */
  static async globalSearch(
    companyId: number,
    query: string,
    limit: number = 5
  ): Promise<{
    equipment: any[];
    customers: any[];
    orders: any[];
  }> {
    const [equipment, customers, orders] = await Promise.all([
      // Equipment search
      prisma.equipment.findMany({
        where: {
          companyId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } },
            { serialNumber: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          code: true,
          brand: true,
          model: true,
          status: true,
        },
      }),

      // Customer search
      prisma.customer.findMany({
        where: {
          companyId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
        },
      }),

      // Order search
      prisma.order.findMany({
        where: {
          companyId,
          OR: [
            { orderNumber: { contains: query, mode: 'insensitive' } },
            { customer: { name: { contains: query, mode: 'insensitive' } } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          startDate: true,
          customer: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      equipment,
      customers,
      orders,
    };
  }

  /**
   * Get available filter options for equipment
   */
  static async getEquipmentFilterOptions(companyId: number) {
    const [brands, models, categories, statuses] = await Promise.all([
      prisma.equipment.groupBy({
        by: ['brand'],
        where: { companyId, brand: { not: null } },
        _count: true,
      }),
      prisma.equipment.groupBy({
        by: ['model'],
        where: { companyId, model: { not: null } },
        _count: true,
      }),
      prisma.equipment.groupBy({
        by: ['category'],
        where: { companyId, category: { not: null } },
        _count: true,
      }),
      prisma.equipment.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true,
      }),
    ]);

    return {
      brands: brands.map((b) => ({ value: b.brand, count: b._count })),
      models: models.map((m) => ({ value: m.model, count: m._count })),
      categories: categories.map((c) => ({ value: c.category, count: c._count })),
      statuses: statuses.map((s) => ({ value: s.status, count: s._count })),
    };
  }

  /**
   * Save a search for later use
   */
  static async saveSearch(
    userId: number,
    companyId: number,
    data: {
      name: string;
      description?: string;
      entity: string;
      filters: SearchFilters;
      sortBy?: string;
      sortOrder?: string;
      isShared?: boolean;
    }
  ) {
    return await prisma.savedSearch.create({
      data: {
        name: data.name,
        description: data.description,
        entity: data.entity,
        filters: JSON.stringify(data.filters),
        sortBy: data.sortBy,
        sortOrder: data.sortOrder,
        isShared: data.isShared || false,
        userId,
        companyId,
      },
    });
  }

  /**
   * Get user's saved searches
   */
  static async getSavedSearches(userId: number, companyId: number, entity?: string) {
    const where: any = {
      OR: [
        { userId, companyId },
        { companyId, isShared: true },
      ],
    };

    if (entity) {
      where.entity = entity;
    }

    return await prisma.savedSearch.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { lastUsedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update saved search usage
   */
  static async updateSearchUsage(searchId: number) {
    return await prisma.savedSearch.update({
      where: { id: searchId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * Delete saved search
   */
  static async deleteSavedSearch(searchId: number, userId: number) {
    // Check ownership
    const search = await prisma.savedSearch.findUnique({
      where: { id: searchId },
    });

    if (!search || search.userId !== userId) {
      throw new Error('Unauthorized or search not found');
    }

    return await prisma.savedSearch.delete({
      where: { id: searchId },
    });
  }

  /**
   * Toggle pin status
   */
  static async togglePin(searchId: number, userId: number) {
    const search = await prisma.savedSearch.findUnique({
      where: { id: searchId },
    });

    if (!search || search.userId !== userId) {
      throw new Error('Unauthorized or search not found');
    }

    return await prisma.savedSearch.update({
      where: { id: searchId },
      data: { isPinned: !search.isPinned },
    });
  }

  /**
   * Add search to history
   */
  static async addToHistory(
    userId: number,
    companyId: number,
    entity: string,
    query: string,
    filters: SearchFilters,
    resultCount: number
  ) {
    return await prisma.searchHistory.create({
      data: {
        userId,
        companyId,
        entity,
        query,
        filters: JSON.stringify(filters),
        resultCount,
      },
    });
  }

  /**
   * Get search history
   */
  static async getSearchHistory(
    userId: number,
    companyId: number,
    entity?: string,
    limit: number = 20
  ) {
    const where: any = { userId, companyId };
    if (entity) where.entity = entity;

    return await prisma.searchHistory.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Clear search history
   */
  static async clearSearchHistory(userId: number, companyId: number) {
    return await prisma.searchHistory.deleteMany({
      where: { userId, companyId },
    });
  }
}

export default AdvancedSearchService;
