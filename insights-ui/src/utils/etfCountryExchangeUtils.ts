/**
 * ETF-specific country & exchange constants (mirrors `countryExchangeUtils.ts`
 * for stocks, but kept deliberately separate).
 *
 * Why a distinct setup:
 *  - Country list — ETFs currently launch only in the US and Canada in our
 *    coverage. Stocks support 10+ countries; piggy-backing on that list would
 *    let admins create scenarios in markets we have no ETF data for.
 *  - Exchange list — most US ETFs trade on NYSEARCA/BATS while stocks split
 *    across NYSE/NASDAQ/NYSEAMERICAN, and Canadian ETFs include NEOE which
 *    isn't in the stock enum. A separate enum lets the UI present only valid
 *    ETF venues and lets the API reject stock-only exchanges.
 *
 * Country codes themselves are reused from `SupportedCountries` so the values
 * stored in the DB match the stock side ("US", "Canada").
 */
import { SupportedCountries } from '@/utils/countryExchangeUtils';

/** ---------- Supported countries ---------- */

export type EtfSupportedCountry = SupportedCountries.US | SupportedCountries.Canada;

export const ETF_SUPPORTED_COUNTRIES: EtfSupportedCountry[] = [SupportedCountries.US, SupportedCountries.Canada];

export const isEtfSupportedCountry = (val: string): val is EtfSupportedCountry => {
  return (ETF_SUPPORTED_COUNTRIES as readonly string[]).includes(val);
};

/** ---------- Exchanges ---------- */

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

export type AllEtfExchanges = EtfUSExchanges | EtfCanadaExchanges;

export const ETF_EXCHANGES: ReadonlyArray<AllEtfExchanges> = [
  EtfUSExchanges.NYSEARCA,
  EtfUSExchanges.BATS,
  EtfUSExchanges.NASDAQ,
  EtfUSExchanges.NYSE,
  EtfCanadaExchanges.TSX,
  EtfCanadaExchanges.TSXV,
  EtfCanadaExchanges.NEOE,
] as const;

export const ETF_COUNTRY_TO_EXCHANGES: Record<EtfSupportedCountry, AllEtfExchanges[]> = {
  [SupportedCountries.US]: Object.values(EtfUSExchanges),
  [SupportedCountries.Canada]: Object.values(EtfCanadaExchanges),
};

export const ETF_EXCHANGE_TO_COUNTRY: Record<AllEtfExchanges, EtfSupportedCountry> = {
  [EtfUSExchanges.NYSEARCA]: SupportedCountries.US,
  [EtfUSExchanges.BATS]: SupportedCountries.US,
  [EtfUSExchanges.NASDAQ]: SupportedCountries.US,
  [EtfUSExchanges.NYSE]: SupportedCountries.US,
  [EtfCanadaExchanges.TSX]: SupportedCountries.Canada,
  [EtfCanadaExchanges.TSXV]: SupportedCountries.Canada,
  [EtfCanadaExchanges.NEOE]: SupportedCountries.Canada,
};

export const isEtfExchange = (val: string): val is AllEtfExchanges => {
  return (ETF_EXCHANGES as readonly string[]).includes(val);
};

export const toEtfExchange = (val?: string | null): AllEtfExchanges => {
  const normalized = (val ?? '').trim().toUpperCase();
  return isEtfExchange(normalized) ? normalized : EtfUSExchanges.NYSEARCA;
};

export const getEtfCountryByExchange = (exchange: AllEtfExchanges): EtfSupportedCountry => {
  const country = ETF_EXCHANGE_TO_COUNTRY[exchange];
  if (!country) throw new Error(`ETF exchange ${exchange} not mapped to a supported country`);
  return country;
};

export const getEtfExchangesByCountry = (country: EtfSupportedCountry): AllEtfExchanges[] => {
  return ETF_COUNTRY_TO_EXCHANGES[country] ?? [];
};

/** Narrow an arbitrary country string (e.g. from a query param) to an ETF
 *  supported country, or undefined if unsupported. */
export const toEtfSupportedCountry = (val: string | null | undefined): EtfSupportedCountry | undefined => {
  if (!val) return undefined;
  const trimmed = val.trim();
  return isEtfSupportedCountry(trimmed) ? trimmed : undefined;
};
