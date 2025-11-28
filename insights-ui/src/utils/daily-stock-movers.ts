import { getExchangesByCountry, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { Prisma } from '@prisma/client';

/**
 * Builds the ticker where clause for filtering by country
 */
export function buildTickerWhereClause(countryParam: string | null | undefined): Prisma.TickerV1WhereInput {
  const country = toSupportedCountry(countryParam);

  return country
    ? {
        exchange: {
          in: getExchangesByCountry(country),
        },
      }
    : {};
}
