import { AutoEnqueueResult } from '@/utils/auto-generation/auto-gen-models';
import { enqueueAutoStockGenerationBatch } from '@/utils/auto-generation/auto-stock-generation-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Cron endpoint for Claude-usage-gated stock report auto-generation.
 *
 * Hit every 5 min, 24/7 (a heartbeat). The run window, mode, and entity are read
 * from App Settings inside `enqueueAutoStockGenerationBatch`: outside the selected
 * window (or when the entity excludes stocks) it returns immediately without
 * touching Claude; otherwise, when no batch is open, the mode's cooldown has
 * elapsed, and the shared usage gates pass, it creates one batch (the mode's batch
 * size) of generate-all requests for the oldest stocks. The mode sets both the
 * batch size and the cooldown, so it controls how much AND how often. The existing
 * ~3-min `generate-ticker-v1-request` processor then generates them normally.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<AutoEnqueueResult> {
  const { spaceId } = await params;
  return enqueueAutoStockGenerationBatch(spaceId);
}

export const GET = withErrorHandlingV2<AutoEnqueueResult>(getHandler);
