import axios from 'axios'
import { API_BASE_URL } from '../config/api'

// Create axios instance with normalized API base URL (always ends with /api)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - 401/403 durumunda logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (data: { email: string; password: string; name: string; companyName: string }) =>
    api.post('/auth/register', data),
    
  getProfile: () => api.get('/auth/me'),
}

// Equipment API
export const equipmentAPI = {
  getAll: (filters?: { status?: string; category?: string; search?: string }) =>
    api.get('/equipment', { params: filters }),
    
  getById: (id: number) => api.get(`/equipment/${id}`),
  
  create: (data: any) => api.post('/equipment', data),
  
  update: (id: number, data: any) => api.put(`/equipment/${id}`, data),
  
  delete: (id: number) => api.delete(`/equipment/${id}`),
  
  getCategories: () => api.get('/equipment/categories/list'),
}

// Orders API (placeholder)
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  create: (data: any) => api.post('/orders', data),
}

// Inspections API
export const inspectionsAPI = {
  getAll: (filters?: { 
    inspectionType?: string; 
    status?: string; 
    search?: string; 
    dateFrom?: string; 
    dateTo?: string;
  }) => api.get('/inspections', { params: filters }),
  
  getById: (id: number) => api.get(`/inspections/${id}`),
  
  create: (data: any) => api.post('/inspections', data),
  
  update: (id: number, data: any) => api.put(`/inspections/${id}`, data),
  
  delete: (id: number) => api.delete(`/inspections/${id}`),
  
  getPDF: (id: number) => api.get(`/inspections/${id}/pdf`, { responseType: 'blob' }),
  
  addPhoto: (id: number, data: { photoUrl: string; photoType?: string; caption?: string }) =>
    api.post(`/inspections/${id}/photos`, data),
  
  deletePhoto: (id: number, photoId: number) => 
    api.delete(`/inspections/${id}/photos/${photoId}`),
  
  addDamage: (id: number, data: any) => 
    api.post(`/inspections/${id}/damages`, data),
  
  deleteDamage: (id: number, damageId: number) => 
    api.delete(`/inspections/${id}/damages/${damageId}`),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  
  getRevenue: () => api.get('/dashboard/revenue'),
  
  getOrders: (period?: 'daily' | 'weekly' | 'monthly') => 
    api.get('/dashboard/orders', { params: { period } }),
  
  getEquipmentUtilization: () => api.get('/dashboard/equipment'),
}

// Analytics API
export const analyticsAPI = {
  // Revenue data for date range
  getRevenue: (startDate: string, endDate: string) =>
    api.get('/analytics/revenue', { params: { startDate, endDate } }),
  
  // Equipment utilization data for date range
  getUtilization: (startDate: string, endDate: string) =>
    api.get('/analytics/utilization', { params: { startDate, endDate } }),
  
  // Order status distribution
  getStatus: () => api.get('/analytics/status'),
  
  // Top rented equipment
  getTopEquipment: (limit: number = 10) =>
    api.get('/analytics/top-equipment', { params: { limit } }),
}

// Scan API (QR/Barcode)
export const scanAPI = {
  // Find equipment by QR code or barcode
  findByCode: (code: string) => api.get(`/scan/${encodeURIComponent(code)}`),
  
  // Log a scan event
  logScan: (data: {
    scannedCode: string;
    scanAction?: 'VIEW' | 'CHECKIN' | 'CHECKOUT' | 'INVENTORY_CHECK';
    scannedBy?: string;
    location?: string;
    deviceInfo?: string;
    notes?: string;
    companyId?: number;
  }) => api.post('/scan', data),
  
  // Get scan history for equipment
  getHistory: (equipmentId: number, params?: { limit?: number; offset?: number }) =>
    api.get(`/scan/equipment/${equipmentId}/history`, { params }),
  
  // Generate QR/Barcode for equipment
  generateCodes: (equipmentId: number) =>
    api.post('/scan/generate-codes', { equipmentId }),
  
  // Generate codes for multiple equipment
  generateBatch: (equipmentIds: number[]) =>
    api.post('/scan/generate-batch', { equipmentIds }),
  
  // Get scan statistics
  getStats: (params?: {
    startDate?: string;
    endDate?: string;
    equipmentId?: number;
    companyId?: number;
  }) => api.get('/scan/stats', { params }),
}

// Notification API
export const notificationAPI = {
  // Create and send a notification
  create: (data: any) => api.post('/notifications', data),
  
  // Create from template
  createFromTemplate: (templateCode: string, variables: any, recipient: any, sendNow?: boolean) =>
    api.post('/notifications/template', { templateCode, variables, recipient, sendNow }),
  
  // Send a specific notification
  send: (notificationId: number) => api.post(`/notifications/${notificationId}/send`),
  
  // Get user notifications
  getUserNotifications: (userId: number, params?: { limit?: number; offset?: number; unreadOnly?: boolean }) =>
    api.get(`/notifications/user/${userId}`, { params }),
  
  // Get unread count
  getUnread: (userId: number) => api.get(`/notifications/unread/${userId}`),
  
  // Mark as read
  markAsRead: (notificationId: number) => api.put(`/notifications/${notificationId}/read`),
  
  // Mark all as read
  markAllAsRead: (userId: number) => api.put(`/notifications/user/${userId}/read-all`),
  
  // Get notification history
  getHistory: (params?: any) => api.get('/notifications/history', { params }),
  
  // Get templates
  getTemplates: (params?: { category?: string; type?: string; isActive?: boolean }) =>
    api.get('/notifications/templates', { params }),
  
  // Create template
  createTemplate: (data: any) => api.post('/notifications/templates', data),
  
  // Update template
  updateTemplate: (templateId: number, data: any) =>
    api.put(`/notifications/templates/${templateId}`, data),
  
  // Get user preferences
  getPreferences: (userId: number) => api.get(`/notifications/preferences/${userId}`),
  
  // Update user preferences
  updatePreferences: (userId: number, data: any) =>
    api.put(`/notifications/preferences/${userId}`, data),
  
  // Get statistics
  getStats: (params?: any) => api.get('/notifications/stats', { params }),
  
  // Process scheduled notifications
  processScheduled: () => api.post('/notifications/process-scheduled'),
  
  // Retry failed notifications
  retryFailed: () => api.post('/notifications/retry-failed'),
}

// Health check
export const healthCheck = () => api.get('/health')

// Pricing API
export const pricingAPI = {
  // Calculate rental price
  calculatePrice: async (params: {
    equipmentId: number;
    startDate: string;
    endDate: string;
    quantity?: number;
    promoCode?: string;
  }) => {
    const response = await api.post('/pricing/calculate', params);
    return response.data;
  },

  // Pricing Rules
  getRules: async (equipmentId: number) => {
    const response = await api.get(`/pricing/rules/${equipmentId}`);
    return response.data;
  },

  createRule: async (ruleData: any) => {
    const response = await api.post('/pricing/rules', ruleData);
    return response.data;
  },

  updateRule: async (id: number, ruleData: any) => {
    const response = await api.put(`/pricing/rules/${id}`, ruleData);
    return response.data;
  },

  deleteRule: async (id: number) => {
    const response = await api.delete(`/pricing/rules/${id}`);
    return response.data;
  },

  // Discount Codes
  getDiscounts: async (params?: { isActive?: boolean; validNow?: boolean }) => {
    const response = await api.get('/pricing/discounts', { params });
    return response.data;
  },

  createDiscount: async (discountData: any) => {
    const response = await api.post('/pricing/discounts', discountData);
    return response.data;
  },

  validateDiscount: async (code: string) => {
    const response = await api.post('/pricing/discounts/validate', { code });
    return response.data;
  },

  // Bundles
  getBundles: async (params?: { isActive?: boolean; category?: string }) => {
    const response = await api.get('/pricing/bundles', { params });
    return response.data;
  },

  getBundle: async (id: number) => {
    const response = await api.get(`/pricing/bundles/${id}`);
    return response.data;
  },

  createBundle: async (bundleData: any) => {
    const response = await api.post('/pricing/bundles', bundleData);
    return response.data;
  },

  updateBundle: async (id: number, bundleData: any) => {
    const response = await api.put(`/pricing/bundles/${id}`, bundleData);
    return response.data;
  },

  deleteBundle: async (id: number) => {
    const response = await api.delete(`/pricing/bundles/${id}`);
    return response.data;
  },

  // Price History
  getPriceHistory: async (equipmentId: number, limit?: number) => {
    const response = await api.get(`/pricing/history/${equipmentId}`, {
      params: { limit },
    });
    return response.data;
  },

  recordPriceChange: async (data: {
    equipmentId: number;
    oldPrices: any;
    newPrices: any;
    reason?: string;
    changedBy?: string;
  }) => {
    const response = await api.post('/pricing/history', data);
    return response.data;
  },

  // Statistics
  getStats: async (companyId?: number) => {
    const response = await api.get('/pricing/stats', {
      params: { companyId },
    });
    return response.data;
  },
};

// Reservation API
export const reservationAPI = {
  // Availability
  checkAvailability: async (params: {
    equipmentId: number;
    startDate: string;
    endDate: string;
    quantity?: number;
    excludeReservationId?: number;
  }) => {
    const response = await api.post('/reservations/check-availability', params);
    return response.data;
  },

  checkBulkAvailability: async (params: {
    items: { equipmentId: number; quantity: number }[];
    startDate: string;
    endDate: string;
    excludeReservationId?: number;
  }) => {
    const response = await api.post('/reservations/check-bulk-availability', params);
    return response.data;
  },

  // Pricing
  calculatePrice: async (params: {
    companyId: number;
    items: { equipmentId: number; quantity: number }[];
    startDate: string;
    endDate: string;
    discountCode?: string;
  }) => {
    const response = await api.post('/reservations/calculate-price', params);
    return response.data;
  },

  // CRUD
  create: async (data: {
    companyId: number;
    customerId?: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    items: { equipmentId: number; quantity: number }[];
    startDate: string;
    endDate: string;
    pickupTime?: string;
    returnTime?: string;
    pickupLocation?: string;
    returnLocation?: string;
    deliveryRequired?: boolean;
    deliveryAddress?: string;
    deliveryFee?: number;
    discountCode?: string;
    notes?: string;
    specialRequests?: string;
    createdBy?: number;
    autoApprove?: boolean;
  }) => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  getAll: async (params?: {
    companyId: number;
    customerId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/reservations', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/reservations/${id}`, data);
    return response.data;
  },

  // Status management
  updateStatus: async (id: number, params: {
    status: string;
    userId?: number;
    reason?: string;
    notes?: string;
  }) => {
    const response = await api.post(`/reservations/${id}/status`, params);
    return response.data;
  },

  approve: async (id: number, userId?: number, notes?: string) => {
    const response = await api.post(`/reservations/${id}/approve`, { userId, notes });
    return response.data;
  },

  reject: async (id: number, reason: string, userId?: number) => {
    const response = await api.post(`/reservations/${id}/reject`, { reason, userId });
    return response.data;
  },

  cancel: async (id: number, reason?: string, userId?: number) => {
    const response = await api.post(`/reservations/${id}/cancel`, { reason, userId });
    return response.data;
  },

  // Payments
  recordPayment: async (id: number, data: {
    amount: number;
    paymentType: string;
    paymentMethod: string;
    transactionId?: string;
    cardLastFour?: string;
    cardBrand?: string;
    transferRef?: string;
    bankName?: string;
    paidBy?: string;
    receivedBy?: number;
    receiptNumber?: string;
    notes?: string;
  }) => {
    const response = await api.post(`/reservations/${id}/payments`, data);
    return response.data;
  },

  getPayments: async (id: number) => {
    const response = await api.get(`/reservations/${id}/payments`);
    return response.data;
  },

  // Statistics
  getStats: async (params: {
    companyId: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/reservations/stats/summary', { params });
    return response.data;
  },

  // Timeline
  getTimeline: async (params: {
    companyId: number;
    startDate?: string;
    endDate?: string;
    equipmentIds?: number[];
    status?: string;
  }) => {
    const response = await api.get('/reservations/timeline', { params });
    return response.data;
  },
};

// Report API
export const reportAPI = {
  // Dashboard
  getDashboard: async (params: {
    companyId: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/reports/dashboard', { params });
    return response.data;
  },

  // Revenue Report
  getRevenue: async (params: {
    companyId: number;
    startDate: string;
    endDate: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    const response = await api.get('/reports/revenue', { params });
    return response.data;
  },

  // Equipment Report
  getEquipment: async (params: {
    companyId: number;
    startDate: string;
    endDate: string;
    equipmentId?: number;
  }) => {
    const response = await api.get('/reports/equipment', { params });
    return response.data;
  },

  // Customer Report
  getCustomers: async (params: {
    companyId: number;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.get('/reports/customers', { params });
    return response.data;
  },

  // Category Report
  getCategories: async (params: {
    companyId: number;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.get('/reports/categories', { params });
    return response.data;
  },
};

// Accounting API
export const accountingAPI = {
  // Dashboard Quick Stats
  getStats: (params?: { startDate?: string; endDate?: string }) => 
    api.get('/accounting/stats', { params }),
  
  // Income-Expense Analysis
  getIncomeExpenseAnalysis: (params: { 
    startDate: string; 
    endDate: string; 
    groupBy?: 'day' | 'week' | 'month' 
  }) => api.get('/accounting/income-expense', { params }),
  
  // Cari Account Summary
  getCariSummary: () => api.get('/accounting/cari'),
  
  // Cash Management
  getCashSummary: () => api.get('/accounting/cash'),
  
  // VAT Report
  getVATReport: (params: { startDate: string; endDate: string }) => 
    api.get('/accounting/vat-report', { params }),
  
  // Income CRUD
  getIncomes: (params?: { 
    category?: string; 
    status?: string; 
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => api.get('/accounting/incomes', { params }),
  
  recordIncome: (data: any) => api.post('/accounting/income', data),
  
  updateIncome: (id: number, data: any) => api.put(`/accounting/income/${id}`, data),
  
  deleteIncome: (id: number) => api.delete(`/accounting/income/${id}`),
  
  // Expense CRUD
  getExpenses: (params?: { 
    category?: string; 
    status?: string; 
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => api.get('/accounting/expenses', { params }),
  
  recordExpense: (data: any) => api.post('/accounting/expense', data),
  
  updateExpense: (id: number, data: any) => api.put(`/accounting/expense/${id}`, data),
  
  deleteExpense: (id: number) => api.delete(`/accounting/expense/${id}`),
};

// Invoice API
export const invoiceAPI = {
  // List all invoices (TODO: Will be implemented in Phase 2)
  getAll: (params?: { 
    status?: string; 
    type?: string; 
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/invoices', { params }),
  
  // Get invoice by ID
  getById: (id: number) => api.get(`/invoices/${id}`),
  
  // Get customer invoices
  getCustomerInvoices: (customerId: number, params?: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get(`/invoices/customer/${customerId}`, { params }),
  
  // Create rental invoice
  createRental: (data: {
    orderId: number;
    customerId: number;
    items: Array<{
      equipmentId: number;
      description: string;
      quantity: number;
      unitPrice: number;
      days: number;
      discountPercentage?: number;
    }>;
    startDate: string;
    endDate: string;
    notes?: string;
  }) => api.post('/invoices/rental', data),
  
  // Record payment
  recordPayment: (invoiceId: number, data: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
  }) => api.post(`/invoices/${invoiceId}/payment`, data),
  
  // Create late fee invoice
  createLateFee: (data: {
    orderId: number;
    lateDays: number;
    dailyFee: number;
    notes?: string;
  }) => api.post('/invoices/late-fee', data),
  
  // Create deposit refund
  createDepositRefund: (data: {
    orderId: number;
    depositAmount: number;
    notes?: string;
  }) => api.post('/invoices/deposit-refund', data),
  
  // Cancel invoice
  cancel: (id: number, reason: string) => 
    api.delete(`/invoices/${id}`, { data: { reason } }),
  
  // Create payment plan
  createPaymentPlan: (data: {
    orderId: number;
    totalAmount: number;
    installments: number;
    startDate: string;
  }) => api.post('/invoices/payment-plan', data),
};

// Offer API
export const offerAPI = {
  // List all offers
  getAll: (params?: {
    status?: string;
    customerId?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => api.get('/offers', { params }),
  
  // Get offer by ID
  getById: (id: number) => api.get(`/offers/${id}`),
  
  // Get offer stats
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/offers/stats', { params }),
  
  // Create offer
  create: (data: {
    customerId: number;
    items: Array<{
      equipmentId: number;
      description: string;
      quantity: number;
      unitPrice: number;
      days: number;
      discountPercentage?: number;
    }>;
    validityDays?: number;
    notes?: string;
  }) => api.post('/offers', data),
  
  // Update offer
  update: (id: number, data: {
    items?: Array<{
      equipmentId: number;
      description: string;
      quantity: number;
      unitPrice: number;
      days: number;
      discountPercentage?: number;
    }>;
    validUntil?: string;
    status?: string;
    notes?: string;
  }) => api.put(`/offers/${id}`, data),
  
  // Delete offer
  delete: (id: number) => api.delete(`/offers/${id}`),
  
  // Convert offer to invoice
  convertToInvoice: (id: number, data: {
    orderId: number;
    startDate: string;
    endDate: string;
    notes?: string;
  }) => api.post(`/offers/${id}/convert-to-invoice`, data),
  
  // Update offer status
  updateStatus: (id: number, status: string) =>
    api.patch(`/offers/${id}/status`, { status }),
};

export default api