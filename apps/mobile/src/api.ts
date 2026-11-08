import type { GuestSessionResponse } from '@posha/shared';

// HARDCODED for testing. Change this IP if your laptop's LAN IP changes.
export const API_BASE = 'http://10.223.163.53:3000/api/v1';
console.log('[API_BASE]', API_BASE);

export async function createGuestSession(): Promise<GuestSessionResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/guest/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ageDeclaration: true }),
      signal: controller.signal,
    });
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error(`API timeout — cannot reach ${API_BASE}`);
    }
    throw new Error(`Network error: ${e?.message ?? 'unknown'}`);
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as GuestSessionResponse;
}

export type Subscription = {
  id: string;
  userId: string;
  creatorAlias: string;
  plan: string;
  priceMinor: number;
  currency: string;
  status: 'active' | 'expired';
  createdAt: number;
  expiresAt: number;
};

export async function listMySubscriptions(token: string): Promise<Subscription[]> {
  const res = await fetch(`${API_BASE}/subscriptions/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`list subscriptions HTTP ${res.status}`);
  const json = (await res.json()) as { subscriptions: Subscription[] };
  return json.subscriptions;
}

export async function subscribeToCreator(
  token: string,
  creatorId: string,
  amountMinor: number,
): Promise<{ ok: true }> {
  // 1. Create checkout
  const checkoutRes = await fetch(`${API_BASE}/subscriptions/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ creatorId, amountMinor }),
  });
  if (!checkoutRes.ok) {
    const e = await checkoutRes.json().catch(() => ({}));
    throw new Error(e.code ?? `checkout HTTP ${checkoutRes.status}`);
  }
  const { paymentId, status } = await checkoutRes.json();
  if (status === 'succeeded') return { ok: true };

  // 2. Fake-pay (dev provider)
  const payRes = await fetch(`${API_BASE}/subscriptions/fake-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ paymentId }),
  });
  if (!payRes.ok) {
    const e = await payRes.json().catch(() => ({}));
    throw new Error(e.code ?? `pay HTTP ${payRes.status}`);
  }
  return { ok: true };
}

// Legacy alias kept for Explore/other callers — resolves alias to no-op (should be removed later)
export async function createSubscription(
  _token: string, _creatorAlias: string, _plan: string, _priceMinor: number,
): Promise<any> {
  throw new Error('createSubscription is deprecated — use subscribeToCreator(token, creatorId, amountMinor)');
}

// ===== Creator endpoints =====

export type CreatorProfile = {
  id: string;
  displayName: string;
  handle: string;
  bio: string | null;
  avatarKey: string | null;
  coverKey: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  subscriptionPriceMinor: number;
  createdAt: string;
};

export type CreatorMe = {
  status: "pending" | "approved" | "rejected";
  application: (Omit<CreatorProfile, "id" | "createdAt"> & { submittedAt: string }) | null;
  profile: CreatorProfile | null;
  content: { videos: any[]; lives: any[] };
  stats: { subscribers: number; earningsMinor: number; videos: number; scheduledLives: number };
} | null;

export async function getCreatorMe(token: string): Promise<CreatorMe> {
  const res = await fetch(`${API_BASE}/creator/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as CreatorMe;
}

export async function presignAvatar(
  token: string,
  contentType: string,
): Promise<{ uploadUrl: string; key: string; publicUrl: string } | null> {
  const res = await fetch(`${API_BASE}/creator/presign-avatar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ contentType }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function uploadAvatarToR2(
  uploadUrl: string,
  uri: string,
  contentType: string,
): Promise<boolean> {
  try {
    const blob = await (await fetch(uri)).blob();
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function applyAsCreator(
  token: string,
  body: {
    displayName: string;
    handle: string;
    bio?: string;
    avatarKey?: string;
    subscriptionPriceMinor: number;
    rulesAccepted: boolean;
  },
): Promise<{ status: 'pending' } | { error: string }> {
  const url = `${API_BASE}/creator/apply`;
  console.log('[applyAsCreator] POST', url, 'tokenLen', token.length);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    console.log('[applyAsCreator] response status', res.status);
    if (!res.ok) {
      const text = await res.text();
      console.log('[applyAsCreator] error body', text);
      let code = 'UNKNOWN';
      try { code = JSON.parse(text).code ?? 'UNKNOWN'; } catch {}
      return { error: code };
    }
    return res.json();
  } catch (e) {
    console.log('[applyAsCreator] fetch threw:', String(e));
    return { error: 'NETWORK_ERROR' };
  }
}

// ===== Subscriptions =====

export async function checkoutSubscription(
  token: string,
  creatorId: string,
  amountMinor: number,
): Promise<{ paymentId: string; status: string }> {
  const res = await fetch(`${API_BASE}/subscriptions/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ creatorId, amountMinor }),
  });
  if (!res.ok) throw new Error('checkout failed');
  return res.json();
}

export async function fakePaySubscription(
  token: string,
  paymentId: string,
): Promise<{ ok: true; subscriptionId: string }> {
  const res = await fetch(`${API_BASE}/subscriptions/fake-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ paymentId }),
  });
  if (!res.ok) throw new Error('payment failed');
  return res.json();
}

export async function mySubscriptions(token: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/subscriptions/entitlements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function presignCreatorImage(token: string, kind: 'avatar' | 'cover', contentType: string) {
  const res = await fetch(`${API_BASE}/creator/presign-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ kind, contentType }),
  });
  if (!res.ok) throw new Error('Image upload preparation failed');
  return res.json() as Promise<{ uploadUrl: string; key: string }>;
}

export async function uploadImageToR2(uploadUrl: string, uri: string, contentType: string) {
  const blob = await (await fetch(uri)).blob();
  const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: blob });
  if (!res.ok) throw new Error('Image upload failed');
}

export async function updateCreatorProfile(token: string, body: {
  displayName: string; handle: string; bio: string;
  avatarKey?: string | null; coverKey?: string | null; subscriptionPriceMinor: number;
}) {
  const res = await fetch(`${API_BASE}/creator/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.code ?? `Profile update failed (${res.status})`);
  }
  return res.json();
}
