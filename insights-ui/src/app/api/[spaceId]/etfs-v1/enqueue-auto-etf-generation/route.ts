import { AutoEnqueueResult } from '@/utils/analysis-reports/auto-gen-gate-utils';
import { enqueueAutoEtfGenerationBatch } from '@/utils/etf-analysis-reports/auto-etf-generation-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Cron endpoint for Claude-usage-gated ETF report auto-generation.
 *
 * Intended to be hit by a scheduled job that runs only during the off-hours
 * window — so the time window is enforced by the schedule, not here. On each call
 * it checks the Claude usage gates and, if they pass AND no auto requests are
 * currently open, creates one small batch (BATCH_SIZE) of full-report Claude
 * requests for ETFs missing their reports (US first, then Canada, then other). The
 * existing ~3-min `generate-etf-v1-request` processor then generates them — no
 * change needed there, since we only add a small batch at a time.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<AutoEnqueueResult> {
  const { spaceId } = await params;
  return enqueueAutoEtfGenerationBatch(spaceId);
}

export const GET = withErrorHandlingV2<AutoEnqueueResult>(getHandler);
