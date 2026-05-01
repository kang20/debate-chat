import { apiClient } from './client';
import type { LoginRequest, LoginResponse, SignupRequest, UpdateProfileRequest, User } from '@/types/user';

export const authApi = {
  signup: (data: SignupRequest) =>
    apiClient.post<User>('/auth/signup', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  logout: () =>
    apiClient.post('/auth/logout'),

  getMe: () =>
    apiClient.get<User>('/users/me').then((r) => r.data),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.patch<User>('/users/me', data).then((r) => r.data),

  getUser: (userId: string) =>
    apiClient.get<User>(`/users/${userId}`).then((r) => r.data),
};
