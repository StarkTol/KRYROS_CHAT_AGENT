'use client';

import { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kryroschatagentbackend.onrender.com/api/v1';

interface GatewayStatus {
  connected: boolean;
  connecting: boolean;
  phoneNumber: string | null;
}

interface Conversation {
  id: string;
  phoneNumber: string;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  createdAt: string;
}

export default function WhatsAppGatewayPage() {
  const [status, setStatus] = useState<GatewayStatus>({
    connected: false,
    connecting: false,
    phoneNumber: null,
  });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'gateway' | 'inbox'>('gateway');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for status updates
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch conversations when connected
  useEffect(() => {
    if (status.connected) {
      fetchConversations();
      const convInterval = setInterval(fetchConversations, 3000);
      return () => clearInterval(convInterval);
    }
  }, [status.connected]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.phoneNumber);
      const msgInterval = setInterval(() => 
        fetchMessages(selectedConversation.phoneNumber), 2000);
      return () => clearInterval(msgInterval);
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/whatsapp/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStatus({
          connected: data.connected,
          connecting: data.connecting,
          phoneNumber: data.phoneNumber,
        });
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const connectWhatsApp = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/whatsapp/connect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.qrCode) {
        setQrCode(data.qrCode);
      }
      
      // Poll for QR code
      const qrInterval = setInterval(async () => {
        const qrResponse = await fetch(`${API_URL}/whatsapp/qr`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const qrData = await qrResponse.json();
        
        if (qrData.success && qrData.qrCode) {
          setQrCode(qrData.qrCode);
        }
        
        // Check if connected
        await fetchStatus();
      }, 3000);

      // Clear interval after 2 minutes
      setTimeout(() => {
        clearInterval(qrInterval);
        setLoading(false);
      }, 120000);
    } catch (error) {
      console.error('Failed to connect:', error);
      setLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_URL}/whatsapp/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStatus();
      setQrCode(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/whatsapp/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (phoneNumber: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `https://kryroschatagentbackend.onrender.com/api/whatsapp/messages/${phoneNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages);
        
        // Mark as read
        await fetch(
          `https://kryroschatagentbackend.onrender.com/api/whatsapp/messages/${phoneNumber}/read`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_URL}/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber: selectedConversation.phoneNumber,
          message: newMessage,
        }),
      });
      
      setNewMessage('');
      fetchMessages(selectedConversation.phoneNumber);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          📱 WhatsApp Gateway
        </h1>
        <p style={{ color: '#6b7280' }}>
          Connect your WhatsApp number and manage customer chats
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('gateway')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'gateway' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'gateway' ? 'white' : '#374151',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          🔌 Connection
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'inbox' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'inbox' ? 'white' : '#374151',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          💬 Inbox ({conversations.length})
        </button>
      </div>

      {/* Gateway Tab */}
      {activeTab === 'gateway' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Connection Status */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Connection Status
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: status.connected ? '#10b981' : status.connecting ? '#f59e0b' : '#ef4444',
              }}></div>
              <span style={{ fontWeight: '500' }}>
                {status.connected 
                  ? `Connected: ${status.phoneNumber}` 
                  : status.connecting 
                    ? 'Connecting...' 
                    : 'Not Connected'}
              </span>
            </div>

            {status.connected ? (
              <button
                onClick={disconnectWhatsApp}
                style={{
                  padding: '12px 24px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectWhatsApp}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontWeight: '500',
                }}
              >
                {loading ? 'Connecting...' : 'Connect WhatsApp'}
              </button>
            )}
          </div>

          {/* QR Code Display */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Scan QR Code
            </h2>
            
            {qrCode ? (
              <div>
                <img 
                  src={qrCode} 
                  alt="WhatsApp QR Code" 
                  style={{ width: '250px', height: '250px', margin: '0 auto' }}
                />
                <p style={{ color: '#6b7280', marginTop: '12px' }}>
                  Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
                </p>
                <p style={{ color: '#10b981', marginTop: '8px' }}>
                  Scanning...
                </p>
              </div>
            ) : status.connected ? (
              <div style={{ padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <p style={{ color: '#10b981', fontWeight: '500' }}>
                  WhatsApp is connected!
                </p>
              </div>
            ) : (
              <div style={{ padding: '40px', color: '#6b7280' }}>
                Click "Connect WhatsApp" to generate QR code
              </div>
            )}
          </div>

          {/* Instructions */}
          <div style={{ gridColumn: 'span 2', background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              📝 How to Connect
            </h2>
            <ol style={{ paddingLeft: '20px', lineHeight: '2', color: '#4b5563' }}>
              <li>Click "Connect WhatsApp" button above</li>
              <li>A QR code will appear on screen</li>
              <li>Open WhatsApp on your phone</li>
              <li>Go to Settings → Linked Devices</li>
              <li>Tap "Link a Device"</li>
              <li>Scan the QR code with your phone</li>
              <li>Wait for connection to establish</li>
              <li>You're ready to receive messages!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Inbox Tab */}
      {activeTab === 'inbox' && (
        <div style={{ 
          display: 'flex', 
          height: 'calc(100vh - 280px)', 
          gap: '0', 
          background: 'white', 
          borderRadius: '12px', 
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }}>
          {/* Conversations List */}
          <div style={{ width: '320px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontWeight: '600', margin: 0 }}>Conversations</h2>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto' }}>
              {!status.connected ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  Connect WhatsApp first to see conversations
                </div>
              ) : conversations.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: selectedConversation?.id === conv.id ? '#f0f9ff' : 'white',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500' }}>{conv.phoneNumber}</span>
                      {conv.unreadCount > 0 && (
                        <span style={{ 
                          background: '#ef4444', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '10px',
                          fontSize: '12px',
                        }}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.lastMessage}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontWeight: '600', margin: 0 }}>{selectedConversation.phoneNumber}</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                    {selectedConversation.name}
                  </p>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: '#f9fafb' }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: msg.direction === 'OUTBOUND' ? 'flex-end' : 'flex-start',
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          background: msg.direction === 'OUTBOUND' ? '#3b82f6' : 'white',
                          color: msg.direction === 'OUTBOUND' ? 'white' : '#1f2937',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '14px' }}>{msg.content}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.7, textAlign: 'right' }}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '24px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    style={{
                      padding: '12px 20px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '24px',
                      cursor: sending ? 'not-allowed' : 'pointer',
                      opacity: sending ? 0.7 : 1,
                    }}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
