import { revalidateTag } from 'next/cache';

/** Cache tag helpers for per-ETF revalidation */
const ETF_EXCHANGE_TAG_PREFIX = 'etf_exchange:' as const;

export const etfAndExchangeTag = (symbol: string, exchange: string): `${typeof ETF_EXCHANGE_TAG_PREFIX}${string}` =>
  `${ETF_EXCHANGE_TAG_PREFIX}_${symbol.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateEtfAndExchangeTag = (symbol: string, exchange: string) => revalidateTag(etfAndExchangeTag(symbol, exchange));

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
