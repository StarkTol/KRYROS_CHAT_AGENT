import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, Socket>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      this.connectedClients.set(payload.sub, client);
      client.data.userId = payload.sub;
      
      console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedClients.delete(client.data.userId);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { phoneNumber: string },
  ) {
    client.join(`conversation:${data.phoneNumber}`);
    console.log(`Client ${client.id} joined conversation: ${data.phoneNumber}`);
  }

  @SubscribeMessage('leave:conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { phoneNumber: string },
  ) {
    client.leave(`conversation:${data.phoneNumber}`);
    console.log(`Client ${client.id} left conversation: ${data.phoneNumber}`);
  }

  // Emit new message to all clients in a conversation
  emitNewMessage(phoneNumber: string, message: any) {
    this.server.to(`conversation:${phoneNumber}`).emit('new:message', message);
    this.server.emit('conversation:update', { phoneNumber });
  }

  // Emit WhatsApp status update
  emitWhatsAppStatus(status: any) {
    this.server.emit('whatsapp:status', status);
  }

  // Emit QR code for WhatsApp connection
  emitQRCode(qrCode: string) {
    this.server.emit('whatsapp:qr', qrCode);
  }

  // Emit AI response
  emitAIResponse(phoneNumber: string, response: any) {
    this.server.to(`conversation:${phoneNumber}`).emit('ai:response', response);
  }

  // Emit conversation list update
  emitConversationUpdate(phoneNumber: string, conversation: any) {
    this.server.emit('conversations:update', { phoneNumber, conversation });
  }
}
