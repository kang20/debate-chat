import { create } from 'zustand';
import { authApi } from '@/api/authApi';
import type { User, SignupRequest, LoginRequest, UpdateProfileRequest } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false,

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    set({ isLoading: true });
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(data);
      localStorage.setItem('token', res.token);
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      await authApi.signup(data);
      set({ isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    authApi.logout().catch(() => {});
  },

  fetchMe: async () => {
    const user = await authApi.getMe();
    set({ user, isAuthenticated: true });
  },

  updateProfile: async (data) => {
    const user = await authApi.updateProfile(data);
    set({ user });
  },
}));
