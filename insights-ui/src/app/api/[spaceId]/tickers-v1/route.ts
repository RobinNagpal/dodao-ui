import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { Prisma, TickerV1 } from '@prisma/client';

interface NewTickerRequest {
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string;
  summary?: string;
  cachedScore: number;
}

interface NewTickerResponse {
  success: boolean;
  ticker: TickerV1;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TickerV1[]> {
  const { spaceId } = await context.params;
  const url = new URL(req.url);
  const industryKey = url.searchParams.get('industryKey');
  const subIndustryKey = url.searchParams.get('subIndustryKey');

  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId,
  };

  if (industryKey) {
    whereClause.industryKey = industryKey;
  }

  if (subIndustryKey) {
    whereClause.subIndustryKey = subIndustryKey;
  }

  const tickers = await prisma.tickerV1.findMany({
    where: whereClause,
    orderBy: {
      symbol: 'asc',
    },
  });

  return tickers;
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
    ticker: ticker,
  };
}

export const GET = withErrorHandlingV2<TickerV1[]>(getHandler);
export const POST = withErrorHandlingV2<NewTickerResponse>(postHandler);
