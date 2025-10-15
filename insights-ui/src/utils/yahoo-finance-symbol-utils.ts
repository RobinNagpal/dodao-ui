/**
 * Converts a stock symbol to Yahoo Finance format based on the exchange.
 *
 * Examples:
 * - TSX: DIR.UN -> DIR-UN.TO
 * - TSXV: NET.UN -> NET-UN.V
 * - US exchanges: AAPL -> AAPL (no change)
 *
 * @param symbol - The original stock symbol (e.g., "DIR.UN")
 * @param exchange - The exchange code (e.g., "TSX", "TSXV", "NYSE")
 * @returns The Yahoo Finance compatible symbol
 */
export function convertToYahooFinanceSymbol(symbol: string, exchange: string): string {
  const upperExchange = exchange.toUpperCase();
  const upperSymbol = symbol.toUpperCase();

  // Handle Toronto Stock Exchange (TSX)
  if (upperExchange === 'TSX') {
    // Replace dots with hyphens and add .TO suffix
    return upperSymbol.replace(/\./g, '-') + '.TO';
  }

  // Handle TSX Venture Exchange (TSXV)
  if (upperExchange === 'TSXV') {
    // Replace dots with hyphens and add .V suffix
    return upperSymbol.replace(/\./g, '-') + '.V';
  }

  // For other exchanges (US markets, etc.), return as-is
  return upperSymbol;
}
