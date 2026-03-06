import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

export interface AutomationCondition {
  type: 'KEYWORD' | 'BUSINESS_HOURS' | 'FIRST_MESSAGE' | 'CONTACT_STATUS';
  operator?: 'EQUALS' | 'CONTAINS' | 'NOT_CONTAINS';
  value?: string;
}

@Injectable()
export class AutomationService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // AUTOMATION MANAGEMENT
  // ============================================

  async getAutomations(organizationId: string) {
    return this.prisma.automation.findMany({
      where: { organizationId },
      orderBy: { priority: 'desc' },
      include: {
        _count: {
          select: { logs: true },
        },
      },
    });
  }

  async getAutomation(automationId: string, organizationId: string) {
    return this.prisma.automation.findFirst({
      where: {
        id: automationId,
        organizationId,
      },
    });
  }

  async createAutomation(
    organizationId: string,
    data: {
      name: string;
      description?: string;
      trigger: string;
      conditions?: AutomationCondition[];
      action: string;
      replyContent?: string;
      delayMinutes?: number;
      isActive?: boolean;
      priority?: number;
      maxPerDay?: number;
      maxPerContact?: number;
    },
  ) {
    return this.prisma.automation.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        trigger: data.trigger as any,
        conditions: data.conditions as any,
        action: data.action as any,
        replyContent: data.replyContent,
        delayMinutes: data.delayMinutes || 0,
        isActive: data.isActive ?? true,
        priority: data.priority || 0,
        maxPerDay: data.maxPerDay,
        maxPerContact: data.maxPerContact,
      },
    });
  }

  async updateAutomation(
    automationId: string,
    organizationId: string,
    data: Partial<{
      name: string;
      description: string;
      trigger: string;
      conditions: AutomationCondition[];
      action: string;
      replyContent: string;
      delayMinutes: number;
      isActive: boolean;
      priority: number;
      maxPerDay: number;
      maxPerContact: number;
    }>,
  ) {
    return this.prisma.automation.update({
      where: {
        id: automationId,
        organizationId,
      },
      data: {
        name: data.name,
        description: data.description,
        trigger: data.trigger as any,
        conditions: data.conditions as any,
        action: data.action as any,
        replyContent: data.replyContent,
        delayMinutes: data.delayMinutes,
        isActive: data.isActive,
        priority: data.priority,
        maxPerDay: data.maxPerDay,
        maxPerContact: data.maxPerContact,
      },
    });
  }

  async deleteAutomation(automationId: string, organizationId: string) {
    return this.prisma.automation.delete({
      where: {
        id: automationId,
        organizationId,
      },
    });
  }

  async toggleAutomation(automationId: string, organizationId: string) {
    const automation = await this.prisma.automation.findFirst({
      where: {
        id: automationId,
        organizationId,
      },
    });

    return this.prisma.automation.update({
      where: {
        id: automationId,
        organizationId,
      },
      data: {
        isActive: !automation?.isActive,
      },
    });
  }

  // ============================================
  // AUTOMATION ENGINE - Process triggers
  // ============================================

  async processAutomation(
    trigger: string,
    context: {
      organizationId: string;
      contactId: string;
      conversationId: string;
      messageContent?: string;
      currentHour?: number;
      currentDayOfWeek?: number;
    },
  ) {
    // Get all active automations for this trigger
    const automations = await this.prisma.automation.findMany({
      where: {
        organizationId: context.organizationId,
        trigger: trigger as any,
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    });

    const results = [];

    for (const automation of automations) {
      try {
        // Check conditions
        const conditionsMet = this.checkConditions(
          automation.conditions as any,
          context,
        );

        if (conditionsMet) {
          // Check anti-spam limits
          const canExecute = await this.checkSpamLimits(
            automation.id,
            context.contactId,
          );

          if (canExecute) {
            // Execute automation
            const result = await this.executeAutomation(
              automation,
              context,
            );
            results.push(result);

            // Log execution
            await this.logAutomation(automation.id, context, result);
          }
        }
      } catch (error) {
        console.error(`Automation ${automation.id} failed:`, error);
      }
    }

    return results;
  }

  private checkConditions(
    conditions: AutomationCondition[] | null,
    context: any,
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    for (const condition of conditions) {
      switch (condition.type) {
        case 'KEYWORD':
          if (
            context.messageContent &&
            condition.operator === 'CONTAINS'
          ) {
            if (
              !context.messageContent
                .toLowerCase()
                .includes(condition.value?.toLowerCase() || '')
            ) {
              return false;
            }
          }
          break;

        case 'BUSINESS_HOURS':
          // This would check against business hours
          break;

        case 'FIRST_MESSAGE':
          // This would check if it's the first message
          break;

        case 'CONTACT_STATUS':
          // This would check contact status
          break;
      }
    }

    return true;
  }

  private async checkSpamLimits(
    automationId: string,
    contactId: string,
  ): Promise<boolean> {
    const automation = await this.prisma.automation.findUnique({
      where: { id: automationId },
    });

    if (!automation) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check daily limit
    if (automation.maxPerDay) {
      const dailyCount = await this.prisma.automationLog.count({
        where: {
          automationId,
          executedAt: { gte: today },
        },
      });

      if (dailyCount >= automation.maxPerDay) {
        return false;
      }
    }

    // Check per-contact limit
    if (automation.maxPerContact) {
      const contactCount = await this.prisma.automationLog.count({
        where: {
          automationId,
          contactId,
        },
      });

      if (contactCount >= automation.maxPerContact) {
        return false;
      }
    }

    return true;
  }

  private async executeAutomation(
    automation: any,
    context: any,
  ): Promise<any> {
    switch (automation.action) {
      case 'SEND_REPLY':
        // TODO: Send reply via message service
        return {
          action: 'SEND_REPLY',
          content: automation.replyContent,
          status: 'sent',
        };

      case 'ADD_TAG':
        await this.prisma.contact.update({
          where: { id: context.contactId },
          data: {
            tags: {
              push: automation.actionData?.tag,
            },
          },
        });
        return { action: 'ADD_TAG', tag: automation.actionData?.tag };

      case 'CHANGE_STATUS':
        await this.prisma.contact.update({
          where: { id: context.contactId },
          data: {
            status: automation.actionData?.status as any,
          },
        });
        return {
          action: 'CHANGE_STATUS',
          status: automation.actionData?.status,
        };

      case 'CREATE_FOLLOWUP':
        const followUp = await this.prisma.followUp.create({
          data: {
            organizationId: context.organizationId,
            contactId: context.contactId,
            type: 'SCHEDULED',
            scheduledAt: new Date(
              Date.now() + (automation.actionData?.delayDays || 1) * 24 * 60 * 60 * 1000,
            ),
            message: automation.actionData?.message,
          },
        });
        return { action: 'CREATE_FOLLOWUP', followUpId: followUp.id };

      default:
        return { action: automation.action, status: 'executed' };
    }
  }

  private async logAutomation(
    automationId: string,
    context: any,
    result: any,
  ) {
    await this.prisma.automationLog.create({
      data: {
        organizationId: context.organizationId,
        automationId,
        contactId: context.contactId,
        conversationId: context.conversationId,
        trigger: context.trigger,
        action: result.action,
        result: result as any,
      },
    });
  }

  // ============================================
  // BUSINESS HOURS CHECK
  // ============================================

  async isBusinessHours(
    organizationId: string,
    date: Date = new Date(),
  ): Promise<boolean> {
    const dayOfWeek = date.getDay();
    const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    const businessHours = await this.prisma.businessHours.findFirst({
      where: {
        organizationId,
        dayOfWeek,
      },
    });

    if (!businessHours || !businessHours.isOpen) {
      return false;
    }

    return (
      currentTime >= (businessHours.openTime || '00:00') &&
      currentTime <= (businessHours.closeTime || '23:59')
    );
  }

  // ============================================
  // DAILY DIGEST - Run daily at midnight
  // ============================================

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processDailyDigest() {
    // This would process daily digest for all organizations
    console.log('Processing daily digest automations...');
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getAutomationStats(organizationId: string) {
    const [totalAutomations, activeAutomations, totalExecutions, recentLogs] =
      await Promise.all([
        this.prisma.automation.count({ where: { organizationId } }),
        this.prisma.automation.count({
          where: { organizationId, isActive: true },
        }),
        this.prisma.automationLog.count({
          where: { organizationId },
        }),
        this.prisma.automationLog.findMany({
          where: { organizationId },
          orderBy: { executedAt: 'desc' },
          take: 10,
          include: {
            automation: {
              select: { name: true },
            },
          },
        }),
      ]);

    return {
      total: totalAutomations,
      active: activeAutomations,
      totalExecutions,
      recentLogs,
    };
  }
}
