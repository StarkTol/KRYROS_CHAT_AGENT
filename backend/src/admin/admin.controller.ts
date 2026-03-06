import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  
  @Get('organizations')
  async getOrganizations(@Request() req: any) {
    // In production, check if user is super admin
    // For now, return mock data for demonstration
    
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Demo Business',
          slug: 'demo-business',
          plan: 'FREE',
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          userCount: 1,
          contactCount: 0,
          totalMessages: 0,
        },
      ],
    };
  }

  @Patch('organizations/:id/plan')
  async updateOrganizationPlan(
    @Param('id') id: string,
    @Body('plan') plan: string,
  ) {
    // In production:
    // 1. Check if user is super admin
    // 2. Find organization by ID
    // 3. Update plan in database
    // 4. Update subscription in payment provider (Stripe, etc.)
    
    return {
      success: true,
      message: `Organization ${id} plan updated to ${plan}`,
      data: {
        id,
        plan,
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  @Delete('organizations/:id')
  async deleteOrganization(@Param('id') id: string) {
    // In production:
    // 1. Check if user is super admin
    // 2. Delete all organization data (cascade)
    // 3. Cancel subscription in payment provider
    
    return {
      success: true,
      message: `Organization ${id} deleted successfully`,
    };
  }

  @Get('stats')
  async getStats() {
    // Return platform-wide statistics
    return {
      success: true,
      data: {
        totalOrganizations: 1,
        activeSubscriptions: 0,
        totalMessages: 0,
        totalContacts: 0,
        revenue: {
          monthly: 0,
          yearly: 0,
        },
      },
    };
  }
}
