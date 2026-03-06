import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformsController } from './platforms.controller';

@Module({
  controllers: [PlatformsController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PlatformsModule {}
