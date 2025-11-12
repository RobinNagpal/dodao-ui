/** ---------- Country-Exchange Mappings ---------- */

import { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

/** ---------- Types ---------- */

export enum SupportedCountries {
  US = 'US',
  Canada = 'Canada',
  India = 'India',
  UK = 'UK',
  Pakistan = 'Pakistan',
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

/** ---------- Constants ---------- */

export const EXCHANGES: ReadonlyArray<USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges> = [
  USExchanges.NASDAQ,
  USExchanges.NYSE,
  USExchanges.NYSEAMERICAN,
  CanadaExchanges.TSX,
  CanadaExchanges.TSXV,
  IndiaExchanges.BSE,
  IndiaExchanges.NSE,
  UKExchanges.LSE,
  UKExchanges.AIM,
  PakistanExchanges.PSX,
] as const;

export const exchangeItems: StyledSelectItem[] = EXCHANGES.map((e) => ({ id: e, label: e }));

export const COUNTRY_TO_EXCHANGES: Record<SupportedCountries, (USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges)[]> = {
  [SupportedCountries.US]: Object.values(USExchanges),
  [SupportedCountries.Canada]: Object.values(CanadaExchanges),
  [SupportedCountries.India]: Object.values(IndiaExchanges),
  [SupportedCountries.UK]: Object.values(UKExchanges),
  [SupportedCountries.Pakistan]: Object.values(PakistanExchanges),
};

export const EXCHANGE_TO_COUNTRY: Record<USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges, SupportedCountries> = {
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
};

export type CountryCode = keyof typeof SupportedCountries;

/** ---------- Exchange Utility Functions ---------- */

export const isExchange = (val: string): val is USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges => {
  return (EXCHANGES as readonly string[]).includes(val);
};

export const toExchange = (val?: string | null): USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges => {
  const normalized = (val ?? '').trim().toUpperCase();
  return isExchange(normalized) ? normalized : USExchanges.NASDAQ;
};

/** ---------- Country-Exchange Utility Functions ---------- */

/**
 * Get the country code for a given exchange
 */
export const getCountryByExchange = (exchange: USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges): SupportedCountries => {
  const country = EXCHANGE_TO_COUNTRY[exchange];
  if (!country) {
    throw new Error(`Exchange ${exchange} not found in any country`);
  }
  return country;
};

/**
 * Get all exchanges for a given country
 */
export const getExchangesByCountry = (country: SupportedCountries): (USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges)[] => {
  const exchanges = COUNTRY_TO_EXCHANGES[country];
  if (!exchanges || exchanges.length === 0) {
    throw new Error(`No exchanges found for country ${country}`);
  }
  return exchanges;
};

/**
 * Get Prisma where clause for filtering by country
 */
export const getCountryFilterClause = (
  country: SupportedCountries | null | undefined
): { exchange: { in: (USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges | PakistanExchanges)[] } } | {} => {
  if (!country) return {};

  const exchanges = getExchangesByCountry(country);
  return { exchange: { in: exchanges } };
};
