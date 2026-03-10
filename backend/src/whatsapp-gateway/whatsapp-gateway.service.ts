import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EventsGateway } from '../events/events.gateway';

// Baileys types
interface WASocket {
  sendMessage: (jid: string, content: any, options?: any) => Promise<any>;
  end: (error?: Error) => void;
  ev: {
    on: (event: string, callback: (data: any) => void) => void;
    off: (event: string, callback?: (data: any) => void) => void;
  };
}

interface Message {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message?: {
    conversation?: string[];
    extendedTextMessage?: { text: string };
    imageMessage?: { caption?: string };
    videoMessage?: { caption?: string };
  };
  pushName?: string;
  timestamp?: number;
}

@Injectable()
export class WhatsAppGatewayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppGatewayService.name);
  private socket: WASocket | null = null;
  private qrCode: string | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private phoneNumber: string | null = null;
  
  // Store for event callbacks
  private messageCallbacks: ((message: any) => void)[] = [];
  private connectionCallbacks: ((status: any) => void)[] = [];

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => AiService))
    private aiService: AiService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) {}

  async onModuleInit() {
    this.logger.log('WhatsApp Gateway initializing...');
    // Don't auto-connect - wait for user to scan QR
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Initialize WhatsApp connection and generate QR code
   */
  async connect(): Promise<{ qrCode: string; status: string }> {
    if (this.isConnected) {
      return { qrCode: '', status: 'already_connected' };
    }

    if (this.isConnecting) {
      return { qrCode: this.qrCode || '', status: 'connecting' };
    }

    this.isConnecting = true;
    this.logger.log('Starting WhatsApp connection...');

    try {
      // Dynamic import for Baileys
      const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys');
      
      // Use memory auth state for simplicity (can be changed to file-based)
      const authState = await useMultiFileAuthState('./whatsapp-auth');
      
      this.socket = makeWASocket({
        browser: ['KRYROS CHAT AGENT', 'Chrome', '120.0.0'],
        auth: authState.state,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
      }) as WASocket;

      // Handle QR code generation
      this.socket?.ev.on('creds.update', async () => {
        await authState.saveCreds();
      });

      this.socket?.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrCode = qr;
          this.logger.log('QR Code received, waiting for scan...');
          this.notifyConnectionUpdate({ status: 'waiting_for_qr', qr });
        }

        if (connection === 'close') {
          const reason = (lastDisconnect?.error as any)?.output?.statusCode;
          this.logger.warn(`Connection closed: ${reason}`);
          
          if (reason === DisconnectReason.loggedOut) {
            this.isConnected = false;
            this.isConnecting = false;
            this.socket = null;
            this.notifyConnectionUpdate({ status: 'logged_out' });
          } else {
            // Auto reconnect
            this.reconnect();
          }
        }

        if (connection === 'open') {
          this.isConnected = true;
          this.isConnecting = false;
          this.logger.log('WhatsApp connected successfully!');
          this.notifyConnectionUpdate({ status: 'connected' });
        }
      });

      // Handle incoming messages
      this.socket?.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        for (const msg of messages) {
          if (!msg.key.fromMe) {
            await this.handleIncomingMessage(msg);
          }
        }
      });

      // Wait for connection or QR (do not throw on timeout)
      await this.waitForConnection(30000);
      
      return { 
        qrCode: this.qrCode || '', 
        status: this.isConnected ? 'connected' : 'waiting_for_qr' 
      };
    } catch (error) {
      this.isConnecting = false;
      this.logger.error('Failed to connect to WhatsApp', error);
      // Swallow error here to avoid unhandled rejection in async reconnections
      return { 
        qrCode: this.qrCode || '', 
        status: 'error' 
      };
    }
  }

  /**
   * Wait for connection or QR code
   */
  private waitForConnection(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const check = () => {
        if (this.isConnected || this.qrCode) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          // Resolve on timeout to prevent throwing and crashing the process
          resolve();
        } else {
          setTimeout(check, 1000);
        }
      };
      
      check();
    });
  }

  /**
   * Handle incoming message
   */
  private async handleIncomingMessage(msg: Message) {
    try {
      const phoneNumber = msg.key.remoteJid?.replace('@s.whatsapp.net', '');
      const messageText = this.extractMessageText(msg);
      
      if (!phoneNumber || !messageText) return;

      this.logger.log(`Incoming message from ${phoneNumber}: ${messageText}`);

      // Create or find customer
      const contact = await this.findOrCreateContact(phoneNumber);

      // Save message to database
      const message = await this.prisma.message.create({
        data: {
          organizationId: contact.organizationId,
          conversationId: `whatsapp-${phoneNumber}`,
          contactId: contact.id,
          content: messageText,
          direction: 'INBOUND',
          platformMessageId: msg.key.id,
          status: 'DELIVERED',
        },
      });

      // Update contact
      await this.prisma.contact.update({
        where: { id: contact.id },
        data: {
          lastInteractionAt: new Date(),
        },
      });

      // Emit event for real-time updates
      this.notifyMessageReceived({
        id: message.id,
        phoneNumber,
        message: messageText,
        timestamp: message.createdAt.toISOString(),
        contactId: contact.id,
      });

      // Trigger AI auto-reply
      await this.processAiReply(contact, messageText);
    } catch (error) {
      this.logger.error('Error handling incoming message', error);
    }
  }

  /**
   * Extract message text from different message types
   */
  private extractMessageText(msg: Message): string | null {
    if (msg.message?.conversation) {
      return msg.message.conversation[0];
    }
    if (msg.message?.extendedTextMessage?.text) {
      return msg.message.extendedTextMessage.text;
    }
    if (msg.message?.imageMessage?.caption) {
      return msg.message.imageMessage.caption;
    }
    if (msg.message?.videoMessage?.caption) {
      return msg.message.videoMessage.caption;
    }
    return null;
  }

  /**
   * Find or create contact
   */
  private async findOrCreateContact(phoneNumber: string) {
    // Get first organization (for single-tenant) or handle multi-tenant
    const organization = await this.prisma.organization.findFirst();
    
    if (!organization) {
      throw new Error('No organization found');
    }

    let contact = await this.prisma.contact.findFirst({
      where: {
        organizationId: organization.id,
        platformId: phoneNumber,
        platform: 'WHATSAPP',
      },
    });

    if (!contact) {
      contact = await this.prisma.contact.create({
        data: {
          organizationId: organization.id,
          platformId: phoneNumber,
          platform: 'WHATSAPP',
          name: `WhatsApp User ${phoneNumber.slice(-4)}`,
          status: 'NEW',
          source: 'DIRECT',
        },
      });
    }

    return contact;
  }

  /**
   * Process AI reply
   */
  private async processAiReply(contact: any, messageText: string) {
    try {
      // Get organization settings
      const settings = await this.prisma.settings.findFirst({
        where: { organizationId: contact.organizationId },
      });

      // Check if AI is enabled
      if (!settings?.aiEnabled) {
        this.logger.log('AI is disabled, skipping auto-reply');
        return;
      }

      // Get conversation history
      const history = await this.aiService.getConversationHistory(contact.id, 10);
      
      const businessContext = {
        businessName: settings.businessName || 'KRYROS CHAT AGENT',
        businessDescription: settings.businessDescription || '',
        productServiceInfo: settings.productServiceInfo || '',
        tone: settings.aiTone || 'friendly',
      };

      // Generate AI response
      const result = await this.aiService.generateResponse(
        messageText,
        history,
        businessContext,
        'en',
      );

      // Check if human takeover is requested
      if (result.shouldHumanTakeover) {
        await this.prisma.contact.update({
          where: { id: contact.id },
          data: { 
            status: 'HUMAN_REQUIRED',
            humanTakeover: true,
          },
        });
        
        // Send human takeover message
        await this.sendMessage(contact.platformId, result.response);
        return;
      }

      // Send AI response
      await this.sendMessage(contact.platformId, result.response);
    } catch (error) {
      this.logger.error('Error processing AI reply', error);
    }
  }

  /**
   * Send message to WhatsApp
   */
  async sendMessage(phoneNumber: string, messageText: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.socket || !this.isConnected) {
      return { success: false, error: 'WhatsApp not connected' };
    }

    try {
      const jid = `${phoneNumber}@s.whatsapp.net`;
      
      const response = await this.socket.sendMessage(jid, {
        text: messageText,
      });

      // Save sent message to database
      const contact = await this.prisma.contact.findFirst({
        where: {
          platformId: phoneNumber,
          platform: 'WHATSAPP',
        },
      });

      if (contact) {
        await this.prisma.message.create({
          data: {
            organizationId: contact.organizationId,
            conversationId: `whatsapp-${phoneNumber}`,
            contactId: contact.id,
            content: messageText,
            direction: 'OUTBOUND',
            platformMessageId: response?.key?.id,
            status: 'SENT',
            isAutomated: true,
            aiUsed: true,
          },
        });
      }

      this.logger.log(`Message sent to ${phoneNumber}`);
      return { success: true, messageId: response?.key?.id };
    } catch (error) {
      this.logger.error('Failed to send message', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; connecting: boolean; phoneNumber: string | null } {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
      phoneNumber: this.phoneNumber,
    };
  }

  /**
   * Disconnect from WhatsApp
   */
  async disconnect() {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.qrCode = null;
    this.phoneNumber = null;
    this.logger.log('WhatsApp disconnected');
  }

  /**
   * Reconnect to WhatsApp
   */
  private async reconnect() {
    this.logger.log('Attempting to reconnect...');
    await this.disconnect();
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (err) {
        // Never let reconnection errors crash the process
        this.logger.error('Reconnect failed', err);
      }
    }, 5000);
  }

  /**
   * Subscribe to message events
   */
  onMessage(callback: (message: any) => void) {
    this.messageCallbacks.push(callback);
  }

  /**
   * Subscribe to connection status events
   */
  onConnectionUpdate(callback: (status: any) => void) {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Notify message listeners
   */
  private notifyMessageReceived(message: any) {
    for (const callback of this.messageCallbacks) {
      callback(message);
    }
    
    // Emit via Socket.io
    try {
      this.eventsGateway.emitNewMessage(message.phoneNumber, message);
    } catch (error) {
      this.logger.warn('Failed to emit message via Socket.io', error);
    }
  }

  /**
   * Notify connection status listeners
   */
  private notifyConnectionUpdate(status: any) {
    for (const callback of this.connectionCallbacks) {
      callback(status);
    }
    
    // Emit via Socket.io
    try {
      this.eventsGateway.emitWhatsAppStatus({
        connected: this.isConnected,
        connecting: this.isConnecting,
        phoneNumber: this.phoneNumber,
        ...status,
      });
    } catch (error) {
      this.logger.warn('Failed to emit status via Socket.io', error);
    }
  }

  /**
   * Get current QR code (for polling)
   */
  getQRCode(): string | null {
    return this.qrCode;
  }
}
