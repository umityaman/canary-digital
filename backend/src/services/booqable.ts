import axios, { AxiosInstance } from 'axios';

/**
 * Booqable API Service
 * Handles all interactions with Booqable API
 */
export class BooqableService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl = 'https://api.booqable.com/1';

  constructor(apiKey: string, accountUrl?: string) {
    this.apiKey = apiKey;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[Booqable API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 429) {
          console.error('[Booqable API] Rate limit exceeded');
        } else if (error.response?.status === 401) {
          console.error('[Booqable API] Authentication failed');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/products', { params: { limit: 1 } });
      return true;
    } catch (error) {
      console.error('[Booqable API] Connection test failed:', error);
      return false;
    }
  }

  // ==================== PRODUCTS ====================

  /**
   * Get all products (paginated)
   */
  async getProducts(page = 1, perPage = 100): Promise<any> {
    try {
      const response = await this.client.get('/products', {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      console.error('[Booqable API] Failed to fetch products:', error);
      throw error;
    }
  }

  /**
   * Get single product by ID
   */
  async getProduct(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[Booqable API] Failed to fetch product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create product
   */
  async createProduct(data: any): Promise<any> {
    try {
      const response = await this.client.post('/products', data);
      return response.data;
    } catch (error) {
      console.error('[Booqable API] Failed to create product:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: any): Promise<any> {
    try {
      const response = await this.client.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`[Booqable API] Failed to update product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await this.client.delete(`/products/${id}`);
    } catch (error) {
      console.error(`[Booqable API] Failed to delete product ${id}:`, error);
      throw error;
    }
  }

  // ==================== ORDERS ====================

  /**
   * Get all orders (paginated)
   */
  async getOrders(filters?: any, page = 1, perPage = 100): Promise<any> {
    try {
      const response = await this.client.get('/orders', {
        params: { ...filters, page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      console.error('[Booqable API] Failed to fetch orders:', error);
      throw error;
    }
  }

  /**
   * Get single order by ID
   */
  async getOrder(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[Booqable API] Failed to fetch order ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create order
   */
  async createOrder(data: any): Promise<any> {
    try {
      const response = await this.client.post('/orders', data);
      return response.data;
    } catch (error) {
      console.error('[Booqable API] Failed to create order:', error);
      throw error;
    }
  }

  /**
   * Update order
   */
  async updateOrder(id: string, data: any): Promise<any> {
    try {
      const response = await this.client.put(`/orders/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`[Booqable API] Failed to update order ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete order
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      await this.client.delete(`/orders/${id}`);
    } catch (error) {
      console.error(`[Booqable API] Failed to delete order ${id}:`, error);
      throw error;
    }
  }

  // ==================== CUSTOMERS ====================

  /**
   * Get all customers (paginated)
   */
  async getCustomers(page = 1, perPage = 100): Promise<any> {
    try {
      const response = await this.client.get('/customers', {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      console.error('[Booqable API] Failed to fetch customers:', error);
      throw error;
    }
  }

  /**
   * Get single customer by ID
   */
  async getCustomer(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[Booqable API] Failed to fetch customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create customer
   */
  async createCustomer(data: any): Promise<any> {
    try {
      const response = await this.client.post('/customers', data);
      return response.data;
    } catch (error) {
      console.error('[Booqable API] Failed to create customer:', error);
      throw error;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(id: string, data: any): Promise<any> {
    try {
      const response = await this.client.put(`/customers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`[Booqable API] Failed to update customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: string): Promise<void> {
    try {
      await this.client.delete(`/customers/${id}`);
    } catch (error) {
      console.error(`[Booqable API] Failed to delete customer ${id}:`, error);
      throw error;
    }
  }

  // ==================== WEBHOOKS ====================

  /**
   * Create webhook subscription
   */
  async createWebhook(url: string, events: string[]): Promise<any> {
    try {
      const response = await this.client.post('/webhooks', {
        url,
        events
      });
      return response.data;
    } catch (error) {
      console.error('[Booqable API] Failed to create webhook:', error);
      throw error;
    }
  }

  /**
   * Get all webhooks
   */
  async getWebhooks(): Promise<any> {
    try {
      const response = await this.client.get('/webhooks');
      return response.data;
    } catch (error) {
      console.error('[Booqable API] Failed to fetch webhooks:', error);
      throw error;
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    try {
      await this.client.delete(`/webhooks/${id}`);
    } catch (error) {
      console.error(`[Booqable API] Failed to delete webhook ${id}:`, error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   * @param payload - Raw request body
   * @param signature - X-Booqable-Signature header
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implementation depends on Booqable's webhook signing mechanism
    // For now, return true (implement proper verification in production)
    return true;
  }

  // ==================== UTILITY ====================

  /**
   * Map Booqable status to Canary status
   */
  static mapOrderStatus(booqableStatus: string): string {
    const statusMap: Record<string, string> = {
      'concept': 'PENDING',
      'reserved': 'CONFIRMED',
      'started': 'ACTIVE',
      'stopped': 'COMPLETED',
      'canceled': 'CANCELLED'
    };
    return statusMap[booqableStatus] || 'PENDING';
  }

  /**
   * Map Canary status to Booqable status
   */
  static mapCanaryStatus(canaryStatus: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'concept',
      'CONFIRMED': 'reserved',
      'ACTIVE': 'started',
      'COMPLETED': 'stopped',
      'CANCELLED': 'canceled'
    };
    return statusMap[canaryStatus] || 'concept';
  }
}
