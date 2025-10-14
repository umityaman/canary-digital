import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from './auth';
import {
  testWhatsAppService,
  sendOrderConfirmationWhatsApp,
  sendPickupReminderWhatsApp,
  sendReturnReminderWhatsApp,
  sendPaymentReminderWhatsApp,
  sendPaymentConfirmationWhatsApp,
  messageTemplates,
} from '../services/whatsapp.service';

const router = Router();

// Test WhatsApp Connection
router.post('/test', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await testWhatsAppService(phoneNumber);

    if (result.success) {
      res.json({
        message: 'WhatsApp test message sent successfully',
        messageSid: result.messageSid,
        phoneNumber,
      });
    } else {
      res.status(500).json({
        error: 'Failed to send WhatsApp message',
        details: result.error,
      });
    }
  } catch (error: any) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Test Order Confirmation Message
router.post('/test-order-confirmation', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await sendOrderConfirmationWhatsApp({
      customerName: 'Test Müşteri',
      customerPhone: phoneNumber,
      orderNumber: 'ORD-2025-001',
      totalAmount: 5000,
      pickupDate: '15 Ocak 2025',
      returnDate: '20 Ocak 2025',
    });

    if (result.success) {
      res.json({
        message: 'Order confirmation sent successfully',
        messageSid: result.messageSid,
      });
    } else {
      res.status(500).json({
        error: 'Failed to send message',
        details: result.error,
      });
    }
  } catch (error: any) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Test Pickup Reminder
router.post('/test-pickup-reminder', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await sendPickupReminderWhatsApp({
      customerName: 'Test Müşteri',
      customerPhone: phoneNumber,
      orderNumber: 'ORD-2025-001',
      pickupDate: 'Bugün',
      pickupTime: '14:00',
      equipmentCount: 3,
    });

    if (result.success) {
      res.json({
        message: 'Pickup reminder sent successfully',
        messageSid: result.messageSid,
      });
    } else {
      res.status(500).json({
        error: 'Failed to send message',
        details: result.error,
      });
    }
  } catch (error: any) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Test Return Reminder
router.post('/test-return-reminder', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await sendReturnReminderWhatsApp({
      customerName: 'Test Müşteri',
      customerPhone: phoneNumber,
      orderNumber: 'ORD-2025-001',
      returnDate: 'Bugün',
      returnTime: '17:00',
      equipmentCount: 3,
    });

    if (result.success) {
      res.json({
        message: 'Return reminder sent successfully',
        messageSid: result.messageSid,
      });
    } else {
      res.status(500).json({
        error: 'Failed to send message',
        details: result.error,
      });
    }
  } catch (error: any) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Test Payment Reminder
router.post('/test-payment-reminder', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await sendPaymentReminderWhatsApp({
      customerName: 'Test Müşteri',
      customerPhone: phoneNumber,
      orderNumber: 'ORD-2025-001',
      dueAmount: 2500,
      dueDate: '10 Ocak 2025',
      daysOverdue: 3,
    });

    if (result.success) {
      res.json({
        message: 'Payment reminder sent successfully',
        messageSid: result.messageSid,
      });
    } else {
      res.status(500).json({
        error: 'Failed to send message',
        details: result.error,
      });
    }
  } catch (error: any) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Test Payment Confirmation
router.post('/test-payment-confirmation', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await sendPaymentConfirmationWhatsApp({
      customerName: 'Test Müşteri',
      customerPhone: phoneNumber,
      orderNumber: 'ORD-2025-001',
      paidAmount: 5000,
      paymentMethod: 'Kredi Kartı',
      receiptUrl: 'https://canary.com/receipt/123',
    });

    if (result.success) {
      res.json({
        message: 'Payment confirmation sent successfully',
        messageSid: result.messageSid,
      });
    } else {
      res.status(500).json({
        error: 'Failed to send message',
        details: result.error,
      });
    }
  } catch (error: any) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get All Message Templates
router.get('/templates', authenticateToken, async (req: Request, res: Response) => {
  try {
    const templates = {
      orderConfirmation: 'Order confirmation with details',
      pickupReminder: 'Pickup reminder for today',
      returnReminder: 'Return reminder for today',
      paymentReminder: 'Payment due reminder',
      paymentConfirmation: 'Payment received confirmation',
      invoiceSent: 'Invoice sent notification',
      latePaymentWarning: 'Late payment warning',
      orderCancelled: 'Order cancelled notification',
      welcomeMessage: 'Welcome new customer',
      equipmentDamageReport: 'Equipment damage report',
    };

    res.json({
      message: 'Available WhatsApp message templates',
      templates,
      totalCount: Object.keys(templates).length,
    });
  } catch (error: any) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
