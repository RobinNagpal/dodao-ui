import { AutoEnqueueResult } from '@/utils/analysis-reports/auto-gen-gate-utils';
import { enqueueAutoStockGenerationBatch } from '@/utils/analysis-reports/auto-stock-generation-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Cron endpoint for Claude-usage-gated stock report auto-generation.
 *
 * Intended to be hit by a scheduled job that runs only during the off-hours
 * window (e.g. every 15 min, 10 PM–6 AM ET) — so the time window is enforced by
 * the schedule, not here. On each call it checks the Claude usage gates
 * (5-hour < 90%, the session ends before 7 AM ET, weekly under the day-curve cap)
 * and, if they pass AND no auto requests are currently open, creates one small
 * batch (BATCH_SIZE) of generate-all Claude requests for the oldest stocks. The
 * existing ~3-min `generate-ticker-v1-request` processor then generates them
 * normally — no change needed there, since we only add a small batch at a time.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<AutoEnqueueResult> {
  const { spaceId } = await params;
  return enqueueAutoStockGenerationBatch(spaceId);
}

export const GET = withErrorHandlingV2<AutoEnqueueResult>(getHandler);
