// Country-of-origin choices for the tariff calculator form. Curated from the
// most-traded partners with the US plus the countries called out by name in
// the upstream candidate-codes feed (IEEPA / Section 232 / Section 301).
// Kept short on purpose — the calculator accepts any 2-letter ISO code, this
// is just the dropdown convenience list.

export interface CountryOption {
  code: string;
  name: string;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'CN', name: 'China' },
  { code: 'MX', name: 'Mexico' },
  { code: 'CA', name: 'Canada' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'KR', name: 'South Korea' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'IN', name: 'India' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'IT', name: 'Italy' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'BR', name: 'Brazil' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'SG', name: 'Singapore' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'ES', name: 'Spain' },
  { code: 'AU', name: 'Australia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PA', name: 'Panama' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Peru' },
  { code: 'AR', name: 'Argentina' },
  { code: 'IL', name: 'Israel' },
];
