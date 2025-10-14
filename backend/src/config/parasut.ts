import axios, { AxiosInstance, AxiosError } from 'axios';
import { log } from './logger';

interface ParasutConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  companyId: string;
  redirectUri: string;
}

interface ParasutTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  created_at: number;
}

interface ParasutContact {
  id: string;
  type: 'contacts';
  attributes: {
    name: string;
    email?: string;
    tax_office?: string;
    tax_number?: string;
    district?: string;
    city?: string;
    country?: string;
    address?: string;
    phone?: string;
    fax?: string;
    is_abroad?: boolean;
    archived?: boolean;
    untrackable?: boolean;
    contact_type: 'person' | 'company';
  };
}

interface ParasutInvoice {
  id: string;
  type: 'sales_invoices';
  attributes: {
    archived: boolean;
    invoice_series: string;
    invoice_id: number;
    currency: string;
    exchange_rate: string;
    net_total: string;
    total_vat: string;
    total_discount: string;
    gross_total: string;
    paid_amount: string;
    remaining_amount: string;
    payment_status: string;
    invoice_no: string;
    invoice_date: string;
    due_date: string;
    description?: string;
    item_type: 'sales_invoice' | 'e_archive';
  };
}

interface ParasutPayment {
  id: string;
  type: 'payments';
  attributes: {
    description: string;
    account_id: number;
    date: string;
    amount: string;
    currency: string;
    exchange_rate: string;
  };
}

/**
 * Paraşüt API Client
 * Türkiye'nin önde gelen muhasebe yazılımı Paraşüt ile entegrasyon
 * OAuth 2.0 authentication ile güvenli API çağrıları
 */
class ParasutClient {
  private config: ParasutConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private client: AxiosInstance;
  private readonly baseURL = 'https://api.parasut.com';

  constructor() {
    this.config = {
      clientId: process.env.PARASUT_CLIENT_ID || '',
      clientSecret: process.env.PARASUT_CLIENT_SECRET || '',
      username: process.env.PARASUT_USERNAME || '',
      password: process.env.PARASUT_PASSWORD || '',
      companyId: process.env.PARASUT_COMPANY_ID || '',
      redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
    };

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 saniye timeout
    });

    // Request interceptor - her istekte token ekle
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        log.error('Paraşüt request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - hata yönetimi
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          log.error('Paraşüt API error:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
          });
        } else {
          log.error('Paraşüt network error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * OAuth 2.0 Token Alımı
   * Token'ı cache'ler ve geçerliliğini kontrol eder
   */
  async getAccessToken(): Promise<string> {
    // Token hala geçerliyse yeniden alma
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('Paraşüt credentials not configured');
    }

    try {
      log.info('Paraşüt: Yeni access token alınıyor...');

      const response = await axios.post<ParasutTokenResponse>(
        `${this.baseURL}/oauth/token`,
        {
          grant_type: 'password',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          username: this.config.username,
          password: this.config.password,
          redirect_uri: this.config.redirectUri,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Token'ın 5 dakika önceden expire olduğunu kabul et (safety margin)
      this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);

      log.info('Paraşüt: Access token başarıyla alındı');
      return this.accessToken;
    } catch (error) {
      log.error('Paraşüt: Token alınamadı:', error);
      throw new Error('Paraşüt authentication failed');
    }
  }

  /**
   * Müşteri (Contact) Oluşturma
   * @param contactData Müşteri bilgileri
   * @returns Oluşturulan contact
   */
  async createContact(contactData: {
    name: string;
    email?: string;
    phone?: string;
    taxOffice?: string;
    taxNumber?: string;
    address?: string;
    city?: string;
    district?: string;
    contactType?: 'person' | 'company';
  }): Promise<ParasutContact> {
    try {
      log.info('Paraşüt: Yeni müşteri oluşturuluyor:', contactData.name);

      const response = await this.client.post(
        `/v4/${this.config.companyId}/contacts`,
        {
          data: {
            type: 'contacts',
            attributes: {
              name: contactData.name,
              email: contactData.email,
              phone: contactData.phone,
              tax_office: contactData.taxOffice,
              tax_number: contactData.taxNumber,
              address: contactData.address,
              city: contactData.city || 'İstanbul',
              district: contactData.district,
              country: 'Türkiye',
              contact_type: contactData.contactType || 'person',
            },
          },
        }
      );

      log.info('Paraşüt: Müşteri başarıyla oluşturuldu:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      log.error('Paraşüt: Müşteri oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Müşteri Bilgilerini Getir
   * @param contactId Paraşüt contact ID
   * @returns Contact bilgileri
   */
  async getContact(contactId: string): Promise<ParasutContact> {
    try {
      const response = await this.client.get(
        `/v4/${this.config.companyId}/contacts/${contactId}`
      );
      return response.data.data;
    } catch (error) {
      log.error('Paraşüt: Müşteri bilgisi alınamadı:', error);
      throw error;
    }
  }

  /**
   * Müşteri Bilgilerini Güncelle
   * @param contactId Paraşüt contact ID
   * @param updates Güncellenecek alanlar
   * @returns Güncellenmiş contact
   */
  async updateContact(contactId: string, updates: Partial<ParasutContact['attributes']>): Promise<ParasutContact> {
    try {
      log.info('Paraşüt: Müşteri güncelleniyor:', contactId);

      const response = await this.client.patch(
        `/v4/${this.config.companyId}/contacts/${contactId}`,
        {
          data: {
            type: 'contacts',
            id: contactId,
            attributes: updates,
          },
        }
      );

      log.info('Paraşüt: Müşteri başarıyla güncellendi');
      return response.data.data;
    } catch (error) {
      log.error('Paraşüt: Müşteri güncellenemedi:', error);
      throw error;
    }
  }

  /**
   * Fatura Oluşturma (e-Fatura veya e-Arşiv)
   * @param invoiceData Fatura bilgileri
   * @returns Oluşturulan fatura
   */
  async createInvoice(invoiceData: {
    contactId: string;
    invoiceDate: string;
    dueDate: string;
    description: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      vatRate?: number;
      discountType?: 'percentage' | 'amount';
      discountValue?: number;
    }>;
    invoiceType?: 'sales_invoice' | 'e_archive';
    currency?: string;
  }): Promise<ParasutInvoice> {
    try {
      log.info('Paraşüt: Yeni fatura oluşturuluyor...');

      // Fatura kalemlerini hazırla
      const details = invoiceData.items.map((item) => ({
        type: 'sales_invoice_details',
        attributes: {
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          vat_rate: item.vatRate || 18,
          discount_type: item.discountType || 'percentage',
          discount_value: item.discountValue || 0,
        },
      }));

      const response = await this.client.post(
        `/v4/${this.config.companyId}/sales_invoices`,
        {
          data: {
            type: 'sales_invoices',
            attributes: {
              item_type: invoiceData.invoiceType || 'sales_invoice',
              invoice_date: invoiceData.invoiceDate,
              due_date: invoiceData.dueDate,
              description: invoiceData.description,
              currency: invoiceData.currency || 'TRY',
              exchange_rate: '1',
            },
            relationships: {
              contact: {
                data: {
                  id: invoiceData.contactId,
                  type: 'contacts',
                },
              },
              details: {
                data: details,
              },
            },
          },
        }
      );

      log.info('Paraşüt: Fatura başarıyla oluşturuldu:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      log.error('Paraşüt: Fatura oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Fatura Durumunu Sorgula
   * @param invoiceId Paraşüt invoice ID
   * @returns Fatura bilgileri
   */
  async getInvoice(invoiceId: string): Promise<ParasutInvoice> {
    try {
      const response = await this.client.get(
        `/v4/${this.config.companyId}/sales_invoices/${invoiceId}`
      );
      return response.data.data;
    } catch (error) {
      log.error('Paraşüt: Fatura bilgisi alınamadı:', error);
      throw error;
    }
  }

  /**
   * e-Fatura/e-Arşiv Gönderme
   * @param invoiceId Paraşüt invoice ID
   * @param email Gönderilecek email (opsiyonel)
   * @returns İşlem sonucu
   */
  async sendInvoice(invoiceId: string, email?: string): Promise<any> {
    try {
      log.info('Paraşüt: e-Fatura/e-Arşiv gönderiliyor:', invoiceId);

      const response = await this.client.post(
        `/v4/${this.config.companyId}/e_archives/${invoiceId}/e_archive`,
        {
          data: {
            type: 'e_archives',
            attributes: {
              scenario: 'basic',
              note: email ? `Email: ${email}` : undefined,
            },
          },
        }
      );

      log.info('Paraşüt: e-Fatura/e-Arşiv başarıyla gönderildi');
      return response.data;
    } catch (error) {
      log.error('Paraşüt: e-Fatura/e-Arşiv gönderilemedi:', error);
      throw error;
    }
  }

  /**
   * Ödeme Kaydı Oluşturma
   * @param paymentData Ödeme bilgileri
   * @returns Oluşturulan ödeme
   */
  async recordPayment(paymentData: {
    invoiceId: string;
    amount: number;
    date: string;
    description?: string;
    accountId?: string;
  }): Promise<ParasutPayment> {
    try {
      log.info('Paraşüt: Ödeme kaydediliyor:', paymentData.invoiceId);

      const response = await this.client.post(
        `/v4/${this.config.companyId}/payments`,
        {
          data: {
            type: 'payments',
            attributes: {
              date: paymentData.date,
              amount: paymentData.amount,
              description: paymentData.description || 'Ödeme',
              currency: 'TRY',
              exchange_rate: '1',
            },
            relationships: {
              payable: {
                data: {
                  id: paymentData.invoiceId,
                  type: 'sales_invoices',
                },
              },
              account: {
                data: {
                  id: paymentData.accountId || process.env.PARASUT_DEFAULT_ACCOUNT_ID,
                  type: 'accounts',
                },
              },
            },
          },
        }
      );

      log.info('Paraşüt: Ödeme başarıyla kaydedildi');
      return response.data.data;
    } catch (error) {
      log.error('Paraşüt: Ödeme kaydedilemedi:', error);
      throw error;
    }
  }

  /**
   * Hesapları Listele (Banka hesapları, kasa vb.)
   * @returns Hesap listesi
   */
  async getAccounts(): Promise<any[]> {
    try {
      const response = await this.client.get(
        `/v4/${this.config.companyId}/accounts`
      );
      return response.data.data;
    } catch (error) {
      log.error('Paraşüt: Hesaplar alınamadı:', error);
      throw error;
    }
  }

  /**
   * Paraşüt bağlantı durumunu kontrol et
   * @returns Bağlantı durumu
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      log.info('Paraşüt: Bağlantı başarılı ✓');
      return true;
    } catch (error) {
      log.error('Paraşüt: Bağlantı başarısız ✗');
      return false;
    }
  }

  /**
   * Paraşüt yapılandırma durumunu kontrol et
   * @returns Yapılandırma durumu
   */
  isConfigured(): boolean {
    return !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.username &&
      this.config.password &&
      this.config.companyId
    );
  }
}

// Singleton instance
export const parasutClient = new ParasutClient();

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Export types
export type {
  ParasutContact,
  ParasutInvoice,
  ParasutPayment,
  ParasutConfig,
};
