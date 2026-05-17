import { revalidateTag } from 'next/cache';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';

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
 */
const ETF_EXCHANGE_TAG_PREFIX = 'etf_exchange:' as const;

export const etfAndExchangeTag = (symbol: string, exchange: string): `${typeof ETF_EXCHANGE_TAG_PREFIX}${string}` =>
  `${ETF_EXCHANGE_TAG_PREFIX}_${symbol.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateEtfAndExchangeTag = (symbol: string, exchange: string) => revalidateTag(etfAndExchangeTag(symbol, exchange));

/** Per-category subpage tag — used by the 4 `EtfAnalysisCategory` subpages. */
export const etfCategoryReportTag = (symbol: string, exchange: string, category: EtfAnalysisCategory): string =>
  `etf_category_report:_${symbol.toUpperCase()}_${exchange.toUpperCase()}_${category}`;

export const revalidateEtfCategoryReportTag = (symbol: string, exchange: string, category: EtfAnalysisCategory) =>
  revalidateTag(etfCategoryReportTag(symbol, exchange, category));

/** Competition subpage tag — used by `/competition`. */
export const etfCompetitionTag = (symbol: string, exchange: string): string => `etf_competition:_${symbol.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateEtfCompetitionTag = (symbol: string, exchange: string) => revalidateTag(etfCompetitionTag(symbol, exchange));

/** Holdings subpage tag — used by `/holdings`. Fired only when `EtfMorPortfolioInfo` is written. */
export const etfHoldingsTag = (symbol: string, exchange: string): string => `etf_holdings:_${symbol.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateEtfHoldingsTag = (symbol: string, exchange: string) => revalidateTag(etfHoldingsTag(symbol, exchange));

/** Invalidate every per-ETF cache. Use from admin "Invalidate cache" / bulk reset paths. */
export const revalidateAllEtfTags = (symbol: string, exchange: string) => {
  revalidateEtfAndExchangeTag(symbol, exchange);
  revalidateEtfCompetitionTag(symbol, exchange);
  revalidateEtfHoldingsTag(symbol, exchange);
  for (const category of Object.values(EtfAnalysisCategory)) {
    revalidateEtfCategoryReportTag(symbol, exchange, category);
  }
};

/**
 * Listing-page cache tags. One tag per (page-type, country) tuple so each
 * listing surface invalidates independently. ETF report saves do NOT fire
 * these — listings refresh on the 2-week TTL or on explicit admin action.
 */
const ETF_LISTINGS_PREFIX = 'etf_listings' as const;

export const TWO_WEEKS_IN_SECONDS = 14 * 24 * 60 * 60;

export const getEtfGroupsIndexTag = (country: string): string => `${ETF_LISTINGS_PREFIX}:groups-index:${country.toUpperCase()}`;
export const getEtfGroupDetailTag = (country: string, groupKey: string): string => `${ETF_LISTINGS_PREFIX}:group:${country.toUpperCase()}:${groupKey}`;
export const getEtfAssetClassesIndexTag = (country: string): string => `${ETF_LISTINGS_PREFIX}:asset-classes-index:${country.toUpperCase()}`;
export const getEtfProvidersIndexTag = (country: string): string => `${ETF_LISTINGS_PREFIX}:providers-index:${country.toUpperCase()}`;
export const getEtfListingFilterableTag = (country: string): string => `${ETF_LISTINGS_PREFIX}:filterable:${country.toUpperCase()}`;

export const revalidateEtfGroupsIndexTag = (country: string) => revalidateTag(getEtfGroupsIndexTag(country));
export const revalidateEtfGroupDetailTag = (country: string, groupKey: string) => revalidateTag(getEtfGroupDetailTag(country, groupKey));
export const revalidateEtfAssetClassesIndexTag = (country: string) => revalidateTag(getEtfAssetClassesIndexTag(country));
export const revalidateEtfProvidersIndexTag = (country: string) => revalidateTag(getEtfProvidersIndexTag(country));
export const revalidateEtfListingFilterableTag = (country: string) => revalidateTag(getEtfListingFilterableTag(country));
