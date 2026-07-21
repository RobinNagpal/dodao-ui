import { processPendingTickerRequests, ProcessTickerRequestsResult } from '@/utils/analysis-reports/process-ticker-requests';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Manual / on-demand trigger for the stock request processor. The scheduled path
 * is the `/cron/heartbeat` job, which calls the same `processPendingTickerRequests`;
 * this route stays for manual runs and scripts.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<ProcessTickerRequestsResult> {
  const { spaceId } = await params;
  return processPendingTickerRequests(spaceId);
}

export const GET = withErrorHandlingV2<ProcessTickerRequestsResult>(getHandler);
