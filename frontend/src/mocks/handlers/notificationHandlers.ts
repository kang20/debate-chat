import { http, HttpResponse } from 'msw';
import { db } from '../db';

function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

export const notificationHandlers = [
  http.get('/api/notifications', ({ request }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const page = Number(url.searchParams.get('page') || '0');
    const size = 10;

    let notifications = db.getNotificationsForUser(user.id);
    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.readAt);
    }

    const start = page * size;
    const content = notifications.slice(start, start + size);

    return HttpResponse.json({
      content,
      totalElements: notifications.length,
      totalPages: Math.ceil(notifications.length / size),
      number: page,
      size,
    });
  }),

  http.post('/api/notifications/:id/read', ({ request, params }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    const noti = db.notifications.find((n) => n.id === params.id && n.userId === user.id);
    if (noti) noti.readAt = new Date().toISOString();

    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/notifications/read-all', ({ request }) => {
    const token = extractToken(request);
    const user = token ? db.getUserByToken(token) : null;
    if (!user) return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

    db.notifications
      .filter((n) => n.userId === user.id && !n.readAt)
      .forEach((n) => { n.readAt = new Date().toISOString(); });

    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/notifications/preferences', ({ request }) => {
    const token = extractToken(request);
    if (!token || !db.getUserByToken(token)) {
      return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
    }

    return HttpResponse.json([
      { type: 'MENTION', enabled: true },
      { type: 'REPLY', enabled: true },
      { type: 'NEW_MESSAGE', enabled: false },
      { type: 'ARGUMENT_REPLY', enabled: true },
      { type: 'VOTE', enabled: true },
      { type: 'ROOM_CLOSED', enabled: true },
    ]);
  }),

  http.put('/api/notifications/preferences', async ({ request }) => {
    const token = extractToken(request);
    if (!token || !db.getUserByToken(token)) {
      return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
