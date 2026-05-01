import { apiClient } from './client';
import type { Argument, CreateArgumentRequest, VoteRequest } from '@/types/argument';

export const argumentApi = {
  getTree: (roomId: string) =>
    apiClient.get<Argument[]>(`/rooms/${roomId}/arguments`).then((r) => r.data),

  create: (roomId: string, data: CreateArgumentRequest) =>
    apiClient.post<Argument>(`/rooms/${roomId}/arguments`, data).then((r) => r.data),

  edit: (argumentId: string, content: string) =>
    apiClient.patch<Argument>(`/arguments/${argumentId}`, { content }).then((r) => r.data),

  delete: (argumentId: string) =>
    apiClient.delete(`/arguments/${argumentId}`),

  vote: (argumentId: string, data: VoteRequest) =>
    apiClient.post(`/arguments/${argumentId}/votes`, data),

  removeVote: (argumentId: string) =>
    apiClient.delete(`/arguments/${argumentId}/votes/me`),
};
