'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    const orgData = localStorage.getItem('organization');
    
    if (!token || !userData) {
      window.location.href = '/auth/login';
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
      if (orgData) {
        setOrganization(JSON.parse(orgData));
      }
    } catch (e) {
      window.location.href = '/auth/login';
    }
  }, [initialized]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    window.location.href = '/auth/login';
  };

  if (!initialized) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        background: '#f9fafb',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid #e5e7eb', 
          borderTopColor: '#3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        background: '#f9fafb',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid #e5e7eb', 
          borderTopColor: '#3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Inbox', href: '/dashboard/inbox' },
    { name: 'Contacts', href: '/dashboard/contacts' },
    { name: '🤖 AI Chatbot', href: '/dashboard/ai-chatbot' },
    { name: 'Automation', href: '/dashboard/automation' },
    { name: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar - Fixed position */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '256px',
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            height: '64px', 
            padding: '0 16px', 
            borderBottom: '1px solid #e5e7eb' 
          }}>
            <Link href="/dashboard" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              textDecoration: 'none' 
            }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: '#3b82f6', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#111827' }}>KRYROS CHAT AGENT</span>
            </Link>
          </div>

          {/* Organization name */}
          {organization && (
            <div style={{ 
              padding: '12px 16px', 
              borderBottom: '1px solid #e5e7eb', 
              background: '#f9fafb' 
            }}>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Organization</p>
              <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: '#111827' }}>{organization.name}</p>
            </div>
          )}

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    textDecoration: 'none',
                    background: isActive ? '#3b82f6' : 'transparent',
                    color: isActive ? 'white' : '#4b5563',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: '#3b82f6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontWeight: '500',
                fontSize: '14px',
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: '#111827' }}>{user?.name}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '8px',
                  color: '#6b7280',
                }}
                title="Logout"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content - With left margin to account for fixed sidebar */}
      <div style={{ marginLeft: '256px' }}>
        {/* Header */}
        <header style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 40, 
          height: '64px', 
          background: 'white', 
          borderBottom: '1px solid #e5e7eb', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 24px' 
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#111827' }}>
              {navItems.find(item => pathname === item.href)?.name || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '24px' }}>{children}</main>
      </div>
    </div>
  );
}
