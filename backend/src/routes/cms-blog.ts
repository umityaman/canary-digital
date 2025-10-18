import express from 'express';
import { body, param, query } from 'express-validator';
import BlogController from '../controllers/BlogController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// BLOG POST ROUTES
// ============================================

/**
 * @swagger
 * /api/cms/blog/posts:
 *   post:
 *     tags: [CMS - Blog]
 *     summary: Create a new blog post
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Blog post created successfully
 */
router.post(
  '/posts',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required')
  ],
  BlogController.createBlogPost
);

/**
 * @swagger
 * /api/cms/blog/posts:
 *   get:
 *     tags: [CMS - Blog]
 *     summary: List blog posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blog posts retrieved successfully
 */
router.get('/posts', BlogController.listBlogPosts);

/**
 * @swagger
 * /api/cms/blog/statistics:
 *   get:
 *     tags: [CMS - Blog]
 *     summary: Get blog statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/statistics', BlogController.getBlogStatistics);

/**
 * @swagger
 * /api/cms/blog/posts/slug/{slug}:
 *   get:
 *     tags: [CMS - Blog]
 *     summary: Get blog post by slug
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
 *         description: Blog post retrieved successfully
 */
router.get(
  '/posts/slug/:slug',
  param('slug').notEmpty(),
  BlogController.getBlogPostBySlug
);

/**
 * @swagger
 * /api/cms/blog/posts/{id}:
 *   get:
 *     tags: [CMS - Blog]
 *     summary: Get blog post by ID
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
 *         description: Blog post retrieved successfully
 */
router.get(
  '/posts/:id',
  param('id').isInt(),
  BlogController.getBlogPostById
);

/**
 * @swagger
 * /api/cms/blog/posts/{id}:
 *   put:
 *     tags: [CMS - Blog]
 *     summary: Update blog post
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
 *         description: Blog post updated successfully
 */
router.put(
  '/posts/:id',
  param('id').isInt(),
  BlogController.updateBlogPost
);

/**
 * @swagger
 * /api/cms/blog/posts/{id}:
 *   delete:
 *     tags: [CMS - Blog]
 *     summary: Delete blog post
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
 *         description: Blog post deleted successfully
 */
router.delete(
  '/posts/:id',
  param('id').isInt(),
  BlogController.deleteBlogPost
);

// ============================================
// CATEGORY ROUTES
// ============================================

/**
 * @swagger
 * /api/cms/blog/categories:
 *   post:
 *     tags: [CMS - Blog]
 *     summary: Create a category
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post(
  '/categories',
  body('name').notEmpty().withMessage('Name is required'),
  BlogController.createCategory
);

/**
 * @swagger
 * /api/cms/blog/categories:
 *   get:
 *     tags: [CMS - Blog]
 *     summary: List categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', BlogController.listCategories);

/**
 * @swagger
 * /api/cms/blog/categories/{id}:
 *   put:
 *     tags: [CMS - Blog]
 *     summary: Update category
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
 *         description: Category updated successfully
 */
router.put(
  '/categories/:id',
  param('id').isInt(),
  BlogController.updateCategory
);

/**
 * @swagger
 * /api/cms/blog/categories/{id}:
 *   delete:
 *     tags: [CMS - Blog]
 *     summary: Delete category
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
 *         description: Category deleted successfully
 */
router.delete(
  '/categories/:id',
  param('id').isInt(),
  BlogController.deleteCategory
);

// ============================================
// TAG ROUTES
// ============================================

/**
 * @swagger
 * /api/cms/blog/tags:
 *   get:
 *     tags: [CMS - Blog]
 *     summary: List tags
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 */
router.get('/tags', BlogController.listTags);

// ============================================
// COMMENT ROUTES
// ============================================

/**
 * @swagger
 * /api/cms/blog/posts/{id}/comments:
 *   post:
 *     tags: [CMS - Blog]
 *     summary: Add comment to post
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               parentId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post(
  '/posts/:id/comments',
  [
    param('id').isInt(),
    body('content').notEmpty().withMessage('Content is required')
  ],
  BlogController.addComment
);

/**
 * @swagger
 * /api/cms/blog/comments/{id}/approve:
 *   post:
 *     tags: [CMS - Blog]
 *     summary: Approve comment
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
 *         description: Comment approved successfully
 */
router.post(
  '/comments/:id/approve',
  param('id').isInt(),
  BlogController.approveComment
);

/**
 * @swagger
 * /api/cms/blog/comments/{id}:
 *   delete:
 *     tags: [CMS - Blog]
 *     summary: Delete comment
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
 *         description: Comment deleted successfully
 */
router.delete(
  '/comments/:id',
  param('id').isInt(),
  BlogController.deleteComment
);

export default router;
