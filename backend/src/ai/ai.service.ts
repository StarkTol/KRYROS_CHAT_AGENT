import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

// OpenAI TypeScript types
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionMessage {
  role: 'assistant' | 'system' | 'user';
  content: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openaiApiKey: string;
  private organizationId: string;

  // Keywords that trigger human takeover
  private readonly HUMAN_TAKEOVER_KEYWORDS = [
    'talk to human',
    'talk to a human',
    'speak to human',
    'speak to a human',
    'need human',
    'need a human',
    'real person',
    'real human',
    'agent',
    'customer service',
    'speak to agent',
    'talk to agent',
    'manager',
    'supervisor',
    'help from human',
    'human support',
    'I want to talk to someone',
    'connect me to someone',
    'let me speak to',
    'get me',
    'escalate',
    'complaint',
    'speak to manager',
    'talk to manager',
    'get a person',
    'need person',
    'please connect me',
    'transfer to',
    'live person',
    'live agent',
    'human being',
    'real person',
    'speak with',
    'talk with',
    'help from person',
    'need assistance',
    'speak with someone',
    'need to speak',
    'talk to someone',
    'get someone',
    'call someone',
  ];

  // Response delay range to simulate human typing (milliseconds)
  private readonly MIN_DELAY = 800;
  private readonly MAX_DELAY = 2500;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.organizationId = this.configService.get<string>('OPENAI_ORG_ID') || '';
  }

  /**
   * Generate AI response using OpenAI GPT-4
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: { role: string; content: string; timestamp: Date }[],
    businessContext: {
      businessName: string;
      businessDescription?: string;
      productServiceInfo?: string;
      tone?: string;
    },
    language: string = 'en',
  ): Promise<{ response: string; shouldHumanTakeover: boolean }> {
    this.logger.log(`Generating AI response for message: ${userMessage.substring(0, 50)}...`);

    // Check if human takeover is requested
    const shouldHumanTakeover = this.checkForHumanTakeover(userMessage);
    if (shouldHumanTakeover) {
      this.logger.warn('Human takeover requested by customer');
      return {
        response: 'I understand you want to speak with a human agent. Let me connect you with one of our team members. Please wait a moment.',
        shouldHumanTakeover: true,
      };
    }

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(businessContext, language);

    // Build messages array
    const messages: ChatCompletionMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    try {
      // Call OpenAI API
      const response = await this.callOpenAI(messages);
      
      this.logger.log('AI response generated successfully');
      return {
        response,
        shouldHumanTakeover: false,
      };
    } catch (error) {
      this.logger.error('Failed to generate AI response', error);
      
      // Fallback response
      return {
        response: 'Thank you for your message! Our team will get back to you shortly. For urgent matters, please contact us directly.',
        shouldHumanTakeover: false,
      };
    }
  }

  /**
   * Build system prompt for the AI
   */
  private buildSystemPrompt(
    businessContext: {
      businessName: string;
      businessDescription?: string;
      productServiceInfo?: string;
      tone?: string;
    },
    language: string,
  ): string {
    const { businessName, businessDescription, productServiceInfo, tone } = businessContext;
    
    const toneInstructions = tone === 'formal' 
      ? 'Use formal, professional language. Be courteous and respectful.'
      : tone === 'casual'
      ? 'Use casual, friendly language. Be conversational and approachable.'
      : 'Use a friendly but professional tone. Balance professionalism with warmth.';

    return `You are an AI customer service representative for ${businessName}.

${businessDescription ? `About ${businessName}: ${businessDescription}` : ''}

${productServiceInfo ? `Products/Services: ${productServiceInfo}` : ''}

${toneInstructions}

IMPORTANT RULES:
1. Always be helpful, polite, and professional
2. If you don't know something, admit it and offer to help find the answer
3. Keep responses concise but informative (2-4 sentences typically)
4. If the customer asks to speak to a human, DO NOT try to continue assisting - immediately acknowledge and indicate you will connect them to a human agent
5. Never mention that you are an AI
6. Respond in the same language the customer uses (${language === 'en' ? 'English' : language})

Your goal is to provide excellent customer service and help customers with their inquiries.`;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(messages: ChatCompletionMessage[]): Promise<string> {
    const apiKey = this.openaiApiKey;
    
    if (!apiKey) {
      this.logger.warn('No OpenAI API key configured, using fallback');
      return this.getFallbackResponse();
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(this.organizationId ? { 'OpenAI-Organization': this.organizationId } : {}),
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || this.getFallbackResponse();
  }

  /**
   * Fallback responses when OpenAI is unavailable
   */
  private getFallbackResponse(): string {
    const fallbacks = [
      'Thank you for reaching out! How can I assist you today?',
      'I appreciate your message. What can I help you with?',
      'Thanks for contacting us! What questions do you have?',
      'Hello! Thank you for your message. How may I help you?',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Check if the message requests human takeover
   */
  checkForHumanTakeover(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return this.HUMAN_TAKEOVER_KEYWORDS.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
  }

  /**
   * Calculate realistic delay for human-like response
   */
  calculateTypingDelay(messageLength: number): number {
    // Average reading speed: 200 words per minute
    // Average typing speed: 40 words per minute
    const words = messageLength / 5; // Approximate words
    const typingTime = (words / 40) * 60 * 1000; // in milliseconds
    
    // Add base delay + typing time, with some randomness
    const baseDelay = this.MIN_DELAY;
    const variableDelay = Math.random() * (this.MAX_DELAY - this.MIN_DELAY);
    const extraTime = Math.min(typingTime * 0.5, 3000); // Cap extra time at 3 seconds
    
    return Math.round(baseDelay + variableDelay + extraTime);
  }

  /**
   * Save AI conversation to database
   */
  async saveConversation(
    organizationId: string,
    contactId: string,
    platform: string,
    platformMessageId: string,
    userMessage: string,
    aiResponse: string,
    humanTakeoverTriggered: boolean = false,
  ) {
    try {
      // Save user message
      const userMsg = await this.prisma.message.create({
        data: {
          organizationId,
          conversationId: `${platform}-${contactId}`,
          contactId,
          content: userMessage,
          direction: 'INBOUND',
          platformMessageId,
          status: 'DELIVERED',
        },
      });

      // Save AI response
      const aiMsg = await this.prisma.message.create({
        data: {
          organizationId,
          conversationId: `${platform}-${contactId}`,
          contactId,
          content: aiResponse,
          direction: 'OUTBOUND',
          platformMessageId: `${platformMessageId}-response`,
          status: 'SENT',
          isAutomated: true,
          aiUsed: true,
          humanTakeoverTriggered,
        },
      });

      // Update contact last activity
      await this.prisma.contact.update({
        where: { id: contactId },
        data: { 
          lastInteractionAt: new Date(),
          ...(humanTakeoverTriggered ? { status: 'HUMAN_REQUIRED' } : {}),
        },
      });

      return { userMsg, aiMsg };
    } catch (error) {
      this.logger.error('Failed to save AI conversation', error);
    }
  }

  /**
   * Get conversation history for AI context
   */
  async getConversationHistory(
    contactId: string,
    limit: number = 10,
  ): Promise<{ role: string; content: string; timestamp: Date }[]> {
    const messages = await this.prisma.message.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse().map(msg => ({
      role: msg.direction === 'INBOUND' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.createdAt,
    }));
  }

  /**
   * Get business context for AI
   */
  async getBusinessContext(organizationId: string) {
    const settings = await this.prisma.settings.findFirst({
      where: { organizationId },
    });

    if (!settings) {
      return {
        businessName: 'KRYROS CHAT AGENT',
        businessDescription: undefined,
        productServiceInfo: undefined,
        tone: 'friendly',
      };
    }

    return {
      businessName: settings.businessName || 'KRYROS CHAT AGENT',
      businessDescription: settings.businessDescription,
      productServiceInfo: settings.productServiceInfo,
      tone: settings.aiTone || 'friendly',
    };
  }

  /**
   * Initiate a chat with a contact
   */
  async initiateChat(
    organizationId: string,
    contactId: string,
    initialMessage: string,
    platform: string,
    platformContactId: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const businessContext = await this.getBusinessContext(organizationId);
      
      // Send the message via platform
      const messageResult = await this.sendMessageToPlatform(
        platform,
        platformContactId,
        initialMessage,
        organizationId,
      );

      if (!messageResult.success) {
        return { success: false, error: messageResult.error };
      }

      // Save the sent message
      await this.prisma.message.create({
        data: {
          organizationId,
          conversationId: `${platform}-${contactId}`,
          contactId,
          content: initialMessage,
          direction: 'OUTBOUND',
          platform,
          platformMessageId: messageResult.messageId,
          status: 'SENT',
          isAutomated: true,
          aiUsed: false, // This is a manually initiated message
        },
      });

      return { success: true, messageId: messageResult.messageId };
    } catch (error) {
      this.logger.error('Failed to initiate chat', error);
      return { success: false, error: 'Failed to send message' };
    }
  }

  /**
   * Send message to the platform (WhatsApp, FB, etc.)
   */
  private async sendMessageToPlatform(
    platform: string,
    to: string,
    message: string,
    organizationId: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Get platform credentials
    const platformConfig = await this.prisma.platformConnection.findFirst({
      where: {
        organizationId,
        platform: platform.toUpperCase() as any,
        status: 'CONNECTED' as any,
        syncEnabled: true,
      },
    });

    if (!platformConfig) {
      return { success: false, error: 'Platform not connected' };
    }

    const credentials = {
      accessToken: platformConfig.accessToken || '',
      phoneNumberId: platformConfig.phoneNumberId || '',
      instagramId: platformConfig.instagramId || '',
      facebookPageId: platformConfig.facebookPageId || '',
    } as Record<string, string>;
    
    try {
      let response;
      
      if (platform.toUpperCase() === 'WHATSAPP') {
        response = await fetch(
          `https://graph.facebook.com/v18.0/${credentials.phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to,
              type: 'text',
              text: { body: message },
            }),
          }
        );
      } else if (platform.toUpperCase() === 'FACEBOOK') {
        response = await fetch(
          `https://graph.facebook.com/v18.0/me/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipient: { id: to },
              message: { text: message },
            }),
          }
        );
      } else {
        return { success: false, error: 'Platform not supported yet' };
      }

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Platform API error: ${error}` };
      }

      const data = await response.json();
      return { 
        success: true, 
        messageId: data.messages?.[0]?.id || `msg_${Date.now()}` 
      };
    } catch (error) {
      this.logger.error(`Failed to send message via ${platform}`, error);
      return { success: false, error: 'Failed to send message' };
    }
  }

  /**
   * Set OpenAI API key
   */
  setApiKey(apiKey: string): void {
    this.openaiApiKey = apiKey;
  }
}
