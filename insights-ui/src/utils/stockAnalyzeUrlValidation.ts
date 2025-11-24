import { AllExchanges, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, PakistanExchanges, JapanExchanges, TaiwanExchanges, HongKongExchanges, KoreaExchanges } from './countryExchangeUtils';

/** ---------- URL Pattern Mappings ---------- */

/**
 * Maps exchanges to their URL path segments
 */
const EXCHANGE_TO_URL_SEGMENT: Record<AllExchanges, string> = {
  // US Exchanges
  [USExchanges.NASDAQ]: 'stocks',
  [USExchanges.NYSE]: 'stocks',
  [USExchanges.NYSEAMERICAN]: 'stocks',
  [USExchanges.OTCMKTS]: 'otc',

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

  // Japan Exchanges
  [JapanExchanges.TSE]: 'tyo',

  // Taiwan Exchanges 
  [TaiwanExchanges.TWSE]: 'tpe',

  // Hong Kong Exchanges
  [HongKongExchanges.HKEX]: 'hkg',

  // Korea Exchanges
  [KoreaExchanges.KRX]: 'krx',
} as const;

/**
 * Base URL for stock analysis website
 */
const STOCK_ANALYZE_BASE_URL = process.env.NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL || '';

/** ---------- Validation Functions ---------- */

/**
 * Generates the expected stockAnalyzeUrl for a given symbol and exchange
 * accepts both uppercase and lowercase symbols
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
 * Generates all acceptable variations of the stockAnalyzeUrl for a given symbol and exchange
 * accepts both uppercase and lowercase symbols
 */
export const generateExpectedStockAnalyzeUrlVariations = (symbol: string, exchange: AllExchanges): string[] => {
  const segment = EXCHANGE_TO_URL_SEGMENT[exchange];
  const upperSymbol = symbol.toUpperCase().trim();
  const lowerSymbol = symbol.toLowerCase().trim();

  const variations: string[] = [];

  if (segment === 'stocks') {
    // US format: /stocks/{symbol}/
    variations.push(`${STOCK_ANALYZE_BASE_URL}/stocks/${upperSymbol}/`);
    variations.push(`${STOCK_ANALYZE_BASE_URL}/stocks/${lowerSymbol}/`);
    // Also include versions without trailing slash
    variations.push(`${STOCK_ANALYZE_BASE_URL}/stocks/${upperSymbol}`);
    variations.push(`${STOCK_ANALYZE_BASE_URL}/stocks/${lowerSymbol}`);
  } else {
    // Other format: /quote/{segment}/{symbol}/
    variations.push(`${STOCK_ANALYZE_BASE_URL}/quote/${segment}/${upperSymbol}/`);
    variations.push(`${STOCK_ANALYZE_BASE_URL}/quote/${segment}/${lowerSymbol}/`);
    // Also include versions without trailing slash
    variations.push(`${STOCK_ANALYZE_BASE_URL}/quote/${segment}/${upperSymbol}`);
    variations.push(`${STOCK_ANALYZE_BASE_URL}/quote/${segment}/${lowerSymbol}`);
  }

  return variations;
};

/**
 * Validates if the provided stockAnalyzeUrl matches the expected format for the given symbol and exchange
 * @param symbol - The stock symbol (will be normalized to uppercase)
 * @param exchange - The exchange
 * @param stockAnalyzeUrl - The URL to validate (optional - if empty, validation passes)
 * @returns null if valid, error message string if invalid
 */
export const validateStockAnalyzeUrl = (symbol: string, exchange: AllExchanges, stockAnalyzeUrl: string | null | undefined): string | null => {
  // If no URL provided, it's valid (optional field)
  if (!stockAnalyzeUrl || stockAnalyzeUrl.trim().length === 0) {
    return null;
  }

  const trimmedUrl = stockAnalyzeUrl.trim();
  const expectedVariations = generateExpectedStockAnalyzeUrlVariations(symbol, exchange);

  // Check if the URL matches any of the acceptable variations
  if (expectedVariations.includes(trimmedUrl)) {
    return null;
  }

  // If no match, show the primary expected format (uppercase)
  const primaryExpectedUrl = generateExpectedStockAnalyzeUrl(symbol, exchange);
  return `Invalid stockAnalyzeUrl format. Expected: ${primaryExpectedUrl}`;
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
