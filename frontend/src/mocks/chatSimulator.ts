import { db } from './db';
import type { Message } from '@/types/message';

const botResponses: Record<string, string[]> = {
  'room-1': [
    '규제 없이는 AI가 만든 가짜뉴스를 어떻게 구분할 수 있을까요?',
    'GDPR처럼 사후 규제 모델도 고려해볼 만합니다.',
    '기술 중립적인 원칙 기반 규제가 최선일 수 있습니다.',
    '스타트업에 대한 규제 면제 구간을 두는 건 어떨까요?',
    '이미 자율주행차로 인한 사고 사례가 나오고 있습니다.',
    '과도한 규제가 인재 유출을 야기할 수 있다는 점도 고려해야 합니다.',
  ],
  'room-2': [
    '원격근무 시 워라밸이 오히려 무너지는 경우도 많습니다.',
    '화상회의 피로감도 무시할 수 없는 문제입니다.',
    '사무실에서의 우연한 대화가 혁신으로 이어지는 경우가 많죠.',
    '결국 업무 성격에 따라 다르다고 봅니다.',
    '원격근무가 가능한 직종에서는 확실히 효율적입니다.',
  ],
  'room-3': [
    '알래스카 영구기금 배당이 좋은 사례가 될 수 있습니다.',
    '기존 복지 체계와의 통합 방안도 논의되어야 합니다.',
    '로봇세를 재원으로 활용하는 방안은 어떨까요?',
    '기본소득보다 기본서비스(교육, 의료) 보장이 더 효율적일 수 있습니다.',
    '파일럿 프로그램부터 시작하는 것이 현실적입니다.',
  ],
};

const defaultResponses = [
  '흥미로운 관점이네요. 좀 더 자세히 설명해주시겠어요?',
  '동의합니다. 다만 다른 시각도 고려해봐야 할 것 같습니다.',
  '근거 자료가 있다면 더 설득력이 있을 것 같습니다.',
  '양쪽 모두 일리가 있는 것 같습니다.',
];

export class ChatSimulator {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private roomId: string | null = null;

  start(roomId: string) {
    this.stop();
    this.roomId = roomId;

    this.intervalId = setInterval(() => {
      if (!this.roomId) return;

      const participants = db.getParticipantsForRoom(this.roomId);
      const currentUserId = Array.from(db.sessions.values())[0];
      const botParticipants = participants.filter((p) => p.userId !== currentUserId);

      if (botParticipants.length === 0) return;

      const randomBot = botParticipants[Math.floor(Math.random() * botParticipants.length)];
      const responses = botResponses[this.roomId] || defaultResponses;
      const content = responses[Math.floor(Math.random() * responses.length)];

      const message: Message = {
        id: db.nextId('msg'),
        roomId: this.roomId,
        authorId: randomBot.userId,
        authorNickname: randomBot.nickname,
        authorAvatarUrl: randomBot.avatarUrl,
        content,
        sideAtSend: randomBot.side,
        createdAt: new Date().toISOString(),
        editedAt: null,
        deleted: false,
      };

      db.messages.push(message);
      window.dispatchEvent(
        new CustomEvent('mock-new-message', { detail: { roomId: this.roomId, message } })
      );
    }, 4000 + Math.random() * 6000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.roomId = null;
  }
}

export const chatSimulator = new ChatSimulator();
