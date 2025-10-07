import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import yahooFinance from 'yahoo-finance2';

type Num = number | null;

// Coerce unknown to a finite number, else null.
const num = (v: unknown): Num => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const x = Number(v);
    return Number.isFinite(x) ? x : null;
  }
  return null;
};

// Read a number or an object with { raw: number }.
const rawNum = (v: unknown): Num => {
  if (v == null) return null;
  const direct = num(v);
  if (direct != null) return direct;
  const maybe = (v as { raw?: unknown })?.raw;
  return num(maybe);
};

// Return the first non-null numeric from candidates (supports {raw}).
const pickNum = (...vals: unknown[]): Num => {
  for (const v of vals) {
    const x = rawNum(v);
    if (x != null) return x;
  }
  return null;
};

export interface FinancialInfoResponse {
  symbol: string;
  currency: string;
  price: Num;
  dayHigh: Num;
  dayLow: Num;
  yearHigh: Num;
  yearLow: Num;
  marketCap: Num;
  epsDilutedTTM: Num;
  pe: Num;
  avgVolume3M: Num;
  dayVolume: Num;
  annualDividend: Num;
  dividendYield: Num;
  totalRevenue: Num;
  netIncome: Num;
  netProfitMargin: Num;
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<FinancialInfoResponse> {
  const { ticker } = await params;
  const t = ticker?.toUpperCase()?.trim();

  if (!t) {
    throw new Error('Ticker symbol is required');
  }

  // 1) Fast quote
  const q = await yahooFinance.quote(t);

  // 2) Summary for fallbacks
  const qs = await yahooFinance.quoteSummary(t, {
    modules: ['incomeStatementHistoryQuarterly', 'summaryDetail'],
  });

  // ----- TTM from quarterly -----
  const quarterly = qs?.incomeStatementHistoryQuarterly?.incomeStatementHistory ?? [];

  const last4 = Array.isArray(quarterly) ? quarterly.slice(0, 4) : [];

  const totalRevenueTTM =
    last4
      .map((r) => num((r as Record<string, unknown>)?.totalRevenue))
      .filter((x): x is number => x != null)
      .reduce((a, b) => a + b, 0) || null;

  const netIncomeTTM =
    last4
      .map((r) => {
        const row = r as Record<string, unknown>;
        return num(row?.netIncome ?? row?.netIncomeApplicableToCommonShares);
      })
      .filter((x): x is number => x != null)
      .reduce((a, b) => a + b, 0) || null;

  const netProfitMargin = totalRevenueTTM && totalRevenueTTM !== 0 && netIncomeTTM != null ? netIncomeTTM / totalRevenueTTM : null;

  // ----- DIVIDENDS -----
  const sd = qs?.summaryDetail;

  const annualDividend = pickNum((q as Record<string, unknown>)?.dividendRate, sd?.dividendRate, (q as Record<string, unknown>)?.trailingAnnualDividendRate);

  const dividendYield = pickNum((q as Record<string, unknown>)?.dividendYield, sd?.dividendYield, (q as Record<string, unknown>)?.trailingAnnualDividendYield);

  return {
    symbol: ((q as Record<string, unknown>)?.symbol as string) ?? t,
    currency: ((q as Record<string, unknown>)?.currency as string) ?? ((q as Record<string, unknown>)?.financialCurrency as string),

    price: num((q as Record<string, unknown>)?.regularMarketPrice),
    dayHigh: num((q as Record<string, unknown>)?.regularMarketDayHigh),
    dayLow: num((q as Record<string, unknown>)?.regularMarketDayLow),
    yearHigh: num((q as Record<string, unknown>)?.fiftyTwoWeekHigh),
    yearLow: num((q as Record<string, unknown>)?.fiftyTwoWeekLow),

    marketCap: num((q as Record<string, unknown>)?.marketCap),
    epsDilutedTTM: num((q as Record<string, unknown>)?.epsTrailingTwelveMonths),
    pe: num((q as Record<string, unknown>)?.trailingPE),
    avgVolume3M: num((q as Record<string, unknown>)?.averageDailyVolume3Month),
    dayVolume: num((q as Record<string, unknown>)?.regularMarketVolume),

    annualDividend,
    dividendYield,

    totalRevenue: totalRevenueTTM,
    netIncome: netIncomeTTM,
    netProfitMargin,
  };
}

export const GET = withErrorHandlingV2<FinancialInfoResponse>(getHandler);
