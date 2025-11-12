import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { GenerationRequestStatus, ReportType } from '@/types/ticker-typesv1';
import { calculatePendingSteps } from '@/utils/analysis-reports/report-steps-statuses';
import { TickerV1GenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface GenerationRequestPayload {
  ticker: string;
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
}

export interface TickerV1GenerationRequestWithTicker extends TickerV1GenerationRequest {
  ticker: {
    symbol: string;
    exchange: string;
    name: string;
    industry: {
      name: string;
      industryKey: string;
    };

    subIndustry: {
      name: string;
      subIndustryKey: string;
    };
  };
  pendingSteps?: ReportType[];
}

export interface GenerationRequestsResponse {
  inProgress: TickerV1GenerationRequestWithTicker[];
  failed: TickerV1GenerationRequestWithTicker[];
  notStarted: TickerV1GenerationRequestWithTicker[];
  completed: TickerV1GenerationRequestWithTicker[];
  counts: {
    inProgress: number;
    failed: number;
    notStarted: number;
    completed: number;
  };
  pagination: {
    inProgress: { skip: number; take: number };
    failed: { skip: number; take: number };
    notStarted: { skip: number; take: number };
    completed: { skip: number; take: number };
  };
}

async function getRequests(status: GenerationRequestStatus, skip: number = 0, take: number = 15): Promise<TickerV1GenerationRequestWithTicker[]> {
  const requests = await prisma.tickerV1GenerationRequest.findMany({
    where: {
      status: status,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    skip,
    take,
    include: {
      ticker: {
        select: {
          symbol: true,
          exchange: true,
          name: true,
          industry: {
            select: {
              name: true,
              industryKey: true,
            },
          },
          subIndustry: {
            select: {
              name: true,
              subIndustryKey: true,
            },
          },
        },
      },
    },
  });

  // Add pending steps to each request
  return requests.map((request) => ({
    ...request,
    pendingSteps: calculatePendingSteps(request),
  }));
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<GenerationRequestsResponse> {
  // Parse pagination parameters from URL
  const url = new URL(req.url);

  // Get pagination parameters for each status
  const inProgressSkip = parseInt(url.searchParams.get('inProgressSkip') || '0', 10);
  const inProgressTake = parseInt(url.searchParams.get('inProgressTake') || '15', 10);

  const failedSkip = parseInt(url.searchParams.get('failedSkip') || '0', 10);
  const failedTake = parseInt(url.searchParams.get('failedTake') || '15', 10);

  const notStartedSkip = parseInt(url.searchParams.get('notStartedSkip') || '0', 10);
  const notStartedTake = parseInt(url.searchParams.get('notStartedTake') || '15', 10);

  const completedSkip = parseInt(url.searchParams.get('completedSkip') || '0', 10);
  const completedTake = parseInt(url.searchParams.get('completedTake') || '15', 10);

  // Get in progress requests
  const inProgressStatus = GenerationRequestStatus.InProgress;
  const inProgressRequests = await getRequests(inProgressStatus, inProgressSkip, inProgressTake);

  // Get the failed requests
  const failedStatus = GenerationRequestStatus.Failed;
  const failedRequests = await getRequests(failedStatus, failedSkip, failedTake);

  // Get the not started requests
  const notStartedStatus = GenerationRequestStatus.NotStarted;
  const notStartedRequests = await getRequests(notStartedStatus, notStartedSkip, notStartedTake);

  // Get the completed requests
  const completedStatus = GenerationRequestStatus.Completed;
  const completedRequests = await getRequests(completedStatus, completedSkip, completedTake);

  // Get total counts for each status
  const inProgressCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: inProgressStatus },
  });

  const failedCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: failedStatus },
  });

  const notStartedCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: notStartedStatus },
  });

  const completedCount = await prisma.tickerV1GenerationRequest.count({
    where: { status: completedStatus },
  });

  return {
    inProgress: inProgressRequests,
    failed: failedRequests,
    notStarted: notStartedRequests,
    completed: completedRequests,
    counts: {
      inProgress: inProgressCount,
      failed: failedCount,
      notStarted: notStartedCount,
      completed: completedCount,
    },
    pagination: {
      inProgress: { skip: inProgressSkip, take: inProgressTake },
      failed: { skip: failedSkip, take: failedTake },
      notStarted: { skip: notStartedSkip, take: notStartedTake },
      completed: { skip: completedSkip, take: completedTake },
    },
  };
}

async function postHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<TickerV1GenerationRequest[]> {
  const { spaceId } = await params;
  const payloads = (await req.json()) as GenerationRequestPayload[];

  if (!Array.isArray(payloads) || payloads.length === 0) {
    throw new Error('Request body must be a non-empty array of generation requests');
  }

  const results: TickerV1GenerationRequest[] = [];

  // Process each request in the array
  for (const payload of payloads) {
    const { ticker, ...regenerateOptions } = payload;

    if (!ticker) {
      throw new Error('Ticker is required for each generation request');
    }

    // Find the ticker to get its ID
    // Handle both formats: "SYMBOL" (legacy) and "SYMBOL-EXCHANGE" (new)
    let whereClause;
    if (ticker.includes('-')) {
      const [symbol, exchange] = ticker.split('-');
      whereClause = {
        spaceId,
        symbol: symbol.toUpperCase(),
        exchange: exchange.toUpperCase(),
      };
    } else {
      // Legacy format - just symbol
      whereClause = {
        spaceId,
        symbol: ticker.toUpperCase(),
      };
    }

    const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
      where: whereClause,
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

    let result: TickerV1GenerationRequest;

    if (existingRequest) {
      // If there's an existing NotStarted request, update it
      result = await prisma.tickerV1GenerationRequest.update({
        where: {
          id: existingRequest.id,
        },
        data: {
          regenerateCompetition: regenerateOptions.regenerateCompetition || existingRequest.regenerateCompetition,
          regenerateFinancialAnalysis: regenerateOptions.regenerateFinancialAnalysis || existingRequest.regenerateFinancialAnalysis,
          regenerateBusinessAndMoat: regenerateOptions.regenerateBusinessAndMoat || existingRequest.regenerateBusinessAndMoat,
          regeneratePastPerformance: regenerateOptions.regeneratePastPerformance || existingRequest.regeneratePastPerformance,
          regenerateFutureGrowth: regenerateOptions.regenerateFutureGrowth || existingRequest.regenerateFutureGrowth,
          regenerateFairValue: regenerateOptions.regenerateFairValue || existingRequest.regenerateFairValue,
          regenerateFutureRisk: regenerateOptions.regenerateFutureRisk || existingRequest.regenerateFutureRisk,
          regenerateWarrenBuffett: regenerateOptions.regenerateWarrenBuffett || existingRequest.regenerateWarrenBuffett,
          regenerateCharlieMunger: regenerateOptions.regenerateCharlieMunger || existingRequest.regenerateCharlieMunger,
          regenerateBillAckman: regenerateOptions.regenerateBillAckman || existingRequest.regenerateBillAckman,
          regenerateFinalSummary: regenerateOptions.regenerateFinalSummary || existingRequest.regenerateFinalSummary,
          updatedAt: new Date(),
        },
      });
    } else {
      // If no existing NotStarted request, create a new one
      result = await prisma.tickerV1GenerationRequest.create({
        data: {
          tickerId: tickerRecord.id,
          regenerateCompetition: regenerateOptions.regenerateCompetition,
          regenerateFinancialAnalysis: regenerateOptions.regenerateFinancialAnalysis,
          regenerateBusinessAndMoat: regenerateOptions.regenerateBusinessAndMoat,
          regeneratePastPerformance: regenerateOptions.regeneratePastPerformance,
          regenerateFutureGrowth: regenerateOptions.regenerateFutureGrowth,
          regenerateFairValue: regenerateOptions.regenerateFairValue,
          regenerateFutureRisk: regenerateOptions.regenerateFutureRisk,
          regenerateWarrenBuffett: regenerateOptions.regenerateWarrenBuffett,
          regenerateCharlieMunger: regenerateOptions.regenerateCharlieMunger,
          regenerateBillAckman: regenerateOptions.regenerateBillAckman,
          regenerateFinalSummary: regenerateOptions.regenerateFinalSummary,
        },
      });
    }

    results.push(result);
  }

  return results;
}

export const POST = withLoggedInAdmin<TickerV1GenerationRequest[]>(postHandler);
export const GET = withLoggedInAdmin<GenerationRequestsResponse>(getHandler);
