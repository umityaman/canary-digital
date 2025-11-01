import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AccountBalance {
  customerId: number;
  customerName: string;
  totalDebit: number;        // Borç (Alacağımız)
  totalCredit: number;       // Alacak (Borcumuz) 
  balance: number;           // Net Bakiye (+ ise alacak, - ise borç)
  lastTransactionDate: Date | null;
}

export interface AccountTransaction {
  id: number;
  date: Date;
  type: 'invoice' | 'payment' | 'delivery_note';
  referenceNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AgingReport {
  customerId: number;
  customerName: string;
  current: number;           // 0-30 gün
  days30to60: number;        // 30-60 gün
  days60to90: number;        // 60-90 gün
  over90: number;            // 90+ gün
  totalOverdue: number;
}

export interface AccountStatement {
  customer: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  periodStart: Date;
  periodEnd: Date;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  transactions: AccountTransaction[];
}

/**
 * Get account balance for a specific customer
 */
export async function getCustomerBalance(customerId: number): Promise<AccountBalance> {
  // Get all invoices
  const invoices = await prisma.invoice.findMany({
    where: { customerId },
    include: {
      customer: true,
      payments: true
    }
  });

  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    select: { id: true, name: true }
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  let totalDebit = 0;
  let totalCredit = 0;
  let lastTransactionDate: Date | null = null;

  // Calculate from invoices
  for (const invoice of invoices) {
    // Invoices are debit (customer owes us)
    totalDebit += invoice.grandTotal;
    
    // Payments are credit (we received money)
    const paidAmount = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    totalCredit += paidAmount;

    // Track last transaction date
    if (!lastTransactionDate || invoice.invoiceDate > lastTransactionDate) {
      lastTransactionDate = invoice.invoiceDate;
    }
    
    // Check payment dates
    for (const payment of invoice.payments) {
      if (!lastTransactionDate || payment.paymentDate > lastTransactionDate) {
        lastTransactionDate = payment.paymentDate;
      }
    }
  }

  const balance = totalDebit - totalCredit;

  return {
    customerId,
    customerName: customer.name || 'Unknown',
    totalDebit,
    totalCredit,
    balance,
    lastTransactionDate
  };
}

/**
 * Get account balances for all customers
 */
export async function getAllCustomerBalances(filters?: {
  hasBalance?: boolean;
  minBalance?: number;
  maxBalance?: number;
}): Promise<AccountBalance[]> {
  const customers = await prisma.user.findMany({
    where: {
      role: 'USER' // Assuming customers have USER role
    },
    select: {
      id: true,
      name: true
    }
  });

  const balances: AccountBalance[] = [];

  for (const customer of customers) {
    try {
      const balance = await getCustomerBalance(customer.id);
      
      // Apply filters
      if (filters?.hasBalance && balance.balance === 0) {
        continue;
      }
      if (filters?.minBalance !== undefined && balance.balance < filters.minBalance) {
        continue;
      }
      if (filters?.maxBalance !== undefined && balance.balance > filters.maxBalance) {
        continue;
      }

      balances.push(balance);
    } catch (error) {
      console.error(`Error calculating balance for customer ${customer.id}:`, error);
    }
  }

  // Sort by balance (highest debt first)
  return balances.sort((a, b) => b.balance - a.balance);
}

/**
 * Get account statement for a customer
 */
export async function getCustomerStatement(
  customerId: number,
  periodStart: Date,
  periodEnd: Date
): Promise<AccountStatement> {
  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true
    }
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  // Get opening balance (before period start)
  const invoicesBefore = await prisma.invoice.findMany({
    where: {
      customerId,
      invoiceDate: { lt: periodStart }
    },
    include: {
      payments: {
        where: {
          paymentDate: { lt: periodStart }
        }
      }
    }
  });

  let openingBalance = 0;
  for (const invoice of invoicesBefore) {
    openingBalance += invoice.grandTotal;
    const paidBefore = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    openingBalance -= paidBefore;
  }

  // Get transactions in period
  const invoices = await prisma.invoice.findMany({
    where: {
      customerId,
      invoiceDate: { gte: periodStart, lte: periodEnd }
    },
    include: {
      payments: true
    },
    orderBy: { invoiceDate: 'asc' }
  });

  const transactions: AccountTransaction[] = [];
  let runningBalance = openingBalance;
  let totalDebit = 0;
  let totalCredit = 0;

  // Add invoice transactions
  for (const invoice of invoices) {
    const debit = invoice.grandTotal;
    runningBalance += debit;
    totalDebit += debit;

    transactions.push({
      id: invoice.id,
      date: invoice.invoiceDate,
      type: 'invoice',
      referenceNumber: invoice.invoiceNumber || `INV-${invoice.id}`,
      description: `Fatura - Sipariş #${invoice.orderId}`,
      debit,
      credit: 0,
      balance: runningBalance
    });

    // Add payment transactions
    for (const payment of invoice.payments) {
      if (payment.paymentDate >= periodStart && payment.paymentDate <= periodEnd) {
        const credit = payment.amount;
        runningBalance -= credit;
        totalCredit += credit;

        transactions.push({
          id: payment.id,
          date: payment.paymentDate,
          type: 'payment',
          referenceNumber: payment.transactionId || `PAY-${payment.id}`,
          description: `Ödeme - ${payment.paymentMethod}`,
          debit: 0,
          credit,
          balance: runningBalance
        });
      }
    }
  }

  // Sort by date
  transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    customer: {
      id: customer.id,
      name: customer.name || 'Unknown',
      email: customer.email || undefined,
      phone: customer.phone || undefined,
      address: customer.address || undefined
    },
    periodStart,
    periodEnd,
    openingBalance,
    closingBalance: runningBalance,
    totalDebit,
    totalCredit,
    transactions
  };
}

/**
 * Get aging report for a customer
 */
export async function getCustomerAgingReport(customerId: number): Promise<AgingReport> {
  const now = new Date();
  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    select: { id: true, name: true }
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      customerId,
      status: { not: 'paid' }
    },
    include: {
      payments: true
    }
  });

  let current = 0;
  let days30to60 = 0;
  let days60to90 = 0;
  let over90 = 0;

  for (const invoice of invoices) {
    const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = invoice.grandTotal - paidAmount;

    if (outstanding <= 0) continue;

    const daysOverdue = Math.floor(
      (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysOverdue < 0 || daysOverdue <= 30) {
      current += outstanding;
    } else if (daysOverdue <= 60) {
      days30to60 += outstanding;
    } else if (daysOverdue <= 90) {
      days60to90 += outstanding;
    } else {
      over90 += outstanding;
    }
  }

  const totalOverdue = days30to60 + days60to90 + over90;

  return {
    customerId,
    customerName: customer.name || 'Unknown',
    current,
    days30to60,
    days60to90,
    over90,
    totalOverdue
  };
}

/**
 * Get aging report for all customers
 */
export async function getAllAgingReports(): Promise<AgingReport[]> {
  const customers = await prisma.user.findMany({
    where: {
      role: 'USER'
    },
    select: {
      id: true,
      name: true
    }
  });

  const reports: AgingReport[] = [];

  for (const customer of customers) {
    try {
      const report = await getCustomerAgingReport(customer.id);
      
      // Only include customers with outstanding balances
      const total = report.current + report.days30to60 + report.days60to90 + report.over90;
      if (total > 0) {
        reports.push(report);
      }
    } catch (error) {
      console.error(`Error generating aging report for customer ${customer.id}:`, error);
    }
  }

  // Sort by total overdue (highest first)
  return reports.sort((a, b) => {
    const totalA = a.current + a.days30to60 + a.days60to90 + a.over90;
    const totalB = b.current + b.days30to60 + b.days60to90 + b.over90;
    return totalB - totalA;
  });
}

/**
 * Get transaction history for a customer
 */
export async function getCustomerTransactionHistory(
  customerId: number,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<{ transactions: AccountTransaction[]; total: number }> {
  const whereClause: any = { customerId };

  if (options?.startDate || options?.endDate) {
    whereClause.invoiceDate = {};
    if (options.startDate) whereClause.invoiceDate.gte = options.startDate;
    if (options.endDate) whereClause.invoiceDate.lte = options.endDate;
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where: whereClause,
      include: {
        payments: true
      },
      orderBy: { invoiceDate: 'desc' },
      take: options?.limit,
      skip: options?.offset
    }),
    prisma.invoice.count({ where: whereClause })
  ]);

  const transactions: AccountTransaction[] = [];
  let runningBalance = 0;

  for (const invoice of invoices) {
    const debit = invoice.grandTotal;
    runningBalance += debit;

    transactions.push({
      id: invoice.id,
      date: invoice.invoiceDate,
      type: 'invoice',
      referenceNumber: invoice.invoiceNumber || `INV-${invoice.id}`,
      description: `Fatura - Sipariş #${invoice.orderId}`,
      debit,
      credit: 0,
      balance: runningBalance
    });

    // Add payments
    for (const payment of invoice.payments) {
      const credit = payment.amount;
      runningBalance -= credit;

      transactions.push({
        id: payment.id,
        date: payment.paymentDate,
        type: 'payment',
        referenceNumber: payment.transactionId || `PAY-${payment.id}`,
        description: `Ödeme - ${payment.paymentMethod}`,
        debit: 0,
        credit,
        balance: runningBalance
      });
    }
  }

  return { transactions, total };
}
