import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhatsAppGatewayService } from './whatsapp-gateway.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('whatsapp')
export class WhatsAppGatewayController {
  constructor(
    private whatsappGateway: WhatsAppGatewayService,
    private prisma: PrismaService,
  ) {}

  /**
   * Connect to WhatsApp - generates QR code
   */
  @Post('connect')
  @UseGuards(JwtAuthGuard)
  async connect() {
    try {
      const result = await this.whatsappGateway.connect();
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Get QR code for WhatsApp connection
   */
  @Get('qr')
  @UseGuards(JwtAuthGuard)
  async getQRCode(@Res() res: Response) {
    const qrCode = this.whatsappGateway.getQRCode();
    
    if (!qrCode) {
      return res.status(404).json({ 
        success: false, 
        message: 'No QR code available. Call /connect first.' 
      });
    }

    // Return as data URL for display
    return res.json({
      success: true,
      qrCode: `data:image/png;base64,${qrCode}`,
    });
  }

  /**
   * Get connection status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus() {
    const status = this.whatsappGateway.getStatus();
    return {
      success: true,
      ...status,
    };
  }

  /**
   * Disconnect from WhatsApp
   */
  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnect() {
    await this.whatsappGateway.disconnect();
    return { success: true };
  }

  /**
   * Send a message via WhatsApp
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Body() body: { phoneNumber: string; message: string },
  ) {
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return { success: false, error: 'Phone number and message are required' };
    }

    const result = await this.whatsappGateway.sendMessage(phoneNumber, message);
    return result;
  }

  /**
   * Get conversations for the organization
   */
  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(@Request() req: any) {
    const organizationId = req.user.organizationId;

    // Get unique contacts with WhatsApp conversations
    const contacts = await this.prisma.contact.findMany({
      where: {
        organizationId,
        platform: 'WHATSAPP',
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastInteractionAt: 'desc' },
    });

    const conversations = contacts.map(contact => ({
      id: contact.id,
      phoneNumber: contact.platformId,
      name: contact.name,
      lastMessage: contact.messages[0]?.content || '',
      lastMessageAt: contact.lastInteractionAt,
      unreadCount: contact.messages.filter(m => m.direction === 'INBOUND' && m.status !== 'READ').length,
    }));

    return { success: true, data: conversations };
  }

  /**
   * Get messages for a specific conversation
   */
  @Get('messages/:phoneNumber')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('phoneNumber') phoneNumber: string,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;

    const contact = await this.prisma.contact.findFirst({
      where: {
        organizationId,
        platformId: phoneNumber,
        platform: 'WHATSAPP',
      },
    });

    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }

    const messages = await this.prisma.message.findMany({
      where: {
        contactId: contact.id,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await this.prisma.message.updateMany({
      where: {
        contactId: contact.id,
        direction: 'INBOUND',
        status: { not: 'READ' },
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    return { 
      success: true, 
      data: {
        contact: {
          id: contact.id,
          phoneNumber: contact.platformId,
          name: contact.name,
        },
        messages: messages.map(m => ({
          id: m.id,
          content: m.content,
          direction: m.direction,
          status: m.status,
          createdAt: m.createdAt,
        })),
      }
    };
  }

  /**
   * Mark messages as read
   */
  @Post('messages/:phoneNumber/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Param('phoneNumber') phoneNumber: string,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId;

    const contact = await this.prisma.contact.findFirst({
      where: {
        organizationId,
        platformId: phoneNumber,
        platform: 'WHATSAPP',
      },
    });

    if (!contact) {
      return { success: false };
    }

    await this.prisma.message.updateMany({
      where: {
        contactId: contact.id,
        direction: 'INBOUND',
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    return { success: true };
  }
}
