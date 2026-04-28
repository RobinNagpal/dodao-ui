import { AllExchanges, EXCHANGE_TO_COUNTRY, isExchange, SupportedCountries } from '@/utils/countryExchangeUtils';

export interface ScenarioLinkLike {
  symbol: string;
  exchange: string;
}

export interface LinkCountryMismatch {
  symbol: string;
  exchange: string;
  reason: 'UNKNOWN_EXCHANGE' | 'COUNTRY_NOT_IN_SCENARIO';
  resolvedCountry?: SupportedCountries;
}

/**
 * Validate that every link's exchange is a known one AND that the country it
 * maps to is declared in the scenario's `countries[]`. Returns the list of
 * mismatches so callers can report every offender in a single error rather
 * than failing on the first one.
 *
 * Callers should upper-case `exchange` before calling; this function does not
 * do case-folding so it stays a pure validator.
 */
export function scenarioLinkCountryMismatch(links: ScenarioLinkLike[], scenarioCountries: SupportedCountries[]): LinkCountryMismatch[] {
  const allowed = new Set<SupportedCountries>(scenarioCountries);
  const mismatches: LinkCountryMismatch[] = [];

  for (const link of links) {
    if (!isExchange(link.exchange)) {
      mismatches.push({ symbol: link.symbol, exchange: link.exchange, reason: 'UNKNOWN_EXCHANGE' });
      continue;
    }
    const country = EXCHANGE_TO_COUNTRY[link.exchange as AllExchanges];
    if (!allowed.has(country)) {
      mismatches.push({ symbol: link.symbol, exchange: link.exchange, reason: 'COUNTRY_NOT_IN_SCENARIO', resolvedCountry: country });
    }
  }

  return mismatches;
}

export function serializeLinkMismatches(mismatches: LinkCountryMismatch[]): string {
  return mismatches
    .map((m) => {
      if (m.reason === 'UNKNOWN_EXCHANGE') {
        return `${m.symbol} on "${m.exchange}" (unknown exchange)`;
      }
      return `${m.symbol} on ${m.exchange} resolves to ${m.resolvedCountry} (not in scenario countries)`;
    })
    .join('; ');
}
