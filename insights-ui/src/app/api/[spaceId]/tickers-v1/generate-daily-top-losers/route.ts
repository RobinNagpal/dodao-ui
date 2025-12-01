import { prisma } from '@/prisma';
import { GenerateStockMoversResponse } from '@/types/daily-stock-movers';
import { DailyMoverType, processDailyMover } from '@/utils/daily-movers-generation-utils';
import { fetchTopLosers } from '@/utils/screener-api-utils';
import { processAndSaveStockMovers } from '@/utils/stock-movers-processing-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<GenerateStockMoversResponse> {
  const { spaceId } = await params;

  // Fetch fresh data from screener API
  const data = await fetchTopLosers();

  // Save the fresh data to database
  const saveResult = await processAndSaveStockMovers(data, spaceId, DailyMoverType.LOSER);

  // Get all saved movers in one query
  const savedSymbols = saveResult.savedStocks.map((stock) => stock.symbol);
  const movers = await prisma.dailyTopLoser.findMany({
    where: {
      spaceId,
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

  for (const stock of data.stocks) {
    const mover = moverMap.get(stock.symbol);
    if (mover) {
      try {
        await processDailyMover(spaceId, stock, mover.id, DailyMoverType.LOSER);
      } catch (error) {
        console.error(`Error triggering LLM generation for ${stock.symbol}:`, error);
        llmGenerationErrors.push(`LLM generation failed for ${stock.symbol}: ${error}`);
      }
    }
  }

  return {
    ...saveResult,
    errors: [...saveResult.errors, ...llmGenerationErrors],
  };
}

export const GET = withErrorHandlingV2<GenerateStockMoversResponse>(getHandler);
