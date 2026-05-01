import { http, HttpResponse } from 'msw';
import { db } from '../db';

function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

export const authHandlers = [
  http.post('/api/auth/signup', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; nickname: string };

    if (db.getUserByEmail(body.email)) {
      return HttpResponse.json({ message: '이미 사용 중인 이메일입니다.' }, { status: 409 });
    }

    const user = {
      id: db.nextId('user'),
      email: body.email,
      nickname: body.nickname,
      bio: '',
      avatarUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.set(user.id, user);
    db.passwords.set(body.email, body.password);

    return HttpResponse.json(user, { status: 201 });
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    const user = db.getUserByEmail(body.email);
    if (!user || db.passwords.get(body.email) !== body.password) {
      return HttpResponse.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    const token = `mock-token-${user.id}-${Date.now()}`;
    db.sessions.set(token, user.id);

    return HttpResponse.json({ token, user });
  }),

  http.post('/api/auth/logout', ({ request }) => {
    const token = extractToken(request);
    if (token) db.sessions.delete(token);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/users/me', ({ request }) => {
    const token = extractToken(request);
    if (!token) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const user = db.getUserByToken(token);
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    return HttpResponse.json(user);
  }),

  http.patch('/api/users/me', async ({ request }) => {
    const token = extractToken(request);
    if (!token) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const user = db.getUserByToken(token);
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const body = (await request.json()) as Record<string, string>;
    const updated = { ...user, ...body, updatedAt: new Date().toISOString() };
    db.users.set(user.id, updated);

    return HttpResponse.json(updated);
  }),

  http.get('/api/users/:userId', ({ params }) => {
    const user = db.users.get(params.userId as string);
    if (!user) return HttpResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    return HttpResponse.json(user);
  }),
];
