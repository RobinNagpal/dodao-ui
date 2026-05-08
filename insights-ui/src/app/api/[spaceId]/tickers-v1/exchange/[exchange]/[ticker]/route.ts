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
import { AllExchanges, isExchange } from '@/utils/countryExchangeUtils';

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
  stockAnalyzeUrl?: string;
  movedExchange?: string | null;
  movedSymbol?: string | null;
  isDeleted?: boolean;
}

async function putHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  context: { params: Promise<{ spaceId: string; ticker: string; exchange: string }> }
): Promise<TickerV1> {
  const { spaceId, ticker, exchange } = await context.params;
  const body: UpdateStockAnalyzeUrlRequest = await req.json();
  const { stockAnalyzeUrl, movedExchange, movedSymbol, isDeleted } = body;

  const data: Prisma.TickerV1UpdateInput = {
    updatedBy: 'ui-user',
    updatedAt: new Date(),
  };

  if (stockAnalyzeUrl !== undefined) {
    if (typeof stockAnalyzeUrl !== 'string' || !stockAnalyzeUrl.trim()) {
      throw new Error('stockAnalyzeUrl must be a non-empty string when provided');
    }
    const validationError = validateStockAnalyzeUrl(ticker.toUpperCase(), exchange.toUpperCase() as AllExchanges, stockAnalyzeUrl.trim());
    if (validationError) {
      throw new Error(`Invalid stockAnalyzeUrl format: ${validationError}`);
    }
    data.stockAnalyzeUrl = stockAnalyzeUrl.trim();
  }

  if (movedExchange !== undefined) {
    const trimmed = typeof movedExchange === 'string' ? movedExchange.trim().toUpperCase() : '';
    if (trimmed && !isExchange(trimmed)) {
      throw new Error(`Invalid movedExchange "${movedExchange}"`);
    }
    data.movedExchange = trimmed || null;
  }

  if (movedSymbol !== undefined) {
    const trimmed = typeof movedSymbol === 'string' ? movedSymbol.trim().toUpperCase() : '';
    data.movedSymbol = trimmed || null;
  }

  if (isDeleted !== undefined) {
    if (typeof isDeleted !== 'boolean') {
      throw new Error('isDeleted must be a boolean');
    }
    data.isDeleted = isDeleted;
  }

  // "Gone" and "moved" are conceptually exclusive: a deleted ticker shouldn't
  // also have a forwarding address. Resolve via the final intended state, not
  // just the patch.
  const finalIsDeleted = isDeleted !== undefined ? isDeleted : undefined;
  const finalMovedExchange = movedExchange !== undefined ? data.movedExchange : undefined;
  const finalMovedSymbol = movedSymbol !== undefined ? data.movedSymbol : undefined;
  if (finalIsDeleted === true && (finalMovedExchange || finalMovedSymbol)) {
    throw new Error('A ticker cannot be both deleted and have a moved exchange/symbol set in the same update');
  }

  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
  });

  const updatedTicker = await prisma.tickerV1.update({
    where: { id: tickerRecord.id },
    data,
  });

  return updatedTicker;
}

export const GET = withErrorHandlingV2<TickerV1FastResponse | null>(getHandler);
export const PUT = withLoggedInAdmin<TickerV1>(putHandler);
