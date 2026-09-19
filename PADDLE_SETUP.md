# Paddle setup

The site has a localized pricing page at `/pricing`, a one-page overlay checkout,
a `/welcome` success route, and a signed webhook endpoint.

## Values to add

Copy `.env.example` to `.env.local` for local testing, then replace the placeholders:

- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`: live Paddle client-side token prefixed with `live_`.
- `NEXT_PUBLIC_PADDLE_ENVIRONMENT`: must be explicitly set to `production` for the live pricing page.
- `NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTH` / `NEXT_PUBLIC_PADDLE_PRICE_STARTER_YEAR`.
- `NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTH` / `NEXT_PUBLIC_PADDLE_PRICE_PRO_YEAR`.
- `NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_MONTH` / `NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_YEAR`.
- `PADDLE_ENVIRONMENT`: `production` for the live server SDK. The server fails loudly if it is missing or not live.
- `PADDLE_API_KEY`: live server-side API key used only to mint customer portal sessions.
- `PADDLE_NOTIFICATION_WEBHOOK_SECRET`: signing secret for the notification destination. The legacy `PADDLE_WEBHOOK_SECRET` name remains accepted during migration.

The original annual variables (`BASIC`, `BUSINESS`, `MAX`) remain accepted as
backwards-compatible yearly aliases. New setups should use the six explicit
monthly/yearly variables.

## Paddle dashboard

1. Create Starter, Pro and Advanced as SaaS products, with one monthly and one yearly recurring price for each.
2. Create a client-side token under **Developer Tools → Authentication**.
3. Create a notification destination under **Developer Tools → Notifications** using:

   `https://YOUR_DOMAIN/api/paddle/webhook`

4. Subscribe to `transaction.completed`, `subscription.created`, `subscription.updated`, `subscription.canceled`, `customer.created`, and `customer.updated`.
5. Add the public production domain under **Checkout → Website approval**.
6. Under **Checkout → Checkout settings**, set the default payment link to the live `/pricing` URL. Live checkout cannot use localhost.
7. Send a simulated webhook. For a production account, open checkout and verify the Paddle price; do not make a real test charge until account verification and domain approval are complete.

If Paddle reports `transaction_checkout_not_enabled`, the integration has reached
Paddle successfully, but live checkout is not yet enabled for the account. Finish
Paddle's business verification and checkout activation before retrying.

The webhook verifies the untouched request body with the official Paddle SDK and
`Paddle-Signature` before touching the database. Signature or handler failures
return a non-2xx response so Paddle retries the delivery.

Verified customer, subscription and completed-transaction events are upserted
into D1. Event timestamps prevent an older out-of-order delivery from replacing
newer state. `active`, `trialing`, and `past_due` grant access; `paused` and
`canceled` do not. A scheduled cancel or pause never revokes access by itself.

The `/account` page resolves the authenticated visitor from trusted Sites
headers, looks up their Paddle customer ID server-side, and mints a fresh
Paddle-hosted customer portal session. It never accepts a customer ID from the
browser.

## Public Cloudflare Worker deployment

The production webhook currently points at the public Workers URL, so that
Worker also needs the same durable binding and server secrets:

1. Create a production D1 database in Cloudflare.
2. Add a D1 binding named exactly `DB` to the `agrolanding` Worker.
3. Apply `drizzle/0000_mature_crystal.sql` once to that database.
4. Add `PADDLE_ENVIRONMENT=production`, `PADDLE_API_KEY`, and
   `PADDLE_NOTIFICATION_WEBHOOK_SECRET` as Worker variables/secrets. The legacy
   `PADDLE_WEBHOOK_SECRET` remains accepted while migrating.
5. Redeploy the Worker, then replay any failed Paddle notifications from the
   notification log. Never delete the notification destination or mirrored
   Paddle rows.
