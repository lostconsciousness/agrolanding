import type { ChatMessage, ChatListItem, Citation } from '@/lib/chat-types';
import { getDatabase } from './database';
import { HttpError } from './http';
export interface StoredChat extends ChatListItem {
  summary: string;
  summaryThrough: number;
}
export async function ownedChat(userId: string, chatId: string) {
  const row = await getDatabase()
    .prepare(
      'SELECT id, title, updated_at AS updatedAt, summary, summary_through AS summaryThrough FROM chats WHERE id = ? AND user_id = ?',
    )
    .bind(chatId, userId)
    .first<StoredChat>();
  if (!row) throw new HttpError(404, 'Чат не знайдено.');
  return row;
}
export async function messagesForChat(chatId: string, after = 0) {
  const rows = await getDatabase()
    .prepare(
      'SELECT id, role, content, citations, created_at AS createdAt FROM chat_messages WHERE chat_id = ? AND id > ? ORDER BY id LIMIT 500',
    )
    .bind(chatId, after)
    .all<Omit<ChatMessage, 'citations'> & { citations: string }>();
  return rows.results.map((row) => ({
    ...row,
    citations: JSON.parse(row.citations) as Citation[],
  }));
}
export async function listChats(userId: string) {
  return (
    await getDatabase()
      .prepare(
        'SELECT id, title, updated_at AS updatedAt FROM chats WHERE user_id = ? ORDER BY updated_at DESC LIMIT 200',
      )
      .bind(userId)
      .all<ChatListItem>()
  ).results;
}
