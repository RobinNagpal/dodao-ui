/**
 * Cache-tag + TTL constants for the commodity report pages.
 *
 * Commodity report content is static JSON (no generation flow) and commodity
 * pages are NOT CloudFront-cached — only the Next.js Data Cache applies. Two
 * things matter for caching:
 *   1. The per-slug/listing Data Cache tags below, which the fetchers attach so
 *      a redeploy (or a future manual purge) can refresh a commodity's pages.
 *   2. The time-based `revalidate` windows the fetchers apply — the listing and
 *      the live (Yahoo-sourced) price history both ride a 1-week TTL; the main
 *      and sub report pages are tag-only (no time-based revalidation).
 */

/** One week — listing TTL + live price-history TTL. */
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
