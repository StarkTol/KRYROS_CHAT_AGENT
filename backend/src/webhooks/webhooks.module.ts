import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesModule } from '../messages/messages.module';
import { AutomationModule } from '../automation/automation.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, MessagesModule, AutomationModule, AiModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
