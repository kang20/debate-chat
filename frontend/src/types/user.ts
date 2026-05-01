export interface User {
  id: string;
  email: string;
  nickname: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
}
