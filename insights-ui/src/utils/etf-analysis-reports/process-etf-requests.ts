import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfGenerationRequestStatus, EtfReportType } from '@/types/etf/etf-analysis-types';
import { triggerEtfGenerationOfAReport } from '@/utils/etf-analysis-reports/etf-generation-report-utils';
import { markEtfRequestAsCompleted } from '@/utils/etf-analysis-reports/etf-report-status-utils';
import { calculateEtfPendingSteps } from '@/utils/etf-analysis-reports/etf-report-steps-statuses';
import { EtfGenerationRequest } from '@prisma/client';

export interface ProcessEtfRequestsResult {
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

/**
 * Advances pending ETF generation requests by one step each: marks finished
 * in-progress requests complete, then triggers the next step for up to 10 requests
 * (in-progress + not-started). Each trigger kicks off one step (in the default
 * config the LLM call runs in the background), so this returns quickly. Shared by
 * the `/cron/heartbeat` job and the `generate-etf-v1-request` route (manual runs).
 */
export async function processPendingEtfRequests(spaceId: string): Promise<ProcessEtfRequestsResult> {
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
      console.log(`Processing ETF request ${request.id} for ${request.etf.symbol} on ${request.etf.exchange}`);
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
