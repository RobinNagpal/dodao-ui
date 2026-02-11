import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { TickerV1GenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface GenerationRequestPayload {
  regenerateCompetition: boolean;
  regenerateFinancialAnalysis: boolean;
  regenerateBusinessAndMoat: boolean;
  regeneratePastPerformance: boolean;
  regenerateFutureGrowth: boolean;
  regenerateFairValue: boolean;
  regenerateFutureRisk: boolean;
  regenerateFinalSummary: boolean;
  regenerateCachedScore: boolean;
}

async function postHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string; ticker: string }> }
): Promise<TickerV1GenerationRequest> {
  const { spaceId, ticker } = await params;
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
    const updatedRequest = await prisma.tickerV1GenerationRequest.update({
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
        regenerateFinalSummary: payload.regenerateFinalSummary || existingRequest.regenerateFinalSummary,

        updatedAt: new Date(),
      },
    });

    return updatedRequest;
  } else {
    // If no existing NotStarted request, create a new one
    const newRequest = await prisma.tickerV1GenerationRequest.create({
      data: {
        tickerId: tickerRecord.id,
        regenerateCompetition: payload.regenerateCompetition,
        regenerateFinancialAnalysis: payload.regenerateFinancialAnalysis,
        regenerateBusinessAndMoat: payload.regenerateBusinessAndMoat,
        regeneratePastPerformance: payload.regeneratePastPerformance,
        regenerateFutureGrowth: payload.regenerateFutureGrowth,
        regenerateFairValue: payload.regenerateFairValue,
        regenerateFutureRisk: payload.regenerateFutureRisk,
        regenerateFinalSummary: payload.regenerateFinalSummary,
      },
    });

    return newRequest;
  }
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1GenerationRequest> {
  const { spaceId, ticker } = await params;

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
      id: '',
      tickerId: tickerRecord.id,
      spaceId,
      regenerateCompetition: false,
      regenerateFinancialAnalysis: false,
      regenerateBusinessAndMoat: false,
      regeneratePastPerformance: false,
      regenerateFutureGrowth: false,
      regenerateFairValue: false,
      regenerateFutureRisk: false,
      regenerateFinalSummary: false,
      status: GenerationRequestStatus.NotStarted,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      completedAt: null,
    } as TickerV1GenerationRequest;
  }

  return latestRequest;
}

export const POST = withLoggedInAdmin<TickerV1GenerationRequest>(postHandler);
export const GET = withErrorHandlingV2<TickerV1GenerationRequest>(getHandler);
