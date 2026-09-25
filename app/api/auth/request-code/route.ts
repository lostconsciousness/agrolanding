import { authConfigured, codeDigest, hashToken } from '@/lib/server/auth';
import { getDatabase } from '@/lib/server/database';
import {
  apiError,
  assertSameOrigin,
  HttpError,
  json,
  readJson,
} from '@/lib/server/http';
import { consumeLimit } from '@/lib/server/rate-limit';
import { requireRuntimeValue } from '@/lib/server/runtime-env';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!authConfigured())
      throw new HttpError(
        503,
        'Вхід ще налаштовується. Зверніться до підтримки.',
      );
    const body = await readJson(request, 2048);
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new HttpError(400, 'Введіть коректний email.');
    await consumeLimit(
      `auth-ip:${await hashToken(request.headers.get('cf-connecting-ip') ?? 'local')}`,
      20,
      3600,
    );
    await consumeLimit(`auth-email:${await hashToken(email)}`, 5, 3600);
    const id = crypto.randomUUID();
    const code = String(
      crypto.getRandomValues(new Uint32Array(1))[0] % 1000000,
    ).padStart(6, '0');
    await getDatabase()
      .prepare(
        'INSERT INTO auth_codes (id, email, code_hash, expires_at) VALUES (?, ?, ?, ?)',
      )
      .bind(id, email, await codeDigest(id, code), Date.now() + 600000)
      .run();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${requireRuntimeValue('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: requireRuntimeValue('AUTH_FROM_EMAIL'),
        to: [email],
        subject: 'Код входу в CORE AGRO',
        text: `Ваш код входу: ${code}\nКод діє 10 хвилин. Нікому його не передавайте. Якщо ви не запитували код, проігноруйте цей лист.`,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      throw new HttpError(503, 'Не вдалося надіслати код. Спробуйте пізніше.');
    return json({ challengeId: id });
  } catch (error) {
    return apiError(error);
  }
}
