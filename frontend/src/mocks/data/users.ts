import type { User } from '@/types/user';

export const seedUsers: User[] = [
  {
    id: 'user-1',
    email: 'kim@example.com',
    nickname: '김토론',
    bio: '정치철학과 사회문제에 관심이 많습니다.',
    avatarUrl: '',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-04-20T12:00:00Z',
  },
  {
    id: 'user-2',
    email: 'lee@example.com',
    nickname: '이논리',
    bio: 'IT 업계 개발자. 기술 윤리에 대해 고민합니다.',
    avatarUrl: '',
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-04-22T08:00:00Z',
  },
  {
    id: 'user-3',
    email: 'park@example.com',
    nickname: '박반박',
    bio: '환경과학 전공. 지속가능한 발전을 꿈꿉니다.',
    avatarUrl: '',
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-04-25T15:00:00Z',
  },
  {
    id: 'user-4',
    email: 'choi@example.com',
    nickname: '최찬반',
    bio: '경영학도. 경제 정책에 관심이 있습니다.',
    avatarUrl: '',
    createdAt: '2026-03-12T14:00:00Z',
    updatedAt: '2026-04-28T09:00:00Z',
  },
  {
    id: 'user-5',
    email: 'jung@example.com',
    nickname: '정중립',
    bio: '다양한 시각에서 사안을 바라보려 합니다.',
    avatarUrl: '',
    createdAt: '2026-03-15T16:00:00Z',
    updatedAt: '2026-04-30T11:00:00Z',
  },
];

export const seedPasswords: Record<string, string> = {
  'kim@example.com': 'password123',
  'lee@example.com': 'password123',
  'park@example.com': 'password123',
  'choi@example.com': 'password123',
  'jung@example.com': 'password123',
};
