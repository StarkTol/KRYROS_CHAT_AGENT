import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';
import { ContactsModule } from './crm/contacts.module';
import { AutomationModule } from './automation/automation.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SettingsModule } from './config/settings.module';
import { PlatformsModule } from './platforms/platforms.module';
import { AiModule } from './ai/ai.module';
import { WhatsAppGatewayModule } from './whatsapp-gateway/whatsapp-gateway.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    PrismaModule,

    // Scheduling for cron jobs (follow-ups, etc.)
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    MessagesModule,
    ConversationsModule,
    ContactsModule,
    AutomationModule,
    WebhooksModule,
    SettingsModule,
    PlatformsModule,
    AiModule,
    WhatsAppGatewayModule,
    EventsModule,
  ],
})
export class AppModule {}
