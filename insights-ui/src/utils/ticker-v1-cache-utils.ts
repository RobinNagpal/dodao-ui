import { revalidateTag } from 'next/cache';
import { SupportedCountries } from './countryExchangeUtils';
import { DailyMoverType } from './daily-movers-generation-utils';

/** Cache tag helpers for per-ticker revalidation */
const TICKER_EXCHANGE_TAG_PREFIX = 'ticker_exchange:' as const;

export const tickerAndExchangeTag = (t: string, exchange: string): `${typeof TICKER_EXCHANGE_TAG_PREFIX}${string}` =>
  `${TICKER_EXCHANGE_TAG_PREFIX}_${t.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerAndExchangeTag = (ticker: string, exchange: string) => revalidateTag(tickerAndExchangeTag(ticker, exchange));

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
