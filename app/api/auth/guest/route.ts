import {
  createSession,
  getAuthenticatedUser,
  hashToken,
} from '@/lib/server/auth';
import { freeChatEnabled } from '@/lib/server/chat-access';
import { getDatabase } from '@/lib/server/database';
import { apiError, assertSameOrigin, HttpError, json } from '@/lib/server/http';
import { consumeLimit } from '@/lib/server/rate-limit';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!freeChatEnabled()) throw new HttpError(403, 'Гостьовий доступ вимкнено.');

    const existing = await getAuthenticatedUser(request.headers);
    if (existing) return json({ ok: true });

    // Creating new guest identities cannot bypass the per-IP limits indefinitely.
    const ip = request.headers.get('cf-connecting-ip');
    if (ip)
      await consumeLimit(`guest-signup-ip:${await hashToken(ip)}`, 20, 86400);

    const id = crypto.randomUUID();
    await getDatabase()
      .prepare('INSERT INTO app_users (id, email, created_at) VALUES (?, ?, ?)')
      .bind(id, `guest+${id}@core-agro.invalid`, Date.now())
      .run();

    const response = json({ ok: true });
    response.headers.set('Set-Cookie', await createSession(id, request));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
