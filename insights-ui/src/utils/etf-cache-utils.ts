import { revalidateTag } from 'next/cache';

/** Cache tag helpers for per-ETF revalidation */
const ETF_EXCHANGE_TAG_PREFIX = 'etf_exchange:' as const;

export const etfAndExchangeTag = (symbol: string, exchange: string): `${typeof ETF_EXCHANGE_TAG_PREFIX}${string}` =>
  `${ETF_EXCHANGE_TAG_PREFIX}_${symbol.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateEtfAndExchangeTag = (symbol: string, exchange: string) => revalidateTag(etfAndExchangeTag(symbol, exchange));

/** Cache tag for the ETF listing page */
export const ETF_LISTING_TAG = 'etf_listing' as const;

export const getEtfListingTag = (): string => ETF_LISTING_TAG;

export const revalidateEtfListingTag = () => revalidateTag(ETF_LISTING_TAG);
