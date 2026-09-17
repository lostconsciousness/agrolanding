# Paddle setup

The checkout and signed webhook endpoint are already wired into the site. Keep sandbox mode enabled until a full test purchase succeeds.

## Values to add

Copy `.env.example` to `.env.local` for local testing, then replace the placeholders:

- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`: Paddle client-side token. Use a `test_` token in sandbox and a `live_` token in production.
- `NEXT_PUBLIC_PADDLE_PRICE_BASIC`: annual recurring Price ID for CORE BASIC.
- `NEXT_PUBLIC_PADDLE_PRICE_BUSINESS`: annual recurring Price ID for CORE BUSINESS.
- `NEXT_PUBLIC_PADDLE_PRICE_MAX`: annual recurring Price ID for CORE MAX.
- `NEXT_PUBLIC_PADDLE_ENVIRONMENT`: `sandbox` while testing, then `production` for live payments.
- `PADDLE_WEBHOOK_SECRET`: secret for the notification destination. This is server-only and must never use the `NEXT_PUBLIC_` prefix.

## Paddle dashboard

1. Create three products or prices that match the annual plans shown on the site.
2. Create a client-side token under **Developer Tools → Authentication**.
3. Create a notification destination under **Developer Tools → Notifications** using:

   `https://YOUR_DOMAIN/api/paddle/webhook`

4. Subscribe at minimum to `transaction.completed`, `subscription.created`, `subscription.updated`, and `subscription.canceled`.
5. Send a simulated webhook, then complete a sandbox checkout before switching to production.

The webhook verifies the raw request with `Paddle-Signature` before acknowledging it. Account activation or entitlement storage can be connected later when the application database and user accounts are available.
