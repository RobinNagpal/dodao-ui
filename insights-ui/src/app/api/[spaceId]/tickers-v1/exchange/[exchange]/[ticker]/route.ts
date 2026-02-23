import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getMissingReportsForTicker } from '@/utils/missing-reports-utils';
import { tickerV1IncludeWithRelations, TickerV1FastResponse, TickerV1WithRelations } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { Prisma, TickerV1Industry, TickerV1SubIndustry, TickerV1 } from '@prisma/client';
import { NextRequest } from 'next/server';
import { validateStockAnalyzeUrl } from '@/utils/stockAnalyzeUrlValidation';
import { AllExchanges } from '@/utils/countryExchangeUtils';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerV1FastResponse | null> {
  const { spaceId, ticker, exchange } = await context.params;
  const allowNull = req.nextUrl.searchParams.get('allowNull') === 'true';

  // Get ticker from DB with all related data
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId: spaceId || KoalaGainsSpaceId,
    symbol: ticker.toUpperCase(),
    exchange: exchange.toUpperCase(),
  };

  const tickerRecord: (TickerV1WithRelations & { industry: TickerV1Industry; subIndustry: TickerV1SubIndustry }) | null = allowNull
    ? await prisma.tickerV1.findFirst({ where: whereClause, include: tickerV1IncludeWithRelations })
    : await prisma.tickerV1.findFirstOrThrow({ where: whereClause, include: tickerV1IncludeWithRelations });

  // Return null if ticker not found and allowNull is true
  if (!tickerRecord) {
    return null;
  }

  // Get missing reports for this ticker
  const missingReports = await getMissingReportsForTicker(spaceId, tickerRecord.id);

  if (!missingReports) {
    throw new Error(`Failed to get missing reports for ticker ${ticker}`);
  }

  return { ...tickerRecord, ...missingReports };
}

export interface UpdateStockAnalyzeUrlRequest {
  stockAnalyzeUrl: string;
}

async function putHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  context: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerV1> {
  const { spaceId, ticker, exchange } = await context.params;
  const body: UpdateStockAnalyzeUrlRequest = await req.json();
  const { stockAnalyzeUrl } = body;

  if (!stockAnalyzeUrl || typeof stockAnalyzeUrl !== 'string') {
    throw new Error('stockAnalyzeUrl is required');
  }

  // Validate stockAnalyzeUrl format
  const validationError = validateStockAnalyzeUrl(ticker.toUpperCase(), exchange.toUpperCase() as AllExchanges, stockAnalyzeUrl.trim());
  if (validationError) {
    throw new Error(`Invalid stockAnalyzeUrl format: ${validationError}`);
  }

  // Find the ticker
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
  });

  // Update the stockAnalyzeUrl
  const updatedTicker = await prisma.tickerV1.update({
    where: { id: tickerRecord.id },
    data: {
      stockAnalyzeUrl: stockAnalyzeUrl.trim(),
      updatedBy: 'ui-user',
      updatedAt: new Date(),
    },
  });

  return updatedTicker;
}

export const GET = withErrorHandlingV2<TickerV1FastResponse | null>(getHandler);
export const PUT = withLoggedInAdmin<TickerV1>(putHandler);
