import { http, HttpResponse } from 'msw';
import { db } from '../db';

function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

export const argumentHandlers = [
  http.get('/api/rooms/:roomId/arguments', ({ params }) => {
    const tree = db.getArgumentsForRoom(params.roomId as string);
    return HttpResponse.json(tree);
  }),

  http.post('/api/rooms/:roomId/arguments', async ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const roomId = params.roomId as string;
    const body = (await request.json()) as { parentId?: string; stance: string; content: string };

    const argument = {
      id: db.nextId('arg'),
      roomId,
      parentId: body.parentId || null,
      stance: body.stance as 'PRO' | 'CON',
      authorId: user.id,
      authorNickname: user.nickname,
      content: body.content,
      agreeCount: 0,
      disagreeCount: 0,
      myVote: null,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
    };

    if (body.parentId) {
      const parent = db.findArgumentById(body.parentId);
      if (parent) {
        parent.children.push(argument);
      }
    } else {
      db.arguments.push(argument);
    }

    return HttpResponse.json(argument, { status: 201 });
  }),

  http.post('/api/arguments/:argumentId/votes', async ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const arg = db.findArgumentById(params.argumentId as string);
    if (!arg) return HttpResponse.json({ message: '논거를 찾을 수 없습니다.' }, { status: 404 });

    const body = (await request.json()) as { value: string };

    if (arg.myVote === 'AGREE') arg.agreeCount--;
    if (arg.myVote === 'DISAGREE') arg.disagreeCount--;

    arg.myVote = body.value as 'AGREE' | 'DISAGREE';
    if (body.value === 'AGREE') arg.agreeCount++;
    if (body.value === 'DISAGREE') arg.disagreeCount++;

    return HttpResponse.json({ value: body.value });
  }),

  http.delete('/api/arguments/:argumentId/votes/me', ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const arg = db.findArgumentById(params.argumentId as string);
    if (!arg) return HttpResponse.json({ message: '논거를 찾을 수 없습니다.' }, { status: 404 });

    if (arg.myVote === 'AGREE') arg.agreeCount--;
    if (arg.myVote === 'DISAGREE') arg.disagreeCount--;
    arg.myVote = null;

    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('/api/arguments/:argumentId', ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const arg = db.findArgumentById(params.argumentId as string);
    if (!arg) return HttpResponse.json({ message: '논거를 찾을 수 없습니다.' }, { status: 404 });
    if (arg.authorId !== user.id) return HttpResponse.json({ message: '권한이 없습니다.' }, { status: 403 });

    arg.deleted = true;
    arg.content = '';

    return new HttpResponse(null, { status: 204 });
  }),
];
