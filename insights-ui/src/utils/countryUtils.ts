/** ---------- Country-Exchange Mappings ---------- */

import { ExchangeId } from './exchangeUtils';

export type CountryCode = 'US' | 'Canada' | 'India' | 'United Kingdom';

export const COUNTRY_TO_EXCHANGES: Record<CountryCode, readonly ExchangeId[]> = {
  US: ['NASDAQ', 'NYSE', 'NYSEAMERICAN'],
  Canada: ['TSX', 'TSXV'],
  India: ['BSE', 'NSE'],
  'United Kingdom': ['LSE', 'AIM'],
};

export const EXCHANGE_TO_COUNTRY: Record<ExchangeId, CountryCode> = {
  NASDAQ: 'US',
  NYSE: 'US',
  NYSEAMERICAN: 'US',
  TSX: 'Canada',
  TSXV: 'Canada',
  BSE: 'India',
  NSE: 'India',
  LSE: 'United Kingdom',
  AIM: 'United Kingdom',
};

/** ---------- Country-Exchange Utility Functions ---------- */

/**
 * Get the country code for a given exchange
 */
export const getCountryByExchange = (exchange: string): CountryCode | null => {
  const normalizedExchange = exchange.toUpperCase() as ExchangeId;
  return EXCHANGE_TO_COUNTRY[normalizedExchange] || null;
};

/**
 * Get all exchanges for a given country
 */
export const getExchangesByCountry = (country: string): readonly ExchangeId[] => {
  const normalizedCountry = country as CountryCode;
  return COUNTRY_TO_EXCHANGES[normalizedCountry] || [];
};

/**
 * Get Prisma where clause for filtering by country
 */
export const getCountryFilterClause = (country: string | null | undefined): { exchange: { in: readonly ExchangeId[] } } | {} => {
  if (!country) return {};

  const exchanges = getExchangesByCountry(country);
  return exchanges.length > 0 ? { exchange: { in: exchanges } } : {};
};
