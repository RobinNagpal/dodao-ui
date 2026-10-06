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
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}
