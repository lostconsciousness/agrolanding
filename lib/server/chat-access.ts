import { getAuthenticatedUser } from './auth';
import { getDatabase } from './database';
import { HttpError } from './http';
import { grantsTemporaryChatAccess } from './chat-test-access';

export async function requireChatUser(headers: Headers) {
  const user = await getAuthenticatedUser(headers);
  if (!user) throw new HttpError(401, 'Увійдіть до свого акаунта.');
  if (grantsTemporaryChatAccess(user.email)) return user;
  // Any current subscription qualifies; a more recently canceled one must not hide an active one.
  const paid = await getDatabase()
    .prepare(`SELECT s.subscription_id FROM subscriptions s JOIN customers c ON c.customer_id = s.customer_id
    WHERE c.email = ? AND s.status IN ('active', 'trialing', 'past_due') LIMIT 1`)
    .bind(user.email)
    .first();
  if (!paid)
    throw new HttpError(
      402,
      'Чат доступний після активації підписки. Якщо ви щойно оплатили, оновіть статус за хвилину.',
    );
  return user;
}
