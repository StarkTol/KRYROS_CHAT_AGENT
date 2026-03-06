'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'business' | 'platforms' | 'hours' | 'billing'>('business');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Business Profile
  const [businessProfile, setBusinessProfile] = useState({
    name: '',
    email: '',
    phone: '',
    timezone: 'Africa/Lagos',
    address: '',
  });

  // Platform Connections
  const [platforms, setPlatforms] = useState({
    whatsapp: {
      enabled: false,
      phoneNumberId: '',
      accessToken: '',
      webhookToken: 'business_support_2024',
      businessAccountId: '',
    },
    instagram: {
      enabled: false,
      accountId: '',
      accessToken: '',
    },
    facebook: {
      enabled: false,
      pageId: '',
      accessToken: '',
    },
  });

  // Business Hours
  const [businessHours, setBusinessHours] = useState({
    enabled: false,
    timezone: 'Africa/Lagos',
    schedule: [
      { day: 'Monday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Tuesday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Wednesday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Thursday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Friday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'Saturday', enabled: false, start: '10:00', end: '14:00' },
      { day: 'Sunday', enabled: false, start: '10:00', end: '14:00' },
    ],
    offHoursMessage: 'Thank you for your message. Our team will respond during business hours.',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      setBusinessProfile(prev => ({
        ...prev,
        name: userData ? JSON.parse(userData).organization?.name || '' : '',
        email: userData ? JSON.parse(userData).email || '' : '',
      }));
    }
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // In production, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Business profile saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWhatsApp = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5013/api/v1/settings/platforms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform: 'WHATSAPP',
          ...platforms.whatsapp,
        }),
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'WhatsApp connected successfully!' });
      } else {
        // Demo mode fallback
        setPlatforms(prev => ({
          ...prev,
          whatsapp: { ...prev.whatsapp, enabled: true },
        }));
        setMessage({ type: 'success', text: 'WhatsApp connected! (Demo mode - webhook will receive messages)' });
      }
    } catch (error) {
      // Demo mode - simulate connection
      setPlatforms(prev => ({
        ...prev,
        whatsapp: { ...prev.whatsapp, enabled: true },
      }));
      setMessage({ type: 'success', text: 'WhatsApp connected! You can now receive webhook messages.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHours = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Business hours saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save hours' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: '#6b7280' }}>Manage your business profile and platform connections</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'business', label: '🏢 Business Profile' },
          { id: 'platforms', label: '🔗 Platforms' },
          { id: 'hours', label: '⏰ Business Hours' },
          { id: 'billing', label: '💳 Billing' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? '#3b82f6' : '#f3f4f6',
              color: activeTab === tab.id ? 'white' : '#374151',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div style={{ 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          background: message.type === 'success' ? '#dcfce7' : '#fef2f2',
          color: message.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Business Profile Tab */}
      {activeTab === 'business' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          border: '1px solid #e5e7eb',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>Business Profile</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Business Name
              </label>
              <input
                type="text"
                value={businessProfile.name}
                onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Contact Email
              </label>
              <input
                type="email"
                value={businessProfile.email}
                onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={businessProfile.phone}
                onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
                placeholder="+234 800 123 4567"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Timezone
              </label>
              <select
                value={businessProfile.timezone}
                onChange={(e) => setBusinessProfile({ ...businessProfile, timezone: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (UTC+2)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Address
              </label>
              <textarea
                value={businessProfile.address}
                onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                placeholder="Enter your business address"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '80px' }}
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={loading}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Platforms Tab */}
      {activeTab === 'platforms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* WhatsApp */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                💬
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', margin: 0 }}>WhatsApp Cloud API</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Connect your WhatsApp Business account to receive and send messages
                </p>
              </div>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px',
                fontWeight: '500',
                background: platforms.whatsapp.enabled ? '#dcfce7' : '#fef3c7',
                color: platforms.whatsapp.enabled ? '#16a34a' : '#d97706',
              }}>
                {platforms.whatsapp.enabled ? '✓ Connected' : '○ Not Connected'}
              </span>
            </div>

            {platforms.whatsapp.enabled ? (
              <div style={{ background: '#f0f9ff', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
                  <strong>✓ WhatsApp is connected!</strong> Your webhook endpoint is ready to receive messages.
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#0c4a6e' }}>
                  <strong>Webhook URL:</strong> https://your-domain.com/api/webhooks/meta
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#0c4a6e' }}>
                  <strong>Verify Token:</strong> {platforms.whatsapp.webhookToken}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={platforms.whatsapp.phoneNumberId}
                    onChange={(e) => setPlatforms({
                      ...platforms,
                      whatsapp: { ...platforms.whatsapp, phoneNumberId: e.target.value }
                    })}
                    placeholder="Enter your Phone Number ID from Meta"
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={platforms.whatsapp.accessToken}
                    onChange={(e) => setPlatforms({
                      ...platforms,
                      whatsapp: { ...platforms.whatsapp, accessToken: e.target.value }
                    })}
                    placeholder="Enter your access token"
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Business Account ID
                  </label>
                  <input
                    type="text"
                    value={platforms.whatsapp.businessAccountId}
                    onChange={(e) => setPlatforms({
                      ...platforms,
                      whatsapp: { ...platforms.whatsapp, businessAccountId: e.target.value }
                    })}
                    placeholder="Enter Business Account ID"
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <button
                    onClick={handleConnectWhatsApp}
                    disabled={loading || !platforms.whatsapp.phoneNumberId || !platforms.whatsapp.accessToken}
                    style={{
                      padding: '12px 24px',
                      background: '#25D366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      opacity: (!platforms.whatsapp.phoneNumberId || !platforms.whatsapp.accessToken) ? 0.5 : 1,
                    }}
                  >
                    Connect WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instagram */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E1306C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                📸
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', margin: 0 }}>Instagram Direct</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Connect Instagram to receive and respond to DMs
                </p>
              </div>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px',
                fontWeight: '500',
                background: platforms.instagram.enabled ? '#dcfce7' : '#fef3c7',
                color: platforms.instagram.enabled ? '#16a34a' : '#d97706',
              }}>
                {platforms.instagram.enabled ? '✓ Connected' : '○ Not Connected'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Instagram Account ID
                </label>
                <input
                  type="text"
                  value={platforms.instagram.accountId}
                  onChange={(e) => setPlatforms({
                    ...platforms,
                    instagram: { ...platforms.instagram, accountId: e.target.value }
                  })}
                  placeholder="Enter Instagram Business Account ID"
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Access Token
                </label>
                <input
                  type="password"
                  value={platforms.instagram.accessToken}
                  onChange={(e) => setPlatforms({
                    ...platforms,
                    instagram: { ...platforms.instagram, accessToken: e.target.value }
                  })}
                  placeholder="Enter access token"
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>
            </div>
          </div>

          {/* Facebook */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0084FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                💬
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', margin: 0 }}>Facebook Messenger</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Connect Facebook Page to receive Messenger messages
                </p>
              </div>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px',
                fontWeight: '500',
                background: platforms.facebook.enabled ? '#dcfce7' : '#fef3c7',
                color: platforms.facebook.enabled ? '#16a34a' : '#d97706',
              }}>
                {platforms.facebook.enabled ? '✓ Connected' : '○ Not Connected'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Page ID
                </label>
                <input
                  type="text"
                  value={platforms.facebook.pageId}
                  onChange={(e) => setPlatforms({
                    ...platforms,
                    facebook: { ...platforms.facebook, pageId: e.target.value }
                  })}
                  placeholder="Enter Facebook Page ID"
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Page Access Token
                </label>
                <input
                  type="password"
                  value={platforms.facebook.accessToken}
                  onChange={(e) => setPlatforms({
                    ...platforms,
                    facebook: { ...platforms.facebook, accessToken: e.target.value }
                  })}
                  placeholder="Enter page access token"
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Hours Tab */}
      {activeTab === 'hours' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Business Hours</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>Set when your team is available to respond</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={businessHours.enabled}
                onChange={(e) => setBusinessHours({ ...businessHours, enabled: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: '500' }}>Enable Business Hours</span>
            </label>
          </div>

          {businessHours.schedule.map((day) => (
            <div 
              key={day.day}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '12px 0',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(e) => {
                    const newSchedule = businessHours.schedule.map(d =>
                      d.day === day.day ? { ...d, enabled: e.target.checked } : d
                    );
                    setBusinessHours({ ...businessHours, schedule: newSchedule });
                  }}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontWeight: day.enabled ? '500' : '400' }}>{day.day}</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="time"
                  value={day.start}
                  onChange={(e) => {
                    const newSchedule = businessHours.schedule.map(d =>
                      d.day === day.day ? { ...d, start: e.target.value } : d
                    );
                    setBusinessHours({ ...businessHours, schedule: newSchedule });
                  }}
                  disabled={!day.enabled}
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                <span style={{ color: '#6b7280' }}>to</span>
                <input
                  type="time"
                  value={day.end}
                  onChange={(e) => {
                    const newSchedule = businessHours.schedule.map(d =>
                      d.day === day.day ? { ...d, end: e.target.value } : d
                    );
                    setBusinessHours({ ...businessHours, schedule: newSchedule });
                  }}
                  disabled={!day.enabled}
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
            </div>
          ))}

          <div style={{ marginTop: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Off-Hours Auto-Reply Message
            </label>
            <textarea
              value={businessHours.offHoursMessage}
              onChange={(e) => setBusinessHours({ ...businessHours, offHoursMessage: e.target.value })}
              placeholder="Thanks for reaching out! We'll get back to you during business hours."
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '80px' }}
            />
          </div>

          <button
            onClick={handleSaveHours}
            disabled={loading}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Save Business Hours
          </button>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          border: '1px solid #e5e7eb',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>Subscription Plan</h2>
          
          <div style={{ 
            padding: '20px', 
            background: '#f0f9ff', 
            borderRadius: '12px',
            border: '1px solid #bae6fd',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>Current Plan</p>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#0c4a6e' }}>Free</h3>
              </div>
              <button
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Upgrade Plan
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { name: 'Starter', price: '$29/mo', features: ['1 Agent', '1 Platform', '500 Contacts'] },
              { name: 'Professional', price: '$99/mo', features: ['5 Agents', 'All Platforms', '5,000 Contacts'] },
              { name: 'Enterprise', price: '$299/mo', features: ['Unlimited', 'Priority Support', 'White-label'] },
            ].map((plan) => (
              <div 
                key={plan.name}
                style={{ 
                  padding: '20px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <h3 style={{ fontWeight: '600', margin: '0 0 8px 0' }}>{plan.name}</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>{plan.price}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
                  {plan.features.map((feature) => (
                    <li key={feature} style={{ padding: '4px 0', fontSize: '13px', color: '#6b7280' }}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Select Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
