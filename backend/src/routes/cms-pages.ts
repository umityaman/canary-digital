import express from 'express';
import { body, param, query } from 'express-validator';
import CMSPageController from '../controllers/CMSPageController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/cms/pages:
 *   post:
 *     tags: [CMS - Pages]
 *     summary: Create a new page
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               template:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, scheduled, archived]
 *     responses:
 *       201:
 *         description: Page created successfully
 */
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('status').optional().isIn(['draft', 'published', 'scheduled', 'archived'])
  ],
  CMSPageController.createPage
);

/**
 * @swagger
 * /api/cms/pages:
 *   get:
 *     tags: [CMS - Pages]
 *     summary: List pages with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pages retrieved successfully
 */
router.get('/', CMSPageController.listPages);

/**
 * @swagger
 * /api/cms/pages/hierarchy:
 *   get:
 *     tags: [CMS - Pages]
 *     summary: Get page hierarchy
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Page hierarchy retrieved successfully
 */
router.get('/hierarchy', CMSPageController.getPageHierarchy);

/**
 * @swagger
 * /api/cms/pages/statistics:
 *   get:
 *     tags: [CMS - Pages]
 *     summary: Get page statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/statistics', CMSPageController.getPageStatistics);

/**
 * @swagger
 * /api/cms/pages/slug/{slug}:
 *   get:
 *     tags: [CMS - Pages]
 *     summary: Get page by slug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Page retrieved successfully
 */
router.get(
  '/slug/:slug',
  param('slug').notEmpty(),
  CMSPageController.getPageBySlug
);

/**
 * @swagger
 * /api/cms/pages/{id}:
 *   get:
 *     tags: [CMS - Pages]
 *     summary: Get page by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Page retrieved successfully
 */
router.get(
  '/:id',
  param('id').isInt(),
  CMSPageController.getPageById
);

/**
 * @swagger
 * /api/cms/pages/{id}:
 *   put:
 *     tags: [CMS - Pages]
 *     summary: Update page
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Page updated successfully
 */
router.put(
  '/:id',
  param('id').isInt(),
  CMSPageController.updatePage
);

/**
 * @swagger
 * /api/cms/pages/{id}:
 *   delete:
 *     tags: [CMS - Pages]
 *     summary: Delete page
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Page deleted successfully
 */
router.delete(
  '/:id',
  param('id').isInt(),
  CMSPageController.deletePage
);

/**
 * @swagger
 * /api/cms/pages/{id}/publish:
 *   post:
 *     tags: [CMS - Pages]
 *     summary: Publish page
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Page published successfully
 */
router.post(
  '/:id/publish',
  param('id').isInt(),
  CMSPageController.publishPage
);

/**
 * @swagger
 * /api/cms/pages/{id}/unpublish:
 *   post:
 *     tags: [CMS - Pages]
 *     summary: Unpublish page
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Page unpublished successfully
 */
router.post(
  '/:id/unpublish',
  param('id').isInt(),
  CMSPageController.unpublishPage
);

/**
 * @swagger
 * /api/cms/pages/{id}/schedule:
 *   post:
 *     tags: [CMS - Pages]
 *     summary: Schedule page
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduledFor
 *             properties:
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Page scheduled successfully
 */
router.post(
  '/:id/schedule',
  [
    param('id').isInt(),
    body('scheduledFor').isISO8601()
  ],
  CMSPageController.schedulePage
);

/**
 * @swagger
 * /api/cms/pages/{id}/duplicate:
 *   post:
 *     tags: [CMS - Pages]
 *     summary: Duplicate page
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Page duplicated successfully
 */
router.post(
  '/:id/duplicate',
  param('id').isInt(),
  CMSPageController.duplicatePage
);

export default router;
