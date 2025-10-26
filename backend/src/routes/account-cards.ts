import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();
const prisma = new PrismaClient();

interface AccountTransaction {
  id: string;
  date: Date;
  type: 'income' | 'expense' | 'check_received' | 'check_issued' | 'note_received' | 'note_issued' | 'check_cashed' | 'note_collected';
  description: string;
  debit: number;  // Borç (customer owes us)
  credit: number; // Alacak (we owe supplier)
  balance: number;
  reference?: string;
  status?: string;
}

/**
 * GET /api/account-cards/customer/:customerId
 * Get customer account card (cari hesap kartı)
 */
router.get('/customer/:customerId', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const customerId = parseInt(req.params.customerId);
    const { startDate, endDate } = req.query;

    // Get customer info
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const transactions: AccountTransaction[] = [];

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) {
      const endDateTime = new Date(endDate as string);
      endDateTime.setHours(23, 59, 59, 999);
      dateFilter.lte = endDateTime;
    }

    // Get all incomes from this customer
    const incomes = await prisma.income.findMany({
      where: {
        companyId,
        customerId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'asc' },
    });

    incomes.forEach((income) => {
      transactions.push({
        id: `income-${income.id}`,
        date: new Date(income.date),
        type: 'income',
        description: income.description,
        debit: income.amount, // Customer owes us
        credit: 0,
        balance: 0, // Will calculate later
        reference: `GEL-${income.id}`,
        status: income.status,
      });
    });

    // Get received checks from this customer
    const checksReceived = await prisma.check.findMany({
      where: {
        companyId,
        customerId,
        type: 'received',
        ...(Object.keys(dateFilter).length > 0 ? { dueDate: dateFilter } : {}),
      },
      orderBy: { dueDate: 'asc' },
    });

    checksReceived.forEach((check) => {
      transactions.push({
        id: `check-${check.id}`,
        date: new Date(check.dueDate),
        type: 'check_received',
        description: `Çek - ${check.checkNumber} - ${check.bankName}`,
        debit: check.amount,
        credit: 0,
        balance: 0,
        reference: `ÇEK-${check.checkNumber}`,
        status: check.status,
      });

      // If check is cashed, add credit transaction
      if (check.status === 'cashed') {
        transactions.push({
          id: `check-cashed-${check.id}`,
          date: check.statusDate ? new Date(check.statusDate) : new Date(check.dueDate),
          type: 'check_cashed',
          description: `Çek Tahsil - ${check.checkNumber}`,
          debit: 0,
          credit: check.amount,
          balance: 0,
          reference: `ÇEK-${check.checkNumber}`,
          status: 'cashed',
        });
      }
    });

    // Get received promissory notes from this customer
    const notesReceived = await prisma.promissoryNote.findMany({
      where: {
        companyId,
        customerId,
        type: 'receivable',
        ...(Object.keys(dateFilter).length > 0 ? { dueDate: dateFilter } : {}),
      },
      orderBy: { dueDate: 'asc' },
    });

    notesReceived.forEach((note) => {
      transactions.push({
        id: `note-${note.id}`,
        date: new Date(note.dueDate),
        type: 'note_received',
        description: `Senet - ${note.noteNumber} - ${note.drawerName}`,
        debit: note.amount,
        credit: 0,
        balance: 0,
        reference: `SNT-${note.noteNumber}`,
        status: note.status,
      });

      // If note is collected, add credit transaction
      if (note.status === 'collected') {
        transactions.push({
          id: `note-collected-${note.id}`,
          date: note.statusDate ? new Date(note.statusDate) : new Date(note.dueDate),
          type: 'note_collected',
          description: `Senet Tahsil - ${note.noteNumber}`,
          debit: 0,
          credit: note.amount,
          balance: 0,
          reference: `SNT-${note.noteNumber}`,
          status: 'collected',
        });
      }
    });

    // Sort all transactions by date
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance
    let runningBalance = 0;
    transactions.forEach((transaction) => {
      runningBalance += transaction.debit - transaction.credit;
      transaction.balance = runningBalance;
    });

    // Calculate summary
    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
    const currentBalance = totalDebit - totalCredit;

    res.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          taxNumber: customer.taxNumber,
        },
        transactions,
        summary: {
          totalDebit,
          totalCredit,
          currentBalance,
          transactionCount: transactions.length,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get customer account card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer account card',
      error: error.message,
    });
  }
});

/**
 * GET /api/account-cards/supplier/:supplierId
 * Get supplier account card (cari hesap kartı)
 */
router.get('/supplier/:supplierId', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const supplierId = parseInt(req.params.supplierId);
    const { startDate, endDate } = req.query;

    // Get supplier info
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, companyId },
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const transactions: AccountTransaction[] = [];

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) {
      const endDateTime = new Date(endDate as string);
      endDateTime.setHours(23, 59, 59, 999);
      dateFilter.lte = endDateTime;
    }

    // Get all expenses to this supplier
    const expenses = await prisma.expense.findMany({
      where: {
        companyId,
        supplierId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'asc' },
    });

    expenses.forEach((expense) => {
      transactions.push({
        id: `expense-${expense.id}`,
        date: new Date(expense.date),
        type: 'expense',
        description: expense.description,
        debit: 0,
        credit: expense.amount, // We owe supplier
        balance: 0,
        reference: `GİD-${expense.id}`,
        status: expense.status,
      });
    });

    // Get issued checks to this supplier
    const checksIssued = await prisma.check.findMany({
      where: {
        companyId,
        supplierId,
        type: 'issued',
        ...(Object.keys(dateFilter).length > 0 ? { dueDate: dateFilter } : {}),
      },
      orderBy: { dueDate: 'asc' },
    });

    checksIssued.forEach((check) => {
      transactions.push({
        id: `check-${check.id}`,
        date: new Date(check.dueDate),
        type: 'check_issued',
        description: `Çek - ${check.checkNumber} - ${check.bankName}`,
        debit: 0,
        credit: check.amount,
        balance: 0,
        reference: `ÇEK-${check.checkNumber}`,
        status: check.status,
      });

      // If check is cashed, add debit transaction (payment made)
      if (check.status === 'cashed') {
        transactions.push({
          id: `check-cashed-${check.id}`,
          date: check.statusDate ? new Date(check.statusDate) : new Date(check.dueDate),
          type: 'check_cashed',
          description: `Çek Ödeme - ${check.checkNumber}`,
          debit: check.amount,
          credit: 0,
          balance: 0,
          reference: `ÇEK-${check.checkNumber}`,
          status: 'cashed',
        });
      }
    });

    // Get issued promissory notes to this supplier
    const notesIssued = await prisma.promissoryNote.findMany({
      where: {
        companyId,
        supplierId,
        type: 'payable',
        ...(Object.keys(dateFilter).length > 0 ? { dueDate: dateFilter } : {}),
      },
      orderBy: { dueDate: 'asc' },
    });

    notesIssued.forEach((note) => {
      transactions.push({
        id: `note-${note.id}`,
        date: new Date(note.dueDate),
        type: 'note_issued',
        description: `Senet - ${note.noteNumber} - ${note.drawerName}`,
        debit: 0,
        credit: note.amount,
        balance: 0,
        reference: `SNT-${note.noteNumber}`,
        status: note.status,
      });

      // If note is collected (paid), add debit transaction
      if (note.status === 'collected') {
        transactions.push({
          id: `note-collected-${note.id}`,
          date: note.statusDate ? new Date(note.statusDate) : new Date(note.dueDate),
          type: 'note_collected',
          description: `Senet Ödeme - ${note.noteNumber}`,
          debit: note.amount,
          credit: 0,
          balance: 0,
          reference: `SNT-${note.noteNumber}`,
          status: 'collected',
        });
      }
    });

    // Sort all transactions by date
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance (for supplier: credit - debit)
    let runningBalance = 0;
    transactions.forEach((transaction) => {
      runningBalance += transaction.credit - transaction.debit;
      transaction.balance = runningBalance;
    });

    // Calculate summary
    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
    const currentBalance = totalCredit - totalDebit; // We owe supplier

    res.json({
      success: true,
      data: {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          taxNumber: supplier.taxNumber,
        },
        transactions,
        summary: {
          totalDebit,
          totalCredit,
          currentBalance,
          transactionCount: transactions.length,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get supplier account card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supplier account card',
      error: error.message,
    });
  }
});

/**
 * GET /api/account-cards/summary
 * Get account cards summary for all customers and suppliers
 */
router.get('/summary', authenticateToken, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;

    // Get all customers with their balances
    const customers = await prisma.customer.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true, phone: true },
    });

    const customerBalances = await Promise.all(
      customers.map(async (customer) => {
        // Calculate total receivables (customer owes us)
        const incomes = await prisma.income.aggregate({
          where: { companyId, customerId: customer.id },
          _sum: { amount: true },
        });

        const checksReceived = await prisma.check.aggregate({
          where: { companyId, customerId: customer.id, type: 'received', status: { in: ['portfolio', 'deposited'] } },
          _sum: { amount: true },
        });

        const notesReceived = await prisma.promissoryNote.aggregate({
          where: { companyId, customerId: customer.id, type: 'receivable', status: 'portfolio' },
          _sum: { amount: true },
        });

        const totalReceivable =
          (incomes._sum.amount || 0) +
          (checksReceived._sum.amount || 0) +
          (notesReceived._sum.amount || 0);

        return {
          ...customer,
          balance: totalReceivable,
          type: 'customer' as const,
        };
      })
    );

    // Get all suppliers with their balances
    const suppliers = await prisma.supplier.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true, phone: true },
    });

    const supplierBalances = await Promise.all(
      suppliers.map(async (supplier) => {
        // Calculate total payables (we owe supplier)
        const expenses = await prisma.expense.aggregate({
          where: { companyId, supplierId: supplier.id },
          _sum: { amount: true },
        });

        const checksIssued = await prisma.check.aggregate({
          where: { companyId, supplierId: supplier.id, type: 'issued', status: { in: ['portfolio', 'deposited'] } },
          _sum: { amount: true },
        });

        const notesIssued = await prisma.promissoryNote.aggregate({
          where: { companyId, supplierId: supplier.id, type: 'payable', status: 'portfolio' },
          _sum: { amount: true },
        });

        const totalPayable =
          (expenses._sum.amount || 0) +
          (checksIssued._sum.amount || 0) +
          (notesIssued._sum.amount || 0);

        return {
          ...supplier,
          balance: totalPayable,
          type: 'supplier' as const,
        };
      })
    );

    // Calculate totals
    const totalReceivables = customerBalances.reduce((sum, c) => sum + c.balance, 0);
    const totalPayables = supplierBalances.reduce((sum, s) => sum + s.balance, 0);

    res.json({
      success: true,
      data: {
        customers: customerBalances.sort((a, b) => b.balance - a.balance),
        suppliers: supplierBalances.sort((a, b) => b.balance - a.balance),
        summary: {
          totalReceivables,
          totalPayables,
          netPosition: totalReceivables - totalPayables,
          customerCount: customers.length,
          supplierCount: suppliers.length,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get account cards summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get account cards summary',
      error: error.message,
    });
  }
});

export default router;
