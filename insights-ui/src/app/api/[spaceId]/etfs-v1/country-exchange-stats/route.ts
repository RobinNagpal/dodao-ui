import { prisma } from '@/prisma';
import {
  ALL_SUPPORTED_COUNTRIES,
  COUNTRY_TO_EXCHANGES,
  EXCHANGE_TO_COUNTRY,
  getCountryCodeForSearchBarDisplay,
  isExchange,
  toSupportedCountry,
  type AllExchanges,
  type SupportedCountries,
} from '@/utils/countryExchangeUtils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

const UNKNOWN_COUNTRY = 'Unknown' as const;
const UNKNOWN_EXCHANGE = 'Unknown' as const;

export interface EtfExchangeCount {
  exchange: AllExchanges | typeof UNKNOWN_EXCHANGE;
  count: number;
}

export interface EtfCountryExchangeStats {
  country: SupportedCountries | typeof UNKNOWN_COUNTRY;
  countryCode: string;
  totalEtfs: number;
  exchangeCount: number;
  exchanges: EtfExchangeCount[];
}

export interface EtfCountryExchangeStatsAllResponse {
  scope: 'all';
  totalEtfs: number;
  countryCount: number;
  countries: EtfCountryExchangeStats[];
}

export interface EtfCountryExchangeStatsByCountryResponse {
  scope: 'country';
  country: SupportedCountries | typeof UNKNOWN_COUNTRY;
  countryCode: string;
  totalEtfs: number;
  exchangeCount: number;
  exchanges: EtfExchangeCount[];
}

export type EtfCountryExchangeStatsResponse = EtfCountryExchangeStatsAllResponse | EtfCountryExchangeStatsByCountryResponse;

function countryCodeFor(country: SupportedCountries | typeof UNKNOWN_COUNTRY): string {
  return country === UNKNOWN_COUNTRY ? UNKNOWN_COUNTRY : getCountryCodeForSearchBarDisplay(country);
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<EtfCountryExchangeStatsResponse> {
  const { spaceId } = await context.params;
  const { searchParams } = new URL(req.url);
  const countryParamRaw = searchParams.get('country')?.trim();

  const grouped = await prisma.etf.groupBy({
    by: ['exchange'],
    where: { spaceId },
    _count: { _all: true },
  });

  const byCountry = new Map<SupportedCountries | typeof UNKNOWN_COUNTRY, Map<AllExchanges | typeof UNKNOWN_EXCHANGE, number>>();
  for (const row of grouped) {
    const rawExchange = (row.exchange ?? '').trim().toUpperCase();
    const exchange: AllExchanges | typeof UNKNOWN_EXCHANGE = isExchange(rawExchange) ? rawExchange : UNKNOWN_EXCHANGE;
    const country: SupportedCountries | typeof UNKNOWN_COUNTRY = exchange === UNKNOWN_EXCHANGE ? UNKNOWN_COUNTRY : EXCHANGE_TO_COUNTRY[exchange];
    const count = row._count._all;
    let inner = byCountry.get(country);
    if (!inner) {
      inner = new Map();
      byCountry.set(country, inner);
    }
    inner.set(exchange, (inner.get(exchange) ?? 0) + count);
  }

  const buildExchanges = (
    inner: Map<AllExchanges | typeof UNKNOWN_EXCHANGE, number>,
    country: SupportedCountries | typeof UNKNOWN_COUNTRY
  ): EtfExchangeCount[] => {
    const known = country === UNKNOWN_COUNTRY ? [] : COUNTRY_TO_EXCHANGES[country];
    const ordering = new Map<string, number>();
    known.forEach((ex, idx) => ordering.set(ex, idx));
    return Array.from(inner.entries())
      .map(([exchange, count]) => ({ exchange, count }))
      .sort((a, b) => {
        const ai = ordering.get(a.exchange) ?? Number.MAX_SAFE_INTEGER;
        const bi = ordering.get(b.exchange) ?? Number.MAX_SAFE_INTEGER;
        if (ai !== bi) return ai - bi;
        return b.count - a.count || a.exchange.localeCompare(b.exchange);
      });
  };

  if (countryParamRaw) {
    const country: SupportedCountries | typeof UNKNOWN_COUNTRY =
      countryParamRaw === UNKNOWN_COUNTRY
        ? UNKNOWN_COUNTRY
        : toSupportedCountry(countryParamRaw) ??
          (() => {
            throw new Error(`Invalid country "${countryParamRaw}". Must be one of: ${ALL_SUPPORTED_COUNTRIES.join(', ')}`);
          })();
    const inner = byCountry.get(country) ?? new Map();
    const exchanges = buildExchanges(inner, country);
    const totalEtfs = exchanges.reduce((acc, e) => acc + e.count, 0);
    return {
      scope: 'country',
      country,
      countryCode: countryCodeFor(country),
      totalEtfs,
      exchangeCount: exchanges.length,
      exchanges,
    };
  }

  const orderedCountries: Array<SupportedCountries | typeof UNKNOWN_COUNTRY> = [...ALL_SUPPORTED_COUNTRIES, UNKNOWN_COUNTRY];
  const countryOrder = new Map<string, number>();
  orderedCountries.forEach((c, idx) => countryOrder.set(c, idx));

  const countries: EtfCountryExchangeStats[] = Array.from(byCountry.entries())
    .map(([country, inner]) => {
      const exchanges = buildExchanges(inner, country);
      const totalEtfs = exchanges.reduce((acc, e) => acc + e.count, 0);
      return { country, countryCode: countryCodeFor(country), totalEtfs, exchangeCount: exchanges.length, exchanges };
    })
    .sort((a, b) => {
      const ai = countryOrder.get(a.country) ?? Number.MAX_SAFE_INTEGER;
      const bi = countryOrder.get(b.country) ?? Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });

  const totalEtfs = countries.reduce((acc, c) => acc + c.totalEtfs, 0);

  return {
    scope: 'all',
    totalEtfs,
    countryCount: countries.length,
    countries,
  };
}

export const GET = withErrorHandlingV2<EtfCountryExchangeStatsResponse>(getHandler);
