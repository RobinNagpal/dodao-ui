import { AutoEnqueueResult, AutoGenTickResult } from '@/utils/auto-generation/auto-gen-models';
import { enqueueAutoEtfGenerationBatch } from '@/utils/auto-generation/auto-etf-generation-utils';
import { enqueueAutoStockGenerationBatch } from '@/utils/auto-generation/auto-stock-generation-utils';
import { isAutoGenEnabled } from '@/utils/auto-generation/auto-gen-utils';

/**
 * The enqueue side of automated report generation, run by the `/cron/heartbeat`
 * job. All scheduling policy lives here / in the jobs it calls: whether the job is
 * on at all (AUTOMATED_GENERATION_ENABLED), which entities run
 * (AUTOMATED_GENERATION_ENTITY), when (AUTOMATED_GENERATION_WINDOW), and how often +
 * how much (the mode's cooldown and batch size, AUTOMATED_GENERATION_MODE). The
 * external cron is just a clock — change any of the above from App Settings without
 * touching infra.
 *
 * The master switch is checked once here and short-circuits both jobs. Otherwise
 * both jobs self-gate (entity → window → open-batch → cooldown → usage), so we
 * always call both and each decides whether to do anything. Run sequentially so
 * the two never create their batches at the exact same instant.
 */
export async function runAutoGenerationTick(spaceId: string): Promise<AutoGenTickResult> {
  if (!(await isAutoGenEnabled())) {
    const disabled: AutoEnqueueResult = { created: 0, reason: 'auto-generation-disabled', fiveHourPct: null, weeklyPct: null };
    return { stock: disabled, etf: disabled };
  }
  const stock = await enqueueAutoStockGenerationBatch(spaceId);
  const etf = await enqueueAutoEtfGenerationBatch(spaceId);
  return { stock, etf };
}
