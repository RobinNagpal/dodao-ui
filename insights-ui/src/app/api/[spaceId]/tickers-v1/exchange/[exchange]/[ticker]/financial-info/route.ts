import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import { StockFundamentalsSummary } from '@/types/prismaTypes';
import { ensureStockAnalyzerDataIsFresh } from '@/utils/stock-analyzer-scraper-utils';

type Num = number | null;

export interface FinancialInfoOptionalWrapper {
  financialInfo: FinancialInfoResponse | null;
}

// Coerce unknown to a finite number, else null.
const num = (v: unknown): Num => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    // Remove commas and other formatting
    const cleaned = v.replace(/,/g, '').trim();
    const x = Number(cleaned);
    return Number.isFinite(x) ? x : null;
  }
  return null;
};

// Parse percentage string (e.g., "5.25%" -> 5.25)
const parsePercentage = (v: string | undefined | null): Num => {
  if (!v) return null;
  const cleaned = v.replace(/%/g, '').trim();
  return num(cleaned);
};

export interface FinancialInfoResponse {
  symbol: string;
  currency: string | null;
  price: Num;
  dayHigh: Num;
  dayLow: Num;
  yearHigh: Num;
  yearLow: Num;
  marketCap: string | null; // Keep as formatted string (e.g., "633.80B")
  epsDilutedTTM: Num;
  pe: Num;
  avgVolume3M: Num;
  dayVolume: Num;
  annualDividend: Num;
  dividendYield: Num;
  totalRevenue: string | null; // Keep as formatted string (e.g., "461.60B")
  netIncome: string | null; // Keep as formatted string (e.g., "81.02B")
  forwardPE: Num;
}

/**
 * Convert StockFundamentalsSummary to FinancialInfoResponse
 */
function convertSummaryToFinancialInfo(summary: StockFundamentalsSummary, symbol: string): FinancialInfoResponse {
  // Use previousClose for price, fallback to open
  const price = num(summary.previousClose) ?? num(summary.open);

  // Day range
  const dayHigh = num(summary.daysRange?.high);
  const dayLow = num(summary.daysRange?.low);

  // 52 week range
  const yearHigh = num(summary.week52Range?.high);
  const yearLow = num(summary.week52Range?.low);

  // Market cap (keep as formatted string, e.g., "633.80B")
  const marketCap = summary.marketCap || null;

  // EPS TTM (number)
  const epsDilutedTTM = num(summary.epsTtm);

  // P/E Ratio (number)
  const pe = num(summary.peRatio);

  // Forward P/E (number) - replacing netProfitMargin
  const forwardPE = num(summary.forwardPE);

  // Volume (number) - keep as raw numbers, will format with commas in UI
  const avgVolume3M = num(summary.averageVolume);
  const dayVolume = num(summary.volume);

  // Dividends
  const annualDividend = num(summary.dividend?.amount);
  const dividendYield = parsePercentage(summary.dividend?.yieldPct);

  // Revenue and Income TTM (keep as formatted strings, e.g., "461.60B", "81.02B")
  const totalRevenue = summary.revenueTtm || null;
  const netIncome = summary.netIncomeTtm || null;

  return {
    symbol,
    currency: null, // Currency not available in summary
    price,
    dayHigh,
    dayLow,
    yearHigh,
    yearLow,
    marketCap,
    epsDilutedTTM,
    pe,
    avgVolume3M,
    dayVolume,
    annualDividend,
    dividendYield,
    totalRevenue,
    netIncome,
    forwardPE,
  };
}

async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; ticker: string }> }
): Promise<FinancialInfoOptionalWrapper> {
  const { spaceId, exchange, ticker } = await params;
  const e = exchange?.toUpperCase()?.trim();
  const t = ticker?.toUpperCase()?.trim();

  if (!t || !e) {
    return { financialInfo: null };
  }

  try {
    // Find the ticker in database
    const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
      where: {
        spaceId,
        symbol: t,
        exchange: e,
      },
      include: {
        stockAnalyzerScrapperInfo: true,
      },
    });

    // Ensure stock analyzer data is fresh (will fetch summary if older than 7 days)
    const scraperInfo = await ensureStockAnalyzerDataIsFresh(tickerRecord);

    // Get summary from scraper info
    const summary = scraperInfo.summary as StockFundamentalsSummary;

    // Check if summary is empty or invalid
    if (!summary || Object.keys(summary).length === 0) {
      console.error(`No summary data available for ticker ${t}`);
      return { financialInfo: null };
    }

    // Convert summary to FinancialInfoResponse
    const financialInfo = convertSummaryToFinancialInfo(summary, tickerRecord.symbol);

    return { financialInfo };
  } catch (error) {
    console.error(`Error fetching financial info for ${t}:`, error);
    return { financialInfo: null };
  }
}

export const GET = withErrorHandlingV2<FinancialInfoOptionalWrapper>(getHandler);
