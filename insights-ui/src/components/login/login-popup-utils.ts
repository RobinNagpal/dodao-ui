// Shared client-side helpers for the login popups (nav-count auto prompt + scroll-end triggers).
// Pure functions with no React/JSX, so they are safe to import into any 'use client' component
// without dragging extra runtime in. Keeping them in one place avoids the three-way copy-paste
// that the bot/cooldown/storage logic was drifting into.

const BOT_UA_PATTERN =
  /bot|crawler|spider|crawling|slurp|bingpreview|mediapartners|adsbot|googlebot|baiduspider|yandex|duckduckbot|facebot|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|pinterest|whatsapp|telegrambot|applebot|petalbot|semrush|ahrefs|mj12bot|dotbot|seznambot|sogou|exabot|gigabot|ia_archiver|chrome-lighthouse|headlesschrome|phantomjs|prerender/i;

/**
 * Heuristic "is this a crawler / automated agent" check. Used to keep the login popup from ever
 * rendering for search-engine bots, so Google never sees an interstitial on a content page
 * (the intrusive-interstitial SEO risk). Defaults to treating an unknown environment as a bot.
 */
export function isLikelyBot(): boolean {
  if (typeof navigator === 'undefined') return true;
  if (navigator.webdriver === true) return true;
  return BOT_UA_PATTERN.test(navigator.userAgent || '');
}

/** True if the popup was dismissed recently enough (within `cooldownMs`) that we should stay quiet. */
export function isInCooldown(dismissedAtKey: string, cooldownMs: number): boolean {
  try {
    const raw = localStorage.getItem(dismissedAtKey);
    if (!raw) return false;
    const dismissedAt = Number.parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < cooldownMs;
  } catch {
    return false;
  }
}

export function safeGetSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    // sessionStorage may be unavailable (Safari private mode, etc.)
    return null;
  }
}

export function safeSetSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // sessionStorage may be unavailable (Safari private mode, etc.)
  }
}

export function safeSetLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage may be unavailable
  }
}
