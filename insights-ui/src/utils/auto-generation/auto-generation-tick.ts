import { AutoGenTickResult } from '@/utils/auto-generation/auto-gen-models';
import { enqueueAutoEtfGenerationBatch } from '@/utils/auto-generation/auto-etf-generation-utils';
import { enqueueAutoStockGenerationBatch } from '@/utils/auto-generation/auto-stock-generation-utils';

/**
 * The single in-app entry point for automated report generation — the only thing
 * the infra heartbeat needs to call. All scheduling policy lives here / in the
 * jobs it calls: which entities run (AUTOMATED_GENERATION_ENTITY), when
 * (AUTOMATED_GENERATION_WINDOW), and how often + how much (the mode's cooldown and
 * batch size, AUTOMATED_GENERATION_MODE). The external cron is just a clock —
 * change any of the above from App Settings without touching infra.
 *
 * Both jobs self-gate (entity → window → open-batch → cooldown → usage), so we
 * always call both and each decides whether to do anything. Run sequentially so
 * the two never create their batches at the exact same instant.
 */
export async function runAutoGenerationTick(spaceId: string): Promise<AutoGenTickResult> {
  const stock = await enqueueAutoStockGenerationBatch(spaceId);
  const etf = await enqueueAutoEtfGenerationBatch(spaceId);
  return { stock, etf };
}
