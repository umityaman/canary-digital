import express from 'express';
import { body, param } from 'express-validator';
import MenuController from '../controllers/MenuController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// MENU ROUTES
// ============================================

/**
 * @swagger
 * /api/cms/menus:
 *   post:
 *     tags: [CMS - Menus]
 *     summary: Create a new menu
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
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *                 enum: [primary, footer, sidebar, mobile]
 *     responses:
 *       201:
 *         description: Menu created successfully
 */
router.post(
  '/',
  body('name').notEmpty().withMessage('Name is required'),
  MenuController.createMenu
);

/**
 * @swagger
 * /api/cms/menus:
 *   get:
 *     tags: [CMS - Menus]
 *     summary: List all menus
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menus retrieved successfully
 */
router.get('/', MenuController.listMenus);

/**
 * @swagger
 * /api/cms/menus/statistics:
 *   get:
 *     tags: [CMS - Menus]
 *     summary: Get menu statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/statistics', MenuController.getMenuStatistics);

/**
 * @swagger
 * /api/cms/menus/slug/{slug}:
 *   get:
 *     tags: [CMS - Menus]
 *     summary: Get menu by slug
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
 *         description: Menu retrieved successfully
 */
router.get(
  '/slug/:slug',
  param('slug').notEmpty(),
  MenuController.getMenuBySlug
);

/**
 * @swagger
 * /api/cms/menus/location/{location}:
 *   get:
 *     tags: [CMS - Menus]
 *     summary: Get menu by location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *           enum: [primary, footer, sidebar, mobile]
 *     responses:
 *       200:
 *         description: Menu retrieved successfully
 */
router.get(
  '/location/:location',
  param('location').isIn(['primary', 'footer', 'sidebar', 'mobile']),
  MenuController.getMenuByLocation
);

/**
 * @swagger
 * /api/cms/menus/{id}:
 *   get:
 *     tags: [CMS - Menus]
 *     summary: Get menu by ID
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
 *         description: Menu retrieved successfully
 */
router.get(
  '/:id',
  param('id').isInt(),
  MenuController.getMenuById
);

/**
 * @swagger
 * /api/cms/menus/{id}:
 *   put:
 *     tags: [CMS - Menus]
 *     summary: Update menu
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
 *         description: Menu updated successfully
 */
router.put(
  '/:id',
  param('id').isInt(),
  MenuController.updateMenu
);

/**
 * @swagger
 * /api/cms/menus/{id}:
 *   delete:
 *     tags: [CMS - Menus]
 *     summary: Delete menu
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
 *         description: Menu deleted successfully
 */
router.delete(
  '/:id',
  param('id').isInt(),
  MenuController.deleteMenu
);

/**
 * @swagger
 * /api/cms/menus/{id}/duplicate:
 *   post:
 *     tags: [CMS - Menus]
 *     summary: Duplicate menu
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
 *         description: Menu duplicated successfully
 */
router.post(
  '/:id/duplicate',
  param('id').isInt(),
  MenuController.duplicateMenu
);

// ============================================
// MENU ITEM ROUTES
// ============================================

/**
 * @swagger
 * /api/cms/menus/{menuId}/items:
 *   post:
 *     tags: [CMS - Menus]
 *     summary: Add menu item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
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
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [custom, page, post, category, external]
 *               targetId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Menu item added successfully
 */
router.post(
  '/:menuId/items',
  [
    param('menuId').isInt(),
    body('title').notEmpty().withMessage('Title is required')
  ],
  MenuController.addMenuItem
);

/**
 * @swagger
 * /api/cms/menus/{menuId}/reorder:
 *   post:
 *     tags: [CMS - Menus]
 *     summary: Reorder menu items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
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
 *               - itemOrders
 *             properties:
 *               itemOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                     order:
 *                       type: integer
 *                     parentId:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Menu items reordered successfully
 */
router.post(
  '/:menuId/reorder',
  [
    param('menuId').isInt(),
    body('itemOrders').isArray()
  ],
  MenuController.reorderMenuItems
);

/**
 * @swagger
 * /api/cms/menus/{menuId}/items/bulk-add-pages:
 *   post:
 *     tags: [CMS - Menus]
 *     summary: Bulk add pages as menu items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
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
 *               - pageIds
 *             properties:
 *               pageIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Pages added to menu successfully
 */
router.post(
  '/:menuId/items/bulk-add-pages',
  [
    param('menuId').isInt(),
    body('pageIds').isArray()
  ],
  MenuController.addPagesAsMenuItems
);

/**
 * @swagger
 * /api/cms/menus/items/{itemId}:
 *   get:
 *     tags: [CMS - Menus]
 *     summary: Get menu item by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menu item retrieved successfully
 */
router.get(
  '/items/:itemId',
  param('itemId').isInt(),
  MenuController.getMenuItemById
);

/**
 * @swagger
 * /api/cms/menus/items/{itemId}:
 *   put:
 *     tags: [CMS - Menus]
 *     summary: Update menu item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 */
router.put(
  '/items/:itemId',
  param('itemId').isInt(),
  MenuController.updateMenuItem
);

/**
 * @swagger
 * /api/cms/menus/items/{itemId}:
 *   delete:
 *     tags: [CMS - Menus]
 *     summary: Delete menu item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 */
router.delete(
  '/items/:itemId',
  param('itemId').isInt(),
  MenuController.deleteMenuItem
);

export default router;
