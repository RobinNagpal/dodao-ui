import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { EtfSupportedCountry, ETF_SUPPORTED_COUNTRIES } from '@/utils/etfCountryExchangeUtils';

export type EtfBrowseSection = 'groups' | 'categories' | 'asset-classes';

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

export const ALL_ETF_COUNTRIES = ETF_SUPPORTED_COUNTRIES;
