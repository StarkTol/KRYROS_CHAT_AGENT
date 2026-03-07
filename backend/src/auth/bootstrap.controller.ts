import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class BootstrapController {
  constructor(private prisma: PrismaService) {}

  @Post('bootstrap')
  async bootstrap(
    @Headers('x-bootstrap-token') token: string,
    @Body() body: { email: string; password: string; name?: string },
  ) {
    const expected = process.env.BOOTSTRAP_TOKEN || '';
    if (!expected || token !== expected) {
      throw new BadRequestException('Invalid bootstrap token');
    }

    const email = body.email?.toLowerCase().trim();
    const password = body.password;
    const name = body.name || 'Admin';

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: true, message: 'User already exists' };
    }

    let organization = await this.prisma.organization.findFirst({
      where: { slug: 'kryros-chat-agent' },
    });

    if (!organization) {
      organization = await this.prisma.organization.create({
        data: { name: 'KRYROS CHAT AGENT', slug: 'kryros-chat-agent', plan: 'PROFESSIONAL' as any },
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: 'ADMIN' as any,
        organizationId: organization.id,
      },
    });

    return { success: true, user: { id: user.id, email: user.email } };
  }
}
