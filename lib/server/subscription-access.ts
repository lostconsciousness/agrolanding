export type MirroredSubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'paused'
  | 'canceled'
  | string;

/**
 * Scheduled changes never revoke access by themselves. Paddle keeps the status
 * active until the cancellation or pause actually takes effect.
 */
export function subscriptionGrantsPaidAccess(
  subscription: { status: MirroredSubscriptionStatus } | null | undefined,
) {
  if (!subscription) return false;
  return ['active', 'trialing', 'past_due'].includes(subscription.status);
}
