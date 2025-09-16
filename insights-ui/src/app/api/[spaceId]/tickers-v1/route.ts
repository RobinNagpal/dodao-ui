import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, TickerV1 } from '@prisma/client';
import { NextRequest } from 'next/server';
import { getIndustryMappings, enhanceTickerWithIndustryNames } from '@/lib/industryMappingUtils';
import { TickerWithIndustryNames } from '@/types/ticker-typesv1';

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

interface UpdateTickerRequest {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string;
}

interface UpdateTickersRequest {
  tickers: UpdateTickerRequest[];
}

interface UpdateTickersResponse {
  success: boolean;
  updatedCount: number;
  updatedTickers: TickerV1[];
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<TickerWithIndustryNames[]> {
  const { spaceId } = await context.params;
  const url = new URL(req.url);
  const industryKey = url.searchParams.get('industryKey');
  const subIndustryKey = url.searchParams.get('subIndustryKey');
  // Get country filter if provided
  const country = url.searchParams.get('country') || undefined;

  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId,
  };

  if (industryKey) {
    whereClause.industryKey = industryKey;
  }

  if (subIndustryKey) {
    whereClause.subIndustryKey = subIndustryKey;
  }

  // Add country filter if provided (US = NASDAQ, NYSE, NYSEAMERICAN)
  if (country === 'US') {
    whereClause.exchange = {
      in: ['NASDAQ', 'NYSE', 'NYSEAMERICAN'],
    };
  }

  const tickers = await prisma.tickerV1.findMany({
    where: whereClause,
    orderBy: {
      symbol: 'asc',
    },
  });

  // Get industry and sub-industry mappings
  const mappings = await getIndustryMappings();

  // Enhance tickers with industry names
  const tickersWithNames: TickerWithIndustryNames[] = tickers.map((ticker) => enhanceTickerWithIndustryNames(ticker, mappings));

  return tickersWithNames;
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

async function putHandler(req: NextRequest, context: { params: Promise<{ spaceId: string }> }): Promise<UpdateTickersResponse> {
  const { spaceId } = await context.params;
  const body = await req.json();
  const { tickers } = body as UpdateTickersRequest;

  if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
    throw new Error('Invalid request: tickers array is required');
  }

  const updatedTickers: TickerV1[] = [];

  // Update each ticker
  for (const tickerData of tickers) {
    const { id, name, symbol, exchange, industryKey, subIndustryKey, websiteUrl } = tickerData;

    // Validate required fields
    if (!id || !name || !symbol || !exchange || !industryKey || !subIndustryKey) {
      throw new Error(`Missing required fields for ticker ${symbol || 'unknown'}`);
    }

    // Check if ticker exists
    const existingTicker = await prisma.tickerV1.findFirst({
      where: {
        id,
        spaceId,
      },
    });

    if (!existingTicker) {
      throw new Error(`Ticker with id ${id} not found`);
    }

    // Check if symbol+exchange combination already exists for a different ticker
    const duplicateTicker = await prisma.tickerV1.findFirst({
      where: {
        spaceId,
        symbol: symbol.toUpperCase(),
        exchange,
        id: {
          not: id, // Exclude current ticker
        },
      },
    });

    if (duplicateTicker) {
      throw new Error(`Ticker ${symbol} already exists on ${exchange}`);
    }

    // Update the ticker
    const updatedTicker = await prisma.tickerV1.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        symbol: symbol.toUpperCase().trim(),
        exchange: exchange.trim(),
        industryKey: industryKey.trim(),
        subIndustryKey: subIndustryKey.trim(),
        websiteUrl: websiteUrl?.trim() || null,
        updatedBy: 'ui-user',
        updatedAt: new Date(),
      },
    });

    updatedTickers.push(updatedTicker);
  }

  return {
    success: true,
    updatedCount: updatedTickers.length,
    updatedTickers,
  };
}

export const GET = withErrorHandlingV2<TickerWithIndustryNames[]>(getHandler);
export const POST = withErrorHandlingV2<NewTickerResponse>(postHandler);
export const PUT = withErrorHandlingV2<UpdateTickersResponse>(putHandler);
