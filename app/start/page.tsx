import { headers } from 'next/headers';
import { getAuthenticatedUser } from '@/lib/server/auth';
import { getTrialAccess, isTrialPlan } from '@/lib/server/trial-access';
import { StartPlans } from '@/components/chat/start-plans';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Спробувати CORE AGRO — 24 години безкоштовно' };
export default async function StartPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const user = await getAuthenticatedUser(await headers());
  const verified = user && !user.email.startsWith('guest+');
  return <StartPlans initialPlan={isTrialPlan(plan) ? plan : undefined} email={verified ? user.email : undefined} trial={verified ? await getTrialAccess(user.id) : null} />;
}
