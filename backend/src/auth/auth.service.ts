import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate unique slug
    const baseSlug = dto.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const slug = await this.generateUniqueSlug(baseSlug);

    // Create organization and admin user
    const organization = await this.prisma.organization.create({
      data: {
        name: dto.organizationName || `${dto.name}'s Business`,
        slug,
        users: {
          create: {
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
            role: 'ADMIN',
          },
        },
      },
      include: {
        users: {
          where: { email: dto.email },
          take: 1,
        },
      },
    });

    // Create business hours separately
    const businessHoursData = [
      { organizationId: organization.id, dayOfWeek: 0, isOpen: false },
      { organizationId: organization.id, dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { organizationId: organization.id, dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { organizationId: organization.id, dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { organizationId: organization.id, dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { organizationId: organization.id, dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { organizationId: organization.id, dayOfWeek: 6, isOpen: false },
    ];
    
    await this.prisma.businessHours.createMany({ data: businessHoursData });

    const user = organization.users[0];
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      organization: {
        id: user.organization?.id || '',
        name: user.organization?.name || '',
        slug: user.organization?.slug || '',
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return this.jwtService.sign(payload);
  }
}
