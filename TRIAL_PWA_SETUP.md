# Trial access and installed chat

`/start` shows BASIC, BUSINESS and MAX. A visitor must verify their email before
activating one 24-hour trial. All trial tiers use the same AI chat. The selected
plan and fixed expiration are stored in `app_trials`. Activation is idempotent:
changing plans or signing in again does not restart the trial. Paid subscriptions
continue to grant access independently. Trials never create Paddle charges.

Keep `CHAT_FREE_ACCESS=false` in Cloudflare runtime settings. The old guest bypass
is intentionally disabled by default. Existing guest sessions must sign in.

Deploy with `npm run deploy`, which applies the additive D1 migrations before
deploying the Worker. Do not use bare `wrangler deploy` for this release unless
the migration has already been applied. No existing customer or chat is deleted.

The shared launch offer ends at `2026-10-28T00:00:00Z`, configured in
`lib/launch-offer.ts`. $380/$630/$870 are the confirmed discounted USD bases;
regular USD bases are $760/$1260/$1740. Checkout always uses the Paddle preview
total, never a frontend calculation. After expiry the promotion banner hides;
Paddle prices must be managed separately if the actual charge is to change.

The manifest starts at `/chat`. Installation uses the browser prompt where
available; iOS users get Safari home-screen instructions. Authentication still
applies after installation. The service worker caches public icons and an offline
notice only, never auth responses, API data, chat HTML or histories. AI requires
internet. Generated icons can be rebuilt with `node scripts/generate-pwa-icons.mjs`.
