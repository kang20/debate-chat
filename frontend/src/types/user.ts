export type OAuthProvider = 'GOOGLE' | 'KAKAO';

export interface User {
  id: string;
  provider: OAuthProvider;
  nickname: string;
  avatarUrl: string;
  debateGrade: string;
  createdAt: string;
  updatedAt: string;
}

export interface OAuthSignupRequest {
  provider: OAuthProvider;
  code: string;
  nickname: string;
}

export interface OAuthLoginRequest {
  provider: OAuthProvider;
  code: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  nickname?: string;
  avatarUrl?: string;
}
