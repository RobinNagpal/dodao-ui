import { prisma } from '@/prisma';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { DailyMoverInputJson, StockDataInScreenerResponse } from '@/types/daily-stock-movers';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { getLLMResponseForPromptViaInvocationViaLambda } from '@/utils/analysis-reports/llm-callback-lambda-utils';

export enum DailyMoverType {
  GAINER = 'gainer',
  LOSER = 'loser',
}

/**
 * Prepares input JSON for daily mover analysis
 */
export function prepareDailyMoverInputJson(stock: StockDataInScreenerResponse): DailyMoverInputJson {
  return {
    name: stock.companyName,
    symbol: stock.symbol,
    percentageChange: stock.percentChange,
  };
}

/**
 * Generates daily mover analysis by calling LLM
 */
async function generateDailyMoverAnalysis(
  spaceId: string,
  stock: StockDataInScreenerResponse,
  generationRequestId: string,
  type: DailyMoverType
): Promise<void> {
  // Prepare input for the prompt
  const inputJson = prepareDailyMoverInputJson(stock);

  // Call the LLM
  await getLLMResponseForPromptViaInvocationViaLambda({
    symbol: stock.symbol,
    // exchange is optional for daily movers
    generationRequestId,
    params: {
      spaceId,
      inputJson,
      promptKey: 'US/public-equities-v1/daily-movers',
      llmProvider: LLMProvider.GEMINI,
      model: GeminiModel.GEMINI_2_5_PRO,
      requestFrom: 'ui',
    },
    // reportType is optional for daily movers
    moverType: type,
  });
}

/**
 * Processes a single daily mover (gainer or loser) and triggers LLM generation
 */
export async function processDailyMover(spaceId: string, stock: StockDataInScreenerResponse, moverId: string, type: DailyMoverType): Promise<void> {
  try {
    console.log(`Processing ${type} ${stock.symbol} with ID ${moverId}`);

    // Update status to InProgress
    if (type === 'gainer') {
      await prisma.dailyTopGainer.update({
        where: { id: moverId },
        data: {
          status: GenerationRequestStatus.InProgress,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.dailyTopLoser.update({
        where: { id: moverId },
        data: {
          status: GenerationRequestStatus.InProgress,
          updatedAt: new Date(),
        },
      });
    }

    // Trigger LLM generation
    await generateDailyMoverAnalysis(spaceId, stock, moverId, type);
  } catch (error) {
    console.error(`Error processing ${type} ${stock.symbol}:`, error);

    // Update status to Failed
    if (type === 'gainer') {
      await prisma.dailyTopGainer.update({
        where: { id: moverId },
        data: {
          status: GenerationRequestStatus.Failed,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.dailyTopLoser.update({
        where: { id: moverId },
        data: {
          status: GenerationRequestStatus.Failed,
          updatedAt: new Date(),
        },
      });
    }
    throw error;
  }
}

/**
 * Saves daily mover LLM response
 */
export async function saveDailyMoverResponse(
  moverId: string,
  type: DailyMoverType,
  response: {
    title: string;
    metaDescription: string;
    oneLineExplanation: string;
    detailedExplanation: string;
  }
): Promise<void> {
  const updateData = {
    title: response.title,
    metaDescription: response.metaDescription,
    oneLineExplanation: response.oneLineExplanation,
    detailedExplanation: response.detailedExplanation,
    status: GenerationRequestStatus.Completed,
    updatedAt: new Date(),
  };

  if (type === 'gainer') {
    await prisma.dailyTopGainer.update({
      where: { id: moverId },
      data: updateData,
    });
  } else {
    await prisma.dailyTopLoser.update({
      where: { id: moverId },
      data: updateData,
    });
  }

  console.log(`Successfully saved ${type} response for ID ${moverId}`);
}
