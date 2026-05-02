import type { Message } from '@/types/message';

export const seedMessages: Message[] = [
  // System messages
  { id: 'sys-1', roomId: 'room-1', authorId: 'system', authorNickname: '시스템', authorAvatarUrl: '', content: '토론이 생성되었습니다. 참여자를 모집 중입니다. 찬성 또는 반대 입장을 선택해 참여해주세���.', sideAtSend: 'NEUTRAL', channel: 'DEBATE', isSystem: true, createdAt: '2026-04-20T09:00:00Z', editedAt: null, deleted: false },
  { id: 'sys-2', roomId: 'room-1', authorId: 'system', authorNickname: '시스템', authorAvatarUrl: '', content: '입론 단계가 시작되었습니다. 각 팀은 핵심 주장과 근거를 발표해주세요.', sideAtSend: 'NEUTRAL', channel: 'DEBATE', isSystem: true, createdAt: '2026-04-20T10:00:00Z', editedAt: null, deleted: false },
  { id: 'sys-3', roomId: 'room-1', authorId: 'system', authorNickname: '시스템', authorAvatarUrl: '', content: '반론 단계입니다. 상대 팀의 주장에 반박하고 질문해주세요.', sideAtSend: 'NEUTRAL', channel: 'DEBATE', isSystem: true, createdAt: '2026-04-20T10:30:00Z', editedAt: null, deleted: false },

  // Room 1 debate messages
  { id: 'msg-1', roomId: 'room-1', authorId: 'user-2', authorNickname: '이논리', authorAvatarUrl: '', content: 'AI 기술이 너무 빠르게 발전하고 있어서, 지금 규제 프레임워크를 만들지 않으면 늦습니다.', sideAtSend: 'PRO', channel: 'DEBATE', isSystem: false, createdAt: '2026-04-20T10:05:00Z', editedAt: null, deleted: false },
  { id: 'msg-2', roomId: 'room-1', authorId: 'user-3', authorNickname: '박반박', authorAvatarUrl: '', content: '하지만 기술의 방향성도 모르는 상태에서 성급한 규제는 혁신을 죽일 수 있어요.', sideAtSend: 'CON', channel: 'DEBATE', isSystem: false, createdAt: '2026-04-20T10:08:00Z', editedAt: null, deleted: false },
  { id: 'msg-3', roomId: 'room-1', authorId: 'user-2', authorNickname: '이논리', authorAvatarUrl: '', content: 'EU의 AI Act 사례를 보면, 위험 등급별로 규제하는 것이 가능합니다. 완전한 자유방임은 위험하죠.', sideAtSend: 'PRO', channel: 'DEBATE', isSystem: false, createdAt: '2026-04-20T10:32:00Z', editedAt: null, deleted: false },
  { id: 'msg-5', roomId: 'room-1', authorId: 'user-3', authorNickname: '박반박', authorAvatarUrl: '', content: '자율규제와 산업 가이드라인으로도 충분히 대응 가능하다고 봅니다.', sideAtSend: 'CON', channel: 'DEBATE', isSystem: false, createdAt: '2026-04-20T10:35:00Z', editedAt: null, deleted: false },
  { id: 'msg-7', roomId: 'room-1', authorId: 'user-2', authorNickname: '이논리', authorAvatarUrl: '', content: 'Deepfake, 자율주행 사고 등 이미 피해가 발생하고 있는 영역부터 우선 규제하면 됩니다.', sideAtSend: 'PRO', channel: 'DEBATE', isSystem: false, createdAt: '2026-04-20T10:38:00Z', editedAt: null, deleted: false },

  // Room 1 neutral messages
  { id: 'msg-4', roomId: 'room-1', authorId: 'user-5', authorNickname: '정중립', authorAvatarUrl: '', content: '양쪽 말 다 일리가 있는데, 규제의 범위와 시점이 핵심인 것 같습니다.', sideAtSend: 'NEUTRAL', channel: 'NEUTRAL', isSystem: false, createdAt: '2026-04-20T10:15:00Z', editedAt: null, deleted: false },
  { id: 'msg-8', roomId: 'room-1', authorId: 'user-5', authorNickname: '정중립', authorAvatarUrl: '', content: '규제를 하되 기술 발전 속도에 맞춰 유연하게 업데이트하는 방식은 어떨까요?', sideAtSend: 'NEUTRAL', channel: 'NEUTRAL', isSystem: false, createdAt: '2026-04-20T10:28:00Z', editedAt: null, deleted: false },

  // Room 2 system + debate messages
  { id: 'sys-4', roomId: 'room-2', authorId: 'system', authorNickname: '시스템', authorAvatarUrl: '', content: '토론이 생성되었습니다. 참여자를 모집 중입니다.', sideAtSend: 'NEUTRAL', channel: 'DEBATE', isSystem: true, createdAt: '2026-04-22T14:00:00Z', editedAt: null, deleted: false },
  { id: 'sys-5', roomId: 'room-2', authorId: 'system', authorNickname: '시스템', authorAvatarUrl: '', content: '입론 단계가 시작되었습니다. 각 팀은 핵심 주장과 근거를 발표해주세요.', sideAtSend: 'NEUTRAL', channel: 'DEBATE', isSystem: true, createdAt: '2026-04-22T15:00:00Z', editedAt: null, deleted: false },
  { id: 'msg-10', roomId: 'room-2', authorId: 'user-4', authorNickname: '최찬반', authorAvatarUrl: '', content: '하지만 팀 협업과 창의적 아이디어 교환은 대면에서 훨씬 효과적이에요.', sideAtSend: 'CON', channel: 'DEBATE', isSystem: false, createdAt: '2026-04-22T15:10:00Z', editedAt: null, deleted: false },
  { id: 'msg-13', roomId: 'room-2', authorId: 'user-4', authorNickname: '최찬반', authorAvatarUrl: '', content: '신입사원의 온보딩이나 멘토링은 원격으로 하기 매우 어렵습니다.', sideAtSend: 'CON', channel: 'DEBATE', isSystem: false, createdAt: '2026-04-22T15:25:00Z', editedAt: null, deleted: false },

  // Room 2 neutral messages
  { id: 'msg-11', roomId: 'room-2', authorId: 'user-5', authorNickname: '정중립', authorAvatarUrl: '', content: '하이브리드 근무가 두 장점을 모두 살릴 수 있는 방법 아닐까요?', sideAtSend: 'NEUTRAL', channel: 'NEUTRAL', isSystem: false, createdAt: '2026-04-22T15:15:00Z', editedAt: null, deleted: false },

  // Room 3 system message (RECRUITING)
  { id: 'sys-6', roomId: 'room-3', authorId: 'system', authorNickname: '시스템', authorAvatarUrl: '', content: '토론이 생성되었습니다. 참여자를 모집 중입니다. 찬성 또는 반대 입장을 선택해 참여해주세요.', sideAtSend: 'NEUTRAL', channel: 'DEBATE', isSystem: true, createdAt: '2026-04-25T10:00:00Z', editedAt: null, deleted: false },

  // Room 3 neutral messages (모집 단계에서 중립 채팅만 가능)
  { id: 'msg-18', roomId: 'room-3', authorId: 'user-5', authorNickname: '정중립', authorAvatarUrl: '', content: '부분 기본소득이나 음의 소득세 같은 절충안도 검토해볼 가치가 있어 보입니다.', sideAtSend: 'NEUTRAL', channel: 'NEUTRAL', isSystem: false, createdAt: '2026-04-25T10:25:00Z', editedAt: null, deleted: false },
];
