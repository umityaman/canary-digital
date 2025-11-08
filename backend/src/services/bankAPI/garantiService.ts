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
 * Garanti BBVA API Integration Service
 * 
 * Documentation: https://developer.garantibbva.com.tr
 * 
 * Features:
 * - API Key authentication
 * - Account balance inquiry
 * - Transaction history
 * - Money transfers (EFT/HAVALE/FAST)
 * - Bill payments
 * 
 * API Endpoints:
 * - Test: https://api-test.garantibbva.com.tr
 * - Prod: https://api.garantibbva.com.tr
 */

interface GarantiAccount {
  accountNumber: string;
  iban: string;
  accountName: string;
  accountType: string;
  currency: string;
  balance: number;
  availableBalance: number;
  blockedAmount?: number;
  branchCode?: string;
  branchName?: string;
  status: string;
  openDate?: string;
  lastTransactionDate?: string;
}

interface GarantiTransaction {
  transactionId: string;
  accountNumber: string;
  transactionDate: string;
  valueDate: string;
  description: string;
  amount: number;
  currency: string;
  type: string;
  category?: string;
  reference?: string;
  balance?: number;
  counterparty?: {
    name?: string;
    account?: string;
    iban?: string;
  };
  channel?: string;
}

export class GarantiService extends BaseBankService {
  constructor(config: Partial<BankConfig>) {
    const fullConfig: BankConfig = {
      bankCode: 'GARANTI',
      bankName: 'Garanti BBVA',
      environment: config.environment || 'TEST',
      apiKey: config.apiKey || process.env.GARANTI_API_KEY || '',
      apiSecret: config.apiSecret || process.env.GARANTI_API_SECRET || '',
      username: config.username || process.env.GARANTI_USERNAME || '',
      password: config.password || process.env.GARANTI_PASSWORD || '',
      customerId: config.customerId || process.env.GARANTI_CUSTOMER_ID || '',
      baseURL: config.environment === 'PRODUCTION'
        ? 'https://api.garantibbva.com.tr'
        : 'https://api-test.garantibbva.com.tr',
      timeout: 30000,
    };

    super(fullConfig);
    this.logOperation('Garanti BBVA Service Initialized', { environment: fullConfig.environment });
  }

  /**
   * Authenticate with Garanti API
   * Uses API Key + Signature authentication
   */
  async authenticate(): Promise<void> {
    try {
      this.logOperation('Authenticating with Garanti BBVA');

      const timestamp = this.getTimestamp();
      const signature = this.generateSignature(
        `${this.config.apiKey}${timestamp}`,
        this.config.apiSecret
      );

      const response = await this.client.post<{
        success: boolean;
        accessToken: string;
        expiresIn: number;
      }>(
        '/v1/auth/token',
        {
          apiKey: this.config.apiKey,
          timestamp,
          signature,
          username: this.config.username,
          password: this.config.password,
        }
      );

      if (response.data.success) {
        this.accessToken = response.data.accessToken;
        this.tokenExpiry = new Date(Date.now() + response.data.expiresIn * 1000);

        // Set authorization header
        this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
        this.client.defaults.headers.common['X-Api-Key'] = this.config.apiKey;

        this.logOperation('Authentication successful', {
          expiresIn: response.data.expiresIn,
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
        this.client.get<{ success: boolean; accounts: GarantiAccount[] }>(
          '/v1/accounts',
          {
            params: {
              customerId: this.config.customerId,
            },
          }
        )
      );

      if (!response.data.success) {
        throw new Error('Failed to fetch accounts');
      }

      const accounts: BankAccount[] = response.data.accounts.map(acc => this.mapAccount(acc));

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
        errorCode: error.response?.data?.errorCode,
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
        this.client.get<{ success: boolean; account: GarantiAccount }>(
          `/v1/accounts/${accountId}`
        )
      );

      if (!response.data.success) {
        return null;
      }

      return this.mapAccount(response.data.account);
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
          success: boolean;
          transactions: GarantiTransaction[];
          totalCount: number;
          page: number;
          totalPages: number;
        }>(
          `/v1/accounts/${request.accountId}/transactions`,
          {
            startDate: request.startDate.toISOString().split('T')[0],
            endDate: request.endDate.toISOString().split('T')[0],
            minAmount: request.minAmount,
            maxAmount: request.maxAmount,
            transactionType: request.transactionType === 'ALL' ? undefined : request.transactionType,
            page: request.page || 1,
            limit: request.limit || 100,
          }
        )
      );

      if (!response.data.success) {
        throw new Error('Failed to fetch transactions');
      }

      const transactions: BankTransaction[] = response.data.transactions.map(tx => 
        this.mapTransaction(tx)
      );

      this.logOperation('Transaction history fetched', {
        count: transactions.length,
        totalCount: response.data.totalCount,
      });

      return {
        success: true,
        transactions,
        totalCount: response.data.totalCount,
        page: response.data.page,
        totalPages: response.data.totalPages,
      };
    } catch (error: any) {
      logger.error('Failed to fetch transaction history', { error, request });
      return {
        success: false,
        errorMessage: error.message,
        errorCode: error.response?.data?.errorCode,
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
          success: boolean;
          transferId?: string;
          referenceNumber?: string;
          transactionDate?: string;
          amount: number;
          fee?: number;
          error?: {
            message: string;
            code: string;
          };
        }>(
          '/v1/transfers',
          {
            fromAccount: request.fromAccount,
            toAccount: request.toAccount,
            toIban: request.toIban ? this.formatIban(request.toIban) : undefined,
            amount: request.amount,
            currency: request.currency,
            description: request.description,
            transferType: request.transferType,
            beneficiaryName: request.beneficiaryName,
          }
        )
      );

      if (!response.data.success) {
        return {
          success: false,
          amount: request.amount,
          errorMessage: response.data.error?.message,
          errorCode: response.data.error?.code,
        };
      }

      this.logOperation('Transfer successful', {
        transferId: response.data.transferId,
        referenceNumber: response.data.referenceNumber,
      });

      return {
        success: true,
        transferId: response.data.transferId,
        referenceNumber: response.data.referenceNumber,
        transactionDate: response.data.transactionDate ? new Date(response.data.transactionDate) : undefined,
        amount: response.data.amount,
        fee: response.data.fee,
      };
    } catch (error: any) {
      logger.error('Transfer failed', { error, request });
      return {
        success: false,
        amount: request.amount,
        errorMessage: error.message,
        errorCode: error.response?.data?.errorCode,
      };
    }
  }

  /**
   * Map Garanti account to standard format
   */
  private mapAccount(garantiAccount: GarantiAccount): BankAccount {
    return {
      accountId: garantiAccount.accountNumber,
      accountNumber: garantiAccount.accountNumber,
      iban: garantiAccount.iban,
      accountName: garantiAccount.accountName,
      accountType: this.mapAccountType(garantiAccount.accountType),
      currency: garantiAccount.currency,
      balance: garantiAccount.balance,
      availableBalance: garantiAccount.availableBalance,
      blockedAmount: garantiAccount.blockedAmount,
      branchCode: garantiAccount.branchCode,
      branchName: garantiAccount.branchName,
      status: garantiAccount.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      openingDate: garantiAccount.openDate ? new Date(garantiAccount.openDate) : undefined,
      lastTransactionDate: garantiAccount.lastTransactionDate 
        ? new Date(garantiAccount.lastTransactionDate) 
        : undefined,
    };
  }

  /**
   * Map Garanti transaction to standard format
   */
  private mapTransaction(garantiTx: GarantiTransaction): BankTransaction {
    return {
      transactionId: garantiTx.transactionId,
      accountId: garantiTx.accountNumber,
      transactionDate: new Date(garantiTx.transactionDate),
      valueDate: new Date(garantiTx.valueDate),
      description: garantiTx.description,
      amount: Math.abs(garantiTx.amount),
      currency: garantiTx.currency,
      transactionType: garantiTx.type === 'DEBIT' || garantiTx.amount < 0 ? 'DEBIT' : 'CREDIT',
      category: garantiTx.category,
      reference: garantiTx.reference,
      balance: garantiTx.balance,
      counterpartyName: garantiTx.counterparty?.name,
      counterpartyAccount: garantiTx.counterparty?.account,
      counterpartyIban: garantiTx.counterparty?.iban,
      channel: garantiTx.channel,
    };
  }

  /**
   * Map account type
   */
  private mapAccountType(type: string): 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'DEPOSIT' {
    const typeMap: Record<string, 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'DEPOSIT'> = {
      'CHECKING': 'CHECKING',
      'SAVINGS': 'SAVINGS',
      'CREDIT': 'CREDIT',
      'DEPOSIT': 'DEPOSIT',
      'CURRENT': 'CHECKING',
      'TIME_DEPOSIT': 'DEPOSIT',
    };
    return typeMap[type] || 'CHECKING';
  }
}

export default GarantiService;
