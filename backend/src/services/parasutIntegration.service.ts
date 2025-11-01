import { PrismaClient } from '@prisma/client';
import { parasutClient } from '../config/parasut';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Paraşüt Integration Service
 * Handles automatic synchronization between Canary and Paraşüt
 */
export class ParasutIntegrationService {
  /**
   * Sync customer from Canary to Paraşüt
   */
  async syncCustomer(customerId: number) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check if already synced
      if (customer.parasutId) {
        logger.info(`Customer ${customerId} already synced to Paraşüt`);
        return customer.parasutId;
      }

      // Create in Paraşüt
      const parasutContact = await parasutClient.createContact({
        name: customer.name,
        email: customer.email || undefined,
        phone: customer.phone || undefined,
        taxOffice: customer.taxOffice || undefined,
        taxNumber: customer.taxNumber || undefined,
        address: customer.address || undefined,
        contactType: customer.companyName ? 'company' : 'person'
      });

      // Update customer with Paraşüt ID
      await prisma.customer.update({
        where: { id: customerId },
        data: { parasutId: parasutContact.id }
      });

      logger.info(`Customer ${customerId} synced to Paraşüt: ${parasutContact.id}`);
      return parasutContact.id;
    } catch (error: any) {
      logger.error('Error syncing customer to Paraşüt:', error);
      throw error;
    }
  }

  /**
   * Sync invoice from Canary to Paraşüt
   */
  async syncInvoice(invoiceId: number) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          customer: true,
          items: true
        }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Check if already synced
      if (invoice.parasutInvoiceId) {
        logger.info(`Invoice ${invoiceId} already synced to Paraşüt`);
        return invoice.parasutInvoiceId;
      }

      // Ensure customer is synced
      let parasutContactId = invoice.customer.parasutId;
      if (!parasutContactId) {
        parasutContactId = await this.syncCustomer(invoice.customer.id);
      }

      // Prepare invoice items
      const items = invoice.items.map(item => ({
        productName: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate || 18,
        discountType: 'percentage' as const,
        discountValue: item.discount || 0
      }));

      // Create invoice in Paraşüt
      const parasutInvoice = await parasutClient.createInvoice({
        contactId: parasutContactId,
        invoiceDate: invoice.invoiceDate.toISOString().split('T')[0],
        dueDate: invoice.dueDate?.toISOString().split('T')[0] || invoice.invoiceDate.toISOString().split('T')[0],
        description: invoice.description || `Fatura #${invoice.invoiceNumber}`,
        items,
        invoiceType: invoice.type === 'e-invoice' ? 'sales_invoice' : 'e_archive',
        currency: invoice.currency || 'TRY'
      });

      // Update invoice with Paraşüt ID
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { 
          parasutInvoiceId: parasutInvoice.id,
          syncedToParasut: true,
          syncedAt: new Date()
        }
      });

      logger.info(`Invoice ${invoiceId} synced to Paraşüt: ${parasutInvoice.id}`);
      return parasutInvoice.id;
    } catch (error: any) {
      logger.error('Error syncing invoice to Paraşüt:', error);
      throw error;
    }
  }

  /**
   * Sync payment from Canary to Paraşüt
   */
  async syncPayment(paymentId: number) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          invoice: true
        }
      });

      if (!payment || !payment.invoice) {
        throw new Error('Payment or invoice not found');
      }

      // Ensure invoice is synced
      let parasutInvoiceId = payment.invoice.parasutInvoiceId;
      if (!parasutInvoiceId) {
        parasutInvoiceId = await this.syncInvoice(payment.invoice.id);
      }

      // Record payment in Paraşüt
      const parasutPayment = await parasutClient.recordPayment({
        invoiceId: parasutInvoiceId,
        amount: payment.amount,
        date: payment.paymentDate.toISOString().split('T')[0],
        description: payment.notes || `Ödeme #${payment.id}`
      });

      logger.info(`Payment ${paymentId} synced to Paraşüt: ${parasutPayment.id}`);
      return parasutPayment.id;
    } catch (error: any) {
      logger.error('Error syncing payment to Paraşüt:', error);
      throw error;
    }
  }

  /**
   * Sync expense from Canary to Paraşüt
   */
  async syncExpense(expenseId: number) {
    try {
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          supplier: true
        }
      });

      if (!expense) {
        throw new Error('Expense not found');
      }

      // Ensure supplier is synced (similar to customer)
      let parasutContactId = expense.supplier?.parasutId;
      if (!parasutContactId && expense.supplier) {
        // Sync supplier as contact
        const parasutContact = await parasutClient.createContact({
          name: expense.supplier.name,
          email: expense.supplier.email || undefined,
          phone: expense.supplier.phone || undefined,
          taxOffice: expense.supplier.taxOffice || undefined,
          taxNumber: expense.supplier.taxNumber || undefined,
          address: expense.supplier.address || undefined,
          contactType: 'company'
        });

        parasutContactId = parasutContact.id;

        // Update supplier with Paraşüt ID
        await prisma.supplier.update({
          where: { id: expense.supplier.id },
          data: { parasutId: parasutContact.id }
        });
      }

      logger.info(`Expense ${expenseId} prepared for sync to Paraşüt`);
      // Note: Actual expense sync would use purchase_bills endpoint
      return true;
    } catch (error: any) {
      logger.error('Error syncing expense to Paraşüt:', error);
      throw error;
    }
  }

  /**
   * Bulk sync all pending items
   */
  async bulkSync(companyId: number) {
    try {
      logger.info(`Starting bulk sync for company ${companyId}`);

      const results = {
        customers: 0,
        invoices: 0,
        payments: 0,
        errors: [] as string[]
      };

      // Sync customers without Paraşüt ID
      const customers = await prisma.customer.findMany({
        where: {
          companyId,
          parasutId: null
        },
        take: 50 // Limit to prevent rate limiting
      });

      for (const customer of customers) {
        try {
          await this.syncCustomer(customer.id);
          results.customers++;
        } catch (error: any) {
          results.errors.push(`Customer ${customer.id}: ${error.message}`);
        }
      }

      // Sync invoices without Paraşüt ID
      const invoices = await prisma.invoice.findMany({
        where: {
          companyId,
          parasutInvoiceId: null,
          status: { not: 'draft' }
        },
        take: 50
      });

      for (const invoice of invoices) {
        try {
          await this.syncInvoice(invoice.id);
          results.invoices++;
        } catch (error: any) {
          results.errors.push(`Invoice ${invoice.id}: ${error.message}`);
        }
      }

      // Sync payments
      const payments = await prisma.payment.findMany({
        where: {
          companyId,
          invoice: {
            parasutInvoiceId: { not: null }
          }
        },
        take: 50
      });

      for (const payment of payments) {
        try {
          await this.syncPayment(payment.id);
          results.payments++;
        } catch (error: any) {
          results.errors.push(`Payment ${payment.id}: ${error.message}`);
        }
      }

      logger.info('Bulk sync completed:', results);
      return results;
    } catch (error: any) {
      logger.error('Error in bulk sync:', error);
      throw error;
    }
  }

  /**
   * Get sync status for a company
   */
  async getSyncStatus(companyId: number) {
    try {
      const [
        totalCustomers,
        syncedCustomers,
        totalInvoices,
        syncedInvoices,
        totalPayments
      ] = await Promise.all([
        prisma.customer.count({ where: { companyId } }),
        prisma.customer.count({ where: { companyId, parasutId: { not: null } } }),
        prisma.invoice.count({ where: { companyId } }),
        prisma.invoice.count({ where: { companyId, parasutInvoiceId: { not: null } } }),
        prisma.payment.count({ where: { companyId } })
      ]);

      return {
        customers: {
          total: totalCustomers,
          synced: syncedCustomers,
          pending: totalCustomers - syncedCustomers,
          percentage: totalCustomers > 0 ? Math.round((syncedCustomers / totalCustomers) * 100) : 0
        },
        invoices: {
          total: totalInvoices,
          synced: syncedInvoices,
          pending: totalInvoices - syncedInvoices,
          percentage: totalInvoices > 0 ? Math.round((syncedInvoices / totalInvoices) * 100) : 0
        },
        payments: {
          total: totalPayments
        },
        isConfigured: parasutClient.isConfigured(),
        lastSyncAt: new Date()
      };
    } catch (error: any) {
      logger.error('Error getting sync status:', error);
      throw error;
    }
  }

  /**
   * Webhook handler for Paraşüt events
   */
  async handleWebhook(webhookData: any) {
    try {
      logger.info('Processing Paraşüt webhook:', webhookData.event_type);

      switch (webhookData.event_type) {
        case 'sales_invoice.created':
          await this.handleInvoiceCreated(webhookData);
          break;
        case 'sales_invoice.paid':
          await this.handleInvoicePaid(webhookData);
          break;
        case 'contact.created':
          await this.handleContactCreated(webhookData);
          break;
        default:
          logger.info(`Unhandled webhook event: ${webhookData.event_type}`);
      }

      return { success: true };
    } catch (error: any) {
      logger.error('Error handling Paraşüt webhook:', error);
      throw error;
    }
  }

  private async handleInvoiceCreated(webhookData: any) {
    // Handle invoice created in Paraşüt
    logger.info('Invoice created webhook received');
    // Implementation depends on business logic
  }

  private async handleInvoicePaid(webhookData: any) {
    // Handle invoice payment in Paraşüt
    logger.info('Invoice paid webhook received');
    // Implementation depends on business logic
  }

  private async handleContactCreated(webhookData: any) {
    // Handle contact created in Paraşüt
    logger.info('Contact created webhook received');
    // Implementation depends on business logic
  }

  /**
   * Auto-sync scheduler - runs periodically
   */
  async autoSync(companyId: number) {
    try {
      logger.info(`Auto-sync started for company ${companyId}`);

      // Get company settings
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        throw new Error('Company not found');
      }

      // Run bulk sync
      const results = await this.bulkSync(companyId);

      // Log results
      logger.info(`Auto-sync completed for company ${companyId}:`, results);

      return results;
    } catch (error: any) {
      logger.error('Error in auto-sync:', error);
      throw error;
    }
  }
}

export default new ParasutIntegrationService();
