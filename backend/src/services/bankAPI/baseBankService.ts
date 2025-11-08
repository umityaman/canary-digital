import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import logger from '../../config/logger';

/**
 * Base Bank Service - Abstract class for Turkish bank integrations
 * 
 * Supported Banks:
 * - Akbank
 * - Garanti BBVA
 * - İş Bankası
 * - Yapı Kredi
 * - QNB Finansbank
 * 
 * Common Features:
 * - Account balance inquiry
 * - Transaction history
 * - Money transfer
 * - Payment operations
 */

export interface BankConfig {
  bankCode: string;
  bankName: string;
  environment: 'TEST' | 'PRODUCTION';
  apiKey: string;
  apiSecret: string;
  clientId?: string;
  username?: string;
  password?: string;
  customerId?: string;
  baseURL: string;
  timeout?: number;
}

export interface BankAccount {
  accountId: string;
  accountNumber: string;
  iban: string;
  accountName: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'DEPOSIT';
  currency: string;
  balance: number;
  availableBalance: number;
  blockedAmount?: number;
  branchCode?: string;
  branchName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  openingDate?: Date;
  lastTransactionDate?: Date;
}

export interface BankTransaction {
  transactionId: string;
  accountId: string;
  transactionDate: Date;
  valueDate: Date;
  description: string;
  amount: number;
  currency: string;
  transactionType: 'DEBIT' | 'CREDIT';
  category?: string;
  reference?: string;
  balance?: number;
  counterpartyName?: string;
  counterpartyAccount?: string;
  counterpartyIban?: string;
  channel?: string;
}

export interface TransferRequest {
  fromAccount: string;
  toAccount: string;
  toIban?: string;
  amount: number;
  currency: string;
  description: string;
  transferType: 'EFT' | 'HAVALE' | 'FAST';
  beneficiaryName?: string;
}

export interface TransferResponse {
  success: boolean;
  transferId?: string;
  referenceNumber?: string;
  transactionDate?: Date;
  amount: number;
  fee?: number;
  errorMessage?: string;
  errorCode?: string;
}

export interface BalanceInquiryResponse {
  success: boolean;
  accounts?: BankAccount[];
  errorMessage?: string;
  errorCode?: string;
}

export interface TransactionHistoryRequest {
  accountId: string;
  startDate: Date;
  endDate: Date;
  minAmount?: number;
  maxAmount?: number;
  transactionType?: 'DEBIT' | 'CREDIT' | 'ALL';
  page?: number;
  limit?: number;
}

export interface TransactionHistoryResponse {
  success: boolean;
  transactions?: BankTransaction[];
  totalCount?: number;
  page?: number;
  totalPages?: number;
  errorMessage?: string;
  errorCode?: string;
}

export abstract class BaseBankService {
  protected config: BankConfig;
  protected client: AxiosInstance;
  protected accessToken?: string;
  protected tokenExpiry?: Date;

  constructor(config: BankConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Bank API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          bank: this.config.bankName,
          headers: config.headers,
        });
        return config;
      },
      (error) => {
        logger.error('Bank API Request Error', { error });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Bank API Response: ${response.status}`, {
          bank: this.config.bankName,
          data: response.data,
        });
        return response;
      },
      (error) => {
        logger.error('Bank API Response Error', {
          bank: this.config.bankName,
          status: error.response?.status,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Authenticate with bank API
   * Each bank has different auth mechanism (OAuth, API Key, etc.)
   */
  abstract authenticate(): Promise<void>;

  /**
   * Get account list and balances
   */
  abstract getAccounts(): Promise<BalanceInquiryResponse>;

  /**
   * Get specific account details
   */
  abstract getAccountDetails(accountId: string): Promise<BankAccount | null>;

  /**
   * Get transaction history
   */
  abstract getTransactionHistory(request: TransactionHistoryRequest): Promise<TransactionHistoryResponse>;

  /**
   * Initiate money transfer
   */
  abstract transfer(request: TransferRequest): Promise<TransferResponse>;

  /**
   * Check if token is valid
   */
  protected isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }
    return new Date() < this.tokenExpiry;
  }

  /**
   * Ensure authentication before API call
   */
  protected async ensureAuthenticated(): Promise<void> {
    if (!this.isTokenValid()) {
      await this.authenticate();
    }
  }

  /**
   * Generate HMAC signature for API authentication
   */
  protected generateSignature(data: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64');
  }

  /**
   * Generate timestamp in required format
   */
  protected getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format IBAN (remove spaces, uppercase)
   */
  protected formatIban(iban: string): string {
    return iban.replace(/\s/g, '').toUpperCase();
  }

  /**
   * Validate IBAN format
   */
  protected validateIban(iban: string): boolean {
    const formatted = this.formatIban(iban);
    
    // Turkish IBAN: TR + 2 check digits + 24 digits = 26 chars
    if (!/^TR\d{24}$/.test(formatted)) {
      return false;
    }

    // IBAN check digit validation
    const rearranged = formatted.slice(4) + formatted.slice(0, 4);
    const numericIban = rearranged
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        return code >= 65 && code <= 90 ? (code - 55).toString() : char;
      })
      .join('');

    // Mod 97 check
    let remainder = numericIban.slice(0, 2);
    for (let i = 2; i < numericIban.length; i += 7) {
      remainder = (parseInt(remainder + numericIban.slice(i, i + 7)) % 97).toString();
    }

    return parseInt(remainder) === 1;
  }

  /**
   * Parse amount from string (handles Turkish format)
   */
  protected parseAmount(amount: string | number): number {
    if (typeof amount === 'number') {
      return amount;
    }
    
    // Handle Turkish format: 1.234,56 -> 1234.56
    return parseFloat(
      amount
        .replace(/\./g, '')  // Remove thousand separators
        .replace(',', '.')   // Replace decimal comma with dot
    );
  }

  /**
   * Format amount to Turkish format
   */
  protected formatAmount(amount: number): string {
    return amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Retry logic for failed requests
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          logger.warn(`Retry attempt ${i + 1}/${maxRetries}`, {
            bank: this.config.bankName,
            error,
          });
          await this.delay(delayMs * Math.pow(2, i)); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Delay helper
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log bank operation
   */
  protected logOperation(operation: string, data?: any): void {
    logger.info(`Bank Operation: ${operation}`, {
      bank: this.config.bankName,
      environment: this.config.environment,
      data,
    });
  }

  /**
   * Handle API error
   */
  protected handleError(error: any, operation: string): never {
    logger.error(`Bank API Error: ${operation}`, {
      bank: this.config.bankName,
      error: error.message,
      response: error.response?.data,
    });

    throw new Error(
      `${this.config.bankName} API Error: ${error.response?.data?.message || error.message}`
    );
  }
}

export default BaseBankService;
