import type { Notification } from '@/types/notification';

export const seedNotifications: Notification[] = [
  {
    id: 'noti-1',
    userId: 'user-1',
    type: 'MENTION',
    payload: {
      roomId: 'room-1',
      roomTitle: 'AI 규제, 지금 당장 필요한가?',
      actorNickname: '박반박',
      messagePreview: '@김토론 님의 의견에 반대합니다...',
    },
    readAt: null,
    createdAt: '2026-04-30T10:00:00Z',
  },
  {
    id: 'noti-2',
    userId: 'user-1',
    type: 'ARGUMENT_REPLY',
    payload: {
      roomId: 'room-1',
      roomTitle: 'AI 규제, 지금 당장 필요한가?',
      actorNickname: '이논리',
      argumentId: 'arg-2',
    },
    readAt: null,
    createdAt: '2026-04-30T09:30:00Z',
  },
  {
    id: 'noti-3',
    userId: 'user-1',
    type: 'VOTE',
    payload: {
      roomId: 'room-1',
      roomTitle: 'AI 규제, 지금 당장 필요한가?',
      actorNickname: '정중립',
      argumentId: 'arg-1',
    },
    readAt: '2026-04-30T08:00:00Z',
    createdAt: '2026-04-29T20:00:00Z',
  },
  {
    id: 'noti-4',
    userId: 'user-1',
    type: 'ROOM_CLOSED',
    payload: {
      roomId: 'room-4',
      roomTitle: '소셜미디어가 민주주의에 미치는 영향',
      actorNickname: '최찬반',
    },
    readAt: '2026-04-29T12:00:00Z',
    createdAt: '2026-04-28T18:00:00Z',
  },
];
