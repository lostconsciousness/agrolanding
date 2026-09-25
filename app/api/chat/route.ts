import {
  apiError,
  assertSameOrigin,
  HttpError,
  json,
  readJson,
} from '@/lib/server/http';
import { requireChatUser } from '@/lib/server/chat-access';
import { getDatabase } from '@/lib/server/database';
import { listChats, messagesForChat, ownedChat } from '@/lib/server/chat-store';
import {
  aiConfigured,
  answerAgro,
  classifyQuestion,
  summarizeHistory,
} from '@/lib/server/agro-ai';
import { consumeLimit } from '@/lib/server/rate-limit';
import { getRuntimeValue } from '@/lib/server/runtime-env';

export async function GET(request: Request) {
  try {
    const user = await requireChatUser(request.headers);
    const id = new URL(request.url).searchParams.get('id');
    if (id) {
      const chat = await ownedChat(user.id, id);
      return json({ chat, messages: await messagesForChat(id) });
    }
    const profile = await getDatabase()
      .prepare('SELECT context FROM app_users WHERE id = ?')
      .bind(user.id)
      .first<{ context: string }>();
    return json({
      chats: await listChats(user.id),
      context: profile?.context ?? '',
      ready: aiConfigured(),
      email: user.email,
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  let lock: { userId: string; token: string } | null = null;
  try {
    assertSameOrigin(request);
    const user = await requireChatUser(request.headers);
    const body = await readJson(request);
    if (
      typeof body.message !== 'string' ||
      !body.message.trim() ||
      body.message.length > 6000 ||
      typeof body.requestId !== 'string' ||
      !/^[a-f0-9-]{36}$/i.test(body.requestId)
    )
      throw new HttpError(400, 'Запит має містити до 6000 символів.');
    if (
      body.chatId !== undefined &&
      (typeof body.chatId !== 'string' || body.chatId.length > 40)
    )
      throw new HttpError(400, 'Некоректний чат.');
    const db = getDatabase();
    const message = body.message.trim();
    const lockToken = crypto.randomUUID();
    const acquired = await db
      .prepare(`INSERT INTO chat_locks (user_id, token, expires_at) VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET token = excluded.token, expires_at = excluded.expires_at
      WHERE chat_locks.expires_at < ? RETURNING token`)
      .bind(user.id, lockToken, Date.now() + 240000, Date.now())
      .first();
    if (!acquired)
      throw new HttpError(409, 'Попередній запит ще обробляється. Зачекайте.');
    lock = { userId: user.id, token: lockToken };
    const existing = await db
      .prepare(`SELECT m.chat_id AS chatId FROM chat_messages m JOIN chats c ON c.id = m.chat_id
      WHERE m.request_id = ? AND c.user_id = ? LIMIT 1`)
      .bind(body.requestId, user.id)
      .first<{ chatId: string }>();
    if (existing)
      return json({
        chatId: existing.chatId,
        messages: await messagesForChat(existing.chatId),
        chats: await listChats(user.id),
      });
    if (!aiConfigured())
      throw new HttpError(
        503,
        'AI-асистент ще налаштовується. Спробуйте пізніше.',
      );
    const chat = body.chatId
      ? await ownedChat(user.id, body.chatId as string)
      : null;
    let history = chat
      ? await messagesForChat(chat.id, chat.summaryThrough)
      : [];
    const count = chat
      ? await db
          .prepare('SELECT count(*) AS n FROM chat_messages WHERE chat_id = ?')
          .bind(chat.id)
          .first<{ n: number }>()
      : null;
    if ((count?.n ?? 0) >= 400)
      throw new HttpError(
        400,
        'Цей чат досяг ліміту довжини. Створіть новий; контекст господарства збережеться.',
      );
    const configuredLimit = Number(
      getRuntimeValue('AI_DAILY_MESSAGE_LIMIT') ?? 40,
    );
    const limit =
      Number.isInteger(configuredLimit) && configuredLimit > 0
        ? Math.min(configuredLimit, 500)
        : 40;
    await consumeLimit(`chat:${user.id}`, limit, 86400);
    const decision = await classifyQuestion(
      message,
      history.map(({ role, content }) => ({ role, content })),
    );
    let answer: {
      content: string;
      citations: import('@/lib/chat-types').Citation[];
    };
    if (!decision.allowed) {
      answer = {
        content:
          decision.refusal.slice(0, 600) ||
          'Я відповідаю лише на питання агросектору: культури, зерно, покупці, техніка та господарство.',
        citations: [],
      };
    } else {
      if (chat && history.length > 24) {
        const older = history.slice(0, -16);
        const summary = await summarizeHistory(
          chat.summary,
          older.map(({ role, content }) => ({ role, content })),
        );
        await db
          .prepare(
            'UPDATE chats SET summary = ?, summary_through = ? WHERE id = ? AND user_id = ?',
          )
          .bind(summary, older.at(-1)!.id, chat.id, user.id)
          .run();
        chat.summary = summary;
        history = history.slice(-16);
      }
      const profile = await db
        .prepare('SELECT context FROM app_users WHERE id = ?')
        .bind(user.id)
        .first<{ context: string }>();
      answer = await answerAgro(
        message,
        history.map(({ role, content }) => ({ role, content })),
        profile?.context ?? '',
        chat?.summary ?? '',
        decision.needsLiveData,
      );
    }
    const chatId = chat?.id ?? crypto.randomUUID();
    const now = Date.now();
    const statements = [];
    if (!chat)
      statements.push(
        db
          .prepare(
            'INSERT INTO chats (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          )
          .bind(chatId, user.id, message.slice(0, 80), now, now),
      );
    statements.push(
      db
        .prepare(
          'INSERT INTO chat_messages (chat_id, request_id, role, content, citations, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .bind(chatId, body.requestId, 'user', message, '[]', now),
    );
    statements.push(
      db
        .prepare(
          'INSERT INTO chat_messages (chat_id, request_id, role, content, citations, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .bind(
          chatId,
          body.requestId,
          'assistant',
          answer.content,
          JSON.stringify(answer.citations),
          now + 1,
        ),
    );
    statements.push(
      db
        .prepare('UPDATE chats SET updated_at = ? WHERE id = ? AND user_id = ?')
        .bind(now, chatId, user.id),
    );
    await db.batch(statements);
    return json({
      chatId,
      messages: await messagesForChat(chatId),
      chats: await listChats(user.id),
    });
  } catch (error) {
    return apiError(error);
  } finally {
    if (lock)
      await getDatabase()
        .prepare('DELETE FROM chat_locks WHERE user_id = ? AND token = ?')
        .bind(lock.userId, lock.token)
        .run()
        .catch(() => {});
  }
}
