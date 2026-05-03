import { apiClient } from './client';
import type { Message, SendMessageRequest, EditMessageRequest, CursorPageResponse } from '@/types/message';
import type { ChatChannel } from '@/types/room';

export const messageApi = {
  list: (roomId: string, cursor?: string, channel?: ChatChannel) =>
    apiClient
      .get<CursorPageResponse<Message>>(`/rooms/${roomId}/messages`, {
        params: { ...(cursor ? { cursor } : {}), ...(channel ? { channel } : {}) },
      })
      .then((r) => r.data),

  send: (roomId: string, data: SendMessageRequest) =>
    apiClient.post<Message>(`/rooms/${roomId}/messages`, data).then((r) => r.data),

  edit: (messageId: string, data: EditMessageRequest) =>
    apiClient.patch<Message>(`/messages/${messageId}`, data).then((r) => r.data),

  delete: (messageId: string) =>
    apiClient.delete(`/messages/${messageId}`),
};
