'use client';

import { useState, useEffect } from 'react';

interface Automation {
  id: string;
  name: string;
  type: string;
  trigger: string;
  conditions: string;
  action: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  stats: { triggered: number; success: number };
  createdAt: string;
}

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'hours'>('rules');

  const [formData, setFormData] = useState({
    name: '',
    type: 'AUTO_REPLY',
    trigger: 'FIRST_MESSAGE',
    keyword: '',
    message: '',
    isActive: true,
  });

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
    // Demo automations
    setAutomations([
      {
        id: '1',
        name: 'Welcome Message',
        type: 'AUTO_REPLY',
        trigger: 'FIRST_MESSAGE',
        conditions: 'All platforms',
        action: 'Send welcome message',
        status: 'ACTIVE',
        stats: { triggered: 45, success: 43 },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        name: 'Pricing Response',
        type: 'KEYWORD',
        trigger: 'keyword:price',
        conditions: 'Contains "price" or "cost"',
        action: 'Send pricing info',
        status: 'ACTIVE',
        stats: { triggered: 23, success: 22 },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        name: 'Support Hours',
        type: 'BUSINESS_HOURS',
        trigger: 'OUTSIDE_HOURS',
        conditions: 'Mon-Fri 9AM-6PM',
        action: 'Send off-hours message',
        status: 'ACTIVE',
        stats: { triggered: 12, success: 12 },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    setLoading(false);
  }, []);

  const handleCreateAutomation = () => {
    const newAutomation: Automation = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      trigger: formData.trigger + (formData.keyword ? `:${formData.keyword}` : ''),
      conditions: 'All platforms',
      action: formData.message.substring(0, 50) + (formData.message.length > 50 ? '...' : ''),
      status: formData.isActive ? 'ACTIVE' : 'DRAFT',
      stats: { triggered: 0, success: 0 },
      createdAt: new Date().toISOString(),
    };
    setAutomations([...automations, newAutomation]);
    setShowModal(false);
    setFormData({
      name: '',
      type: 'AUTO_REPLY',
      trigger: 'FIRST_MESSAGE',
      keyword: '',
      message: '',
      isActive: true,
    });
  };

  const toggleAutomation = (id: string) => {
    setAutomations(automations.map(a => 
      a.id === id 
        ? { ...a, status: a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }
        : a
    ));
  };

  const deleteAutomation = (id: string) => {
    if (!confirm('Delete this automation?')) return;
    setAutomations(automations.filter(a => a.id !== id));
  };

  const typeIcons: Record<string, string> = {
    AUTO_REPLY: '💬',
    KEYWORD: '🔑',
    BUSINESS_HOURS: '⏰',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Automation</h1>
          <p style={{ color: '#6b7280' }}>Automate responses and workflows</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Create Automation
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('rules')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'rules' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'rules' ? 'white' : '#374151',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          🤖 Automation Rules
        </button>
        <button
          onClick={() => setActiveTab('hours')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'hours' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'hours' ? 'white' : '#374151',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          ⏰ Business Hours
        </button>
      </div>

      {activeTab === 'rules' ? (
        <>
          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Active Rules</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#10b981' }}>
                {automations.filter(a => a.status === 'ACTIVE').length}
              </p>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Total Triggered</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0' }}>
                {automations.reduce((sum, a) => sum + a.stats.triggered, 0)}
              </p>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Success Rate</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0' }}>
                {automations.length > 0 
                  ? Math.round((automations.reduce((sum, a) => sum + a.stats.success, 0) / 
                     (automations.reduce((sum, a) => sum + a.stats.triggered, 0) || 1)) * 100)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Automations List */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {automations.map((automation) => (
                  <div 
                    key={automation.id}
                    style={{ 
                      padding: '20px', 
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>{typeIcons[automation.type] || '🤖'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h3 style={{ fontWeight: '600', margin: 0 }}>{automation.name}</h3>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: '500',
                          background: automation.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
                          color: automation.status === 'ACTIVE' ? '#16a34a' : '#d97706',
                        }}>
                          {automation.status}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{automation.conditions}</p>
                      <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '13px' }}>{automation.action}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Triggered: {automation.stats.triggered}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#10b981' }}>✓ {automation.stats.success}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleAutomation(automation.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: automation.status === 'ACTIVE' ? '#fef3c7' : '#dcfce7',
                          color: automation.status === 'ACTIVE' ? '#d97706' : '#16a34a',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}
                      >
                        {automation.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteAutomation(automation.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #dc2626',
                          background: 'white',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Business Hours Tab */
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Timezone</label>
            <select
              value={businessHours.timezone}
              onChange={(e) => setBusinessHours({ ...businessHours, timezone: e.target.value })}
              disabled={!businessHours.enabled}
              style={{ 
                width: '100%', 
                maxWidth: '300px',
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                background: businessHours.enabled ? 'white' : '#f9fafb',
              }}
            >
              <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg (UTC+2)</option>
              <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Weekly Schedule</h3>
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
                    disabled={!businessHours.enabled}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontWeight: day.enabled ? '500' : '400', color: day.enabled ? '#111' : '#9ca3af' }}>
                    {day.day}
                  </span>
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
                    disabled={!day.enabled || !businessHours.enabled}
                    style={{ 
                      padding: '8px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      background: day.enabled && businessHours.enabled ? 'white' : '#f9fafb',
                    }}
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
                    disabled={!day.enabled || !businessHours.enabled}
                    style={{ 
                      padding: '8px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      background: day.enabled && businessHours.enabled ? 'white' : '#f9fafb',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Off-Hours Auto-Reply Message
            </label>
            <textarea
              value={businessHours.offHoursMessage}
              onChange={(e) => setBusinessHours({ ...businessHours, offHoursMessage: e.target.value })}
              disabled={!businessHours.enabled}
              placeholder="Thanks for reaching out! We'll get back to you during business hours."
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                minHeight: '80px',
                resize: 'vertical',
                background: businessHours.enabled ? 'white' : '#f9fafb',
              }}
            />
          </div>

          <button
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Save Business Hours
          </button>
        </div>
      )}

      {/* Create Automation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>Create Automation</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Welcome Message"
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, trigger: 'FIRST_MESSAGE' })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="AUTO_REPLY">Auto Reply - Respond to first message</option>
                  <option value="KEYWORD">Keyword - Respond to specific words</option>
                  <option value="BUSINESS_HOURS">Business Hours - Only during set hours</option>
                </select>
              </div>

              {formData.type === 'KEYWORD' && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Keyword</label>
                  <input
                    type="text"
                    value={formData.keyword}
                    onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                    placeholder="e.g., price, support, hello"
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Reply Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter the automatic response..."
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    minHeight: '100px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>Activate immediately</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAutomation}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
