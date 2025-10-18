import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { paymentController } from '../controllers/PaymentController';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Payment validation rules
const createPaymentValidation = [
  param('contractId').isInt().withMessage('Geçersiz sözleşme ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Geçersiz tutar'),
  body('currency').optional().isIn(['TRY', 'USD', 'EUR']).withMessage('Geçersiz para birimi'),
  body('paymentCard.holderName').notEmpty().withMessage('Kart sahibi adı gerekli'),
  body('paymentCard.number').isLength({ min: 16, max: 19 }).withMessage('Geçersiz kart numarası'),
  body('paymentCard.expireMonth').isLength({ min: 2, max: 2 }).withMessage('Geçersiz ay'),
  body('paymentCard.expireYear').isLength({ min: 4, max: 4 }).withMessage('Geçersiz yıl'),
  body('paymentCard.cvc').isLength({ min: 3, max: 4 }).withMessage('Geçersiz CVC'),
  body('use3D').optional().isBoolean().withMessage('3D Secure boolean olmalı'),
  body('callbackUrl').optional().isURL().withMessage('Geçersiz callback URL'),
  body('description').optional().isString().withMessage('Açıklama string olmalı')
];

const complete3DPaymentValidation = [
  body('conversationId').notEmpty().withMessage('Conversation ID gerekli'),
  body('paymentId').notEmpty().withMessage('Payment ID gerekli')
];

const refundPaymentValidation = [
  param('paymentId').isInt().withMessage('Geçersiz ödeme ID'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Geçersiz iade tutarı'),
  body('reason').optional().isString().withMessage('İade nedeni string olmalı')
];

const installmentInfoValidation = [
  query('price').notEmpty().withMessage('Fiyat gerekli'),
  query('binNumber').isLength({ min: 6, max: 8 }).withMessage('Geçersiz BIN numarası')
];

// Routes

/**
 * @swagger
 * /api/payments/contracts/{contractId}:
 *   post:
 *     summary: Create payment for contract
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contract ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentCard
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               currency:
 *                 type: string
 *                 enum: [TRY, USD, EUR]
 *                 default: TRY
 *               paymentCard:
 *                 type: object
 *                 required:
 *                   - holderName
 *                   - number
 *                   - expireMonth
 *                   - expireYear
 *                   - cvc
 *                 properties:
 *                   holderName:
 *                     type: string
 *                   number:
 *                     type: string
 *                   expireMonth:
 *                     type: string
 *                   expireYear:
 *                     type: string
 *                   cvc:
 *                     type: string
 *               use3D:
 *                 type: boolean
 *                 default: false
 *               callbackUrl:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contract not found
 */
router.post('/contracts/:contractId', 
  authenticate, 
  createPaymentValidation,
  validateRequest,
  paymentController.createPayment.bind(paymentController)
);

/**
 * @swagger
 * /api/payments/3d/complete:
 *   post:
 *     summary: Complete 3D Secure payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - paymentId
 *             properties:
 *               conversationId:
 *                 type: string
 *               paymentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 3D payment completed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.post('/3d/complete',
  authenticate,
  complete3DPaymentValidation,
  validateRequest,
  paymentController.complete3DPayment.bind(paymentController)
);

/**
 * @swagger
 * /api/payments/{paymentId}/refund:
 *   post:
 *     summary: Refund a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Refund amount (optional, defaults to full amount)
 *               reason:
 *                 type: string
 *                 description: Refund reason
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.post('/:paymentId/refund',
  authenticate,
  refundPaymentValidation,
  validateRequest,
  paymentController.refundPayment.bind(paymentController)
);

/**
 * @swagger
 * /api/payments/contracts/{contractId}:
 *   get:
 *     summary: Get payments for contract
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contract ID
 *     responses:
 *       200:
 *         description: Contract payments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contract not found
 */
router.get('/contracts/:contractId',
  authenticate,
  paymentController.getContractPayments.bind(paymentController)
);

/**
 * @swagger
 * /api/payments/{paymentId}/status:
 *   get:
 *     summary: Get payment status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get('/:paymentId/status',
  authenticate,
  paymentController.getPaymentStatus.bind(paymentController)
);

/**
 * @swagger
 * /api/payments/installments:
 *   get:
 *     summary: Get installment information
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: price
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment amount
 *       - in: query
 *         name: binNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Credit card BIN number
 *     responses:
 *       200:
 *         description: Installment information retrieved successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/installments',
  authenticate,
  installmentInfoValidation,
  validateRequest,
  paymentController.getInstallmentInfo.bind(paymentController)
);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Iyzipay webhook handler
 *     tags: [Payments]
 *     description: Handles payment status updates from Iyzipay
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               paymentId:
 *                 type: string
 *               conversationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       500:
 *         description: Webhook processing error
 */
router.post('/webhook',
  paymentController.handleWebhook.bind(paymentController)
);

export default router;