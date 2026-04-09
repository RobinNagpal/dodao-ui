import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { revalidateEtfAndExchangeTag } from '@/utils/etf-cache-utils';
import { NextRequest } from 'next/server';

type Num = number | null;

interface LambdaEtfStats {
  assets?: string;
  expenseRatio?: string;
  peRatio?: number;
  sharesOut?: string;
  dividendTtm?: number;
  dividendYield?: string;
  payoutFrequency?: string;
  payoutRatio?: string;
  volume?: number;
  week52Low?: number;
  week52High?: number;
  beta?: number;
  holdings?: number;
}

interface LambdaResponse {
  etfUrl: string;
  section: 'etf-summary';
  data: LambdaEtfStats;
  errors?: unknown[];
}

export interface FetchEtfFinancialInfoResponse {
  success: boolean;
  etfUrl: string;
  errors: unknown[];
}

const LAMBDA_BASE_URL = process.env.ETF_ANALYZER_LAMBDA_URL || '';
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
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<FetchEtfFinancialInfoResponse> {
  if (!LAMBDA_BASE_URL) {
    throw new Error('ETF_ANALYZER_LAMBDA_URL environment variable is not set');
  }

  const { spaceId, exchange, etf } = await params;
  const symbol = normalizeUpperTrim(etf);
  const ex = normalizeUpperTrim(exchange);

  const etfRecord = await prisma.etf.findFirstOrThrow({
    where: { spaceId, symbol, exchange: ex },
    select: { id: true, symbol: true },
  });

  const etfUrl = `${STOCK_ANALYZE_BASE_URL}/etf/${etfRecord.symbol.toLowerCase()}/`;

  const resp = await fetch(`${LAMBDA_BASE_URL}/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: etfUrl }),
  });

  if (!resp.ok) {
    throw new Error(`Lambda request failed: ${resp.status} ${resp.statusText}`);
  }

  const json = (await resp.json()) as LambdaResponse;
  const data = json?.data ?? {};
  const errors = (json?.errors ?? []) as unknown[];

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

  return { success: true, etfUrl: json?.etfUrl ?? etfUrl, errors };
}

export const POST = withLoggedInAdmin<FetchEtfFinancialInfoResponse>(postHandler);
