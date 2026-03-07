'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface Contact {
  id: string;
  name: string;
  platform: string;
  platformId: string;
  status: string;
  source: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'WHATSAPP',
    platformId: '',
    status: 'NEW',
    source: 'DIRECT',
    notes: '',
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    const loadContacts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_URL}/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const list = (data.contacts || data.data || []).map((c: any) => ({
          id: c.id,
          name: c.name || c.platformId,
          platform: c.platform,
          platformId: c.platformId,
          status: c.status,
          source: c.source,
          createdAt: c.createdAt,
        }));
        setContacts(list);
      } catch (e) {
        console.error('Failed to load contacts', e);
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, []);

  const handleCreateContact = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        const c = data.data || data;
        const newContact: Contact = {
          id: c.id,
          name: c.name || c.platformId,
          platform: c.platform,
          platformId: c.platformId,
          status: c.status,
          source: c.source,
          createdAt: c.createdAt,
        };
        setContacts([newContact, ...contacts]);
        setShowModal(false);
        setFormData({
          name: '',
          platform: 'WHATSAPP',
          platformId: '',
          status: 'NEW',
          source: 'DIRECT',
          notes: '',
        });
      }
    } catch (e) {
      console.error('Failed to create contact', e);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.platformId.includes(search)
  );

  const platformColors: Record<string, string> = {
    WHATSAPP: '#25D366',
    INSTAGRAM: '#E1306C',
    FACEBOOK: '#0084FF',
  };

  const statusColors: Record<string, string> = {
    NEW: '#3b82f6',
    LEAD: '#f59e0b',
    QUALIFIED: '#10b981',
    CUSTOMER: '#8b5cf6',
    CHURNED: '#ef4444',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Contacts</h1>
          <p style={{ color: '#6b7280' }}>Manage your leads and customers</p>
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Add Contact
        </button>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '12px', 
        marginBottom: '24px' 
      }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Total</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{contacts.length}</p>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>New Leads</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{contacts.filter(c => c.status === 'NEW').length}</p>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Customers</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{contacts.filter(c => c.status === 'CUSTOMER').length}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            maxWidth: '400px',
          }}
        />
      </div>

      {/* Contacts List */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#6b7280', fontSize: '13px' }}>Contact</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#6b7280', fontSize: '13px' }}>Platform</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#6b7280', fontSize: '13px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#6b7280', fontSize: '13px' }}>Source</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#6b7280', fontSize: '13px' }}>Added</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: platformColors[contact.platform] || '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '500',
                        fontSize: '14px',
                      }}>
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', margin: 0 }}>{contact.name}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>{contact.platformId}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: `${platformColors[contact.platform]}15`,
                      color: platformColors[contact.platform],
                    }}>
                      {contact.platform}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: `${statusColors[contact.status]}15`,
                      color: statusColors[contact.status],
                    }}>
                      {contact.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '14px' }}>{contact.source}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '14px' }}>
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Contact Modal */}
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
            maxWidth: '450px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>Add New Contact</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contact name"
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="FACEBOOK">Facebook Messenger</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Platform ID</label>
                <input
                  type="text"
                  value={formData.platformId}
                  onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
                  placeholder="Phone number or user ID"
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="NEW">New</option>
                  <option value="LEAD">Lead</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="CHURNED">Churned</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="DIRECT">Direct Message</option>
                  <option value="STORY_REPLY">Story Reply</option>
                  <option value="AD">Ad</option>
                  <option value="SEARCH">Search</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
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
                onClick={handleCreateContact}
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
                Create Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
