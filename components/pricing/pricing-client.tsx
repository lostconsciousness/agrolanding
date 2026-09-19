'use client';

import { initializePaddle, type Paddle, type PaddleEventData } from '@paddle/paddle-js';
import {
  ArrowRight,
  Check,
  CircleAlert,
  Globe2,
  Leaf,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePaddlePrices } from '@/hooks/use-paddle-prices';
import { pricingTiers, type Tier } from '@/lib/pricing-tiers';

interface PricingClientProps {
  countryCode?: string;
  customerEmail?: string;
}

function getLivePaddleConfig() {
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT;
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  if (!environment) {
    throw new Error('NEXT_PUBLIC_PADDLE_ENVIRONMENT is required.');
  }
  if (environment !== 'production') {
    throw new Error('The pricing page requires NEXT_PUBLIC_PADDLE_ENVIRONMENT=production.');
  }
  if (!token) {
    throw new Error('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is required.');
  }
  if (!token.startsWith('live_')) {
    throw new Error('The pricing page requires a live_ Paddle client-side token.');
  }

  return { environment, token } as const;
}

function getCheckoutError(event: PaddleEventData) {
  const eventErrors = (event as PaddleEventData & { errors?: Array<{ message?: string }> }).errors;
  const detail = event.detail ?? eventErrors?.[0]?.message;
  if (detail === 'transaction_checkout_not_enabled') {
    return 'Live checkout is not enabled for this Paddle account yet.';
  }
  if (detail === 'transaction_default_checkout_url_not_set') {
    return 'Set the default payment link in Paddle Checkout settings.';
  }
  if (detail === 'transaction_checkout_url_domain_is_not_approved') {
    return 'This live domain has not been approved in Paddle yet.';
  }
  return 'Checkout could not be opened. Please try again or contact support.';
}

export function PricingClient({ countryCode, customerEmail }: PricingClientProps) {
  const [paddle, setPaddle] = useState<Paddle>();
  const [configurationError, setConfigurationError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [openingTier, setOpeningTier] = useState<Tier['id'] | null>(null);
  const paddlePromise = useRef<Promise<Paddle | undefined> | null>(null);

  const { prices, loading: pricesLoading, error: pricesError } = usePaddlePrices(
    paddle,
    countryCode,
  );

  useEffect(() => {
    try {
      const config = getLivePaddleConfig();
      paddlePromise.current ??= initializePaddle({
        token: config.token,
        environment: config.environment,
        eventCallback: (event) => {
          if (event.name === 'checkout.completed') {
            window.location.assign('/welcome');
            return;
          }
          if (
            event.name === 'checkout.error' ||
            event.name === 'checkout.payment.error' ||
            event.name === 'checkout.failed'
          ) {
            console.error('Paddle Checkout error', event);
            setOpeningTier(null);
            setCheckoutError(getCheckoutError(event));
          }
          if (event.name === 'checkout.loaded' || event.name === 'checkout.closed') {
            setOpeningTier(null);
          }
        },
      });

      paddlePromise.current
        .then((instance) => {
          if (!instance) throw new Error('Paddle.js did not initialize.');
          setPaddle(instance);
        })
        .catch((error: unknown) => {
          setConfigurationError(error instanceof Error ? error.message : 'Paddle.js failed to initialize.');
          paddlePromise.current = null;
        });
    } catch (error) {
      setConfigurationError(error instanceof Error ? error.message : 'Invalid Paddle configuration.');
    }
  }, []);

  const openCheckout = (tier: Tier) => {
    const priceId = tier.priceId;
    if (!paddle || !priceId) return;

    setCheckoutError(null);
    setOpeningTier(tier.id);

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      ...(customerEmail ? { customer: { email: customerEmail } } : {}),
      customData: { plan: tier.id, billing_frequency: 'year' },
      settings: {
        displayMode: 'overlay',
        variant: 'one-page',
        theme: 'dark',
        successUrl: `${window.location.origin}/welcome`,
      },
    });
  };

  const visibleError = configurationError ?? pricesError ?? checkoutError;

  return (
    <main className="min-h-screen overflow-hidden bg-[#061009] text-[#f5f8f3]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(184,238,55,.17),transparent_38%),linear-gradient(rgba(184,238,55,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(184,238,55,.025)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]" />

      <header className="relative z-10 border-b border-white/8 bg-[#061009]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1320px] items-center justify-between px-5 lg:px-10">
          <a className="brand flex items-center gap-3 font-semibold tracking-[0.16em]" href="/">
            <span className="logo-mark"><Leaf size={18} /></span> CORE·AGRO
          </a>
          <div className="flex items-center gap-2">
            <a className="secondary-button min-h-10 px-4 text-xs" href="/account"><UserRound size={16} /> Account</a>
            <a className="secondary-button hidden min-h-10 px-4 text-xs sm:inline-flex" href="/">Back to platform</a>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-[1320px] px-5 pb-24 pt-20 lg:px-10 lg:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-[#b8ee37]/25 bg-[#b8ee37]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[.17em] text-[#cef46d]">
            <ShieldCheck size={17} /> Secure annual billing
          </div>
          <h1 className="text-balance text-[clamp(3.2rem,8vw,7.2rem)] font-medium leading-[.9] tracking-[-.065em]">
            Choose the plan that <span className="text-[#b8ee37]">moves your farm forward.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/55 md:text-lg">
            Prices are localized by Paddle for your country and include the applicable currency and tax treatment.
          </p>

          <div className="mt-9 flex items-center justify-center gap-2 text-xs text-white/38">
            <Globe2 size={16} className="text-[#b8ee37]" />
            {countryCode ? `Localized for ${countryCode}` : 'Location detected securely by Paddle'}
          </div>
        </div>

        {visibleError && (
          <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-200/[.06] px-5 py-4 text-sm leading-6 text-amber-100" role="alert">
            <CircleAlert className="mt-0.5 shrink-0 text-amber-300" size={20} />
            <span>{visibleError}</span>
          </div>
        )}

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {pricingTiers.map((tier, index) => {
            const priceId = tier.priceId;
            const formattedTotal = priceId ? prices[priceId] : undefined;
            const isOpening = openingTier === tier.id;
            const disabled = !paddle || !priceId || !formattedTotal || openingTier !== null;

            return (
              <article
                key={tier.id}
                className={`relative flex min-h-[590px] flex-col overflow-hidden rounded-[2rem] border p-7 md:p-8 ${tier.featured ? 'border-[#b8ee37]/65 bg-[radial-gradient(circle_at_50%_0%,rgba(184,238,55,.14),transparent_34%),rgba(184,238,55,.035)] shadow-[0_0_70px_rgba(184,238,55,.08)]' : 'border-white/10 bg-white/[.025]'}`}
              >
                {tier.featured && (
                  <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-[#b8ee37] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#061009]">
                    <Sparkles size={14} /> Most popular
                  </div>
                )}
                <span className="font-mono text-xs text-[#b8ee37]/60">0{index + 1}</span>
                <h2 className="mt-9 text-3xl font-medium tracking-[-.04em]">{tier.name}</h2>
                <p className="mt-3 min-h-14 text-sm leading-6 text-white/45">{tier.description}</p>

                <div className="mt-9 border-b border-white/10 pb-8">
                  <div className="flex min-h-16 items-end gap-2">
                    {pricesLoading && priceId ? (
                      <LoaderCircle className="mb-2 animate-spin text-[#b8ee37]" size={28} />
                    ) : (
                      <strong className="text-5xl font-medium tracking-[-.06em] md:text-6xl">
                        {formattedTotal ?? '—'}
                      </strong>
                    )}
                    <span className="pb-2 text-sm text-white/35">/year</span>
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-white/68">
                      <Check className="mt-0.5 shrink-0 text-[#b8ee37]" size={18} /> {feature}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => openCheckout(tier)}
                  className={`mt-auto flex min-h-14 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${tier.featured ? 'bg-[#b8ee37] text-[#061009] hover:bg-[#cbfb54]' : 'border border-white/16 bg-white/[.035] text-white hover:border-[#b8ee37]/45'}`}
                >
                  {isOpening ? <><LoaderCircle className="animate-spin" size={19} /> Opening checkout</> : <>Subscribe <ArrowRight size={18} /></>}
                </button>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-center text-xs leading-5 text-white/36 sm:grid-cols-3">
          <span>Secure Paddle checkout</span>
          <span>Localized currency and taxes</span>
          <span>Cancel through your customer portal</span>
        </div>
      </section>
    </main>
  );
}
