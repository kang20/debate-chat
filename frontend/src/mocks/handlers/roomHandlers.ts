import { http, HttpResponse } from 'msw';
import { db } from '../db';

function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

export const roomHandlers = [
  http.get('/api/rooms', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '0');
    const size = Number(url.searchParams.get('size') || '9');
    const tag = url.searchParams.get('tag');
    const q = url.searchParams.get('q');
    const status = url.searchParams.get('status');

    let rooms = Array.from(db.rooms.values());
    if (tag) rooms = rooms.filter((r) => r.tags.some((t) => t.name === tag));
    if (q) rooms = rooms.filter((r) => r.title.includes(q) || r.description.includes(q));
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

    const body = (await request.json()) as { title: string; description: string; visibility: string; tags: string[] };
    const room = {
      id: db.nextId('room'),
      title: body.title,
      description: body.description,
      ownerId: user.id,
      ownerNickname: user.nickname,
      visibility: body.visibility as 'PUBLIC' | 'PRIVATE',
      status: 'OPEN' as const,
      tags: body.tags.map((name) => ({ id: db.nextId('tag'), name })),
      participantCount: 1,
      proCount: 0,
      conCount: 0,
      neutralCount: 1,
      createdAt: new Date().toISOString(),
      closedAt: null,
    };

    db.rooms.set(room.id, room);
    db.participants.push({
      id: db.nextId('p'),
      roomId: room.id,
      userId: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      side: 'NEUTRAL',
      joinedAt: new Date().toISOString(),
    });

    return HttpResponse.json(room, { status: 201 });
  }),

  http.post('/api/rooms/:roomId/close', ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const room = db.rooms.get(params.roomId as string);
    if (!room) return HttpResponse.json({ message: '토론방을 찾을 수 없습니다.' }, { status: 404 });
    if (room.ownerId !== user.id) return HttpResponse.json({ message: '권한이 없습니다.' }, { status: 403 });

    room.status = 'CLOSED';
    room.closedAt = new Date().toISOString();
    db.rooms.set(room.id, room);

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

    const existing = db.participants.find((p) => p.roomId === roomId && p.userId === user.id);
    if (existing) return HttpResponse.json({ message: '이미 참여 중입니다.' }, { status: 409 });

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

    const room = db.rooms.get(roomId);
    if (room) {
      room.participantCount++;
      if (body.side === 'PRO') room.proCount++;
      else if (body.side === 'CON') room.conCount++;
      else room.neutralCount++;
    }

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
