import { Request, Response } from 'express';
import { parasutService } from '../services/ParasutService';
import { prisma } from '../database';
const p = prisma as any;

export class ParasutController {

  /**
   * Get Parasut connection status
   */
  async getConnectionStatus(req: Request, res: Response) {
    try {
      if (!parasutService.isParasutEnabled()) {
        return res.json({
          success: false,
          connected: false,
          message: 'Parasut credentials not configured'
        });
      }

      // Test connection by getting company info
      const companyInfo = await parasutService.getCompanyInfo();
      
      res.json({
        success: true,
        connected: true,
        company: companyInfo,
        message: 'Parasut connection active'
      });

    } catch (error) {
      console.error('Parasut connection check error:', error);
      res.json({
        success: false,
        connected: false,
        message: 'Connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Authenticate with Parasut
   */
  async authenticate(req: Request, res: Response) {
    try {
      await parasutService.authenticate();
      
      res.json({
        success: true,
        message: 'Parasut authentication successful'
      });

    } catch (error) {
      console.error('Parasut authentication error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Sync customer with Parasut
   */
  async syncCustomer(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify customer belongs to company
      const customer = await prisma.customer.findFirst({
        where: {
          id: parseInt(customerId),
          companyId
        }
      } as any);

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const contactId = await parasutService.syncCustomer(parseInt(customerId));

      res.json({
        success: true,
        contactId,
        message: 'Customer synced with Parasut successfully'
      });

    } catch (error) {
      console.error('Customer sync error:', error);
      res.status(500).json({
        success: false,
        error: 'Customer sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create invoice from contract
   */
  async createInvoiceFromContract(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify contract belongs to company
      const contract = await (p.contract.findFirst as any)({
        where: {
          id: parseInt(contractId),
          companyId
        }
      } as any);

      if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      if (contract.parasutInvoiceId) {
        return res.status(400).json({ error: 'Invoice already exists for this contract' });
      }

      const invoice = await parasutService.createInvoiceFromContract(parseInt(contractId));

      res.json({
        success: true,
        invoice,
        message: 'Invoice created successfully'
      });

    } catch (error) {
      console.error('Invoice creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Invoice creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get invoice details
   */
  async getInvoice(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const invoice = await parasutService.getInvoice(parseInt(invoiceId));

      res.json({
        success: true,
        invoice
      });

    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search invoices
   */
  async searchInvoices(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        page = 1,
        per_page = 25,
        sort = '-issue_date',
        issue_date,
        contact_id
      } = req.query;

      const params: any = {
        page: parseInt(page as string),
        per_page: parseInt(per_page as string),
        sort: sort as string
      };

      if (issue_date) {
        params['filter[issue_date]'] = issue_date as string;
      }

      if (contact_id) {
        params['filter[contact_id]'] = parseInt(contact_id as string);
      }

      const result = await parasutService.searchInvoices(params);

      res.json({
        success: true,
        invoices: result.data,
        meta: result.meta
      });

    } catch (error) {
      console.error('Search invoices error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search invoices',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create contact (customer/supplier)
   */
  async createContact(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const contactData = req.body;
      const contact = await parasutService.createContact(contactData);

      res.json({
        success: true,
        contact,
        message: 'Contact created successfully'
      });

    } catch (error) {
      console.error('Create contact error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create contact',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search contacts
   */
  async searchContacts(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        query,
        contact_type,
        page = 1,
        per_page = 25
      } = req.query;

      const params: any = {
        page: parseInt(page as string),
        per_page: parseInt(per_page as string)
      };

      if (query) {
        params.query = query as string;
      }

      if (contact_type) {
        params.contact_type = contact_type as string;
      }

      const result = await parasutService.searchContacts(params);

      res.json({
        success: true,
        contacts: result.data,
        meta: result.meta
      });

    } catch (error) {
      console.error('Search contacts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search contacts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create product
   */
  async createProduct(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const productData = req.body;
      const product = await parasutService.createProduct(productData);

      res.json({
        success: true,
        product,
        message: 'Product created successfully'
      });

    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search products
   */
  async searchProducts(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        query,
        page = 1,
        per_page = 25
      } = req.query;

      const params: any = {
        page: parseInt(page as string),
        per_page: parseInt(per_page as string)
      };

      if (query) {
        params.query = query as string;
      }

      const result = await parasutService.searchProducts(params);

      res.json({
        success: true,
        products: result.data,
        meta: result.meta
      });

    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search products',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Record payment for invoice
   */
  async recordPayment(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const { amount, date, account_id, description } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const paymentData = {
        account_id: parseInt(account_id),
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split('T')[0],
        description: description || 'Payment recorded from Canary ERP',
        payable_id: parseInt(invoiceId),
        payable_type: 'SalesInvoice'
      };

      const payment = await parasutService.createPayment(paymentData);

      res.json({
        success: true,
        payment,
        message: 'Payment recorded successfully'
      });

    } catch (error) {
      console.error('Record payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get company accounts
   */
  async getAccounts(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const accounts = await parasutService.getAccounts();

      res.json({
        success: true,
        accounts
      });

    } catch (error) {
      console.error('Get accounts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get accounts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Bulk sync all customers
   */
  async bulkSyncCustomers(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get all customers without Parasut contact ID
      const customers = await prisma.customer.findMany({
        where: {
          companyId,
          parasutContactId: null
        },
        select: {
          id: true,
          name: true
        }
      } as any);

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const customer of customers) {
        try {
          const contactId = await parasutService.syncCustomer(customer.id);
          results.push({
            customerId: customer.id,
            customerName: customer.name,
            contactId,
            status: 'success'
          });
          successCount++;
        } catch (error) {
          results.push({
            customerId: customer.id,
            customerName: customer.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          errorCount++;
        }
      }

      res.json({
        success: true,
        message: `Sync completed: ${successCount} successful, ${errorCount} failed`,
        results,
        summary: {
          total: customers.length,
          successful: successCount,
          failed: errorCount
        }
      });

    } catch (error) {
      console.error('Bulk sync error:', error);
      res.status(500).json({
        success: false,
        error: 'Bulk sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get synchronization status
   */
  async getSyncStatus(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Count synchronized customers
      const totalCustomers = await prisma.customer.count({
        where: { companyId }
      } as any);

      const syncedCustomers = await prisma.customer.count({
        where: {
          companyId,
          parasutContactId: { not: null }
        }
      } as any);

      // Count contracts with invoices
      const totalContracts = await (p.contract.count as any)({
        where: { companyId }
      } as any);

      const contractsWithInvoices = await (p.contract.count as any)({
        where: {
          companyId,
          parasutInvoiceId: { not: null }
        }
      } as any);

      res.json({
        success: true,
        syncStatus: {
          customers: {
            total: totalCustomers,
            synced: syncedCustomers,
            pending: totalCustomers - syncedCustomers,
            percentage: totalCustomers > 0 ? Math.round((syncedCustomers / totalCustomers) * 100) : 0
          },
          invoices: {
            total: totalContracts,
            created: contractsWithInvoices,
            pending: totalContracts - contractsWithInvoices,
            percentage: totalContracts > 0 ? Math.round((contractsWithInvoices / totalContracts) * 100) : 0
          }
        }
      });

    } catch (error) {
      console.error('Get sync status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sync status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const parasutController = new ParasutController();