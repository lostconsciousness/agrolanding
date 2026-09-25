import { getDatabase } from './database';
import { HttpError } from './http';
export async function consumeLimit(
  key: string,
  limit: number,
  seconds: number,
) {
  const now = Date.now();
  const row = await getDatabase()
    .prepare(`INSERT INTO request_limits (key, count, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN request_limits.expires_at <= ? THEN 1 ELSE request_limits.count + 1 END,
      expires_at = CASE WHEN request_limits.expires_at <= ? THEN excluded.expires_at ELSE request_limits.expires_at END
    WHERE request_limits.expires_at <= ? OR request_limits.count < ? RETURNING count`)
    .bind(key, now + seconds * 1000, now, now, now, limit)
    .first();
  if (!row)
    throw new HttpError(429, 'Ліміт запитів вичерпано. Спробуйте пізніше.');
}
