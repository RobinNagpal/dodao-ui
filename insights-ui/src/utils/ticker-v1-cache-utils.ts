import { revalidateTag } from 'next/cache';
import { SupportedCountries } from './countryExchangeUtils';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { invalidateCloudFrontPaths } from './cloudfront-cache-utils';

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
 * Each `revalidate*` helper also purges the CloudFront edge cache for the
 * corresponding URL. CloudFront is the longer-lived layer (6-day TTL) and
 * would otherwise keep the old HTML at the edge until natural expiry. See
 * `cloudfront-cache-utils.ts` for the no-op semantics when the distribution
 * env var is unset.
 */
const TICKER_EXCHANGE_TAG_PREFIX = 'ticker_exchange:' as const;

/** Maps the analysis-category enum to its URL slug under `/stocks/{e}/{t}/`. */
const TICKER_CATEGORY_TO_PATH: Record<TickerAnalysisCategory, string> = {
  [TickerAnalysisCategory.BusinessAndMoat]: 'business-and-moat',
  [TickerAnalysisCategory.FinancialStatementAnalysis]: 'financial-statement-analysis',
  [TickerAnalysisCategory.PastPerformance]: 'past-performance',
  [TickerAnalysisCategory.FutureGrowth]: 'future-performance',
  [TickerAnalysisCategory.FairValue]: 'fair-value',
};

export const tickerAndExchangeTag = (t: string, exchange: string): `${typeof TICKER_EXCHANGE_TAG_PREFIX}${string}` =>
  `${TICKER_EXCHANGE_TAG_PREFIX}_${t.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerAndExchangeTag = (ticker: string, exchange: string) => {
  revalidateTag(tickerAndExchangeTag(ticker, exchange));
  invalidateCloudFrontPaths([`/stocks/${exchange}/${ticker}`]);
};

/** Per-category report tag — used by `/business-and-moat`, `/financial-statement-analysis`, `/past-performance`, `/future-performance`, `/fair-value` subpages. */
export const tickerCategoryReportTag = (ticker: string, exchange: string, category: TickerAnalysisCategory): string =>
  `ticker_category_report:_${ticker.toUpperCase()}_${exchange.toUpperCase()}_${category}`;

export const revalidateTickerCategoryReportTag = (ticker: string, exchange: string, category: TickerAnalysisCategory) => {
  revalidateTag(tickerCategoryReportTag(ticker, exchange, category));
  invalidateCloudFrontPaths([`/stocks/${exchange}/${ticker}/${TICKER_CATEGORY_TO_PATH[category]}`]);
};

/** Competition subpage tag — used by `/competition`. */
export const tickerCompetitionTag = (ticker: string, exchange: string): string => `ticker_competition:_${ticker.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerCompetitionTag = (ticker: string, exchange: string) => {
  revalidateTag(tickerCompetitionTag(ticker, exchange));
  invalidateCloudFrontPaths([`/stocks/${exchange}/${ticker}/competition`]);
};

/** Management-team subpage tag — used by `/management-team`. */
export const tickerManagementTeamTag = (ticker: string, exchange: string): string =>
  `ticker_management_team:_${ticker.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerManagementTeamTag = (ticker: string, exchange: string) => {
  revalidateTag(tickerManagementTeamTag(ticker, exchange));
  invalidateCloudFrontPaths([`/stocks/${exchange}/${ticker}/management-team`]);
};

/**
 * Invalidate every per-ticker cache. Used by the admin "Revalidate" button so
 * it behaves like the old umbrella-only flow. Uses a single CloudFront
 * wildcard invalidation (`/stocks/{e}/{t}*`) instead of 8 individual paths so
 * it counts as 1 billable path against the monthly free quota.
 */
export const revalidateAllTickerTags = (ticker: string, exchange: string) => {
  revalidateTag(tickerAndExchangeTag(ticker, exchange));
  revalidateTag(tickerCompetitionTag(ticker, exchange));
  revalidateTag(tickerManagementTeamTag(ticker, exchange));
  for (const category of Object.values(TickerAnalysisCategory)) {
    revalidateTag(tickerCategoryReportTag(ticker, exchange, category));
  }
  invalidateCloudFrontPaths([`/stocks/${exchange}/${ticker}*`]);
};

export const getStocksPageTag = (country: SupportedCountries) => `koalagains:${country}:stocks`;

export const revalidateStocksPageTag = (country: SupportedCountries) => {
  revalidateTag(getStocksPageTag(country));
  // The country listing page and its industry sub-pages are all under `/stocks/*`
  // and CloudFront-cached. The bare `/stocks` and `/` use the same tag but live
  // outside CloudFront's cache behaviors, so we don't purge them here.
  invalidateCloudFrontPaths([`/stocks/countries/${country}*`]);
};

export const getIndustryPageTag = (country: SupportedCountries, industryKey: string) => `koalagains:${country}:industry:${industryKey}`;

export const revalidateIndustryPageTag = (country: SupportedCountries, industryKey: string) => {
  revalidateTag(getIndustryPageTag(country, industryKey));
  invalidateCloudFrontPaths([`/stocks/industries/${industryKey}`, `/stocks/countries/${country}/industries/${industryKey}`]);
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
