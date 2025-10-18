import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

interface CreateConversationData {
  companyId: number;
  userId?: number;
  title?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  language?: string;
  context?: any;
}

interface SendMessageData {
  conversationId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  userAgent?: string;
  ipAddress?: string;
}

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

class ChatbotService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  OPENAI_API_KEY not found in environment variables. Chatbot will not work.');
      this.openai = null as any;
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  // ============================================================
  // CONVERSATION MANAGEMENT
  // ============================================================

  async createConversation(data: CreateConversationData) {
    const conversation = await prisma.conversation.create({
      data: {
        companyId: data.companyId,
        userId: data.userId,
        title: data.title || 'New Conversation',
        model: data.model || 'gpt-3.5-turbo',
        temperature: data.temperature || 0.7,
        maxTokens: data.maxTokens || 2000,
        language: data.language || 'tr',
        context: data.context ? JSON.stringify(data.context) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return conversation;
  }

  async getConversationById(id: number, companyId: number) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return conversation;
  }

  async listConversations(
    companyId: number,
    userId?: number,
    status?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const where: any = { companyId };
    
    if (userId) {
      where.userId = userId;
    }
    
    if (status) {
      where.status = status;
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.conversation.count({ where }),
    ]);

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateConversation(id: number, companyId: number, data: any) {
    const conversation = await prisma.conversation.updateMany({
      where: {
        id,
        companyId,
      },
      data: {
        title: data.title,
        status: data.status,
        tags: data.tags,
        sentiment: data.sentiment,
        context: data.context ? JSON.stringify(data.context) : undefined,
      },
    });

    return conversation;
  }

  async deleteConversation(id: number, companyId: number) {
    const conversation = await prisma.conversation.deleteMany({
      where: {
        id,
        companyId,
      },
    });

    return conversation;
  }

  async archiveConversation(id: number, companyId: number) {
    const conversation = await prisma.conversation.updateMany({
      where: {
        id,
        companyId,
      },
      data: {
        status: 'archived',
      },
    });

    return conversation;
  }

  // ============================================================
  // MESSAGE MANAGEMENT
  // ============================================================

  async createMessage(data: SendMessageData) {
    const message = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });

    // Update conversation updatedAt timestamp
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getMessagesByConversation(conversationId: number, page: number = 1, limit: number = 50) {
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // AI CHAT COMPLETION
  // ============================================================

  async sendChatMessage(
    conversationId: number,
    userMessage: string,
    options: ChatCompletionOptions = {},
    metadata?: { userAgent?: string; ipAddress?: string }
  ) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    // Get conversation details
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20, // Last 20 messages for context
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Save user message
    const userMsg = await this.createMessage({
      conversationId,
      role: 'user',
      content: userMessage,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    });

    // Prepare messages for OpenAI
    const messages: any[] = [];

    // System prompt
    const systemPrompt = options.systemPrompt || this.getDefaultSystemPrompt(conversation.language);
    messages.push({
      role: 'system',
      content: systemPrompt,
    });

    // Add conversation history
    conversation.messages.forEach((msg) => {
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    try {
      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: options.model || conversation.model || 'gpt-3.5-turbo',
        messages,
        temperature: options.temperature || conversation.temperature || 0.7,
        max_tokens: options.maxTokens || conversation.maxTokens || 2000,
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
      const usage = completion.usage;

      // Save assistant message
      const assistantMsg = await this.createMessage({
        conversationId,
        role: 'assistant',
        content: assistantMessage,
      });

      // Update message with AI metadata
      await prisma.message.update({
        where: { id: assistantMsg.id },
        data: {
          tokens: usage?.total_tokens,
          model: completion.model,
          finishReason: completion.choices[0]?.finish_reason,
        },
      });

      // Detect intent and update conversation
      const intent = await this.detectIntent(userMessage, conversation.companyId);
      if (intent) {
        await prisma.message.update({
          where: { id: userMsg.id },
          data: { intent: intent.name },
        });
      }

      return {
        userMessage: userMsg,
        assistantMessage: assistantMsg,
        usage,
      };
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      
      // Save error as assistant message
      const errorMsg = await this.createMessage({
        conversationId,
        role: 'assistant',
        content: 'Üzgünüm, şu anda bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      });

      throw error;
    }
  }

  // ============================================================
  // STREAMING CHAT COMPLETION
  // ============================================================

  async *streamChatMessage(
    conversationId: number,
    userMessage: string,
    options: ChatCompletionOptions = {},
    metadata?: { userAgent?: string; ipAddress?: string }
  ) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20,
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Save user message
    await this.createMessage({
      conversationId,
      role: 'user',
      content: userMessage,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    });

    // Prepare messages
    const messages: any[] = [];
    const systemPrompt = options.systemPrompt || this.getDefaultSystemPrompt(conversation.language);
    messages.push({ role: 'system', content: systemPrompt });

    conversation.messages.forEach((msg) => {
      if (msg.role !== 'system') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });

    messages.push({ role: 'user', content: userMessage });

    // Stream response
    const stream = await this.openai.chat.completions.create({
      model: options.model || conversation.model || 'gpt-3.5-turbo',
      messages,
      temperature: options.temperature || conversation.temperature || 0.7,
      max_tokens: options.maxTokens || conversation.maxTokens || 2000,
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        yield content;
      }
    }

    // Save complete assistant message
    await this.createMessage({
      conversationId,
      role: 'assistant',
      content: fullResponse,
    });
  }

  // ============================================================
  // KNOWLEDGE BASE
  // ============================================================

  async createKnowledge(companyId: number, data: any) {
    const knowledge = await prisma.chatbotKnowledge.create({
      data: {
        companyId,
        title: data.title,
        content: data.content,
        category: data.category,
        keywords: data.keywords || [],
        language: data.language || 'tr',
        priority: data.priority || 0,
      },
    });

    return knowledge;
  }

  async searchKnowledge(companyId: number, query: string, limit: number = 5) {
    const knowledge = await prisma.chatbotKnowledge.findMany({
      where: {
        companyId,
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { keywords: { has: query } },
        ],
      },
      orderBy: {
        priority: 'desc',
      },
      take: limit,
    });

    return knowledge;
  }

  async listKnowledge(companyId: number, category?: string, page: number = 1, limit: number = 20) {
    const where: any = { companyId };
    
    if (category) {
      where.category = category;
    }

    const [knowledge, total] = await Promise.all([
      prisma.chatbotKnowledge.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.chatbotKnowledge.count({ where }),
    ]);

    return {
      knowledge,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateKnowledge(id: number, companyId: number, data: any) {
    const knowledge = await prisma.chatbotKnowledge.updateMany({
      where: { id, companyId },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        keywords: data.keywords,
        isActive: data.isActive,
        priority: data.priority,
      },
    });

    return knowledge;
  }

  async deleteKnowledge(id: number, companyId: number) {
    const knowledge = await prisma.chatbotKnowledge.deleteMany({
      where: { id, companyId },
    });

    return knowledge;
  }

  // ============================================================
  // INTENT DETECTION
  // ============================================================

  async createIntent(companyId: number, data: any) {
    const intent = await prisma.chatbotIntent.create({
      data: {
        companyId,
        name: data.name,
        description: data.description,
        patterns: data.patterns || [],
        responses: data.responses || [],
        action: data.action,
        priority: data.priority || 0,
      },
    });

    return intent;
  }

  async detectIntent(message: string, companyId: number) {
    const intents = await prisma.chatbotIntent.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: {
        priority: 'desc',
      },
    });

    const lowerMessage = message.toLowerCase();

    for (const intent of intents) {
      for (const pattern of intent.patterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(lowerMessage)) {
          return intent;
        }
      }
    }

    return null;
  }

  async listIntents(companyId: number) {
    const intents = await prisma.chatbotIntent.findMany({
      where: { companyId },
      orderBy: {
        priority: 'desc',
      },
    });

    return intents;
  }

  async updateIntent(id: number, companyId: number, data: any) {
    const intent = await prisma.chatbotIntent.updateMany({
      where: { id, companyId },
      data: {
        name: data.name,
        description: data.description,
        patterns: data.patterns,
        responses: data.responses,
        action: data.action,
        isActive: data.isActive,
        priority: data.priority,
      },
    });

    return intent;
  }

  async deleteIntent(id: number, companyId: number) {
    const intent = await prisma.chatbotIntent.deleteMany({
      where: { id, companyId },
    });

    return intent;
  }

  // ============================================================
  // ANALYTICS
  // ============================================================

  async getConversationStatistics(companyId: number, startDate?: Date, endDate?: Date) {
    const where: any = { companyId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalConversations,
      activeConversations,
      archivedConversations,
      totalMessages,
      avgMessagesPerConversation,
    ] = await Promise.all([
      prisma.conversation.count({ where }),
      prisma.conversation.count({ where: { ...where, status: 'active' } }),
      prisma.conversation.count({ where: { ...where, status: 'archived' } }),
      prisma.message.count({
        where: {
          conversation: where,
        },
      }),
      prisma.message.groupBy({
        by: ['conversationId'],
        where: {
          conversation: where,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const avgMessages = avgMessagesPerConversation.length > 0
      ? avgMessagesPerConversation.reduce((acc, curr) => acc + curr._count.id, 0) / avgMessagesPerConversation.length
      : 0;

    return {
      totalConversations,
      activeConversations,
      archivedConversations,
      totalMessages,
      avgMessagesPerConversation: Math.round(avgMessages * 10) / 10,
    };
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  private getDefaultSystemPrompt(language: string = 'tr'): string {
    const prompts: Record<string, string> = {
      tr: `Sen yardımcı ve profesyonel bir AI asistanısın. Kullanıcılara nazik, bilgili ve yapıcı bir şekilde yardım ediyorsun. 
Sorulara net, doğru ve anlaşılır yanıtlar veriyorsun. Emin olmadığın konularda bunu açıkça belirtiyorsun.
Türkçe dilbilgisi kurallarına dikkat ediyorsun ve resmi ama samimi bir ton kullanıyorsun.`,
      
      en: `You are a helpful and professional AI assistant. You help users in a kind, knowledgeable, and constructive way.
You provide clear, accurate, and understandable answers to questions. You openly acknowledge when you're not sure about something.
You pay attention to proper grammar and use a formal but friendly tone.`,
    };

    return prompts[language] || prompts['tr'];
  }
}

export default new ChatbotService();
