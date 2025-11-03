import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Generate statement data
router.post('/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const { customerId, startDate, endDate, includePayments, includeInvoices, includeOrders } = req.body;

    if (!customerId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Customer ID and date range are required' });
    }

    // Get customer info
    const customer = await prisma.customer.findFirst({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate opening balance (transactions before start date)
    const previousInvoices = await prisma.invoice.findMany({
      where: {
        customerId,
        invoiceDate: { lt: new Date(startDate) },
      },
      select: { grandTotal: true },
    });

    const previousPayments = await prisma.payment.findMany({
      where: {
        invoice: { customerId },
        paymentDate: { lt: new Date(startDate) },
      },
      select: { amount: true },
    });

    const openingBalance = 
      previousInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0) -
      previousPayments.reduce((sum, pay) => sum + pay.amount, 0);

    // Get transactions in period
    const transactions: any[] = [];
    let runningBalance = openingBalance;

    if (includeInvoices !== false) {
      const invoices = await prisma.invoice.findMany({
        where: {
          customerId,
          invoiceDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        orderBy: { invoiceDate: 'asc' },
      });

      for (const invoice of invoices) {
        runningBalance += invoice.grandTotal;
        transactions.push({
          date: invoice.invoiceDate,
          type: 'invoice',
          description: `Fatura - ${invoice.invoiceNumber}`,
          reference: invoice.invoiceNumber,
          debit: invoice.grandTotal,
          credit: 0,
          balance: runningBalance,
        });
      }
    }

    if (includePayments !== false) {
      const payments = await prisma.payment.findMany({
        where: {
          invoice: { customerId },
          paymentDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          invoice: true,
        },
        orderBy: { paymentDate: 'asc' },
      });

      for (const payment of payments) {
        runningBalance -= payment.amount;
        transactions.push({
          date: payment.paymentDate,
          type: 'payment',
          description: `Ödeme - ${payment.paymentMethod}`,
          reference: payment.invoice?.invoiceNumber,
          debit: 0,
          credit: payment.amount,
          balance: runningBalance,
        });
      }
    }

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate summary
    const totalInvoices = transactions
      .filter(t => t.type === 'invoice')
      .reduce((sum, t) => sum + t.debit, 0);

    const totalPayments = transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.credit, 0);

    const closingBalance = runningBalance;

    const statementData = {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        openingBalance,
        totalInvoices,
        totalPayments,
        closingBalance,
      },
      transactions,
    };

    res.json(statementData);
  } catch (error) {
    console.error('Error generating statement:', error);
    res.status(500).json({ error: 'Failed to generate statement' });
  }
});

// Download as PDF
router.post('/pdf', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // For now, return a simple response
    // In production, you would use a PDF library like puppeteer or pdfkit
    res.json({ 
      success: false, 
      message: 'PDF generation will be implemented with puppeteer/pdfkit' 
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Download as Excel
router.post('/excel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // For now, return a simple response
    // In production, you would use a library like exceljs
    res.json({ 
      success: false, 
      message: 'Excel generation will be implemented with exceljs' 
    });
  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ error: 'Failed to generate Excel' });
  }
});

// Share statement via email/WhatsApp
router.post('/share', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const { 
      customerId, 
      startDate, 
      endDate, 
      format, 
      sendEmail, 
      sendWhatsApp, 
      message 
    } = req.body;

    // Get customer
    const customer = await prisma.customer.findFirst({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Here you would:
    // 1. Generate the PDF/Excel file
    // 2. Send via email (using your email service)
    // 3. Send via WhatsApp (using your WhatsApp service)

    // For now, return success
    res.json({
      success: true,
      message: `Ekstre ${customer.name} için hazırlanıyor ve gönderilecek`,
    });
  } catch (error) {
    console.error('Error sharing statement:', error);
    res.status(500).json({ error: 'Failed to share statement' });
  }
});

// Get share history
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    // In production, you would have a StatementHistory table
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
