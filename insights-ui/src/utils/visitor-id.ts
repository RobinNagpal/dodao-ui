/** localStorage key. Kept as the LogRocket key so existing visitors keep the id they already have. */
const VISITOR_ID_KEY = 'lr_anon_id';

/**
 * A random id for this browser, created on first use and kept in localStorage.
 * Used to tell anonymous visitors apart (LogRocket, credit purchase interest).
 * When storage is blocked a fresh id is returned on every call.
 */
export function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
  } catch {
    /* fall through */
  }
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto.randomUUID() as string) : `lr_${Math.random().toString(36).slice(2)}${Date.now()}`;
  try {
    localStorage.setItem(VISITOR_ID_KEY, id);
  } catch {
    /* noop */
  }
  return id;
}
