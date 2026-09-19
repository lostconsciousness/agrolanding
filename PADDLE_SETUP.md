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
- `PADDLE_WEBHOOK_SECRET`: secret for the notification destination. This is server-only and must never use the `NEXT_PUBLIC_` prefix.

The original annual variables (`BASIC`, `BUSINESS`, `MAX`) remain accepted as
backwards-compatible yearly aliases. New setups should use the six explicit
monthly/yearly variables.

## Paddle dashboard

1. Create Starter, Pro and Advanced as SaaS products, with one monthly and one yearly recurring price for each.
2. Create a client-side token under **Developer Tools → Authentication**.
3. Create a notification destination under **Developer Tools → Notifications** using:

   `https://YOUR_DOMAIN/api/paddle/webhook`

4. Subscribe at minimum to `transaction.completed`, `subscription.created`, `subscription.updated`, and `subscription.canceled`.
5. Add the public production domain under **Checkout → Website approval**.
6. Under **Checkout → Checkout settings**, set the default payment link to the live `/pricing` URL. Live checkout cannot use localhost.
7. Send a simulated webhook. For a production account, open checkout and verify the Paddle price; do not make a real test charge until account verification and domain approval are complete.

If Paddle reports `transaction_checkout_not_enabled`, the integration has reached
Paddle successfully, but live checkout is not yet enabled for the account. Finish
Paddle's business verification and checkout activation before retrying.

The webhook verifies the raw request with `Paddle-Signature` before acknowledging it. Account activation or entitlement storage can be connected later when the application database and user accounts are available.
