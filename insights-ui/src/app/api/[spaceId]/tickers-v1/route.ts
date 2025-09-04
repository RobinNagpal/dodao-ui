import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerV1 } from '@/types/public-equity/analysis-factors-types';

interface NewTickerRequest {
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string;
  summary?: string;
}

interface NewTickerResponse {
  success: boolean;
  ticker: TickerV1;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TickerV1[]> {
  const { spaceId } = await context.params;

  const tickers = await prisma.tickerV1.findMany({
    where: {
      spaceId,
    },
    orderBy: {
      symbol: 'asc',
    },
  });

  return tickers.map((ticker) => ({
    id: ticker.id,
    name: ticker.name,
    symbol: ticker.symbol,
    exchange: ticker.exchange,
    industryKey: ticker.industryKey,
    subIndustryKey: ticker.subIndustryKey,
    websiteUrl: ticker.websiteUrl || undefined,
    summary: ticker.summary || undefined,
    createdAt: ticker.createdAt,
    updatedAt: ticker.updatedAt,
  }));
}

async function postHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<NewTickerResponse> {
  const { spaceId } = await context.params;
  const body = await req.json();
  const { name, symbol, exchange, industryKey, subIndustryKey, websiteUrl, summary } = body as NewTickerRequest;

  // Validate required fields
  if (!name || !symbol || !exchange || !industryKey || !subIndustryKey) {
    throw new Error('Missing required fields: name, symbol, exchange, industryKey, and subIndustryKey are required');
  }

  // Check if ticker already exists
  const existingTicker = await prisma.tickerV1.findFirst({
    where: {
      spaceId,
      symbol: symbol.toUpperCase(),
      exchange,
    },
  });

  if (existingTicker) {
    throw new Error(`Ticker ${symbol} already exists on ${exchange}`);
  }

  // Create the ticker
  const ticker = await prisma.tickerV1.create({
    data: {
      spaceId,
      name: name.trim(),
      symbol: symbol.toUpperCase().trim(),
      exchange: exchange.trim(),
      industryKey: industryKey.trim(),
      subIndustryKey: subIndustryKey.trim(),
      websiteUrl: websiteUrl?.trim() || null,
      summary: summary?.trim() || null,
      createdBy: 'ui-user',
      updatedBy: 'ui-user',
    },
  });

  return {
    success: true,
    ticker: {
      id: ticker.id,
      name: ticker.name,
      symbol: ticker.symbol,
      exchange: ticker.exchange,
      industryKey: ticker.industryKey,
      subIndustryKey: ticker.subIndustryKey,
      websiteUrl: ticker.websiteUrl || undefined,
      summary: ticker.summary || undefined,
    },
  };
}

export const GET = withErrorHandlingV2<TickerV1[]>(getHandler);
export const POST = withErrorHandlingV2<NewTickerResponse>(postHandler);
