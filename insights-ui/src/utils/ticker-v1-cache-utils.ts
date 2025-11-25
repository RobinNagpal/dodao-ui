import { revalidateTag } from 'next/cache';
import { SupportedCountries } from './countryExchangeUtils';

/** Cache tag helpers for per-ticker revalidation */
const TICKER_EXCHANGE_TAG_PREFIX = 'ticker_exchange:' as const;

export const tickerAndExchangeTag = (t: string, exchange: string): `${typeof TICKER_EXCHANGE_TAG_PREFIX}${string}` =>
  `${TICKER_EXCHANGE_TAG_PREFIX}_${t.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerAndExchangeTag = (ticker: string, exchange: string) => revalidateTag(tickerAndExchangeTag(ticker, exchange));

export const getStocksPageTag = (country: SupportedCountries) => `koalagains:${country}:stocks`;

export const revalidateStocksPageTag = (country: SupportedCountries) => revalidateTag(getStocksPageTag(country));

export const getIndustryPageTag = (country: SupportedCountries, industryKey: string) => `koalagains:${country}:industry:${industryKey}`;

export const revalidateIndustryPageTag = (country: SupportedCountries, industryKey: string) => revalidateTag(getIndustryPageTag(country, industryKey));

/** Portfolio profile cache tags */
export const getPortfolioProfileTag = (portfolioManagerId: string) => `koalagains:portfolio-profile:${portfolioManagerId}`;

export const revalidatePortfolioProfileTag = (portfolioManagerId: string) => revalidateTag(getPortfolioProfileTag(portfolioManagerId));

/** Portfolio managers by country cache tags */
export const getPortfolioManagersByCountryTag = (country: string) => `koalagains:portfolio-managers:country:${country}`;

export const revalidatePortfolioManagersByCountryTag = (country: string) => revalidateTag(getPortfolioManagersByCountryTag(country));

/** Home page cache tags */
export const getHomePagePostsTag = () => 'koalagains:home-page:posts';

export const revalidateHomePagePostsTag = () => revalidateTag(getHomePagePostsTag());
