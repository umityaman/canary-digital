import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateBankAccountParams {
  bankName: string;
  accountNumber: string;
  accountType: string;
  iban: string;
  branch?: string;
  branchCode?: string;
  currency?: string;
  balance?: number;
  notes?: string;
  companyId: number;
}

interface RecordTransactionParams {
  accountId: number;
  type: string;
  amount: number;
  description?: string;
  transactionType?: string;
  reference?: string;
  counterParty?: string;
  counterPartyIBAN?: string;
  category?: string;
  date: Date;
  valueDate?: Date;
  expenseId?: number;
  invoiceId?: number;
  notes?: string;
}

interface ReconciliationParams {
  accountId: number;
  periodStart: Date;
  periodEnd: Date;
  bankBalance: number;
  reconciledBy: number;
  notes?: string;
}

export class BankAccountService {
  /**
   * Create a new bank account
   */
  async createAccount(params: CreateBankAccountParams) {
    const account = await prisma.bankAccount.create({
      data: {
        bankName: params.bankName,
        accountNumber: params.accountNumber,
        accountType: params.accountType,
        iban: params.iban,
        branch: params.branch,
        branchCode: params.branchCode,
        currency: params.currency || 'TRY',
        balance: params.balance || 0,
        availableBalance: params.balance || 0,
        notes: params.notes,
        companyId: params.companyId
      }
    });

    return account;
  }

  /**
   * Record a transaction
   */
  async recordTransaction(params: RecordTransactionParams) {
    // Get account
    const account = await prisma.bankAccount.findUnique({
      where: { id: params.accountId }
    });

    if (!account) {
      throw new Error('Bank account not found');
    }

    const balanceBefore = account.balance;
    let balanceAfter = balanceBefore;

    // Calculate new balance based on transaction type
    if (params.type === 'deposit') {
      balanceAfter = balanceBefore + params.amount;
    } else if (params.type === 'withdrawal') {
      balanceAfter = balanceBefore - params.amount;
      if (balanceAfter < 0 && account.availableBalance < params.amount) {
        throw new Error('Insufficient funds');
      }
    }

    // Create transaction
    const transaction = await prisma.bankTransaction.create({
      data: {
        accountId: params.accountId,
        type: params.type,
        amount: params.amount,
        description: params.description,
        transactionType: params.transactionType,
        reference: params.reference,
        counterParty: params.counterParty,
        counterPartyIBAN: params.counterPartyIBAN,
        category: params.category,
        balanceBefore,
        balanceAfter,
        date: params.date,
        valueDate: params.valueDate || params.date,
        expenseId: params.expenseId,
        invoiceId: params.invoiceId,
        notes: params.notes,
        status: 'completed'
      },
      include: {
        account: true,
        expense: true,
        invoice: true
      }
    });

    // Update account balance
    await prisma.bankAccount.update({
      where: { id: params.accountId },
      data: {
        balance: balanceAfter,
        availableBalance: balanceAfter
      }
    });

    return transaction;
  }

  /**
   * Get account balance
   */
  async getBalance(accountId: number) {
    const account = await prisma.bankAccount.findUnique({
      where: { id: accountId },
      select: {
        balance: true,
        availableBalance: true,
        blockedBalance: true,
        currency: true
      }
    });

    if (!account) {
      throw new Error('Bank account not found');
    }

    return account;
  }

  /**
   * Get transaction history
   */
  async getTransactions(accountId: number, options?: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { accountId };

    if (options?.startDate || options?.endDate) {
      where.date = {};
      if (options.startDate) where.date.gte = options.startDate;
      if (options.endDate) where.date.lte = options.endDate;
    }

    if (options?.type) {
      where.type = options.type;
    }

    if (options?.status) {
      where.status = options.status;
    }

    const transactions = await prisma.bankTransaction.findMany({
      where,
      include: {
        account: {
          select: {
            bankName: true,
            accountNumber: true,
            iban: true
          }
        },
        expense: {
          select: {
            id: true,
            description: true,
            category: true
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0
    });

    return transactions;
  }

  /**
   * Reconcile transaction
   */
  async reconcileTransaction(transactionId: number, userId: number) {
    const transaction = await prisma.bankTransaction.update({
      where: { id: transactionId },
      data: {
        isReconciled: true,
        reconciledAt: new Date(),
        reconciledBy: userId
      }
    });

    return transaction;
  }

  /**
   * Bulk reconcile transactions
   */
  async bulkReconcile(transactionIds: number[], userId: number) {
    const result = await prisma.bankTransaction.updateMany({
      where: {
        id: { in: transactionIds }
      },
      data: {
        isReconciled: true,
        reconciledAt: new Date(),
        reconciledBy: userId
      }
    });

    return result;
  }

  /**
   * Create reconciliation
   */
  async createReconciliation(params: ReconciliationParams) {
    // Get unreconciled transactions in period
    const transactions = await prisma.bankTransaction.findMany({
      where: {
        accountId: params.accountId,
        date: {
          gte: params.periodStart,
          lte: params.periodEnd
        }
      }
    });

    // Calculate book balance
    const bookBalance = transactions.reduce((sum, txn) => {
      if (txn.type === 'deposit') {
        return sum + txn.amount;
      } else {
        return sum - txn.amount;
      }
    }, 0);

    const unreconciledCount = transactions.filter(t => !t.isReconciled).length;
    const reconciledCount = transactions.filter(t => t.isReconciled).length;
    const difference = params.bankBalance - bookBalance;

    // Generate reconciliation number
    const reconciliationNumber = `REC-${Date.now()}`;

    const reconciliation = await prisma.bankReconciliation.create({
      data: {
        accountId: params.accountId,
        reconciliationNumber,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        bookBalance,
        bankBalance: params.bankBalance,
        difference,
        reconciledBy: params.reconciledBy,
        unreconciledCount,
        reconciledCount,
        notes: params.notes,
        status: Math.abs(difference) < 0.01 ? 'completed' : 'in_progress'
      },
      include: {
        account: true,
        reconciledByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update account last reconciled date
    await prisma.bankAccount.update({
      where: { id: params.accountId },
      data: {
        lastReconciled: new Date()
      }
    });

    return reconciliation;
  }

  /**
   * Get unreconciled transactions
   */
  async getUnreconciledTransactions(accountId: number, options?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {
      accountId,
      isReconciled: false
    };

    if (options?.startDate || options?.endDate) {
      where.date = {};
      if (options.startDate) where.date.gte = options.startDate;
      if (options.endDate) where.date.lte = options.endDate;
    }

    return prisma.bankTransaction.findMany({
      where,
      include: {
        expense: true,
        invoice: true
      },
      orderBy: { date: 'desc' }
    });
  }

  /**
   * Get account summary
   */
  async getAccountSummary(companyId: number) {
    const accounts = await prisma.bankAccount.findMany({
      where: { companyId, isActive: true },
      include: {
        transactions: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
          }
        }
      }
    });

    const summary = accounts.map(account => {
      const deposits = account.transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);

      const withdrawals = account.transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);

      const unreconciledCount = account.transactions.filter(t => !t.isReconciled).length;

      return {
        ...account,
        recentDeposits: deposits,
        recentWithdrawals: withdrawals,
        unreconciledCount,
        transactionCount: account.transactions.length
      };
    });

    return summary;
  }

  /**
   * Upload bank statement
   */
  async uploadStatement(params: {
    accountId: number;
    statementNumber: string;
    periodStart: Date;
    periodEnd: Date;
    openingBalance: number;
    closingBalance: number;
    fileName?: string;
    fileUrl?: string;
    uploadedBy: number;
  }) {
    const statement = await prisma.bankStatement.create({
      data: {
        ...params,
        uploadedAt: new Date(),
        status: 'completed'
      },
      include: {
        account: true,
        uploadedByUser: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update account last statement date
    await prisma.bankAccount.update({
      where: { id: params.accountId },
      data: {
        lastStatementDate: params.periodEnd
      }
    });

    return statement;
  }
}

export default new BankAccountService();
