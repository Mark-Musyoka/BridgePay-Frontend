/**
 * Authentication and Cookie storage helpers
 */

const TOKEN_STORAGE_KEY = 'bridgepay_auth_token';
const USER_STORAGE_KEY = 'bridgepay_user';

export function getClientToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setClientToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function removeClientToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_STORAGE_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_STORAGE_KEY);
}
