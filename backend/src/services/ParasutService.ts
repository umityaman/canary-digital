import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../database';

export interface ParasutConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  companyId: string;
  baseUrl: string;
}

export interface ParasutTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

export interface ParasutContact {
  id?: number;
  type: 'person' | 'company';
  name: string;
  email?: string;
  tax_number?: string;
  tax_office?: string;
  contact_type: 'customer' | 'supplier';
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  iban?: string;
}

export interface ParasutInvoice {
  id?: number;
  issue_date: string;
  due_date: string;
  invoice_no?: string;
  contact_id: number;
  currency: string;
  exchange_rate?: number;
  withholding_rate?: number;
  vat_withholding_rate?: number;
  invoice_discount_type?: 'percentage' | 'amount';
  invoice_discount?: number;
  billing_address?: string;
  billing_phone?: string;
  billing_fax?: string;
  tax_office?: string;
  tax_number?: string;
  city?: string;
  district?: string;
  is_abroad?: boolean;
  order_no?: string;
  order_date?: string;
  shipment_addres?: string;
  shipment_included?: boolean;
  cash_sale?: boolean;
  payment_status?: 'paid' | 'overdue' | 'unpaid' | 'partially_paid';
  description?: string;
  invoice_details: ParasutInvoiceDetail[];
}

export interface ParasutInvoiceDetail {
  id?: number;
  product_id?: number;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  discount_type?: 'percentage' | 'amount';
  discount_value?: number;
  description: string;
  product?: {
    name: string;
    code?: string;
    unit?: string;
  };
}

export interface ParasutProduct {
  id?: number;
  name: string;
  code?: string;
  vat_rate: number;
  sales_excise_duty?: number;
  sales_excise_duty_type?: 'percentage' | 'amount';
  purchase_excise_duty?: number;
  purchase_excise_duty_type?: 'percentage' | 'amount';
  unit?: string;
  communications_tax_rate?: number;
  archived?: boolean;
  list_price?: number;
  currency?: string;
  buying_price?: number;
  buying_currency?: string;
  inventory_tracking?: boolean;
  initial_stock_count?: number;
}

export interface ParasutPayment {
  id?: number;
  account_id: number;
  amount: number;
  date: string;
  description?: string;
  payable_id: number;
  payable_type: string;
}

export class ParasutService {
  private axiosInstance: AxiosInstance;
  private config: ParasutConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = this.initializeParasut();
  }

  private initializeParasut(): boolean {
    const clientId = process.env.PARASUT_CLIENT_ID;
    const clientSecret = process.env.PARASUT_CLIENT_SECRET;
    const username = process.env.PARASUT_USERNAME;
    const password = process.env.PARASUT_PASSWORD;
    const companyId = process.env.PARASUT_COMPANY_ID;
    const baseUrl = process.env.PARASUT_BASE_URL || 'https://api.parasut.com';

    if (!clientId || !clientSecret || !username || !password || !companyId) {
      console.warn('⚠️  Parasut credentials not found. Accounting features disabled.');
      return false;
    }

    this.config = {
      clientId,
      clientSecret,
      username,
      password,
      companyId,
      baseUrl
    };

    this.axiosInstance = axios.create({
      baseURL: `${baseUrl}/v4/${companyId}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add response interceptor for token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry the original request
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.axiosInstance.request(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw error;
          }
        }
        throw error;
      }
    );

    console.log('✅ Parasut accounting service initialized');
    return true;
  }

  public isParasutEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Authenticate with Parasut OAuth2
   */
  async authenticate(): Promise<void> {
    if (!this.isEnabled) {
      throw new Error('Parasut is not configured');
    }

    try {
      const response = await axios.post(`${this.config.baseUrl}/oauth/token`, {
        grant_type: 'password',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        username: this.config.username,
        password: this.config.password,
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
      });

      const tokenData: ParasutTokenResponse = response.data;
      
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
      this.tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

      // Set default authorization header
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;

      console.log('✅ Parasut authentication successful');
    } catch (error) {
      console.error('❌ Parasut authentication failed:', error);
      throw new Error('Parasut authentication failed');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${this.config.baseUrl}/oauth/token`, {
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.refreshToken
      });

      const tokenData: ParasutTokenResponse = response.data;
      
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
      this.tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;

      console.log('✅ Parasut token refreshed');
    } catch (error) {
      console.error('❌ Parasut token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Ensure valid token before API calls
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiresAt || new Date() >= this.tokenExpiresAt) {
      await this.authenticate();
    }
  }

  // CONTACTS API

  /**
   * Create a contact (customer/supplier)
   */
  async createContact(contactData: ParasutContact): Promise<ParasutContact> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.post('/contacts', {
      data: {
        type: 'contacts',
        attributes: contactData
      }
    });

    return response.data.data.attributes;
  }

  /**
   * Get contact by ID
   */
  async getContact(contactId: number): Promise<ParasutContact> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.get(`/contacts/${contactId}`);
    return response.data.data.attributes;
  }

  /**
   * Update contact
   */
  async updateContact(contactId: number, contactData: Partial<ParasutContact>): Promise<ParasutContact> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.put(`/contacts/${contactId}`, {
      data: {
        type: 'contacts',
        id: contactId,
        attributes: contactData
      }
    });

    return response.data.data.attributes;
  }

  /**
   * Search contacts
   */
  async searchContacts(params: {
    query?: string;
    contact_type?: 'customer' | 'supplier';
    page?: number;
    per_page?: number;
  }): Promise<{ data: ParasutContact[]; meta: any }> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.get('/contacts', { params });
    return {
      data: response.data.data.map((item: any) => item.attributes),
      meta: response.data.meta
    };
  }

  // PRODUCTS API

  /**
   * Create a product
   */
  async createProduct(productData: ParasutProduct): Promise<ParasutProduct> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.post('/products', {
      data: {
        type: 'products',
        attributes: productData
      }
    });

    return response.data.data.attributes;
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: number): Promise<ParasutProduct> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.get(`/products/${productId}`);
    return response.data.data.attributes;
  }

  /**
   * Search products
   */
  async searchProducts(params: {
    query?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: ParasutProduct[]; meta: any }> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.get('/products', { params });
    return {
      data: response.data.data.map((item: any) => item.attributes),
      meta: response.data.meta
    };
  }

  // INVOICES API

  /**
   * Create sales invoice
   */
  async createSalesInvoice(invoiceData: ParasutInvoice): Promise<ParasutInvoice> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.post('/sales_invoices', {
      data: {
        type: 'sales_invoices',
        attributes: {
          ...invoiceData,
          item_type: 'invoice'
        },
        relationships: {
          details: {
            data: invoiceData.invoice_details.map((detail, index) => ({
              type: 'sales_invoice_details',
              attributes: detail
            }))
          }
        }
      }
    });

    return response.data.data.attributes;
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: number): Promise<ParasutInvoice> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.get(`/sales_invoices/${invoiceId}?include=details`);
    return response.data.data.attributes;
  }

  /**
   * Search invoices
   */
  async searchInvoices(params: {
    sort?: string;
    page?: number;
    per_page?: number;
    'filter[issue_date]'?: string;
    'filter[contact_id]'?: number;
  }): Promise<{ data: ParasutInvoice[]; meta: any }> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.get('/sales_invoices', { params });
    return {
      data: response.data.data.map((item: any) => item.attributes),
      meta: response.data.meta
    };
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(invoiceId: number): Promise<void> {
    await this.ensureValidToken();

    await this.axiosInstance.delete(`/sales_invoices/${invoiceId}`);
  }

  // PAYMENTS API

  /**
   * Create payment for invoice
   */
  async createPayment(paymentData: ParasutPayment): Promise<ParasutPayment> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.post('/payments', {
      data: {
        type: 'payments',
        attributes: paymentData
      }
    });

    return response.data.data.attributes;
  }

  // HELPER METHODS

  /**
   * Convert customer to Parasut contact format
   */
  formatCustomerAsContact(customer: any): ParasutContact {
    return {
      type: customer.type === 'CORPORATE' ? 'company' : 'person',
      name: customer.name,
      email: customer.email,
      tax_number: customer.taxNumber,
      tax_office: customer.taxOffice,
      contact_type: 'customer',
      address: customer.address,
      city: customer.city,
      phone: customer.phone
    };
  }

  /**
   * Convert equipment to Parasut product format
   */
  formatEquipmentAsProduct(equipment: any): ParasutProduct {
    return {
      name: equipment.name,
      code: equipment.code || equipment.serialNumber,
      vat_rate: 18, // Default VAT rate in Turkey
      unit: 'Adet',
      list_price: equipment.dailyRate || 0,
      currency: 'TRL'
    };
  }

  /**
   * Convert contract to Parasut invoice format
   */
  formatContractAsInvoice(contract: any, contactId: number): ParasutInvoice {
    const invoiceDetails: ParasutInvoiceDetail[] = contract.contractItems?.map((item: any) => ({
      quantity: item.quantity || 1,
      unit_price: item.unitPrice || 0,
      vat_rate: 18,
      description: `${item.equipment?.name || 'Ekipman'} - Kiralama`,
      product: {
        name: item.equipment?.name || 'Ekipman',
        code: item.equipment?.code || item.equipment?.serialNumber
      }
    })) || [];

    return {
      issue_date: new Date().toISOString().split('T')[0],
      due_date: contract.endDate?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_id: contactId,
      currency: 'TRL',
      description: `Ekipman Kiralama Sözleşmesi - ${contract.contractNumber}`,
      invoice_details: invoiceDetails
    };
  }

  /**
   * Sync customer with Parasut
   */
  async syncCustomer(customerId: number): Promise<number> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if customer already exists in Parasut
    let parasutContact = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { parasutContactId: true }
    });

    if (parasutContact?.parasutContactId) {
      return parasutContact.parasutContactId;
    }

    // Create contact in Parasut
    const contactData = this.formatCustomerAsContact(customer);
    const createdContact = await this.createContact(contactData);

    // Save Parasut contact ID
    await prisma.customer.update({
      where: { id: customerId },
      data: { parasutContactId: createdContact.id }
    });

    return createdContact.id!;
  }

  /**
   * Create invoice from contract
   */
  async createInvoiceFromContract(contractId: number): Promise<ParasutInvoice> {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        customer: true,
        contractItems: {
          include: {
            equipment: true
          }
        }
      }
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    // Sync customer with Parasut
    const contactId = await this.syncCustomer(contract.customerId);

    // Create invoice
    const invoiceData = this.formatContractAsInvoice(contract, contactId);
    const createdInvoice = await this.createSalesInvoice(invoiceData);

    // Save invoice reference in contract
    await prisma.contract.update({
      where: { id: contractId },
      data: { 
        parasutInvoiceId: createdInvoice.id,
        invoiceStatus: 'SENT'
      }
    });

    return createdInvoice;
  }

  /**
   * Get company accounts for payments
   */
  async getAccounts(): Promise<any[]> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.get('/accounts');
    return response.data.data.map((item: any) => item.attributes);
  }

  /**
   * Get company info
   */
  async getCompanyInfo(): Promise<any> {
    await this.ensureValidToken();

    const response = await this.axiosInstance.get('/me');
    return response.data.data.attributes;
  }
}

export const parasutService = new ParasutService();