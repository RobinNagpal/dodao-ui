/**
 * Delayed `lastmod` for sitemap entries whose pages are CloudFront-cached.
 *
 * CloudFront caches /stocks/* and /etfs/* pages for 6 days (fixed TTL, see
 * `deployments/insights-ui/cloudfront.tf`), and the automated save pipelines
 * no longer purge the edge on every write (see `cloudfront-cache-utils.ts` —
 * purges are reserved for admin actions and one-shot first-generation
 * purges). That means a page updated moments ago can keep serving the
 * previous version from the edge until its TTL expires.
 *
 * If the sitemap advertised the real `updatedAt`, a crawler could fetch the
 * page and receive edge-cached content OLDER than the advertised `lastmod` —
 * a date inconsistency that erodes trust in our sitemap dates. So while an
 * update is less than 7 days old (edge TTL 6 days + 1 day margin) we
 * advertise `updatedAt - 7 days` instead:
 *
 *  - Update older than 7 days → the true date is shown (every edge cache has
 *    rolled over by now, so the date is accurate and safe).
 *  - Update within the last 7 days → show `updatedAt - 7 days`. This is a
 *    STABLE value (not a `now`-based sliding date, which would advance every
 *    day and look like daily changes to Google): each real update produces
 *    exactly two advertised values — `updatedAt - 7d` during the mask window,
 *    then the true `updatedAt`. Both are ≤ `now - 7d` while shown, so the
 *    advertised date is never newer than what any edge cache serves. Note
 *    this delays the announcement, it does not prevent an early crawl — a
 *    crawler may still fetch during the window; it just finds content
 *    consistent with (or newer than) the advertised date.
 *  - Never earlier than `createdAt` — a brand-new page's creation date is
 *    shown as-is so crawlers can pick it up immediately. First-generation
 *    edge purges (see the save-callback pipelines) ensure a pre-generation
 *    thin page isn't left pinned at the edge when this happens.
 */
export const SITEMAP_LASTMOD_DELAY_DAYS = 7;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns the sitemap `lastmod` date string (YYYY-MM-DD) for a record:
 * `max(createdAt, updatedAt older than 7 days ? updatedAt : updatedAt - 7 days)`.
 * Returns `undefined` when `updatedAt` is missing so the `<lastmod>` tag is
 * omitted entirely.
 */
export function delayedSitemapLastmod(updatedAt: Date | string | null | undefined, createdAt?: Date | string | null): string | undefined {
  if (!updatedAt) return undefined;
  const updated = new Date(updatedAt);
  const cutoff = new Date(Date.now() - SITEMAP_LASTMOD_DELAY_DAYS * ONE_DAY_MS);
  let shown = updated <= cutoff ? updated : new Date(updated.getTime() - SITEMAP_LASTMOD_DELAY_DAYS * ONE_DAY_MS);
  if (createdAt) {
    const created = new Date(createdAt);
    if (created > shown) shown = created;
  }
  return shown.toISOString().split('T')[0];
}
