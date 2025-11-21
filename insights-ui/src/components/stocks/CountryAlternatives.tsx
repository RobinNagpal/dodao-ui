import Link from 'next/link';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { ALL_SUPPORTED_COUNTRIES, SupportedCountries } from '@/utils/countryExchangeUtils';

interface CountryAlternativesProps {
  currentCountry?: string;
  industryKey?: string;
  className?: string;
  enhanced?: boolean;
}

// Mapping for display names and paths for each country
const COUNTRY_DISPLAY_CONFIG: Record<SupportedCountries, { name: string; path: string }> = {
  [SupportedCountries.US]: { name: 'US', path: '' }, // US has no /countries/ prefix
  [SupportedCountries.Canada]: { name: 'Canadian', path: '/countries/Canada' },
  [SupportedCountries.India]: { name: 'Indian', path: '/countries/India' },
  [SupportedCountries.UK]: { name: 'UK', path: '/countries/UK' },
  [SupportedCountries.Pakistan]: { name: 'Pakistani', path: '/countries/Pakistan' },
};

export default function CountryAlternatives({ currentCountry = 'US', industryKey, className = '', enhanced = false }: CountryAlternativesProps) {
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
    <div className={`flex items-center space-x-3 ${className}`}>
      <GlobeAltIcon className="h-4 w-4 text-gray-400" />
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className={`text-gray-400 ${enhanced ? 'font-semibold' : ''}`}>Also view:</span>
        {alternativeCountries.map((country, index) => {
          const href = industryKey ? `/stocks${country.path}/industries/${industryKey}` : `/stocks${country.path}`;

          return (
            <span key={country.code}>
              <Link href={href} className={`text-blue-400 hover:text-blue-300 transition-colors duration-200 ${enhanced ? 'font-semibold' : ''}`}>
                {country.name} Stocks
              </Link>
              {index < alternativeCountries.length - 1 && <span className="text-gray-500 ml-2">•</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}
