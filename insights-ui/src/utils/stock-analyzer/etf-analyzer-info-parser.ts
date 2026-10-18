import type { EtfStockAnalyzerInfo } from '@prisma/client';
import { AllExchanges, getCountryByExchange, SupportedCountries } from '@/utils/countryExchangeUtils';
import { getStockAnalyzeExchangeSegment } from '@/utils/stockAnalyzeUrlValidation';

/**
 * Parsing for `EtfStockAnalyzerInfo`.
 *
 * Every column of that table is one column of the stock-data source's ETF
 * screener (the table was first loaded from a screener export). The ETF quote
 * page only shows ~20 of them, so instead of scraping HTML this reads the JSON
 * data API the screener page itself loads its columns from:
 *
 *   /_api/endpoints/screener/data-points?type=etf&ids=<id>+<id>…[&c=<country>]
 *     => { status, data: { data: { "<key>": { "<id>": value, … }, … } } }
 *   /_api/endpoints/screener/initial?type=etf&countryCode=<country>&format=compact
 *     => { status, data: { columns: ["s", "n", …], rows: [[…], …] } }
 *
 * Both return the whole country universe; a row is keyed by the bare symbol for
 * US funds (`SPY`) and `{segment}/{SYMBOL}` elsewhere (`tsx/ZLC`, `neo/FBAL`,
 * `lon/CIND`, `asx/BUGG`). The fund name (`n`) only comes back from `initial`.
 *
 * Values are converted to the notation the original import stored, which the
 * report prompts and `etf-performance-metrics-utils.ts` read: percentages as
 * `"12.35%"` strings, dates as `YYYY-MM-DD`, prices / ratios as numbers.
 */

/** Stored columns this parser can fill (everything but the row bookkeeping). */
export type EtfAnalyzerInfoFieldKey = Exclude<keyof EtfStockAnalyzerInfo, 'id' | 'etfId' | 'createdAt' | 'updatedAt'>;

/** Parsed values: only the fields the source actually had a value for. */
export type EtfAnalyzerInfoFields = Partial<Pick<EtfStockAnalyzerInfo, EtfAnalyzerInfoFieldKey>>;

type ValueKind =
  /** Raw string (tags arrays are joined with `, `). */
  | 'string'
  /** Number rendered as a percent string with two decimals: `12.3456` => `"12.35%"`. */
  | 'percent'
  /** Number rendered as a plain string: `701.61` => `"701.61"`. */
  | 'numberString'
  | 'float'
  | 'int'
  | 'bigint'
  /** `YYYY-MM-DD`. */
  | 'date';

interface ColumnMapping {
  field: EtfAnalyzerInfoFieldKey;
  /** The source screener's column id. */
  sourceId: string;
  kind: ValueKind;
}

const column = (field: EtfAnalyzerInfoFieldKey, sourceId: string, kind: ValueKind): ColumnMapping => ({ field, sourceId, kind });

/** Columns read from the `data-points` endpoint. */
export const ETF_ANALYZER_INFO_COLUMNS: readonly ColumnMapping[] = [
  column('assetClass', 'assetClass', 'string'),
  column('stockPrice', 'price', 'numberString'),
  column('percentChange', 'change', 'percent'),
  column('isinNumber', 'isin', 'string'),
  column('cusipNumber', 'cusip', 'string'),

  column('ma200ChgPercent', 'ma200ch', 'percent'),
  column('ma150ChgPercent', 'ma150ch', 'percent'),
  column('ma50ChgPercent', 'ma50ch', 'percent'),
  column('ma20ChgPercent', 'ma20ch', 'percent'),
  column('ma200', 'ma200', 'float'),
  column('ma150', 'ma150', 'float'),
  column('ma50', 'ma50', 'float'),
  column('ma20', 'ma20', 'float'),

  column('tags', 'tags', 'string'),

  column('atlDate', 'allTimeLowDate', 'date'),
  column('atlChgPercent', 'allTimeLowChange', 'percent'),
  column('atl', 'allTimeLow', 'float'),
  column('athDate', 'allTimeHighDate', 'date'),
  column('athChgPercent', 'allTimeHighChange', 'percent'),
  column('ath', 'allTimeHigh', 'float'),

  column('low52wDate', 'low52Date', 'date'),
  column('high52wDate', 'high52Date', 'date'),
  column('high52wChg', 'high52ch', 'percent'),
  column('low52wChg', 'low52ch', 'percent'),

  column('cagr20y', 'cagr20y', 'percent'),
  column('cagr15y', 'cagr15y', 'percent'),
  column('cagr10y', 'cagr10y', 'percent'),
  column('cagr5y', 'cagr5y', 'percent'),
  column('cagr3y', 'cagr3y', 'percent'),
  column('cagr1y', 'cagr1y', 'percent'),

  // "Total Return" columns (price change plus distributions).
  column('return20y', 'tr20y', 'percent'),
  column('return15y', 'tr15y', 'percent'),
  column('return10y', 'tr10y', 'percent'),
  column('return5y', 'tr5y', 'percent'),
  column('return3y', 'tr3y', 'percent'),
  column('return1y', 'tr1y', 'percent'),
  column('returnYtd', 'trYTD', 'percent'),
  column('return6m', 'tr6m', 'percent'),
  column('return3m', 'tr3m', 'percent'),
  column('return1m', 'tr1m', 'percent'),

  // "Price Change" columns.
  column('change20y', 'ch20y', 'percent'),
  column('change15y', 'ch15y', 'percent'),
  column('change10y', 'ch10y', 'percent'),
  column('change5y', 'ch5y', 'percent'),
  column('change3y', 'ch3y', 'percent'),
  column('change1y', 'ch1y', 'percent'),
  column('changeYtd', 'chYTD', 'percent'),
  column('change6m', 'ch6m', 'percent'),
  column('change3m', 'ch3m', 'percent'),
  column('change1m', 'ch1m', 'percent'),
  column('change1w', 'ch1w', 'percent'),

  column('options', 'optionable', 'string'),
  column('leverage', 'etfLeverage', 'string'),
  column('country', 'etfCountry', 'string'),
  column('region', 'etfRegion', 'string'),

  column('paymentDate', 'paymentDate', 'date'),
  column('exDivDate', 'exDivDate', 'date'),
  column('divGrowth10y', 'divCAGR10', 'percent'),
  column('divGrowth5y', 'divCAGR5', 'percent'),
  column('divGrowth3y', 'divCAGR3', 'percent'),
  column('divYears', 'dividendYears', 'int'),
  column('divGrYears', 'dividendGrowthYears', 'int'),
  column('divGrowth', 'dividendGrowth', 'percent'),
  column('lastDiv', 'lastDividend', 'float'),
  column('divDollars', 'dps', 'float'),

  column('sortino', 'sortinoRatio', 'float'),
  column('atr', 'atr', 'float'),
  column('sharpe', 'sharpeRatio', 'float'),

  column('indexName', 'etfIndex', 'string'),
  column('priceCurrency', 'priceCurrency', 'string'),

  column('beta1y', 'beta1y', 'float'),
  column('beta2y', 'beta2y', 'float'),
  column('beta5y', 'beta', 'float'),

  column('rsi', 'rsi', 'float'),
  column('rsiW', 'rsiWeekly', 'float'),
  column('rsiM', 'rsiMonthly', 'float'),

  column('issuer', 'issuer', 'string'),
  column('category', 'etfCategory', 'string'),

  column('chgOpenPercent', 'changeFromOpen', 'percent'),
  column('positionInRange', 'positionInRange', 'percent'),
  column('open', 'open', 'float'),
  column('low', 'low', 'float'),
  column('high', 'high', 'float'),
  column('prevClose', 'close', 'float'),
  column('priceDate', 'priceDate', 'date'),

  column('premarketPrice', 'premarketPrice', 'float'),
  column('premarketChgPercent', 'premarketChangePercent', 'percent'),
  column('gapPercent', 'daysGap', 'percent'),
  // A ratio to average volume (`1.92` = 192%), stored as the plain number.
  column('relVolume', 'relativeVolume', 'numberString'),
  column('avgVolume', 'averageVolume', 'bigint'),
  column('dollarVol', 'dollarVolume', 'bigint'),

  column('afterhrClose', 'postClose', 'float'),
  column('afterhrChgPercent', 'postmarketChangePercent', 'percent'),
  column('afterhrPrice', 'postmarketPrice', 'float'),
  column('preVolume', 'premarketVolume', 'bigint'),
  column('premarketClose', 'preClose', 'float'),
];

/** One screener row from `data-points`: column id => raw value. */
export type EtfScreenerRow = Record<string, unknown>;

/** The screener's country parameter (`c=` / `countryCode=`); empty for the US universe. */
const COUNTRY_TO_SCREENER_CODE: Readonly<Record<SupportedCountries, string>> = {
  [SupportedCountries.US]: '',
  [SupportedCountries.Canada]: 'CA',
  [SupportedCountries.UK]: 'UK',
  [SupportedCountries.Australia]: 'AU',
  [SupportedCountries.India]: 'IN',
  [SupportedCountries.Japan]: 'JP',
  [SupportedCountries.HongKong]: 'HK',
  [SupportedCountries.Korea]: 'KR',
  [SupportedCountries.Taiwan]: 'TW',
  [SupportedCountries.Pakistan]: 'PK',
};

export function etfScreenerCountryCode(exchange: AllExchanges): string {
  return COUNTRY_TO_SCREENER_CODE[getCountryByExchange(exchange)];
}

/** Key of an ETF's row in the screener data: `SPY` for US funds, `tsx/ZLC` elsewhere. */
export function etfScreenerRowKey(symbol: string, exchange: AllExchanges): string {
  const upper: string = symbol.toUpperCase().trim();
  return etfScreenerCountryCode(exchange) === '' ? upper : `${getStockAnalyzeExchangeSegment(exchange)}/${upper}`;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function convert(value: unknown, kind: ValueKind): string | number | bigint | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  switch (kind) {
    case 'string': {
      if (Array.isArray(value)) {
        const parts: string[] = value.filter((v): v is string => typeof v === 'string' && v.trim() !== '').map((v) => v.trim());
        return parts.length > 0 ? parts.join(', ') : undefined;
      }
      if (typeof value === 'string') {
        const trimmed: string = value.trim();
        return trimmed && trimmed !== 'n/a' && trimmed !== '-' ? trimmed : undefined;
      }
      return undefined;
    }
    case 'percent': {
      const n: number | undefined = finiteNumber(value);
      return n === undefined ? undefined : `${n.toFixed(2)}%`;
    }
    case 'numberString': {
      const n: number | undefined = finiteNumber(value);
      return n === undefined ? undefined : String(n);
    }
    case 'float':
      return finiteNumber(value);
    case 'int': {
      const n: number | undefined = finiteNumber(value);
      return n === undefined ? undefined : Math.trunc(n);
    }
    case 'bigint': {
      const n: number | undefined = finiteNumber(value);
      return n === undefined || n < 0 ? undefined : BigInt(Math.round(n));
    }
    case 'date':
      return typeof value === 'string' && ISO_DATE_PATTERN.test(value.trim()) ? value.trim() : undefined;
  }
}

/**
 * Map one screener row (plus the fund name from `initial`) to stored fields.
 *
 * A field the source has no value for is left out — not set to null — so the
 * caller keeps whatever is stored for it.
 */
export function parseEtfScreenerRow(row: EtfScreenerRow, fundName?: string | null): EtfAnalyzerInfoFields {
  const fields: Record<string, string | number | bigint> = {};
  for (const mapping of ETF_ANALYZER_INFO_COLUMNS) {
    const converted = convert(row[mapping.sourceId], mapping.kind);
    if (converted !== undefined) {
      fields[mapping.field] = converted;
    }
  }
  const name = convert(fundName, 'string');
  if (typeof name === 'string') {
    fields.fundName = name;
  }
  return fields as EtfAnalyzerInfoFields;
}

/** Every stored field this parser can fill, for coverage reporting. */
export const ETF_ANALYZER_INFO_REFRESHABLE_FIELDS: readonly EtfAnalyzerInfoFieldKey[] = ['fundName', ...ETF_ANALYZER_INFO_COLUMNS.map((c) => c.field)];
