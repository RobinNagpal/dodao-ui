/**
 * ETF-specific country & exchange constants — kept separate from
 * `countryExchangeUtils.ts` (stocks) because:
 *  - ETF coverage is currently US + Canada only; reusing the 10-country stock
 *    list would let admins create scenarios in markets we have no ETF data for.
 *  - ETF venues (NYSEARCA, BATS, NEOE) don't all overlap with the stock
 *    exchange list.
 *
 * Country code values are reused from `SupportedCountries` so the strings
 * stored in the DB match the stock side ("US", "Canada").
 */
import { SupportedCountries } from '@/utils/countryExchangeUtils';

export type EtfSupportedCountry = SupportedCountries.US | SupportedCountries.Canada;

export const ETF_SUPPORTED_COUNTRIES: EtfSupportedCountry[] = [SupportedCountries.US, SupportedCountries.Canada];

export const isEtfSupportedCountry = (val: string): val is EtfSupportedCountry => {
  return (ETF_SUPPORTED_COUNTRIES as readonly string[]).includes(val);
};

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

export const toEtfSupportedCountry = (val: string | null | undefined): EtfSupportedCountry | undefined => {
  if (!val) return undefined;
  const trimmed = val.trim();
  return isEtfSupportedCountry(trimmed) ? trimmed : undefined;
};
