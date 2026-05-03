import { http, HttpResponse } from 'msw';
import { db } from '../db';
import type { ChatChannel } from '@/types/room';

function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

export const messageHandlers = [
  http.get('/api/rooms/:roomId/messages', ({ request, params }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const channel = url.searchParams.get('channel') as ChatChannel | null;
    const roomId = params.roomId as string;

    const allMessages = db.getMessagesForRoom(roomId, channel ?? undefined);
    const pageSize = 20;

    let startIdx = 0;
    if (cursor) {
      const cursorIdx = allMessages.findIndex((m) => m.id === cursor);
      startIdx = cursorIdx > 0 ? cursorIdx : 0;
    } else {
      startIdx = Math.max(0, allMessages.length - pageSize);
    }

    const content = allMessages.slice(startIdx, startIdx + pageSize);
    const hasMore = startIdx > 0;
    const nextCursor = hasMore ? allMessages[startIdx - 1]?.id ?? null : null;

    return HttpResponse.json({ content, hasMore, nextCursor });
  }),

  http.post('/api/rooms/:roomId/messages', async ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const roomId = params.roomId as string;
    const body = (await request.json()) as { content: string; channel: ChatChannel };

    const participant = db.participants.find((p) => p.roomId === roomId && p.userId === user.id);
    if (!participant) return HttpResponse.json({ message: '토론방에 먼저 참여해주세요.' }, { status: 403 });

    const message = {
      id: db.nextId('msg'),
      roomId,
      authorId: user.id,
      authorNickname: user.nickname,
      authorAvatarUrl: user.avatarUrl,
      content: body.content,
      sideAtSend: participant.side,
      channel: body.channel,
      isSystem: false,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deleted: false,
    };

    db.messages.push(message);
    return HttpResponse.json(message, { status: 201 });
  }),

  http.patch('/api/messages/:messageId', async ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const msg = db.messages.find((m) => m.id === params.messageId);
    if (!msg) return HttpResponse.json({ message: '메시지를 찾을 수 없습니다.' }, { status: 404 });
    if (msg.authorId !== user.id) return HttpResponse.json({ message: '권한이 없습니다.' }, { status: 403 });

    const body = (await request.json()) as { content: string };
    msg.content = body.content;
    msg.editedAt = new Date().toISOString();

    return HttpResponse.json(msg);
  }),

  http.delete('/api/messages/:messageId', ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const msg = db.messages.find((m) => m.id === params.messageId);
    if (!msg) return HttpResponse.json({ message: '메시지를 찾을 수 없습니다.' }, { status: 404 });
    if (msg.authorId !== user.id) return HttpResponse.json({ message: '권한이 없습니다.' }, { status: 403 });

    msg.deleted = true;
    msg.content = '';

    return new HttpResponse(null, { status: 204 });
  }),
];
