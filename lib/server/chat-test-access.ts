import { getRuntimeValue } from './runtime-env';

/** A short-lived, authenticated tester entitlement; never modifies Paddle state. */
export function grantsTemporaryChatAccess(email: string) {
  const testerEmail = getRuntimeValue('CHAT_TESTER_EMAIL')?.trim().toLowerCase();
  const until = getRuntimeValue('CHAT_TESTER_UNTIL');
  if (!testerEmail || !until || email.toLowerCase() !== testerEmail) return false;

  // Require an explicit UTC instant so an accidental date-only value cannot grant access.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(until)) return false;
  const expiresAt = Date.parse(until);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}
