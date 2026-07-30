import { revalidateTag } from 'next/cache';
import { SupportedCountries } from './countryExchangeUtils';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { CloudFrontInvalidationResult, invalidateCloudFrontPaths, invalidateCloudFrontPathsAwaited } from './cloudfront-cache-utils';

/**
 * Cache-tag helpers for per-ticker revalidation.
 *
 * The main ticker page (`/stocks/[exchange]/[ticker]`) renders an aggregate
 * view of everything for one ticker, so it subscribes to the umbrella
 * `tickerAndExchangeTag`. Per-subpage routes (e.g. `/fair-value`,
 * `/competition`, `/management-team`) only need to rebuild when *their* slice
 * of data changes, so each subscribes to a narrow tag. Savers invalidate the
 * narrow tag for the data they touched and the umbrella tag for the main
 * page — that way one category save invalidates two pages (main + the one
 * subpage) instead of all seven.
 *
 * CloudFront edge purging: the per-slice helpers below are called by the
 * AUTOMATED save pipelines (LLM report callbacks, scraper refreshes) which run
 * across thousands of tickers — purging the edge per save billed ~15 CloudFront
 * invalidation paths per full generation and dominated the monthly bill
 * ($0.005/path past the 1,000 free). They are therefore TAG-ONLY: the edge
 * refreshes on its own 6-day TTL, and the sitemaps delay `lastmod` by 7 days
 * (see `sitemap-lastmod-utils.ts`) so the advertised date is never newer than
 * the content any edge cache serves. Only the admin-facing
 * `revalidateAllTickerTags*` helpers (and the country/industry listing
 * helpers, which are low-volume), plus the one-shot first-generation purge in
 * `save-report-callback-utils.ts`, still purge CloudFront — as wildcards, 2-3
 * billable paths each. See `cloudfront-cache-utils.ts` for the cached
 * prefixes.
 */
const TICKER_EXCHANGE_TAG_PREFIX = 'ticker_exchange:' as const;

/** Base path for the per-ticker API endpoints that back `/stocks/[exchange]/[ticker]/*`. */
const tickerApiBase = (ticker: string, exchange: string) => `/api/koala_gains/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}`;

export const tickerAndExchangeTag = (t: string, exchange: string): `${typeof TICKER_EXCHANGE_TAG_PREFIX}${string}` =>
  `${TICKER_EXCHANGE_TAG_PREFIX}_${t.toUpperCase()}_${exchange.toUpperCase()}`;

/**
 * Purge the CloudFront edge for everything belonging to one ticker: its page
 * tree and its per-ticker API subtree. Two wildcard paths = 2 billable paths.
 * Reserved for admin actions and the one-shot first-generation purge — do NOT
 * call from per-save automated flows (see the file header).
 */
export const purgeTickerEdgeCache = (ticker: string, exchange: string): void => {
  invalidateCloudFrontPaths([`/stocks/${exchange}/${ticker}*`, `${tickerApiBase(ticker, exchange)}*`]);
};

export const revalidateTickerAndExchangeTag = (ticker: string, exchange: string) => {
  // Tag-only (no CloudFront purge): fired by automated pipelines — report saves
  // and bulk market-data refreshes (`fetch-financial-data`) — at per-ticker
  // volume. The edge serves the prior version until its TTL expires; the
  // sitemap's delayed lastmod keeps crawlers behind that window. Admins who
  // need the edge fresh NOW use the "Invalidate cache" action
  // (`revalidateAllTickerTagsAwaited`).
  revalidateTag(tickerAndExchangeTag(ticker, exchange));
};

/** Per-category report tag — used by `/business-and-moat`, `/financial-statement-analysis`, `/past-performance`, `/future-performance`, `/fair-value` subpages. */
export const tickerCategoryReportTag = (ticker: string, exchange: string, category: TickerAnalysisCategory): string =>
  `ticker_category_report:_${ticker.toUpperCase()}_${exchange.toUpperCase()}_${category}`;

export const revalidateTickerCategoryReportTag = (ticker: string, exchange: string, category: TickerAnalysisCategory) => {
  // Tag-only — fired per category save by the LLM generation pipeline (5× per
  // full generation). See the file header for why no CloudFront purge.
  revalidateTag(tickerCategoryReportTag(ticker, exchange, category));
};

/** Competition subpage tag — used by `/competition`. */
export const tickerCompetitionTag = (ticker: string, exchange: string): string => `ticker_competition:_${ticker.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerCompetitionTag = (ticker: string, exchange: string) => {
  // Tag-only — fired by the LLM generation pipeline. See the file header.
  revalidateTag(tickerCompetitionTag(ticker, exchange));
};

/** Management-team subpage tag — used by `/management-team`. */
export const tickerManagementTeamTag = (ticker: string, exchange: string): string =>
  `ticker_management_team:_${ticker.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerManagementTeamTag = (ticker: string, exchange: string) => {
  // Tag-only — fired by the LLM generation pipeline. See the file header.
  revalidateTag(tickerManagementTeamTag(ticker, exchange));
};

/**
 * Invalidate every per-ticker cache. Used by the admin "Revalidate" button so
 * it behaves like the old umbrella-only flow. Uses two CloudFront wildcard
 * invalidations (one for pages, one for the per-ticker API endpoints) instead
 * of 16 individual paths — counts as 2 billable paths against the monthly free
 * quota.
 */
export const revalidateAllTickerTags = (ticker: string, exchange: string) => {
  revalidateTag(tickerAndExchangeTag(ticker, exchange));
  revalidateTag(tickerCompetitionTag(ticker, exchange));
  revalidateTag(tickerManagementTeamTag(ticker, exchange));
  for (const category of Object.values(TickerAnalysisCategory)) {
    revalidateTag(tickerCategoryReportTag(ticker, exchange, category));
  }
  purgeTickerEdgeCache(ticker, exchange);
};

/**
 * Awaited variant of `revalidateAllTickerTags`. Use from the admin-facing
 * "Invalidate cache" action so the user gets real success/failure feedback
 * from CloudFront instead of an always-success fire-and-forget call.
 */
export const revalidateAllTickerTagsAwaited = async (ticker: string, exchange: string): Promise<CloudFrontInvalidationResult> => {
  revalidateTag(tickerAndExchangeTag(ticker, exchange));
  revalidateTag(tickerCompetitionTag(ticker, exchange));
  revalidateTag(tickerManagementTeamTag(ticker, exchange));
  for (const category of Object.values(TickerAnalysisCategory)) {
    revalidateTag(tickerCategoryReportTag(ticker, exchange, category));
  }
  return invalidateCloudFrontPathsAwaited([`/stocks/${exchange}/${ticker}*`, `${tickerApiBase(ticker, exchange)}*`]);
};

export const getStocksPageTag = (country: SupportedCountries) => `koalagains:${country}:stocks`;

export const revalidateStocksPageTag = (country: SupportedCountries) => {
  revalidateTag(getStocksPageTag(country));
  // The country listing page and its industry sub-pages are all under `/stocks/*`
  // and CloudFront-cached. The bare `/stocks` and `/` use the same tag but live
  // outside CloudFront's cache behaviors, so we don't purge those page URLs here.
  // The API wildcard covers both `/tickers/industries` and `/tickers/industries/*`
  // (used by the country page and its industry sub-pages alike).
  invalidateCloudFrontPaths([`/stocks/countries/${country}*`, `/api/koala_gains/tickers-v1/country/${country}*`]);
};

export const getIndustryPageTag = (country: SupportedCountries, industryKey: string) => `koalagains:${country}:industry:${industryKey}`;

export const revalidateIndustryPageTag = (country: SupportedCountries, industryKey: string) => {
  revalidateTag(getIndustryPageTag(country, industryKey));
  invalidateCloudFrontPaths([
    `/stocks/industries/${industryKey}`,
    `/stocks/countries/${country}/industries/${industryKey}`,
    `/api/koala_gains/tickers-v1/country/${country}/tickers/industries/${industryKey}`,
  ]);
};

/**
 * Industry-analysis saves affect the industry's pages in EVERY supported
 * country. Calling `revalidateIndustryPageTag` in a country loop submitted
 * 3 CloudFront paths × 10 countries (+ the analysis wildcard) = 31 billable
 * paths per save. This helper revalidates all the per-country tags (free) and
 * collapses the edge purge into 3 wildcards. The country wildcards purge more
 * pages than strictly needed (all country listing pages), but an invalidation
 * is billed per PATH, not per page purged — 3 paths beats 31.
 */
export const revalidateIndustryPagesForAllCountries = (industryKey: string) => {
  for (const country of Object.values(SupportedCountries)) {
    revalidateTag(getIndustryPageTag(country, industryKey));
  }
  revalidateTag(getIndustryAnalysisTag(industryKey));
  invalidateCloudFrontPaths([`/stocks/industries/${industryKey}*`, `/stocks/countries/*`, `/api/koala_gains/tickers-v1/country/*`]);
};

/** Industry analysis cache tags */
export const getIndustryAnalysisTag = (industryKey: string) => `koalagains:industry-analysis:${industryKey}`;

export const revalidateIndustryAnalysisTag = (industryKey: string) => {
  revalidateTag(getIndustryAnalysisTag(industryKey));
  invalidateCloudFrontPaths([`/stocks/industries/${industryKey}/analysis*`]);
};

/** Building block analysis cache tags */
export const getBuildingBlockAnalysisTag = (industryKey: string, buildingBlockKey: string) =>
  `koalagains:building-block-analysis:${industryKey}:${buildingBlockKey}`;

export const revalidateBuildingBlockAnalysisTag = (industryKey: string, buildingBlockKey: string) => {
  revalidateTag(getBuildingBlockAnalysisTag(industryKey, buildingBlockKey));
  invalidateCloudFrontPaths([`/stocks/industries/${industryKey}/analysis/building-blocks/${buildingBlockKey}`]);
};

/**
 * Portfolio-manager pages live outside the CloudFront cache behaviors
 * (`/portfolio-managers/*` is not cached), so no CloudFront purge is needed
 * here. Same goes for home-page and daily-mover tags below.
 */
export const getPortfolioProfileTag = (portfolioManagerId: string) => `koalagains:portfolio-profile:${portfolioManagerId}`;

export const revalidatePortfolioProfileTag = (portfolioManagerId: string) => revalidateTag(getPortfolioProfileTag(portfolioManagerId));

/** Portfolio managers by country cache tags */
export const getPortfolioManagersByCountryTag = (country: string) => `koalagains:portfolio-managers:country:${country}`;

export const revalidatePortfolioManagersByCountryTag = (country: string) => revalidateTag(getPortfolioManagersByCountryTag(country));

/** Portfolio managers by type cache tags */
export const getPortfolioManagersByTypeTag = (type: string) => `koalagains:portfolio-managers:type:${type}`;

export const revalidatePortfolioManagersByTypeTag = (type: string) => revalidateTag(getPortfolioManagersByTypeTag(type));

/** Home page cache tags */
export const getHomePagePostsTag = () => 'koalagains:home-page:posts';

export const revalidateHomePagePostsTag = () => revalidateTag(getHomePagePostsTag());

/** Daily movers cache tags */
export const getDailyMoversByCountryTag = (country: string, type: DailyMoverType) => `koalagains:daily-movers:${country}:${type}s`;

export const revalidateDailyMoversByCountryTag = (country: string, type: DailyMoverType) => revalidateTag(getDailyMoversByCountryTag(country, type));

export const getDailyMoverDetailsTag = (moverId: string) => `koalagains:daily-mover-details:${moverId}`;

export const revalidateDailyMoverDetailsTag = (moverId: string) => revalidateTag(getDailyMoverDetailsTag(moverId));
