import { create } from 'zustand';
import { notificationApi } from '@/api/notificationApi';
import type { Notification, NotificationPreference } from '@/types/notification';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreference[];
  page: number;
  totalPages: number;
  isLoading: boolean;

  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: NotificationPreference[]) => Promise<void>;
  addIncomingNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: [],
  page: 0,
  totalPages: 0,
  isLoading: false,

  fetchNotifications: async (unreadOnly) => {
    set({ isLoading: true });
    try {
      const { page } = get();
      const res = await notificationApi.list({ page, unreadOnly });
      const unreadCount = res.content.filter((n) => !n.readAt).length;
      set({
        notifications: res.content,
        totalPages: res.totalPages,
        unreadCount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    await notificationApi.markRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await notificationApi.markAllRead();
    set((s) => ({
      notifications: s.notifications.map((n) => ({
        ...n,
        readAt: n.readAt || new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
  },

  fetchPreferences: async () => {
    const preferences = await notificationApi.getPreferences();
    set({ preferences });
  },

  updatePreferences: async (prefs) => {
    await notificationApi.updatePreferences(prefs);
    set({ preferences: prefs });
  },

  addIncomingNotification: (notification) => {
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    }));
  },
}));
