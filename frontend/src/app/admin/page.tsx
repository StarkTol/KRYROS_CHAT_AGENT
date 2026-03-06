'use client';

import { useEffect, useState } from 'react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  subscriptionEndsAt: string;
  createdAt: string;
  userCount: number;
  contactCount: number;
}

export default function AdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5013/api/v1/admin/organizations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.data) {
        setOrganizations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      // Demo data
      setOrganizations([
        {
          id: '1',
          name: 'Demo Business',
          slug: 'demo-business',
          plan: 'FREE',
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          userCount: 1,
          contactCount: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (orgId: string, plan: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5013/api/v1/admin/organizations/${orgId}/plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Plan updated to ${plan}` });
        fetchOrganizations();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update plan' });
    }
  };

  const handleDeleteOrg = async (orgId: string) => {
    if (!confirm('Are you sure? This will delete all data.')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5013/api/v1/admin/organizations/${orgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Organization deleted' });
        fetchOrganizations();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          🏢 Super Admin Panel
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage all client organizations and subscriptions
        </p>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
        }}>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Total Organizations</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{organizations.length}</p>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
        }}>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Active Subscriptions</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0' }}>
            {organizations.filter(o => o.plan !== 'FREE').length}
          </p>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
        }}>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Free Trials</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0' }}>
            {organizations.filter(o => o.plan === 'FREE').length}
          </p>
        </div>
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

      {/* Organizations List */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '24px',
        border: '1px solid #e5e7eb',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Client Organizations
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#6b7280' }}>Organization</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#6b7280' }}>Plan</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#6b7280' }}>Users</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#6b7280' }}>Contacts</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      <p style={{ fontWeight: '500', margin: 0 }}>{org.name}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>{org.slug}</p>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={org.plan}
                        onChange={(e) => handleUpdatePlan(org.id, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                        }}
                      >
                        <option value="FREE">Free</option>
                        <option value="STARTER">Starter - $29/mo</option>
                        <option value="PROFESSIONAL">Professional - $99/mo</option>
                        <option value="ENTERPRISE">Enterprise - $299/mo</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px' }}>{org.userCount}</td>
                    <td style={{ padding: '12px' }}>{org.contactCount}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleDeleteOrg(org.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #dc2626',
                          background: 'white',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontSize: '14px',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pricing Info */}
      <div style={{ 
        marginTop: '32px',
        padding: '24px', 
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        borderRadius: '12px',
        color: 'white',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>💰 Monetization Strategy</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Free Plan</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>$0</p>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: '8px 0 0 0' }}>For testing, small business</p>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Starter</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>$29/mo</p>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: '8px 0 0 0' }}>1 agent, 1 platform</p>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Professional</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>$99/mo</p>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: '8px 0 0 0' }}>5 agents, all platforms</p>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Enterprise</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>$299/mo</p>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: '8px 0 0 0' }}>Unlimited, priority support</p>
          </div>
        </div>
      </div>

      {/* How to Get API Credentials */}
      <div style={{ 
        marginTop: '32px',
        padding: '24px', 
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          🔑 How to Get Real API Credentials
        </h2>
        
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#3b82f6' }}>
            Step 1: Create Meta Developer Account
          </h3>
          <ol style={{ paddingLeft: '20px', color: '#4b5563', fontSize: '14px', lineHeight: '1.8' }}>
            <li>Go to <a href="https://developers.facebook.com" target="_blank" style={{ color: '#3b82f6' }}>developers.facebook.com</a></li>
            <li>Click "My Apps" → "Create App"</li>
            <li>Choose "Consumer" app type</li>
            <li>Fill in app name and contact email</li>
          </ol>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#3b82f6' }}>
            Step 2: Setup WhatsApp
          </h3>
          <ol style={{ paddingLeft: '20px', color: '#4b5563', fontSize: '14px', lineHeight: '1.8' }}>
            <li>In your app, add "WhatsApp" product</li>
            <li>Click "Setup" on WhatsApp</li>
            <li>You'll see <strong>Phone Number ID</strong> and <strong>WhatsApp Business Account ID</strong></li>
            <li>Generate <strong>Temporary Access Token</strong> (expires in ~24h) or long-lived token</li>
          </ol>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#3b82f6' }}>
            Step 3: Setup Webhook
          </h3>
          <ol style={{ paddingLeft: '20px', color: '#4b5563', fontSize: '14px', lineHeight: '1.8' }}>
            <li>Go to "Webhooks" section</li>
            <li>Click "Add Webhook"</li>
            <li>Callback URL: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
              https://your-domain.com/api/webhooks/meta
            </code></li>
            <li>Verify Token: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>business_support_2024</code></li>
            <li>Subscribe to: <code>messages</code>, <code>message_deliveries</code></li>
          </ol>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#10b981' }}>
            ✅ Ready for Production?
          </h3>
          <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.8' }}>
            Once you have credentials, clients can enter them in their Settings → Platforms page. 
            The webhook will receive messages and the inbox will work for real!
          </p>
        </div>
      </div>
    </div>
  );
}
