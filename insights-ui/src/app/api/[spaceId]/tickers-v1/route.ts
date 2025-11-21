import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerV1 } from '@prisma/client';
import { NextRequest } from 'next/server';
import { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { AllExchanges, getExchangeFilterClause, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { validateStockAnalyzeUrl } from '@/utils/stockAnalyzeUrlValidation';

/** ---------- Types ---------- */

interface NewTickerRequest {
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string;
  summary?: string;
  stockAnalyzeUrl: string;
}

interface ErrorTicker {
  input: NewTickerRequest;
  reason: string;
}

interface BulkNewTickersResponse {
  success: boolean;
  addedTickers: TickerV1[];
  errorTickers: ErrorTicker[];
}

interface UpdateTickerRequest {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string;
  stockAnalyzeUrl?: string;
}

interface UpdateTickersRequest {
  tickers: UpdateTickerRequest[];
}

interface UpdateTickersResponse {
  success: boolean;
  updatedCount: number;
  updatedTickers: TickerV1[];
}

/** ---------- GET ---------- */

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TickerWithIndustryNames[]> {
  const { spaceId } = await context.params;

  const url = new URL(req.url);
  const industryKey = url.searchParams.get('industryKey');
  const subIndustryKey = url.searchParams.get('subIndustryKey');
  const country = toSupportedCountry(url.searchParams.get('country'));
  const limitPerSubIndustry = url.searchParams.get('limitPerSubIndustry');

  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId,
    ...(industryKey ? { industryKey } : {}),
    ...(subIndustryKey ? { subIndustryKey } : {}),
    ...getExchangeFilterClause(country),
  };

  // Single DB query: order so we can take the first 3 per subcategory in memory.
  const tickers = await prisma.tickerV1.findMany({
    where: whereClause,
    include: {
      cachedScoreEntry: true,
      industry: true,
      subIndustry: true,
    },
    orderBy: [
      // group together by subcategory (use name for stable, human-friendly grouping)
      { subIndustry: { name: 'asc' } },
      // within each subcategory, highest final score first (nulls last naturally)
      { cachedScoreEntry: { finalScore: 'desc' } },
      // tiebreakers for stability
      { name: 'asc' },
      { symbol: 'asc' },
    ],
  });

  // Take top N per subcategory if limitPerSubIndustry is set
  let tickersToReturn = tickers;

  if (limitPerSubIndustry) {
    const limit = parseInt(limitPerSubIndustry, 10) || 3; // Default to 3 if parsing fails
    const countsBySub: Record<string, number> = {};
    const topPerSub: typeof tickers = [];

    for (const t of tickers) {
      const key = t.subIndustryKey;
      const count = countsBySub[key] ?? 0;
      if (count < limit) {
        topPerSub.push(t);
        countsBySub[key] = count + 1;
      }
    }

    tickersToReturn = topPerSub;
  }

  // Attach friendly names while preserving the included relations
  return tickersToReturn.map((t) => ({
    ...t,
    industryName: t.industry.name,
    subIndustryName: t.subIndustry.name,
  }));
}

/** ---------- Helpers ---------- */

function normStr<T extends string | null>(v?: T): T {
  const s = (v ?? '').trim();
  return s.length ? (s as T) : (null as T);
}

function toKey(spaceId: string, symbol: string, exchange: string): string {
  return `${spaceId}|${symbol.toUpperCase().trim()}|${exchange.trim()}`;
}

/** ---------- POST (batch-friendly) ---------- */

async function postHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<BulkNewTickersResponse> {
  const { spaceId } = await context.params;
  const body = await req.json();

  // Accept either a single object or { tickers: [...] }
  let inputs: NewTickerRequest[] = [];
  if (Array.isArray(body?.tickers)) {
    inputs = body.tickers as NewTickerRequest[];
  } else if (body && typeof body === 'object') {
    inputs = [body as NewTickerRequest];
  }

  if (!inputs.length) {
    throw new Error('Invalid request: provide a ticker object or { tickers: [...] }');
  }

  const addedTickers: TickerV1[] = [];
  const errorTickers: ErrorTicker[] = [];

  // Dedup within the batch
  const seen = new Set<string>();
  for (const raw of inputs) {
    const key = toKey(spaceId, raw.symbol ?? '', raw.exchange ?? '');
    if (seen.has(key)) {
      errorTickers.push({ input: raw, reason: 'Duplicate in the same request (symbol+exchange).' });
    } else {
      seen.add(key);
    }
  }

  for (const raw of inputs) {
    // Skip those already marked as same-request duplicates
    if (errorTickers.some((e) => e.input === raw)) continue;

    // Basic validation
    if (!raw.name || !raw.symbol || !raw.exchange || !raw.industryKey || !raw.subIndustryKey) {
      errorTickers.push({
        input: raw,
        reason: 'Missing required fields: name, symbol, exchange, industryKey, subIndustryKey',
      });
      continue;
    }

    const name = raw.name.trim();
    const symbol = raw.symbol.toUpperCase().trim();
    const exchange = raw.exchange.trim();
    const industryKey = raw.industryKey.trim();
    const subIndustryKey = raw.subIndustryKey.trim();
    const websiteUrl = normStr(raw.websiteUrl);
    const summary = normStr(raw.summary);
    const stockAnalyzeUrl = normStr(raw.stockAnalyzeUrl);

    // Validate stockAnalyzeUrl format if provided
    if (stockAnalyzeUrl) {
      const validationError = validateStockAnalyzeUrl(symbol, exchange.toUpperCase() as AllExchanges, stockAnalyzeUrl);
      if (validationError) {
        errorTickers.push({
          input: raw,
          reason: `Invalid stockAnalyzeUrl format: ${validationError}`,
        });
        continue;
      }
    }

    try {
      // Already exists?
      const existing = await prisma.tickerV1.findFirst({
        where: { spaceId, symbol, exchange },
      });

      if (existing) {
        errorTickers.push({
          input: raw,
          reason: `Ticker ${symbol} already exists on ${exchange}`,
        });
        continue;
      }

      // Create
      const created = await prisma.tickerV1.create({
        data: {
          spaceId,
          name,
          symbol,
          exchange,
          industryKey,
          subIndustryKey,
          websiteUrl,
          summary,
          stockAnalyzeUrl,
          createdBy: 'ui-user',
          updatedBy: 'ui-user',
        },
      });

      addedTickers.push(created);
    } catch (e: any) {
      // Try to surface helpful Prisma errors
      let reason = 'Unknown error';
      if (e?.code === 'P2002') {
        reason = 'Unique constraint failed (symbol+exchange).';
      } else if (typeof e?.message === 'string') {
        reason = e.message;
      }
      errorTickers.push({ input: raw, reason });
    }
  }

  return {
    success: addedTickers.length > 0,
    addedTickers,
    errorTickers,
  };
}

/** ---------- PUT (supports stockAnalyzeUrl) ---------- */

async function putHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<UpdateTickersResponse> {
  const { spaceId } = await context.params;
  const body = await req.json();
  const { tickers } = body as UpdateTickersRequest;

  if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
    throw new Error('Invalid request: tickers array is required');
  }

  const updatedTickers: TickerV1[] = [];

  for (const t of tickers) {
    const { id, name, symbol, exchange, industryKey, subIndustryKey, websiteUrl, stockAnalyzeUrl } = t;

    if (!id || !name || !symbol || !exchange || !industryKey || !subIndustryKey) {
      throw new Error(`Missing required fields for ticker ${symbol || 'unknown'}`);
    }

    const existingTicker = await prisma.tickerV1.findFirst({ where: { id, spaceId } });
    if (!existingTicker) {
      throw new Error(`Ticker with id ${id} not found`);
    }

    const duplicateTicker = await prisma.tickerV1.findFirst({
      where: {
        spaceId,
        symbol: symbol.toUpperCase(),
        exchange,
        id: { not: id },
      },
    });
    if (duplicateTicker) {
      throw new Error(`Ticker ${symbol} already exists on ${exchange}`);
    }

    // Validate stockAnalyzeUrl format if provided
    if (stockAnalyzeUrl && stockAnalyzeUrl.trim()) {
      const validationError = validateStockAnalyzeUrl(symbol.toUpperCase(), exchange.toUpperCase() as AllExchanges, stockAnalyzeUrl.trim());
      if (validationError) {
        throw new Error(`Invalid stockAnalyzeUrl format for ticker ${symbol}: ${validationError}`);
      }
    }

    const updated = await prisma.tickerV1.update({
      where: { id },
      data: {
        name: name.trim(),
        symbol: symbol.toUpperCase().trim(),
        exchange: exchange.trim(),
        industryKey: industryKey.trim(),
        subIndustryKey: subIndustryKey.trim(),
        websiteUrl: normStr(websiteUrl),
        stockAnalyzeUrl: normStr(stockAnalyzeUrl),
        updatedBy: 'ui-user',
        updatedAt: new Date(),
      },
    });

    updatedTickers.push(updated);
  }

  return {
    success: true,
    updatedCount: updatedTickers.length,
    updatedTickers,
  };
}

export const GET = withErrorHandlingV2<TickerWithIndustryNames[]>(getHandler);
export const POST = withErrorHandlingV2<BulkNewTickersResponse>(postHandler);
export const PUT = withErrorHandlingV2<UpdateTickersResponse>(putHandler);
