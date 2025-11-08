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
 * İş Bankası API Integration Service
 * 
 * Documentation: https://developer.isbank.com.tr
 * 
 * Features:
 * - Certificate-based authentication
 * - Account balance inquiry
 * - Transaction history
 * - Money transfers
 * - Bill payments
 * 
 * API Endpoints:
 * - Test: https://apitest.isbank.com.tr
 * - Prod: https://api.isbank.com.tr
 */

interface IsBankAccount {
  hesapNumarasi: string;
  iban: string;
  hesapIsmi: string;
  hesapCinsi: string;
  dovizCinsi: string;
  bakiye: string;
  kullanilabilirBakiye: string;
  blokeMiktar?: string;
  subeKod?: string;
  subeIsim?: string;
  durum: string;
  acilisTarih?: string;
  sonIslemTarih?: string;
}

interface IsBankTransaction {
  islemNo: string;
  hesapNo: string;
  islemTarih: string;
  valortarih: string;
  islemAciklama: string;
  islemTutar: string;
  dovizCinsi: string;
  borcAlacak: string;
  kategori?: string;
  referansNo?: string;
  kalanBakiye?: string;
  karsiTaraf?: {
    adi?: string;
    hesapNo?: string;
    iban?: string;
  };
  kanal?: string;
}

export class IsBankService extends BaseBankService {
  constructor(config: Partial<BankConfig>) {
    const fullConfig: BankConfig = {
      bankCode: 'ISBANK',
      bankName: 'İş Bankası',
      environment: config.environment || 'TEST',
      apiKey: config.apiKey || process.env.ISBANK_API_KEY || '',
      apiSecret: config.apiSecret || process.env.ISBANK_API_SECRET || '',
      clientId: config.clientId || process.env.ISBANK_CLIENT_ID || '',
      username: config.username || process.env.ISBANK_USERNAME || '',
      password: config.password || process.env.ISBANK_PASSWORD || '',
      customerId: config.customerId || process.env.ISBANK_CUSTOMER_ID || '',
      baseURL: config.environment === 'PRODUCTION'
        ? 'https://api.isbank.com.tr'
        : 'https://apitest.isbank.com.tr',
      timeout: 30000,
    };

    super(fullConfig);
    this.logOperation('İş Bankası Service Initialized', { environment: fullConfig.environment });
  }

  /**
   * Authenticate with İş Bankası API
   */
  async authenticate(): Promise<void> {
    try {
      this.logOperation('Authenticating with İş Bankası');

      const timestamp = Date.now().toString();
      const nonce = crypto.randomUUID();
      
      // Create signature
      const signatureData = `${this.config.clientId}${timestamp}${nonce}`;
      const signature = this.generateSignature(signatureData, this.config.apiSecret);

      const response = await this.client.post<{
        durum: string;
        erisimBelirteci: string;
        gecerlilikSuresi: number;
      }>(
        '/api/v1/auth/token',
        {
          istemciKimlik: this.config.clientId,
          kullaniciAdi: this.config.username,
          sifre: this.config.password,
          zamanDamgasi: timestamp,
          nonce,
          imza: signature,
        }
      );

      if (response.data.durum === 'BASARILI') {
        this.accessToken = response.data.erisimBelirteci;
        this.tokenExpiry = new Date(Date.now() + response.data.gecerlilikSuresi * 1000);

        // Set authorization header
        this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
        this.client.defaults.headers.common['X-Client-Id'] = this.config.clientId;

        this.logOperation('Authentication successful', {
          expiresIn: response.data.gecerlilikSuresi,
        });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      this.handleError(error, 'Authentication');
    }
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<BalanceInquiryResponse> {
    try {
      await this.ensureAuthenticated();
      this.logOperation('Fetching accounts');

      const response = await this.retry(() =>
        this.client.get<{ durum: string; hesaplar: IsBankAccount[] }>(
          '/api/v1/hesaplar',
          {
            params: {
              musteriNo: this.config.customerId,
            },
          }
        )
      );

      if (response.data.durum !== 'BASARILI') {
        throw new Error('Failed to fetch accounts');
      }

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
        errorCode: error.response?.data?.hataKod,
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
        this.client.get<{ durum: string; hesap: IsBankAccount }>(
          `/api/v1/hesaplar/${accountId}`
        )
      );

      if (response.data.durum !== 'BASARILI') {
        return null;
      }

      return this.mapAccount(response.data.hesap);
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
        this.client.post<{
          durum: string;
          islemler: IsBankTransaction[];
          toplamKayit: number;
          sayfa: number;
          toplamSayfa: number;
        }>(
          `/api/v1/hesaplar/${request.accountId}/hareketler`,
          {
            baslangicTarih: request.startDate.toISOString().split('T')[0],
            bitisTarih: request.endDate.toISOString().split('T')[0],
            minTutar: request.minAmount,
            maxTutar: request.maxAmount,
            islemTip: request.transactionType === 'ALL' ? undefined : 
              request.transactionType === 'DEBIT' ? 'BORC' : 'ALACAK',
            sayfa: request.page || 1,
            limit: request.limit || 100,
          }
        )
      );

      if (response.data.durum !== 'BASARILI') {
        throw new Error('Failed to fetch transactions');
      }

      const transactions: BankTransaction[] = response.data.islemler.map(tx => 
        this.mapTransaction(tx)
      );

      this.logOperation('Transaction history fetched', {
        count: transactions.length,
        totalCount: response.data.toplamKayit,
      });

      return {
        success: true,
        transactions,
        totalCount: response.data.toplamKayit,
        page: response.data.sayfa,
        totalPages: response.data.toplamSayfa,
      };
    } catch (error: any) {
      logger.error('Failed to fetch transaction history', { error, request });
      return {
        success: false,
        errorMessage: error.message,
        errorCode: error.response?.data?.hataKod,
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

      // Validate IBAN
      if (request.toIban && !this.validateIban(request.toIban)) {
        throw new Error('Invalid IBAN format');
      }

      const response = await this.retry(() =>
        this.client.post<{
          durum: string;
          havaleNo?: string;
          referansNo?: string;
          islemTarih?: string;
          tutar: number;
          komisyon?: number;
          hata?: {
            mesaj: string;
            kod: string;
          };
        }>(
          '/api/v1/havaleler',
          {
            gonderenHesap: request.fromAccount,
            aliciHesap: request.toAccount,
            aliciIban: request.toIban ? this.formatIban(request.toIban) : undefined,
            tutar: request.amount,
            dovizCinsi: request.currency,
            aciklama: request.description,
            havaleTip: request.transferType,
            aliciAd: request.beneficiaryName,
          }
        )
      );

      if (response.data.durum !== 'BASARILI') {
        return {
          success: false,
          amount: request.amount,
          errorMessage: response.data.hata?.mesaj,
          errorCode: response.data.hata?.kod,
        };
      }

      this.logOperation('Transfer successful', {
        transferId: response.data.havaleNo,
        referenceNumber: response.data.referansNo,
      });

      return {
        success: true,
        transferId: response.data.havaleNo,
        referenceNumber: response.data.referansNo,
        transactionDate: response.data.islemTarih ? new Date(response.data.islemTarih) : undefined,
        amount: response.data.tutar,
        fee: response.data.komisyon,
      };
    } catch (error: any) {
      logger.error('Transfer failed', { error, request });
      return {
        success: false,
        amount: request.amount,
        errorMessage: error.message,
        errorCode: error.response?.data?.hataKod,
      };
    }
  }

  /**
   * Map İş Bankası account to standard format
   */
  private mapAccount(isbankAccount: IsBankAccount): BankAccount {
    return {
      accountId: isbankAccount.hesapNumarasi,
      accountNumber: isbankAccount.hesapNumarasi,
      iban: isbankAccount.iban,
      accountName: isbankAccount.hesapIsmi,
      accountType: this.mapAccountType(isbankAccount.hesapCinsi),
      currency: isbankAccount.dovizCinsi,
      balance: this.parseAmount(isbankAccount.bakiye),
      availableBalance: this.parseAmount(isbankAccount.kullanilabilirBakiye),
      blockedAmount: isbankAccount.blokeMiktar ? this.parseAmount(isbankAccount.blokeMiktar) : undefined,
      branchCode: isbankAccount.subeKod,
      branchName: isbankAccount.subeIsim,
      status: isbankAccount.durum === 'AKTIF' ? 'ACTIVE' : 'INACTIVE',
      openingDate: isbankAccount.acilisTarih ? new Date(isbankAccount.acilisTarih) : undefined,
      lastTransactionDate: isbankAccount.sonIslemTarih ? new Date(isbankAccount.sonIslemTarih) : undefined,
    };
  }

  /**
   * Map İş Bankası transaction to standard format
   */
  private mapTransaction(isbankTx: IsBankTransaction): BankTransaction {
    const amount = this.parseAmount(isbankTx.islemTutar);
    
    return {
      transactionId: isbankTx.islemNo,
      accountId: isbankTx.hesapNo,
      transactionDate: new Date(isbankTx.islemTarih),
      valueDate: new Date(isbankTx.valortarih),
      description: isbankTx.islemAciklama,
      amount: Math.abs(amount),
      currency: isbankTx.dovizCinsi,
      transactionType: isbankTx.borcAlacak === 'BORC' ? 'DEBIT' : 'CREDIT',
      category: isbankTx.kategori,
      reference: isbankTx.referansNo,
      balance: isbankTx.kalanBakiye ? this.parseAmount(isbankTx.kalanBakiye) : undefined,
      counterpartyName: isbankTx.karsiTaraf?.adi,
      counterpartyAccount: isbankTx.karsiTaraf?.hesapNo,
      counterpartyIban: isbankTx.karsiTaraf?.iban,
      channel: isbankTx.kanal,
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

export default IsBankService;
