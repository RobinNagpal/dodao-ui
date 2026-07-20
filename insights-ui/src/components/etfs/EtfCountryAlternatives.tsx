import Link from 'next/link';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { ALL_ETF_COUNTRIES, EtfBrowseSection, etfBasePath, etfCountryDisplayName, etfSectionIndexPath } from '@/utils/etf-country-route-utils';

/**
 * Countries we still cross-link to from the "Also view" switcher. UK is intentionally excluded:
 * the UK ETF pages stay live (they don't 404), but we no longer surface them from other listing
 * pages or the home page, so Google stops rediscovering them via internal links. The UK pages are
 * also dropped from the sitemaps (see `etfSitemapUtils.ts` / `etfs/sitemap.xml`).
 */
const SWITCHER_ETF_COUNTRIES = ALL_ETF_COUNTRIES.filter((c) => c !== SupportedCountries.UK);

interface EtfCountryAlternativesProps {
  currentCountry: EtfSupportedCountry;
  section?: EtfBrowseSection;
  /**
   * Builds the destination path for a given country. Detail listing pages (a specific group,
   * category, asset class, or provider) pass this so the switcher links to the *same* listing in
   * the other country (e.g. `/etfs/countries/Canada/groups/broad-equity/categories/large-value`)
   * instead of just the section index. When omitted we fall back to the section index path.
   */
  buildHref?: (country: EtfSupportedCountry) => string;
  /**
   * Include `currentCountry` in the list instead of filtering it out. Used on the home page, which
   * isn't "on" any one country, so every supported country (including the US) is shown as a link.
   */
  includeCurrent?: boolean;
  className?: string;
}

export default function EtfCountryAlternatives({ currentCountry, section, buildHref, includeCurrent = false, className = '' }: EtfCountryAlternativesProps) {
  const alternatives = includeCurrent ? [...SWITCHER_ETF_COUNTRIES] : SWITCHER_ETF_COUNTRIES.filter((c) => c !== currentCountry);
  if (alternatives.length === 0) return null;

  return (
    <div className={`country-alternatives-panel flex flex-col sm:flex-row items-start sm:items-center p-1 sm:p-2 rounded-lg bg-gray-700/50 ${className}`}>
      <div className="flex items-center mb-1 sm:mb-0">
        <GlobeAltIcon className="h-4 w-4 text-blue-400" />
        <span className="country-alternatives-label ml-2 text-blue-100 font-semibold">Also view:</span>
      </div>
      <div className="flex flex-wrap gap-2 sm:ml-2">
        {alternatives.map((country, index) => {
          const href = buildHref ? buildHref(country) : section ? etfSectionIndexPath(country, section) : etfBasePath(country);
          return (
            <span key={country} className="inline-flex items-center">
              <Link
                href={href}
                prefetch={false}
                className="country-alternatives-link text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold"
              >
                {etfCountryDisplayName(country)} ETFs
              </Link>
              {index < alternatives.length - 1 && <span className="text-gray-500 ml-2 hidden sm:inline">•</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}
