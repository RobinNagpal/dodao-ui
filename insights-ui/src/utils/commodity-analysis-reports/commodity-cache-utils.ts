/**
 * Cache-tag + TTL constants for the commodity report pages.
 *
 * Commodity report content is static JSON (no generation flow), so there is
 * nothing to invalidate on a save. Two things still matter for caching:
 *   1. The per-slug/listing Next.js Data Cache tags below, so the pages can be
 *      purged manually (e.g. after publishing a new report JSON) via the admin
 *      "Invalidate cache" page or a redeploy.
 *   2. The time-based `revalidate` windows the fetchers apply — the listing
 *      rides a 1-week TTL (matching the ETF/stock listings) and the live price
 *      history rides a 1-day TTL so quotes stay reasonably fresh.
 */

/** One week — matches the ETF/stock listing TTL; CloudFront caches the edge for 6 days. */
export const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

/** One day — refresh window for the live (Yahoo-sourced) commodity price history. */
export const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

const COMMODITY_TAG_PREFIX = 'commodity:' as const;

/**
 * Per-commodity umbrella tag. Every per-slug fetch (report, price-history,
 * similar-commodities) subscribes to it, so purging one tag refreshes the whole
 * page subtree for that commodity and nothing else.
 */
export const commoditySlugTag = (slug: string): `${typeof COMMODITY_TAG_PREFIX}${string}` => `${COMMODITY_TAG_PREFIX}${slug}`;

/** Listing-page tag — the `/commodities` index otherwise rides its 1-week TTL. */
export const COMMODITIES_LISTING_TAG = 'commodities:listing' as const;
