'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface DashboardStats {
  totalMessages: number;
  unreadMessages: number;
  totalContacts: number;
  activeAutomations: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    unreadMessages: 0,
    totalContacts: 0,
    activeAutomations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    // Get user and org from localStorage
    const userData = localStorage.getItem('user');
    const orgData = localStorage.getItem('organization');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (orgData) {
      setOrganization(JSON.parse(orgData));
    }

    const loadStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const [dashboardRes, convStatsRes, automationsRes] = await Promise.all([
          fetch(`${API_URL}/settings/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/conversations/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/automation`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const dashboard = await dashboardRes.json();
        const convStats = await convStatsRes.json();
        const automations = await automationsRes.json();
        const activeCount = (automations.data || automations || []).filter((a: any) => a.isActive).length;
        setStats({
          totalMessages: dashboard.messagesToday || 0,
          unreadMessages: convStats.unreadTotal || 0,
          totalContacts: dashboard.totalContacts || 0,
          activeAutomations: activeCount,
        });
      } catch (e) {
        console.error('Failed to load dashboard stats', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const userName = user?.name || 'User';
  const orgName = organization?.name || 'your business';

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px' 
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #e5e7eb', 
          borderTopColor: '#3b82f6', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome section */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Welcome back, {userName}!
        </h1>
        <p style={{ color: '#6b7280' }}>
          Here's what's happening with {orgName} today.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        {/* Total Messages */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between' 
          }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>Total Messages</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{stats.totalMessages}</p>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#3b82f615',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Unread Messages */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between' 
          }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>Unread Messages</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{stats.unreadMessages}</p>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#f59e0b15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Total Contacts */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between' 
          }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>Total Contacts</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{stats.totalContacts}</p>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#10b98115',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Active Automations */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between' 
          }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>Active Automations</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{stats.activeAutomations}</p>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#8b5cf615',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b5cf6',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '16px' 
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/dashboard/inbox" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              background: '#f3f4f6',
              textDecoration: 'none',
              color: '#374151',
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                background: '#3b82f6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: '500', margin: 0 }}>Open Inbox</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>View and respond to messages</p>
              </div>
            </a>
            <a href="/dashboard/contacts" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              background: '#f3f4f6',
              textDecoration: 'none',
              color: '#374151',
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                background: '#10b981', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: '500', margin: 0 }}>Add Contact</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Create a new lead or customer</p>
              </div>
            </a>
            <a href="/dashboard/automation" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              background: '#f3f4f6',
              textDecoration: 'none',
              color: '#374151',
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                background: '#8b5cf6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: '500', margin: 0 }}>Create Automation</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Set up auto-replies and rules</p>
              </div>
            </a>
          </div>
        </div>

        {/* Connected Platforms */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Connected Platforms</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* WhatsApp */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px', 
              borderRadius: '8px', 
              background: '#f3f4f6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  background: '#25D366', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: '500', margin: 0 }}>WhatsApp</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Not connected</p>
                </div>
              </div>
              <a href="/dashboard/settings" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>Connect</a>
            </div>
            
            {/* Instagram */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px', 
              borderRadius: '8px', 
              background: '#f3f4f6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  background: '#E1306C', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm7.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: '500', margin: 0 }}>Instagram</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Not connected</p>
                </div>
              </div>
              <a href="/dashboard/settings" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>Connect</a>
            </div>
            
            {/* Facebook Messenger */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px', 
              borderRadius: '8px', 
              background: '#f3f4f6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  background: '#0084FF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: '500', margin: 0 }}>Facebook Messenger</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Not connected</p>
                </div>
              </div>
              <a href="/dashboard/settings" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>Connect</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
