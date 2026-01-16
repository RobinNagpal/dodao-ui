import { ScreenerResponse } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/types/daily-mover-constants';

const SCREENER_API_URL = process.env.SCREENER_API_URL;

interface ScreenerFilters {
  marketCapMin?: string;
  priceChange1DMin?: string;
  limit?: number;
}

interface AsyncScreenerFilters extends ScreenerFilters {
  callbackUrl: string;
  moverType: DailyMoverType;
  spaceId: string;
}

interface AsyncScreenerResponse {
  message: string;
  filters: ScreenerFilters;
  moverType: DailyMoverType;
  spaceId: string;
}

/**
 * Calls the screener API with the provided filters (synchronous mode)
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
 * Calls the screener API in async mode - returns immediately and processes in background
 * The Lambda will call back to the provided callbackUrl with results
 */
export async function callScreenerAPIAsync(filters: AsyncScreenerFilters): Promise<AsyncScreenerResponse> {
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
 * Fetches top gainers from the screener API (synchronous mode)
 */
export async function fetchTopGainers(limit: number = 15): Promise<ScreenerResponse> {
  return callScreenerAPI({
    marketCapMin: 'Over 1B',
    priceChange1DMin: 'Over 1%',
    limit,
  });
}

/**
 * Fetches top losers from the screener API (synchronous mode)
 */
export async function fetchTopLosers(limit: number = 15): Promise<ScreenerResponse> {
  return callScreenerAPI({
    marketCapMin: 'Over 1B',
    priceChange1DMin: 'Under -1%',
    limit,
  });
}

/**
 * Triggers async top gainers fetch - Lambda will call back to the provided URL with results
 */
export async function triggerTopGainersAsync(spaceId: string, callbackUrl: string, limit: number = 15): Promise<AsyncScreenerResponse> {
  return callScreenerAPIAsync({
    marketCapMin: 'Over 1B',
    priceChange1DMin: 'Over 1%',
    limit,
    callbackUrl,
    moverType: DailyMoverType.GAINER,
    spaceId,
  });
}

/**
 * Triggers async top losers fetch - Lambda will call back to the provided URL with results
 */
export async function triggerTopLosersAsync(spaceId: string, callbackUrl: string, limit: number = 15): Promise<AsyncScreenerResponse> {
  return callScreenerAPIAsync({
    marketCapMin: 'Over 1B',
    priceChange1DMin: 'Under -1%',
    limit,
    callbackUrl,
    moverType: DailyMoverType.LOSER,
    spaceId,
  });
}
