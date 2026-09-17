type PaddleWebhookEvent = {
  event_id?: string;
  event_type?: string;
  occurred_at?: string;
  data?: unknown;
};

const encoder = new TextEncoder();
const WEBHOOK_TOLERANCE_SECONDS = 5;

function fromHex(value: string) {
  if (!/^[a-f0-9]+$/i.test(value) || value.length % 2 !== 0) return null;

  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }

  return bytes;
}

function parseSignatureHeader(header: string) {
  const values = header.split(';').reduce<Record<string, string[]>>((result, part) => {
    const [key, value] = part.trim().split('=', 2);
    if (!key || !value) return result;
    result[key] = [...(result[key] ?? []), value];
    return result;
  }, {});

  return {
    timestamp: values.ts?.[0],
    signatures: values.h1 ?? [],
  };
}

async function verifyPaddleSignature(rawBody: string, signatureHeader: string, secret: string) {
  const { timestamp, signatures } = parseSignatureHeader(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;
  if (Math.abs(Date.now() / 1000 - timestampNumber) > WEBHOOK_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const signedPayload = encoder.encode(`${timestamp}:${rawBody}`);

  for (const signature of signatures) {
    const signatureBytes = fromHex(signature);
    if (!signatureBytes) continue;
    if (await crypto.subtle.verify('HMAC', key, signatureBytes, signedPayload)) return true;
  }

  return false;
}

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ error: 'Paddle webhook is not configured' }, { status: 503 });
  }

  const signature = request.headers.get('paddle-signature');
  if (!signature) {
    return Response.json({ error: 'Missing Paddle-Signature header' }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!(await verifyPaddleSignature(rawBody, signature, secret))) {
    return Response.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let event: PaddleWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaddleWebhookEvent;
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  // Verified events are ready to be persisted or queued when account provisioning is added.
  console.info('Verified Paddle webhook', {
    eventId: event.event_id,
    eventType: event.event_type,
    occurredAt: event.occurred_at,
  });

  return Response.json({ received: true });
}
