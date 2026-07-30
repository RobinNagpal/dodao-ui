/**
 * Delayed `lastmod` for sitemap entries whose pages are CloudFront-cached.
 *
 * CloudFront caches /stocks/* and /etfs/* pages for up to ~6 days, and the
 * automated save pipelines no longer purge the edge on every write (see
 * `cloudfront-cache-utils.ts` — purges are reserved for admin actions).
 * That means a page updated moments ago can keep serving the previous
 * version from the edge until its TTL expires.
 *
 * If the sitemap advertised the real `updatedAt`, a crawler could fetch the
 * page right away and receive edge-cached content OLDER than the advertised
 * `lastmod` — an inconsistency that wastes crawl budget and can hurt trust in
 * our sitemap dates. Instead we clamp `lastmod` to at most `now - 7 days`:
 *
 *  - Updated more than 7 days ago → the true date is shown (the edge TTL has
 *    rolled over by now, so crawlers are guaranteed the fresh content).
 *  - Updated within the last 7 days → we keep showing `now - 7 days` until the
 *    update is a week old, then the true date surfaces. The recent update is
 *    simply not announced until every edge cache is guaranteed to serve it.
 *  - Never earlier than `createdAt` — a brand-new page has no stale cached
 *    copy (the first request fills the edge with fresh content), so its
 *    creation date is shown as-is and crawlers can pick it up immediately.
 */
export const SITEMAP_LASTMOD_DELAY_DAYS = 7;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns the sitemap `lastmod` date string (YYYY-MM-DD) for a record:
 * `max(createdAt, min(updatedAt, now - 7 days))`. Returns `undefined` when
 * `updatedAt` is missing so the `<lastmod>` tag is omitted entirely.
 */
export function delayedSitemapLastmod(updatedAt: Date | string | null | undefined, createdAt?: Date | string | null): string | undefined {
  if (!updatedAt) return undefined;
  const updated = new Date(updatedAt);
  const cutoff = new Date(Date.now() - SITEMAP_LASTMOD_DELAY_DAYS * ONE_DAY_MS);
  let shown = updated <= cutoff ? updated : cutoff;
  if (createdAt) {
    const created = new Date(createdAt);
    if (created > shown) shown = created;
  }
  return shown.toISOString().split('T')[0];
}
