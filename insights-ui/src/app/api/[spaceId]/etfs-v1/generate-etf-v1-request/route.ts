import { processPendingEtfRequests, ProcessEtfRequestsResult } from '@/utils/etf-analysis-reports/process-etf-requests';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Manual / on-demand trigger for the ETF request processor. The scheduled path is
 * the `/cron/heartbeat` job, which calls the same `processPendingEtfRequests`; this
 * route stays for manual runs and scripts (e.g. `scripts/etfs/wait-for-generation`).
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<ProcessEtfRequestsResult> {
  const { spaceId } = await params;
  return processPendingEtfRequests(spaceId);
}

export const GET = withErrorHandlingV2<ProcessEtfRequestsResult>(getHandler);
