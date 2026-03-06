import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  
  setAuth: (user: User, organization: Organization, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  token: null,
  isAuthenticated: false,
  
  setAuth: (user, organization, token) => {
    localStorage.setItem('auth_token', token);
    set({ user, organization, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    set({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false,
    });
  },
  
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));

// UI State
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  selectedConversation: string | null;
  setSelectedConversation: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  selectedConversation: null,
  setSelectedConversation: (id) => set({ selectedConversation: id }),
}));

// Notifications
interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now().toString() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
