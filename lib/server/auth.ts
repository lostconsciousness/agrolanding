import { getDatabase } from './database';
import { getRuntimeValue, requireRuntimeValue } from './runtime-env';
import { HttpError } from './http';
export interface AuthenticatedUser {
  id: string;
  email: string;
}
const cookieName = 'core_agro_session';
const sessionSeconds = 60 * 60 * 24 * 30;
export async function hashToken(value: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
export function authConfigured() {
  return Boolean(
    getRuntimeValue('RESEND_API_KEY') &&
    getRuntimeValue('AUTH_FROM_EMAIL') &&
    (getRuntimeValue('AUTH_SECRET')?.length ?? 0) >= 32,
  );
}
export async function codeDigest(id: string, code: string) {
  const secret = requireRuntimeValue('AUTH_SECRET');
  if (secret.length < 32) throw new HttpError(503, 'Вхід ще налаштовується.');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${id}:${code}`),
  );
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
function sessionToken(headers: Headers) {
  return headers
    .get('cookie')
    ?.split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
}
// Never authorize billing/chat through spoofable oai-authenticated-* headers on public Workers.
export async function getAuthenticatedUser(
  headers: Headers,
): Promise<AuthenticatedUser | null> {
  const token = sessionToken(headers);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return getDatabase()
    .prepare(`SELECT u.id, u.email FROM auth_sessions s JOIN app_users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?`)
    .bind(await hashToken(token), Date.now())
    .first<AuthenticatedUser>();
}
export async function createSession(userId: string, request: Request) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  await getDatabase()
    .prepare(
      'INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    )
    .bind(await hashToken(token), userId, Date.now() + sessionSeconds * 1000)
    .run();
  return `${cookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionSeconds}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export async function revokeSession(request: Request) {
  const token = sessionToken(request.headers);
  if (token)
    await getDatabase()
      .prepare('DELETE FROM auth_sessions WHERE token_hash = ?')
      .bind(await hashToken(token))
      .run();
  return `${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
