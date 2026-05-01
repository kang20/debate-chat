import { apiClient } from './client';
import type { CreateRoomRequest, DebateRoom, JoinRoomRequest, RoomParticipant } from '@/types/room';
import type { PageResponse } from '@/types/api';

export const roomApi = {
  list: (params: { page?: number; size?: number; tag?: string; q?: string; status?: string }) =>
    apiClient.get<PageResponse<DebateRoom>>('/rooms', { params }).then((r) => r.data),

  get: (roomId: string) =>
    apiClient.get<DebateRoom>(`/rooms/${roomId}`).then((r) => r.data),

  create: (data: CreateRoomRequest) =>
    apiClient.post<DebateRoom>('/rooms', data).then((r) => r.data),

  close: (roomId: string) =>
    apiClient.post(`/rooms/${roomId}/close`),

  getParticipants: (roomId: string) =>
    apiClient.get<RoomParticipant[]>(`/rooms/${roomId}/participants`).then((r) => r.data),

  join: (roomId: string, data: JoinRoomRequest) =>
    apiClient.post(`/rooms/${roomId}/participants`, data),

  leave: (roomId: string) =>
    apiClient.delete(`/rooms/${roomId}/participants/me`),
};
