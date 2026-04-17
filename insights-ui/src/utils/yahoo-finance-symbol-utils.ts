/**
 * Converts a stock symbol to Yahoo Finance format based on the exchange.
 *
 * Examples:
 * - TSX: DIR.UN -> DIR-UN.TO
 * - TSXV: NET.UN -> NET-UN.V
 * - NSE: TCS -> TCS.NS
 * - LSE: BARC -> BARC.L
 * - US exchanges: AAPL -> AAPL (no change)
 *
 * See: https://help.yahoo.com/kb/exchanges-data-providers-yahoo-finance-sln2310.html
 *
 * @param symbol - The original stock symbol (e.g., "DIR.UN")
 * @param exchange - The exchange code (e.g., "TSX", "TSXV", "NYSE")
 * @returns The Yahoo Finance compatible symbol
 */
export function convertToYahooFinanceSymbol(symbol: string, exchange: string): string {
  const upperExchange = exchange.toUpperCase();
  const upperSymbol = symbol.toUpperCase();

  // Canadian exchanges use hyphens instead of dots in symbol units (e.g., DIR.UN -> DIR-UN).
  if (upperExchange === 'TSX') return upperSymbol.replace(/\./g, '-') + '.TO';
  if (upperExchange === 'TSXV') return upperSymbol.replace(/\./g, '-') + '.V';

  const suffix = EXCHANGE_TO_YAHOO_SUFFIX[upperExchange];
  if (suffix) return upperSymbol + suffix;

  // US exchanges (and anything unmapped) — return as-is.
  return upperSymbol;
}

const EXCHANGE_TO_YAHOO_SUFFIX: Record<string, string> = {
  // India
  NSE: '.NS',
  BSE: '.BO',
  // UK
  LSE: '.L',
  AIM: '.L',
  // Japan
  TSE: '.T',
  // Hong Kong
  HKEX: '.HK',
  // Australia
  ASX: '.AX',
  // Korea
  KOSPI: '.KS',
  KOSDAQ: '.KQ',
  KONEX: '.KN',
  // Taiwan
  TWSE: '.TW',
};
