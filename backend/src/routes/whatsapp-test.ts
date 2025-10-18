import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/whatsapp-test/status:
 *   get:
 *     summary: Test WhatsApp service status
 *     tags: [WhatsApp Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: WhatsApp test status
 */
router.get('/status', authenticate, async (req: any, res: any) => {
  try {
    const config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? '****' : null,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || null,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || null,
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
      webhookToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ? '****' : null,
      appSecret: process.env.WHATSAPP_APP_SECRET ? '****' : null
    };

    const isConfigured = !!(
      process.env.WHATSAPP_ACCESS_TOKEN && 
      process.env.WHATSAPP_PHONE_NUMBER_ID
    );

    res.json({
      success: true,
      message: `WhatsApp API is ${isConfigured ? 'configured' : 'not configured'}`,
      config,
      configured: isConfigured,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('WhatsApp test status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get WhatsApp status',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/whatsapp-test/send-test:
 *   post:
 *     summary: Send test WhatsApp message
 *     tags: [WhatsApp Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient phone number (with country code)
 *                 example: "+905551234567"
 *               message:
 *                 type: string
 *                 description: Test message content
 *                 example: "Hello! This is a test message from Canary Digital."
 */
router.post('/send-test', authenticate, async (req: any, res: any) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    // Check if WhatsApp is configured
    if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp API is not configured. Please set environment variables.',
        required: [
          'WHATSAPP_ACCESS_TOKEN',
          'WHATSAPP_PHONE_NUMBER_ID'
        ]
      });
    }

    // For testing, we'll just simulate the response
    const testResponse = {
      success: true,
      message: 'Test message would be sent successfully',
      data: {
        messageId: `test_${Date.now()}`,
        to: to,
        content: message,
        status: 'simulated',
        timestamp: new Date().toISOString()
      },
      note: 'This is a simulated response. Real WhatsApp API integration requires valid credentials.'
    };

    res.json(testResponse);

  } catch (error: any) {
    console.error('WhatsApp test send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test message',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/whatsapp-test/templates:
 *   get:
 *     summary: List available WhatsApp message templates
 *     tags: [WhatsApp Test]
 *     security:
 *       - bearerAuth: []
 */
router.get('/templates', authenticate, async (req: any, res: any) => {
  try {
    const templates = [
      {
        name: 'order_confirmation',
        language: 'tr',
        category: 'TRANSACTIONAL',
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'Sipariş Onayı'
          },
          {
            type: 'BODY',
            text: 'Merhaba {{1}}, {{2}} numaralı siparişiniz onaylandı. Teslimat tarihi: {{3}}'
          }
        ]
      },
      {
        name: 'inspection_reminder',
        language: 'tr', 
        category: 'TRANSACTIONAL',
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'Muayene Hatırlatması'
          },
          {
            type: 'BODY',
            text: 'Sayın {{1}}, {{2}} tarihinde {{3}} ekipmanının muayenesi planlandı.'
          }
        ]
      }
    ];

    res.json({
      success: true,
      templates,
      count: templates.length,
      note: 'These are sample templates. In production, templates would be retrieved from WhatsApp Business API.'
    });

  } catch (error: any) {
    console.error('Templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get templates',
      error: error.message
    });
  }
});

export default router;
