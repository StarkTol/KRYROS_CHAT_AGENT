import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://kryroschatagentbackend.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// Conversations API
export const conversationsApi = {
  list: (params?: {
    status?: string;
    platform?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/conversations', { params }),
  get: (id: string) => api.get(`/conversations/${id}`),
  stats: () => api.get('/conversations/stats'),
  assign: (id: string, agentId: string) =>
    api.patch(`/conversations/${id}/assign`, { agentId }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/conversations/${id}/status`, { status }),
  updatePriority: (id: string, priority: string) =>
    api.patch(`/conversations/${id}/priority`, { priority }),
  markAsRead: (id: string) => api.patch(`/conversations/${id}/read`),
};

// Messages API
export const messagesApi = {
  list: (conversationId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/messages/conversation/${conversationId}`, { params }),
  send: (conversationId: string, content: string) =>
    api.post(`/messages/send/${conversationId}`, { content }),
};

// Contacts API
export const contactsApi = {
  list: (params?: {
    status?: string;
    platform?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/contacts', { params }),
  get: (id: string) => api.get(`/contacts/${id}`),
  create: (data: {
    name: string;
    platform: string;
    platformId: string;
    notes?: string;
    status?: string;
    tags?: string[];
  }) => api.post('/contacts', data),
  update: (id: string, data: Partial<{
    name: string;
    notes: string;
    status: string;
    tags: string[];
  }>) => api.patch(`/contacts/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/contacts/${id}/status`, { status }),
  archive: (id: string) => api.patch(`/contacts/${id}/archive`),
  block: (id: string) => api.patch(`/contacts/${id}/block`),
  stats: () => api.get('/contacts/stats'),
};

// Automation API
export const automationApi = {
  list: () => api.get('/automation'),
  get: (id: string) => api.get(`/automation/${id}`),
  create: (data: {
    name: string;
    description?: string;
    trigger: string;
    conditions?: any[];
    action: string;
    replyContent?: string;
    delayMinutes?: number;
  }) => api.post('/automation', data),
  update: (id: string, data: Partial<{}>) => api.patch(`/automation/${id}`, data),
  delete: (id: string) => api.delete(`/automation/${id}`),
  toggle: (id: string) => api.patch(`/automation/${id}/toggle`),
  stats: () => api.get('/automation/stats'),
};

// Settings API
export const settingsApi = {
  dashboard: () => api.get('/settings/dashboard'),
  business: () => api.get('/settings/business'),
  updateBusiness: (data: Partial<{
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    businessAddress: string;
    website: string;
    description: string;
    timezone: string;
    defaultAutoReply: string;
  }>) => api.patch('/settings/business', data),
  platforms: () => api.get('/settings/platforms'),
  connectPlatform: (platform: string, data: any) =>
    api.post(`/settings/platforms/${platform}/connect`, data),
  disconnectPlatform: (platform: string) =>
    api.post(`/settings/platforms/${platform}/disconnect`),
  testPlatform: (platform: string) =>
    api.post(`/settings/platforms/${platform}/test`),
  businessHours: () => api.get('/settings/business-hours'),
  updateBusinessHours: (hours: any[]) =>
    api.patch('/settings/business-hours', hours),
  organization: () => api.get('/settings/organization'),
  team: () => api.get('/settings/team'),
  inviteTeamMember: (data: { email: string; name: string; role: string }) =>
    api.post('/settings/team/invite', data),
};
