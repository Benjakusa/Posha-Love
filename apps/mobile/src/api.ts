import type { GuestSessionResponse } from '@posha/shared';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:3000/api/v1';

export async function createGuestSession(): Promise<GuestSessionResponse> {
  const res = await fetch(`${API_BASE}/guest/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ageDeclaration: true }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as GuestSessionResponse;
}
