import { Module } from '@nestjs/common';
import { WhatsAppGatewayController } from './whatsapp-gateway.controller';
import { WhatsAppGatewayService } from './whatsapp-gateway.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, AiModule, EventsModule],
  controllers: [WhatsAppGatewayController],
  providers: [WhatsAppGatewayService],
  exports: [WhatsAppGatewayService],
})
export class WhatsAppGatewayModule {}
