import { revalidateTag } from 'next/cache';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { CloudFrontInvalidationResult, invalidateCloudFrontPaths, invalidateCloudFrontPathsAwaited } from './cloudfront-cache-utils';

/**
 * Cache-tag helpers for per-ETF revalidation.
 *
 * Each of the 7 pages under `/etfs/[exchange]/[etf]` subscribes to exactly ONE
 * tag (mirrors the stocks topology in `docs/insights-ui/stock-page-caching.md`):
 *
 *   /etfs/<E>/<T>                         ← etfAndExchangeTag (umbrella, only the main page)
 *   /etfs/<E>/<T>/performance-returns     ← etfCategoryReportTag(s, e, PerformanceAndReturns)
 *   /etfs/<E>/<T>/cost-efficiency-team    ← etfCategoryReportTag(s, e, CostEfficiencyAndTeam)
 *   /etfs/<E>/<T>/risk-analysis           ← etfCategoryReportTag(s, e, RiskAnalysis)
 *   /etfs/<E>/<T>/future-performance-outlook ← etfCategoryReportTag(s, e, FuturePerformanceOutlook)
 *   /etfs/<E>/<T>/competition             ← etfCompetitionTag
 *   /etfs/<E>/<T>/holdings                ← etfHoldingsTag
 *
 * Savers fire the narrow tag for the data they touched plus the umbrella
 * (which only the main page reads). That way a category save invalidates two
 * pages (main + the one subpage) instead of all seven.
 *
 * Each `revalidate*` helper also purges the CloudFront edge cache for the
 * corresponding page URL AND the per-ETF GET API endpoint(s) that page renders
 * from. CloudFront caches both layers (6-day TTL); purging only the page would
 * leave the next render to re-fetch a stale API response from the edge. See
 * `cloudfront-cache-utils.ts` (and `ticker-v1-cache-utils.ts` for the stocks
 * equivalent). The cached per-ETF endpoints are enumerated in
 * `deployments/insights-ui/cloudfront.tf`.
 */
const ETF_EXCHANGE_TAG_PREFIX = 'etf_exchange:' as const;

/** Maps the analysis-category enum to its URL slug under `/etfs/{e}/{s}/`. */
const ETF_CATEGORY_TO_PATH: Record<EtfAnalysisCategory, string> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: 'performance-returns',
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: 'cost-efficiency-team',
  [EtfAnalysisCategory.RiskAnalysis]: 'risk-analysis',
  [EtfAnalysisCategory.FuturePerformanceOutlook]: 'future-performance-outlook',
};

/** Base path for the per-ETF GET API endpoints that back `/etfs/[exchange]/[etf]/*` (CloudFront-cached). */
const etfApiBase = (symbol: string, exchange: string) => `/api/koala_gains/etfs-v1/exchange/${exchange.toUpperCase()}/${symbol.toUpperCase()}`;

export const etfAndExchangeTag = (symbol: string, exchange: string): `${typeof ETF_EXCHANGE_TAG_PREFIX}${string}` =>
  `${ETF_EXCHANGE_TAG_PREFIX}_${symbol.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateEtfAndExchangeTag = (symbol: string, exchange: string) => {
  revalidateTag(etfAndExchangeTag(symbol, exchange));
  // Main page renders from `/full-render` (report body) + `/chart-data` (price chart slice).
  // Both fetches carry this umbrella tag, so purge both at the edge.
  invalidateCloudFrontPaths([`/etfs/${exchange}/${symbol}`, `${etfApiBase(symbol, exchange)}/full-render`, `${etfApiBase(symbol, exchange)}/chart-data`]);
};

/** Per-category subpage tag — used by the 4 `EtfAnalysisCategory` subpages. */
export const etfCategoryReportTag = (symbol: string, exchange: string, category: EtfAnalysisCategory): string =>
  `etf_category_report:_${symbol.toUpperCase()}_${exchange.toUpperCase()}_${category}`;

export const revalidateEtfCategoryReportTag = (symbol: string, exchange: string, category: EtfAnalysisCategory) => {
  revalidateTag(etfCategoryReportTag(symbol, exchange, category));
  // Each category subpage renders from its `{slug}-data` GET endpoint; Performance & Returns also
  // reads `/mor-info`. (The umbrella tag, fired alongside by the saver, separately purges the main
  // page's `/full-render` + `/chart-data`.)
  const slug = ETF_CATEGORY_TO_PATH[category];
  const apiPaths = [`${etfApiBase(symbol, exchange)}/${slug}-data`];
  if (category === EtfAnalysisCategory.PerformanceAndReturns) {
    apiPaths.push(`${etfApiBase(symbol, exchange)}/mor-info`);
  }
  invalidateCloudFrontPaths([`/etfs/${exchange}/${symbol}/${slug}`, ...apiPaths]);
};

/** Competition subpage tag — used by `/competition`. */
export const etfCompetitionTag = (symbol: string, exchange: string): string => `etf_competition:_${symbol.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateEtfCompetitionTag = (symbol: string, exchange: string) => {
  revalidateTag(etfCompetitionTag(symbol, exchange));
  // The competition subpage renders from the public `/competition` GET (plus the uncached base
  // `/exchange/{e}/{t}` fast route). Purge the page URL and the cached `/competition` endpoint.
  invalidateCloudFrontPaths([`/etfs/${exchange}/${symbol}/competition`, `${etfApiBase(symbol, exchange)}/competition`]);
};

/** Holdings subpage tag — used by `/holdings`. Fired only when `EtfMorPortfolioInfo` is written. */
export const etfHoldingsTag = (symbol: string, exchange: string): string => `etf_holdings:_${symbol.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateEtfHoldingsTag = (symbol: string, exchange: string) => {
  revalidateTag(etfHoldingsTag(symbol, exchange));
  invalidateCloudFrontPaths([`/etfs/${exchange}/${symbol}/holdings`, `${etfApiBase(symbol, exchange)}/portfolio-holdings`]);
};

/**
 * Invalidate every per-ETF cache. Use from admin "Invalidate cache" / bulk reset paths.
 * Uses two CloudFront wildcard invalidations (one for pages, one for the per-ETF API
 * endpoints) so it counts as 2 billable paths against the monthly free quota.
 */
export const revalidateAllEtfTags = (symbol: string, exchange: string) => {
  revalidateTag(etfAndExchangeTag(symbol, exchange));
  revalidateTag(etfCompetitionTag(symbol, exchange));
  revalidateTag(etfHoldingsTag(symbol, exchange));
  for (const category of Object.values(EtfAnalysisCategory)) {
    revalidateTag(etfCategoryReportTag(symbol, exchange, category));
  }
  invalidateCloudFrontPaths([`/etfs/${exchange}/${symbol}*`, `${etfApiBase(symbol, exchange)}*`]);
};

/**
 * Awaited variant of `revalidateAllEtfTags`. Use from the admin-facing
 * "Invalidate cache" / "Flush Cache" actions so the user gets real
 * success/failure feedback from CloudFront instead of an always-success
 * fire-and-forget call.
 */
export const revalidateAllEtfTagsAwaited = async (symbol: string, exchange: string): Promise<CloudFrontInvalidationResult> => {
  revalidateTag(etfAndExchangeTag(symbol, exchange));
  revalidateTag(etfCompetitionTag(symbol, exchange));
  revalidateTag(etfHoldingsTag(symbol, exchange));
  for (const category of Object.values(EtfAnalysisCategory)) {
    revalidateTag(etfCategoryReportTag(symbol, exchange, category));
  }
  return invalidateCloudFrontPathsAwaited([`/etfs/${exchange}/${symbol}*`, `${etfApiBase(symbol, exchange)}*`]);
};

/**
 * Listing-page cache tags. One tag per (page-type, country) tuple so each
 * listing surface invalidates independently. ETF report saves do NOT fire
 * these — listings refresh on the 1-week TTL or on explicit admin action.
 */
const ETF_LISTINGS_PREFIX = 'etf_listings' as const;

// ETF listing pages cache their data for one week in the Next.js Data Cache,
// matching the stock listing pages (which use the same 7-day window). The
// CloudFront edge caches the same routes for 6 days (see `cloudfront.tf`).
export const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

export const getEtfGroupsIndexTag = (country: string): string => `${ETF_LISTINGS_PREFIX}:groups-index:${country.toUpperCase()}`;
export const getEtfGroupDetailTag = (country: string, groupKey: string): string => `${ETF_LISTINGS_PREFIX}:group:${country.toUpperCase()}:${groupKey}`;
export const getEtfAssetClassesIndexTag = (country: string): string => `${ETF_LISTINGS_PREFIX}:asset-classes-index:${country.toUpperCase()}`;
export const getEtfProvidersIndexTag = (country: string): string => `${ETF_LISTINGS_PREFIX}:providers-index:${country.toUpperCase()}`;
export const getEtfListingFilterableTag = (country: string): string => `${ETF_LISTINGS_PREFIX}:filterable:${country.toUpperCase()}`;

export const revalidateEtfGroupsIndexTag = (country: string) => {
  revalidateTag(getEtfGroupsIndexTag(country));
  invalidateCloudFrontPaths([`/etfs/countries/${country}`]);
};

export const revalidateEtfGroupDetailTag = (country: string, groupKey: string) => {
  revalidateTag(getEtfGroupDetailTag(country, groupKey));
  invalidateCloudFrontPaths([`/etfs/groups/${groupKey}`, `/etfs/countries/${country}/groups/${groupKey}`]);
};

export const revalidateEtfAssetClassesIndexTag = (country: string) => {
  revalidateTag(getEtfAssetClassesIndexTag(country));
  invalidateCloudFrontPaths([`/etfs/asset-classes`, `/etfs/countries/${country}/asset-classes`]);
};

export const revalidateEtfProvidersIndexTag = (country: string) => {
  revalidateTag(getEtfProvidersIndexTag(country));
  invalidateCloudFrontPaths([`/etfs/providers`, `/etfs/countries/${country}/providers`]);
};

/**
 * `etf_listings:filterable:{country}` is read by `/etfs/countries/{country}`
 * (CloudFront-cached) and `/etfs-filtered/*` (not cached — different path
 * pattern that doesn't match the `/etfs/*` behavior). Only the cached path
 * needs purging.
 */
export const revalidateEtfListingFilterableTag = (country: string) => {
  revalidateTag(getEtfListingFilterableTag(country));
  invalidateCloudFrontPaths([`/etfs/countries/${country}`]);
};

/**
 * Identifies which Next.js Data Cache tag backs a given ETF listing surface, so
 * the admin "Revalidate This Listing" action can refresh the right one. Only the
 * index + group pages are tag-cached; the filter-based detail pages
 * (provider / asset-class / category) are uncached (`revalidate: 0`) and have no
 * tag, so they pass `undefined` and rely solely on the CloudFront page purge.
 */
export type EtfListingCacheTag =
  | { kind: 'groups-index'; country: string }
  | { kind: 'group-detail'; country: string; groupKey: string }
  | { kind: 'asset-classes-index'; country: string }
  | { kind: 'providers-index'; country: string };

/**
 * Revalidate ONLY the Next.js Data Cache tag for a listing surface. The caller is
 * responsible for the CloudFront edge purge (the two cache layers are
 * independent — clearing one without the other still serves stale content).
 */
export const revalidateEtfListingTagOnly = (tag: EtfListingCacheTag): void => {
  switch (tag.kind) {
    case 'groups-index':
      revalidateTag(getEtfGroupsIndexTag(tag.country));
      return;
    case 'group-detail':
      revalidateTag(getEtfGroupDetailTag(tag.country, tag.groupKey));
      return;
    case 'asset-classes-index':
      revalidateTag(getEtfAssetClassesIndexTag(tag.country));
      return;
    case 'providers-index':
      revalidateTag(getEtfProvidersIndexTag(tag.country));
      return;
  }
};
