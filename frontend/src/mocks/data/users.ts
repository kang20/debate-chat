import type { User } from '@/types/user';

export const seedUsers: User[] = [
  {
    id: 'user-1',
    provider: 'GOOGLE',
    nickname: '김토론',
    avatarUrl: '',
    debateGrade: 'GOLD',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-04-20T12:00:00Z',
  },
  {
    id: 'user-2',
    provider: 'KAKAO',
    nickname: '이논리',
    avatarUrl: '',
    debateGrade: 'SILVER',
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-04-22T08:00:00Z',
  },
  {
    id: 'user-3',
    provider: 'GOOGLE',
    nickname: '박반박',
    avatarUrl: '',
    debateGrade: 'SILVER',
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-04-25T15:00:00Z',
  },
  {
    id: 'user-4',
    provider: 'KAKAO',
    nickname: '최찬반',
    avatarUrl: '',
    debateGrade: 'BRONZE',
    createdAt: '2026-03-12T14:00:00Z',
    updatedAt: '2026-04-28T09:00:00Z',
  },
  {
    id: 'user-5',
    provider: 'GOOGLE',
    nickname: '정중립',
    avatarUrl: '',
    debateGrade: 'BRONZE',
    createdAt: '2026-03-15T16:00:00Z',
    updatedAt: '2026-04-30T11:00:00Z',
  },
];

// OAuth mock code → userId mapping
export const seedOAuthCodes: Record<string, string> = {
  'mock-google-kim': 'user-1',
  'mock-kakao-lee': 'user-2',
  'mock-google-park': 'user-3',
  'mock-kakao-choi': 'user-4',
  'mock-google-jung': 'user-5',
};
