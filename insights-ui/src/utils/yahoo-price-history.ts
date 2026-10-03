import yahooFinance from 'yahoo-finance2';
import { PriceHistoryPoint } from '@/types/prismaTypes';

/**
 * Shared Yahoo Finance price-history helpers used by both stocks (TickerV1)
 * and ETFs (Etf). Pure Yahoo fetch — no DB coupling.
 */

/** Freshness threshold. Weekly refresh = once per week. */
export const REFRESH_AGE_DAYS = 7;

/** Day constant used when computing fetch windows. */
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Fetch windows sized exactly to what the UI needs:
 * - Daily covers up to the 6M range tab (with a little headroom).
 * - Weekly covers up to the 5Y range tab (with a little headroom).
 * Older data is intentionally not fetched to keep payload size small.
 */
export const DAILY_LOOKBACK_DAYS = 200; // ~6.5 months
export const WEEKLY_LOOKBACK_DAYS = 366 * 5 + 30; // ~5 years + 1 month

/**
 * Yahoo Finance blocks requests whose User-Agent identifies them as the
 * `yahoo-finance2` library (the library's default UA). Responses come back as
 * HTTP 429 with the plain-text body "Too Many Requests", which the library
 * then fails to parse as JSON. Overriding the UA with a real browser string
 * per call avoids the block.
 */
const YAHOO_BROWSER_FETCH_OPTIONS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  },
};

export type YahooInterval = '1d' | '1wk';

export interface YahooPriceHistoryResult {
  points: PriceHistoryPoint[];
  currency: string | null;
}

export function isDataStale(lastUpdatedAt: Date | null | undefined): boolean {
  if (!lastUpdatedAt) return true;
  const ageInDays = (Date.now() - lastUpdatedAt.getTime()) / ONE_DAY_MS;
  return ageInDays > REFRESH_AGE_DAYS;
}

/**
 * True when Yahoo has no chart data for the symbol ("No data found, symbol may
 * be delisted"). That is a property of the symbol, not a transient failure.
 */
function isYahooNoDataError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith('No data found');
}

const YAHOO_NO_DATA_RETRY_MS = 24 * 60 * 60 * 1000;

/**
 * Symbols Yahoo recently answered "No data found" for. Kept in memory (not by
 * stamping `lastUpdatedAt*`), so stored data is never marked fresh when it is
 * not, and it works when there is no stored row yet.
 */
const yahooNoDataAt: Map<string, number> = new Map();

/** True while a symbol that recently had no Yahoo data should not be re-requested. */
export function isYahooSymbolInNoDataBackoff(yahooSymbol: string): boolean {
  const failedAtMs: number | undefined = yahooNoDataAt.get(yahooSymbol);
  return failedAtMs !== undefined && Date.now() - failedAtMs < YAHOO_NO_DATA_RETRY_MS;
}

/**
 * Logs a failed price-history refresh. A Yahoo "No data found" is one line with
 * no stack, and the symbol backs off for a day. It stays an error: a whole
 * exchange's symbols can stop resolving (all numeric BSE codes did).
 */
export function logPriceHistoryRefreshError(label: string, yahooSymbol: string, error: unknown): void {
  if (isYahooNoDataError(error)) {
    yahooNoDataAt.set(yahooSymbol, Date.now());
    console.error(`Failed to refresh price history for ${label} (${yahooSymbol}): ${(error as Error).message}`);
    return;
  }
  console.error(`Failed to refresh price history for ${label}:`, error);
}

/**
 * Fetch OHLC history from Yahoo for the given symbol/interval and date window.
 * Works identically for equities and ETFs.
 */
export async function fetchPriceHistoryFromYahoo(yahooSymbol: string, interval: YahooInterval, period1: Date): Promise<YahooPriceHistoryResult> {
  const result = await yahooFinance.chart(
    yahooSymbol,
    {
      period1,
      period2: new Date(),
      interval,
    },
    { fetchOptions: YAHOO_BROWSER_FETCH_OPTIONS }
  );

  const currency = result.meta?.currency ?? null;
  const quotes = (result.quotes ?? []) as Array<{
    date?: unknown;
    open?: unknown;
    high?: unknown;
    low?: unknown;
    close?: unknown;
    volume?: unknown;
  }>;

  const points: PriceHistoryPoint[] = quotes
    .filter((q) => q.date)
    .map((q) => {
      const d = q.date instanceof Date ? q.date : new Date(q.date as unknown as string);
      return {
        date: d.toISOString().slice(0, 10),
        open: typeof q.open === 'number' && Number.isFinite(q.open) ? q.open : null,
        high: typeof q.high === 'number' && Number.isFinite(q.high) ? q.high : null,
        low: typeof q.low === 'number' && Number.isFinite(q.low) ? q.low : null,
        close: typeof q.close === 'number' && Number.isFinite(q.close) ? q.close : null,
        volume: typeof q.volume === 'number' && Number.isFinite(q.volume) ? q.volume : null,
      };
    });

  return { points, currency };
}
