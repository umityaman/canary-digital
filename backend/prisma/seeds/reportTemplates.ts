import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Default Report Templates for CANARY System
 * These templates cover common business intelligence needs
 */
export const defaultReportTemplates = [
  {
    name: 'Revenue Report - Monthly',
    description: 'Monthly revenue breakdown by order status and payment method',
    dataSource: 'orders',
    config: {
      dataSource: 'orders',
      fields: ['orderNumber', 'customerName', 'totalAmount', 'status', 'createdAt'],
      filters: {
        dateFrom: '{{firstDayOfMonth}}',
        dateTo: '{{lastDayOfMonth}}',
      },
      orderBy: [
        { field: 'createdAt', direction: 'desc' as const },
      ],
      aggregations: {
        totalAmount: 'SUM' as const,
      },
    },
    isDefault: true,
  },
  {
    name: 'Equipment Utilization Report',
    description: 'Equipment rental frequency and revenue performance',
    dataSource: 'equipment',
    config: {
      dataSource: 'equipment',
      fields: ['name', 'category', 'status', 'dailyPrice', 'weeklyPrice'],
      filters: {
        status: ['AVAILABLE', 'RENTED', 'MAINTENANCE'],
      },
      orderBy: [
        { field: 'category', direction: 'asc' as const },
        { field: 'name', direction: 'asc' as const },
      ],
    },
    isDefault: true,
  },
  {
    name: 'Top Customers Report',
    description: 'Customer ranking by total order value and frequency',
    dataSource: 'customers',
    config: {
      dataSource: 'customers',
      fields: ['name', 'email', 'phone', 'company'],
      filters: {},
      orderBy: [
        { field: 'name', direction: 'asc' as const },
      ],
    },
    isDefault: true,
  },
  {
    name: 'Payment Summary Report',
    description: 'Payment collection status and outstanding amounts',
    dataSource: 'payments',
    config: {
      dataSource: 'payments',
      fields: ['paymentDate', 'amount', 'paymentMethod'],
      filters: {
        dateFrom: '{{firstDayOfMonth}}',
        dateTo: '{{lastDayOfMonth}}',
      },
      orderBy: [
        { field: 'paymentDate', direction: 'desc' as const },
      ],
      aggregations: {
        amount: 'SUM' as const,
      },
    },
    isDefault: true,
  },
  {
    name: 'Active Reservations Report',
    description: 'Current and upcoming reservations with customer details',
    dataSource: 'reservations',
    config: {
      dataSource: 'reservations',
      fields: ['reservationNo', 'customerName', 'customerEmail', 'startDate', 'endDate', 'status', 'totalAmount'],
      filters: {
        status: ['PENDING', 'CONFIRMED', 'ACTIVE'],
      },
      orderBy: [
        { field: 'startDate', direction: 'asc' as const },
      ],
    },
    isDefault: true,
  },
  {
    name: 'Revenue by Category',
    description: 'Revenue breakdown by equipment category',
    dataSource: 'orders',
    config: {
      dataSource: 'orders',
      fields: ['totalAmount', 'status', 'createdAt'],
      filters: {
        status: ['COMPLETED', 'ACTIVE'],
        dateFrom: '{{firstDayOfMonth}}',
        dateTo: '{{today}}',
      },
      groupBy: ['status'],
      aggregations: {
        totalAmount: 'SUM' as const,
      },
      orderBy: [
        { field: 'totalAmount', direction: 'desc' as const },
      ],
    },
    isDefault: true,
  },
  {
    name: 'Overdue Orders Report',
    description: 'Orders past their return date that require follow-up',
    dataSource: 'orders',
    config: {
      dataSource: 'orders',
      fields: ['orderNumber', 'customerName', 'startDate', 'endDate', 'status', 'totalAmount'],
      filters: {
        status: ['ACTIVE', 'OVERDUE'],
      },
      orderBy: [
        { field: 'endDate', direction: 'asc' as const },
      ],
    },
    isDefault: true,
  },
  {
    name: 'Equipment Inventory Status',
    description: 'Complete equipment inventory with availability status',
    dataSource: 'equipment',
    config: {
      dataSource: 'equipment',
      fields: ['code', 'name', 'category', 'brand', 'model', 'status', 'dailyPrice'],
      filters: {},
      orderBy: [
        { field: 'category', direction: 'asc' as const },
        { field: 'code', direction: 'asc' as const },
      ],
    },
    isDefault: true,
  },
  {
    name: 'Customer Activity Report',
    description: 'Customer engagement metrics and order history',
    dataSource: 'customers',
    config: {
      dataSource: 'customers',
      fields: ['name', 'email', 'phone', 'company', 'createdAt'],
      filters: {},
      orderBy: [
        { field: 'createdAt', direction: 'desc' as const },
      ],
    },
    isDefault: true,
  },
  {
    name: 'Weekly Performance Summary',
    description: 'Weekly business performance across all metrics',
    dataSource: 'orders',
    config: {
      dataSource: 'orders',
      fields: ['orderNumber', 'totalAmount', 'status', 'createdAt'],
      filters: {
        dateFrom: '{{startOfWeek}}',
        dateTo: '{{endOfWeek}}',
      },
      groupBy: ['status'],
      aggregations: {
        totalAmount: 'SUM' as const,
        orderNumber: 'COUNT' as const,
      },
      orderBy: [
        { field: 'createdAt', direction: 'desc' as const },
      ],
    },
    isDefault: true,
  },
];

/**
 * Seed default report templates for a company
 */
export async function seedReportTemplates(companyId: number, userId: number) {
  console.log(`🌱 Seeding default report templates for company ${companyId}...`);

  const templates = [];

  for (const template of defaultReportTemplates) {
    const created = await prisma.reportTemplate.create({
      data: {
        ...template,
        companyId,
        createdBy: userId,
      },
    });

    templates.push(created);
    console.log(`  ✅ Created: ${created.name}`);
  }

  console.log(`🎉 Successfully created ${templates.length} default report templates`);
  return templates;
}

/**
 * Main seed function - run this to populate templates
 */
export async function main() {
  try {
    // Get first company and user (or specify IDs)
    const company = await prisma.company.findFirst();
    const user = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    });

    if (!company || !user) {
      console.error('❌ No company or admin user found. Please create them first.');
      process.exit(1);
    }

    console.log(`📍 Using Company: ${company.name} (ID: ${company.id})`);
    console.log(`👤 Using User: ${user.name} (ID: ${user.id})`);
    console.log('');

    await seedReportTemplates(company.id, user.id);

    console.log('');
    console.log('✨ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
