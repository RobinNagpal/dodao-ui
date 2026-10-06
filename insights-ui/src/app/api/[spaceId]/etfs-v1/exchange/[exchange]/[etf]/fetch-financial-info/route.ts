import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { revalidateEtfAndExchangeTag } from '@/utils/etf-cache-utils';
import { isEtfSummaryUsable, ScrapeEtfSummaryResult, scrapeEtfSummary } from '@/utils/stock-analyzer';
import { EtfSummaryStats } from '@/utils/stock-analyzer/stock-analysis-section-parsers';
import { NextRequest } from 'next/server';

type Num = number | null;

export interface FetchEtfFinancialInfoResponse {
  success: boolean;
  etfUrl: string;
  errors: unknown[];
}

const STOCK_ANALYZE_BASE_URL = process.env.NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL || '';

function normalizeUpperTrim(v: string | null | undefined): string {
  return (v ?? '').toUpperCase().trim();
}

function parsePercentToFloat(v: string | undefined): Num {
  if (!v) return null;
  const cleaned = v.replace(/%/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

async function postHandler(
  _req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<FetchEtfFinancialInfoResponse> {
  const { spaceId, exchange, etf } = await params;
  const symbol = normalizeUpperTrim(etf);
  const ex = normalizeUpperTrim(exchange);

  const etfRecord = await prisma.etf.findFirstOrThrow({
    where: { spaceId, symbol, exchange: ex },
    select: { id: true, symbol: true },
  });

  const etfUrl = `${STOCK_ANALYZE_BASE_URL}/etf/${etfRecord.symbol.toLowerCase()}/`;

  const scraped: ScrapeEtfSummaryResult = await scrapeEtfSummary(etfUrl);
  const data: EtfSummaryStats = scraped.data;
  const errors: unknown[] = scraped.errors;

  // A page that loads but parses to nothing means the source layout changed.
  // Writing it would blank every column (each field below falls back to null),
  // so leave the stored row alone and report the failure instead — the same
  // rule the stock scraper applies in `stock-analyzer-scraper-utils.ts`.
  if (!isEtfSummaryUsable(data)) {
    console.error(`Scraped no usable ETF summary for ${etfRecord.symbol} from ${scraped.url}; keeping previously stored financial info`);
    return { success: false, etfUrl: scraped.url, errors };
  }

  await prisma.etfFinancialInfo.upsert({
    where: { etfId: etfRecord.id },
    update: {
      aum: data.assets ?? null,
      expenseRatio: parsePercentToFloat(data.expenseRatio),
      pe: typeof data.peRatio === 'number' && Number.isFinite(data.peRatio) ? data.peRatio : null,
      sharesOut: data.sharesOut ?? null,
      dividendTtm: typeof data.dividendTtm === 'number' && Number.isFinite(data.dividendTtm) ? data.dividendTtm : null,
      dividendYield: parsePercentToFloat(data.dividendYield),
      payoutFrequency: data.payoutFrequency ?? null,
      payoutRatio: parsePercentToFloat(data.payoutRatio),
      volume: typeof data.volume === 'number' && Number.isFinite(data.volume) ? data.volume : null,
      yearHigh: typeof data.week52High === 'number' && Number.isFinite(data.week52High) ? data.week52High : null,
      yearLow: typeof data.week52Low === 'number' && Number.isFinite(data.week52Low) ? data.week52Low : null,
      beta: typeof data.beta === 'number' && Number.isFinite(data.beta) ? data.beta : null,
      holdings: typeof data.holdings === 'number' && Number.isFinite(data.holdings) ? Math.trunc(data.holdings) : null,
    },
    create: {
      etf: { connect: { id: etfRecord.id } },
      aum: data.assets ?? null,
      expenseRatio: parsePercentToFloat(data.expenseRatio),
      pe: typeof data.peRatio === 'number' && Number.isFinite(data.peRatio) ? data.peRatio : null,
      sharesOut: data.sharesOut ?? null,
      dividendTtm: typeof data.dividendTtm === 'number' && Number.isFinite(data.dividendTtm) ? data.dividendTtm : null,
      dividendYield: parsePercentToFloat(data.dividendYield),
      payoutFrequency: data.payoutFrequency ?? null,
      payoutRatio: parsePercentToFloat(data.payoutRatio),
      volume: typeof data.volume === 'number' && Number.isFinite(data.volume) ? data.volume : null,
      yearHigh: typeof data.week52High === 'number' && Number.isFinite(data.week52High) ? data.week52High : null,
      yearLow: typeof data.week52Low === 'number' && Number.isFinite(data.week52Low) ? data.week52Low : null,
      beta: typeof data.beta === 'number' && Number.isFinite(data.beta) ? data.beta : null,
      holdings: typeof data.holdings === 'number' && Number.isFinite(data.holdings) ? Math.trunc(data.holdings) : null,
    },
  });

  // Ensure ETF details page (force-static) reflects latest financial info immediately.
  revalidateEtfAndExchangeTag(etfRecord.symbol, ex);

  return { success: true, etfUrl: scraped.url, errors };
}

export const POST = withAdminOrToken<FetchEtfFinancialInfoResponse>(postHandler);
