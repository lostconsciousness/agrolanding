import { requireChatUser } from '@/lib/server/chat-access';
import { getDatabase } from '@/lib/server/database';
import {
  apiError,
  assertSameOrigin,
  HttpError,
  json,
  readJson,
} from '@/lib/server/http';
export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireChatUser(request.headers);
    const { context } = await readJson(request);
    if (typeof context !== 'string' || context.length > 5000)
      throw new HttpError(400, 'Контекст має містити до 5000 символів.');
    await getDatabase()
      .prepare('UPDATE app_users SET context = ? WHERE id = ?')
      .bind(context.trim(), user.id)
      .run();
    return json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
