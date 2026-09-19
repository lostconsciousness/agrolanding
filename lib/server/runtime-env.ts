import { env } from 'cloudflare:workers';

type RuntimeEnvironment = Record<string, string | D1Database | undefined>;

export function getRuntimeValue(name: string) {
  const workerValue = (env as RuntimeEnvironment)[name];
  if (typeof workerValue === 'string' && workerValue.length > 0) return workerValue;

  const nodeValue = process.env[name];
  return nodeValue && nodeValue.length > 0 ? nodeValue : undefined;
}

export function requireRuntimeValue(name: string) {
  const value = getRuntimeValue(name);
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
