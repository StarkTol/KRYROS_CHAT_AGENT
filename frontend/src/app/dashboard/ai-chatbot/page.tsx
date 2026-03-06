'use client';

import { useState, useEffect } from 'react';

interface AiSettings {
  aiEnabled: boolean;
  aiModel: string;
  aiTone: string;
  businessName: string;
  businessDescription: string;
  productServiceInfo: string;
  autoReplyEnabled: boolean;
  humanTakeoverEnabled: boolean;
}

export default function AiChatbotPage() {
  const [settings, setSettings] = useState<AiSettings>({
    aiEnabled: false,
    aiModel: 'gpt-4',
    aiTone: 'friendly',
    businessName: '',
    businessDescription: '',
    productServiceInfo: '',
    autoReplyEnabled: true,
    humanTakeoverEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAiSettings();
  }, []);

  const fetchAiSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5013/api/v1/ai/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5013/api/v1/ai/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'AI settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testMessage.trim()) return;
    
    setTesting(true);
    setTestResponse('');
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5013/api/v1/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: testMessage }),
      });
      const data = await response.json();
      if (data.success) {
        setTestResponse(data.response);
      } else {
        setTestResponse('Failed to get response. Make sure AI is enabled.');
      }
    } catch (error) {
      setTestResponse('Error connecting to AI service.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>🤖 AI Chatbot</h1>
        <p style={{ color: '#6b7280' }}>
          Configure your AI-powered customer service chatbot
        </p>
      </div>

      {message && (
        <div style={{ 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          background: message.type === 'success' ? '#dcfce7' : '#fef2f2',
          color: message.type === 'success' ? '#16a34a' : '#dc2626',
        }}>
          {message.text}
        </div>
      )}

      {/* Main Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column - Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* AI Status Card */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>AI Status</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.aiEnabled}
                  onChange={(e) => setSettings({ ...settings, aiEnabled: e.target.checked })}
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ fontWeight: '500' }}>Enable AI Chatbot</span>
              </label>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px',
                fontWeight: '500',
                background: settings.aiEnabled ? '#dcfce7' : '#fef3c7',
                color: settings.aiEnabled ? '#16a34a' : '#d97706',
              }}>
                {settings.aiEnabled ? '🟢 Active' : '⚪ Inactive'}
              </span>
            </div>
          </div>

          {/* Business Info */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Business Information</h2>
            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
              This information helps the AI understand your business to give better responses.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Business Name
                </label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  placeholder="Your Business Name"
                  disabled={!settings.aiEnabled}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    background: settings.aiEnabled ? 'white' : '#f9fafb',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Business Description
                </label>
                <textarea
                  value={settings.businessDescription}
                  onChange={(e) => setSettings({ ...settings, businessDescription: e.target.value })}
                  placeholder="Tell customers what your business does..."
                  disabled={!settings.aiEnabled}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    minHeight: '80px',
                    background: settings.aiEnabled ? 'white' : '#f9fafb',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Products & Services
                </label>
                <textarea
                  value={settings.productServiceInfo}
                  onChange={(e) => setSettings({ ...settings, productServiceInfo: e.target.value })}
                  placeholder="List your products or services..."
                  disabled={!settings.aiEnabled}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    minHeight: '80px',
                    background: settings.aiEnabled ? 'white' : '#f9fafb',
                  }}
                />
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>AI Configuration</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  AI Model
                </label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                  disabled={!settings.aiEnabled}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    background: settings.aiEnabled ? 'white' : '#f9fafb',
                  }}
                >
                  <option value="gpt-4">GPT-4 (Recommended)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Response Tone
                </label>
                <select
                  value={settings.aiTone}
                  onChange={(e) => setSettings({ ...settings, aiTone: e.target.value })}
                  disabled={!settings.aiEnabled}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    background: settings.aiEnabled ? 'white' : '#f9fafb',
                  }}
                >
                  <option value="friendly">Friendly & Casual</option>
                  <option value="professional">Professional & Formal</option>
                  <option value="casual">Casual & Relaxed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Human Takeover */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🛡️ Human Takeover</h2>
            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
              When customers ask for human support, the AI will stop and notify agents.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.humanTakeoverEnabled}
                  onChange={(e) => setSettings({ ...settings, humanTakeoverEnabled: e.target.checked })}
                  disabled={!settings.aiEnabled}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Enable human takeover (always on)</span>
              </label>
              <p style={{ color: '#6b7280', fontSize: '13px', marginLeft: '30px' }}>
                When customers say things like "talk to human", "need agent", "speak to manager", the AI will stop responding.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '14px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save AI Settings'}
          </button>
        </div>

        {/* Right Column - Test */}
        <div>
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #e5e7eb',
            position: 'sticky',
            top: '20px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🧪 Test AI</h2>
            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
              Try the AI with a sample message to see how it responds.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Your Message
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type a test message..."
                disabled={!settings.aiEnabled}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px',
                  minHeight: '100px',
                  background: settings.aiEnabled ? 'white' : '#f9fafb',
                }}
              />
            </div>

            <button
              onClick={handleTest}
              disabled={testing || !settings.aiEnabled || !testMessage.trim()}
              style={{
                width: '100%',
                padding: '12px',
                background: settings.aiEnabled ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: testing ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                marginBottom: '16px',
              }}
            >
              {testing ? 'Testing...' : 'Test Response'}
            </button>

            {testResponse && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  AI Response
                </label>
                <div style={{ 
                  padding: '16px', 
                  background: '#f0fdf4', 
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                }}>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{testResponse}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div style={{ 
            marginTop: '20px',
            padding: '20px', 
            background: '#f0f9ff', 
            borderRadius: '12px',
            border: '1px solid #bae6fd',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#0369a1' }}>
              📝 How It Works
            </h3>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: '#0c4a6e', lineHeight: '1.8' }}>
              <li>AI automatically replies to incoming messages</li>
              <li>Respects conversation history for context</li>
              <li>Detects language (English, Yoruba, Igbo, Hausa)</li>
              <li>Human takeover stops AI when requested</li>
              <li>Works with WhatsApp, Instagram & Facebook</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
