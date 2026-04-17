import { prisma } from '@/prisma';
import { Etf, EtfPriceHistory } from '@prisma/client';
import { PriceHistoryPoint } from '@/types/prismaTypes';
import { revalidateEtfAndExchangeTag } from '@/utils/etf-cache-utils';
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
 * Ensure price history is available and fresh for an ETF.
 * Mirrors `ensurePriceHistoryIsFresh` for stocks — Yahoo Finance serves ETF
 * OHLC history via the same `chart` endpoint used for equities.
 *
 * - Daily series: last ~6.5 months (covers the 1M and 6M range tabs).
 * - Weekly series: last ~5 years (covers the 1Y, 3Y and 5Y range tabs).
 */
export async function ensureEtfPriceHistoryIsFresh(etf: Etf): Promise<EtfPriceHistory | null> {
  const existing = await prisma.etfPriceHistory.findUnique({
    where: { etfId: etf.id },
  });

  const needsDaily = !existing || isDataStale(existing.lastUpdatedAtDaily);
  const needsWeekly = !existing || isDataStale(existing.lastUpdatedAtWeekly);

  if (existing && !needsDaily && !needsWeekly) {
    return existing;
  }

  const yahooSymbol = convertToYahooFinanceSymbol(etf.symbol, etf.exchange);
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

    const saved = await prisma.etfPriceHistory.upsert({
      where: { etfId: etf.id },
      update: {
        dailyData: dailyData as unknown as object,
        lastUpdatedAtDaily: needsDaily ? now : existing!.lastUpdatedAtDaily,
        weeklyData: weeklyData as unknown as object,
        lastUpdatedAtWeekly: needsWeekly ? now : existing!.lastUpdatedAtWeekly,
        currency,
      },
      create: {
        etf: { connect: { id: etf.id } },
        dailyData: dailyData as unknown as object,
        lastUpdatedAtDaily: now,
        weeklyData: weeklyData as unknown as object,
        lastUpdatedAtWeekly: now,
        currency,
      },
    });

    revalidateEtfAndExchangeTag(etf.symbol, etf.exchange);
    return saved;
  } catch (error) {
    console.error(`Failed to refresh price history for ETF ${etf.symbol} (${etf.exchange}):`, error);
    // Fall back to prior snapshot if available so the UI still renders.
    return existing;
  }
}
