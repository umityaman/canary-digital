import express from 'express';
import { body, param, query } from 'express-validator';
import MediaController from '../controllers/MediaController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// MEDIA FILE ROUTES
// ============================================

/**
 * @swagger
 * /api/cms/media/upload:
 *   post:
 *     tags: [CMS - Media]
 *     summary: Upload single media file
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
 *               title:
 *                 type: string
 *               altText:
 *                 type: string
 *               folderId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
router.post(
  '/upload',
  (MediaController.uploadSingle as any),
  (MediaController.uploadMedia as any)
);

/**
 * @swagger
 * /api/cms/media/upload/multiple:
 *   post:
 *     tags: [CMS - Media]
 *     summary: Upload multiple media files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 */
router.post(
  '/upload/multiple',
  (MediaController.uploadMultiple as any),
  (MediaController.uploadMultipleMedia as any)
);

/**
 * @swagger
 * /api/cms/media:
 *   get:
 *     tags: [CMS - Media]
 *     summary: List media files
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, video, audio, document]
 *       - in: query
 *         name: folderId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media files retrieved successfully
 */
router.get('/', MediaController.listMedia);

/**
 * @swagger
 * /api/cms/media/statistics:
 *   get:
 *     tags: [CMS - Media]
 *     summary: Get media statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/statistics', MediaController.getMediaStatistics);

/**
 * @swagger
 * /api/cms/media/{id}:
 *   get:
 *     tags: [CMS - Media]
 *     summary: Get media file by ID
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
 *         description: Media file retrieved successfully
 */
router.get(
  '/:id',
  param('id').isInt(),
  MediaController.getMediaById
);

/**
 * @swagger
 * /api/cms/media/{id}:
 *   put:
 *     tags: [CMS - Media]
 *     summary: Update media file metadata
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
 *         description: Media file updated successfully
 */
router.put(
  '/:id',
  param('id').isInt(),
  MediaController.updateMedia
);

/**
 * @swagger
 * /api/cms/media/{id}:
 *   delete:
 *     tags: [CMS - Media]
 *     summary: Delete media file
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
 *         description: Media file deleted successfully
 */
router.delete(
  '/:id',
  param('id').isInt(),
  MediaController.deleteMedia
);

/**
 * @swagger
 * /api/cms/media/bulk:
 *   delete:
 *     tags: [CMS - Media]
 *     summary: Delete multiple media files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mediaIds
 *             properties:
 *               mediaIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Media files deleted successfully
 */
router.delete(
  '/bulk',
  body('mediaIds').isArray().withMessage('mediaIds must be an array'),
  MediaController.deleteMultiple
);

/**
 * @swagger
 * /api/cms/media/move:
 *   post:
 *     tags: [CMS - Media]
 *     summary: Move files to folder
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileIds
 *             properties:
 *               fileIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               folderId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Files moved successfully
 */
router.post(
  '/move',
  body('fileIds').isArray().withMessage('fileIds must be an array'),
  MediaController.moveFilesToFolder
);

// ============================================
// FOLDER ROUTES
// ============================================

/**
 * @swagger
 * /api/cms/media/folders:
 *   post:
 *     tags: [CMS - Media]
 *     summary: Create folder
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
 *               parentId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Folder created successfully
 */
router.post(
  '/folders',
  body('name').notEmpty().withMessage('Name is required'),
  MediaController.createFolder
);

/**
 * @swagger
 * /api/cms/media/folders:
 *   get:
 *     tags: [CMS - Media]
 *     summary: List folders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Folders retrieved successfully
 */
router.get('/folders', MediaController.listFolders);

/**
 * @swagger
 * /api/cms/media/folders/hierarchy:
 *   get:
 *     tags: [CMS - Media]
 *     summary: Get folder hierarchy
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Folder hierarchy retrieved successfully
 */
router.get('/folders/hierarchy', MediaController.getFolderHierarchy);

/**
 * @swagger
 * /api/cms/media/folders/{id}:
 *   put:
 *     tags: [CMS - Media]
 *     summary: Update folder
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
 *         description: Folder updated successfully
 */
router.put(
  '/folders/:id',
  param('id').isInt(),
  MediaController.updateFolder
);

/**
 * @swagger
 * /api/cms/media/folders/{id}:
 *   delete:
 *     tags: [CMS - Media]
 *     summary: Delete folder
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
 *         description: Folder deleted successfully
 */
router.delete(
  '/folders/:id',
  param('id').isInt(),
  MediaController.deleteFolder
);

export default router;
