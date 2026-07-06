import { revalidateTag } from 'next/cache';
import { invalidateCloudFrontPaths } from '@/utils/cloudfront-cache-utils';

/**
 * Cache-tag + CloudFront helpers for commodity report pages, mirroring
 * `etf-cache-utils.ts` but with a far simpler topology (only ~22 commodities,
 * one page subtree per slug).
 *
 * Two independent cache layers back these pages and BOTH must be cleared to
 * avoid serving stale content:
 *   1. Next.js Data Cache — the per-slug fetches (report, price-history,
 *      similar) subscribe to `commoditySlugTag(slug)`; the listing fetch
 *      subscribes to `COMMODITIES_LISTING_TAG`.
 *   2. CloudFront edge — the `/commodities*` page behavior + the per-commodity
 *      GET API endpoints (see `deployments/insights-ui/cloudfront.tf`).
 *
 * A report generation fires ONLY the per-slug layer via `revalidateCommodity`.
 * The listing page is deliberately NOT invalidated on individual report
 * generation — it refreshes on its 1-week TTL (`ONE_WEEK_IN_SECONDS`), matching
 * how the stock/ETF listing pages behave.
 */

/** One week — matches the ETF/stock listing TTL; CloudFront caches the edge for 6 days. */
export const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

const COMMODITY_TAG_PREFIX = 'commodity:' as const;

/**
 * Per-commodity umbrella tag. Every per-slug fetch (report, price-history,
 * similar-commodities) subscribes to it, so one report save refreshes the whole
 * page subtree for that commodity and nothing else.
 */
export const commoditySlugTag = (slug: string): `${typeof COMMODITY_TAG_PREFIX}${string}` => `${COMMODITY_TAG_PREFIX}${slug}`;

/**
 * Listing-page tag. NOT fired on individual report generation — the `/commodities`
 * index refreshes on its 1-week TTL or via an explicit admin cache flush.
 */
export const COMMODITIES_LISTING_TAG = 'commodities:listing' as const;

/** Base path for the per-commodity public GET API endpoints backing `/commodities/[slug]*` (CloudFront-cached). */
const commodityApiBase = (slug: string): string => `/api/koala_gains/commodities-v1/${slug}`;

/**
 * CloudFront paths purged for one commodity: the page subtree (main + the four
 * scored sub-reports) plus the three per-slug API endpoints its pages render from.
 */
const commodityCloudFrontPaths = (slug: string): string[] => [
  `/commodities/${slug}*`,
  `${commodityApiBase(slug)}/report`,
  `${commodityApiBase(slug)}/price-history`,
  `${commodityApiBase(slug)}/similar-commodities`,
];

/**
 * Invalidate a single commodity after a report is generated: clear the Next.js
 * Data Cache slug tag AND purge the CloudFront edge for the page subtree + the
 * per-slug API endpoints. Fire-and-forget — used from the background generation
 * flow. The listing page is intentionally left untouched.
 */
export const revalidateCommodity = (slug: string): void => {
  revalidateTag(commoditySlugTag(slug));
  invalidateCloudFrontPaths(commodityCloudFrontPaths(slug));
};
