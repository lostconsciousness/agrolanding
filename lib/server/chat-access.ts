import { getAuthenticatedUser } from './auth';
import { getDatabase } from './database';
import { HttpError } from './http';
import { grantsTemporaryChatAccess } from './chat-test-access';
import { getRuntimeValue } from './runtime-env';
import { getTrialAccess, trialGrantsAccess } from './trial-access';

// Legacy guest mode must be explicitly enabled. Normal launch uses verified trials.
export function freeChatEnabled() {
  return getRuntimeValue('CHAT_FREE_ACCESS') === 'true';
}

export async function requireChatUser(headers: Headers) {
  const user = await getAuthenticatedUser(headers);
  if (!user) throw new HttpError(401, 'Увійдіть до свого акаунта.');
  if (freeChatEnabled()) return user;
  if (user.email.startsWith('guest+')) throw new HttpError(401, 'Підтвердьте email для пробного доступу.');
  if (grantsTemporaryChatAccess(user.email)) return user;
  // Any current subscription qualifies; a more recently canceled one must not hide an active one.
  const paid = await getDatabase()
    .prepare(`SELECT s.subscription_id FROM subscriptions s JOIN customers c ON c.customer_id = s.customer_id
    WHERE c.email = ? AND s.status IN ('active', 'trialing', 'past_due') LIMIT 1`)
    .bind(user.email)
    .first();
  if (!paid && !trialGrantsAccess(await getTrialAccess(user.id)))
    throw new HttpError(
      402,
      'Активуйте безкоштовний тест на 24 години або оберіть річну підписку. Якщо тест уже завершився, потрібна підписка.',
    );
  return user;
}
