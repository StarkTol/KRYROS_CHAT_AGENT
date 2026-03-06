import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // BUSINESS PROFILE
  // ============================================

  async getBusinessProfile(organizationId: string) {
    return this.prisma.businessProfile.findUnique({
      where: { organizationId },
    });
  }

  async updateBusinessProfile(
    organizationId: string,
    data: {
      businessName?: string;
      businessEmail?: string | null;
      businessPhone?: string | null;
      businessAddress?: string | null;
      website?: string | null;
      description?: string | null;
      timezone?: string;
      defaultAutoReply?: string | null;
    },
  ) {
    return this.prisma.businessProfile.upsert({
      where: { organizationId },
      create: {
        organizationId,
        businessName: data.businessName || '',
        businessEmail: data.businessEmail || null,
        businessPhone: data.businessPhone || null,
        businessAddress: data.businessAddress || null,
        website: data.website || null,
        description: data.description || null,
        timezone: data.timezone || 'UTC',
        defaultAutoReply: data.defaultAutoReply || null,
      },
      update: {
        businessName: data.businessName,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        businessAddress: data.businessAddress,
        website: data.website,
        description: data.description,
        timezone: data.timezone,
        defaultAutoReply: data.defaultAutoReply,
      },
    });
  }

  // ============================================
  // PLATFORM CONNECTIONS
  // ============================================

  async getPlatformConnections(organizationId: string) {
    return this.prisma.platformConnection.findMany({
      where: { organizationId },
      orderBy: { platform: 'asc' },
    });
  }

  async getPlatformConnection(platform: string, organizationId: string) {
    return this.prisma.platformConnection.findFirst({
      where: {
        organizationId,
        platform: platform as any,
      },
    });
  }

  async connectPlatform(
    organizationId: string,
    data: {
      platform: string;
      accessToken?: string;
      phoneNumberId?: string;
      instagramId?: string;
      facebookPageId?: string;
      webhookVerifyToken?: string;
    },
  ) {
    return this.prisma.platformConnection.upsert({
      where: {
        organizationId_platform: {
          organizationId,
          platform: data.platform as any,
        },
      },
      create: {
        organizationId,
        platform: data.platform as any,
        accessToken: data.accessToken,
        phoneNumberId: data.phoneNumberId,
        instagramId: data.instagramId,
        facebookPageId: data.facebookPageId,
        webhookVerifyToken: data.webhookVerifyToken,
        status: 'CONNECTED',
      },
      update: {
        accessToken: data.accessToken,
        phoneNumberId: data.phoneNumberId,
        instagramId: data.instagramId,
        facebookPageId: data.facebookPageId,
        webhookVerifyToken: data.webhookVerifyToken,
        status: 'CONNECTED',
      },
    });
  }

  async disconnectPlatform(platform: string, organizationId: string) {
    return this.prisma.platformConnection.update({
      where: {
        organizationId_platform: {
          organizationId,
          platform: platform as any,
        },
      },
      data: {
        status: 'DISCONNECTED',
        accessToken: null,
      },
    });
  }

  async testPlatformConnection(platform: string, organizationId: string) {
    // TODO: Implement actual connection test
    const connection = await this.prisma.platformConnection.findFirst({
      where: {
        organizationId,
        platform: platform as any,
      },
    });

    if (!connection) {
      return { success: false, error: 'Connection not found' };
    }

    // Simulate test
    return {
      success: true,
      message: `${platform} connection is active`,
      details: {
        connectedAt: connection.createdAt,
        lastSync: connection.lastSyncAt,
      },
    };
  }

  // ============================================
  // BUSINESS HOURS
  // ============================================

  async getBusinessHours(organizationId: string) {
    return this.prisma.businessHours.findMany({
      where: { organizationId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateBusinessHours(
    organizationId: string,
    hours: Array<{
      dayOfWeek: number;
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
      timezone?: string;
      autoReplyEnabled?: boolean;
      autoReplyContent?: string;
    }>,
  ) {
    // Upsert all days
    await Promise.all(
      hours.map((hour) =>
        this.prisma.businessHours.upsert({
          where: {
            organizationId_dayOfWeek: {
              organizationId,
              dayOfWeek: hour.dayOfWeek,
            },
          },
          create: {
            organizationId,
            dayOfWeek: hour.dayOfWeek,
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            timezone: hour.timezone || 'UTC',
            autoReplyEnabled: hour.autoReplyEnabled || false,
            autoReplyContent: hour.autoReplyContent,
          },
          update: {
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            timezone: hour.timezone,
            autoReplyEnabled: hour.autoReplyEnabled,
            autoReplyContent: hour.autoReplyContent,
          },
        }),
      ),
    );

    return this.getBusinessHours(organizationId);
  }

  // ============================================
  // ORGANIZATION SETTINGS
  // ============================================

  async getOrganization(organizationId: string) {
    return this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        businessProfile: true,
      },
    });
  }

  async updateOrganization(
    organizationId: string,
    data: {
      name?: string;
      logoUrl?: string;
      plan?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
    },
  ) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data,
    });
  }

  // ============================================
  // TEAM MEMBERS
  // ============================================

  async getTeamMembers(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  async inviteTeamMember(
    organizationId: string,
    data: {
      email: string;
      name: string;
      role: 'ADMIN' | 'AGENT';
    },
  ) {
    // TODO: Send invitation email
    // For now, create user with temporary password
    return this.prisma.user.create({
      data: {
        organizationId,
        email: data.email,
        name: data.name,
        role: data.role,
        password: 'temp_password_123', // User will need to reset
      },
    });
  }

  async updateTeamMember(
    userId: string,
    organizationId: string,
    data: {
      name?: string;
      role?: 'ADMIN' | 'AGENT';
      isActive?: boolean;
    },
  ) {
    return this.prisma.user.update({
      where: {
        id: userId,
        organizationId,
      },
      data,
    });
  }

  async removeTeamMember(userId: string, organizationId: string) {
    return this.prisma.user.delete({
      where: {
        id: userId,
        organizationId,
      },
    });
  }

  // ============================================
  // DASHBOARD STATS
  // ============================================

  async getDashboardStats(organizationId: string) {
    const [
      conversationsStats,
      contactsStats,
      messagesToday,
      pendingFollowUps,
    ] = await Promise.all([
      this.prisma.conversation.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.contact.count({
        where: { organizationId, isArchived: false },
      }),
      this.prisma.message.count({
        where: {
          organizationId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.followUp.count({
        where: {
          organizationId,
          status: 'PENDING',
        },
      }),
    ]);

    return {
      conversations: conversationsStats.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      totalContacts: contactsStats,
      messagesToday,
      pendingFollowUps,
    };
  }
}
