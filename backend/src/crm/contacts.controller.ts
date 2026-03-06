import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Contacts retrieved successfully' })
  async getContacts(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('platform') platform?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.contactsService.getContacts(
      req.user.organizationId,
      { status, platform, search },
      page,
      limit,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get contact statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req: any) {
    return this.contactsService.getContactStats(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific contact' })
  @ApiResponse({ status: 200, description: 'Contact retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async getContact(@Param('id') id: string, @Request() req: any) {
    return this.contactsService.getContact(id, req.user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  async createContact(
    @Request() req: any,
    @Body() body: {
      name: string;
      platform: string;
      platformId: string;
      notes?: string;
      status?: string;
      tags?: string[];
    },
  ) {
    return this.contactsService.createContact(req.user.organizationId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  async updateContact(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: {
      name?: string;
      notes?: string;
      status?: string;
      tags?: string[];
    },
  ) {
    return this.contactsService.updateContact(id, req.user.organizationId, body);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update contact status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'NEW' | 'LEAD' | 'QUALIFIED' | 'CUSTOMER' | 'CHURNED' | 'BLOCKED',
    @Request() req: any,
  ) {
    return this.contactsService.updateStatus(id, req.user.organizationId, status);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a contact' })
  @ApiResponse({ status: 200, description: 'Contact archived successfully' })
  async archiveContact(@Param('id') id: string, @Request() req: any) {
    return this.contactsService.archiveContact(id, req.user.organizationId);
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Block a contact' })
  @ApiResponse({ status: 200, description: 'Contact blocked successfully' })
  async blockContact(@Param('id') id: string, @Request() req: any) {
    return this.contactsService.blockContact(id, req.user.organizationId);
  }
}
