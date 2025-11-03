import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Reminder {
  id: number;
  companyId: number;
  userId: number;
  title: string;
  description?: string;
  type: 'payment' | 'invoice' | 'due_date' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  reminderDate: string;
  dueDate?: string;
  sentAt?: string;
  completedAt?: string;
  invoiceId?: number;
  customerId?: number;
  sendEmail: boolean;
  sendSms: boolean;
  sendPush: boolean;
  isRecurring: boolean;
  recurrence?: string;
  recurrenceEnd?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  invoice?: {
    id: number;
    invoiceNumber: string;
    totalAmount: number;
  };
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface CreateReminderDTO {
  title: string;
  description?: string;
  type?: 'payment' | 'invoice' | 'due_date' | 'custom';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  reminderDate: string;
  dueDate?: string;
  invoiceId?: number;
  customerId?: number;
  sendEmail?: boolean;
  sendSms?: boolean;
  sendPush?: boolean;
  isRecurring?: boolean;
  recurrence?: string;
  recurrenceEnd?: string;
}

export interface ReminderStats {
  total: number;
  pending: number;
  upcoming: number;
  overdue: number;
  completed: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const reminderAPI = {
  // Get all reminders with optional filters
  getAll: async (filters?: {
    status?: string;
    type?: string;
    priority?: string;
  }): Promise<Reminder[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.priority) params.append('priority', filters.priority);
    
    const response = await axios.get(
      `${API_URL}/api/reminders?${params.toString()}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Get upcoming reminders (next 7 days)
  getUpcoming: async (): Promise<Reminder[]> => {
    const response = await axios.get(
      `${API_URL}/api/reminders/upcoming`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Get overdue reminders
  getOverdue: async (): Promise<Reminder[]> => {
    const response = await axios.get(
      `${API_URL}/api/reminders/overdue`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Get single reminder
  getById: async (id: number): Promise<Reminder> => {
    const response = await axios.get(
      `${API_URL}/api/reminders/${id}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Create reminder
  create: async (data: CreateReminderDTO): Promise<Reminder> => {
    const response = await axios.post(
      `${API_URL}/api/reminders`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // Update reminder
  update: async (id: number, data: Partial<CreateReminderDTO>): Promise<Reminder> => {
    const response = await axios.put(
      `${API_URL}/api/reminders/${id}`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // Mark as sent
  markAsSent: async (id: number): Promise<Reminder> => {
    const response = await axios.post(
      `${API_URL}/api/reminders/${id}/sent`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Mark as completed
  markAsCompleted: async (id: number): Promise<Reminder> => {
    const response = await axios.post(
      `${API_URL}/api/reminders/${id}/complete`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Cancel reminder
  cancel: async (id: number): Promise<Reminder> => {
    const response = await axios.post(
      `${API_URL}/api/reminders/${id}/cancel`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Delete reminder
  delete: async (id: number): Promise<void> => {
    await axios.delete(
      `${API_URL}/api/reminders/${id}`,
      getAuthHeaders()
    );
  },

  // Get stats
  getStats: async (): Promise<ReminderStats> => {
    const response = await axios.get(
      `${API_URL}/api/reminders/stats/summary`,
      getAuthHeaders()
    );
    return response.data;
  },
};
