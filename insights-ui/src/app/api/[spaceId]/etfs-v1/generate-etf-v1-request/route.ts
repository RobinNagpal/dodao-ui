import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfGenerationRequestStatus, EtfReportType } from '@/types/etf/etf-analysis-types';
import { triggerEtfGenerationOfAReport } from '@/utils/etf-analysis-reports/etf-generation-report-utils';
import { markEtfRequestAsCompleted } from '@/utils/etf-analysis-reports/etf-report-status-utils';
import { calculateEtfPendingSteps } from '@/utils/etf-analysis-reports/etf-report-steps-statuses';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EtfGenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

interface EtfGenerationResponse {
  inProgressRequests: (EtfGenerationRequest & { pendingSteps: EtfReportType[] })[];
  justStartedRequests: EtfGenerationRequest[];
  processedCount: number;
  message: string;
}

async function getInProgressEtfRequests() {
  return await prisma.etfGenerationRequest.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      status: EtfGenerationRequestStatus.InProgress,
    },
    include: {
      etf: {
        select: {
          symbol: true,
          exchange: true,
        },
      },
    },
  });
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<EtfGenerationResponse> {
  const { spaceId } = await params;

  let inProgressRequests = await getInProgressEtfRequests();

  for (const request of inProgressRequests) {
    const allStepsCompleted = calculateEtfPendingSteps(request).length === 0;
    if (allStepsCompleted) {
      await markEtfRequestAsCompleted(request);
    }
  }

  inProgressRequests = await getInProgressEtfRequests();

  const maxNotStartedRequests = 10 - inProgressRequests.length;

  const notStartedRequests = await prisma.etfGenerationRequest.findMany({
    where: {
      spaceId,
      status: EtfGenerationRequestStatus.NotStarted,
    },
    include: {
      etf: {
        select: {
          symbol: true,
          exchange: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: maxNotStartedRequests,
  });

  let processedCount = 0;

  for (const request of [...inProgressRequests, ...notStartedRequests]) {
    try {
      const pending = calculateEtfPendingSteps(request);
      console.log(
        `ETF cron: processing request ${request.id} for ${request.etf.symbol} | status=${request.status} | inProgressStep=${request.inProgressStep} | completed=[${request.completedSteps}] | failed=[${request.failedSteps}] | pending=[${pending}]`
      );
      await triggerEtfGenerationOfAReport(request.etf.symbol, request.etf.exchange, request.id);
      processedCount++;
    } catch (error) {
      console.error(`Error processing ETF request ${request.id}:`, error);
    }
  }

  const updatedInProgress = await getInProgressEtfRequests();

  return {
    inProgressRequests: updatedInProgress.map((r) => ({
      ...r,
      pendingSteps: calculateEtfPendingSteps(r),
    })),
    justStartedRequests: notStartedRequests,
    processedCount,
    message: `Processed ${processedCount} ETF requests. ${inProgressRequests.length} were already in progress.`,
  };
}

export const GET = withErrorHandlingV2<EtfGenerationResponse>(getHandler);
