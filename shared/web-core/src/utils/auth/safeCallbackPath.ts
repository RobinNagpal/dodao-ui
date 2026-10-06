/** Query param that carries the page to return to through the email-login link. */
export const LOGIN_CALLBACK_PATH_QUERY_PARAM = 'callbackPath';

const MAX_CALLBACK_PATH_LENGTH = 2048;
const PLACEHOLDER_ORIGIN = 'http://localhost';

/**
 * Returns `path` normalized to a same-origin relative path (`/x?y#z`), or
 * undefined when it is not one. Guards the post-login redirect against open
 * redirects: absolute URLs (`https://evil.com`), protocol-relative URLs
 * (`//evil.com`), backslash tricks (`/\evil.com`) and `javascript:` URLs are all
 * rejected.
 */
export function getSafeCallbackPath(path: string | null | undefined): string | undefined {
  if (typeof path !== 'string') {
    return undefined;
  }
  const trimmed = path.trim();
  if (!trimmed || trimmed.length > MAX_CALLBACK_PATH_LENGTH) {
    return undefined;
  }
  // Must be a single leading slash; browsers treat `//` and `/\` as protocol-relative.
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return undefined;
  }
  // No control characters (tabs/newlines are stripped by URL parsers and can hide a `//`).
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
    return undefined;
  }
  try {
    const url = new URL(trimmed, PLACEHOLDER_ORIGIN);
    if (url.origin !== PLACEHOLDER_ORIGIN) {
      return undefined;
    }
    const normalized = `${url.pathname}${url.search}${url.hash}`;
    // Dot-segment normalization can turn a safe-looking input into a protocol-relative
    // one (`/.//evil.com`, `/..//evil.com`, `/%2e//evil.com` → `//evil.com`), so the
    // result is checked again.
    if (!normalized.startsWith('/') || normalized.startsWith('//') || normalized.includes('\\')) {
      return undefined;
    }
    return normalized;
  } catch {
    return undefined;
  }
}

/**
 * Like `getSafeCallbackPath`, but also accepts an absolute URL on `origin` (what
 * NextAuth puts in `?callbackUrl=`) and reduces it to its path. URLs on any other
 * origin are rejected.
 */
export function getSafeCallbackPathFromUrl(urlOrPath: string | null | undefined, origin: string): string | undefined {
  if (typeof urlOrPath !== 'string') {
    return undefined;
  }
  const trimmed = urlOrPath.trim();
  if (trimmed.startsWith('/')) {
    return getSafeCallbackPath(trimmed);
  }
  try {
    const url = new URL(trimmed);
    if (url.origin !== new URL(origin).origin) {
      return undefined;
    }
    return getSafeCallbackPath(`${url.pathname}${url.search}${url.hash}`);
  } catch {
    return undefined;
  }
}

/** `/login`, carrying `callbackPath` (when it is a safe same-origin path) so login returns the user there. */
export function getLoginPathWithCallback(callbackPath: string | null | undefined): string {
  const safePath = getSafeCallbackPath(callbackPath);
  if (!safePath || safePath === '/' || safePath.startsWith('/login')) {
    return '/login';
  }
  return `/login?${new URLSearchParams({ [LOGIN_CALLBACK_PATH_QUERY_PARAM]: safePath }).toString()}`;
}
