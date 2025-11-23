import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://canary-backend-672344972017.europe-west1.run.app';

export interface StatementFilters {
  customerId: number;
  startDate: string;
  endDate: string;
  includePayments?: boolean;
  includeInvoices?: boolean;
  includeOrders?: boolean;
}

export interface StatementData {
  customer: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  period: {
    start: string;
    end: string;
  };
  summary: {
    openingBalance: number;
    totalInvoices: number;
    totalPayments: number;
    closingBalance: number;
  };
  transactions: Array<{
    date: string;
    type: 'invoice' | 'payment' | 'order';
    description: string;
    reference?: string;
    debit: number;
    credit: number;
    balance: number;
  }>;
}

export interface ShareStatementRequest {
  customerId: number;
  startDate: string;
  endDate: string;
  format: 'pdf' | 'excel';
  sendEmail?: boolean;
  sendWhatsApp?: boolean;
  message?: string;
  includePayments?: boolean;
  includeInvoices?: boolean;
  includeOrders?: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const statementAPI = {
  // Generate statement data
  generate: async (filters: StatementFilters): Promise<StatementData> => {
    const response = await axios.post(
      `${API_URL}/api/statements/generate`,
      filters,
      getAuthHeaders()
    );
    return response.data;
  },

  // Download statement as PDF
  downloadPDF: async (filters: StatementFilters): Promise<Blob> => {
    const response = await axios.post(
      `${API_URL}/api/statements/pdf`,
      filters,
      {
        ...getAuthHeaders(),
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // Download statement as Excel
  downloadExcel: async (filters: StatementFilters): Promise<Blob> => {
    const response = await axios.post(
      `${API_URL}/api/statements/excel`,
      filters,
      {
        ...getAuthHeaders(),
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // Share statement via email/WhatsApp
  share: async (data: ShareStatementRequest): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(
      `${API_URL}/api/statements/share`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // Get share history
  getHistory: async (): Promise<Array<{
    id: number;
    customerId: number;
    customerName: string;
    startDate: string;
    endDate: string;
    format: string;
    sentVia: string;
    sentAt: string;
  }>> => {
    const response = await axios.get(
      `${API_URL}/api/statements/history`,
      getAuthHeaders()
    );
    return response.data;
  },
};
