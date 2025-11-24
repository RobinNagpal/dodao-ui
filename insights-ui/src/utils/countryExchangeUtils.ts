/** ---------- Country-Exchange Mappings ---------- */

import { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

/** ---------- Types ---------- */

export enum SupportedCountries {
  US = 'US',
  Canada = 'Canada',
  India = 'India',
  UK = 'UK',
  Pakistan = 'Pakistan',
  Japan = 'Japan',
  Taiwan = 'Taiwan',
  HongKong = 'HongKong',
  Korea = 'Korea',
}

export enum USExchanges {
  NASDAQ = 'NASDAQ',
  NYSE = 'NYSE',
  NYSEAMERICAN = 'NYSEAMERICAN',
  OTCMKTS = 'OTCMKTS',
}

export enum CanadaExchanges {
  TSX = 'TSX',
  TSXV = 'TSXV',
}

export enum IndiaExchanges {
  BSE = 'BSE',
  NSE = 'NSE',
}

export enum UKExchanges {
  LSE = 'LSE',
  AIM = 'AIM',
}

export enum PakistanExchanges {
  PSX = 'PSX',
}

export enum JapanExchanges {
  TSE = 'TSE', 
}

export enum TaiwanExchanges {
  TWSE = 'TWSE', 
}

export enum HongKongExchanges {
  HKEX = 'HKEX',
}

export enum KoreaExchanges {
  KRX = 'KRX',
}

export type AllExchanges = USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges | JapanExchanges | TaiwanExchanges | HongKongExchanges | KoreaExchanges;

/** ---------- Constants ---------- */

export const EXCHANGES: ReadonlyArray<AllExchanges> = [
  USExchanges.NASDAQ,
  USExchanges.NYSE,
  USExchanges.NYSEAMERICAN,
  USExchanges.OTCMKTS,
  CanadaExchanges.TSX,
  CanadaExchanges.TSXV,
  IndiaExchanges.BSE,
  IndiaExchanges.NSE,
  UKExchanges.LSE,
  UKExchanges.AIM,
  PakistanExchanges.PSX,
  JapanExchanges.TSE,
  TaiwanExchanges.TWSE,
  HongKongExchanges.HKEX,
  KoreaExchanges.KRX,
] as const;

export const exchangeItems: StyledSelectItem[] = EXCHANGES.map((e) => ({ id: e, label: e }));

export const COUNTRY_TO_EXCHANGES: Record<SupportedCountries, AllExchanges[]> = {
  [SupportedCountries.US]: Object.values(USExchanges),
  [SupportedCountries.Canada]: Object.values(CanadaExchanges),
  [SupportedCountries.India]: Object.values(IndiaExchanges),
  [SupportedCountries.UK]: Object.values(UKExchanges),
  [SupportedCountries.Pakistan]: Object.values(PakistanExchanges),
  [SupportedCountries.Japan]: Object.values(JapanExchanges),
  [SupportedCountries.Taiwan]: Object.values(TaiwanExchanges),
  [SupportedCountries.HongKong]: Object.values(HongKongExchanges),
  [SupportedCountries.Korea]: Object.values(KoreaExchanges),
};

export const EXCHANGE_TO_COUNTRY: Record<AllExchanges, SupportedCountries> = {
  [USExchanges.NASDAQ]: SupportedCountries.US,
  [USExchanges.NYSE]: SupportedCountries.US,
  [USExchanges.NYSEAMERICAN]: SupportedCountries.US,
  [USExchanges.OTCMKTS]: SupportedCountries.US,
  [CanadaExchanges.TSX]: SupportedCountries.Canada,
  [CanadaExchanges.TSXV]: SupportedCountries.Canada,
  [IndiaExchanges.BSE]: SupportedCountries.India,
  [IndiaExchanges.NSE]: SupportedCountries.India,
  [UKExchanges.LSE]: SupportedCountries.UK,
  [UKExchanges.AIM]: SupportedCountries.UK,
  [PakistanExchanges.PSX]: SupportedCountries.Pakistan,
  [JapanExchanges.TSE]: SupportedCountries.Japan,
  [TaiwanExchanges.TWSE]: SupportedCountries.Taiwan,
  [HongKongExchanges.HKEX]: SupportedCountries.HongKong,
  [KoreaExchanges.KRX]: SupportedCountries.Korea,
};

export type CountryCode = keyof typeof SupportedCountries;

/** Get all supported countries as an array */
export const ALL_SUPPORTED_COUNTRIES: SupportedCountries[] = Object.values(SupportedCountries);

/** ---------- Exchange Utility Functions ---------- */

export const isExchange = (val: string): val is AllExchanges => {
  return (EXCHANGES as readonly string[]).includes(val);
};

export const toExchange = (val?: string | null): AllExchanges => {
  const normalized = (val ?? '').trim().toUpperCase();
  return isExchange(normalized) ? normalized : USExchanges.NASDAQ;
};

/** ---------- Country-Exchange Utility Functions ---------- */

/**
 * Get the country code for a given exchange
 */
export const getCountryByExchange = (exchange: AllExchanges): SupportedCountries => {
  const country = EXCHANGE_TO_COUNTRY[exchange];
  if (!country) {
    throw new Error(`Exchange ${exchange} not found in any country`);
  }
  return country;
};

/**
 * Get all exchanges for a given country
 */
export const getExchangesByCountry = (country: SupportedCountries): AllExchanges[] => {
  const exchanges = COUNTRY_TO_EXCHANGES[country];
  if (!exchanges || exchanges.length === 0) {
    throw new Error(`No exchanges found for country ${country}`);
  }
  return exchanges;
};

/**
 * Safely convert a string to SupportedCountries, returns undefined if invalid
 */
export const toSupportedCountry = (countryParam: string | null | undefined): SupportedCountries | undefined => {
  if (!countryParam) return undefined;
  const normalized = countryParam.trim();
  return Object.values(SupportedCountries).includes(normalized as SupportedCountries) ? (normalized as SupportedCountries) : undefined;
};

/**
 * Get Prisma where clause for filtering by country
 */
export const getExchangeFilterClause = (country: SupportedCountries | null | undefined): { exchange: { in: AllExchanges[] } } | {} => {
  if (!country) return {};

  const exchanges = getExchangesByCountry(country);
  return { exchange: { in: exchanges } };
};

/**
 * Get abbreviated country code for display (US, IND, CAN, UK, PAK)
 */
export const getCountryCodeForSearchBarDisplay = (country: SupportedCountries): string => {
  const countryCodeMap: Record<SupportedCountries, string> = {
    [SupportedCountries.US]: 'US',
    [SupportedCountries.India]: 'IND',
    [SupportedCountries.Canada]: 'CAN',
    [SupportedCountries.UK]: 'UK',
    [SupportedCountries.Pakistan]: 'PAK',
    [SupportedCountries.Japan]: 'JPN',
    [SupportedCountries.Taiwan]: 'TWN',
    [SupportedCountries.HongKong]: 'HKG',
    [SupportedCountries.Korea]: 'KOR',
  };
  return countryCodeMap[country] || country;
};

/**
 * Format exchange as "COUNTRY: EXCHANGE" (e.g., "US: NYSE", "IND: BSE")
 */
export const formatExchangeWithCountry = (exchange: string): string => {
  try {
    const normalizedExchange = toExchange(exchange);
    const country = getCountryByExchange(normalizedExchange);
    const countryCode = getCountryCodeForSearchBarDisplay(country);
    return `${countryCode}: ${normalizedExchange}`;
  } catch {
    // Fallback to just the exchange if we can't determine the country
    return exchange;
  }
};
