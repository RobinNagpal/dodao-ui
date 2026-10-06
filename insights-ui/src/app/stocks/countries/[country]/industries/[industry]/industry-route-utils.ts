import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { safeDecodeParam } from '@/utils/route-param-utils';

export const COUNTRY_INDUSTRY_ROUTE = 'stocks/countries/[country]/industries/[industry]';

const MAX_INDUSTRY_KEY_LENGTH = 100;

// Industry keys are ASCII identifiers like `SEMICONDUCTORS` or `OIL_AND_GAS` (one legacy key has a
// leading space). Anything else, e.g. scanner payloads with full-width / non-ASCII characters, can't
// be a key and is rejected before it reaches the API, a cache tag or a redirect Location header.
const INDUSTRY_KEY_PATTERN = /^[A-Za-z0-9_\- ]+$/;

/**
 * Decode an `[industry]` route param. Returns the decoded key (original case, so the caller can
 * detect non-canonical casing), or undefined for malformed URI encodings, over-long input or
 * characters that never appear in an industry key. Pure: safe to call from `generateMetadata`.
 */
export function parseIndustryKeyParam(rawIndustry: string): string | undefined {
  const decoded = safeDecodeParam(rawIndustry);
  if (!decoded || decoded.length > MAX_INDUSTRY_KEY_LENGTH || !INDUSTRY_KEY_PATTERN.test(decoded)) return undefined;
  return decoded;
}

/** Canonical path of a country industry listing; every segment is URI-encoded so it is always a valid Location header. */
export function getCountryIndustryPath(country: SupportedCountries, industryKey: string): string {
  return `/stocks/countries/${encodeURIComponent(country)}/industries/${encodeURIComponent(industryKey)}`;
}
