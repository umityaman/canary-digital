import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateCostCenterParams {
  code: string;
  name: string;
  description?: string;
  parentId?: number;
  annualBudget?: number;
  quarterlyBudget?: number;
  monthlyBudget?: number;
  responsiblePerson?: string;
  companyId: number;
}

interface CreateBudgetItemParams {
  name: string;
  category: string;
  description?: string;
  costCenterId?: number;
  budgetYear: number;
  budgetMonth?: number;
  budgetQuarter?: number;
  plannedAmount: number;
  companyId: number;
}

interface AllocateCostParams {
  expenseId: number;
  costCenterId: number;
  amount: number;
  allocationType?: 'direct' | 'indirect' | 'shared';
  allocationMethod?: string;
  percentage?: number;
  notes?: string;
  companyId: number;
}

export class CostAccountingService {
  /**
   * Create a cost center
   */
  async createCostCenter(params: CreateCostCenterParams) {
    // Check if code already exists
    const existing = await prisma.costCenter.findUnique({
      where: {
        companyId_code: {
          companyId: params.companyId,
          code: params.code
        }
      }
    });

    if (existing) {
      throw new Error('Cost center code already exists');
    }

    const costCenter = await prisma.costCenter.create({
      data: {
        code: params.code,
        name: params.name,
        description: params.description,
        parentId: params.parentId,
        annualBudget: params.annualBudget,
        quarterlyBudget: params.quarterlyBudget,
        monthlyBudget: params.monthlyBudget,
        responsiblePerson: params.responsiblePerson,
        companyId: params.companyId
      },
      include: {
        parent: true,
        children: true
      }
    });

    return costCenter;
  }

  /**
   * Get cost center hierarchy
   */
  async getCostCenterHierarchy(companyId: number) {
    const costCenters = await prisma.costCenter.findMany({
      where: { companyId, isActive: true },
      include: {
        parent: true,
        children: true,
        expenses: {
          select: {
            id: true,
            amount: true,
            date: true
          }
        }
      },
      orderBy: { code: 'asc' }
    });

    // Build hierarchy tree
    const rootCenters = costCenters.filter(cc => !cc.parentId);
    
    return rootCenters.map(root => this.buildCostCenterTree(root, costCenters));
  }

  private buildCostCenterTree(center: any, allCenters: any[]): any {
    const children = allCenters.filter(cc => cc.parentId === center.id);
    
    return {
      ...center,
      totalExpenses: center.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0),
      children: children.map(child => this.buildCostCenterTree(child, allCenters))
    };
  }

  /**
   * Create budget item
   */
  async createBudgetItem(params: CreateBudgetItemParams) {
    const budgetItem = await prisma.budgetItem.create({
      data: {
        name: params.name,
        category: params.category,
        description: params.description,
        costCenterId: params.costCenterId,
        budgetYear: params.budgetYear,
        budgetMonth: params.budgetMonth,
        budgetQuarter: params.budgetQuarter,
        plannedAmount: params.plannedAmount,
        actualAmount: 0,
        variance: 0,
        variancePercent: 0,
        status: 'draft',
        companyId: params.companyId
      },
      include: {
        costCenter: true
      }
    });

    return budgetItem;
  }

  /**
   * Update budget item actual amount
   */
  async updateBudgetActual(budgetItemId: number, actualAmount: number) {
    const budgetItem = await prisma.budgetItem.findUnique({
      where: { id: budgetItemId }
    });

    if (!budgetItem) {
      throw new Error('Budget item not found');
    }

    const variance = actualAmount - budgetItem.plannedAmount;
    const variancePercent = budgetItem.plannedAmount > 0 
      ? (variance / budgetItem.plannedAmount) * 100 
      : 0;

    return prisma.budgetItem.update({
      where: { id: budgetItemId },
      data: {
        actualAmount,
        variance,
        variancePercent,
        lastUpdated: new Date()
      }
    });
  }

  /**
   * Allocate cost to cost center
   */
  async allocateCost(params: AllocateCostParams) {
    // Verify expense exists
    const expense = await prisma.expense.findUnique({
      where: { id: params.expenseId }
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Verify cost center exists
    const costCenter = await prisma.costCenter.findUnique({
      where: { id: params.costCenterId }
    });

    if (!costCenter) {
      throw new Error('Cost center not found');
    }

    // Create allocation
    const allocation = await prisma.costAllocation.create({
      data: {
        expenseId: params.expenseId,
        costCenterId: params.costCenterId,
        amount: params.amount,
        allocationType: params.allocationType || 'direct',
        allocationMethod: params.allocationMethod,
        percentage: params.percentage,
        notes: params.notes,
        companyId: params.companyId
      },
      include: {
        expense: true,
        costCenter: true
      }
    });

    // Update expense cost center if not set
    if (!expense.costCenterId) {
      await prisma.expense.update({
        where: { id: params.expenseId },
        data: { costCenterId: params.costCenterId }
      });
    }

    return allocation;
  }

  /**
   * Calculate profit/loss
   */
  async calculateProfitLoss(companyId: number, startDate: Date, endDate: Date) {
    // Get all income (from invoices)
    const invoices = await prisma.invoice.findMany({
      where: {
        order: { companyId },
        invoiceDate: {
          gte: startDate,
          lte: endDate
        },
        status: { not: 'cancelled' }
      }
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

    // Get all expenses
    const expenses = await prisma.expense.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        costCenter: true,
        costAllocations: true
      }
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, exp) => {
      const category = exp.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, items: [] };
      }
      acc[category].total += exp.amount;
      acc[category].count += 1;
      acc[category].items.push(exp);
      return acc;
    }, {} as Record<string, any>);

    // Group expenses by cost center
    const expensesByCostCenter = expenses.reduce((acc, exp) => {
      const ccName = exp.costCenter?.name || 'Unallocated';
      if (!acc[ccName]) {
        acc[ccName] = { total: 0, count: 0, items: [] };
      }
      acc[ccName].total += exp.amount;
      acc[ccName].count += 1;
      acc[ccName].items.push(exp);
      return acc;
    }, {} as Record<string, any>);

    // Calculate net profit
    const grossProfit = totalRevenue - totalExpenses;
    const netProfit = totalPaid - totalExpenses;

    return {
      period: {
        start: startDate,
        end: endDate
      },
      revenue: {
        total: totalRevenue,
        paid: totalPaid,
        outstanding: totalRevenue - totalPaid
      },
      expenses: {
        total: totalExpenses,
        byCategory: expensesByCategory,
        byCostCenter: expensesByCostCenter
      },
      profit: {
        gross: grossProfit,
        net: netProfit,
        margin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
      },
      summary: {
        totalInvoices: invoices.length,
        totalExpenseItems: expenses.length,
        averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
        averageExpenseValue: expenses.length > 0 ? totalExpenses / expenses.length : 0
      }
    };
  }

  /**
   * Track budget performance
   */
  async trackBudget(companyId: number, year: number, month?: number, quarter?: number) {
    const where: any = {
      companyId,
      budgetYear: year
    };

    if (month) {
      where.budgetMonth = month;
    }

    if (quarter) {
      where.budgetQuarter = quarter;
    }

    const budgetItems = await prisma.budgetItem.findMany({
      where,
      include: {
        costCenter: true
      },
      orderBy: { category: 'asc' }
    });

    // Calculate totals
    const totalPlanned = budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);
    const totalVariance = totalActual - totalPlanned;
    const totalVariancePercent = totalPlanned > 0 ? (totalVariance / totalPlanned) * 100 : 0;

    // Group by category
    const byCategory = budgetItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          planned: 0,
          actual: 0,
          variance: 0,
          variancePercent: 0,
          items: []
        };
      }
      acc[item.category].planned += item.plannedAmount;
      acc[item.category].actual += item.actualAmount;
      acc[item.category].variance += item.variance;
      acc[item.category].items.push(item);
      
      const planned = acc[item.category].planned;
      acc[item.category].variancePercent = planned > 0 
        ? (acc[item.category].variance / planned) * 100 
        : 0;
      
      return acc;
    }, {} as Record<string, any>);

    // Group by cost center
    const byCostCenter = budgetItems.reduce((acc, item) => {
      const ccName = item.costCenter?.name || 'Unallocated';
      if (!acc[ccName]) {
        acc[ccName] = {
          planned: 0,
          actual: 0,
          variance: 0,
          variancePercent: 0,
          items: []
        };
      }
      acc[ccName].planned += item.plannedAmount;
      acc[ccName].actual += item.actualAmount;
      acc[ccName].variance += item.variance;
      acc[ccName].items.push(item);
      
      const planned = acc[ccName].planned;
      acc[ccName].variancePercent = planned > 0 
        ? (acc[ccName].variance / planned) * 100 
        : 0;
      
      return acc;
    }, {} as Record<string, any>);

    return {
      period: { year, month, quarter },
      summary: {
        totalPlanned,
        totalActual,
        totalVariance,
        totalVariancePercent,
        itemCount: budgetItems.length,
        overBudgetCount: budgetItems.filter(item => item.actualAmount > item.plannedAmount).length,
        underBudgetCount: budgetItems.filter(item => item.actualAmount < item.plannedAmount).length
      },
      byCategory,
      byCostCenter,
      items: budgetItems
    };
  }

  /**
   * Compare budget vs actual
   */
  async compareBudgetVsActual(companyId: number, year: number) {
    const budgetData: any[] = [];

    // Get data for each month
    for (let month = 1; month <= 12; month++) {
      const monthData = await this.trackBudget(companyId, year, month);
      budgetData.push({
        month,
        ...monthData.summary
      });
    }

    // Calculate year totals
    const yearTotals = {
      totalPlanned: budgetData.reduce((sum, m) => sum + m.totalPlanned, 0),
      totalActual: budgetData.reduce((sum, m) => sum + m.totalActual, 0),
      totalVariance: budgetData.reduce((sum, m) => sum + m.totalVariance, 0)
    };

    yearTotals['totalVariancePercent'] = yearTotals.totalPlanned > 0
      ? (yearTotals.totalVariance / yearTotals.totalPlanned) * 100
      : 0;

    return {
      year,
      monthlyData: budgetData,
      yearTotals
    };
  }

  /**
   * Generate cost report
   */
  async generateCostReport(companyId: number, startDate: Date, endDate: Date) {
    const [profitLoss, costCenters, expenses] = await Promise.all([
      this.calculateProfitLoss(companyId, startDate, endDate),
      this.getCostCenterHierarchy(companyId),
      prisma.expense.findMany({
        where: {
          companyId,
          date: { gte: startDate, lte: endDate }
        },
        include: {
          costCenter: true,
          costAllocations: {
            include: {
              costCenter: true
            }
          }
        },
        orderBy: { date: 'desc' }
      })
    ]);

    return {
      period: { start: startDate, end: endDate },
      profitLoss,
      costCenters,
      expenses,
      summary: {
        totalCostCenters: costCenters.length,
        totalExpenses: expenses.length,
        totalExpenseAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        allocatedExpenses: expenses.filter(exp => exp.costCenterId).length,
        unallocatedExpenses: expenses.filter(exp => !exp.costCenterId).length
      }
    };
  }
}

export default new CostAccountingService();
