import { apiClient } from './client';
import type { Notification, NotificationPreference } from '@/types/notification';
import type { PageResponse } from '@/types/api';

export const notificationApi = {
  list: (params: { page?: number; unreadOnly?: boolean }) =>
    apiClient
      .get<PageResponse<Notification>>('/notifications', { params })
      .then((r) => r.data),

  markRead: (id: string) =>
    apiClient.post(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.post('/notifications/read-all'),

  getPreferences: () =>
    apiClient.get<NotificationPreference[]>('/notifications/preferences').then((r) => r.data),

  updatePreferences: (prefs: NotificationPreference[]) =>
    apiClient.put('/notifications/preferences', prefs),
};
