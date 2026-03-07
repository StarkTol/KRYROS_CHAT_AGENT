import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';

interface ChatRequest {
  contactId: string;
  message: string;
  platform: string;
  platformMessageId: string;
}

interface InitiateChatRequest {
  contactId: string;
  message: string;
}

@Controller('ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private prisma: PrismaService,
  ) {}

  /**
   * Process incoming message and get AI response
   */
  @Post('chat')
  @UseGuards(JwtAuthGuard)
  async processChat(
    @Body() body: ChatRequest,
    @Request() req: any,
  ) {
    const { contactId, message, platform, platformMessageId } = body;
    const organizationId = req.user.organizationId;

    // Get conversation history
    const history = await this.aiService.getConversationHistory(contactId, 10);

    // Get business context
    const businessContext = await this.aiService.getBusinessContext(organizationId);

    // Detect language (simple detection)
    const language = this.detectLanguage(message);

    // Generate AI response
    const result = await this.aiService.generateResponse(
      message,
      history,
      businessContext,
      language,
    );

    // Save conversation to database
    await this.aiService.saveConversation(
      organizationId,
      contactId,
      platform,
      platformMessageId,
      message,
      result.response,
      result.shouldHumanTakeover,
    );

    return {
      success: true,
      response: result.response,
      shouldHumanTakeover: result.shouldHumanTakeover,
      typingDelay: this.aiService.calculateTypingDelay(result.response.length),
    };
  }

  /**
   * Initiate a chat with a contact (proactive messaging)
   */
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  async initiateChat(
    @Body() body: InitiateChatRequest,
    @Request() req: any,
  ) {
    const { contactId, message } = body;
    const organizationId = req.user.organizationId;

    // Get contact info
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }

    const result = await this.aiService.initiateChat(
      organizationId,
      contactId,
      message,
      contact.platform,
      contact.platformId,
    );

    return result;
  }

  /**
   * Get AI settings for organization
   */
  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async getAiSettings(@Request() req: any) {
    const organizationId = req.user.organizationId;

    const settings = await this.prisma.settings.findFirst({
      where: { organizationId },
    });

    return {
      success: true,
      data: {
        aiEnabled: settings?.aiEnabled || false,
        aiModel: settings?.aiModel || 'gpt-4',
        aiTone: settings?.aiTone || 'friendly',
        businessName: settings?.businessName || 'KRYROS CHAT AGENT',
        businessDescription: settings?.businessDescription || '',
        productServiceInfo: settings?.productServiceInfo || '',
        autoReplyEnabled: settings?.autoReplyEnabled || true,
        humanTakeoverEnabled: true, // Always enabled
      },
    };
  }

  /**
   * Update AI settings
   */
  @Put('settings')
  @UseGuards(JwtAuthGuard)
  async updateAiSettings(
    @Body() body: {
      aiEnabled?: boolean;
      aiModel?: string;
      aiTone?: string;
      businessName?: string;
      businessDescription?: string;
      productServiceInfo?: string;
      autoReplyEnabled?: boolean;
    },
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;

    // Find existing settings or create new
    let settings = await this.prisma.settings.findFirst({
      where: { organizationId },
    });

    if (settings) {
      settings = await this.prisma.settings.update({
        where: { id: settings.id },
        data: {
          aiEnabled: body.aiEnabled ?? settings.aiEnabled,
          aiModel: body.aiModel ?? settings.aiModel,
          aiTone: body.aiTone ?? settings.aiTone,
          businessName: body.businessName ?? settings.businessName,
          businessDescription: body.businessDescription ?? settings.businessDescription,
          productServiceInfo: body.productServiceInfo ?? settings.productServiceInfo,
          autoReplyEnabled: body.autoReplyEnabled ?? settings.autoReplyEnabled,
        },
      });
    } else {
      settings = await this.prisma.settings.create({
        data: {
          organizationId,
          aiEnabled: body.aiEnabled ?? false,
          aiModel: body.aiModel ?? 'gpt-4',
          aiTone: body.aiTone ?? 'friendly',
          businessName: body.businessName ?? 'KRYROS CHAT AGENT',
          businessDescription: body.businessDescription ?? '',
          productServiceInfo: body.productServiceInfo ?? '',
          autoReplyEnabled: body.autoReplyEnabled ?? true,
        },
      });
    }

    return {
      success: true,
      data: settings,
    };
  }

  /**
   * Test AI response (preview)
   */
  @Post('test')
  @UseGuards(JwtAuthGuard)
  async testAiResponse(
    @Body() body: { message: string },
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;

    const businessContext = await this.aiService.getBusinessContext(organizationId);
    const language = this.detectLanguage(body.message);

    const result = await this.aiService.generateResponse(
      body.message,
      [],
      businessContext,
      language,
    );

    return {
      success: true,
      response: result.response,
      shouldHumanTakeover: result.shouldHumanTakeover,
    };
  }

  /**
   * Get conversation history for a contact
   */
  @Get('history/:contactId')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Param('contactId') contactId: string,
    @Query('limit') limit?: string,
  ) {
    const messages = await this.aiService.getConversationHistory(
      contactId,
      limit ? parseInt(limit) : 10,
    );

    return {
      success: true,
      data: messages,
    };
  }

  /**
   * Detect message language (simple implementation)
   */
  private detectLanguage(message: string): string {
    // Simple language detection based on common words
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
    
    // Default to English
    return 'en';
  }
}
