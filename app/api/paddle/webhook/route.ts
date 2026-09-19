import { processPaddleEvent } from '@/lib/server/process-paddle-event';
import { getWebhookSigningSecret, getWebhookVerifier } from '@/lib/server/paddle';

export async function POST(request: Request) {
  const signature = request.headers.get('paddle-signature') ?? '';
  const rawBody = await request.text();

  if (!signature || !rawBody) {
    return Response.json({ error: 'Missing signature or body.' }, { status: 400 });
  }

  try {
    const event = await getWebhookVerifier().unmarshal(
      rawBody,
      getWebhookSigningSecret(),
      signature,
    );

    await processPaddleEvent(event);
    return Response.json({ received: true });
  } catch (error) {
    console.error('Paddle webhook failed', error);
    return Response.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
