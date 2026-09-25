import { codeDigest, createSession } from '@/lib/server/auth';
import { getDatabase } from '@/lib/server/database';
import {
  apiError,
  assertSameOrigin,
  HttpError,
  json,
  readJson,
} from '@/lib/server/http';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { challengeId, code } = await readJson(request, 2048);
    if (
      typeof challengeId !== 'string' ||
      challengeId.length > 40 ||
      typeof code !== 'string' ||
      !/^\d{6}$/.test(code)
    )
      throw new HttpError(400, 'Введіть шестизначний код.');
    const db = getDatabase();
    const attempt = await db
      .prepare(
        'UPDATE auth_codes SET attempts = attempts + 1 WHERE id = ? AND attempts < 5 AND expires_at > ? RETURNING id',
      )
      .bind(challengeId, Date.now())
      .first();
    if (!attempt)
      throw new HttpError(
        400,
        'Код прострочений або вичерпано спроби. Запитайте новий.',
      );
    const valid = await db
      .prepare(
        'DELETE FROM auth_codes WHERE id = ? AND code_hash = ? AND expires_at > ? RETURNING email',
      )
      .bind(challengeId, await codeDigest(challengeId, code), Date.now())
      .first<{ email: string }>();
    if (!valid) throw new HttpError(400, 'Невірний код.');
    const user = await db
      .prepare(`INSERT INTO app_users (id, email, created_at) VALUES (?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET email = excluded.email RETURNING id`)
      .bind(crypto.randomUUID(), valid.email, Date.now())
      .first<{ id: string }>();
    if (!user) throw new Error('User creation failed');
    const response = json({ ok: true });
    response.headers.set('Set-Cookie', await createSession(user.id, request));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
