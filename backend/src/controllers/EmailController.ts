import { Request, Response } from 'express';
import { emailService } from '../services/EmailService';
import logger from '../config/logger';

export class EmailController {
  /**
   * Get email service status
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const isConnected = await emailService.testConnection();
      const queueStatus = emailService.getQueueStatus();

      res.json({
        success: true,
        data: {
          connected: isConnected,
          configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
          queue: queueStatus,
          emailUser: process.env.EMAIL_USER || 'Not configured'
        },
        message: isConnected ? 'Email service is operational' : 'Email service connection failed'
      });
    } catch (error: any) {
      logger.error('Failed to get email status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get email service status',
        error: error.message
      });
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(req: Request, res: Response): Promise<void> {
    try {
      const { to, subject, message } = req.body;

      if (!to) {
        res.status(400).json({
          success: false,
          message: 'Recipient email is required'
        });
        return;
      }

      const result = await emailService.sendEmail({
        to,
        subject: subject || 'Test Email from Canary Digital',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Test Email</h2>
            <p>${message || 'This is a test email from Canary Digital ERP system.'}</p>
            <p>If you received this email, your email configuration is working correctly!</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Sent at: ${new Date().toLocaleString('tr-TR')}
            </p>
          </div>
        `
      });

      res.json({
        success: true,
        data: result,
        message: 'Test email sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send test email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error.message
      });
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data.customerEmail || !data.orderNumber) {
        res.status(400).json({
          success: false,
          message: 'Customer email and order number are required'
        });
        return;
      }

      const result = await emailService.sendOrderConfirmation(data);

      res.json({
        success: true,
        data: result,
        message: 'Order confirmation email sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send order confirmation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send order confirmation email',
        error: error.message
      });
    }
  }

  /**
   * Send payment reminder email
   */
  async sendPaymentReminder(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data.customerEmail || !data.orderNumber) {
        res.status(400).json({
          success: false,
          message: 'Customer email and order number are required'
        });
        return;
      }

      const result = await emailService.sendPaymentReminder(data);

      res.json({
        success: true,
        data: result,
        message: 'Payment reminder email sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send payment reminder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send payment reminder email',
        error: error.message
      });
    }
  }

  /**
   * Send contract notification email
   */
  async sendContractNotification(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data.customerEmail || !data.contractNumber) {
        res.status(400).json({
          success: false,
          message: 'Customer email and contract number are required'
        });
        return;
      }

      const result = await emailService.sendContractNotification(data);

      res.json({
        success: true,
        data: result,
        message: 'Contract notification email sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send contract notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send contract notification email',
        error: error.message
      });
    }
  }

  /**
   * Send inspection reminder email
   */
  async sendInspectionReminder(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data.customerEmail || !data.equipmentName) {
        res.status(400).json({
          success: false,
          message: 'Customer email and equipment name are required'
        });
        return;
      }

      const result = await emailService.sendInspectionReminder(data);

      res.json({
        success: true,
        data: result,
        message: 'Inspection reminder email sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send inspection reminder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send inspection reminder email',
        error: error.message
      });
    }
  }

  /**
   * Send maintenance alert email
   */
  async sendMaintenanceAlert(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data.customerEmail || !data.equipmentName) {
        res.status(400).json({
          success: false,
          message: 'Customer email and equipment name are required'
        });
        return;
      }

      const result = await emailService.sendMaintenanceAlert(data);

      res.json({
        success: true,
        data: result,
        message: 'Maintenance alert email sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send maintenance alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send maintenance alert email',
        error: error.message
      });
    }
  }

  /**
   * Send invoice notification email
   */
  async sendInvoiceNotification(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data.customerEmail || !data.invoiceNumber) {
        res.status(400).json({
          success: false,
          message: 'Customer email and invoice number are required'
        });
        return;
      }

      const result = await emailService.sendInvoiceNotification(data);

      res.json({
        success: true,
        data: result,
        message: 'Invoice notification email sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send invoice notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send invoice notification email',
        error: error.message
      });
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data.customerEmail || !data.orderNumber) {
        res.status(400).json({
          success: false,
          message: 'Customer email and order number are required'
        });
        return;
      }

      const result = await emailService.sendPaymentConfirmation(data);

      res.json({
        success: true,
        data: result,
        message: 'Payment confirmation email sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send payment confirmation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send payment confirmation email',
        error: error.message
      });
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data.customerEmail || !data.customerName) {
        res.status(400).json({
          success: false,
          message: 'Customer email and name are required'
        });
        return;
      }

      const result = await emailService.sendWelcomeEmail(data);

      res.json({
        success: true,
        data: result,
        message: 'Welcome email sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send welcome email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email',
        error: error.message
      });
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data.email || !data.resetToken) {
        res.status(400).json({
          success: false,
          message: 'Email and reset token are required'
        });
        return;
      }

      const result = await emailService.sendPasswordReset(data);

      res.json({
        success: true,
        data: result,
        message: 'Password reset email sent successfully'
      });
    } catch (error: any) {
      logger.error('Failed to send password reset:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        error: error.message
      });
    }
  }

  /**
   * Queue email for later sending
   */
  async queueEmail(req: Request, res: Response): Promise<void> {
    try {
      const { to, subject, html, template, context, scheduledFor, maxAttempts } = req.body;

      if (!to || !subject) {
        res.status(400).json({
          success: false,
          message: 'Recipient and subject are required'
        });
        return;
      }

      const jobId = await emailService.queueEmail(
        { to, subject, html, template, context },
        scheduledFor ? new Date(scheduledFor) : undefined,
        maxAttempts
      );

      res.json({
        success: true,
        data: { jobId },
        message: 'Email queued successfully'
      });
    } catch (error: any) {
      logger.error('Failed to queue email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to queue email',
        error: error.message
      });
    }
  }

  /**
   * Get queue status
   */
  async getQueueStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = emailService.getQueueStatus();

      res.json({
        success: true,
        data: status
      });
    } catch (error: any) {
      logger.error('Failed to get queue status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get queue status',
        error: error.message
      });
    }
  }

  /**
   * Clear failed jobs
   */
  async clearFailedJobs(req: Request, res: Response): Promise<void> {
    try {
      const clearedCount = emailService.clearFailedJobs();

      res.json({
        success: true,
        data: { clearedCount },
        message: `Cleared ${clearedCount} failed jobs`
      });
    } catch (error: any) {
      logger.error('Failed to clear failed jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear failed jobs',
        error: error.message
      });
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(req: Request, res: Response): Promise<void> {
    try {
      const { recipients, subject, template, context, html } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Recipients array is required'
        });
        return;
      }

      if (!subject) {
        res.status(400).json({
          success: false,
          message: 'Subject is required'
        });
        return;
      }

      const results = [];
      const errors = [];

      for (const recipient of recipients) {
        try {
          const result = await emailService.sendEmail({
            to: recipient,
            subject,
            template,
            context,
            html
          });
          results.push({ recipient, success: true, result });
        } catch (error: any) {
          errors.push({ recipient, success: false, error: error.message });
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        message: `Bulk emails processed: ${results.length} successful, ${errors.length} failed`
      });
    } catch (error: any) {
      logger.error('Failed to send bulk emails:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send bulk emails',
        error: error.message
      });
    }
  }
}

export const emailController = new EmailController();
