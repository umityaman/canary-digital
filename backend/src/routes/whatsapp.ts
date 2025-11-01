import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { whatsAppController } from '../controllers/WhatsAppController';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, audio, video
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'video/mp4',
      'video/mpeg',
      'video/quicktime'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

// Validation rules
const sendTextValidation = [
  body('to').notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Invalid phone number format'),
  body('message').notEmpty().withMessage('Message is required')
    .isLength({ min: 1, max: 4096 }).withMessage('Message must be between 1 and 4096 characters')
];

const sendTemplateValidation = [
  body('to').notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Invalid phone number format'),
  body('template.name').notEmpty().withMessage('Template name is required'),
  body('template.language').notEmpty().withMessage('Template language is required')
];

const sendMediaValidation = [
  body('to').notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Invalid phone number format'),
  body('type').isIn(['image', 'document', 'audio', 'video']).withMessage('Invalid media type'),
  body('media').notEmpty().withMessage('Media data is required')
];

const sendInteractiveValidation = [
  body('to').notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Invalid phone number format'),
  body('type').isIn(['button', 'list']).withMessage('Interactive type must be button or list'),
  body('body.text').notEmpty().withMessage('Body text is required'),
  body('action').notEmpty().withMessage('Action is required')
];

const bulkMessageValidation = [
  body('recipients').isArray({ min: 1 }).withMessage('Recipients array is required'),
  body('recipients.*').isMobilePhone('any').withMessage('Invalid phone number in recipients'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').optional().isIn(['text', 'template']).withMessage('Type must be text or template')
];

/**
 * @swagger
 * /api/whatsapp/status:
 *   get:
 *     summary: Get WhatsApp service status
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: object
 *                   properties:
 *                     configured:
 *                       type: boolean
 *                     phoneNumberId:
 *                       type: string
 *                     businessAccountId:
 *                       type: string
 *                     apiVersion:
 *                       type: string
 *                 message:
 *                   type: string
 */
router.get('/status', 
  authenticate, 
  async (req, res) => await whatsAppController.getStatus(req, res)
);

/**
 * @swagger
 * /api/whatsapp/send/text:
 *   post:
 *     summary: Send text message
 *     tags: [WhatsApp]
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
 *                 description: Recipient phone number
 *               message:
 *                 type: string
 *                 description: Text message content
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Failed to send message
 */
router.post('/send/text',
  authenticate,
  sendTextValidation,
  validateRequest,
  whatsAppController.sendTextMessage.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/send/template:
 *   post:
 *     summary: Send template message
 *     tags: [WhatsApp]
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
 *               - template
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient phone number
 *               template:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   language:
 *                     type: string
 *                   components:
 *                     type: array
 *     responses:
 *       200:
 *         description: Template message sent successfully
 *       400:
 *         description: Invalid template data
 *       500:
 *         description: Failed to send template message
 */
router.post('/send/template',
  authenticate,
  sendTemplateValidation,
  validateRequest,
  whatsAppController.sendTemplateMessage.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/send/media:
 *   post:
 *     summary: Send media message
 *     tags: [WhatsApp]
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
 *               - type
 *               - media
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient phone number
 *               type:
 *                 type: string
 *                 enum: [image, document, audio, video]
 *               media:
 *                 type: object
 *                 description: Media data (id, link, caption, etc.)
 *     responses:
 *       200:
 *         description: Media message sent successfully
 *       400:
 *         description: Invalid media data
 *       500:
 *         description: Failed to send media message
 */
router.post('/send/media',
  authenticate,
  sendMediaValidation,
  validateRequest,
  whatsAppController.sendMediaMessage.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/send/interactive:
 *   post:
 *     summary: Send interactive message (buttons/list)
 *     tags: [WhatsApp]
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
 *               - type
 *               - body
 *               - action
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient phone number
 *               type:
 *                 type: string
 *                 enum: [button, list]
 *               header:
 *                 type: object
 *               body:
 *                 type: object
 *                 properties:
 *                   text:
 *                     type: string
 *               footer:
 *                 type: object
 *               action:
 *                 type: object
 *                 description: Buttons or list sections
 *     responses:
 *       200:
 *         description: Interactive message sent successfully
 *       400:
 *         description: Invalid interactive data
 *       500:
 *         description: Failed to send interactive message
 */
router.post('/send/interactive',
  authenticate,
  sendInteractiveValidation,
  validateRequest,
  whatsAppController.sendInteractiveMessage.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/send/bulk:
 *   post:
 *     summary: Send bulk messages
 *     tags: [WhatsApp]
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
 *               - message
 *             properties:
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of phone numbers
 *               message:
 *                 type: string
 *                 description: Message content
 *               type:
 *                 type: string
 *                 enum: [text, template]
 *                 default: text
 *     responses:
 *       200:
 *         description: Bulk messages processed
 *       400:
 *         description: Invalid bulk data
 *       500:
 *         description: Failed to send bulk messages
 */
router.post('/send/bulk',
  authenticate,
  bulkMessageValidation,
  validateRequest,
  whatsAppController.sendBulkMessages.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/upload:
 *   post:
 *     summary: Upload media to WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Media file to upload
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     mediaId:
 *                       type: string
 *       400:
 *         description: Invalid file
 *       500:
 *         description: Upload failed
 */
router.post('/upload',
  authenticate,
  (upload.single('file') as any),
  whatsAppController.uploadMedia.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/messages:
 *   get:
 *     summary: Get messages with filtering
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Messages per page
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by phone number
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by message type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by message status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       500:
 *         description: Failed to get messages
 */
router.get('/messages',
  authenticate,
  whatsAppController.getMessages.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/messages/{id}:
 *   get:
 *     summary: Get message by ID
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message retrieved successfully
 *       404:
 *         description: Message not found
 *       500:
 *         description: Failed to get message
 */
router.get('/messages/:id',
  authenticate,
  whatsAppController.getMessageById.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/conversation/{phoneNumber}:
 *   get:
 *     summary: Get conversation with specific phone number
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Messages per page
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *       500:
 *         description: Failed to get conversation
 */
router.get('/conversation/:phoneNumber',
  authenticate,
  whatsAppController.getConversation.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/mark-read/{messageId}:
 *   post:
 *     summary: Mark message as read
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: WhatsApp message ID
 *     responses:
 *       200:
 *         description: Message marked as read
 *       500:
 *         description: Failed to mark as read
 */
router.post('/mark-read/:messageId',
  authenticate,
  whatsAppController.markAsRead.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/analytics:
 *   get:
 *     summary: Get WhatsApp analytics
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       500:
 *         description: Failed to get analytics
 */
router.get('/analytics',
  authenticate,
  whatsAppController.getAnalytics.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/webhook:
 *   get:
 *     summary: Verify webhook
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.verify_token
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.challenge
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook verified
 *       403:
 *         description: Verification failed
 */
router.get('/webhook',
  whatsAppController.verifyWebhook.bind(whatsAppController)
);

/**
 * @swagger
 * /api/whatsapp/webhook:
 *   post:
 *     summary: Handle incoming webhook
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: WhatsApp webhook payload
 *     responses:
 *       200:
 *         description: Webhook processed
 *       500:
 *         description: Webhook processing failed
 */
router.post('/webhook',
  whatsAppController.handleWebhook.bind(whatsAppController)
);

export default router;