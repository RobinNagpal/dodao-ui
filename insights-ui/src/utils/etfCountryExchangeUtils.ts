/**
 * ETF-specific exchange constants & helpers.
 *
 * Why a separate file (mirroring `countryExchangeUtils.ts`):
 * stocks and ETFs don't trade on the exact same exchange surface — most US
 * ETFs live on NYSEARCA / BATS while stocks split across NYSE / NASDAQ /
 * NYSEAMERICAN, and other countries' ETF markets are smaller subsets of
 * their stock-listing venues. Keeping ETF exchanges in their own enum lets
 * the admin UI present only valid ETF venues and lets the API reject
 * stock-only exchanges before they reach the DB.
 *
 * Country is *not* stored on the scenario row — it's derived from a link's
 * exchange via `ETF_EXCHANGE_TO_COUNTRY`. UI filtering by country is done by
 * mapping the selected country back to its set of ETF exchanges (via
 * `getEtfExchangesByCountry`) and filtering links on those exchanges.
 */
import { SupportedCountries } from '@/utils/countryExchangeUtils';

export enum EtfUSExchanges {
  NYSEARCA = 'NYSEARCA',
  BATS = 'BATS',
  NASDAQ = 'NASDAQ',
  NYSE = 'NYSE',
}

export enum EtfCanadaExchanges {
  TSX = 'TSX',
  TSXV = 'TSXV',
  NEOE = 'NEOE',
}

export enum EtfUKExchanges {
  LSE = 'LSE',
}

export enum EtfIndiaExchanges {
  NSE = 'NSE',
  BSE = 'BSE',
}

export enum EtfJapanExchanges {
  TSE = 'TSE',
}

export enum EtfHongKongExchanges {
  HKEX = 'HKEX',
}

export enum EtfAustraliaExchanges {
  ASX = 'ASX',
}

export type AllEtfExchanges =
  | EtfUSExchanges
  | EtfCanadaExchanges
  | EtfUKExchanges
  | EtfIndiaExchanges
  | EtfJapanExchanges
  | EtfHongKongExchanges
  | EtfAustraliaExchanges;

export const ETF_EXCHANGES: ReadonlyArray<AllEtfExchanges> = [
  EtfUSExchanges.NYSEARCA,
  EtfUSExchanges.BATS,
  EtfUSExchanges.NASDAQ,
  EtfUSExchanges.NYSE,
  EtfCanadaExchanges.TSX,
  EtfCanadaExchanges.TSXV,
  EtfCanadaExchanges.NEOE,
  EtfUKExchanges.LSE,
  EtfIndiaExchanges.NSE,
  EtfIndiaExchanges.BSE,
  EtfJapanExchanges.TSE,
  EtfHongKongExchanges.HKEX,
  EtfAustraliaExchanges.ASX,
] as const;

export const ETF_COUNTRY_TO_EXCHANGES: Record<SupportedCountries, AllEtfExchanges[]> = {
  [SupportedCountries.US]: Object.values(EtfUSExchanges),
  [SupportedCountries.Canada]: Object.values(EtfCanadaExchanges),
  [SupportedCountries.UK]: Object.values(EtfUKExchanges),
  [SupportedCountries.India]: Object.values(EtfIndiaExchanges),
  [SupportedCountries.Japan]: Object.values(EtfJapanExchanges),
  [SupportedCountries.HongKong]: Object.values(EtfHongKongExchanges),
  [SupportedCountries.Australia]: Object.values(EtfAustraliaExchanges),
  // Countries below have no listed ETF exchanges yet — kept as empty arrays
  // so the type stays exhaustive over SupportedCountries.
  [SupportedCountries.Pakistan]: [],
  [SupportedCountries.Taiwan]: [],
  [SupportedCountries.Korea]: [],
};

export const ETF_EXCHANGE_TO_COUNTRY: Record<AllEtfExchanges, SupportedCountries> = {
  [EtfUSExchanges.NYSEARCA]: SupportedCountries.US,
  [EtfUSExchanges.BATS]: SupportedCountries.US,
  [EtfUSExchanges.NASDAQ]: SupportedCountries.US,
  [EtfUSExchanges.NYSE]: SupportedCountries.US,
  [EtfCanadaExchanges.TSX]: SupportedCountries.Canada,
  [EtfCanadaExchanges.TSXV]: SupportedCountries.Canada,
  [EtfCanadaExchanges.NEOE]: SupportedCountries.Canada,
  [EtfUKExchanges.LSE]: SupportedCountries.UK,
  [EtfIndiaExchanges.NSE]: SupportedCountries.India,
  [EtfIndiaExchanges.BSE]: SupportedCountries.India,
  [EtfJapanExchanges.TSE]: SupportedCountries.Japan,
  [EtfHongKongExchanges.HKEX]: SupportedCountries.HongKong,
  [EtfAustraliaExchanges.ASX]: SupportedCountries.Australia,
};

export const isEtfExchange = (val: string): val is AllEtfExchanges => {
  return (ETF_EXCHANGES as readonly string[]).includes(val);
};

export const toEtfExchange = (val?: string | null): AllEtfExchanges => {
  const normalized = (val ?? '').trim().toUpperCase();
  return isEtfExchange(normalized) ? normalized : EtfUSExchanges.NYSEARCA;
};

export const getEtfCountryByExchange = (exchange: AllEtfExchanges): SupportedCountries => {
  const country = ETF_EXCHANGE_TO_COUNTRY[exchange];
  if (!country) throw new Error(`ETF exchange ${exchange} not mapped to a country`);
  return country;
};

export const getEtfExchangesByCountry = (country: SupportedCountries): AllEtfExchanges[] => {
  return ETF_COUNTRY_TO_EXCHANGES[country] ?? [];
};
