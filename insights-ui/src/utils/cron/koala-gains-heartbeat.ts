import { AutoGenTickResult } from '@/utils/auto-generation/auto-gen-models';
import { runAutoGenerationTick } from '@/utils/auto-generation/auto-generation-tick';
import { processPendingTickerRequests, ProcessTickerRequestsResult } from '@/utils/analysis-reports/process-ticker-requests';
import { processPendingEtfRequests, ProcessEtfRequestsResult } from '@/utils/etf-analysis-reports/process-etf-requests';
import { reclaimStaleInvocations, ReclaimStaleInvocationsResult } from '@/utils/cron/reclaim-stale-invocations';

/** One section of the heartbeat either produced a result or failed (captured, not thrown). */
type Section<T> = T | { error: string };

export interface HeartbeatResult {
  /** Enqueue side: create new auto-generation batches when due. */
  autoGen: Section<AutoGenTickResult>;
  /** Process side: advance pending stock requests by one step. */
  tickers: Section<ProcessTickerRequestsResult>;
  /** Process side: advance pending ETF requests by one step. */
  etfs: Section<ProcessEtfRequestsResult>;
  /** Hygiene: fail invocations orphaned InProgress by a mid-call process restart. */
  reclaimedInvocations: Section<ReclaimStaleInvocationsResult>;
}

/** Runs one section, capturing any error so the other sections still run. */
async function runSection<T>(label: string, fn: () => Promise<T>): Promise<Section<T>> {
  try {
    return await fn();
  } catch (err) {
    console.error(`heartbeat: ${label} failed`, err);
    return { error: err instanceof Error ? err.message : 'unknown error' };
  }
}

/**
 * The single KoalaGains cron heartbeat. One generic clock (every ~3 min) drives
 * all of report generation: it first enqueues any due auto-generation batches, then
 * advances the pending stock and ETF requests. Sections run sequentially and each
 * is isolated, so a failure in one never blocks the others. Enqueue runs first so a
 * freshly created batch can start processing in the same tick.
 *
 * All scheduling policy (entity / window / mode) lives in App Settings; the cron is
 * just the clock. The per-entity enqueue and processor routes remain for manual runs.
 */
export async function runKoalaGainsHeartbeat(spaceId: string): Promise<HeartbeatResult> {
  const autoGen = await runSection('auto-generation', () => runAutoGenerationTick(spaceId));
  const tickers = await runSection('ticker-requests', () => processPendingTickerRequests(spaceId));
  const etfs = await runSection('etf-requests', () => processPendingEtfRequests(spaceId));
  const reclaimedInvocations = await runSection('reclaim-stale-invocations', () => reclaimStaleInvocations(spaceId));
  return { autoGen, tickers, etfs, reclaimedInvocations };
}
