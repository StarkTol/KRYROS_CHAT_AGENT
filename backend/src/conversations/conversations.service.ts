import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async getConversations(
    organizationId: string,
    filters?: {
      status?: string;
      platform?: string;
      assignedTo?: string;
      search?: string;
    },
    page = 1,
    limit = 20,
  ) {
    const where: any = {
      organizationId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.platform) {
      where.platform = filters.platform;
    }

    if (filters?.assignedTo) {
      where.assignedToId = filters.assignedTo;
    }

    if (filters?.search) {
      const search = filters.search;
      where.OR = [
        {
          contact: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          contact: {
            platformId: { contains: search, mode: 'insensitive' },
          },
        },
        { lastMessage: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              platform: true,
              platformId: true,
              profilePicture: true,
              status: true,
            },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      this.prisma.conversation.count({ where }),
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

  async getConversation(conversationId: string, organizationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        organizationId,
      },
      include: {
        contact: true,
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        platformConnection: {
          select: {
            id: true,
            platform: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async assignConversation(
    conversationId: string,
    agentId: string,
    organizationId: string,
  ) {
    return this.prisma.conversation.update({
      where: {
        id: conversationId,
        organizationId,
      },
      data: {
        assignedToId: agentId,
        status: 'PENDING',
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async updateStatus(
    conversationId: string,
    status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED',
    organizationId: string,
  ) {
    return this.prisma.conversation.update({
      where: {
        id: conversationId,
        organizationId,
      },
      data: { status },
    });
  }

  async updatePriority(
    conversationId: string,
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
    organizationId: string,
  ) {
    return this.prisma.conversation.update({
      where: {
        id: conversationId,
        organizationId,
      },
      data: { priority },
    });
  }

  async markAsRead(conversationId: string, organizationId: string) {
    return this.prisma.conversation.update({
      where: {
        id: conversationId,
        organizationId,
      },
      data: { unreadCount: 0 },
    });
  }

  async getStats(organizationId: string) {
    const [
      totalConversations,
      openConversations,
      pendingConversations,
      unreadTotal,
      byPlatform,
    ] = await Promise.all([
      this.prisma.conversation.count({ where: { organizationId } }),
      this.prisma.conversation.count({
        where: { organizationId, status: 'OPEN' },
      }),
      this.prisma.conversation.count({
        where: { organizationId, status: 'PENDING' },
      }),
      this.prisma.conversation.aggregate({
        where: { organizationId },
        _sum: { unreadCount: true },
      }),
      this.prisma.conversation.groupBy({
        by: ['platform'],
        where: { organizationId },
        _count: true,
      }),
    ]);

    return {
      total: totalConversations,
      open: openConversations,
      pending: pendingConversations,
      unreadTotal: unreadTotal._sum.unreadCount || 0,
      byPlatform: byPlatform.reduce((acc, item) => {
        acc[item.platform] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
