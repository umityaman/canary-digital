import { Request, Response } from 'express';
import { whatsAppService } from '../services/WhatsAppService';
import { prisma } from '../database';
import logger from '../config/logger';

export class WhatsAppController {
  /**
   * Get WhatsApp service status
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = whatsAppService.getServiceStatus();
      
      res.json({
        success: true,
        status,
        message: status.configured ? 'WhatsApp service is configured' : 'WhatsApp service needs configuration'
      });
    } catch (error: any) {
      logger.error('Failed to get WhatsApp status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service status',
        error: error.message
      });
    }
  }

  /**
   * Send text message
   */
  async sendTextMessage(req: Request, res: Response): Promise<void> {
    try {
      const { to, message } = req.body;
      const companyId = req.user?.companyId;

      if (!to || !message) {
        res.status(400).json({
          success: false,
          message: 'Phone number and message are required'
        });
        return;
      }

      const result = await whatsAppService.sendTextMessage(to, message);

      res.json({
        success: true,
        data: result,
        message: 'Text message sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send text message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send text message',
        error: error.message
      });
    }
  }

  /**
   * Send template message
   */
  async sendTemplateMessage(req: Request, res: Response): Promise<void> {
    try {
      const { to, template } = req.body;
      const companyId = req.user?.companyId;

      if (!to || !template || !template.name) {
        res.status(400).json({
          success: false,
          message: 'Phone number, template name are required'
        });
        return;
      }

      const result = await whatsAppService.sendTemplateMessage(to, template);

      res.json({
        success: true,
        data: result,
        message: 'Template message sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send template message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send template message',
        error: error.message
      });
    }
  }

  /**
   * Send media message
   */
  async sendMediaMessage(req: Request, res: Response): Promise<void> {
    try {
      const { to, type, media } = req.body;
      const companyId = req.user?.companyId;

      if (!to || !type || !media) {
        res.status(400).json({
          success: false,
          message: 'Phone number, media type, and media data are required'
        });
        return;
      }

      const result = await whatsAppService.sendMediaMessage({ to, type, media });

      res.json({
        success: true,
        data: result,
        message: 'Media message sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send media message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send media message',
        error: error.message
      });
    }
  }

  /**
   * Send interactive message
   */
  async sendInteractiveMessage(req: Request, res: Response): Promise<void> {
    try {
      const { to, type, header, body, footer, action } = req.body;
      const companyId = req.user?.companyId;

      if (!to || !type || !body || !action) {
        res.status(400).json({
          success: false,
          message: 'Phone number, type, body, and action are required'
        });
        return;
      }

      const message = {
        to,
        type,
        ...(header && { header }),
        body,
        ...(footer && { footer }),
        action
      };

      const result = await whatsAppService.sendInteractiveMessage(message);

      res.json({
        success: true,
        data: result,
        message: 'Interactive message sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send interactive message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send interactive message',
        error: error.message
      });
    }
  }

  /**
   * Upload media
   */
  async uploadMedia(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      
      if (!file) {
        res.status(400).json({
          success: false,
          message: 'Media file is required'
        });
        return;
      }

      const mediaId = await whatsAppService.uploadMedia(file.buffer, file.mimetype);

      res.json({
        success: true,
        data: { mediaId },
        message: 'Media uploaded successfully'
      });
    } catch (error: any) {
      logger.error('Failed to upload media:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload media',
        error: error.message
      });
    }
  }

  /**
   * Get messages
   */
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { 
        page = 1, 
        limit = 50, 
        phone, 
        type, 
        status,
        startDate,
        endDate
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {
        companyId: companyId
      };

      // Add filters
      if (phone) {
        where.OR = [
          { from: { contains: phone as string } },
          { to: { contains: phone as string } }
        ];
      }

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string);
        }
      }

      const [messages, total] = await Promise.all([
        prisma.whatsAppMessage.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.whatsAppMessage.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          messages: messages.map(msg => ({
            ...msg,
            content: JSON.parse(msg.content)
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      logger.error('Failed to get messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get messages',
        error: error.message
      });
    }
  }

  /**
   * Get message by ID
   */
  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const message = await prisma.whatsAppMessage.findFirst({
        where: {
          id: Number(id),
          companyId: companyId
        }
      });

      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          ...message,
          content: JSON.parse(message.content)
        }
      });
    } catch (error: any) {
      logger.error('Failed to get message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get message',
        error: error.message
      });
    }
  }

  /**
   * Get conversation
   */
  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.params;
      const companyId = req.user?.companyId;
      const { page = 1, limit = 50 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const messages = await prisma.whatsAppMessage.findMany({
        where: {
          companyId: companyId,
          OR: [
            { from: phoneNumber },
            { to: phoneNumber }
          ]
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      });

      res.json({
        success: true,
        data: {
          phoneNumber,
          messages: messages.map(msg => ({
            ...msg,
            content: JSON.parse(msg.content)
          }))
        }
      });
    } catch (error: any) {
      logger.error('Failed to get conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversation',
        error: error.message
      });
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;

      const result = await whatsAppService.markAsRead(messageId);

      res.json({
        success: true,
        data: result,
        message: 'Message marked as read'
      });
    } catch (error: any) {
      logger.error('Failed to mark message as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark message as read',
        error: error.message
      });
    }
  }

  /**
   * Handle webhook verification
   */
  async verifyWebhook(req: Request, res: Response): Promise<void> {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && whatsAppService.verifyWebhook(token as string)) {
        logger.info('WhatsApp webhook verified successfully');
        res.status(200).send(challenge);
      } else {
        logger.warn('WhatsApp webhook verification failed');
        res.status(403).send('Forbidden');
      }
    } catch (error: any) {
      logger.error('Webhook verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook verification failed',
        error: error.message
      });
    }
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookData = req.body;

      // Process webhook asynchronously
      whatsAppService.processWebhook(webhookData).catch(error => {
        logger.error('Async webhook processing failed:', error);
      });

      // Acknowledge webhook immediately
      res.status(200).send('OK');
    } catch (error: any) {
      logger.error('Webhook handling error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook handling failed',
        error: error.message
      });
    }
  }

  /**
   * Send bulk messages
   */
  async sendBulkMessages(req: Request, res: Response): Promise<void> {
    try {
      const { recipients, message, type = 'text' } = req.body;
      const companyId = req.user?.companyId;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Recipients array is required'
        });
        return;
      }

      if (!message) {
        res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
        return;
      }

      const results: any[] = [];
      const errors: any[] = [];

      // Send messages with delay to avoid rate limiting
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        
        try {
          let result;
          if (type === 'text') {
            result = await whatsAppService.sendTextMessage(recipient, message);
          } else if (type === 'template') {
            result = await whatsAppService.sendTemplateMessage(recipient, message);
          }
          
          results.push({ recipient, success: true, result });
          
          // Add delay between messages (1 second)
          if (i < recipients.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error: any) {
          errors.push({ recipient, success: false, error: error.message });
        }
      }

      res.json({
        success: true,
        data: {
          total: recipients.length,
          successful: results.length,
          failed: errors.length,
          results,
          errors
        },
        message: `Bulk messages sent: ${results.length} successful, ${errors.length} failed`
      });
    } catch (error: any) {
      logger.error('Failed to send bulk messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send bulk messages',
        error: error.message
      });
    }
  }

  /**
   * Get analytics/statistics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { startDate, endDate } = req.query;

      const where: any = {
        companyId: companyId
      };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string);
        }
      }

      const [
        totalMessages,
        sentMessages,
        receivedMessages,
        messagesByType,
        messagesByStatus
      ] = await Promise.all([
        prisma.whatsAppMessage.count({ where }),
        prisma.whatsAppMessage.count({ where: { ...where, from: { not: null } } }),
        prisma.whatsAppMessage.count({ where: { ...where, to: { not: null } } }),
        prisma.whatsAppMessage.groupBy({
          by: ['type'],
          where,
          _count: { id: true }
        }),
        prisma.whatsAppMessage.groupBy({
          by: ['status'],
          where,
          _count: { id: true }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalMessages,
          sentMessages,
          receivedMessages,
          messagesByType: messagesByType.map(item => ({
            type: item.type,
            count: item._count.id
          })),
          messagesByStatus: messagesByStatus.map(item => ({
            status: item.status,
            count: item._count.id
          }))
        }
      });
    } catch (error: any) {
      logger.error('Failed to get analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get analytics',
        error: error.message
      });
    }
  }
}

export const whatsAppController = new WhatsAppController();