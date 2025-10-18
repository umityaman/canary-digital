import { Request, Response } from 'express';
import ChatbotService from '../services/ChatbotService';

class ChatbotController {
  // ============================================================
  // CONVERSATION ENDPOINTS
  // ============================================================

  async createConversation(req: Request, res: Response) {
    try {
      const { title, model, temperature, maxTokens, language, context } = req.body;
      const companyId = (req as any).user.companyId;
      const userId = (req as any).user.id;

      const conversation = await ChatbotService.createConversation({
        companyId,
        userId,
        title,
        model,
        temperature,
        maxTokens,
        language,
        context,
      });

      res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: conversation,
      });
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create conversation',
      });
    }
  }

  async getConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = (req as any).user.companyId;

      const conversation = await ChatbotService.getConversationById(parseInt(id), companyId);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch conversation',
      });
    }
  }

  async listConversations(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const { userId, status, page = 1, limit = 20 } = req.query;

      const result = await ChatbotService.listConversations(
        companyId,
        userId ? parseInt(userId as string) : undefined,
        status as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.conversations,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Error listing conversations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list conversations',
      });
    }
  }

  async updateConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = (req as any).user.companyId;
      const { title, status, tags, sentiment, context } = req.body;

      await ChatbotService.updateConversation(parseInt(id), companyId, {
        title,
        status,
        tags,
        sentiment,
        context,
      });

      res.json({
        success: true,
        message: 'Conversation updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating conversation:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update conversation',
      });
    }
  }

  async deleteConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = (req as any).user.companyId;

      await ChatbotService.deleteConversation(parseInt(id), companyId);

      res.json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete conversation',
      });
    }
  }

  async archiveConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = (req as any).user.companyId;

      await ChatbotService.archiveConversation(parseInt(id), companyId);

      res.json({
        success: true,
        message: 'Conversation archived successfully',
      });
    } catch (error: any) {
      console.error('Error archiving conversation:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to archive conversation',
      });
    }
  }

  // ============================================================
  // MESSAGE ENDPOINTS
  // ============================================================

  async getMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await ChatbotService.getMessagesByConversation(
        parseInt(conversationId),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.messages,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch messages',
      });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { message, model, temperature, maxTokens, systemPrompt } = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Message content is required',
        });
      }

      const result = await ChatbotService.sendChatMessage(
        parseInt(conversationId),
        message,
        {
          model,
          temperature,
          maxTokens,
          systemPrompt,
        },
        {
          userAgent,
          ipAddress,
        }
      );

      res.json({
        success: true,
        data: {
          userMessage: result.userMessage,
          assistantMessage: result.assistantMessage,
          usage: result.usage,
        },
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send message',
      });
    }
  }

  async streamMessage(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { message, model, temperature, maxTokens, systemPrompt } = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Message content is required',
        });
      }

      // Set headers for Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = ChatbotService.streamChatMessage(
        parseInt(conversationId),
        message,
        {
          model,
          temperature,
          maxTokens,
          systemPrompt,
        },
        {
          userAgent,
          ipAddress,
        }
      );

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Error streaming message:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to stream message',
      });
    }
  }

  // ============================================================
  // KNOWLEDGE BASE ENDPOINTS
  // ============================================================

  async createKnowledge(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const { title, content, category, keywords, language, priority } = req.body;

      const knowledge = await ChatbotService.createKnowledge(companyId, {
        title,
        content,
        category,
        keywords,
        language,
        priority,
      });

      res.status(201).json({
        success: true,
        message: 'Knowledge created successfully',
        data: knowledge,
      });
    } catch (error: any) {
      console.error('Error creating knowledge:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create knowledge',
      });
    }
  }

  async searchKnowledge(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const { query, limit = 5 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter is required',
        });
      }

      const knowledge = await ChatbotService.searchKnowledge(
        companyId,
        query as string,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: knowledge,
      });
    } catch (error: any) {
      console.error('Error searching knowledge:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search knowledge',
      });
    }
  }

  async listKnowledge(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const { category, page = 1, limit = 20 } = req.query;

      const result = await ChatbotService.listKnowledge(
        companyId,
        category as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.knowledge,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Error listing knowledge:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list knowledge',
      });
    }
  }

  async updateKnowledge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = (req as any).user.companyId;
      const { title, content, category, keywords, isActive, priority } = req.body;

      await ChatbotService.updateKnowledge(parseInt(id), companyId, {
        title,
        content,
        category,
        keywords,
        isActive,
        priority,
      });

      res.json({
        success: true,
        message: 'Knowledge updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating knowledge:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update knowledge',
      });
    }
  }

  async deleteKnowledge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = (req as any).user.companyId;

      await ChatbotService.deleteKnowledge(parseInt(id), companyId);

      res.json({
        success: true,
        message: 'Knowledge deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting knowledge:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete knowledge',
      });
    }
  }

  // ============================================================
  // INTENT ENDPOINTS
  // ============================================================

  async createIntent(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const { name, description, patterns, responses, action, priority } = req.body;

      const intent = await ChatbotService.createIntent(companyId, {
        name,
        description,
        patterns,
        responses,
        action,
        priority,
      });

      res.status(201).json({
        success: true,
        message: 'Intent created successfully',
        data: intent,
      });
    } catch (error: any) {
      console.error('Error creating intent:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create intent',
      });
    }
  }

  async listIntents(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;

      const intents = await ChatbotService.listIntents(companyId);

      res.json({
        success: true,
        data: intents,
      });
    } catch (error: any) {
      console.error('Error listing intents:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list intents',
      });
    }
  }

  async updateIntent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = (req as any).user.companyId;
      const { name, description, patterns, responses, action, isActive, priority } = req.body;

      await ChatbotService.updateIntent(parseInt(id), companyId, {
        name,
        description,
        patterns,
        responses,
        action,
        isActive,
        priority,
      });

      res.json({
        success: true,
        message: 'Intent updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating intent:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update intent',
      });
    }
  }

  async deleteIntent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = (req as any).user.companyId;

      await ChatbotService.deleteIntent(parseInt(id), companyId);

      res.json({
        success: true,
        message: 'Intent deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting intent:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete intent',
      });
    }
  }

  // ============================================================
  // ANALYTICS ENDPOINTS
  // ============================================================

  async getStatistics(req: Request, res: Response) {
    try {
      const companyId = (req as any).user.companyId;
      const { startDate, endDate } = req.query;

      const statistics = await ChatbotService.getConversationStatistics(
        companyId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch statistics',
      });
    }
  }
}

export default new ChatbotController();
