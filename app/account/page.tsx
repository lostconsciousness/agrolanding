import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { ArrowLeft, CircleAlert, ExternalLink, Leaf, ReceiptText, ShieldCheck } from 'lucide-react';
import { getAuthenticatedUser } from '@/lib/server/auth';
import { getBillingByEmail } from '@/lib/server/billing-store';
import { subscriptionGrantsPaidAccess } from '@/lib/server/subscription-access';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Account — CORE AGRO',
  description: 'Manage your CORE AGRO subscription and billing.',
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

export default async function AccountPage() {
  const requestHeaders = await headers();
  const user = getAuthenticatedUser(requestHeaders);

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#061009] px-5 text-[#f5f8f3]">
        <section className="max-w-lg rounded-[2rem] border border-amber-300/25 bg-amber-200/[.06] p-8 text-center">
          <CircleAlert className="mx-auto text-amber-300" size={28} />
          <h1 className="mt-5 text-3xl font-medium">Sign in required</h1>
          <p className="mt-3 leading-7 text-white/55">Open this page through your signed-in CORE AGRO site.</p>
          <a className="secondary-button mt-7" href="/"><ArrowLeft size={18} /> Back to CORE AGRO</a>
        </section>
      </main>
    );
  }

  const { customer, subscriptions } = await getBillingByEmail(user.email);
  const currentSubscription = subscriptions[0] ?? null;
  const hasAccess = subscriptionGrantsPaidAccess(currentSubscription);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061009] px-5 py-10 text-[#f5f8f3] md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(184,238,55,.16),transparent_38%),linear-gradient(rgba(184,238,55,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(184,238,55,.025)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]" />
      <section className="relative z-10 mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <a className="brand flex items-center gap-3 font-semibold tracking-[0.16em]" href="/">
            <span className="logo-mark"><Leaf size={18} /></span> CORE·AGRO
          </a>
          <a className="secondary-button min-h-10 px-4 text-xs" href="/pricing"><ArrowLeft size={16} /> Pricing</a>
        </div>

        <div className="mt-16 rounded-[2.5rem] border border-white/10 bg-white/[.03] p-7 md:p-10">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b8ee37]">Account</p>
              <h1 className="mt-3 text-4xl font-medium tracking-[-.045em] md:text-6xl">Billing and access</h1>
              <p className="mt-4 text-sm text-white/45">{user.email}</p>
            </div>
            <span className={`w-fit rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[.12em] ${hasAccess ? 'border-[#b8ee37]/40 bg-[#b8ee37]/10 text-[#cef46d]' : 'border-white/10 bg-white/[.04] text-white/50'}`}>
              {hasAccess ? 'Access active' : 'No paid access'}
            </span>
          </div>

          {customer && currentSubscription ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                <ShieldCheck className="text-[#b8ee37]" size={22} />
                <p className="mt-5 text-xs uppercase tracking-[.14em] text-white/35">Subscription status</p>
                <p className="mt-2 text-2xl font-medium capitalize">{currentSubscription.status.replace('_', ' ')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                <ReceiptText className="text-[#b8ee37]" size={22} />
                <p className="mt-5 text-xs uppercase tracking-[.14em] text-white/35">Scheduled change</p>
                <p className="mt-2 text-lg font-medium">
                  {currentSubscription.scheduledChangeAction
                    ? `${currentSubscription.scheduledChangeAction} on ${formatDate(currentSubscription.scheduledChangeAt)}`
                    : 'None'}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/10 p-6 text-sm leading-7 text-white/55">
              No completed Paddle subscription is linked to this email yet. Choose a plan first, then return here to manage it.
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {customer ? (
              <form action="/api/paddle/customer-portal" method="post">
                <button className="primary-button w-full sm:w-auto" type="submit">
                  Manage subscription <ExternalLink size={18} />
                </button>
              </form>
            ) : (
              <a className="primary-button" href="/pricing">Choose a plan <ExternalLink size={18} /></a>
            )}
            <a className="secondary-button" href="/">Back to platform</a>
          </div>
        </div>
      </section>
    </main>
  );
}
