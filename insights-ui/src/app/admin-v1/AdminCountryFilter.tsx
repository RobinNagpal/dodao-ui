'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import React from 'react';

export type CountryCode = 'US' | 'CA';

export interface CountryFilterProps {
  selectedCountries: CountryCode[];
  onCountriesChange: (countries: CountryCode[]) => void;
  disabled?: boolean;
}

// Map exchanges to countries
export const EXCHANGE_TO_COUNTRY_MAP: Record<string, CountryCode> = {
  NASDAQ: 'US',
  NYSE: 'US',
  NYSEAMERICAN: 'US',
  TSX: 'CA',
  TSXV: 'CA',
};

export const COUNTRY_INFO = {
  US: { label: 'United States', exchanges: ['NASDAQ', 'NYSE', 'NYSEAMERICAN'] },
  CA: { label: 'Canada', exchanges: ['TSX', 'TSXV'] },
} as const;

export const ALL_COUNTRIES: CountryCode[] = ['US', 'CA'];

export default function AdminCountryFilter({ selectedCountries, onCountriesChange, disabled = false }: CountryFilterProps) {
  const toggleCountry = (country: CountryCode) => {
    if (selectedCountries.includes(country)) {
      onCountriesChange(selectedCountries.filter((c) => c !== country));
    } else {
      onCountriesChange([...selectedCountries, country]);
    }
  };

  const selectAll = () => {
    onCountriesChange(ALL_COUNTRIES);
  };

  const clearAll = () => {
    onCountriesChange([]);
  };

  const allSelected = selectedCountries.length === ALL_COUNTRIES.length;
  const noneSelected = selectedCountries.length === 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-300 mr-2">Countries:</span>

      {/* Country buttons */}
      {ALL_COUNTRIES.map((country) => (
        <Button
          key={country}
          variant={selectedCountries.includes(country) ? 'contained' : 'outlined'}
          size="sm"
          onClick={() => toggleCountry(country)}
          disabled={disabled}
          className="text-xs"
        >
          {COUNTRY_INFO[country].label}
        </Button>
      ))}

      {/* Control buttons */}
      <div className="flex gap-1 ml-2">
        {!allSelected && (
          <Button variant="outlined" size="sm" onClick={selectAll} disabled={disabled} className="text-xs">
            All
          </Button>
        )}
        {!noneSelected && (
          <Button variant="outlined" size="sm" onClick={clearAll} disabled={disabled} className="text-xs">
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper function to filter tickers by country
export function filterTickersByCountries<T extends { exchange: string }>(tickers: T[], selectedCountries: CountryCode[]): T[] {
  if (selectedCountries.length === 0 || selectedCountries.length === ALL_COUNTRIES.length) {
    return tickers; // Show all if none selected or all selected
  }

  return tickers.filter((ticker) => {
    const country = EXCHANGE_TO_COUNTRY_MAP[ticker.exchange];
    return country && selectedCountries.includes(country);
  });
}
