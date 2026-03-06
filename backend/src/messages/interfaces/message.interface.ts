// Platform-agnostic message schema for central message router

export enum PlatformType {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
}

export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  LOCATION = 'LOCATION',
  CONTACTS = 'CONTACTS',
}

export interface NormalizedMessage {
  id?: string;
  platform: PlatformType;
  platformMessageId: string;
  platformConversationId: string;
  direction: MessageDirection;
  content: string;
  contentType: MessageType;
  sender: SenderInfo;
  recipient?: RecipientInfo;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface SenderInfo {
  platformId: string;
  name?: string;
  profilePicture?: string;
}

export interface RecipientInfo {
  platformId: string;
}

export interface MessageContext {
  previousMessageId?: string;
  conversationId?: string;
}
