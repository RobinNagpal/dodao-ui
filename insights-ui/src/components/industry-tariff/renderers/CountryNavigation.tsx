'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CountryNavigationProps {
  countries: string[];
  industryId: string;
}

export const CountryNavigation: React.FC<CountryNavigationProps> = ({ countries, industryId }) => {

  const scrollToCountry = (countryName: string) => {
    const element = document.getElementById(`country-${countryName.toLowerCase().replace(/\s+/g, '-')}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {countries.map((countryName, index) => (
          <button
            key={countryName}
            onClick={() => scrollToCountry(countryName)}
            className="px-3 py-2 text-sm font-medium primary-color hover:text-white hover:bg-primary-color rounded-md transition-colors"
          >
            {countryName}
          </button>
        ))}

        <div className="border-t border-gray-600 h-6 mx-2"></div>

        <Link
          href={`/industry-tariff-report/${industryId}/all-countries-tariff-updates`}
          className="px-3 py-2 text-sm font-medium primary-color hover:text-white hover:bg-primary-color rounded-md transition-colors inline-flex items-center"
        >
          All Countries
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};
