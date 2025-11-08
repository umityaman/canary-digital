import { 
  BaseBankService, 
  BankConfig, 
  BankAccount, 
  BankTransaction,
  BalanceInquiryResponse,
  TransactionHistoryRequest,
  TransactionHistoryResponse,
  TransferRequest,
  TransferResponse
} from './baseBankService';
import logger from '../../config/logger';

/**
 * Akbank API Integration Service
 * 
 * Documentation: https://developer.akbank.com
 * 
 * Features:
 * - OAuth 2.0 authentication
 * - Account balance inquiry
 * - Transaction history (last 90 days)
 * - EFT/HAVALE/FAST transfers
 * - Bill payments
 * 
 * API Endpoints:
 * - Test: https://api-test.akbank.com
 * - Prod: https://api.akbank.com
 */

interface AkbankAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface AkbankAccount {
  hesapNo: string;
  ibanNo: string;
  hesapAdi: string;
  hesapTipi: string;
  paraBirimi: string;
  bakiye: number;
  kullanilabilirBakiye: number;
  blokeMiktari?: number;
  subeKodu?: string;
  subeAdi?: string;
  durum: string;
  acilisTarihi?: string;
  sonIslemTarihi?: string;
}

interface AkbankTransaction {
  islemId: string;
  hesapNo: string;
  islemTarihi: string;
  valortarihi: string;
  aciklama: string;
  tutar: number;
  paraBirimi: string;
  islemTipi: string;
  kategori?: string;
  referans?: string;
  bakiye?: number;
  karsiHesapAdi?: string;
  karsiHesapNo?: string;
  karsiIban?: string;
  kanal?: string;
}

export class AkbankService extends BaseBankService {
  constructor(config: Partial<BankConfig>) {
    const fullConfig: BankConfig = {
      bankCode: 'AKBANK',
      bankName: 'Akbank',
      environment: config.environment || 'TEST',
      apiKey: config.apiKey || process.env.AKBANK_API_KEY || '',
      apiSecret: config.apiSecret || process.env.AKBANK_API_SECRET || '',
      clientId: config.clientId || process.env.AKBANK_CLIENT_ID || '',
      username: config.username || process.env.AKBANK_USERNAME || '',
      password: config.password || process.env.AKBANK_PASSWORD || '',
      customerId: config.customerId || process.env.AKBANK_CUSTOMER_ID || '',
      baseURL: config.environment === 'PRODUCTION'
        ? 'https://api.akbank.com'
        : 'https://api-test.akbank.com',
      timeout: 30000,
    };

    super(fullConfig);
    this.logOperation('Akbank Service Initialized', { environment: fullConfig.environment });
  }

  /**
   * Authenticate with Akbank OAuth 2.0
   */
  async authenticate(): Promise<void> {
    try {
      this.logOperation('Authenticating with Akbank');

      const response = await this.client.post<AkbankAuthResponse>(
        '/oauth/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId!,
          client_secret: this.config.apiSecret,
          scope: 'accounts transactions payments',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);

      // Set authorization header for future requests
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;

      this.logOperation('Authentication successful', {
        expiresIn: response.data.expires_in,
      });
    } catch (error: any) {
      this.handleError(error, 'Authentication');
    }
  }

  /**
   * Get all accounts for customer
   */
  async getAccounts(): Promise<BalanceInquiryResponse> {
    try {
      await this.ensureAuthenticated();
      this.logOperation('Fetching accounts');

      const response = await this.retry(() =>
        this.client.get<{ hesaplar: AkbankAccount[] }>(
          '/v1/hesaplar',
          {
            params: {
              musteriNo: this.config.customerId,
            },
          }
        )
      );

      const accounts: BankAccount[] = response.data.hesaplar.map(acc => this.mapAccount(acc));

      this.logOperation('Accounts fetched successfully', {
        count: accounts.length,
      });

      return {
        success: true,
        accounts,
      };
    } catch (error: any) {
      logger.error('Failed to fetch accounts', { error });
      return {
        success: false,
        errorMessage: error.message,
        errorCode: error.response?.data?.kod,
      };
    }
  }

  /**
   * Get account details
   */
  async getAccountDetails(accountId: string): Promise<BankAccount | null> {
    try {
      await this.ensureAuthenticated();
      this.logOperation('Fetching account details', { accountId });

      const response = await this.retry(() =>
        this.client.get<AkbankAccount>(`/v1/hesaplar/${accountId}`)
      );

      return this.mapAccount(response.data);
    } catch (error: any) {
      logger.error('Failed to fetch account details', { error, accountId });
      return null;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(request: TransactionHistoryRequest): Promise<TransactionHistoryResponse> {
    try {
      await this.ensureAuthenticated();
      this.logOperation('Fetching transaction history', request);

      const response = await this.retry(() =>
        this.client.get<{ islemler: AkbankTransaction[]; toplam: number }>(
          `/v1/hesaplar/${request.accountId}/islemler`,
          {
            params: {
              baslangicTarihi: request.startDate.toISOString().split('T')[0],
              bitisTarihi: request.endDate.toISOString().split('T')[0],
              minTutar: request.minAmount,
              maxTutar: request.maxAmount,
              islemTipi: request.transactionType === 'ALL' ? undefined : request.transactionType,
              sayfa: request.page || 1,
              limit: request.limit || 100,
            },
          }
        )
      );

      const transactions: BankTransaction[] = response.data.islemler.map(tx => this.mapTransaction(tx));
      const totalCount = response.data.toplam;
      const limit = request.limit || 100;

      this.logOperation('Transaction history fetched', {
        count: transactions.length,
        totalCount,
      });

      return {
        success: true,
        transactions,
        totalCount,
        page: request.page || 1,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error: any) {
      logger.error('Failed to fetch transaction history', { error, request });
      return {
        success: false,
        errorMessage: error.message,
        errorCode: error.response?.data?.kod,
      };
    }
  }

  /**
   * Initiate money transfer
   */
  async transfer(request: TransferRequest): Promise<TransferResponse> {
    try {
      await this.ensureAuthenticated();
      this.logOperation('Initiating transfer', request);

      // Validate IBAN if provided
      if (request.toIban && !this.validateIban(request.toIban)) {
        throw new Error('Invalid IBAN format');
      }

      const payload = {
        gonderenHesap: request.fromAccount,
        aliciHesap: request.toAccount,
        aliciIban: request.toIban ? this.formatIban(request.toIban) : undefined,
        tutar: request.amount,
        paraBirimi: request.currency,
        aciklama: request.description,
        havaletipi: request.transferType,
        aliciAdi: request.beneficiaryName,
      };

      const response = await this.retry(() =>
        this.client.post<{
          basarili: boolean;
          havaleId: string;
          referansNo: string;
          islemTarihi: string;
          tutar: number;
          komisyon?: number;
          hata?: { mesaj: string; kod: string };
        }>('/v1/havaleler', payload)
      );

      if (!response.data.basarili) {
        return {
          success: false,
          amount: request.amount,
          errorMessage: response.data.hata?.mesaj,
          errorCode: response.data.hata?.kod,
        };
      }

      this.logOperation('Transfer successful', {
        transferId: response.data.havaleId,
        referenceNumber: response.data.referansNo,
      });

      return {
        success: true,
        transferId: response.data.havaleId,
        referenceNumber: response.data.referansNo,
        transactionDate: new Date(response.data.islemTarihi),
        amount: response.data.tutar,
        fee: response.data.komisyon,
      };
    } catch (error: any) {
      logger.error('Transfer failed', { error, request });
      return {
        success: false,
        amount: request.amount,
        errorMessage: error.message,
        errorCode: error.response?.data?.kod,
      };
    }
  }

  /**
   * Map Akbank account to standard format
   */
  private mapAccount(akbankAccount: AkbankAccount): BankAccount {
    return {
      accountId: akbankAccount.hesapNo,
      accountNumber: akbankAccount.hesapNo,
      iban: akbankAccount.ibanNo,
      accountName: akbankAccount.hesapAdi,
      accountType: this.mapAccountType(akbankAccount.hesapTipi),
      currency: akbankAccount.paraBirimi,
      balance: akbankAccount.bakiye,
      availableBalance: akbankAccount.kullanilabilirBakiye,
      blockedAmount: akbankAccount.blokeMiktari,
      branchCode: akbankAccount.subeKodu,
      branchName: akbankAccount.subeAdi,
      status: akbankAccount.durum === 'AKTIF' ? 'ACTIVE' : 'INACTIVE',
      openingDate: akbankAccount.acilisTarihi ? new Date(akbankAccount.acilisTarihi) : undefined,
      lastTransactionDate: akbankAccount.sonIslemTarihi ? new Date(akbankAccount.sonIslemTarihi) : undefined,
    };
  }

  /**
   * Map Akbank transaction to standard format
   */
  private mapTransaction(akbankTx: AkbankTransaction): BankTransaction {
    return {
      transactionId: akbankTx.islemId,
      accountId: akbankTx.hesapNo,
      transactionDate: new Date(akbankTx.islemTarihi),
      valueDate: new Date(akbankTx.valortarihi),
      description: akbankTx.aciklama,
      amount: Math.abs(akbankTx.tutar),
      currency: akbankTx.paraBirimi,
      transactionType: akbankTx.tutar < 0 ? 'DEBIT' : 'CREDIT',
      category: akbankTx.kategori,
      reference: akbankTx.referans,
      balance: akbankTx.bakiye,
      counterpartyName: akbankTx.karsiHesapAdi,
      counterpartyAccount: akbankTx.karsiHesapNo,
      counterpartyIban: akbankTx.karsiIban,
      channel: akbankTx.kanal,
    };
  }

  /**
   * Map account type
   */
  private mapAccountType(type: string): 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'DEPOSIT' {
    const typeMap: Record<string, 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'DEPOSIT'> = {
      'VADESIZ': 'CHECKING',
      'TASARRUF': 'SAVINGS',
      'KREDI': 'CREDIT',
      'VADELI': 'DEPOSIT',
    };
    return typeMap[type] || 'CHECKING';
  }
}

export default AkbankService;
