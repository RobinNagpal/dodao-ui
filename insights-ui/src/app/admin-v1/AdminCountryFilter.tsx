'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import React from 'react';
import { CountryCode, EXCHANGE_TO_COUNTRY, ALL_SUPPORTED_COUNTRIES, SupportedCountries } from '../../utils/countryExchangeUtils';

export interface CountryFilterProps {
  selectedCountries: CountryCode[];
  onCountriesChange: (countries: CountryCode[]) => void;
  disabled?: boolean;
}

// Map exchanges to countries - create string-based mapping from the enum mapping
export const EXCHANGE_TO_COUNTRY_MAP: Record<string, SupportedCountries> = Object.fromEntries(
  Object.entries(EXCHANGE_TO_COUNTRY).map(([exchange, country]) => [exchange, country])
);

export default function AdminCountryFilter({ selectedCountries, onCountriesChange, disabled = false }: CountryFilterProps) {
  const toggleCountry = (country: CountryCode) => {
    if (selectedCountries.includes(country)) {
      onCountriesChange(selectedCountries.filter((c) => c !== country));
    } else {
      onCountriesChange([...selectedCountries, country]);
    }
  };

  const selectAll = () => {
    onCountriesChange(ALL_SUPPORTED_COUNTRIES as CountryCode[]);
  };

  const clearAll = () => {
    onCountriesChange([]);
  };

  const allSelected = selectedCountries.length === ALL_SUPPORTED_COUNTRIES.length;
  const noneSelected = selectedCountries.length === 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-300 mr-2">Countries:</span>

      {/* Country buttons */}
      {ALL_SUPPORTED_COUNTRIES.map((country) => (
        <Button
          key={country}
          variant={selectedCountries.includes(country) ? 'contained' : 'outlined'}
          size="sm"
          onClick={() => toggleCountry(country)}
          disabled={disabled}
          className="text-xs"
        >
          {country}
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
  if (selectedCountries.length === 0 || selectedCountries.length === ALL_SUPPORTED_COUNTRIES.length) {
    return tickers; // Show all if none selected or all selected
  }

  return tickers.filter((ticker) => {
    const country = EXCHANGE_TO_COUNTRY_MAP[ticker.exchange];
    return country && selectedCountries.includes(country as CountryCode);
  });
}
