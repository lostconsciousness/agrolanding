import { env } from 'cloudflare:workers';

type WorkerBindings = { DB?: D1Database };

export function getDatabase() {
  const database = (env as WorkerBindings).DB;
  if (!database) throw new Error('The DB binding is required.');
  return database;
}
