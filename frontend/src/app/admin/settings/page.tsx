'use client';

import { useState } from 'react';
import { Save, Shield, Globe, Bell, Mail, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    siteName: 'KRYROS CHAT AGENT',
    siteUrl: 'https://kryros.com',
    supportEmail: 'support@business-support.com',
    defaultPlan: 'FREE',
    maxOrganizations: 100,
    enableRegistration: true,
    requireApproval: false,
    allowCustomDomains: true,
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    jwtSecret: '••••••••••••••••',
    jwtExpiry: '7d',
    maxUploadSize: '10mb',
    retentionDays: 365,
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'auth', label: 'Authentication', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure global platform settings
        </p>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic platform configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Platform Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) =>
                        setSettings({ ...settings, siteName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Platform URL</Label>
                    <Input
                      id="siteUrl"
                      value={settings.siteUrl}
                      onChange={(e) =>
                        setSettings({ ...settings, siteUrl: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, supportEmail: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultPlan">Default Plan</Label>
                    <select
                      id="defaultPlan"
                      className="w-full p-2 border rounded-lg"
                      value={settings.defaultPlan}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultPlan: e.target.value })
                      }
                    >
                      <option value="FREE">Free</option>
                      <option value="STARTER">Starter</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxOrgs">Max Organizations</Label>
                    <Input
                      id="maxOrgs"
                      type="number"
                      value={settings.maxOrganizations}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxOrganizations: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.enableRegistration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          enableRegistration: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span>Enable New Organization Registration</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.requireApproval}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requireApproval: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span>Require Admin Approval for New Organizations</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.allowCustomDomains}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          allowCustomDomains: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span>Allow Custom Domains</span>
                  </label>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Authentication Settings */}
          {activeTab === 'auth' && (
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>
                  Security and authentication configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jwtSecret">JWT Secret</Label>
                  <Input
                    id="jwtSecret"
                    type="password"
                    value={settings.jwtSecret}
                    onChange={(e) =>
                      setSettings({ ...settings, jwtSecret: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Keep this secure. Changing this will log out all users.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jwtExpiry">JWT Expiry</Label>
                  <select
                    id="jwtExpiry"
                    className="w-full p-2 border rounded-lg"
                    value={settings.jwtExpiry}
                    onChange={(e) =>
                      setSettings({ ...settings, jwtExpiry: e.target.value })
                    }
                  >
                    <option value="1h">1 Hour</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                  </select>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  SMTP configuration for outgoing emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.smtpHost}
                      onChange={(e) =>
                        setSettings({ ...settings, smtpHost: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtpPort: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpUser: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpPassword: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Storage Settings */}
          {activeTab === 'storage' && (
            <Card>
              <CardHeader>
                <CardTitle>Storage Settings</CardTitle>
                <CardDescription>
                  File storage and retention configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUpload">Max Upload Size</Label>
                  <select
                    id="maxUpload"
                    className="w-full p-2 border rounded-lg"
                    value={settings.maxUploadSize}
                    onChange={(e) =>
                      setSettings({ ...settings, maxUploadSize: e.target.value })
                    }
                  >
                    <option value="5mb">5 MB</option>
                    <option value="10mb">10 MB</option>
                    <option value="25mb">25 MB</option>
                    <option value="50mb">50 MB</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention">Data Retention (Days)</Label>
                  <Input
                    id="retention"
                    type="number"
                    value={settings.retentionDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        retentionDays: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Messages and data older than this will be automatically deleted.
                  </p>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Email and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>New Organization Registration</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>New User Signup</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Payment Received</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Daily Activity Report</span>
                  </label>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
