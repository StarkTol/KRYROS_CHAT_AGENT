import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { AutomationService } from '../automation/automation.service';
import { AiService } from '../ai/ai.service';
import { NormalizedMessage, PlatformType, MessageDirection, MessageType } from '../messages/interfaces/message.interface';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private messagesService: MessagesService,
    private automationService: AutomationService,
    private aiService: AiService,
  ) {}

  // ============================================
  // WHATSAPP WEBHOOK
  // ============================================

  async handleWhatsAppWebhook(payload: any, platformConnectionId: string) {
    try {
      // Get organization
      const connection = await this.prisma.platformConnection.findUnique({
        where: { id: platformConnectionId },
      });

      if (!connection) {
        throw new BadRequestException('Platform connection not found');
      }

      // Verify webhook
      if (this.isWhatsAppVerification(payload)) {
        return this.handleWhatsAppVerification(payload);
      }

      // Normalize message
      const normalized = this.messagesService.normalizeWhatsAppMessage(payload);

      // Process incoming message
      const result = await this.messagesService.processIncomingMessage(
        normalized,
        connection.organizationId,
      );

      // Check if AI is enabled for this organization
      const settings = await this.prisma.settings.findFirst({
        where: { organizationId: connection.organizationId },
      });

      // If AI is enabled, generate AI response
      if (settings?.aiEnabled) {
        this.logger.log(`AI is enabled, generating response for contact ${result.contact.id}`);
        
        // Get conversation history
        const history = await this.aiService.getConversationHistory(result.contact.id, 10);
        
        // Get business context
        const businessContext = {
          businessName: settings.businessName || 'KRYROS CHAT AGENT',
          businessDescription: settings.businessDescription,
          productServiceInfo: settings.productServiceInfo,
          tone: settings.aiTone || 'friendly',
        };

        // Detect language
        const language = this.detectLanguage(normalized.content);

        // Generate AI response
        const aiResult = await this.aiService.generateResponse(
          normalized.content,
          history,
          businessContext,
          language,
        );

        // Save the AI response
        await this.aiService.saveConversation(
          connection.organizationId,
          result.contact.id,
          normalized.platform,
          normalized.platformMessageId,
          normalized.content,
          aiResult.response,
          aiResult.shouldHumanTakeoverTriggered,
        );

        // If human takeover was triggered, update contact status
        if (aiResult.shouldHumanTakeoverTriggered) {
          await this.prisma.contact.update({
            where: { id: result.contact.id },
            data: {
              status: 'HUMAN_REQUIRED',
              humanTakeover: true,
            },
          });
        } else {
          // Send the AI response to the customer
          await this.sendAiResponse(
            connection.organizationId,
            result.contact.platformId,
            normalized.platform,
            aiResult.response,
          );
        }
      } else {
        // Original automation flow (non-AI)
        await this.automationService.processAutomation('FIRST_MESSAGE', {
          organizationId: connection.organizationId,
          contactId: result.contact.id,
          conversationId: result.conversation.id,
          messageContent: normalized.content,
        });
      }

      return { success: true, messageId: result.message.id };
    } catch (error) {
      this.logger.error('WhatsApp webhook error:', error);
      throw error;
    }
  }

  private isWhatsAppVerification(payload: any): boolean {
    return (
      payload.object === 'whatsapp_business_account' &&
      payload.entry?.[0]?.changes?.[0]?.value?.statuses !== undefined
    );
  }

  async handleWhatsAppVerification(payload: any): Promise<{ status: string }> {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    const mode = payload?.hub?.mode;
    const token = payload?.hub?.verify_token;
    const challenge = payload?.hub?.challenge;

    if (mode === 'subscribe' && token === verifyToken) {
      return { status: 'VERIFIED' };
    } else {
      throw new BadRequestException('Verification failed');
    }
  }

  // ============================================
  // INSTAGRAM WEBHOOK
  // ============================================

  async handleInstagramWebhook(payload: any, platformConnectionId: string) {
    try {
      const connection = await this.prisma.platformConnection.findUnique({
        where: { id: platformConnectionId },
      });

      if (!connection) {
        throw new BadRequestException('Platform connection not found');
      }

      // Verify webhook
      if (this.isInstagramVerification(payload)) {
        return this.handleInstagramVerification(payload);
      }

      // Normalize message
      const normalized = this.messagesService.normalizeInstagramMessage(payload);

      if (!normalized) {
        return { success: true }; // Ignore non-message events
      }

      // Process incoming message
      const result = await this.messagesService.processIncomingMessage(
        normalized,
        connection.organizationId,
      );

      // Check AI settings
      const settings = await this.prisma.settings.findFirst({
        where: { organizationId: connection.organizationId },
      });

      if (settings?.aiEnabled) {
        const history = await this.aiService.getConversationHistory(result.contact.id, 10);
        const businessContext = {
          businessName: settings.businessName || 'Our Business',
          businessDescription: settings.businessDescription,
          productServiceInfo: settings.productServiceInfo,
          tone: settings.aiTone || 'friendly',
        };
        const language = this.detectLanguage(normalized.content);

        const aiResult = await this.aiService.generateResponse(
          normalized.content,
          history,
          businessContext,
          language,
        );

        await this.aiService.saveConversation(
          connection.organizationId,
          result.contact.id,
          normalized.platform,
          normalized.platformMessageId,
          normalized.content,
          aiResult.response,
          aiResult.shouldHumanTakeoverTriggered,
        );

        if (!aiResult.shouldHumanTakeoverTriggered) {
          await this.sendAiResponse(
            connection.organizationId,
            result.contact.platformId,
            normalized.platform,
            aiResult.response,
          );
        }
      }

      return { success: true, messageId: result.message.id };
    } catch (error) {
      this.logger.error('Instagram webhook error:', error);
      throw error;
    }
  }

  private isInstagramVerification(payload: any): boolean {
    return payload?.object === 'instagram';
  }

  async handleInstagramVerification(payload: any): Promise<{ status: string }> {
    const verifyToken = process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;
    const mode = payload?.hub?.mode;
    const token = payload?.hub?.verify_token;

    if (mode === 'subscribe' && token === verifyToken) {
      return { status: 'VERIFIED' };
    } else {
      throw new BadRequestException('Verification failed');
    }
  }

  // ============================================
  // FACEBOOK MESSENGER WEBHOOK
  // ============================================

  async handleFacebookWebhook(payload: any, platformConnectionId: string) {
    try {
      const connection = await this.prisma.platformConnection.findUnique({
        where: { id: platformConnectionId },
      });

      if (!connection) {
        throw new BadRequestException('Platform connection not found');
      }

      // Verify webhook
      if (this.isFacebookVerification(payload)) {
        return this.handleFacebookVerification(payload);
      }

      // Normalize message
      const normalized = this.messagesService.normalizeFacebookMessage(payload);

      if (!normalized) {
        return { success: true };
      }

      // Process incoming message
      const result = await this.messagesService.processIncomingMessage(
        normalized,
        connection.organizationId,
      );

      // Check AI settings
      const settings = await this.prisma.settings.findFirst({
        where: { organizationId: connection.organizationId },
      });

      if (settings?.aiEnabled) {
        const history = await this.aiService.getConversationHistory(result.contact.id, 10);
        const businessContext = {
          businessName: settings.businessName || 'Our Business',
          businessDescription: settings.businessDescription,
          productServiceInfo: settings.productServiceInfo,
          tone: settings.aiTone || 'friendly',
        };
        const language = this.detectLanguage(normalized.content);

        const aiResult = await this.aiService.generateResponse(
          normalized.content,
          history,
          businessContext,
          language,
        );

        await this.aiService.saveConversation(
          connection.organizationId,
          result.contact.id,
          normalized.platform,
          normalized.platformMessageId,
          normalized.content,
          aiResult.response,
          aiResult.shouldHumanTakeoverTriggered,
        );

        if (!aiResult.shouldHumanTakeoverTriggered) {
          await this.sendAiResponse(
            connection.organizationId,
            result.contact.platformId,
            normalized.platform,
            aiResult.response,
          );
        }
      }

      return { success: true, messageId: result.message.id };
    } catch (error) {
      this.logger.error('Facebook webhook error:', error);
      throw error;
    }
  }

  private isFacebookVerification(payload: any): boolean {
    return payload?.object === 'page';
  }

  async handleFacebookVerification(payload: any): Promise<{ status: string }> {
    const verifyToken = process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;
    const mode = payload?.hub?.mode;
    const token = payload?.hub?.verify_token;

    if (mode === 'subscribe' && token === verifyToken) {
      return { status: 'VERIFIED' };
    } else {
      throw new BadRequestException('Verification failed');
    }
  }

  // ============================================
  // SEND AI RESPONSE TO PLATFORM
  // ============================================

  private async sendAiResponse(
    organizationId: string,
    to: string,
    platform: string,
    message: string,
  ) {
    // Get platform credentials
    const platformConfig = await this.prisma.platformConnection.findFirst({
      where: {
        organizationId,
        platform: platform.toUpperCase() as any,
        isActive: true,
      },
    });

    if (!platformConfig) {
      this.logger.error(`No active ${platform} connection found`);
      return;
    }

    const credentials = platformConfig.credentials as Record<string, string>;

    try {
      if (platform.toUpperCase() === 'WHATSAPP') {
        await fetch(
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
        await fetch(
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
      } else if (platform.toUpperCase() === 'INSTAGRAM') {
        // Instagram uses same Graph API
        await fetch(
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
      }

      this.logger.log(`AI response sent to ${platform} user ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send AI response via ${platform}`, error);
    }
  }

  // ============================================
  // LANGUAGE DETECTION
  // ============================================

  private detectLanguage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Check for Yoruba
    const yorubaWords = ['owo', 'ki', 'ni', 'e', 'a', 'o', 'wa', 'mo', 'fun', 'won'];
    if (yorubaWords.some(word => lowerMessage.includes(word))) {
      return 'yo';
    }
    
    // Check for Igbo
    const igboWords = ['ndewo', 'bula', 'kedu', 'mese', 'unu', 'gi', 'm', 'a', 'ga'];
    if (igboWords.some(word => lowerMessage.includes(word))) {
      return 'ig';
    }
    
    // Check for Hausa
    const hausaWords = ['salaam', 'alaikum', 'na', 'gida', 'mui', 'yi', 'aiki'];
    if (hausaWords.some(word => lowerMessage.includes(word))) {
      return 'ha';
    }
    
    return 'en';
  }
}
