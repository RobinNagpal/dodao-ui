import { prisma } from '@/prisma';
import { GenerationRequestStatus } from '@/lib/mappingsV1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface GenerationRequestPayload {
  regenerateCompetition: boolean;
  regenerateFinancialAnalysis: boolean;
  regenerateBusinessAndMoat: boolean;
  regeneratePastPerformance: boolean;
  regenerateFutureGrowth: boolean;
  regenerateFairValue: boolean;
  regenerateFutureRisk: boolean;
  regenerateWarrenBuffett: boolean;
  regenerateCharlieMunger: boolean;
  regenerateBillAckman: boolean;
  regenerateFinalSummary: boolean;
  regenerateCachedScore: boolean;
}

async function postHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<{ success: boolean }> {
  const { spaceId, ticker } = await context.params;
  const payload = (await req.json()) as GenerationRequestPayload;

  // First, find the ticker to get its ID
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId,
      symbol: ticker,
    },
    select: {
      id: true,
    },
  });

  // Check if there's an existing request for this ticker that is NotStarted
  const existingRequest = await prisma.tickerV1GenerationRequest.findFirst({
    where: {
      tickerId: tickerRecord.id,
      status: GenerationRequestStatus.NotStarted,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (existingRequest) {
    // If there's an existing NotStarted request, update it
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: existingRequest.id,
      },
      data: {
        regenerateCompetition: payload.regenerateCompetition || existingRequest.regenerateCompetition,
        regenerateFinancialAnalysis: payload.regenerateFinancialAnalysis || existingRequest.regenerateFinancialAnalysis,
        regenerateBusinessAndMoat: payload.regenerateBusinessAndMoat || existingRequest.regenerateBusinessAndMoat,
        regeneratePastPerformance: payload.regeneratePastPerformance || existingRequest.regeneratePastPerformance,
        regenerateFutureGrowth: payload.regenerateFutureGrowth || existingRequest.regenerateFutureGrowth,
        regenerateFairValue: payload.regenerateFairValue || existingRequest.regenerateFairValue,
        regenerateFutureRisk: payload.regenerateFutureRisk || existingRequest.regenerateFutureRisk,
        regenerateWarrenBuffett: payload.regenerateWarrenBuffett || existingRequest.regenerateWarrenBuffett,
        regenerateCharlieMunger: payload.regenerateCharlieMunger || existingRequest.regenerateCharlieMunger,
        regenerateBillAckman: payload.regenerateBillAckman || existingRequest.regenerateBillAckman,
        regenerateFinalSummary: payload.regenerateFinalSummary || existingRequest.regenerateFinalSummary,
        regenerateCachedScore: payload.regenerateCachedScore || existingRequest.regenerateCachedScore,
        updatedAt: new Date(),
      },
    });
  } else {
    // If no existing NotStarted request, create a new one
    await prisma.tickerV1GenerationRequest.create({
      data: {
        tickerId: tickerRecord.id,
        regenerateCompetition: payload.regenerateCompetition,
        regenerateFinancialAnalysis: payload.regenerateFinancialAnalysis,
        regenerateBusinessAndMoat: payload.regenerateBusinessAndMoat,
        regeneratePastPerformance: payload.regeneratePastPerformance,
        regenerateFutureGrowth: payload.regenerateFutureGrowth,
        regenerateFairValue: payload.regenerateFairValue,
        regenerateFutureRisk: payload.regenerateFutureRisk,
        regenerateWarrenBuffett: payload.regenerateWarrenBuffett,
        regenerateCharlieMunger: payload.regenerateCharlieMunger,
        regenerateBillAckman: payload.regenerateBillAckman,
        regenerateFinalSummary: payload.regenerateFinalSummary,
        regenerateCachedScore: payload.regenerateCachedScore,
      },
    });
  }

  return { success: true };
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<any> {
  const { spaceId, ticker } = await context.params;

  // Find the ticker to get its ID
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId,
      symbol: ticker,
    },
    select: {
      id: true,
    },
  });

  // Get the latest generation request for this ticker
  const latestRequest = await prisma.tickerV1GenerationRequest.findFirst({
    where: {
      tickerId: tickerRecord.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!latestRequest) {
    // Return a default request status if none exists
    return {
      ticker,
      requestStatus: {
        regenerateCompetition: false,
        regenerateFinancialAnalysis: false,
        regenerateBusinessAndMoat: false,
        regeneratePastPerformance: false,
        regenerateFutureGrowth: false,
        regenerateFairValue: false,
        regenerateFutureRisk: false,
        regenerateWarrenBuffett: false,
        regenerateCharlieMunger: false,
        regenerateBillAckman: false,
        regenerateFinalSummary: false,
        regenerateCachedScore: false,
        status: GenerationRequestStatus.NotStarted,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  return {
    ticker,
    requestStatus: {
      regenerateCompetition: latestRequest.regenerateCompetition,
      regenerateFinancialAnalysis: latestRequest.regenerateFinancialAnalysis,
      regenerateBusinessAndMoat: latestRequest.regenerateBusinessAndMoat,
      regeneratePastPerformance: latestRequest.regeneratePastPerformance,
      regenerateFutureGrowth: latestRequest.regenerateFutureGrowth,
      regenerateFairValue: latestRequest.regenerateFairValue,
      regenerateFutureRisk: latestRequest.regenerateFutureRisk,
      regenerateWarrenBuffett: latestRequest.regenerateWarrenBuffett,
      regenerateCharlieMunger: latestRequest.regenerateCharlieMunger,
      regenerateBillAckman: latestRequest.regenerateBillAckman,
      regenerateFinalSummary: latestRequest.regenerateFinalSummary,
      regenerateCachedScore: latestRequest.regenerateCachedScore,
      status: latestRequest.status,
      createdAt: latestRequest.createdAt,
      updatedAt: latestRequest.updatedAt,
      startedAt: latestRequest.startedAt,
      completedAt: latestRequest.completedAt,
    },
  };
}

export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
export const GET = withErrorHandlingV2<any>(getHandler);
