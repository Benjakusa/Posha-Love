import * as SecureStore from 'expo-secure-store';
import type { GuestSessionResponse } from '@posha/shared';

const KEY = 'posha.session.v1';

export async function saveSession(s: GuestSessionResponse): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(s));
  } catch {
    // storage unavailable — silently ignore
  }
}

export async function loadSession(): Promise<GuestSessionResponse | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestSessionResponse;
    // basic shape check
    if (!parsed?.token || !parsed?.alias || !parsed?.role) return null;
    // reject if past the stored expiry
    if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
      await SecureStore.deleteItemAsync(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    // ignore
  }
}
