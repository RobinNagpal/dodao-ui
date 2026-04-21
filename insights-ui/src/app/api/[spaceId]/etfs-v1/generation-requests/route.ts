import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { EtfGenerationRequestStatus, EtfReportType } from '@/types/etf/etf-analysis-types';
import { calculateEtfPendingSteps } from '@/utils/etf-analysis-reports/etf-report-steps-statuses';
import { EtfGenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface EtfIdentifier {
  symbol: string;
  exchange: string;
}

export interface EtfGenerationRequestPayload {
  etf: EtfIdentifier;
  regeneratePerformanceAndReturns: boolean;
  regenerateCostEfficiencyAndTeam: boolean;
  regenerateRiskAnalysis: boolean;
  regenerateFuturePerformanceOutlook?: boolean;
  regenerateIndexStrategy?: boolean;
  regenerateFinalSummary?: boolean;
}

export interface EtfGenerationRequestWithEtf extends EtfGenerationRequest {
  etf: {
    symbol: string;
    exchange: string;
    name: string;
  };
  pendingSteps?: EtfReportType[];
}

export interface EtfGenerationRequestsResponse {
  inProgress: EtfGenerationRequestWithEtf[];
  failed: EtfGenerationRequestWithEtf[];
  notStarted: EtfGenerationRequestWithEtf[];
  completed: EtfGenerationRequestWithEtf[];
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

async function getEtfRequests(status: EtfGenerationRequestStatus, skip: number = 0, take: number = 15): Promise<EtfGenerationRequestWithEtf[]> {
  const requests = await prisma.etfGenerationRequest.findMany({
    where: { status },
    orderBy: { updatedAt: 'desc' },
    skip,
    take,
    include: {
      etf: {
        select: {
          symbol: true,
          exchange: true,
          name: true,
        },
      },
    },
  });

  return requests.map((request) => ({
    ...request,
    pendingSteps: calculateEtfPendingSteps(request),
  }));
}

async function getHandler(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<EtfGenerationRequestsResponse> {
  const url = new URL(req.url);

  const inProgressSkip = parseInt(url.searchParams.get('inProgressSkip') || '0', 10);
  const inProgressTake = parseInt(url.searchParams.get('inProgressTake') || '15', 10);
  const failedSkip = parseInt(url.searchParams.get('failedSkip') || '0', 10);
  const failedTake = parseInt(url.searchParams.get('failedTake') || '15', 10);
  const notStartedSkip = parseInt(url.searchParams.get('notStartedSkip') || '0', 10);
  const notStartedTake = parseInt(url.searchParams.get('notStartedTake') || '15', 10);
  const completedSkip = parseInt(url.searchParams.get('completedSkip') || '0', 10);
  const completedTake = parseInt(url.searchParams.get('completedTake') || '15', 10);

  const [inProgressRequests, failedRequests, notStartedRequests, completedRequests, inProgressCount, failedCount, notStartedCount, completedCount] =
    await Promise.all([
      getEtfRequests(EtfGenerationRequestStatus.InProgress, inProgressSkip, inProgressTake),
      getEtfRequests(EtfGenerationRequestStatus.Failed, failedSkip, failedTake),
      getEtfRequests(EtfGenerationRequestStatus.NotStarted, notStartedSkip, notStartedTake),
      getEtfRequests(EtfGenerationRequestStatus.Completed, completedSkip, completedTake),
      prisma.etfGenerationRequest.count({ where: { status: EtfGenerationRequestStatus.InProgress } }),
      prisma.etfGenerationRequest.count({ where: { status: EtfGenerationRequestStatus.Failed } }),
      prisma.etfGenerationRequest.count({ where: { status: EtfGenerationRequestStatus.NotStarted } }),
      prisma.etfGenerationRequest.count({ where: { status: EtfGenerationRequestStatus.Completed } }),
    ]);

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
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<EtfGenerationRequest[]> {
  const { spaceId } = await params;
  const payloads = (await req.json()) as EtfGenerationRequestPayload[];

  if (!Array.isArray(payloads) || payloads.length === 0) {
    throw new Error('Request body must be a non-empty array of generation requests');
  }

  const results: EtfGenerationRequest[] = [];

  for (const payload of payloads) {
    const { etf, ...regenerateOptions } = payload;

    if (!etf || !etf.symbol || !etf.exchange) {
      throw new Error('ETF with symbol and exchange is required for each generation request');
    }

    const etfRecord = await prisma.etf.findFirstOrThrow({
      where: {
        spaceId,
        symbol: etf.symbol.toUpperCase(),
        exchange: etf.exchange.toUpperCase(),
      },
      select: { id: true },
    });

    const existingRequest = await prisma.etfGenerationRequest.findFirst({
      where: {
        etfId: etfRecord.id,
        status: EtfGenerationRequestStatus.NotStarted,
      },
      orderBy: { createdAt: 'desc' },
    });

    let result: EtfGenerationRequest;

    if (existingRequest) {
      result = await prisma.etfGenerationRequest.update({
        where: { id: existingRequest.id },
        data: {
          regeneratePerformanceAndReturns: regenerateOptions.regeneratePerformanceAndReturns || existingRequest.regeneratePerformanceAndReturns,
          regenerateCostEfficiencyAndTeam: regenerateOptions.regenerateCostEfficiencyAndTeam || existingRequest.regenerateCostEfficiencyAndTeam,
          regenerateRiskAnalysis: regenerateOptions.regenerateRiskAnalysis || existingRequest.regenerateRiskAnalysis,
          regenerateFuturePerformanceOutlook: regenerateOptions.regenerateFuturePerformanceOutlook || existingRequest.regenerateFuturePerformanceOutlook,
          regenerateIndexStrategy: regenerateOptions.regenerateIndexStrategy || existingRequest.regenerateIndexStrategy,
          regenerateFinalSummary: regenerateOptions.regenerateFinalSummary || existingRequest.regenerateFinalSummary,
          updatedAt: new Date(),
        },
      });
    } else {
      result = await prisma.etfGenerationRequest.create({
        data: {
          etfId: etfRecord.id,
          spaceId,
          regeneratePerformanceAndReturns: regenerateOptions.regeneratePerformanceAndReturns,
          regenerateCostEfficiencyAndTeam: regenerateOptions.regenerateCostEfficiencyAndTeam,
          regenerateRiskAnalysis: regenerateOptions.regenerateRiskAnalysis,
          regenerateFuturePerformanceOutlook: regenerateOptions.regenerateFuturePerformanceOutlook ?? true,
          regenerateIndexStrategy: regenerateOptions.regenerateIndexStrategy ?? true,
          regenerateFinalSummary: regenerateOptions.regenerateFinalSummary ?? true,
        },
      });
    }

    results.push(result);
  }

  return results;
}

export const POST = withAdminOrToken<EtfGenerationRequest[]>(postHandler);
export const GET = withAdminOrToken<EtfGenerationRequestsResponse>(getHandler);
