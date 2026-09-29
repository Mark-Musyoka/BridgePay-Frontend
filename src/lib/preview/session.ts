/**
 * Preview mode — lets the app be explored with built-in sample data when
 * no backend is running (e.g. local UI work before the API is deployed).
 *
 * SAFETY: this whole feature is opt-in at build time. It only exists
 * when NEXT_PUBLIC_PREVIEW_MODE=true, which must never be set in a
 * production or staging deployment. When it's not set, PREVIEW_ENABLED
 * is false, no preview session can be started, and the sample-data
 * module is never even loaded. It is also NOT an auth bypass in any
 * sense that matters: it only ever serves canned fixtures on the
 * client — no real endpoint, token, or user data is involved.
 */

export type PreviewRole = 'user' | 'admin';

export const PREVIEW_ENABLED = process.env.NEXT_PUBLIC_PREVIEW_MODE === 'true';

const STORAGE_KEY = 'bp-preview-role';
const CHANGE_EVENT = 'bp-preview-change';

/** The active preview role, or null if not in a preview session (or preview mode is off). */
export function getPreviewRole(): PreviewRole | null {
  if (!PREVIEW_ENABLED || typeof window === 'undefined') return null;
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    return value === 'user' || value === 'admin' ? value : null;
  } catch {
    return null; // storage blocked — behave as "not in preview"
  }
}

export function isPreviewActive(): boolean {
  return getPreviewRole() !== null;
}

// sessionStorage (not localStorage) on purpose: a preview session ends
// when the tab closes, so it can't linger and confuse a later real login.
export function startPreviewSession(role: PreviewRole): void {
  if (!PREVIEW_ENABLED || typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, role);
  } catch {
    // storage blocked — the session simply won't start
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function endPreviewSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clean up if storage is blocked
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribePreview(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
