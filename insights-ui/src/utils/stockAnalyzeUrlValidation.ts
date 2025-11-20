import { AllExchanges, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, PakistanExchanges } from './countryExchangeUtils';

/** ---------- URL Pattern Mappings ---------- */

/**
 * Maps exchanges to their URL path segments on stockanalysis.com
 */
const EXCHANGE_TO_URL_SEGMENT: Record<AllExchanges, string> = {
  // US Exchanges
  [USExchanges.NASDAQ]: 'stocks',
  [USExchanges.NYSE]: 'stocks',
  [USExchanges.NYSEAMERICAN]: 'stocks',
  [USExchanges.OTCMKTS]: 'stocks',

  // Canada Exchanges
  [CanadaExchanges.TSX]: 'tsx',
  [CanadaExchanges.TSXV]: 'tsxv',

  // Pakistan Exchange
  [PakistanExchanges.PSX]: 'psx',

  // UK Exchanges
  [UKExchanges.LSE]: 'lon', // LSE maps to 'lon'
  [UKExchanges.AIM]: 'aim',

  // India Exchanges
  [IndiaExchanges.BSE]: 'bom', // BSE maps to 'bom'
  [IndiaExchanges.NSE]: 'nse',
} as const;

/**
 * Base URL for stock analysis website
 */
const STOCK_ANALYZE_BASE_URL = process.env.NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL || '';

/** ---------- Validation Functions ---------- */

/**
 * Generates the expected stockAnalyzeUrl for a given symbol and exchange
 */
export const generateExpectedStockAnalyzeUrl = (symbol: string, exchange: AllExchanges): string => {
  const segment = EXCHANGE_TO_URL_SEGMENT[exchange];
  const normalizedSymbol = symbol.toUpperCase().trim();

  if (segment === 'stocks') {
    // US format: /stocks/{symbol}/
    return `${STOCK_ANALYZE_BASE_URL}/stocks/${normalizedSymbol}/`;
  } else {
    // Other format: /quote/{segment}/{symbol}/
    return `${STOCK_ANALYZE_BASE_URL}/quote/${segment}/${normalizedSymbol}/`;
  }
};

/**
 * Validates if the provided stockAnalyzeUrl matches the expected format for the given symbol and exchange
 * @param symbol - The stock symbol (will be normalized to uppercase)
 * @param exchange - The exchange
 * @param stockAnalyzeUrl - The URL to validate (optional - if empty, validation passes)
 * @returns null if valid, error message string if invalid
 */
export const validateStockAnalyzeUrl = (
  symbol: string,
  exchange: AllExchanges,
  stockAnalyzeUrl: string | null | undefined
): string | null => {
  // If no URL provided, it's valid (optional field)
  if (!stockAnalyzeUrl || stockAnalyzeUrl.trim().length === 0) {
    return null;
  }

  const trimmedUrl = stockAnalyzeUrl.trim();
  const expectedUrl = generateExpectedStockAnalyzeUrl(symbol, exchange);

  // Check if the URL matches exactly (case sensitive for URLs)
  if (trimmedUrl === expectedUrl) {
    return null;
  }

  // Also allow trailing slash variations
  const withTrailingSlash = expectedUrl.endsWith('/') ? expectedUrl : expectedUrl + '/';
  const withoutTrailingSlash = expectedUrl.endsWith('/') ? expectedUrl.slice(0, -1) : expectedUrl;

  if (trimmedUrl === withTrailingSlash || trimmedUrl === withoutTrailingSlash) {
    return null;
  }

  return `Invalid stockAnalyzeUrl format. Expected: ${expectedUrl}`;
};

/**
 * Batch validation for multiple ticker entries
 * @param entries - Array of ticker entries to validate
 * @returns Map of validation errors keyed by symbol-exchange combination (using same format as buildKey)
 */
export const validateStockAnalyzeUrlsBatch = (
  entries: Array<{ symbol: string; exchange: AllExchanges; stockAnalyzeUrl?: string | null }>
): Map<string, string> => {
  const errors = new Map<string, string>();

  for (const entry of entries) {
    const key = `${entry.symbol.toUpperCase()}|${entry.exchange.toUpperCase()}`;
    const error = validateStockAnalyzeUrl(entry.symbol, entry.exchange, entry.stockAnalyzeUrl);

    if (error) {
      errors.set(key, error);
    }
  }

  return errors;
};
