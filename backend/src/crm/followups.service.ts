import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowUpsService {
  constructor(private prisma: PrismaService) {}

  async createFollowUp(
    organizationId: string,
    data: {
      contactId: string;
      type: 'MANUAL' | 'SCHEDULED' | 'REMINDER';
      scheduledAt: Date;
      message?: string;
      remindAgent?: boolean;
    },
  ) {
    return this.prisma.followUp.create({
      data: {
        organizationId,
        contactId: data.contactId,
        type: data.type as any,
        scheduledAt: data.scheduledAt,
        message: data.message,
        remindAgent: data.remindAgent ?? true,
      },
    });
  }

  async getFollowUps(
    organizationId: string,
    filters?: {
      status?: string;
      type?: string;
      contactId?: string;
    },
  ) {
    return this.prisma.followUp.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status as any }),
        ...(filters?.type && { type: filters.type as any }),
        ...(filters?.contactId && { contactId: filters.contactId }),
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            platform: true,
            platformId: true,
          },
        },
      },
    });
  }

  async completeFollowUp(followUpId: string, organizationId: string) {
    return this.prisma.followUp.update({
      where: {
        id: followUpId,
        organizationId,
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  async cancelFollowUp(followUpId: string, organizationId: string) {
    return this.prisma.followUp.update({
      where: {
        id: followUpId,
        organizationId,
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processDueFollowUps() {
    const now = new Date();

    // Find all pending follow-ups that are due
    const dueFollowUps = await this.prisma.followUp.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: now },
      },
      include: {
        contact: true,
      },
    });

    for (const followUp of dueFollowUps) {
      // TODO: Send notification to agent
      // TODO: Create follow-up message if it's a scheduled follow-up

      await this.prisma.followUp.update({
        where: { id: followUp.id },
        data: {
          status: 'SENT',
          reminderSentAt: new Date(),
        },
      });
    }
  }

  async getUpcomingFollowUps(organizationId: string, days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.followUp.findMany({
      where: {
        organizationId,
        status: 'PENDING',
        scheduledAt: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            platform: true,
            platformId: true,
          },
        },
      },
    });
  }
}
