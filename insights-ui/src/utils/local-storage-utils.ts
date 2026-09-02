/**
 * Guarded `localStorage` access. Storage can be unavailable (private mode,
 * quota, the server render), so a failed read counts as "nothing stored" and a
 * failed write is dropped rather than thrown.
 */
export function safeGetLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage may be unavailable
  }
}
