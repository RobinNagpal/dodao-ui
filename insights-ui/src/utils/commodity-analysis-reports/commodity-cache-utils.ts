import { revalidateTag } from 'next/cache';

/**
 * Cache-tag + TTL constants (and manual-purge helper) for the commodity report
 * pages.
 *
 * Commodity report content is static JSON (no generation flow), so there is
 * nothing to invalidate on a save. Two things still matter for caching:
 *   1. The per-slug/listing Next.js Data Cache tags below, so the pages can be
 *      purged manually from the admin "Invalidate cache" page (which also purges
 *      CloudFront) — e.g. after publishing a new report JSON.
 *   2. The time-based `revalidate` windows the fetchers apply — the listing and
 *      the live (Yahoo-sourced) price history both ride a 1-week TTL; the main
 *      and sub report pages are tag-only (no time-based revalidation).
 */

/** One week — listing TTL + live price-history TTL; CloudFront caches the edge for 6 days. */
export const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

const COMMODITY_TAG_PREFIX = 'commodity:' as const;

/**
 * Per-commodity umbrella tag. Every per-slug fetch (report, price-history,
 * similar-commodities) subscribes to it, so purging one tag refreshes the whole
 * page subtree for that commodity and nothing else.
 */
export const commoditySlugTag = (slug: string): `${typeof COMMODITY_TAG_PREFIX}${string}` => `${COMMODITY_TAG_PREFIX}${slug}`;

/** Listing-page tag — the `/commodities` index otherwise rides its 1-week TTL. */
export const COMMODITIES_LISTING_TAG = 'commodities:listing' as const;

/** Matches `/commodities` (listing) or `/commodities/<slug>[/...]` (a commodity page tree). */
const COMMODITY_PATH_RE = /^\/commodities(?:\/([^/]+))?(?:\/|$)/;

/**
 * Given the paths pasted into the admin "Invalidate cache" page, revalidate the
 * matching Next.js Data Cache tags so that layer is purged alongside CloudFront.
 * `/commodities` → the listing tag; `/commodities/<slug>...` (or `<slug>*`) → the
 * per-slug tag. Returns the distinct tags revalidated so the UI can report them.
 */
export function revalidateCommodityTagsForPaths(paths: ReadonlyArray<string>): string[] {
  const tags = new Set<string>();
  for (const raw of paths) {
    // Drop any query/hash and a trailing CloudFront wildcard before matching.
    const path = raw.split(/[?#]/)[0].replace(/\*+$/, '');
    const match = COMMODITY_PATH_RE.exec(path);
    if (!match) continue;
    const slug = match[1];
    tags.add(slug ? commoditySlugTag(slug) : COMMODITIES_LISTING_TAG);
  }
  for (const tag of tags) revalidateTag(tag);
  return [...tags];
}
