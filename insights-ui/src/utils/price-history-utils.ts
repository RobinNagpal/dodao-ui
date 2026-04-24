import { prisma } from '@/prisma';
import { TickerV1, TickerV1PriceHistory } from '@prisma/client';
import { PriceHistoryPoint } from '@/types/prismaTypes';
import { revalidateTickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { convertToYahooFinanceSymbol } from '@/utils/yahoo-finance-symbol-utils';
import {
  DAILY_LOOKBACK_DAYS,
  ONE_DAY_MS,
  WEEKLY_LOOKBACK_DAYS,
  YahooPriceHistoryResult,
  fetchPriceHistoryFromYahoo,
  isDataStale,
} from '@/utils/yahoo-price-history';

/**
 * Ensure price history is available and fresh for a ticker.
 * - Daily series: last ~6.5 months (covers the 1M and 6M range tabs).
 * - Weekly series: last ~5 years (covers the 1Y, 3Y and 5Y range tabs).
 *
 * Refreshed when the record is missing or older than the freshness threshold.
 */
export async function ensurePriceHistoryIsFresh(ticker: TickerV1): Promise<TickerV1PriceHistory | null> {
  const existing = await prisma.tickerV1PriceHistory.findUnique({
    where: { tickerId: ticker.id },
  });

  const needsDaily = !existing || isDataStale(existing.lastUpdatedAtDaily);
  const needsWeekly = !existing || isDataStale(existing.lastUpdatedAtWeekly);

  if (existing && !needsDaily && !needsWeekly) {
    return existing;
  }

  const yahooSymbol = convertToYahooFinanceSymbol(ticker.symbol, ticker.exchange);
  const now = new Date();

  try {
    const [dailyResult, weeklyResult] = await Promise.all([
      needsDaily
        ? fetchPriceHistoryFromYahoo(yahooSymbol, '1d', new Date(Date.now() - DAILY_LOOKBACK_DAYS * ONE_DAY_MS))
        : Promise.resolve<YahooPriceHistoryResult | null>(null),
      needsWeekly
        ? fetchPriceHistoryFromYahoo(yahooSymbol, '1wk', new Date(Date.now() - WEEKLY_LOOKBACK_DAYS * ONE_DAY_MS))
        : Promise.resolve<YahooPriceHistoryResult | null>(null),
    ]);

    const dailyData = dailyResult?.points ?? (existing?.dailyData as unknown as PriceHistoryPoint[] | undefined) ?? [];
    const weeklyData = weeklyResult?.points ?? (existing?.weeklyData as unknown as PriceHistoryPoint[] | undefined) ?? [];
    const currency = dailyResult?.currency ?? weeklyResult?.currency ?? existing?.currency ?? null;

    const saved = await prisma.tickerV1PriceHistory.upsert({
      where: { tickerId: ticker.id },
      update: {
        dailyData: dailyData as unknown as object,
        lastUpdatedAtDaily: needsDaily ? now : existing!.lastUpdatedAtDaily,
        weeklyData: weeklyData as unknown as object,
        lastUpdatedAtWeekly: needsWeekly ? now : existing!.lastUpdatedAtWeekly,
        currency,
      },
      create: {
        ticker: { connect: { id: ticker.id } },
        dailyData: dailyData as unknown as object,
        lastUpdatedAtDaily: now,
        weeklyData: weeklyData as unknown as object,
        lastUpdatedAtWeekly: now,
        currency,
      },
    });

    revalidateTickerAndExchangeTag(ticker.symbol, ticker.exchange);
    return saved;
  } catch (error) {
    console.error(`Failed to refresh price history for ${ticker.symbol} (${ticker.exchange}):`, error);
    // If refresh fails but we have a prior snapshot, fall back to that so the UI still renders.
    return existing;
  }
}
