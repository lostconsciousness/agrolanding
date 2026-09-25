import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { PricingClient } from '@/components/pricing/pricing-client';
import { getAuthenticatedUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — CORE AGRO',
  description: 'Localized annual CORE AGRO plans with secure Paddle checkout.',
};

function normalizeCountryCode(value: string | null) {
  const countryCode = value?.trim().toUpperCase();
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode) || countryCode === 'XX') return undefined;
  return countryCode;
}

export default async function PricingPage() {
  const requestHeaders = await headers();
  const countryCode = normalizeCountryCode(
    requestHeaders.get('cf-ipcountry') ?? requestHeaders.get('x-vercel-ip-country'),
  );

  const user = await getAuthenticatedUser(requestHeaders);
  return <PricingClient countryCode={countryCode} customerEmail={user?.email} />;
}
