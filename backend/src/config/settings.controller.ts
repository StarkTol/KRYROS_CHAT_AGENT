import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  // Dashboard
  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  async getDashboard(@Request() req: any) {
    return this.settingsService.getDashboardStats(req.user.organizationId);
  }

  // Business Profile
  @Get('business')
  @ApiOperation({ summary: 'Get business profile' })
  @ApiResponse({ status: 200, description: 'Business profile retrieved' })
  async getBusinessProfile(@Request() req: any) {
    return this.settingsService.getBusinessProfile(req.user.organizationId);
  }

  @Patch('business')
  @ApiOperation({ summary: 'Update business profile' })
  @ApiResponse({ status: 200, description: 'Business profile updated' })
  async updateBusinessProfile(
    @Request() req: any,
    @Body() body: {
      businessName?: string;
      businessEmail?: string;
      businessPhone?: string;
      businessAddress?: string;
      website?: string;
      description?: string;
      timezone?: string;
      defaultAutoReply?: string;
    },
  ) {
    return this.settingsService.updateBusinessProfile(req.user.organizationId, body);
  }

  // Platform Connections
  @Get('platforms')
  @ApiOperation({ summary: 'Get all platform connections' })
  @ApiResponse({ status: 200, description: 'Platform connections retrieved' })
  async getPlatformConnections(@Request() req: any) {
    return this.settingsService.getPlatformConnections(req.user.organizationId);
  }

  @Post('platforms/:platform/connect')
  @ApiOperation({ summary: 'Connect a platform' })
  @ApiResponse({ status: 201, description: 'Platform connected' })
  async connectPlatform(
    @Param('platform') platform: string,
    @Request() req: any,
    @Body() body: {
      accessToken?: string;
      phoneNumberId?: string;
      instagramId?: string;
      facebookPageId?: string;
    },
  ) {
    return this.settingsService.connectPlatform(req.user.organizationId, {
      platform,
      ...body,
    });
  }

  @Post('platforms/:platform/disconnect')
  @ApiOperation({ summary: 'Disconnect a platform' })
  @ApiResponse({ status: 200, description: 'Platform disconnected' })
  async disconnectPlatform(@Param('platform') platform: string, @Request() req: any) {
    return this.settingsService.disconnectPlatform(platform, req.user.organizationId);
  }

  @Post('platforms/:platform/test')
  @ApiOperation({ summary: 'Test platform connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testPlatformConnection(@Param('platform') platform: string, @Request() req: any) {
    return this.settingsService.testPlatformConnection(platform, req.user.organizationId);
  }

  // Business Hours
  @Get('business-hours')
  @ApiOperation({ summary: 'Get business hours' })
  @ApiResponse({ status: 200, description: 'Business hours retrieved' })
  async getBusinessHours(@Request() req: any) {
    return this.settingsService.getBusinessHours(req.user.organizationId);
  }

  @Patch('business-hours')
  @ApiOperation({ summary: 'Update business hours' })
  @ApiResponse({ status: 200, description: 'Business hours updated' })
  async updateBusinessHours(
    @Request() req: any,
    @Body() body: Array<{
      dayOfWeek: number;
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
      timezone?: string;
      autoReplyEnabled?: boolean;
      autoReplyContent?: string;
    }>,
  ) {
    return this.settingsService.updateBusinessHours(req.user.organizationId, body);
  }

  // Organization
  @Get('organization')
  @ApiOperation({ summary: 'Get organization details' })
  @ApiResponse({ status: 200, description: 'Organization retrieved' })
  async getOrganization(@Request() req: any) {
    return this.settingsService.getOrganization(req.user.organizationId);
  }

  @Patch('organization')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  async updateOrganization(
    @Request() req: any,
    @Body() body: {
      name?: string;
      logoUrl?: string;
    },
  ) {
    return this.settingsService.updateOrganization(req.user.organizationId, body);
  }

  // Team Members
  @Get('team')
  @ApiOperation({ summary: 'Get team members' })
  @ApiResponse({ status: 200, description: 'Team members retrieved' })
  async getTeamMembers(@Request() req: any) {
    return this.settingsService.getTeamMembers(req.user.organizationId);
  }

  @Post('team/invite')
  @ApiOperation({ summary: 'Invite team member' })
  @ApiResponse({ status: 201, description: 'Invitation sent' })
  async inviteTeamMember(
    @Request() req: any,
    @Body() body: {
      email: string;
      name: string;
      role: 'ADMIN' | 'AGENT';
    },
  ) {
    return this.settingsService.inviteTeamMember(req.user.organizationId, body);
  }

  @Patch('team/:userId')
  @ApiOperation({ summary: 'Update team member' })
  @ApiResponse({ status: 200, description: 'Team member updated' })
  async updateTeamMember(
    @Param('userId') userId: string,
    @Request() req: any,
    @Body() body: {
      name?: string;
      role?: 'ADMIN' | 'AGENT';
      isActive?: boolean;
    },
  ) {
    return this.settingsService.updateTeamMember(userId, req.user.organizationId, body);
  }

  @Delete('team/:userId')
  @ApiOperation({ summary: 'Remove team member' })
  @ApiResponse({ status: 200, description: 'Team member removed' })
  async removeTeamMember(@Param('userId') userId: string, @Request() req: any) {
    return this.settingsService.removeTeamMember(userId, req.user.organizationId);
  }
}
