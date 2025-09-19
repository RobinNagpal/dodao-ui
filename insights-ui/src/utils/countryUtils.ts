/** ---------- Country-Exchange Mappings ---------- */

import { ExchangeId } from './exchangeUtils';

export type CountryCode = 'US' | 'Canada';

export const COUNTRY_TO_EXCHANGES: Record<CountryCode, ExchangeId[]> = {
  US: ['NASDAQ', 'NYSE', 'NYSEAMERICAN'],
  Canada: ['TSX', 'TSXV'],
} as const;

export const EXCHANGE_TO_COUNTRY: Record<ExchangeId, CountryCode> = {
  NASDAQ: 'US',
  NYSE: 'US',
  NYSEAMERICAN: 'US',
  TSX: 'Canada',
  TSXV: 'Canada',
} as const;

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
export const getExchangesByCountry = (country: string): ExchangeId[] => {
  const normalizedCountry = country as CountryCode;
  return COUNTRY_TO_EXCHANGES[normalizedCountry] || [];
};

/**
 * Check if an exchange belongs to a specific country
 */
export const isExchangeInCountry = (exchange: string, country: string): boolean => {
  const exchangeCountry = getCountryByExchange(exchange);
  return exchangeCountry === country;
};

/**
 * Get Prisma where clause for filtering by country
 */
export const getCountryFilterClause = (country: string | null | undefined): { exchange: { in: ExchangeId[] } } | {} => {
  if (!country) return {};

  const exchanges = getExchangesByCountry(country);
  return exchanges.length > 0 ? { exchange: { in: exchanges } } : {};
};
