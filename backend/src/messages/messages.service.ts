import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformType, MessageDirection, MessageType, NormalizedMessage } from './interfaces/message.interface';

// ============================================
// MESSAGE ROUTER - Central message handler
// ============================================

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // MESSAGE RETRIEVAL
  // ============================================

  async getMessages(conversationId: string, page = 1, limit = 50) {
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sender: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // MESSAGE NORMALIZATION - Convert platform-specific to common format
  // ============================================

  normalizeWhatsAppMessage(payload: any): NormalizedMessage {
    const value = payload.entry?.[0]?.changes?.[0]?.value || {};
    const messages = value.messages?.[0];
    const contacts = value.contacts?.[0];

    if (!messages) {
      throw new Error('Invalid WhatsApp webhook payload');
    }

    return {
      platform: PlatformType.WHATSAPP,
      platformMessageId: messages.id,
      platformConversationId: messages.from,
      direction: messages.from === 'me' ? MessageDirection.OUTBOUND : MessageDirection.INBOUND,
      content: this.extractWhatsAppContent(messages),
      contentType: this.getWhatsAppContentType(messages),
      sender: {
        platformId: messages.from,
        name: contacts?.profile?.name,
      },
      metadata: {
        WhatsApp: {
          type: messages.type,
          timestamp: messages.timestamp,
          replyTo: messages.context?.id,
        },
      },
      timestamp: new Date(parseInt(messages.timestamp) * 1000),
    };
  }

  normalizeInstagramMessage(payload: any): NormalizedMessage {
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0]?.value || {};
    const messages = changes?.messages?.[0];
    const sender = changes?.sender_id || changes?.from?.id;
    const thread = changes?.thread?.id || changes?.metadata?.thread_id;

    if (!messages) {
      throw new Error('Invalid Instagram webhook payload');
    }

    return {
      platform: PlatformType.INSTAGRAM,
      platformMessageId: messages.id || `${sender}-${Date.now()}`,
      platformConversationId: thread || sender,
      direction: MessageDirection.INBOUND,
      content: this.extractInstagramContent(messages),
      contentType: this.getInstagramContentType(messages),
      sender: {
        platformId: String(sender),
        name: changes?.from?.name,
        profilePicture: changes?.from?.profile_picture,
      },
      metadata: {
        Instagram: {
          type: messages.type || 'message',
          timestamp: Date.now(),
          isStoryReply: changes?.story?.id,
        },
      },
      timestamp: new Date(),
    };
  }

  normalizeFacebookMessage(payload: any): NormalizedMessage {
    const entry = payload.entry?.[0];
    const messaging = entry?.messaging?.[0] || entry?.changes?.[0]?.value;
    const sender = messaging?.sender?.id || messaging?.from?.id;
    const recipient = messaging?.recipient?.id || messaging?.to?.id;
    const message = messaging?.message || messaging;

    if (!message) {
      throw new Error('Invalid Facebook webhook payload');
    }

    return {
      platform: PlatformType.FACEBOOK,
      platformMessageId: message.mid || `${sender}-${Date.now()}`,
      platformConversationId: sender,
      direction: MessageDirection.INBOUND,
      content: this.extractFacebookContent(message),
      contentType: this.getFacebookContentType(message),
      sender: {
        platformId: String(sender),
      },
      recipient: {
        platformId: String(recipient),
      },
      metadata: {
        Facebook: {
          type: message.type || 'message',
          timestamp: messaging.timestamp || Date.now(),
          replyTo: message.reply_to?.mid,
        },
      },
      timestamp: new Date(messaging.timestamp ? parseInt(messaging.timestamp) * 1000 : Date.now()),
    };
  }

  // ============================================
  // MESSAGE PROCESSING
  // ============================================

  async processIncomingMessage(normalized: NormalizedMessage, organizationId: string) {
    // Find or create contact
    const contact = await this.findOrCreateContact(normalized, organizationId);

    // Find or create conversation
    const conversation = await this.findOrCreateConversation(normalized, contact.id, organizationId);

    // Create message
    const message = await this.prisma.message.create({
      data: {
        organizationId,
        conversationId: conversation.id,
        platformMessageId: normalized.platformMessageId,
        content: normalized.content,
        contentType: normalized.contentType as any,
        direction: normalized.direction as any,
        senderId: normalized.direction === MessageDirection.OUTBOUND ? undefined : undefined,
        metadata: normalized.metadata as any,
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
      },
    });

    // Update contact
    await this.prisma.contact.update({
      where: { id: contact.id },
      data: { lastContactedAt: new Date() },
    });

    return { message, conversation, contact };
  }

  async sendMessage(
    conversationId: string,
    content: string,
    senderId: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: true, platformConnection: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Create outgoing message
    const message = await this.prisma.message.create({
      data: {
        organizationId: conversation.organizationId,
        conversationId,
        content,
        contentType: MessageType.TEXT,
        direction: MessageDirection.OUTBOUND,
        senderId,
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        status: 'CLOSED',
      },
    });

    return message;
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private async findOrCreateContact(normalized: NormalizedMessage, organizationId: string) {
    const existingContact = await this.prisma.contact.findFirst({
      where: {
        organizationId,
        platformId: normalized.sender.platformId,
        platform: normalized.platform,
      },
    });

    if (existingContact) {
      return existingContact;
    }

    return this.prisma.contact.create({
      data: {
        organizationId,
        platformId: normalized.sender.platformId,
        platform: normalized.platform,
        name: normalized.sender.name || `User ${normalized.sender.platformId.slice(-4)}`,
        profilePicture: normalized.sender.profilePicture,
        source: 'DIRECT',
        status: 'NEW',
      },
    });
  }

  private async findOrCreateConversation(
    normalized: NormalizedMessage,
    contactId: string,
    organizationId: string,
  ) {
    const platformConnection = await this.prisma.platformConnection.findFirst({
      where: {
        organizationId,
        platform: normalized.platform,
      },
    });

    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        organizationId,
        contactId,
        platform: normalized.platform,
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    return this.prisma.conversation.create({
      data: {
        organizationId,
        platform: normalized.platform,
        contactId,
        platformConnectionId: platformConnection?.id,
        status: 'OPEN',
        priority: 'NORMAL',
        lastMessageAt: new Date(),
      },
    });
  }

  private extractWhatsAppContent(message: any): string {
    switch (message.type) {
      case 'text':
        return message.text?.body || '';
      case 'image':
        return message.image?.caption || '[Image]';
      case 'video':
        return '[Video]';
      case 'document':
        return `[Document: ${message.document?.filename || 'file'}]`;
      case 'audio':
        return '[Audio]';
      case 'location':
        return `[Location: ${message.location?.latitude}, ${message.location?.longitude}]`;
      default:
        return `[${message.type}]`;
    }
  }

  private getWhatsAppContentType(message: any): MessageType {
    const typeMap: Record<string, MessageType> = {
      text: MessageType.TEXT,
      image: MessageType.IMAGE,
      video: MessageType.VIDEO,
      document: MessageType.DOCUMENT,
      audio: MessageType.AUDIO,
      location: MessageType.LOCATION,
    };
    return typeMap[message.type] || MessageType.TEXT;
  }

  private extractInstagramContent(message: any): string {
    switch (message.type) {
      case 'text':
        return message.text || '';
      case 'photo':
        return message.photo?.caption || '[Photo]';
      case 'video':
        return '[Video]';
      case 'story_mention':
        return `[Story mention from @${message.story?.username}]`;
      default:
        return message.text || `[${message.type}]`;
    }
  }

  private getInstagramContentType(message: any): MessageType {
    const typeMap: Record<string, MessageType> = {
      text: MessageType.TEXT,
      photo: MessageType.IMAGE,
      video: MessageType.VIDEO,
      story_mention: MessageType.TEXT,
    };
    return typeMap[message.type] || MessageType.TEXT;
  }

  private extractFacebookContent(message: any): string {
    switch (message.type) {
      case 'text':
        return message.text || '';
      case 'photo':
        return message.attachments?.data?.[0]?.photo?.name || '[Photo]';
      case 'video':
        return '[Video]';
      case 'audio':
        return '[Audio]';
      case 'file':
        return `[File: ${message.attachments?.data?.[0]?.file?.name || 'file'}]`;
      case 'location':
        return '[Location]';
      case 'fallback':
        return message.attachments?.data?.[0]?.description || '[Attachment]';
      default:
        return message.text || `[${message.type}]`;
    }
  }

  private getFacebookContentType(message: any): MessageType {
    const typeMap: Record<string, MessageType> = {
      text: MessageType.TEXT,
      photo: MessageType.IMAGE,
      video: MessageType.VIDEO,
      audio: MessageType.AUDIO,
      file: MessageType.DOCUMENT,
      location: MessageType.LOCATION,
      fallback: MessageType.DOCUMENT,
    };
    return typeMap[message.type] || MessageType.TEXT;
  }
}
