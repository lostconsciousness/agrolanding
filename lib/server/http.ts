export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return json({ error: error.message }, error.status);
  console.error(
    'Application request failed',
    error instanceof Error ? error.name : 'UnknownError',
  );
  return json(
    { error: 'Сервіс тимчасово недоступний. Спробуйте ще раз.' },
    503,
  );
}
export function assertSameOrigin(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    throw new HttpError(403, 'Недозволене джерело запиту.');
}
export async function readJson(
  request: Request,
  maxBytes = 20000,
): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new HttpError(415, 'Очікується JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Порожній запит.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, 'Запит завеликий.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new Error();
    return body;
  } catch {
    throw new HttpError(400, 'Некоректний JSON.');
  }
}
