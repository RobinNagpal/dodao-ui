import { GenerationRequestStatus } from '@/lib/mappingsV1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerV1GenerationRequestWithTicker } from '@/types/public-equity/analysis-factors-types';

interface GenerationRequestsResponse {
  requests: TickerV1GenerationRequestWithTicker[];
  processedCount: number;
  message: string;
}

interface PythonBackendResponse {
  success: boolean;
  message?: string;
  request_id?: string;
  ticker_symbol?: string;
  status?: string;
}

async function callPythonBackend(requestData: TickerV1GenerationRequestWithTicker): Promise<PythonBackendResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_APP_URL || 'http://localhost:5000'}/api/ticker-v1/generate-reports/process-single-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Python backend responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Python backend:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<GenerationRequestsResponse> {
  const { spaceId } = await params;

  // First, check how many InProgress requests exist
  const inProgressCount = await prisma.tickerV1GenerationRequest.count({
    where: {
      spaceId,
      status: GenerationRequestStatus.InProgress,
    },
  });

  // If there are 10 or more InProgress requests, return nothing
  if (inProgressCount >= 10) {
    return {
      requests: [],
      processedCount: 0,
      message: `Already have ${inProgressCount} requests in progress. Skipping processing.`,
    };
  }

  // Calculate how many NotStarted requests we can fetch (max 10 total)
  const maxNotStartedRequests = 10 - inProgressCount;

  // Get NotStarted requests with ticker information
  const notStartedRequests = await prisma.tickerV1GenerationRequest.findMany({
    where: {
      spaceId,
      status: GenerationRequestStatus.NotStarted,
    },
    include: {
      ticker: {
        select: {
          symbol: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: maxNotStartedRequests,
  });

  let processedCount = 0;
  const processedRequests: TickerV1GenerationRequestWithTicker[] = [];

  // Loop through each request and call Python backend
  for (const request of notStartedRequests) {
    try {
      // Call Python backend with the request data (Python backend will handle extra fields)
      const pythonResponse = await callPythonBackend(request as TickerV1GenerationRequestWithTicker);

      if (pythonResponse.success) {
        processedCount++;
        processedRequests.push(request as TickerV1GenerationRequestWithTicker);
        console.log(`Successfully sent request ${request.id} for ticker ${request.ticker.symbol} to Python backend`);
      } else {
        console.error(`Python backend call failed for request ${request.id}:`, pythonResponse.message);
      }
    } catch (error) {
      console.error(`Error processing request ${request.id}:`, error);
    }
  }

  return {
    requests: processedRequests,
    processedCount,
    message: `Processed ${processedCount} out of ${notStartedRequests.length} requests. ${inProgressCount} requests were already in progress.`,
  };
}

export const GET = withErrorHandlingV2<GenerationRequestsResponse>(getHandler);
