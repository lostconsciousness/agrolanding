# CORE AGRO subscriber AI workspace

## What is implemented

- `/chat`: saved, private conversations, sources, recent history, compressed older
  conversation memory and an editable farm profile shared across that user's chats.
- `/login`: email one-time codes (10 minutes, five attempts), hashed server sessions,
  HttpOnly cookies and same-origin checks for mutations. The email must match the
  email used in Paddle checkout. Signed-in users get their email prefilled; new
  customers can still purchase first and sign in from the welcome page afterward.
- Every chat request verifies the current subscription mirror in D1. Existing
  access policy is preserved: active, trialing and past_due grant access; paused
  and canceled do not. Scheduled cancellation alone does not revoke access.
- A separate structured-output scope check rejects off-topic requests. The answer
  model has agriculture-specific instructions and an editable baseline reference
  at `lib/agro-knowledge.ts`. This is NOT fine-tuning. LLM scope checks reduce abuse
  but cannot guarantee perfect classification; review real usage before launch.
- OpenAI Responses API with web search for companies, buyers, prices and current
  market information. Sources are clickable; unsourced live-market answers are
  withheld. Public web results are not a real-time exchange feed or confirmed offers.
- Default budget: 40 attempts per user per rolling 24h, one concurrent request,
  6,000 characters per prompt, 400 messages per conversation. Retries of successfully
  saved requests are idempotent. Provider errors do not save incomplete exchanges.

## Required server configuration

Set these on the actual Worker serving the site (not in client-side code, GitHub,
or a public NEXT_PUBLIC variable). For local development use `.env.local`.

| Variable | Where to obtain it |
| --- | --- |
| `OPENAI_API_KEY` | An OpenAI API project with API billing enabled. A ChatGPT subscription does not pay for API usage. |
| `OPENAI_MODEL` | Explicit supported Responses model, for example `gpt-4.1-mini`. Must support web search and structured outputs. |
| `OPENAI_GUARD_MODEL` | Optional separate scope model; otherwise uses `OPENAI_MODEL`. |
| `RESEND_API_KEY` | Resend API key with permission to send email. |
| `AUTH_FROM_EMAIL` | Sender on a domain verified in Resend, e.g. `CORE AGRO <login@core-agro.com>`. Verify the prescribed DNS records first. |
| `AUTH_SECRET` | A private random value, at least 32 characters. Generate with `openssl rand -hex 32`. |
| `AI_DAILY_MESSAGE_LIMIT` | Optional positive integer (default 40, maximum 500). Set a provider project spend limit too. |
| `OPENAI_AGRO_VECTOR_STORE_ID` | Optional OpenAI vector store containing your approved agricultural reference documents. |

No real key is required in source control. Missing AI/email configuration yields an
explicit unavailable state, not a fake answer. No paid OpenAI calls or real Paddle
payments were made during local tests; provider responses in automated tests are mocked.

## Database and deployment

Use the same D1 binding named `DB` for the web app and Paddle webhook. It must contain
the verified subscription/customer mirror, otherwise paid users will not have access.

The existing migration `drizzle/0000_mature_crystal.sql` is unchanged. Apply the new,
additive `drizzle/0001_pretty_wraith.sql` exactly once to the SAME production database.
It creates users, auth challenges/sessions, conversations/messages and rate limits;
it never deletes or changes Paddle entities or billing rows. Sites applies packaged
migrations as part of deployment. For a separate Cloudflare Worker, apply through
your migration workflow or the D1 console, then deploy the updated code and secrets.
Do not re-run already-applied CREATE TABLE migrations.

If a subscription is missing from the mirror, replay the relevant real Paddle
notifications after ensuring the webhook uses that database. Do not fabricate a paid
subscription or bypass the access check to test production. Multiple browser sessions
on one email share history; team invitations/seat management are not implemented.

## Knowledge and data to supply

Send approved agronomy manuals, product documentation, supported countries/crops,
buyer directories you have rights to use, and the desired quote fields/units. These
can populate a curated retrieval store; they do not train a new model. For private
or licensed grain quotes, provide the data provider and an API/feed agreement. Web
search cannot see private purchase prices or guarantee offer freshness.

The initial UI is Ukrainian; the model is instructed to answer in the user's language.
The editable profile is the explicit cross-chat memory. Old conversations are not
silently copied into unrelated new chats.

## Data handling and acceptance tests

Chats/profile are stored in D1. Relevant messages/profile and compressed memory are
sent to OpenAI; email address/code are sent to Resend. `store:false` is set on every
Responses call, but provider safety retention rules still apply. No prompt, login
code, session token or secret is logged by the application. Publish accurate privacy
and retention terms before enabling real customer use. Chat deletion/export is not
implemented in this first version; handle user requests through your support process.

Run `npm run test:chat`, `npx tsc --noEmit` and `npm run build` before deployment.
After configuring providers, verify on the approved live domain:

1. Email login delivers a code; wrong, expired and reused codes fail.
2. An unpaid account cannot call the chat API; a real paid account can.
3. Ask a grain-market question: answer shows dated sources; ask an off-topic question:
   refusal. Try follow-ups, reload, switch chats and update the farm profile.
4. A second account cannot read the first account's chats, even with a known chat ID.
5. Confirm a canceled/paused subscription loses chat access after a verified webhook.
6. Verify actual provider costs, latency and representative agro questions before launch.

Existing billing infrastructure, products, prices, customers, transactions and
notification destinations remain permanent. No cleanup of these entities is needed.
