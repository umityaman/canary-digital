import { Router } from 'express';
import { body, query, param } from 'express-validator';
import SocialMediaController from '../controllers/SocialMediaController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/social-media/oauth/{platform}:
 *   get:
 *     summary: Get OAuth URL for a platform
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [instagram, facebook, twitter]
 *         description: Social media platform
 *     responses:
 *       200:
 *         description: OAuth URL generated successfully
 *       400:
 *         description: Invalid platform
 */
router.get(
  '/oauth/:platform',
  param('platform').isIn(['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok']),
  validate,
  SocialMediaController.getOAuthUrl
);

/**
 * @swagger
 * /api/social-media/accounts/connect:
 *   post:
 *     summary: Connect a social media account
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *               - authCode
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [instagram, facebook, twitter, linkedin]
 *               authCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account connected successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Connection failed
 */
router.post(
  '/accounts/connect',
  [
    body('platform').isIn(['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok']),
    body('authCode').isString().notEmpty(),
  ],
  validate,
  SocialMediaController.connectAccount
);

/**
 * @swagger
 * /api/social-media/accounts:
 *   get:
 *     summary: Get all social media accounts
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [instagram, facebook, twitter, linkedin]
 *         description: Filter by platform
 *     responses:
 *       200:
 *         description: List of social media accounts
 */
router.get('/accounts', SocialMediaController.getAccounts);

/**
 * @swagger
 * /api/social-media/accounts/{accountId}:
 *   delete:
 *     summary: Disconnect a social media account
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account disconnected successfully
 *       404:
 *         description: Account not found
 */
router.delete(
  '/accounts/:accountId',
  param('accountId').isInt(),
  validate,
  SocialMediaController.disconnectAccount
);

/**
 * @swagger
 * /api/social-media/accounts/{accountId}/refresh:
 *   post:
 *     summary: Refresh account statistics
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Statistics refreshed successfully
 *       404:
 *         description: Account not found
 */
router.post(
  '/accounts/:accountId/refresh',
  param('accountId').isInt(),
  validate,
  SocialMediaController.refreshAccountStats
);

/**
 * @swagger
 * /api/social-media/posts:
 *   post:
 *     summary: Create and publish a post
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - content
 *             properties:
 *               accountId:
 *                 type: integer
 *               content:
 *                 type: string
 *               mediaUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Post published successfully
 *       400:
 *         description: Invalid request
 */
router.post(
  '/posts',
  [
    body('accountId').isInt(),
    body('content').isString().notEmpty(),
    body('mediaUrls').optional().isArray(),
    body('hashtags').optional().isArray(),
    body('mentions').optional().isArray(),
    body('location').optional().isString(),
    body('scheduledFor').optional().isISO8601(),
  ],
  validate,
  SocialMediaController.publishPost
);

/**
 * @swagger
 * /api/social-media/posts:
 *   get:
 *     summary: Get posts
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: integer
 *         description: Filter by account ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, scheduled, published, failed]
 *         description: Filter by status
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [instagram, facebook, twitter, linkedin]
 *         description: Filter by platform
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get(
  '/posts',
  [
    query('accountId').optional().isInt(),
    query('status').optional().isIn(['draft', 'scheduled', 'published', 'failed']),
    query('platform').optional().isIn(['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  validate,
  SocialMediaController.getPosts
);

/**
 * @swagger
 * /api/social-media/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */
router.delete(
  '/posts/:postId',
  param('postId').isInt(),
  validate,
  SocialMediaController.deletePost
);

/**
 * @swagger
 * /api/social-media/accounts/{accountId}/analytics/sync:
 *   post:
 *     summary: Sync analytics for an account
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Analytics synced successfully
 */
router.post(
  '/accounts/:accountId/analytics/sync',
  [param('accountId').isInt(), body('date').optional().isISO8601()],
  validate,
  SocialMediaController.syncAnalytics
);

/**
 * @swagger
 * /api/social-media/accounts/{accountId}/analytics:
 *   get:
 *     summary: Get analytics for an account
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get(
  '/accounts/:accountId/analytics',
  [
    param('accountId').isInt(),
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    query('period').optional().isIn(['daily', 'weekly', 'monthly']),
  ],
  validate,
  SocialMediaController.getAnalytics
);

/**
 * @swagger
 * /api/social-media/dashboard:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data
 */
router.get('/dashboard', SocialMediaController.getDashboard);

export default router;
