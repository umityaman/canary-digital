import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { parasutController } from '../controllers/ParasutController';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Validation rules
const createContactValidation = [
  body('type').isIn(['person', 'company']).withMessage('Type must be person or company'),
  body('name').notEmpty().withMessage('Name is required'),
  body('contact_type').isIn(['customer', 'supplier']).withMessage('Contact type must be customer or supplier'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('tax_number').optional().isString().withMessage('Tax number must be string'),
  body('phone').optional().isString().withMessage('Phone must be string')
];

const createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('vat_rate').isNumeric().withMessage('VAT rate must be numeric'),
  body('unit').optional().isString().withMessage('Unit must be string'),
  body('list_price').optional().isNumeric().withMessage('List price must be numeric')
];

const recordPaymentValidation = [
  param('invoiceId').isInt().withMessage('Invalid invoice ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('account_id').isInt().withMessage('Account ID is required'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('description').optional().isString().withMessage('Description must be string')
];

// Routes

/**
 * @swagger
 * /api/parasut/status:
 *   get:
 *     summary: Get Parasut connection status
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 connected:
 *                   type: boolean
 *                 company:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.get('/status',
  authenticate,
  parasutController.getConnectionStatus.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/auth:
 *   post:
 *     summary: Authenticate with Parasut
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication successful
 *       500:
 *         description: Authentication failed
 */
router.post('/auth',
  authenticate,
  parasutController.authenticate.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/sync/status:
 *   get:
 *     summary: Get synchronization status
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync status retrieved successfully
 */
router.get('/sync/status',
  authenticate,
  parasutController.getSyncStatus.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/customers/{customerId}/sync:
 *   post:
 *     summary: Sync customer with Parasut
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID to sync
 *     responses:
 *       200:
 *         description: Customer synced successfully
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Sync failed
 */
router.post('/customers/:customerId/sync',
  authenticate,
  parasutController.syncCustomer.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/customers/bulk-sync:
 *   post:
 *     summary: Bulk sync all customers with Parasut
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bulk sync completed
 *       500:
 *         description: Bulk sync failed
 */
router.post('/customers/bulk-sync',
  authenticate,
  parasutController.bulkSyncCustomers.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/contracts/{contractId}/invoice:
 *   post:
 *     summary: Create invoice from contract
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contract ID to create invoice from
 *     responses:
 *       200:
 *         description: Invoice created successfully
 *       400:
 *         description: Invoice already exists or invalid contract
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Invoice creation failed
 */
router.post('/contracts/:contractId/invoice',
  authenticate,
  parasutController.createInvoiceFromContract.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/invoices/{invoiceId}:
 *   get:
 *     summary: Get invoice details
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice details retrieved successfully
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Failed to get invoice
 */
router.get('/invoices/:invoiceId',
  authenticate,
  parasutController.getInvoice.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/invoices:
 *   get:
 *     summary: Search invoices
 *     tags: [Parasut]
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
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: '-issue_date'
 *         description: Sort order
 *       - in: query
 *         name: issue_date
 *         schema:
 *           type: string
 *         description: Filter by issue date
 *       - in: query
 *         name: contact_id
 *         schema:
 *           type: integer
 *         description: Filter by contact ID
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *       500:
 *         description: Search failed
 */
router.get('/invoices',
  authenticate,
  parasutController.searchInvoices.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/invoices/{invoiceId}/payment:
 *   post:
 *     summary: Record payment for invoice
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - account_id
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               account_id:
 *                 type: integer
 *                 description: Bank account ID
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Payment date (optional, defaults to today)
 *               description:
 *                 type: string
 *                 description: Payment description
 *     responses:
 *       200:
 *         description: Payment recorded successfully
 *       400:
 *         description: Invalid payment data
 *       500:
 *         description: Payment recording failed
 */
router.post('/invoices/:invoiceId/payment',
  authenticate,
  recordPaymentValidation,
  validateRequest,
  parasutController.recordPayment.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/contacts:
 *   post:
 *     summary: Create contact (customer/supplier)
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *               - contact_type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [person, company]
 *               name:
 *                 type: string
 *               contact_type:
 *                 type: string
 *                 enum: [customer, supplier]
 *               email:
 *                 type: string
 *                 format: email
 *               tax_number:
 *                 type: string
 *               tax_office:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact created successfully
 *       400:
 *         description: Invalid contact data
 *       500:
 *         description: Contact creation failed
 */
router.post('/contacts',
  authenticate,
  createContactValidation,
  validateRequest,
  parasutController.createContact.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/contacts:
 *   get:
 *     summary: Search contacts
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: contact_type
 *         schema:
 *           type: string
 *           enum: [customer, supplier]
 *         description: Filter by contact type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Contacts retrieved successfully
 *       500:
 *         description: Search failed
 */
router.get('/contacts',
  authenticate,
  parasutController.searchContacts.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/products:
 *   post:
 *     summary: Create product
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - vat_rate
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               vat_rate:
 *                 type: number
 *               unit:
 *                 type: string
 *               list_price:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product created successfully
 *       400:
 *         description: Invalid product data
 *       500:
 *         description: Product creation failed
 */
router.post('/products',
  authenticate,
  createProductValidation,
  validateRequest,
  parasutController.createProduct.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/products:
 *   get:
 *     summary: Search products
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       500:
 *         description: Search failed
 */
router.get('/products',
  authenticate,
  parasutController.searchProducts.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/accounts:
 *   get:
 *     summary: Get company accounts
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
 *       500:
 *         description: Failed to get accounts
 */
router.get('/accounts',
  authenticate,
  parasutController.getAccounts.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/sync/invoice/{invoiceId}:
 *   post:
 *     summary: Sync invoice to Paraşüt
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice synced successfully
 */
router.post('/sync/invoice/:invoiceId',
  authenticate,
  parasutController.syncInvoice.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/sync/payment/{paymentId}:
 *   post:
 *     summary: Sync payment to Paraşüt
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment synced successfully
 */
router.post('/sync/payment/:paymentId',
  authenticate,
  parasutController.syncPayment.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/sync/bulk:
 *   post:
 *     summary: Bulk sync all pending items
 *     tags: [Parasut]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bulk sync completed
 */
router.post('/sync/bulk',
  authenticate,
  parasutController.bulkSync.bind(parasutController)
);

/**
 * @swagger
 * /api/parasut/webhook:
 *   post:
 *     summary: Handle Paraşüt webhook
 *     tags: [Parasut]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook',
  parasutController.handleWebhook.bind(parasutController)
);

export default router;