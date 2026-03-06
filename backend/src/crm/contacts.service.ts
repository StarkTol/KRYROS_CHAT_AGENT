import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async getContacts(
    organizationId: string,
    filters?: {
      status?: string;
      platform?: string;
      search?: string;
      tags?: string[];
    },
    page = 1,
    limit = 20,
  ) {
    const where: any = {
      organizationId,
      isArchived: false,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.platform) {
      where.platform = filters.platform;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { platformId: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy: { lastContactedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { conversations: true },
          },
          conversations: {
            select: {
              id: true,
              platform: true,
              lastMessageAt: true,
              status: true,
            },
            orderBy: { lastMessageAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getContact(contactId: string, organizationId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: {
        id: contactId,
        organizationId,
      },
      include: {
        conversations: {
          orderBy: { lastMessageAt: 'desc' },
          take: 10,
          include: {
            assignedTo: {
              select: { id: true, name: true },
            },
            _count: {
              select: { messages: true },
            },
          },
        },
        followUps: {
          where: { status: 'PENDING' },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async createContact(
    organizationId: string,
    data: {
      name: string;
      platform: string;
      platformId: string;
      notes?: string;
      status?: string;
      tags?: string[];
    },
  ) {
    return this.prisma.contact.create({
      data: {
        organizationId,
        name: data.name,
        platform: data.platform as any,
        platformId: data.platformId,
        notes: data.notes,
        status: (data.status as any) || 'NEW',
        tags: data.tags || [],
      },
    });
  }

  async updateContact(
    contactId: string,
    organizationId: string,
    data: {
      name?: string;
      notes?: string;
      status?: string;
      tags?: string[];
    },
  ) {
    return this.prisma.contact.update({
      where: {
        id: contactId,
        organizationId,
      },
      data: {
        name: data.name,
        notes: data.notes,
        status: data.status as any,
        tags: data.tags,
      },
    });
  }

  async updateStatus(
    contactId: string,
    organizationId: string,
    status: 'NEW' | 'LEAD' | 'QUALIFIED' | 'CUSTOMER' | 'CHURNED' | 'BLOCKED',
  ) {
    return this.prisma.contact.update({
      where: {
        id: contactId,
        organizationId,
      },
      data: { status },
    });
  }

  async archiveContact(contactId: string, organizationId: string) {
    return this.prisma.contact.update({
      where: {
        id: contactId,
        organizationId,
      },
      data: { isArchived: true },
    });
  }

  async blockContact(contactId: string, organizationId: string) {
    return this.prisma.contact.update({
      where: {
        id: contactId,
        organizationId,
      },
      data: {
        isBlocked: true,
        status: 'BLOCKED',
      },
    });
  }

  async getContactStats(organizationId: string) {
    const [
      totalContacts,
      byStatus,
      byPlatform,
      newlyAdded,
    ] = await Promise.all([
      this.prisma.contact.count({
        where: { organizationId, isArchived: false },
      }),
      this.prisma.contact.groupBy({
        by: ['status'],
        where: { organizationId, isArchived: false },
        _count: true,
      }),
      this.prisma.contact.groupBy({
        by: ['platform'],
        where: { organizationId, isArchived: false },
        _count: true,
      }),
      this.prisma.contact.count({
        where: {
          organizationId,
          isArchived: false,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      total: totalContacts,
      newThisWeek: newlyAdded,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byPlatform: byPlatform.reduce((acc, item) => {
        acc[item.platform] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
