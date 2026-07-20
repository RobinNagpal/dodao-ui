import { AutoEnqueueResult } from '@/utils/auto-generation/auto-gen-models';
import { enqueueAutoEtfGenerationBatch } from '@/utils/auto-generation/auto-etf-generation-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Cron endpoint for Claude-usage-gated ETF report auto-generation.
 *
 * On-demand / manual trigger for JUST the ETF job. The scheduled path is the
 * generic `/auto-generation/tick` heartbeat, which calls the same
 * `enqueueAutoEtfGenerationBatch`; this route stays for manual or per-entity runs
 * (e.g. an admin "run now"). The run window, mode, entity, and throughput overrides
 * are read from App Settings inside the function: outside the selected window (or
 * when the entity excludes ETFs) it returns immediately without touching Claude;
 * otherwise, when no batch is open, the effective cooldown has elapsed, and the
 * shared usage gates pass, it creates one batch (the effective batch size) of
 * full-report requests for ETFs missing their reports (US first, then Canada, then
 * other). The existing ~3-min `generate-etf-v1-request` processor then generates
 * them normally.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<AutoEnqueueResult> {
  const { spaceId } = await params;
  return enqueueAutoEtfGenerationBatch(spaceId);
}

export const GET = withErrorHandlingV2<AutoEnqueueResult>(getHandler);
