import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { emailController } from '../controllers/EmailController';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Validation rules
const sendEmailValidation = [
  body('to').notEmpty().withMessage('Recipient email is required')
    .isEmail().withMessage('Valid email address is required'),
  body('subject').notEmpty().withMessage('Subject is required')
];

const bulkEmailValidation = [
  body('recipients').isArray({ min: 1 }).withMessage('Recipients array is required'),
  body('recipients.*').isEmail().withMessage('All recipients must be valid email addresses'),
  body('subject').notEmpty().withMessage('Subject is required')
];

/**
 * @swagger
 * /api/email/status:
 *   get:
 *     summary: Get email service status
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email service status
 */
router.get('/status',
  authenticate,
  async (req, res) => await emailController.getStatus(req, res)
);

/**
 * @swagger
 * /api/email/test:
 *   post:
 *     summary: Send test email
 *     tags: [Email]
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
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 */
router.post('/test',
  authenticate,
  sendEmailValidation,
  validateRequest,
  async (req, res) => await emailController.sendTestEmail(req, res)
);

/**
 * @swagger
 * /api/email/order-confirmation:
 *   post:
 *     summary: Send order confirmation email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/order-confirmation',
  authenticate,
  async (req, res) => await emailController.sendOrderConfirmation(req, res)
);

/**
 * @swagger
 * /api/email/payment-reminder:
 *   post:
 *     summary: Send payment reminder email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/payment-reminder',
  authenticate,
  async (req, res) => await emailController.sendPaymentReminder(req, res)
);

/**
 * @swagger
 * /api/email/contract-notification:
 *   post:
 *     summary: Send contract notification email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/contract-notification',
  authenticate,
  async (req, res) => await emailController.sendContractNotification(req, res)
);

/**
 * @swagger
 * /api/email/inspection-reminder:
 *   post:
 *     summary: Send inspection reminder email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/inspection-reminder',
  authenticate,
  async (req, res) => await emailController.sendInspectionReminder(req, res)
);

/**
 * @swagger
 * /api/email/maintenance-alert:
 *   post:
 *     summary: Send maintenance alert email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/maintenance-alert',
  authenticate,
  async (req, res) => await emailController.sendMaintenanceAlert(req, res)
);

/**
 * @swagger
 * /api/email/invoice-notification:
 *   post:
 *     summary: Send invoice notification email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/invoice-notification',
  authenticate,
  async (req, res) => await emailController.sendInvoiceNotification(req, res)
);

/**
 * @swagger
 * /api/email/payment-confirmation:
 *   post:
 *     summary: Send payment confirmation email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/payment-confirmation',
  authenticate,
  async (req, res) => await emailController.sendPaymentConfirmation(req, res)
);

/**
 * @swagger
 * /api/email/welcome:
 *   post:
 *     summary: Send welcome email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/welcome',
  authenticate,
  async (req, res) => await emailController.sendWelcomeEmail(req, res)
);

/**
 * @swagger
 * /api/email/password-reset:
 *   post:
 *     summary: Send password reset email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/password-reset',
  authenticate,
  async (req, res) => await emailController.sendPasswordReset(req, res)
);

/**
 * @swagger
 * /api/email/queue:
 *   post:
 *     summary: Queue email for later sending
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/queue',
  authenticate,
  async (req, res) => await emailController.queueEmail(req, res)
);

/**
 * @swagger
 * /api/email/queue/status:
 *   get:
 *     summary: Get email queue status
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.get('/queue/status',
  authenticate,
  async (req, res) => await emailController.getQueueStatus(req, res)
);

/**
 * @swagger
 * /api/email/queue/clear-failed:
 *   post:
 *     summary: Clear failed jobs from queue
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 */
router.post('/queue/clear-failed',
  authenticate,
  async (req, res) => await emailController.clearFailedJobs(req, res)
);

/**
 * @swagger
 * /api/email/bulk:
 *   post:
 *     summary: Send bulk emails
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipients
 *               - subject
 *             properties:
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *               subject:
 *                 type: string
 *               template:
 *                 type: string
 *               context:
 *                 type: object
 *               html:
 *                 type: string
 */
router.post('/bulk',
  authenticate,
  bulkEmailValidation,
  validateRequest,
  async (req, res) => await emailController.sendBulkEmails(req, res)
);

export default router;
