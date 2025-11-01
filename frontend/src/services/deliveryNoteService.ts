import api from './api';

export interface DeliveryNoteItem {
  equipmentId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate?: number;
  unit?: string;
}

export interface CreateDeliveryNoteDTO {
  deliveryType: 'sevk' | 'tahsilat';
  orderId?: number;
  customerId: number;
  companyId?: number;
  items: DeliveryNoteItem[];
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  fromAddress?: string;
  toAddress?: string;
  notes?: string;
}

export interface DeliveryNote {
  id: number;
  deliveryNumber: string;
  deliveryDate: string;
  deliveryType: string;
  orderId?: number;
  customerId: number;
  status: string;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  fromAddress?: string;
  toAddress?: string;
  notes?: string;
  customer: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  order?: {
    id: number;
    orderNumber: string;
  };
  items: Array<{
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    unit: string;
    equipment?: {
      id: number;
      name: string;
      code?: string;
    };
  }>;
  invoice?: {
    id: number;
    invoiceNumber: string;
    invoiceDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const deliveryNoteService = {
  // Get all delivery notes
  async getAll(params?: {
    customerId?: number;
    orderId?: number;
    status?: string;
    deliveryType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/delivery-notes', { params });
    return response.data;
  },

  // Get delivery note by ID
  async getById(id: number) {
    const response = await api.get(`/delivery-notes/${id}`);
    return response.data;
  },

  // Create delivery note
  async create(data: CreateDeliveryNoteDTO) {
    const response = await api.post('/delivery-notes', data);
    return response.data;
  },

  // Update delivery note
  async update(id: number, data: Partial<CreateDeliveryNoteDTO>) {
    const response = await api.patch(`/delivery-notes/${id}`, data);
    return response.data;
  },

  // Delete delivery note
  async delete(id: number) {
    const response = await api.delete(`/delivery-notes/${id}`);
    return response.data;
  },

  // Mark as delivered
  async markAsDelivered(id: number) {
    const response = await api.post(`/delivery-notes/${id}/deliver`);
    return response.data;
  },

  // Cancel delivery note
  async cancel(id: number) {
    const response = await api.post(`/delivery-notes/${id}/cancel`);
    return response.data;
  },

  // Convert to invoice
  async convertToInvoice(id: number, data?: {
    invoiceDate?: string;
    dueDate?: string;
    paymentMethod?: string;
    notes?: string;
  }) {
    const response = await api.post(`/delivery-notes/${id}/convert-to-invoice`, data);
    return response.data;
  },

  // Download PDF
  async downloadPDF(id: number) {
    const response = await api.get(`/delivery-notes/${id}/pdf`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `irsaliye-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Get statistics
  async getStatistics(params?: {
    customerId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get('/delivery-notes/statistics/summary', { params });
    return response.data;
  }
};
