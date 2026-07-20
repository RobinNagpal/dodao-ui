import { AutoEnqueueResult } from '@/utils/auto-generation/auto-gen-models';
import { enqueueAutoEtfGenerationBatch } from '@/utils/auto-generation/auto-etf-generation-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Cron endpoint for Claude-usage-gated ETF report auto-generation.
 *
 * Hit every 5 min, 24/7 (a heartbeat). The run window, mode, and entity are read
 * from App Settings inside `enqueueAutoEtfGenerationBatch`: outside the selected
 * window (or when the entity excludes ETFs) it returns immediately without touching
 * Claude; otherwise, when no batch is open, the mode's cooldown has elapsed, and
 * the shared usage gates pass, it creates one batch (the mode's batch size) of
 * full-report requests for ETFs missing their reports (US first, then Canada, then
 * other). The mode sets both the batch size and the cooldown, so it controls how
 * much AND how often. The existing ~3-min `generate-etf-v1-request` processor then
 * generates them normally.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<AutoEnqueueResult> {
  const { spaceId } = await params;
  return enqueueAutoEtfGenerationBatch(spaceId);
}

export const GET = withErrorHandlingV2<AutoEnqueueResult>(getHandler);
