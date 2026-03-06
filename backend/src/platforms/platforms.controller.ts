import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Platforms')
@Controller('platforms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlatformsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all platform connections' })
  @ApiResponse({ status: 200, description: 'List of platform connections' })
  async getPlatforms(@Request() req: any) {
    const organizationId = req.user.organizationId;
    
    const platforms = await this.prisma.platformConnection.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      success: true,
      data: platforms,
    };
  }

  @Get(':platform/connect')
  @ApiOperation({ summary: 'Get platform connection info' })
  async getConnectInfo(@Param('platform') platform: string) {
    return {
      success: true,
      data: {
        platform: platform.toUpperCase(),
        instructions: this.getConnectionInstructions(platform),
      },
    };
  }

  @Post(':platform/connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connect a platform' })
  @ApiResponse({ status: 200, description: 'Platform connected successfully' })
  async connectPlatform(
    @Request() req: any,
    @Param('platform') platform: string,
    @Body() body: { accessToken?: string; phoneNumberId?: string; instagramId?: string; facebookPageId?: string },
  ) {
    const organizationId = req.user.organizationId;
    const platformType = platform.toUpperCase() as 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK';

    // Check if already connected
    const existing = await this.prisma.platformConnection.findUnique({
      where: {
        organizationId_platform: {
          organizationId,
          platform: platformType,
        },
      },
    });

    if (existing) {
      // Update existing connection
      const updated = await this.prisma.platformConnection.update({
        where: { id: existing.id },
        data: {
          status: 'CONNECTED',
          accessToken: body.accessToken,
          phoneNumberId: body.phoneNumberId,
          instagramId: body.instagramId,
          facebookPageId: body.facebookPageId,
        },
      });

      return {
        success: true,
        data: updated,
        message: `${platformType} updated successfully`,
      };
    }

    // Create new connection
    const connection = await this.prisma.platformConnection.create({
      data: {
        organizationId,
        platform: platformType,
        status: 'CONNECTED',
        accessToken: body.accessToken,
        phoneNumberId: body.phoneNumberId,
        instagramId: body.instagramId,
        facebookPageId: body.facebookPageId,
      },
    });

    return {
      success: true,
      data: connection,
      message: `${platformType} connected successfully`,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect a platform' })
  @ApiResponse({ status: 200, description: 'Platform disconnected successfully' })
  async disconnectPlatform(@Param('id') id: string, @Request() req: any) {
    const organizationId = req.user.organizationId;

    // Verify ownership
    const connection = await this.prisma.platformConnection.findFirst({
      where: { id, organizationId },
    });

    if (!connection) {
      return {
        success: false,
        message: 'Platform connection not found',
      };
    }

    await this.prisma.platformConnection.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Platform disconnected successfully',
    };
  }

  private getConnectionInstructions(platform: string): any {
    const instructions: any = {
      whatsapp: {
        steps: [
          'Go to Facebook Developers Portal',
          'Create a WhatsApp Business Account',
          'Get your Access Token and Phone Number ID',
          'Paste them in the connection form',
        ],
        url: 'https://developers.facebook.com/docs/whatsapp',
      },
      instagram: {
        steps: [
          'Convert your Instagram account to a Business Account',
          'Connect to a Facebook Page',
          'Get your Access Token from Facebook Developers',
          'Paste the token in the connection form',
        ],
        url: 'https://developers.facebook.com/docs/instagram-api',
      },
      facebook: {
        steps: [
          'Go to Facebook Developers Portal',
          'Create a Messenger App',
          'Get your Page Access Token',
          'Paste the token in the connection form',
        ],
        url: 'https://developers.facebook.com/docs/messenger-platform',
      },
    };

    return instructions[platform.toLowerCase()] || { steps: [], url: '' };
  }
}
