import { AllEtfExchanges, ETF_EXCHANGE_TO_COUNTRY, EtfSupportedCountry, isEtfExchange } from '@/utils/etfCountryExchangeUtils';

export interface EtfScenarioLinkLike {
  symbol: string;
  exchange: string;
}

export interface EtfLinkCountryMismatch {
  symbol: string;
  exchange: string;
  reason: 'UNKNOWN_EXCHANGE' | 'COUNTRY_NOT_IN_SCENARIO';
  resolvedCountry?: EtfSupportedCountry;
}

/**
 * ETF parallel of `scenarioLinkCountryMismatch` from scenario-country-validation.ts.
 * Validates that every link's exchange is a known ETF exchange AND that the
 * country it maps to is declared in the scenario's countries[]. Aggregates
 * every mismatch so the API can report all offenders in one error.
 *
 * Callers should upper-case `exchange` before calling.
 */
export function etfScenarioLinkCountryMismatch(links: EtfScenarioLinkLike[], scenarioCountries: EtfSupportedCountry[]): EtfLinkCountryMismatch[] {
  const allowed = new Set<EtfSupportedCountry>(scenarioCountries);
  const mismatches: EtfLinkCountryMismatch[] = [];

  for (const link of links) {
    if (!isEtfExchange(link.exchange)) {
      mismatches.push({ symbol: link.symbol, exchange: link.exchange, reason: 'UNKNOWN_EXCHANGE' });
      continue;
    }
    const country = ETF_EXCHANGE_TO_COUNTRY[link.exchange as AllEtfExchanges];
    if (!allowed.has(country)) {
      mismatches.push({ symbol: link.symbol, exchange: link.exchange, reason: 'COUNTRY_NOT_IN_SCENARIO', resolvedCountry: country });
    }
  }

  return mismatches;
}

export function serializeEtfLinkMismatches(mismatches: EtfLinkCountryMismatch[]): string {
  return mismatches
    .map((m) => {
      if (m.reason === 'UNKNOWN_EXCHANGE') {
        return `${m.symbol} on "${m.exchange}" (unknown ETF exchange)`;
      }
      return `${m.symbol} on ${m.exchange} resolves to ${m.resolvedCountry} (not in scenario countries)`;
    })
    .join('; ');
}
