/**
 * Read-only diagnostic for the nightly auto-generation job. Walks the SAME gate
 * chain the enqueue side walks (master switch → entity → window → open-batch →
 * cooldown → Claude usage → candidates) but never creates anything, so an operator
 * can see at a glance WHY a batch would or would not be created right now — instead
 * of triggering the heartbeat and reading its side-effecting result.
 *
 * Everything substantive is the shared helper the real job uses (`isAutoGenEnabled`,
 * `isWithinAutoGenWindow`, `isWithinFrequencyCooldown`, `evaluateAutoGenGates`, the
 * per-entity open-count / last-request / selection queries), so this can't drift
 * from the actual decision.
 */
import { getResolvedAppSettings } from '@/lib/appConfig/appConfig';
import { getClaudeSubscriptionUsage } from '@/util/claude/claude-usage';
import { getEtfsMissingReports, countOpenAutoEtfRequests, latestAutoEtfRequestUpdatedAt } from '@/utils/auto-generation/auto-etf-generation-utils';
import { AutoGenEntityStatus, AutoGenerationStatus, AutoGenGateResult } from '@/utils/auto-generation/auto-gen-models';
import { countOpenAutoStockRequests, latestAutoStockRequestUpdatedAt } from '@/utils/auto-generation/auto-stock-generation-utils';
import {
  currentEtHour,
  evaluateAutoGenGates,
  getAutoGenModePreset,
  getResolvedAutoGenControls,
  isAutoGenEnabled,
  isEtfAutoGenEnabled,
  isStockAutoGenEnabled,
  isWithinAutoGenWindow,
  isWithinFrequencyCooldown,
} from '@/utils/auto-generation/auto-gen-utils';
import { getOldestStocksOverall } from '@/utils/oldest-reports-utils';

/** Facts fed into the shared blocking-reason derivation for one entity. */
interface EntityGateInputs {
  masterEnabled: boolean;
  entityEnabled: boolean;
  withinWindow: boolean;
  openAutoCount: number;
  cooldownActive: boolean;
  usageError: string | null;
  gate: AutoGenGateResult | null;
  candidateCount: number;
}

/**
 * The first gate that blocks this entity, in the exact order the enqueue job
 * applies them. Returns `ok` only when every gate passes and a candidate exists.
 * `no-candidates` reports the case where the gates pass but the selection query
 * returns nothing (for ETFs this is the job's `no-missing-etfs`).
 */
function deriveBlockingReason(i: EntityGateInputs): string {
  if (!i.masterEnabled) return 'auto-generation-disabled';
  if (!i.entityEnabled) return 'entity-disabled';
  if (!i.withinWindow) return 'outside-window';
  if (i.openAutoCount > 0) return 'batch-in-progress';
  if (i.cooldownActive) return 'frequency-cooldown';
  if (i.usageError) return 'usage-unavailable';
  if (i.gate && !i.gate.allowed) return i.gate.reason;
  if (i.candidateCount === 0) return 'no-candidates';
  return 'ok';
}

/**
 * Read-only snapshot of the auto-generation decision for `spaceId`: the resolved
 * controls, the run-window state, the shared Claude usage gate, and a per-entity
 * gate breakdown. Computing it never enqueues a request.
 */
export async function getAutoGenerationStatus(spaceId: string): Promise<AutoGenerationStatus> {
  const now = new Date();

  const [masterEnabled, controls, preset, withinWindow, stockEntityEnabled, etfEntityEnabled, resolved] = await Promise.all([
    isAutoGenEnabled(),
    getResolvedAutoGenControls(),
    getAutoGenModePreset(),
    isWithinAutoGenWindow(now),
    isStockAutoGenEnabled(),
    isEtfAutoGenEnabled(),
    getResolvedAppSettings(),
  ]);

  // Shared Claude usage gate — the same external call the real job makes. When it
  // throws (missing/expired OAuth creds, non-2xx) the job creates nothing and
  // reports the entity as `usage-unavailable`; surface that here instead of 500ing.
  let gate: AutoGenGateResult | null = null;
  let usageError: string | null = null;
  try {
    const usage = await getClaudeSubscriptionUsage();
    gate = await evaluateAutoGenGates(usage, now);
  } catch (err) {
    usageError = err instanceof Error ? err.message : 'unknown error';
  }

  const minutesSince = (last: Date | null): number | null => (last ? Math.floor((now.getTime() - last.getTime()) / 60_000) : null);

  const [stockOpen, stockLastAt, stockCandidates, etfOpen, etfLastAt, etfCandidates] = await Promise.all([
    countOpenAutoStockRequests(spaceId),
    latestAutoStockRequestUpdatedAt(spaceId),
    getOldestStocksOverall(spaceId, preset.batchSize),
    countOpenAutoEtfRequests(spaceId),
    latestAutoEtfRequestUpdatedAt(spaceId),
    getEtfsMissingReports(spaceId, preset.batchSize),
  ]);

  const buildEntity = (entityEnabled: boolean, openAutoCount: number, lastAt: Date | null, candidateCount: number): AutoGenEntityStatus => {
    const cooldownActive = isWithinFrequencyCooldown(now, lastAt, preset.minMinutesBetweenBatches);
    const blockingReason = deriveBlockingReason({
      masterEnabled,
      entityEnabled,
      withinWindow,
      openAutoCount,
      cooldownActive,
      usageError,
      gate,
      candidateCount,
    });
    return {
      entityEnabled,
      openAutoCount,
      lastAutoAt: lastAt ? lastAt.toISOString() : null,
      cooldownActive,
      minutesSinceLastBatch: minutesSince(lastAt),
      candidateCount,
      wouldEnqueue: blockingReason === 'ok',
      blockingReason,
    };
  };

  return {
    now: now.toISOString(),
    currentEtHour: currentEtHour(now),
    masterEnabled,
    entity: controls.entity,
    window: { value: controls.window, isWithinWindow: withinWindow },
    mode: { value: controls.mode, batchSize: preset.batchSize, minMinutesBetweenBatches: preset.minMinutesBetweenBatches },
    budgetStrategy: controls.budgetStrategy,
    gate,
    usageError,
    settings: resolved.filter((s) => s.group === 'auto-generation').map((s) => ({ key: s.key, value: s.value, source: s.source })),
    stock: buildEntity(stockEntityEnabled, stockOpen, stockLastAt, stockCandidates.length),
    etf: buildEntity(etfEntityEnabled, etfOpen, etfLastAt, etfCandidates.length),
  };
}
