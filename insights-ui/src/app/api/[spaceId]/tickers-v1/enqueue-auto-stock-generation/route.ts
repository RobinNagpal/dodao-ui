import { AutoEnqueueResult } from '@/utils/auto-generation/auto-gen-models';
import { enqueueAutoStockGenerationBatch } from '@/utils/auto-generation/auto-stock-generation-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Cron endpoint for Claude-usage-gated stock report auto-generation.
 *
 * On-demand / manual trigger for JUST the stock job. The scheduled path is the
 * generic `/auto-generation/tick` heartbeat, which calls the same
 * `enqueueAutoStockGenerationBatch`; this route stays for manual or per-entity runs
 * (e.g. an admin "run now"). The run window, mode, and entity are read from App
 * Settings inside the function: outside the selected window (or when the entity
 * excludes stocks) it returns immediately without touching Claude; otherwise, when
 * no batch is open, the mode's cooldown has elapsed, and the shared usage gates
 * pass, it creates one batch (the mode's batch size) of generate-all requests for
 * the oldest stocks. The existing ~3-min `generate-ticker-v1-request` processor
 * then generates them normally.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<AutoEnqueueResult> {
  const { spaceId } = await params;
  return enqueueAutoStockGenerationBatch(spaceId);
}

export const GET = withErrorHandlingV2<AutoEnqueueResult>(getHandler);
