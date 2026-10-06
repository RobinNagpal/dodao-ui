import { SupportedCountries, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { notFound } from 'next/navigation';

const MAX_LOGGED_INPUT_LENGTH = 100;

/**
 * Decode a `[country]` route param and map it to a SupportedCountries value (case-insensitively).
 * Returns undefined for unknown countries and for malformed URI encodings (which make
 * `decodeURIComponent` throw). Pure: no logging, no navigation side effects, so it is safe to
 * call from `generateMetadata`.
 */
export function parseStockCountryParam(rawCountry: string): SupportedCountries | undefined {
  let decoded: string;
  try {
    decoded = decodeURIComponent(rawCountry);
  } catch {
    return undefined;
  }
  // Case-insensitive, so older or external links like `/stocks/countries/us` keep working;
  // always resolves to the canonical enum value used in internal links and API calls.
  return toSupportedCountry(decoded) ?? Object.values(SupportedCountries).find((country) => country.toLowerCase() === decoded.trim().toLowerCase());
}

/**
 * Validate a stock `[country]` route param for a page render. Unknown input (typically bots or
 * scanners probing junk paths) logs ONE warn line with the input truncated, then 404s via
 * `notFound()`. Returns the validated country.
 *
 * Server-component only: `notFound()` throws.
 */
export function resolveStockCountryParam(rawCountry: string, route: string): SupportedCountries {
  const country = parseStockCountryParam(rawCountry);
  if (!country) {
    console.warn(`[${route}] unknown country param, returning 404: ${JSON.stringify(rawCountry.slice(0, MAX_LOGGED_INPUT_LENGTH))}`);
    notFound();
  }
  return country;
}
