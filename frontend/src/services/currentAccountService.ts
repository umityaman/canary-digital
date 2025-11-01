import api from './api';

export interface AccountBalance {
  customerId: number;
  customerName: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  lastTransactionDate: string | null;
}

export interface AccountTransaction {
  id: number;
  date: string;
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
  current: number;
  days30to60: number;
  days60to90: number;
  over90: number;
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
  periodStart: string;
  periodEnd: string;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  transactions: AccountTransaction[];
}

export interface AccountSummary {
  totalReceivables: number;
  totalPayables: number;
  netBalance: number;
  activeAccounts: number;
  totalAccounts: number;
  totalOverdue: number;
  overdueAccounts: number;
  agingSummary: {
    days30to60: number;
    days60to90: number;
    over90: number;
  };
}

const currentAccountService = {
  /**
   * Get all customer balances
   */
  async getAllBalances(filters?: {
    hasBalance?: boolean;
    minBalance?: number;
    maxBalance?: number;
  }): Promise<AccountBalance[]> {
    const params = new URLSearchParams();
    if (filters?.hasBalance) params.append('hasBalance', 'true');
    if (filters?.minBalance !== undefined) params.append('minBalance', filters.minBalance.toString());
    if (filters?.maxBalance !== undefined) params.append('maxBalance', filters.maxBalance.toString());

    const response = await api.get(`/current-accounts/balances?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Get balance for a specific customer
   */
  async getCustomerBalance(customerId: number): Promise<AccountBalance> {
    const response = await api.get(`/current-accounts/balances/${customerId}`);
    return response.data.data;
  },

  /**
   * Get account statement for a customer
   */
  async getCustomerStatement(
    customerId: number,
    startDate: string,
    endDate: string
  ): Promise<AccountStatement> {
    const response = await api.get(`/current-accounts/statement/${customerId}`, {
      params: { startDate, endDate }
    });
    return response.data.data;
  },

  /**
   * Get aging reports for all customers
   */
  async getAllAgingReports(): Promise<AgingReport[]> {
    const response = await api.get('/current-accounts/aging');
    return response.data.data;
  },

  /**
   * Get aging report for a specific customer
   */
  async getCustomerAgingReport(customerId: number): Promise<AgingReport> {
    const response = await api.get(`/current-accounts/aging/${customerId}`);
    return response.data.data;
  },

  /**
   * Get transaction history for a customer
   */
  async getCustomerTransactions(
    customerId: number,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ transactions: AccountTransaction[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const response = await api.get(`/current-accounts/transactions/${customerId}?${params.toString()}`);
    return {
      transactions: response.data.data,
      total: response.data.total
    };
  },

  /**
   * Get summary statistics
   */
  async getSummary(): Promise<AccountSummary> {
    const response = await api.get('/current-accounts/summary');
    return response.data.data;
  }
};

export default currentAccountService;
