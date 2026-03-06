import { Controller, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all conversations for the organization' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getConversations(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('platform') platform?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.conversationsService.getConversations(
      req.user.organizationId,
      { status, platform, assignedTo, search },
      page,
      limit,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get conversation statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req: any) {
    return this.conversationsService.getStats(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific conversation' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(@Param('id') id: string, @Request() req: any) {
    return this.conversationsService.getConversation(id, req.user.organizationId);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign conversation to an agent' })
  @ApiResponse({ status: 200, description: 'Conversation assigned successfully' })
  async assignConversation(
    @Param('id') id: string,
    @Body('agentId') agentId: string,
    @Request() req: any,
  ) {
    return this.conversationsService.assignConversation(
      id,
      agentId,
      req.user.organizationId,
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update conversation status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED',
    @Request() req: any,
  ) {
    return this.conversationsService.updateStatus(
      id,
      status,
      req.user.organizationId,
    );
  }

  @Patch(':id/priority')
  @ApiOperation({ summary: 'Update conversation priority' })
  @ApiResponse({ status: 200, description: 'Priority updated successfully' })
  async updatePriority(
    @Param('id') id: string,
    @Body('priority') priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
    @Request() req: any,
  ) {
    return this.conversationsService.updatePriority(
      id,
      priority,
      req.user.organizationId,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  @ApiResponse({ status: 200, description: 'Marked as read successfully' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.conversationsService.markAsRead(id, req.user.organizationId);
  }
}
