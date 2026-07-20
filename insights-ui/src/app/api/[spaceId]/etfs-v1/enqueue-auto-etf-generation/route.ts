import { AutoEnqueueResult } from '@/utils/auto-generation/auto-gen-models';
import { enqueueAutoEtfGenerationBatch } from '@/utils/auto-generation/auto-etf-generation-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

/**
 * Cron endpoint for Claude-usage-gated ETF report auto-generation.
 *
 * Hit every 15 min, 24/7. The run window, mode, and entity are read from App
 * Settings inside `enqueueAutoEtfGenerationBatch`: outside the selected window (or
 * when the entity excludes ETFs) it returns immediately without touching Claude;
 * otherwise it checks the mode's usage gates and, when they pass AND no auto
 * requests are open, creates one small batch (the mode's batch size) of
 * full-report requests for ETFs missing their reports (US first, then Canada, then
 * other). The existing ~3-min `generate-etf-v1-request` processor then generates
 * them normally.
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<AutoEnqueueResult> {
  const { spaceId } = await params;
  return enqueueAutoEtfGenerationBatch(spaceId);
}

export const GET = withErrorHandlingV2<AutoEnqueueResult>(getHandler);
