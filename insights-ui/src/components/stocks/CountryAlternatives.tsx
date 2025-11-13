import Link from 'next/link';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

interface CountryAlternativesProps {
  currentCountry?: string;
  industryKey?: string;
  className?: string;
}

export default function CountryAlternatives({ currentCountry = 'US', industryKey, className = '' }: CountryAlternativesProps) {
  // Define available countries and their display names
  const countries = [
    { code: 'US', name: 'US', path: '' }, // US has no /countries/ prefix
    { code: 'Canada', name: 'Canadian', path: '/countries/Canada' },
    { code: 'India', name: 'Indian', path: '/countries/India' },
    { code: 'UK', name: 'UK', path: '/countries/UK' },
  ];

  // Filter out the current country
  const alternativeCountries = countries.filter((country) => country.code !== currentCountry);

  if (alternativeCountries.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <GlobeAltIcon className="h-4 w-4 text-gray-400" />
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-400">Also view:</span>
        {alternativeCountries.map((country, index) => {
          const href = industryKey ? `/stocks${country.path}/industries/${industryKey}` : `/stocks${country.path}`;

          return (
            <span key={country.code}>
              <Link href={href} className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
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
