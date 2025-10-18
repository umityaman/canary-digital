import express from 'express';
import { body, param, query } from 'express-validator';
import ChatbotController from '../controllers/ChatbotController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: AI Chatbot management endpoints
 */

// ============================================================
// CONVERSATION ROUTES
// ============================================================

/**
 * @swagger
 * /api/chatbot/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               model:
 *                 type: string
 *                 enum: [gpt-3.5-turbo, gpt-4]
 *               temperature:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 2
 *               maxTokens:
 *                 type: integer
 *               language:
 *                 type: string
 *                 enum: [tr, en]
 *     responses:
 *       201:
 *         description: Conversation created successfully
 */
router.post(
  '/conversations',
  [
    body('title').optional().isString(),
    body('model').optional().isIn(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']),
    body('temperature').optional().isFloat({ min: 0, max: 2 }),
    body('maxTokens').optional().isInt({ min: 100, max: 4000 }),
    body('language').optional().isIn(['tr', 'en']),
  ],
  ChatbotController.createConversation
);

/**
 * @swagger
 * /api/chatbot/conversations:
 *   get:
 *     summary: List all conversations
 *     tags: [Chatbot]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived, closed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', ChatbotController.listConversations);

/**
 * @swagger
 * /api/chatbot/conversations/{id}:
 *   get:
 *     summary: Get conversation by ID
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation details
 *       404:
 *         description: Conversation not found
 */
router.get(
  '/conversations/:id',
  ChatbotController.getConversation
);

/**
 * @swagger
 * /api/chatbot/conversations/{id}:
 *   put:
 *     summary: Update conversation
 *     tags: [Chatbot]
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
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, archived, closed]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               sentiment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conversation updated successfully
 */
router.put(
  '/conversations/:id',
  [
    param('id').isInt(),
    body('title').optional().isString(),
    body('status').optional().isIn(['active', 'archived', 'closed']),
    body('tags').optional().isArray(),
    body('sentiment').optional().isString(),
  ],
  ChatbotController.updateConversation
);

/**
 * @swagger
 * /api/chatbot/conversations/{id}:
 *   delete:
 *     summary: Delete conversation
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 */
router.delete(
  '/conversations/:id',
  [param('id').isInt()],
  ChatbotController.deleteConversation
);

/**
 * @swagger
 * /api/chatbot/conversations/{id}/archive:
 *   post:
 *     summary: Archive conversation
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation archived successfully
 */
router.post(
  '/conversations/:id/archive',
  [param('id').isInt()],
  ChatbotController.archiveConversation
);

// ============================================================
// MESSAGE ROUTES
// ============================================================

/**
 * @swagger
 * /api/chatbot/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get conversation messages
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get(
  '/conversations/:conversationId/messages',
  ChatbotController.getMessages
);

/**
 * @swagger
 * /api/chatbot/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message and get AI response
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: conversationId
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
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               model:
 *                 type: string
 *               temperature:
 *                 type: number
 *               maxTokens:
 *                 type: integer
 *               systemPrompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent and response received
 *       400:
 *         description: Invalid request
 */
router.post(
  '/conversations/:conversationId/messages',
  [
    param('conversationId').isInt(),
    body('message').notEmpty().isString(),
    body('model').optional().isString(),
    body('temperature').optional().isFloat({ min: 0, max: 2 }),
    body('maxTokens').optional().isInt({ min: 100, max: 4000 }),
    body('systemPrompt').optional().isString(),
  ],
  ChatbotController.sendMessage
);

/**
 * @swagger
 * /api/chatbot/conversations/{conversationId}/stream:
 *   post:
 *     summary: Send a message and stream AI response
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: conversationId
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
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Streaming response
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.post(
  '/conversations/:conversationId/stream',
  [
    param('conversationId').isInt(),
    body('message').notEmpty().isString(),
  ],
  ChatbotController.streamMessage
);

// ============================================================
// KNOWLEDGE BASE ROUTES
// ============================================================

/**
 * @swagger
 * /api/chatbot/knowledge:
 *   post:
 *     summary: Create knowledge base entry
 *     tags: [Chatbot]
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
 *               category:
 *                 type: string
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               priority:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Knowledge created successfully
 */
router.post(
  '/knowledge',
  [
    body('title').notEmpty().isString(),
    body('content').notEmpty().isString(),
    body('category').optional().isString(),
    body('keywords').optional().isArray(),
    body('priority').optional().isInt(),
  ],
  ChatbotController.createKnowledge
);

/**
 * @swagger
 * /api/chatbot/knowledge/search:
 *   get:
 *     summary: Search knowledge base
 *     tags: [Chatbot]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results
 */
router.get(
  '/knowledge/search',
  ChatbotController.searchKnowledge
);

/**
 * @swagger
 * /api/chatbot/knowledge:
 *   get:
 *     summary: List knowledge base entries
 *     tags: [Chatbot]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of knowledge entries
 */
router.get('/knowledge', ChatbotController.listKnowledge);

/**
 * @swagger
 * /api/chatbot/knowledge/{id}:
 *   put:
 *     summary: Update knowledge entry
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Knowledge updated successfully
 */
router.put(
  '/knowledge/:id',
  [param('id').isInt()],
  ChatbotController.updateKnowledge
);

/**
 * @swagger
 * /api/chatbot/knowledge/{id}:
 *   delete:
 *     summary: Delete knowledge entry
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Knowledge deleted successfully
 */
router.delete(
  '/knowledge/:id',
  [param('id').isInt()],
  ChatbotController.deleteKnowledge
);

// ============================================================
// INTENT ROUTES
// ============================================================

/**
 * @swagger
 * /api/chatbot/intents:
 *   post:
 *     summary: Create chatbot intent
 *     tags: [Chatbot]
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
 *               description:
 *                 type: string
 *               patterns:
 *                 type: array
 *                 items:
 *                   type: string
 *               responses:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Intent created successfully
 */
router.post(
  '/intents',
  [
    body('name').notEmpty().isString(),
    body('description').optional().isString(),
    body('patterns').optional().isArray(),
    body('responses').optional().isArray(),
  ],
  ChatbotController.createIntent
);

/**
 * @swagger
 * /api/chatbot/intents:
 *   get:
 *     summary: List all intents
 *     tags: [Chatbot]
 *     responses:
 *       200:
 *         description: List of intents
 */
router.get('/intents', ChatbotController.listIntents);

/**
 * @swagger
 * /api/chatbot/intents/{id}:
 *   put:
 *     summary: Update intent
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Intent updated successfully
 */
router.put(
  '/intents/:id',
  [param('id').isInt()],
  ChatbotController.updateIntent
);

/**
 * @swagger
 * /api/chatbot/intents/{id}:
 *   delete:
 *     summary: Delete intent
 *     tags: [Chatbot]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Intent deleted successfully
 */
router.delete(
  '/intents/:id',
  [param('id').isInt()],
  ChatbotController.deleteIntent
);

// ============================================================
// ANALYTICS ROUTES
// ============================================================

/**
 * @swagger
 * /api/chatbot/statistics:
 *   get:
 *     summary: Get chatbot statistics
 *     tags: [Chatbot]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Chatbot statistics
 */
router.get('/statistics', ChatbotController.getStatistics);

export default router;
