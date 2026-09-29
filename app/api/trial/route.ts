import { getAuthenticatedUser } from '@/lib/server/auth';
import { getDatabase } from '@/lib/server/database';
import { apiError, assertSameOrigin, HttpError, json, readJson } from '@/lib/server/http';
import { getTrialAccess, isTrialPlan, trialGrantsAccess } from '@/lib/server/trial-access';
import { trialDurationMs } from '@/lib/trial-config';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthenticatedUser(request.headers);
    if (!user || user.email.startsWith('guest+'))
      throw new HttpError(401, 'Спочатку підтвердьте email.');
    const { plan } = await readJson(request, 2048);
    if (!isTrialPlan(plan)) throw new HttpError(400, 'Оберіть один із трьох планів.');
    const now = Date.now();
    // One trial per verified account, including concurrent/repeated requests.
    // Switching plans or signing in again never resets the clock.
    await getDatabase()
      .prepare('INSERT INTO app_trials (user_id, plan, started_at, expires_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO NOTHING')
      .bind(user.id, plan, now, now + trialDurationMs)
      .run();
    const trial = await getTrialAccess(user.id);
    if (!trialGrantsAccess(trial))
      throw new HttpError(402, 'Ваш безкоштовний тиждень завершився. Оберіть річну підписку.');
    return json({ trial });
  } catch (error) {
    return apiError(error);
  }
}
