'use client';

import { slugify } from '@dodao/web-core/utils/auth/slugify';

interface CountryNavigationProps {
  countries: string[];
}

export const CountryNavigation: React.FC<CountryNavigationProps> = ({ countries }) => {
  const scrollToCountry = (countryName: string) => {
    const element = document.getElementById(`country-${slugify(countryName.toLowerCase())}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {countries.map((countryName) => (
          <button
            key={countryName}
            onClick={() => scrollToCountry(countryName)}
            className="px-3 py-2 text-sm font-medium primary-color hover:text-white hover:bg-primary-color rounded-md transition-colors"
          >
            {countryName}
          </button>
        ))}
      </div>
    </div>
  );
};
