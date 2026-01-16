import { prisma } from '@/prisma';
import { ScreenerResponse, StockDataInScreenerResponse } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { processDailyMover, convertInProgressToFailed } from '@/utils/daily-movers-generation-utils';
import { processAndSaveStockMovers } from '@/utils/stock-movers-processing-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { revalidateDailyMoversByCountryTag } from '@/utils/ticker-v1-cache-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';

interface ScreenerCallbackPayload {
  filters: Record<string, any>;
  totalMatched: number;
  count: number;
  stocks: StockDataInScreenerResponse[];
  errors: Array<{ where: string; message: string }>;
  moverType: DailyMoverType;
  spaceId: string;
}

interface ScreenerCallbackResponse {
  message: string;
  moverType: DailyMoverType;
  totalFromAPI: number;
  savedCount: number;
  llmTriggeredCount: number;
  errors: string[];
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<ScreenerCallbackResponse> {
  const { spaceId: pathSpaceId } = await params;

  // Parse the callback payload
  const payload: ScreenerCallbackPayload = await req.json();
  const { stocks, errors: scraperErrors, moverType, spaceId, count, totalMatched, filters } = payload;

  // Use spaceId from payload, fallback to path param
  const effectiveSpaceId = spaceId || pathSpaceId;

  console.log(`[ScreenerCallback] Received callback for ${moverType} with ${stocks?.length || 0} stocks`);

  // Convert any stale InProgress records to Failed first
  await convertInProgressToFailed();

  // Prepare screener response format for existing utils
  const screenerResponse: ScreenerResponse = {
    filters,
    totalMatched,
    count,
    stocks: stocks || [],
    errors: scraperErrors?.map((e) => `${e.where}: ${e.message}`) || [],
  };

  if (!stocks || stocks.length === 0) {
    return {
      message: `No stocks received from screener for ${moverType}`,
      moverType,
      totalFromAPI: 0,
      savedCount: 0,
      llmTriggeredCount: 0,
      errors: screenerResponse.errors,
    };
  }

  // Use the mover type enum directly
  const type = moverType;

  // Save the fresh data to database
  const saveResult = await processAndSaveStockMovers(screenerResponse, effectiveSpaceId, type);

  // Invalidate country-level cache for US (since we only process US exchanges)
  if (saveResult.savedCount > 0) {
    revalidateDailyMoversByCountryTag(SupportedCountries.US, type);
  }

  // Get all saved movers in one query
  const savedSymbols = saveResult.savedStocks.map((stock) => stock.symbol);

  const movers =
    type === DailyMoverType.GAINER
      ? await prisma.dailyTopGainer.findMany({
          where: {
            spaceId: effectiveSpaceId,
            symbol: { in: savedSymbols },
            createdAt: {
              gte: new Date(Date.now() - 60000), // Within last minute to get the newly created ones
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : await prisma.dailyTopLoser.findMany({
          where: {
            spaceId: effectiveSpaceId,
            symbol: { in: savedSymbols },
            createdAt: {
              gte: new Date(Date.now() - 60000), // Within last minute to get the newly created ones
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

  // Create a map for quick lookup
  const moverMap = new Map(movers.map((mover) => [mover.symbol, mover]));

  // Trigger LLM generation for each saved stock
  const llmGenerationErrors: string[] = [];
  let llmTriggeredCount = 0;

  for (const stock of stocks) {
    const mover = moverMap.get(stock.symbol);
    if (mover) {
      try {
        await processDailyMover(effectiveSpaceId, stock, mover.id, type);
        llmTriggeredCount++;
      } catch (error) {
        console.error(`Error triggering LLM generation for ${stock.symbol}:`, error);
        llmGenerationErrors.push(`LLM generation failed for ${stock.symbol}: ${error}`);
      }
    }
  }

  console.log(`[ScreenerCallback] Completed processing ${moverType}: saved ${saveResult.savedCount}, triggered LLM for ${llmTriggeredCount}`);

  return {
    message: `${moverType} callback processed successfully`,
    moverType,
    totalFromAPI: count,
    savedCount: saveResult.savedCount,
    llmTriggeredCount,
    errors: [...saveResult.errors, ...llmGenerationErrors],
  };
}

export const POST = withErrorHandlingV2<ScreenerCallbackResponse>(postHandler);
