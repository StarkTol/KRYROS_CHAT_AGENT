import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationService, AutomationCondition } from './automation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Automation')
@Controller('automation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AutomationController {
  constructor(private automationService: AutomationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all automations' })
  @ApiResponse({ status: 200, description: 'Automations retrieved successfully' })
  async getAutomations(@Request() req: any) {
    return this.automationService.getAutomations(req.user.organizationId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get automation statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req: any) {
    return this.automationService.getAutomationStats(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific automation' })
  @ApiResponse({ status: 200, description: 'Automation retrieved successfully' })
  async getAutomation(@Param('id') id: string, @Request() req: any) {
    return this.automationService.getAutomation(id, req.user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new automation' })
  @ApiResponse({ status: 201, description: 'Automation created successfully' })
  async createAutomation(
    @Request() req: any,
    @Body() body: {
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
    return this.automationService.createAutomation(req.user.organizationId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an automation' })
  @ApiResponse({ status: 200, description: 'Automation updated successfully' })
  async updateAutomation(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: Partial<{
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
    return this.automationService.updateAutomation(id, req.user.organizationId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an automation' })
  @ApiResponse({ status: 200, description: 'Automation deleted successfully' })
  async deleteAutomation(@Param('id') id: string, @Request() req: any) {
    return this.automationService.deleteAutomation(id, req.user.organizationId);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle automation active status' })
  @ApiResponse({ status: 200, description: 'Automation toggled successfully' })
  async toggleAutomation(@Param('id') id: string, @Request() req: any) {
    return this.automationService.toggleAutomation(id, req.user.organizationId);
  }
}
