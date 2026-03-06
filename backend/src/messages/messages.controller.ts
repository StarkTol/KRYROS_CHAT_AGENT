import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.messagesService.getMessages(conversationId, page, limit);
  }

  @Post('send/:conversationId')
  @ApiOperation({ summary: 'Send a message to a conversation' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.messagesService.sendMessage(conversationId, content, req.user.id);
  }
}
