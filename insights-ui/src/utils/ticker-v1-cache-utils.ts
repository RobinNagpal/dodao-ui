import { revalidateTag } from 'next/cache';
import { SupportedCountries } from './countryExchangeUtils';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';

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
 */
const TICKER_EXCHANGE_TAG_PREFIX = 'ticker_exchange:' as const;

export const tickerAndExchangeTag = (t: string, exchange: string): `${typeof TICKER_EXCHANGE_TAG_PREFIX}${string}` =>
  `${TICKER_EXCHANGE_TAG_PREFIX}_${t.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerAndExchangeTag = (ticker: string, exchange: string) => revalidateTag(tickerAndExchangeTag(ticker, exchange));

/** Per-category report tag — used by `/business-and-moat`, `/financial-statement-analysis`, `/past-performance`, `/future-performance`, `/fair-value` subpages. */
export const tickerCategoryReportTag = (ticker: string, exchange: string, category: TickerAnalysisCategory): string =>
  `ticker_category_report:_${ticker.toUpperCase()}_${exchange.toUpperCase()}_${category}`;

export const revalidateTickerCategoryReportTag = (ticker: string, exchange: string, category: TickerAnalysisCategory) =>
  revalidateTag(tickerCategoryReportTag(ticker, exchange, category));

/** Competition subpage tag — used by `/competition`. */
export const tickerCompetitionTag = (ticker: string, exchange: string): string => `ticker_competition:_${ticker.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerCompetitionTag = (ticker: string, exchange: string) => revalidateTag(tickerCompetitionTag(ticker, exchange));

/** Management-team subpage tag — used by `/management-team`. */
export const tickerManagementTeamTag = (ticker: string, exchange: string): string =>
  `ticker_management_team:_${ticker.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerManagementTeamTag = (ticker: string, exchange: string) => revalidateTag(tickerManagementTeamTag(ticker, exchange));

/** Invalidate every per-ticker cache. Used by the admin "Revalidate" button so it behaves like the old umbrella-only flow. */
export const revalidateAllTickerTags = (ticker: string, exchange: string) => {
  revalidateTickerAndExchangeTag(ticker, exchange);
  revalidateTickerCompetitionTag(ticker, exchange);
  revalidateTickerManagementTeamTag(ticker, exchange);
  for (const category of Object.values(TickerAnalysisCategory)) {
    revalidateTickerCategoryReportTag(ticker, exchange, category);
  }
};

export const getStocksPageTag = (country: SupportedCountries) => `koalagains:${country}:stocks`;

export const revalidateStocksPageTag = (country: SupportedCountries) => revalidateTag(getStocksPageTag(country));

export const getIndustryPageTag = (country: SupportedCountries, industryKey: string) => `koalagains:${country}:industry:${industryKey}`;

export const revalidateIndustryPageTag = (country: SupportedCountries, industryKey: string) => revalidateTag(getIndustryPageTag(country, industryKey));

/** Industry analysis cache tags */
export const getIndustryAnalysisTag = (industryKey: string) => `koalagains:industry-analysis:${industryKey}`;

export const revalidateIndustryAnalysisTag = (industryKey: string) => revalidateTag(getIndustryAnalysisTag(industryKey));

/** Building block analysis cache tags */
export const getBuildingBlockAnalysisTag = (industryKey: string, buildingBlockKey: string) =>
  `koalagains:building-block-analysis:${industryKey}:${buildingBlockKey}`;

export const revalidateBuildingBlockAnalysisTag = (industryKey: string, buildingBlockKey: string) =>
  revalidateTag(getBuildingBlockAnalysisTag(industryKey, buildingBlockKey));

/** Portfolio profile cache tags */
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
