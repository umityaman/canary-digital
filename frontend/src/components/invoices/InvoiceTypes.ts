// Invoice data types

export interface InvoiceData {
  // Invoice info
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  
  // Company info
  company: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    taxNumber: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
  };
  
  // Customer info
  customer: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    taxNumber?: string;
    phone: string;
    email: string;
  };
  
  // Items
  items: InvoiceItem[];
  
  // Totals
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount?: number;
  discountAmount?: number;
  total: number;
  
  // Payment info
  paymentMethod?: string;
  bankAccount?: string;
  iban?: string;
  
  // Notes
  notes?: string;
  terms?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export type InvoiceTemplate = 'modern' | 'classic' | 'minimal';

export interface InvoiceConfig {
  template: InvoiceTemplate;
  primaryColor: string;
  showLogo: boolean;
  showTax: boolean;
  currency: string;
  locale: string;
}
