import axios, { AxiosInstance } from 'axios';
import { prisma } from '../database';
import logger from '../config/logger';

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  businessAccountId: string;
  apiVersion: string;
}

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'media' | 'interactive';
  content: any;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  components?: Array<{
    type: string;
    parameters?: Array<{
      type: string;
      text?: string;
    }>;
  }>;
}

export interface WhatsAppMediaMessage {
  to: string;
  type: 'image' | 'document' | 'video' | 'audio';
  media: {
    id?: string;
    link?: string;
    caption?: string;
    filename?: string;
  };
}

export interface WhatsAppInteractiveMessage {
  to: string;
  type: 'button' | 'list';
  header?: {
    type: string;
    text?: string;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    buttons?: Array<{
      type: string;
      reply: {
        id: string;
        title: string;
      };
    }>;
    sections?: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
    }>;
  };
}

export interface WhatsAppWebhookData {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: {
            body: string;
          };
          image?: {
            caption?: string;
            mime_type: string;
            sha256: string;
            id: string;
          };
          button?: {
            text: string;
            payload: string;
          };
          interactive?: {
            type: string;
            button_reply?: {
              id: string;
              title: string;
            };
            list_reply?: {
              id: string;
              title: string;
              description?: string;
            };
          };
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
          conversation?: {
            id: string;
            expiration_timestamp?: string;
            origin: {
              type: string;
            };
          };
          pricing?: {
            billable: boolean;
            pricing_model: string;
            category: string;
          };
        }>;
      };
      field: string;
    }>;
  }>;
}

export class WhatsAppService {
  private client: AxiosInstance;
  private config: WhatsAppConfig;

  constructor() {
    this.config = {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0'
    };

    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${this.config.apiVersion}`,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info('WhatsApp API Request:', {
          url: config.url,
          method: config.method,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('WhatsApp API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info('WhatsApp API Response:', {
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error) => {
        logger.error('WhatsApp API Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Send a text message
   */
  async sendTextMessage(to: string, text: string): Promise<any> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: {
          body: text
        }
      };

      const response = await this.client.post(
        `/${this.config.phoneNumberId}/messages`,
        payload
      );

      // Save message to database
      await this.saveMessage({
        to: payload.to,
        type: 'text',
        content: { text },
        whatsapp_message_id: response.data.messages?.[0]?.id,
        status: 'sent'
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to send text message:', error);
      throw new Error(`WhatsApp text message failed: ${error.message}`);
    }
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(to: string, template: WhatsAppTemplate): Promise<any> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: template.name,
          language: {
            code: template.language
          },
          components: template.components || []
        }
      };

      const response = await this.client.post(
        `/${this.config.phoneNumberId}/messages`,
        payload
      );

      // Save message to database
      await this.saveMessage({
        to: payload.to,
        type: 'template',
        content: { template },
        whatsapp_message_id: response.data.messages?.[0]?.id,
        status: 'sent'
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to send template message:', error);
      throw new Error(`WhatsApp template message failed: ${error.message}`);
    }
  }

  /**
   * Send media message (image, document, video, audio)
   */
  async sendMediaMessage(message: WhatsAppMediaMessage): Promise<any> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(message.to),
        type: message.type,
        [message.type]: message.media
      };

      const response = await this.client.post(
        `/${this.config.phoneNumberId}/messages`,
        payload
      );

      // Save message to database
      await this.saveMessage({
        to: payload.to,
        type: message.type,
        content: { media: message.media },
        whatsapp_message_id: response.data.messages?.[0]?.id,
        status: 'sent'
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to send media message:', error);
      throw new Error(`WhatsApp media message failed: ${error.message}`);
    }
  }

  /**
   * Send interactive message (buttons or list)
   */
  async sendInteractiveMessage(message: WhatsAppInteractiveMessage): Promise<any> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(message.to),
        type: 'interactive',
        interactive: {
          type: message.type,
          ...(message.header && { header: message.header }),
          body: message.body,
          ...(message.footer && { footer: message.footer }),
          action: message.action
        }
      };

      const response = await this.client.post(
        `/${this.config.phoneNumberId}/messages`,
        payload
      );

      // Save message to database
      await this.saveMessage({
        to: payload.to,
        type: 'interactive',
        content: { interactive: payload.interactive },
        whatsapp_message_id: response.data.messages?.[0]?.id,
        status: 'sent'
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to send interactive message:', error);
      throw new Error(`WhatsApp interactive message failed: ${error.message}`);
    }
  }

  /**
   * Upload media to WhatsApp
   */
  async uploadMedia(mediaData: Buffer, mimeType: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([mediaData], { type: mimeType }));
      formData.append('type', mimeType);
      formData.append('messaging_product', 'whatsapp');

      const response = await this.client.post(
        `/${this.config.phoneNumberId}/media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.id;
    } catch (error: any) {
      logger.error('Failed to upload media:', error);
      throw new Error(`WhatsApp media upload failed: ${error.message}`);
    }
  }

  /**
   * Get media URL by ID
   */
  async getMediaUrl(mediaId: string): Promise<string> {
    try {
      const response = await this.client.get(`/${mediaId}`);
      return response.data.url;
    } catch (error: any) {
      logger.error('Failed to get media URL:', error);
      throw new Error(`WhatsApp get media URL failed: ${error.message}`);
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<any> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      };

      const response = await this.client.post(
        `/${this.config.phoneNumberId}/messages`,
        payload
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to mark message as read:', error);
      throw new Error(`WhatsApp mark as read failed: ${error.message}`);
    }
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(webhookData: WhatsAppWebhookData): Promise<void> {
    try {
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const { messages, statuses, contacts } = change.value;

            // Process incoming messages
            if (messages) {
              for (const message of messages) {
                await this.processIncomingMessage(message, contacts);
              }
            }

            // Process message statuses
            if (statuses) {
              for (const status of statuses) {
                await this.processMessageStatus(status);
              }
            }
          }
        }
      }
    } catch (error: any) {
      logger.error('Failed to process webhook:', error);
      throw new Error(`WhatsApp webhook processing failed: ${error.message}`);
    }
  }

  /**
   * Process incoming message
   */
  private async processIncomingMessage(message: any, contacts?: any[]): Promise<void> {
    try {
      // Find contact info
      const contact = contacts?.find(c => c.wa_id === message.from);
      
      // Save incoming message
      await this.saveMessage({
        from: message.from,
        to: this.config.phoneNumberId,
        type: message.type,
        content: this.extractMessageContent(message),
        whatsapp_message_id: message.id,
        status: 'received',
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        contact_name: contact?.profile?.name
      });

      // Auto-mark as read
      await this.markAsRead(message.id);

      // Process specific message types
      await this.handleIncomingMessageType(message);
      
    } catch (error: any) {
      logger.error('Failed to process incoming message:', error);
    }
  }

  /**
   * Process message status updates
   */
  private async processMessageStatus(status: any): Promise<void> {
    try {
      // Update message status in database
      await prisma.whatsAppMessage.updateMany({
        where: { messageId: status.id },
        data: { 
          status: status.status,
          updatedAt: new Date()
        }
      });

      logger.info('Message status updated:', {
        messageId: status.id,
        status: status.status,
        recipientId: status.recipient_id
      });
    } catch (error: any) {
      logger.error('Failed to process message status:', error);
    }
  }

  /**
   * Handle specific incoming message types
   */
  private async handleIncomingMessageType(message: any): Promise<void> {
    switch (message.type) {
      case 'text':
        await this.handleTextMessage(message);
        break;
      case 'button':
        await this.handleButtonMessage(message);
        break;
      case 'interactive':
        await this.handleInteractiveMessage(message);
        break;
      case 'image':
      case 'document':
      case 'audio':
      case 'video':
        await this.handleMediaMessage(message);
        break;
      default:
        logger.info('Received unsupported message type:', message.type);
    }
  }

  /**
   * Handle text messages (can implement auto-responses here)
   */
  private async handleTextMessage(message: any): Promise<void> {
    const text = message.text?.body?.toLowerCase();
    
    // Simple auto-responses
    if (text?.includes('merhaba') || text?.includes('hello')) {
      await this.sendTextMessage(
        message.from,
        'Merhaba! Canary Digital ERP sistemine hoş geldiniz. Size nasıl yardımcı olabilirim?'
      );
    } else if (text?.includes('yardım') || text?.includes('help')) {
      await this.sendTextMessage(
        message.from,
        'Yardım için aşağıdaki konulardan birini seçebilirsiniz:\n\n1. Ekipman Kiralama\n2. Faturalar\n3. Ödemeler\n4. Teknik Destek\n\nLütfen ilgili numarayı yazın.'
      );
    }
  }

  /**
   * Handle button messages
   */
  private async handleButtonMessage(message: any): Promise<void> {
    const buttonPayload = message.button?.payload;
    
    // Process button actions based on payload
    logger.info('Button pressed:', {
      from: message.from,
      payload: buttonPayload,
      text: message.button?.text
    });
  }

  /**
   * Handle interactive messages (button/list replies)
   */
  private async handleInteractiveMessage(message: any): Promise<void> {
    const interactive = message.interactive;
    
    if (interactive?.type === 'button_reply') {
      const buttonId = interactive.button_reply?.id;
      logger.info('Interactive button reply:', {
        from: message.from,
        buttonId,
        title: interactive.button_reply?.title
      });
    } else if (interactive?.type === 'list_reply') {
      const listId = interactive.list_reply?.id;
      logger.info('Interactive list reply:', {
        from: message.from,
        listId,
        title: interactive.list_reply?.title
      });
    }
  }

  /**
   * Handle media messages
   */
  private async handleMediaMessage(message: any): Promise<void> {
    const mediaId = message[message.type]?.id;
    
    if (mediaId) {
      try {
        const mediaUrl = await this.getMediaUrl(mediaId);
        logger.info('Media message received:', {
          from: message.from,
          type: message.type,
          mediaId,
          mediaUrl
        });
      } catch (error) {
        logger.error('Failed to get media URL:', error);
      }
    }
  }

  /**
   * Extract message content based on type
   */
  private extractMessageContent(message: any): any {
    switch (message.type) {
      case 'text':
        return { text: message.text?.body };
      case 'image':
      case 'document':
      case 'audio':
      case 'video':
        return { media: message[message.type] };
      case 'button':
        return { button: message.button };
      case 'interactive':
        return { interactive: message.interactive };
      default:
        return message;
    }
  }

  /**
   * Save message to database
   */
  private async saveMessage(data: any): Promise<void> {
    try {
      await prisma.whatsAppMessage.create({
        data: {
          from: data.from,
          to: data.to,
          type: data.type,
          content: JSON.stringify(data.content),
          messageId: data.whatsapp_message_id,
          status: data.status,
          companyId: 1 // Default company - should be dynamic
        }
      });
    } catch (error: any) {
      logger.error('Failed to save message to database:', error);
    }
  }

  /**
   * Format phone number for WhatsApp API
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-numeric characters
    let formatted = phoneNumber.replace(/\D/g, '');
    
    // Add country code if missing (default to Turkey +90)
    if (!formatted.startsWith('90') && formatted.length === 10) {
      formatted = '90' + formatted;
    }
    
    return formatted;
  }

  /**
   * Verify webhook token
   */
  verifyWebhook(token: string): boolean {
    return token === this.config.webhookVerifyToken;
  }

  /**
   * Get service configuration status
   */
  getServiceStatus(): any {
    return {
      configured: !!(this.config.phoneNumberId && this.config.accessToken),
      phoneNumberId: this.config.phoneNumberId,
      businessAccountId: this.config.businessAccountId,
      apiVersion: this.config.apiVersion
    };
  }
}

export const whatsAppService = new WhatsAppService();