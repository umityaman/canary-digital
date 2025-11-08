import { BaseBankService, BankConfig } from './baseBankService';
import AkbankService from './akbankService';
import GarantiService from './garantiService';
import IsBankService from './isbankService';
import logger from '../../config/logger';

/**
 * Bank Integration Manager
 * 
 * Factory pattern for creating bank service instances
 * Manages multiple bank connections
 * Provides unified interface for all banks
 */

export type BankCode = 'AKBANK' | 'GARANTI' | 'ISBANK' | 'YAPIKREDI' | 'FINANSBANK';

export class BankIntegrationManager {
  private services: Map<BankCode, BaseBankService> = new Map();

  constructor() {
    logger.info('Bank Integration Manager initialized');
  }

  /**
   * Create and register a bank service
   */
  registerBank(bankCode: BankCode, config: Partial<BankConfig>): BaseBankService {
    logger.info(`Registering bank: ${bankCode}`);

    let service: BaseBankService;

    switch (bankCode) {
      case 'AKBANK':
        service = new AkbankService(config);
        break;
      
      case 'GARANTI':
        service = new GarantiService(config);
        break;
      
      case 'ISBANK':
        service = new IsBankService(config);
        break;
      
      case 'YAPIKREDI':
        // TODO: Implement YapıKredi service
        throw new Error('YapıKredi service not yet implemented');
      
      case 'FINANSBANK':
        // TODO: Implement Finansbank service
        throw new Error('Finansbank service not yet implemented');
      
      default:
        throw new Error(`Unsupported bank: ${bankCode}`);
    }

    this.services.set(bankCode, service);
    logger.info(`Bank registered successfully: ${bankCode}`);
    
    return service;
  }

  /**
   * Get a registered bank service
   */
  getBank(bankCode: BankCode): BaseBankService {
    const service = this.services.get(bankCode);
    
    if (!service) {
      throw new Error(`Bank not registered: ${bankCode}. Call registerBank() first.`);
    }
    
    return service;
  }

  /**
   * Check if bank is registered
   */
  isRegistered(bankCode: BankCode): boolean {
    return this.services.has(bankCode);
  }

  /**
   * Get all registered banks
   */
  getRegisteredBanks(): BankCode[] {
    return Array.from(this.services.keys());
  }

  /**
   * Remove a bank service
   */
  unregisterBank(bankCode: BankCode): boolean {
    const result = this.services.delete(bankCode);
    if (result) {
      logger.info(`Bank unregistered: ${bankCode}`);
    }
    return result;
  }

  /**
   * Clear all registered banks
   */
  clearAll(): void {
    this.services.clear();
    logger.info('All banks cleared from manager');
  }

  /**
   * Auto-register banks from environment variables
   */
  autoRegisterFromEnv(): void {
    logger.info('Auto-registering banks from environment');

    // Akbank
    if (process.env.AKBANK_API_KEY) {
      try {
        this.registerBank('AKBANK', {
          environment: (process.env.AKBANK_ENVIRONMENT as 'TEST' | 'PRODUCTION') || 'TEST',
          apiKey: process.env.AKBANK_API_KEY,
          apiSecret: process.env.AKBANK_API_SECRET,
          clientId: process.env.AKBANK_CLIENT_ID,
          username: process.env.AKBANK_USERNAME,
          password: process.env.AKBANK_PASSWORD,
          customerId: process.env.AKBANK_CUSTOMER_ID,
        });
        logger.info('Akbank auto-registered');
      } catch (error: any) {
        logger.error('Failed to auto-register Akbank', { error: error.message });
      }
    }

    // Garanti BBVA
    if (process.env.GARANTI_API_KEY) {
      try {
        this.registerBank('GARANTI', {
          environment: (process.env.GARANTI_ENVIRONMENT as 'TEST' | 'PRODUCTION') || 'TEST',
          apiKey: process.env.GARANTI_API_KEY,
          apiSecret: process.env.GARANTI_API_SECRET,
          username: process.env.GARANTI_USERNAME,
          password: process.env.GARANTI_PASSWORD,
          customerId: process.env.GARANTI_CUSTOMER_ID,
        });
        logger.info('Garanti BBVA auto-registered');
      } catch (error: any) {
        logger.error('Failed to auto-register Garanti', { error: error.message });
      }
    }

    // İş Bankası
    if (process.env.ISBANK_API_KEY) {
      try {
        this.registerBank('ISBANK', {
          environment: (process.env.ISBANK_ENVIRONMENT as 'TEST' | 'PRODUCTION') || 'TEST',
          apiKey: process.env.ISBANK_API_KEY,
          apiSecret: process.env.ISBANK_API_SECRET,
          clientId: process.env.ISBANK_CLIENT_ID,
          username: process.env.ISBANK_USERNAME,
          password: process.env.ISBANK_PASSWORD,
          customerId: process.env.ISBANK_CUSTOMER_ID,
        });
        logger.info('İş Bankası auto-registered');
      } catch (error: any) {
        logger.error('Failed to auto-register İş Bankası', { error: error.message });
      }
    }

    const registered = this.getRegisteredBanks();
    logger.info(`Auto-registration complete. Banks: ${registered.join(', ') || 'none'}`);
  }
}

// Singleton instance
export const bankManager = new BankIntegrationManager();

// Auto-register on module load
bankManager.autoRegisterFromEnv();

export default bankManager;
