import type { Message } from '@/types/message';

export const seedMessages: Message[] = [
  // Room 1 messages
  { id: 'msg-1', roomId: 'room-1', authorId: 'user-1', authorNickname: '김토론', authorAvatarUrl: '', content: 'AI 기술이 너무 빠르게 발전하고 있어서, 지금 규제 프레임워크를 만들지 않으면 늦습니다.', sideAtSend: 'PRO', createdAt: '2026-04-20T09:05:00Z', editedAt: null, deleted: false },
  { id: 'msg-2', roomId: 'room-1', authorId: 'user-3', authorNickname: '박반박', authorAvatarUrl: '', content: '하지만 기술의 방향성도 모르는 상태에서 성급한 규제는 혁신을 죽일 수 있어요.', sideAtSend: 'CON', createdAt: '2026-04-20T09:08:00Z', editedAt: null, deleted: false },
  { id: 'msg-3', roomId: 'room-1', authorId: 'user-2', authorNickname: '이논리', authorAvatarUrl: '', content: 'EU의 AI Act 사례를 보면, 위험 등급별로 규제하는 것이 가능합니다. 완전한 자유방임은 위험하죠.', sideAtSend: 'PRO', createdAt: '2026-04-20T09:12:00Z', editedAt: null, deleted: false },
  { id: 'msg-4', roomId: 'room-1', authorId: 'user-5', authorNickname: '정중립', authorAvatarUrl: '', content: '양쪽 말 다 일리가 있는데, 규제의 범위와 시점이 핵심인 것 같습니다.', sideAtSend: 'NEUTRAL', createdAt: '2026-04-20T09:15:00Z', editedAt: null, deleted: false },
  { id: 'msg-5', roomId: 'room-1', authorId: 'user-3', authorNickname: '박반박', authorAvatarUrl: '', content: '자율규제와 산업 가이드라인으로도 충분히 대응 가능하다고 봅니다.', sideAtSend: 'CON', createdAt: '2026-04-20T09:18:00Z', editedAt: null, deleted: false },
  { id: 'msg-6', roomId: 'room-1', authorId: 'user-1', authorNickname: '김토론', authorAvatarUrl: '', content: '자율규제는 기업의 이익과 충돌할 때 무력해집니다. 독립적인 감독 기구가 필요해요.', sideAtSend: 'PRO', createdAt: '2026-04-20T09:22:00Z', editedAt: null, deleted: false },
  { id: 'msg-7', roomId: 'room-1', authorId: 'user-2', authorNickname: '이논리', authorAvatarUrl: '', content: 'Deepfake, 자율주행 사고 등 이미 피해가 발생하고 있는 영역부터 우선 규제하면 됩니다.', sideAtSend: 'PRO', createdAt: '2026-04-20T09:25:00Z', editedAt: null, deleted: false },
  { id: 'msg-8', roomId: 'room-1', authorId: 'user-5', authorNickname: '정중립', authorAvatarUrl: '', content: '규제를 하되 기술 발전 속도에 맞춰 유연하게 업데이트하는 방식은 어떨까요?', sideAtSend: 'NEUTRAL', createdAt: '2026-04-20T09:28:00Z', editedAt: null, deleted: false },

  // Room 2 messages
  { id: 'msg-9', roomId: 'room-2', authorId: 'user-2', authorNickname: '이논리', authorAvatarUrl: '', content: '원격근무는 통근 시간 절약, 집중력 향상 등 생산성 측면에서 확실히 우위입니다.', sideAtSend: 'PRO', createdAt: '2026-04-22T14:05:00Z', editedAt: null, deleted: false },
  { id: 'msg-10', roomId: 'room-2', authorId: 'user-4', authorNickname: '최찬반', authorAvatarUrl: '', content: '하지만 팀 협업과 창의적 아이디어 교환은 대면에서 훨씬 효과적이에요.', sideAtSend: 'CON', createdAt: '2026-04-22T14:10:00Z', editedAt: null, deleted: false },
  { id: 'msg-11', roomId: 'room-2', authorId: 'user-5', authorNickname: '정중립', authorAvatarUrl: '', content: '하이브리드 근무가 두 장점을 모두 살릴 수 있는 방법 아닐까요?', sideAtSend: 'NEUTRAL', createdAt: '2026-04-22T14:15:00Z', editedAt: null, deleted: false },
  { id: 'msg-12', roomId: 'room-2', authorId: 'user-2', authorNickname: '이논리', authorAvatarUrl: '', content: '실제로 여러 연구에서 원격근무자의 만족도와 생산성이 더 높게 나타났습니다.', sideAtSend: 'PRO', createdAt: '2026-04-22T14:20:00Z', editedAt: null, deleted: false },
  { id: 'msg-13', roomId: 'room-2', authorId: 'user-4', authorNickname: '최찬반', authorAvatarUrl: '', content: '신입사원의 온보딩이나 멘토링은 원격으로 하기 매우 어렵습니다.', sideAtSend: 'CON', createdAt: '2026-04-22T14:25:00Z', editedAt: null, deleted: false },

  // Room 3 messages
  { id: 'msg-14', roomId: 'room-3', authorId: 'user-3', authorNickname: '박반박', authorAvatarUrl: '', content: '기본소득은 AI 시대에 일자리를 잃는 사람들의 안전망이 될 수 있습니다.', sideAtSend: 'PRO', createdAt: '2026-04-25T10:05:00Z', editedAt: null, deleted: false },
  { id: 'msg-15', roomId: 'room-3', authorId: 'user-4', authorNickname: '최찬반', authorAvatarUrl: '', content: '재원 마련이 현실적으로 불가능합니다. 세금 폭탄으로 이어질 수밖에 없어요.', sideAtSend: 'CON', createdAt: '2026-04-25T10:10:00Z', editedAt: null, deleted: false },
  { id: 'msg-16', roomId: 'room-3', authorId: 'user-1', authorNickname: '김토론', authorAvatarUrl: '', content: '핀란드 실험 결과, 기본소득 수급자들의 행복도와 건강이 개선되었습니다.', sideAtSend: 'PRO', createdAt: '2026-04-25T10:15:00Z', editedAt: null, deleted: false },
  { id: 'msg-17', roomId: 'room-3', authorId: 'user-2', authorNickname: '이논리', authorAvatarUrl: '', content: '하지만 고용률에는 유의미한 변화가 없었죠. 근로 의욕 저하 우려가 있습니다.', sideAtSend: 'CON', createdAt: '2026-04-25T10:20:00Z', editedAt: null, deleted: false },
  { id: 'msg-18', roomId: 'room-3', authorId: 'user-5', authorNickname: '정중립', authorAvatarUrl: '', content: '부분 기본소득이나 음의 소득세 같은 절충안도 검토해볼 가치가 있어 보입니다.', sideAtSend: 'NEUTRAL', createdAt: '2026-04-25T10:25:00Z', editedAt: null, deleted: false },
];
