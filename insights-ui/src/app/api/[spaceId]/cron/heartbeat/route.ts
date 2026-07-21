import { HeartbeatResult, runKoalaGainsHeartbeat } from '@/utils/cron/koala-gains-heartbeat';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Single cron endpoint for all KoalaGains report generation. A generic infra
 * heartbeat hits this every ~3 min — it is just a clock. Each call enqueues any due
 * auto-generation batches (policy read from App Settings) and advances the pending
 * stock and ETF requests by one step. It replaces the separate
 * generate-ticker-v1-request, generate-etf-v1-request, and auto-generation crons.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<HeartbeatResult> {
  const { spaceId } = await params;
  return runKoalaGainsHeartbeat(spaceId);
}

export const GET = withErrorHandlingV2<HeartbeatResult>(getHandler);
