export interface AuthenticatedUser {
  id: string;
  email: string;
}

export function getAuthenticatedUser(requestHeaders: Headers): AuthenticatedUser | null {
  const id = requestHeaders.get('oai-authenticated-user-id')?.trim();
  const email = requestHeaders.get('oai-authenticated-user-email')?.trim().toLowerCase();

  if (!id || !email) return null;
  return { id, email };
}
