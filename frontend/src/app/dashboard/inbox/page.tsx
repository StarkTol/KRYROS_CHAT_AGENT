'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  contactName: string;
  contactPlatform: string;
  platformId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  contactName: string;
  platform: string;
  platformId: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Demo conversations
    setConversations([
      {
        id: '1',
        contactName: 'John Doe',
        platform: 'WHATSAPP',
        platformId: '+234 806 123 4567',
        lastMessage: 'What are your business hours?',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        unread: 2,
        messages: [
          {
            id: '1-1',
            contactName: 'John Doe',
            contactPlatform: 'WHATSAPP',
            platformId: '+234 806 123 4567',
            content: 'Hi! I saw your ad and I\'m interested in your services.',
            direction: 'inbound',
            timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
            read: true,
          },
          {
            id: '1-2',
            contactName: 'You',
            contactPlatform: 'WHATSAPP',
            platformId: '+234 806 123 4567',
            content: 'Hello John! Thanks for reaching out. How can I help you?',
            direction: 'outbound',
            timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
            read: true,
          },
          {
            id: '1-3',
            contactName: 'John Doe',
            contactPlatform: 'WHATSAPP',
            platformId: '+234 806 123 4567',
            content: 'What are your business hours?',
            direction: 'inbound',
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
            read: false,
          },
        ],
      },
      {
        id: '2',
        contactName: 'Jane Smith',
        platform: 'INSTAGRAM',
        platformId: '@jane_smith',
        lastMessage: 'Is this still available?',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        unread: 1,
        messages: [
          {
            id: '2-1',
            contactName: 'Jane Smith',
            contactPlatform: 'INSTAGRAM',
            platformId: '@jane_smith',
            content: 'Hey! I saw your post. Looks great!',
            direction: 'inbound',
            timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
            read: true,
          },
          {
            id: '2-2',
            contactName: 'You',
            contactPlatform: 'INSTAGRAM',
            platformId: '@jane_smith',
            content: 'Thanks Jane! Let me know if you have any questions.',
            direction: 'outbound',
            timestamp: new Date(Date.now() - 2.5 * 3600000).toISOString(),
            read: true,
          },
          {
            id: '2-3',
            contactName: 'Jane Smith',
            contactPlatform: 'INSTAGRAM',
            platformId: '@jane_smith',
            content: 'Is this still available?',
            direction: 'inbound',
            timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
            read: false,
          },
        ],
      },
      {
        id: '3',
        contactName: 'Bob Wilson',
        platform: 'FACEBOOK',
        platformId: 'Bob Wilson',
        lastMessage: 'Thanks for the quick response!',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        unread: 0,
        messages: [
          {
            id: '3-1',
            contactName: 'Bob Wilson',
            contactPlatform: 'FACEBOOK',
            platformId: 'Bob Wilson',
            content: 'Hi, I need help with my order.',
            direction: 'inbound',
            timestamp: new Date(Date.now() - 25 * 3600000).toISOString(),
            read: true,
          },
          {
            id: '3-2',
            contactName: 'You',
            contactPlatform: 'FACEBOOK',
            platformId: 'Bob Wilson',
            content: 'Sure! What\'s your order number?',
            direction: 'outbound',
            timestamp: new Date(Date.now() - 24.5 * 3600000).toISOString(),
            read: true,
          },
          {
            id: '3-3',
            contactName: 'Bob Wilson',
            contactPlatform: 'FACEBOOK',
            platformId: 'Bob Wilson',
            content: 'Thanks for the quick response!',
            direction: 'inbound',
            timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
            read: true,
          },
        ],
      },
    ]);
    setLoading(false);
  }, []);

  const platformColors: Record<string, string> = {
    WHATSAPP: '#25D366',
    INSTAGRAM: '#E1306C',
    FACEBOOK: '#0084FF',
  };

  const filteredConversations = conversations.filter(c => {
    const matchesPlatform = filterPlatform === 'all' || c.platform === filterPlatform;
    const matchesSearch = c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      contactName: 'You',
      contactPlatform: selectedConversation.platform,
      platformId: selectedConversation.platformId,
      content: newMessage,
      direction: 'outbound',
      timestamp: new Date().toISOString(),
      read: true,
    };

    const updatedConv = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMsg],
      lastMessage: newMessage,
      timestamp: new Date().toISOString(),
    };

    setConversations(conversations.map(c => 
      c.id === selectedConversation.id ? updatedConv : c
    ));
    setSelectedConversation(updatedConv);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: '0', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      {/* Conversations List */}
      <div style={{ width: '360px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Inbox</h1>
            <span style={{ 
              background: '#3b82f6', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: '500',
            }}>
              {totalUnread} unread
            </span>
          </div>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {['all', 'WHATSAPP', 'INSTAGRAM', 'FACEBOOK'].map((platform) => (
              <button
                key={platform}
                onClick={() => setFilterPlatform(platform)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filterPlatform === platform ? '#3b82f6' : '#f3f4f6',
                  color: filterPlatform === platform ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                {platform === 'all' ? 'All' : platform.charAt(0) + platform.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  background: selectedConversation?.id === conv.id ? '#f0f9ff' : 'white',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: platformColors[conv.platform],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}>
                    {conv.contactName.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ fontWeight: conv.unread > 0 ? '700' : '500', margin: 0, fontSize: '14px' }}>
                        {conv.contactName}
                      </p>
                      <span style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>
                        {formatTime(conv.timestamp)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        padding: '2px 6px', 
                        borderRadius: '10px',
                        background: `${platformColors[conv.platform]}20`,
                        color: platformColors[conv.platform],
                        fontWeight: '500',
                      }}>
                        {conv.platform === 'WHATSAPP' ? 'WA' : conv.platform === 'INSTAGRAM' ? 'IG' : 'FB'}
                      </span>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '13px', 
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message View */}
      {selectedConversation ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <div style={{ 
            padding: '16px 24px', 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: platformColors[selectedConversation.platform],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
              }}>
                {selectedConversation.contactName.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: '600', margin: 0, fontSize: '15px' }}>{selectedConversation.contactName}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {selectedConversation.platform} • {selectedConversation.platformId}
                </p>
              </div>
            </div>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                background: 'white',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              View Contact
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#f9fafb' }}>
            {selectedConversation.messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: msg.direction === 'outbound' ? '#3b82f6' : 'white',
                    color: msg.direction === 'outbound' ? 'white' : '#1f2937',
                    boxShadow: msg.direction === 'inbound' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    borderBottomRightRadius: msg.direction === 'outbound' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.direction === 'inbound' ? '4px' : '16px',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{msg.content}</p>
                  <p style={{ 
                    margin: '6px 0 0 0', 
                    fontSize: '11px', 
                    opacity: 0.7,
                    textAlign: 'right',
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div style={{ 
            padding: '16px 24px', 
            borderTop: '1px solid #e5e7eb',
            background: 'white',
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                }}
              >
                📎
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '24px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Select a conversation</h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
