import Link from 'next/link';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { ALL_ETF_COUNTRIES, EtfBrowseSection, etfBasePath, etfCountryDisplayName, etfSectionIndexPath } from '@/utils/etf-country-route-utils';

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
  className?: string;
}

export default function EtfCountryAlternatives({ currentCountry, section, buildHref, className = '' }: EtfCountryAlternativesProps) {
  const alternatives = ALL_ETF_COUNTRIES.filter((c) => c !== currentCountry);
  if (alternatives.length === 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center p-1 sm:p-2 rounded-lg bg-gray-700/50 ${className}`}>
      <div className="flex items-center mb-1 sm:mb-0">
        <GlobeAltIcon className="h-4 w-4 text-blue-400" />
        <span className="ml-2 text-blue-100 font-semibold">Also view:</span>
      </div>
      <div className="flex flex-wrap gap-2 sm:ml-2">
        {alternatives.map((country, index) => {
          const href = buildHref ? buildHref(country) : section ? etfSectionIndexPath(country, section) : etfBasePath(country);
          return (
            <span key={country} className="inline-flex items-center">
              <Link href={href} prefetch={false} className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold">
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
