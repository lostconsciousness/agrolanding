import { getDatabase } from './database';

export type TrialPlan = 'basic' | 'business' | 'max';
export interface TrialAccess {
  plan: TrialPlan;
  startedAt: number;
  expiresAt: number;
}
export function isTrialPlan(value: unknown): value is TrialPlan {
  return value === 'basic' || value === 'business' || value === 'max';
}
export async function getTrialAccess(userId: string) {
  return getDatabase()
    .prepare('SELECT plan, started_at AS startedAt, expires_at AS expiresAt FROM app_trials WHERE user_id = ?')
    .bind(userId)
    .first<TrialAccess>();
}
export function trialGrantsAccess(trial: TrialAccess | null, now = Date.now()) {
  return Boolean(trial && trial.expiresAt > now);
}
