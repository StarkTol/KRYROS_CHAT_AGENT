'use client';

import { useState } from 'react';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const mockOrganizations = [
  {
    id: '1',
    name: 'Demo Business',
    slug: 'demo-business',
    email: 'admin@demo.com',
    plan: 'PROFESSIONAL',
    users: 3,
    contacts: 156,
    conversations: 450,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Acme Corp',
    slug: 'acme-corp',
    email: 'hello@acme.com',
    plan: 'STARTER',
    users: 5,
    contacts: 89,
    conversations: 234,
    status: 'active',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'TechStart Inc',
    slug: 'techstart',
    email: 'contact@techstart.io',
    plan: 'FREE',
    users: 2,
    contacts: 12,
    conversations: 34,
    status: 'active',
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: 'Global Services',
    slug: 'global-services',
    email: 'info@globalservices.com',
    plan: 'ENTERPRISE',
    users: 12,
    contacts: 1250,
    conversations: 3200,
    status: 'active',
    createdAt: '2024-01-10',
  },
];

const planColors: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-800',
  STARTER: 'bg-blue-100 text-blue-800',
  PROFESSIONAL: 'bg-purple-100 text-purple-800',
  ENTERPRISE: 'bg-gold-100 text-yellow-800',
};

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredOrgs = mockOrganizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            Manage all client organizations
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOrganizations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockOrganizations.filter((o) => o.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enterprise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mockOrganizations.filter((o) => o.plan === 'ENTERPRISE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockOrganizations.reduce((acc, o) => acc + o.contacts, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Organization
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Plan
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Users
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Contacts
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Conversations
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">{org.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${planColors[org.plan]}`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4">{org.users}</td>
                  <td className="py-3 px-4">{org.contacts.toLocaleString()}</td>
                  <td className="py-3 px-4">{org.conversations.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        org.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Add New Organization</CardTitle>
              <CardDescription>
                Create a new client organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Name</label>
                <Input placeholder="Acme Corp" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Email</label>
                <Input type="email" placeholder="admin@acme.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan</label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateModal(false)}>
                  Create Organization
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
