import { http, HttpResponse } from 'msw';
import { db } from '../db';
import type { DebatePhase } from '@/types/room';

function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

const phaseOrder: DebatePhase[] = ['RECRUITING', 'OPENING', 'REBUTTAL', 'CLOSING'];

const phaseMessages: Record<string, string> = {
  OPENING: '입론 단계가 시작되었습니다. 각 팀은 핵심 주장과 근거를 발표해주세요. 논거 트리에 루트 논거를 등록하는 것을 권장합니다.',
  REBUTTAL: '반론 단계입니다. 상대 팀의 주장에 반박하고 질문해주세요. 상대 논거에 답글 논거를 달아보세요.',
  CLOSING: '최종 변론입니다. 지금까지의 논의를 정리하고 마무리 발언을 해주세요.',
};

function addSystemMessage(roomId: string, content: string) {
  db.messages.push({
    id: db.nextId('sys'),
    roomId,
    authorId: 'system',
    authorNickname: '시스템',
    authorAvatarUrl: '',
    content,
    sideAtSend: 'NEUTRAL',
    channel: 'DEBATE',
    isSystem: true,
    createdAt: new Date().toISOString(),
    editedAt: null,
    deleted: false,
  });
}

export const roomHandlers = [
  http.get('/api/rooms', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '0');
    const size = Number(url.searchParams.get('size') || '9');
    const tag = url.searchParams.get('tag');
    const status = url.searchParams.get('status');

    let rooms = Array.from(db.rooms.values());
    if (tag) rooms = rooms.filter((r) => r.tags.some((t) => t.name === tag));
    if (status) rooms = rooms.filter((r) => r.status === status);

    rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const start = page * size;
    const content = rooms.slice(start, start + size);

    return HttpResponse.json({
      content,
      totalElements: rooms.length,
      totalPages: Math.ceil(rooms.length / size),
      number: page,
      size,
    });
  }),

  http.get('/api/rooms/:roomId', ({ params }) => {
    const room = db.rooms.get(params.roomId as string);
    if (!room) return HttpResponse.json({ message: '토론방을 찾을 수 없습니다.' }, { status: 404 });
    return HttpResponse.json(room);
  }),

  http.post('/api/rooms', async ({ request }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const body = (await request.json()) as {
      title: string; description: string; tags: string[];
      minParticipants: number; maxParticipants: number; startTime: string;
    };

    const room = {
      id: db.nextId('room'),
      title: body.title,
      description: body.description,
      moderatorId: user.id,
      moderatorNickname: user.nickname,
      status: 'RECRUITING' as const,
      phase: 'RECRUITING' as const,
      tags: body.tags.map((name) => ({ id: db.nextId('tag'), name })),
      minParticipants: body.minParticipants,
      maxParticipants: body.maxParticipants,
      startTime: body.startTime,
      participantCount: 0,
      proCount: 0,
      conCount: 0,
      neutralCount: 0,
      createdAt: new Date().toISOString(),
      closedAt: null,
    };

    db.rooms.set(room.id, room);
    addSystemMessage(room.id, '토론이 생성되었습니다. 참여자를 모집 중입니다. 찬성 또는 반대 입장을 선택해 참여해주세요.');

    return HttpResponse.json(room, { status: 201 });
  }),

  http.post('/api/rooms/:roomId/advance-phase', ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const room = db.rooms.get(params.roomId as string);
    if (!room) return HttpResponse.json({ message: '토론방을 찾을 수 없습니다.' }, { status: 404 });
    if (room.moderatorId !== user.id) return HttpResponse.json({ message: '진행자만 단계를 전환할 수 있습니다.' }, { status: 403 });

    const currentIdx = phaseOrder.indexOf(room.phase);
    if (currentIdx === -1 || currentIdx >= phaseOrder.length - 1) {
      return HttpResponse.json({ message: '더 이상 전환할 단계가 없습니다.' }, { status: 400 });
    }

    const nextPhase = phaseOrder[currentIdx + 1];
    room.phase = nextPhase;

    if (room.status === 'RECRUITING') {
      room.status = 'IN_PROGRESS';
    }

    db.rooms.set(room.id, room);

    const msg = phaseMessages[nextPhase];
    if (msg) addSystemMessage(room.id, msg);

    return HttpResponse.json(room);
  }),

  http.post('/api/rooms/:roomId/close', ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const room = db.rooms.get(params.roomId as string);
    if (!room) return HttpResponse.json({ message: '토론방을 찾을 수 없습니다.' }, { status: 404 });
    if (room.moderatorId !== user.id) return HttpResponse.json({ message: '권한이 없습니다.' }, { status: 403 });

    room.status = 'CLOSED';
    room.closedAt = new Date().toISOString();
    db.rooms.set(room.id, room);

    addSystemMessage(room.id, '토론이 종료되었습니다. 더 이상 새 메시지나 논거를 추가할 수 없습니다. 투표 결과를 확인해보세요.');

    return HttpResponse.json(room);
  }),

  http.get('/api/rooms/:roomId/participants', ({ params }) => {
    const participants = db.getParticipantsForRoom(params.roomId as string);
    return HttpResponse.json(participants);
  }),

  http.post('/api/rooms/:roomId/participants', async ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const roomId = params.roomId as string;
    const body = (await request.json()) as { side: string };
    const room = db.rooms.get(roomId);
    if (!room) return HttpResponse.json({ message: '토론방을 찾을 수 없습니다.' }, { status: 404 });

    const existing = db.participants.find((p) => p.roomId === roomId && p.userId === user.id);
    if (existing) return HttpResponse.json({ message: '이미 참여 중입니다.' }, { status: 409 });

    if (body.side === 'PRO' || body.side === 'CON') {
      const proConCount = room.proCount + room.conCount;
      if (proConCount >= room.maxParticipants) {
        return HttpResponse.json({ message: '찬반 참여 인원이 상한에 도달했습니다.' }, { status: 400 });
      }
    }

    const participant = {
      id: db.nextId('p'),
      roomId,
      userId: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      side: body.side as 'PRO' | 'CON' | 'NEUTRAL',
      joinedAt: new Date().toISOString(),
    };

    db.participants.push(participant);

    room.participantCount++;
    if (body.side === 'PRO') room.proCount++;
    else if (body.side === 'CON') room.conCount++;
    else room.neutralCount++;

    return HttpResponse.json(participant, { status: 201 });
  }),

  http.delete('/api/rooms/:roomId/participants/me', ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const roomId = params.roomId as string;
    const idx = db.participants.findIndex((p) => p.roomId === roomId && p.userId === user.id);
    if (idx === -1) return HttpResponse.json({ message: '참여하지 않은 토론방입니다.' }, { status: 404 });

    const [removed] = db.participants.splice(idx, 1);
    const room = db.rooms.get(roomId);
    if (room) {
      room.participantCount--;
      if (removed.side === 'PRO') room.proCount--;
      else if (removed.side === 'CON') room.conCount--;
      else room.neutralCount--;
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
