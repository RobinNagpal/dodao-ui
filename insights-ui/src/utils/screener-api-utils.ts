import { ScreenerResponse } from '@/types/daily-stock-movers';

const SCREENER_API_URL = process.env.SCREENER_API_URL;

interface ScreenerFilters {
  marketCapMin?: string;
  priceChange1DMin?: string;
  limit?: number;
}

/**
 * Calls the screener API with the provided filters
 */
export async function callScreenerAPI(filters: ScreenerFilters): Promise<ScreenerResponse> {
  if (!SCREENER_API_URL) {
    throw new Error('SCREENER_API_URL environment variable is not set');
  }

  const screenerResponse = await fetch(SCREENER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
  });

  if (!screenerResponse.ok) {
    throw new Error(`Screener API failed with status: ${screenerResponse.status}`);
  }

  return screenerResponse.json();
}

/**
 * Fetches top gainers from the screener API
 */
export async function fetchTopGainers(limit: number = 15): Promise<ScreenerResponse> {
  return callScreenerAPI({
    marketCapMin: 'Over 1B',
    priceChange1DMin: 'Over 1%',
    limit,
  });
}

/**
 * Fetches top losers from the screener API
 */
export async function fetchTopLosers(limit: number = 15): Promise<ScreenerResponse> {
  return callScreenerAPI({
    marketCapMin: 'Over 1B',
    priceChange1DMin: 'Under -1%',
    limit,
  });
}
