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

  // Some exchanges use numeric tickers that Yahoo expects zero-padded.
  const normalizedSymbol = normalizeNumericSymbolForYahoo(upperSymbol, upperExchange);

  const suffix = EXCHANGE_TO_YAHOO_SUFFIX[upperExchange];
  if (suffix) return normalizedSymbol + suffix;

  // US exchanges (and anything unmapped) — return as-is.
  return normalizedSymbol;
}

function normalizeNumericSymbolForYahoo(symbol: string, exchange: string): string {
  // Only apply to fully-numeric symbols; leave alphanumeric tickers unchanged.
  if (!/^\d+$/.test(symbol)) return symbol;

  switch (exchange) {
    // Hong Kong: 4 digits (e.g., 0700.HK)
    case 'HKEX':
      return symbol.padStart(4, '0');
    // Japan: commonly 4 digits (e.g., 7203.T)
    case 'TSE':
      return symbol.padStart(4, '0');
    // Taiwan: 4 digits (e.g., 2330.TW)
    case 'TWSE':
      return symbol.padStart(4, '0');
    // Korea: 6 digits (e.g., 005930.KS)
    case 'KOSPI':
    case 'KOSDAQ':
    case 'KONEX':
      return symbol.padStart(6, '0');
    default:
      return symbol;
  }
}

const EXCHANGE_TO_YAHOO_SUFFIX: Record<string, string> = {
  // India
  NSE: '.NS',
  BSE: '.BO',
  // UK
  LSE: '.L',
  AIM: '.L',
  // Pakistan (Karachi / PSX)
  PSX: '.KA',
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
