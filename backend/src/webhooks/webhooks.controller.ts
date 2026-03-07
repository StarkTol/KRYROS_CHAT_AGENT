import { Controller, Post, Body, Get, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  // ============================================
  // WHATSAPP WEBHOOKS
  // ============================================

  @Get('whatsapp/verify')
  @ApiExcludeEndpoint()
  async verifyWhatsApp(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.webhooksService.handleWhatsAppVerification({ hub: { mode, verify_token: token, challenge } });
  }

  @Get('whatsapp/:connectionId')
  @ApiExcludeEndpoint()
  async verifyWhatsAppForConnection(
    @Param('connectionId') connectionId: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.webhooksService.handleWhatsAppVerification(
      { hub: { mode, verify_token: token, challenge } },
      connectionId,
    );
  }

  @Post('whatsapp/:connectionId')
  @ApiExcludeEndpoint()
  async handleWhatsApp(
    @Param('connectionId') connectionId: string,
    @Body() payload: any,
  ) {
    return this.webhooksService.handleWhatsAppWebhook(payload, connectionId);
  }

  @Post('whatsapp/:connectionId/status')
  @ApiExcludeEndpoint()
  async handleWhatsAppStatus(
    @Param('connectionId') connectionId: string,
    @Body() payload: any,
  ) {
    return this.webhooksService.handleWhatsAppStatus(payload);
  }

  // ============================================
  // INSTAGRAM WEBHOOKS
  // ============================================

  @Get('instagram/verify')
  @ApiExcludeEndpoint()
  async verifyInstagram(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.webhooksService.handleInstagramVerification({ hub: { mode, verify_token: token, challenge } });
  }

  @Post('instagram/:connectionId')
  @ApiExcludeEndpoint()
  async handleInstagram(
    @Param('connectionId') connectionId: string,
    @Body() payload: any,
  ) {
    return this.webhooksService.handleInstagramWebhook(payload, connectionId);
  }

  // ============================================
  // FACEBOOK WEBHOOKS
  // ============================================

  @Get('facebook/verify')
  @ApiExcludeEndpoint()
  async verifyFacebook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.webhooksService.handleFacebookVerification({ hub: { mode, verify_token: token, challenge } });
  }

  @Post('facebook/:connectionId')
  @ApiExcludeEndpoint()
  async handleFacebook(
    @Param('connectionId') connectionId: string,
    @Body() payload: any,
  ) {
    return this.webhooksService.handleFacebookWebhook(payload, connectionId);
  }
}
