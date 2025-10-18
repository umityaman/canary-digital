import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { prisma } from '../database';
import logger from '../config/logger';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: any;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  variables: string[];
}

interface EmailJob {
  id: string;
  to: string[];
  subject: string;
  html: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  maxAttempts: number;
  error?: string;
  scheduledFor?: Date;
}

export class EmailService {
  private transporter: Transporter;
  private templateCache: Map<string, handlebars.TemplateDelegate> = new Map();
  private emailQueue: EmailJob[] = [];
  private isProcessingQueue = false;
  private templatesDir: string;

  constructor() {
    // Initialize email transporter (Gmail SMTP)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000, // 1 second
      rateLimit: 5 // max 5 emails per rateDelta
    });

    this.templatesDir = path.join(__dirname, '../templates/emails');

    // Verify connection
    this.verifyConnection();

    // Register Handlebars helpers
    this.registerHandlebarsHelpers();

    // Start queue processor
    this.startQueueProcessor();
  }

  /**
   * Verify SMTP connection
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('✅ Email service initialized successfully');
    } catch (error: any) {
      logger.error('❌ Email service initialization failed:', error);
    }
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHandlebarsHelpers(): void {
    // Date formatting helper
    handlebars.registerHelper('formatDate', (date: Date | string, format: string = 'DD/MM/YYYY') => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      
      if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
      } else if (format === 'DD MMMM YYYY') {
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${day} ${months[d.getMonth()]} ${year}`;
      }
      return `${day}/${month}/${year}`;
    });

    // Currency formatting helper
    handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'TRY') => {
      const formatted = new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency
      }).format(amount);
      return formatted;
    });

    // Comparison helper
    handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    handlebars.registerHelper('lt', (a: number, b: number) => a < b);
  }

  /**
   * Load and compile email template
   */
  private async loadTemplate(templateName: string): Promise<handlebars.TemplateDelegate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
      
      // Check if template file exists
      if (!fs.existsSync(templatePath)) {
        logger.warn(`Template not found: ${templateName}, using default template`);
        return this.getDefaultTemplate();
      }

      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateSource);
      
      // Cache the compiled template
      this.templateCache.set(templateName, compiledTemplate);
      
      return compiledTemplate;
    } catch (error: any) {
      logger.error(`Failed to load template ${templateName}:`, error);
      return this.getDefaultTemplate();
    }
  }

  /**
   * Get default email template
   */
  private getDefaultTemplate(): handlebars.TemplateDelegate {
    const defaultSource = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{subject}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .footer { background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Canary Digital</h1>
          </div>
          <div class="content">
            {{{content}}}
          </div>
          <div class="footer">
            <p>© 2025 Canary Digital. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return handlebars.compile(defaultSource);
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<any> {
    try {
      let html = options.html;

      // If template is specified, compile it with context
      if (options.template && options.context) {
        const template = await this.loadTemplate(options.template);
        html = template(options.context);
      }

      const mailOptions = {
        from: `"Canary Digital" <${process.env.EMAIL_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo || process.env.EMAIL_USER,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Log email sent
      await this.logEmail({
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        template: options.template,
        status: 'sent',
        messageId: result.messageId,
        response: result.response
      });

      logger.info('Email sent successfully:', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to send email:', error);
      
      // Log failed email
      await this.logEmail({
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        template: options.template,
        status: 'failed',
        error: error.message
      });

      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Queue email for later sending
   */
  async queueEmail(options: EmailOptions, scheduledFor?: Date, maxAttempts: number = 3): Promise<string> {
    const jobId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let html = options.html;
    if (options.template && options.context) {
      const template = await this.loadTemplate(options.template);
      html = template(options.context);
    }

    const job: EmailJob = {
      id: jobId,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: html || '',
      status: 'pending',
      attempts: 0,
      maxAttempts,
      scheduledFor
    };

    this.emailQueue.push(job);

    logger.info('Email queued:', {
      jobId,
      to: job.to,
      subject: job.subject,
      scheduledFor: scheduledFor?.toISOString()
    });

    return jobId;
  }

  /**
   * Process email queue
   */
  private async startQueueProcessor(): Promise<void> {
    setInterval(async () => {
      if (this.isProcessingQueue || this.emailQueue.length === 0) {
        return;
      }

      this.isProcessingQueue = true;

      try {
        const now = new Date();
        const jobsToProcess = this.emailQueue.filter(job => 
          job.status === 'pending' && 
          (!job.scheduledFor || job.scheduledFor <= now)
        );

        for (const job of jobsToProcess) {
          try {
            await this.transporter.sendMail({
              from: `"Canary Digital" <${process.env.EMAIL_USER}>`,
              to: job.to.join(', '),
              subject: job.subject,
              html: job.html
            });

            job.status = 'sent';
            
            logger.info('Queued email sent:', {
              jobId: job.id,
              to: job.to,
              subject: job.subject
            });

            // Remove from queue
            this.emailQueue = this.emailQueue.filter(j => j.id !== job.id);
          } catch (error: any) {
            job.attempts++;
            job.error = error.message;

            if (job.attempts >= job.maxAttempts) {
              job.status = 'failed';
              logger.error('Email job failed after max attempts:', {
                jobId: job.id,
                error: error.message
              });
              
              // Remove from queue
              this.emailQueue = this.emailQueue.filter(j => j.id !== job.id);
            } else {
              logger.warn('Email job retry:', {
                jobId: job.id,
                attempt: job.attempts,
                maxAttempts: job.maxAttempts
              });
            }
          }
        }
      } finally {
        this.isProcessingQueue = false;
      }
    }, 10000); // Process queue every 10 seconds
  }

  /**
   * Log email activity to database
   */
  private async logEmail(data: {
    to: string[];
    subject: string;
    template?: string;
    status: string;
    messageId?: string;
    response?: string;
    error?: string;
  }): Promise<void> {
    try {
      // Create email log entry (we'll add this model to Prisma later)
      logger.info('Email log:', data);
    } catch (error: any) {
      logger.error('Failed to log email:', error);
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(data: {
    customerEmail: string;
    customerName: string;
    orderNumber: string;
    orderDate: Date;
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    pickupDate: Date;
    returnDate: Date;
  }): Promise<any> {
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Sipariş Onayı - ${data.orderNumber}`,
      template: 'order-confirmation',
      context: data
    });
  }

  /**
   * Send payment reminder email
   */
  async sendPaymentReminder(data: {
    customerEmail: string;
    customerName: string;
    orderNumber: string;
    dueAmount: number;
    dueDate: Date;
    daysOverdue?: number;
  }): Promise<any> {
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Ödeme Hatırlatması - ${data.orderNumber}`,
      template: 'payment-reminder',
      context: data
    });
  }

  /**
   * Send contract notification email
   */
  async sendContractNotification(data: {
    customerEmail: string;
    customerName: string;
    contractNumber: string;
    expiryDate: Date;
    daysUntilExpiry: number;
  }): Promise<any> {
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Sözleşme Bildirimi - ${data.contractNumber}`,
      template: 'contract-notification',
      context: data
    });
  }

  /**
   * Send inspection reminder email
   */
  async sendInspectionReminder(data: {
    customerEmail: string;
    customerName: string;
    equipmentName: string;
    inspectionDate: Date;
    inspectionType: string;
    location?: string;
  }): Promise<any> {
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Muayene Hatırlatması - ${data.equipmentName}`,
      template: 'inspection-reminder',
      context: data
    });
  }

  /**
   * Send maintenance alert email
   */
  async sendMaintenanceAlert(data: {
    customerEmail: string;
    customerName: string;
    equipmentName: string;
    maintenanceType: string;
    scheduledDate: Date;
    urgency: 'low' | 'medium' | 'high';
    description?: string;
  }): Promise<any> {
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Bakım Uyarısı - ${data.equipmentName}`,
      template: 'maintenance-alert',
      context: data
    });
  }

  /**
   * Send invoice notification email
   */
  async sendInvoiceNotification(data: {
    customerEmail: string;
    customerName: string;
    invoiceNumber: string;
    invoiceDate: Date;
    totalAmount: number;
    dueDate: Date;
    invoiceUrl?: string;
  }): Promise<any> {
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Fatura - ${data.invoiceNumber}`,
      template: 'invoice-notification',
      context: data
    });
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(data: {
    customerEmail: string;
    customerName: string;
    orderNumber: string;
    paymentAmount: number;
    paymentDate: Date;
    paymentMethod: string;
    receiptUrl?: string;
  }): Promise<any> {
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Ödeme Onayı - ${data.orderNumber}`,
      template: 'payment-confirmation',
      context: data
    });
  }

  /**
   * Send welcome email to new customer
   */
  async sendWelcomeEmail(data: {
    customerEmail: string;
    customerName: string;
    companyName?: string;
  }): Promise<any> {
    return this.sendEmail({
      to: data.customerEmail,
      subject: 'Canary Digital\'e Hoş Geldiniz!',
      template: 'welcome',
      context: data
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(data: {
    email: string;
    name: string;
    resetToken: string;
    resetUrl: string;
  }): Promise<any> {
    return this.sendEmail({
      to: data.email,
      subject: 'Şifre Sıfırlama Talebi',
      template: 'password-reset',
      context: data
    });
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    pending: number;
    failed: number;
    total: number;
    jobs: EmailJob[];
  } {
    return {
      pending: this.emailQueue.filter(j => j.status === 'pending').length,
      failed: this.emailQueue.filter(j => j.status === 'failed').length,
      total: this.emailQueue.length,
      jobs: this.emailQueue
    };
  }

  /**
   * Clear failed jobs from queue
   */
  clearFailedJobs(): number {
    const failedCount = this.emailQueue.filter(j => j.status === 'failed').length;
    this.emailQueue = this.emailQueue.filter(j => j.status !== 'failed');
    return failedCount;
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const emailService = new EmailService();
