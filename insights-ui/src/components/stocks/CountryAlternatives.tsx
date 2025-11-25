import Link from 'next/link';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { ALL_SUPPORTED_COUNTRIES, SupportedCountries } from '@/utils/countryExchangeUtils';

interface CountryAlternativesProps {
  currentCountry?: string;
  industryKey?: string;
  className?: string;
  enhanced?: boolean;
  centerContent?: boolean;
  compact?: boolean;
}

// Mapping for display names and paths for each country
const COUNTRY_DISPLAY_CONFIG: Record<SupportedCountries, { name: string; path: string; isActive: boolean }> = {
  [SupportedCountries.US]: { name: 'US', path: '', isActive: true }, // US has no /countries/ prefix
  [SupportedCountries.Canada]: { name: 'Canadian', path: '/countries/Canada', isActive: true },
  [SupportedCountries.India]: { name: 'Indian', path: '/countries/India', isActive: true },
  [SupportedCountries.UK]: { name: 'UK', path: '/countries/UK', isActive: true },
  [SupportedCountries.Pakistan]: { name: 'Pakistani', path: '/countries/Pakistan', isActive: true },
  [SupportedCountries.Japan]: { name: 'Japanese', path: '/countries/Japan', isActive: false },
  [SupportedCountries.Taiwan]: { name: 'Taiwanese', path: '/countries/Taiwan', isActive: false },
  [SupportedCountries.HongKong]: { name: 'Hong Kongese', path: '/countries/HongKong', isActive: false },
  [SupportedCountries.Korea]: { name: 'Korean', path: '/countries/Korea', isActive: true },
};

export default function CountryAlternatives({
  currentCountry = 'US',
  industryKey,
  className = '',
  enhanced = false,
  centerContent = false,
  compact = false,
}: CountryAlternativesProps) {
  // Use countries from utils and map them to display config
  const countries = ALL_SUPPORTED_COUNTRIES.map((code) => ({
    code,
    ...COUNTRY_DISPLAY_CONFIG[code],
  }));

  // Filter out the current country
  const alternativeCountries = countries.filter((country) => country.code !== currentCountry);

  if (alternativeCountries.length === 0) {
    return null;
  }

  return (
    <div
      className={`
      flex flex-col sm:flex-row 
      items-start sm:items-center 
      ${enhanced ? `p-${compact ? '1' : '2'} sm:p-${compact ? '2' : '3'} rounded-lg bg-gray-700/50` : ''} 
      ${centerContent ? 'text-center' : ''}
      ${className}
    `}
    >
      <div
        className={`
        flex items-center mb-${compact ? '1' : '2'} sm:mb-0
        ${centerContent ? 'mx-auto sm:mx-0' : ''}
      `}
      >
        <GlobeAltIcon className={`h-4 w-4 ${enhanced ? 'text-blue-400' : 'text-gray-400'}`} />
        <span className={`ml-2 ${enhanced ? 'text-blue-100 font-semibold' : 'text-gray-400'}`}>Also view:</span>
      </div>
      <div className={`flex flex-wrap gap-2 sm:ml-2 ${centerContent ? 'justify-center mx-auto sm:mx-0' : ''}`}>
        {alternativeCountries
          .filter((c) => COUNTRY_DISPLAY_CONFIG[c.code].isActive)
          .map((country, index) => {
            const href = industryKey ? `/stocks${country.path}/industries/${industryKey}` : `/stocks${country.path}`;

            return (
              <span key={country.code} className="inline-flex items-center">
                <Link href={href} className={`text-blue-400 hover:text-blue-300 transition-colors duration-200 ${enhanced ? 'font-semibold' : ''}`}>
                  {country.name} Stocks
                </Link>
                {index < alternativeCountries.length - 1 && <span className="text-gray-500 ml-2 hidden sm:inline">•</span>}
              </span>
            );
          })}
      </div>
    </div>
  );
}
