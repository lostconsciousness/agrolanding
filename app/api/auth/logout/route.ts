import { revokeSession } from '@/lib/server/auth';
import { apiError, assertSameOrigin, json } from '@/lib/server/http';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const response = json({ ok: true });
    response.headers.set('Set-Cookie', await revokeSession(request));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
