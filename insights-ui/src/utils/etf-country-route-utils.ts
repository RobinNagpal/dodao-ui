import { notFound, redirect } from 'next/navigation';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { EtfSupportedCountry, ETF_SUPPORTED_COUNTRIES, isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';

export type EtfBrowseSection = 'groups' | 'categories' | 'asset-classes' | 'providers';

const COUNTRY_DISPLAY_NAME: Record<EtfSupportedCountry, string> = {
  [SupportedCountries.US]: 'US',
  [SupportedCountries.Canada]: 'Canadian',
};

export function etfCountryDisplayName(country: EtfSupportedCountry): string {
  return COUNTRY_DISPLAY_NAME[country];
}

/** Root path for a country's ETF section (US lives at `/etfs`, others under `/etfs/countries/<country>`). */
export function etfBasePath(country: EtfSupportedCountry): string {
  return country === SupportedCountries.US ? '/etfs' : `/etfs/countries/${encodeURIComponent(country)}`;
}

export function etfBrowsePath(country: EtfSupportedCountry, section: EtfBrowseSection): string {
  return `${etfBasePath(country)}/${section}`;
}

export function etfBrowseDetailPath(country: EtfSupportedCountry, section: EtfBrowseSection, slug: string): string {
  return `${etfBrowsePath(country, section)}/${encodeURIComponent(slug)}`;
}

export const ALL_ETF_COUNTRIES = ETF_SUPPORTED_COUNTRIES;

/**
 * Decode a `[country]` route param, redirect US to its canonical (non-`/countries/...`) path,
 * and 404 anything else. Returns the validated country for the page to use.
 *
 * Server-component only: calls `next/navigation` `redirect()`/`notFound()`, both of which throw.
 */
export function resolveEtfCountryParam(rawCountry: string, usCanonicalPath: string): EtfSupportedCountry {
  const decoded = decodeURIComponent(rawCountry);
  if (decoded === SupportedCountries.US) redirect(usCanonicalPath);
  if (!isEtfSupportedCountry(decoded)) notFound();
  return decoded;
}
