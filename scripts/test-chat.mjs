// Exercise real server handlers against isolated in-memory SQLite and mocked providers.
// No live Paddle, OpenAI, Resend or production database calls.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';

const root = process.cwd();
const sqlite = new DatabaseSync(':memory:');
sqlite.exec('PRAGMA foreign_keys=ON');
for (const name of readdirSync('drizzle')
  .filter((x) => x.endsWith('.sql'))
  .sort())
  sqlite.exec(readFileSync(`drizzle/${name}`, 'utf8'));
const DB = {
  prepare(sql) {
    const statement = {
      args: [],
      bind(...args) {
        this.args = args;
        return this;
      },
      async first() {
        return sqlite.prepare(sql).get(...this.args) ?? null;
      },
      async all() {
        return { results: sqlite.prepare(sql).all(...this.args) };
      },
      async run() {
        return sqlite.prepare(sql).run(...this.args);
      },
    };
    return statement;
  },
  async batch(statements) {
    sqlite.exec('BEGIN');
    try {
      const result = [];
      for (const s of statements) result.push(await s.run());
      sqlite.exec('COMMIT');
      return result;
    } catch (error) {
      sqlite.exec('ROLLBACK');
      throw error;
    }
  },
};
const env = {
  DB,
  AUTH_SECRET: 'test-only-secret-not-valid-in-production-12345',
  RESEND_API_KEY: 'test',
  AUTH_FROM_EMAIL: 'test@example.com',
  OPENAI_API_KEY: 'test',
  OPENAI_MODEL: 'test-model',
};
const aiCalls = [];
let mailCode,
  decision = { allowed: true, needsLiveData: true, refusal: '' },
  providerFails = false,
  includeCitations = true;
async function mockedFetch(url, options) {
  const body = JSON.parse(options.body);
  if (url === 'https://api.resend.com/emails') {
    mailCode = body.text.match(/\b\d{6}\b/)[0];
    return Response.json({ id: 'test-email' });
  }
  assert.equal(url, 'https://api.openai.com/v1/responses');
  assert.equal(body.store, false);
  aiCalls.push(body);
  if (providerFails) return new Response('', { status: 503 });
  const isGuard = body.text?.format?.name === 'agro_scope';
  const isSummary = body.instructions.startsWith('Summarize');
  return Response.json({
    status: 'completed',
    output: [
      {
        type: 'message',
        content: [
          {
            type: 'output_text',
            text: isGuard
              ? JSON.stringify(decision)
              : isSummary
                ? 'Farm in Ukraine, wheat.'
                : 'Indicative wheat quote; verify grade and delivery. Source.',
            annotations:
              isGuard || isSummary || !includeCitations
                ? []
                : [
                    {
                      type: 'url_citation',
                      start_index: 50,
                      end_index: 56,
                      url: 'https://example.com/grain',
                      title: 'Grain source',
                    },
                  ],
          },
        ],
      },
    ],
  });
}
const cache = new Map();
function load(file) {
  file = path.resolve(root, file);
  if (!path.extname(file)) file += '.ts';
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const require = (id) => {
    if (id === 'cloudflare:workers') return { env };
    if (id.startsWith('@/')) return load(id.slice(2));
    if (id.startsWith('.')) return load(path.resolve(path.dirname(file), id));
    throw new Error(`Unexpected test import ${id}`);
  };
  vm.runInNewContext(
    code,
    {
      module: loadedModule,
      exports: loadedModule.exports,
      require,
      process: { env: {} },
      crypto: globalThis.crypto,
      Request,
      Response,
      Headers,
      URL,
      TextEncoder,
      TextDecoder,
      AbortSignal,
      Uint8Array,
      Uint32Array,
      fetch: mockedFetch,
      console: { error() {} },
      setTimeout,
      clearTimeout,
    },
    { filename: file },
  );
  return loadedModule.exports;
}
const chat = load('app/api/chat/route.ts');
const requestCode = load('app/api/auth/request-code/route.ts');
const verify = load('app/api/auth/verify/route.ts');
const context = load('app/api/chat/context/route.ts');
const auth = load('lib/server/auth.ts');
const logout = load('app/api/auth/logout/route.ts');
const origin = 'https://core-agro.test';
function req(route, { body, cookie, method, extra = {} } = {}) {
  return new Request(origin + route, {
    method: method ?? (body ? 'POST' : 'GET'),
    headers: {
      origin,
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
      ...extra,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
let checks = 0;
async function status(response, expected) {
  assert.equal(response.status, expected, await response.clone().text());
  checks++;
  return response;
}

await status(
  await chat.GET(
    req('/api/chat', {
      extra: {
        'oai-authenticated-user-id': 'spoof',
        'oai-authenticated-user-email': 'paid@example.com',
      },
    }),
  ),
  401,
);
await status(
  await requestCode.POST(
    req('/api/auth/request-code', {
      body: { email: 'paid@example.com' },
      extra: { origin: 'https://evil.test' },
    }),
  ),
  403,
);
const challenge = await (
  await status(
    await requestCode.POST(
      req('/api/auth/request-code', { body: { email: 'Paid@Example.com' } }),
    ),
    200,
  )
).json();
await status(
  await verify.POST(
    req('/api/auth/verify', {
      body: {
        challengeId: challenge.challengeId,
        code: mailCode === '000000' ? '999999' : '000000',
      },
    }),
  ),
  400,
);
const verified = await status(
  await verify.POST(
    req('/api/auth/verify', {
      body: { challengeId: challenge.challengeId, code: mailCode },
    }),
  ),
  200,
);
const cookie = verified.headers.get('set-cookie').split(';')[0];
assert.match(
  verified.headers.get('set-cookie'),
  /HttpOnly; SameSite=Lax.*Secure/,
);
await status(
  await verify.POST(
    req('/api/auth/verify', {
      body: { challengeId: challenge.challengeId, code: mailCode },
    }),
  ),
  400,
);
await status(await chat.GET(req('/api/chat', { cookie })), 402);
const user = await auth.getAuthenticatedUser(new Headers({ cookie }));
assert.equal(user.email, 'paid@example.com');
env.CHAT_TESTER_EMAIL = 'paid@example.com';
env.CHAT_TESTER_UNTIL = new Date(Date.now() + 60_000)
  .toISOString()
  .replace(/\.\d{3}Z$/, 'Z');
await status(await chat.GET(req('/api/chat', { cookie })), 200);
await status(
  await chat.GET(req('/api/chat', {
    extra: { 'oai-authenticated-user-email': 'paid@example.com' },
  })),
  401,
);
env.CHAT_TESTER_EMAIL = 'someone-else@example.com';
await status(await chat.GET(req('/api/chat', { cookie })), 402);
env.CHAT_TESTER_EMAIL = 'paid@example.com';
env.CHAT_TESTER_UNTIL = '2020-01-01T00:00:00Z';
await status(await chat.GET(req('/api/chat', { cookie })), 402);
delete env.CHAT_TESTER_EMAIL;
delete env.CHAT_TESTER_UNTIL;
const attemptChallenge = await (
  await requestCode.POST(
    req('/api/auth/request-code', { body: { email: 'attempts@example.com' } }),
  )
).json();
for (let i = 0; i < 5; i++)
  await status(
    await verify.POST(
      req('/api/auth/verify', {
        body: {
          challengeId: attemptChallenge.challengeId,
          code: mailCode === '000000' ? '999999' : '000000',
        },
      }),
    ),
    400,
  );
await status(
  await verify.POST(
    req('/api/auth/verify', {
      body: { challengeId: attemptChallenge.challengeId, code: mailCode },
    }),
  ),
  400,
);
const expired = await (
  await requestCode.POST(
    req('/api/auth/request-code', { body: { email: 'expired@example.com' } }),
  )
).json();
sqlite
  .prepare('UPDATE auth_codes SET expires_at=0 WHERE id=?')
  .run(expired.challengeId);
await status(
  await verify.POST(
    req('/api/auth/verify', {
      body: { challengeId: expired.challengeId, code: mailCode },
    }),
  ),
  400,
);
sqlite
  .prepare(
    'INSERT INTO customers (customer_id,email,last_event_id,last_event_at) VALUES (?,?,?,?)',
  )
  .run('ctm_test', user.email, 'evt_test', '2026-01-01');
sqlite
  .prepare(
    'INSERT INTO subscriptions (subscription_id,customer_id,status,price_id,product_id,last_event_id,last_event_at,scheduled_change_action) VALUES (?,?,?,?,?,?,?,?)',
  )
  .run(
    'sub_test',
    'ctm_test',
    'active',
    'pri_test',
    'pro_test',
    'evt_test',
    '2026-01-01',
    'cancel',
  );
for (const [subscriptionStatus, expected] of [
  ['active', 200],
  ['trialing', 200],
  ['past_due', 200],
  ['paused', 402],
  ['canceled', 402],
  ['active', 200],
]) {
  sqlite.prepare('UPDATE subscriptions SET status=?').run(subscriptionStatus);
  await status(await chat.GET(req('/api/chat', { cookie })), expected);
}
await status(
  await context.PUT(
    req('/api/chat/context', {
      cookie,
      method: 'PUT',
      body: { context: 'Wheat farm in Ukraine' },
    }),
  ),
  200,
);
const body = {
  message: 'Current wheat prices?',
  requestId: crypto.randomUUID(),
};
const sent = await (
  await status(await chat.POST(req('/api/chat', { cookie, body })), 200)
).json();
assert.equal(sent.messages.length, 2);
assert.equal(sent.messages[1].citations.length, 1);
assert.equal(aiCalls.length, 2);
assert.equal(aiCalls[1].tool_choice.type, 'web_search');
assert.match(aiCalls[1].instructions, /Wheat farm in Ukraine/);
await status(await chat.POST(req('/api/chat', { cookie, body })), 200);
assert.equal(aiCalls.length, 2);
await status(
  await chat.GET(req(`/api/chat?id=${sent.chatId}`, { cookie })),
  200,
);

sqlite
  .prepare('INSERT INTO app_users(id,email,created_at) VALUES (?,?,?)')
  .run('other', 'other@example.com', Date.now());
sqlite
  .prepare(
    'INSERT INTO chats(id,user_id,title,created_at,updated_at) VALUES (?,?,?,?,?)',
  )
  .run('private-chat', 'other', 'Private', 1, 1);
await status(await chat.GET(req('/api/chat?id=private-chat', { cookie })), 404);
await status(
  await chat.POST(
    req('/api/chat', {
      cookie,
      body: { ...body, requestId: crypto.randomUUID(), chatId: 'private-chat' },
    }),
  ),
  404,
);
await status(
  await chat.POST(
    req('/api/chat', { cookie, body, extra: { origin: 'https://evil.test' } }),
  ),
  403,
);
await status(
  await chat.POST(
    req('/api/chat', { cookie, body: { ...body, message: 'x'.repeat(6001) } }),
  ),
  400,
);
decision = {
  allowed: false,
  needsLiveData: false,
  refusal: 'Only agriculture.',
};
const beforeRefusal = aiCalls.length;
const declined = await (
  await status(
    await chat.POST(
      req('/api/chat', {
        cookie,
        body: {
          message: 'Write unrelated code',
          requestId: crypto.randomUUID(),
          chatId: sent.chatId,
        },
      }),
    ),
    200,
  )
).json();
assert.equal(declined.messages.at(-1).content, 'Only agriculture.');
assert.equal(aiCalls.length, beforeRefusal + 1);
providerFails = true;
await status(
  await chat.POST(
    req('/api/chat', {
      cookie,
      body: {
        message: 'Wheat?',
        requestId: crypto.randomUUID(),
        chatId: sent.chatId,
      },
    }),
  ),
  503,
);
assert.equal(
  sqlite.prepare('SELECT count(*) AS n FROM chat_messages').get().n,
  4,
);
assert.equal(sqlite.prepare('SELECT count(*) AS n FROM chat_locks').get().n, 0);
providerFails = false;
decision = { allowed: true, needsLiveData: true, refusal: '' };
for (let i = 0; i < 12; i++) {
  const requestId = crypto.randomUUID();
  for (const role of ['user', 'assistant'])
    sqlite
      .prepare(
        'INSERT INTO chat_messages(chat_id,request_id,role,content,citations,created_at) VALUES(?,?,?,?,?,?)',
      )
      .run(
        sent.chatId,
        requestId,
        role,
        'Historic agriculture context',
        '[]',
        Date.now(),
      );
}
const beforeMemory = aiCalls.length;
includeCitations = false;
const noSources = await (
  await status(
    await chat.POST(
      req('/api/chat', {
        cookie,
        body: {
          message: 'Latest prices?',
          requestId: crypto.randomUUID(),
          chatId: sent.chatId,
        },
      }),
    ),
    200,
  )
).json();
assert.equal(aiCalls.length, beforeMemory + 3);
assert.ok(
  sqlite
    .prepare('SELECT summary_through FROM chats WHERE id=?')
    .get(sent.chatId).summary_through > 0,
);
assert.equal(aiCalls.at(-1).input.length, 17);
assert.match(noSources.messages.at(-1).content, /Не вдалося підтвердити/);
assert.equal(noSources.messages.length, 30); // compression preserves full visible history
includeCitations = true;
sqlite
  .prepare('INSERT INTO chat_locks(user_id,token,expires_at) VALUES(?,?,?)')
  .run(user.id, 'lock', Date.now() + 100000);
await status(
  await chat.POST(
    req('/api/chat', {
      cookie,
      body: { ...body, requestId: crypto.randomUUID() },
    }),
  ),
  409,
);
sqlite.prepare('DELETE FROM chat_locks WHERE user_id=?').run(user.id);
env.AI_DAILY_MESSAGE_LIMIT = '1';
await status(
  await chat.POST(
    req('/api/chat', {
      cookie,
      body: { ...body, requestId: crypto.randomUUID() },
    }),
  ),
  429,
);
await status(
  await logout.POST(req('/api/auth/logout', { cookie, method: 'POST' })),
  200,
);
await status(await chat.GET(req('/api/chat', { cookie })), 401);
console.log(
  `PASS: ${checks} handler checks; spoofed access rejected, OTP expiry/attempts/sessions, billing gates, CSRF, ownership, persistence, scope, sourced-only market answers, compressed memory, idempotency, failure recovery and budgets.`,
);
sqlite.close();
