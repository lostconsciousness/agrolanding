import { Environment, LogLevel, Paddle, type PaddleOptions, Webhooks } from '@paddle/paddle-node-sdk';
import { getRuntimeValue, requireRuntimeValue } from '@/lib/server/runtime-env';

const webhookVerifier = new Webhooks();

export function getWebhookVerifier() {
  return webhookVerifier;
}

export function getWebhookSigningSecret() {
  const secret =
    getRuntimeValue('PADDLE_NOTIFICATION_WEBHOOK_SECRET') ??
    getRuntimeValue('PADDLE_WEBHOOK_SECRET');

  if (!secret) throw new Error('PADDLE_NOTIFICATION_WEBHOOK_SECRET is required.');
  return secret;
}

export function getPaddleInstance() {
  const environmentValue = requireRuntimeValue('PADDLE_ENVIRONMENT');
  if (environmentValue !== Environment.production) {
    throw new Error('PADDLE_ENVIRONMENT must be set to production for the live Paddle account.');
  }

  const options: PaddleOptions = {
    environment: Environment.production,
    logLevel: LogLevel.error,
  };

  return new Paddle(requireRuntimeValue('PADDLE_API_KEY'), options);
}
