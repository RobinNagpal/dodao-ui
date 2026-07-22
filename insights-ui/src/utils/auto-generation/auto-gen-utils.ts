/**
 * Runtime helpers for the nightly auto-generation: resolvers that read the
 * admin-selected mode / window / entity from App Settings, the ET run-window
 * check, and the Claude usage gate. Kept separate from `auto-gen-config.ts` (which
 * `appConfigDefinitions.ts` imports) so the App-Settings dependency here never
 * forms an import cycle.
 */
import { getAppConfigBoolean, getAppConfigValue } from '@/lib/appConfig/appConfig';
import { ClaudeModel } from '@/types/llmConstants';
import { ClaudeSubscriptionUsage } from '@/util/claude/claude-usage';
import {
  AUTO_GEN_MODE_PRESETS,
  AUTO_GEN_OPUS_MODEL_OPTIONS,
  AUTO_GEN_SONNET_MODEL_OPTIONS,
  AUTO_GEN_USAGE_CAPS,
  AUTO_GEN_WINDOWS,
  DEFAULT_AUTO_GEN_BUDGET_UTILIZATION,
  DEFAULT_AUTO_GEN_ENTITY,
  DEFAULT_AUTO_GEN_MODE,
  DEFAULT_AUTO_GEN_OPUS_MODEL,
  DEFAULT_AUTO_GEN_SONNET_MODEL,
  DEFAULT_AUTO_GEN_WINDOW,
  HOURS_LEFT_BUCKET_KEYS,
  HOURS_LEFT_TO_PERCENT_REMAINING,
} from '@/utils/auto-generation/auto-gen-config';
import {
  AutoGenBudgetUtilizationStrategy,
  AutoGenEntity,
  AutoGenGateResult,
  AutoGenMode,
  AutoGenModePreset,
  AutoGenWindow,
  HoursLeftToPercentRemaining,
} from '@/utils/auto-generation/auto-gen-models';

const AUTO_GEN_ENABLED_KEY = 'AUTOMATED_GENERATION_ENABLED';
const AUTO_GEN_MODE_KEY = 'AUTOMATED_GENERATION_MODE';
const AUTO_GEN_WINDOW_KEY = 'AUTOMATED_GENERATION_WINDOW';
const AUTO_GEN_ENTITY_KEY = 'AUTOMATED_GENERATION_ENTITY';
const AUTO_GEN_BUDGET_UTILIZATION_KEY = 'AUTOMATED_GENERATION_BUDGET_UTILIZATION';
const AUTO_GEN_OPUS_MODEL_KEY = 'AUTOMATED_GENERATION_OPUS_MODEL';
const AUTO_GEN_SONNET_MODEL_KEY = 'AUTOMATED_GENERATION_SONNET_MODEL';

/** Returns `value` if it's one of `allowed`, otherwise `fallback`. */
function coerce<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return value !== undefined && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/**
 * Master on/off switch for the whole auto-generation job (`AUTOMATED_GENERATION_ENABLED`).
 * When false, the tick short-circuits before any per-entity work — the mode,
 * window, and entity controls are irrelevant. Defaults to enabled.
 */
export async function isAutoGenEnabled(): Promise<boolean> {
  return getAppConfigBoolean(AUTO_GEN_ENABLED_KEY);
}

async function getAutoGenMode(): Promise<AutoGenMode> {
  return coerce(await getAppConfigValue(AUTO_GEN_MODE_KEY), Object.values(AutoGenMode), DEFAULT_AUTO_GEN_MODE);
}

/**
 * The selected mode's throughput preset — how many reports per batch and the
 * cooldown between batches. Reads `AUTOMATED_GENERATION_MODE` and looks it up in
 * `AUTO_GEN_MODE_PRESETS`. Shared by the stock and ETF jobs.
 */
export async function getAutoGenModePreset(): Promise<AutoGenModePreset> {
  return AUTO_GEN_MODE_PRESETS[await getAutoGenMode()];
}

async function getAutoGenWindow(): Promise<AutoGenWindow> {
  return coerce(await getAppConfigValue(AUTO_GEN_WINDOW_KEY), Object.values(AutoGenWindow), DEFAULT_AUTO_GEN_WINDOW);
}

async function getAutoGenEntity(): Promise<AutoGenEntity> {
  return coerce(await getAppConfigValue(AUTO_GEN_ENTITY_KEY), Object.values(AutoGenEntity), DEFAULT_AUTO_GEN_ENTITY);
}

/** Which Opus model the balancer uses when it routes a batch to the Opus family (`AUTOMATED_GENERATION_OPUS_MODEL`). */
async function getAutoGenOpusModel(): Promise<ClaudeModel> {
  return coerce(await getAppConfigValue(AUTO_GEN_OPUS_MODEL_KEY), AUTO_GEN_OPUS_MODEL_OPTIONS, DEFAULT_AUTO_GEN_OPUS_MODEL);
}

/** Which Sonnet model the balancer uses when it routes a batch to the Sonnet family (`AUTOMATED_GENERATION_SONNET_MODEL`). */
async function getAutoGenSonnetModel(): Promise<ClaudeModel> {
  return coerce(await getAppConfigValue(AUTO_GEN_SONNET_MODEL_KEY), AUTO_GEN_SONNET_MODEL_OPTIONS, DEFAULT_AUTO_GEN_SONNET_MODEL);
}

/**
 * Chooses the Claude model for a batch automatically. Opus and Sonnet have SEPARATE
 * weekly subscription buckets (`usage.weeklyOpus` / `usage.weeklySonnet`), so each
 * batch goes to whichever family has more of its weekly budget still unused — this
 * taps both pools instead of one and self-balances them (a batch never lands on the
 * family that's closer to its own weekly cap). The provider is always Claude
 * (subscription OAuth); this only picks the model.
 *
 * When the plan does not expose both per-model weekly windows, there is nothing to
 * balance against, so it defaults to the Sonnet model — cheapest per token, so it
 * stretches the shared weekly budget furthest.
 */
export async function chooseAutoGenModel(usage: ClaudeSubscriptionUsage): Promise<ClaudeModel> {
  const opusUsedPct = usage.weeklyOpus?.utilizationPct ?? null;
  const sonnetUsedPct = usage.weeklySonnet?.utilizationPct ?? null;
  if (opusUsedPct === null || sonnetUsedPct === null) {
    return getAutoGenSonnetModel();
  }
  // Lower utilization = more of that family's weekly budget left. Tie → Sonnet (cheaper → more throughput).
  return opusUsedPct < sonnetUsedPct ? getAutoGenOpusModel() : getAutoGenSonnetModel();
}

/**
 * The admin-selected weekly-budget utilization strategy
 * (`AUTOMATED_GENERATION_BUDGET_UTILIZATION`). Picks which
 * `HOURS_LEFT_TO_PERCENT_REMAINING` curve the weekly usage gate applies. Defaults
 * to Aggressive.
 */
async function getAutoGenBudgetUtilizationStrategy(): Promise<AutoGenBudgetUtilizationStrategy> {
  return coerce(await getAppConfigValue(AUTO_GEN_BUDGET_UTILIZATION_KEY), Object.values(AutoGenBudgetUtilizationStrategy), DEFAULT_AUTO_GEN_BUDGET_UTILIZATION);
}

/**
 * The four admin-selected auto-generation controls, resolved and coerced to their
 * enums in one call. Used by the read-only status endpoint to report exactly which
 * mode / window / entity / budget strategy the job is running with. The enqueue job
 * itself reads these through the more specific helpers below.
 */
export async function getResolvedAutoGenControls(): Promise<{
  mode: AutoGenMode;
  window: AutoGenWindow;
  entity: AutoGenEntity;
  budgetStrategy: AutoGenBudgetUtilizationStrategy;
}> {
  const [mode, window, entity, budgetStrategy] = await Promise.all([
    getAutoGenMode(),
    getAutoGenWindow(),
    getAutoGenEntity(),
    getAutoGenBudgetUtilizationStrategy(),
  ]);
  return { mode, window, entity, budgetStrategy };
}

/** Current hour (0-23) in America/New_York, DST-aware. */
export function currentEtHour(now: Date): number {
  const formatted = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(now);
  const hour = parseInt(formatted, 10);
  return hour === 24 ? 0 : hour; // some runtimes format midnight as "24"
}

/** Whether the nightly job may run right now, per the selected window. */
export async function isWithinAutoGenWindow(now: Date): Promise<boolean> {
  const window = await getAutoGenWindow();
  return AUTO_GEN_WINDOWS[window].isWithinHourEt(currentEtHour(now));
}

export async function isStockAutoGenEnabled(): Promise<boolean> {
  const entity = await getAutoGenEntity();
  return entity === AutoGenEntity.StocksOnly || entity === AutoGenEntity.StocksAndEtfs;
}

export async function isEtfAutoGenEnabled(): Promise<boolean> {
  const entity = await getAutoGenEntity();
  return entity === AutoGenEntity.EtfsOnly || entity === AutoGenEntity.StocksAndEtfs;
}

/**
 * Whole hours until the weekly reset, counting toward the END of the window (more
 * accurate than deriving a start). null when the reset time is unknown; never
 * negative (a past reset clamps to 0 → the most permissive final bucket).
 */
function hoursUntilReset(now: Date, weeklyResetsAt: string | null): number | null {
  if (!weeklyResetsAt) return null;
  const ms = new Date(weeklyResetsAt).getTime() - now.getTime();
  return Math.max(0, Math.floor(ms / (60 * 60 * 1000)));
}

/**
 * Min-remaining-% threshold for the given hours-to-reset, read from a strategy's
 * curve: the SMALLEST bucket whose hour bound is ≥ `hoursToReset`. A null
 * `hoursToReset` (unknown reset) falls through to `'168h'`, the strictest bucket.
 */
function requiredRemainingPct(curve: HoursLeftToPercentRemaining, hoursToReset: number | null): number {
  if (hoursToReset === null) return curve['168h'];
  const key = HOURS_LEFT_BUCKET_KEYS.find((k) => hoursToReset <= parseInt(k, 10)) ?? '168h';
  return curve[key];
}

/**
 * Whether a new batch must wait, per the mode's frequency lever: true if fewer
 * than `minMinutes` have passed since the last auto batch (`lastBatchAt`). A null
 * `lastBatchAt` (no prior auto request) is never throttled. Reusable across the
 * stock and ETF jobs.
 */
export function isWithinFrequencyCooldown(now: Date, lastBatchAt: Date | null, minMinutes: number): boolean {
  if (!lastBatchAt) return false;
  return now.getTime() - lastBatchAt.getTime() < minMinutes * 60_000;
}

/**
 * Evaluates the shared Claude usage gates: the 5-hour session ceiling plus the
 * weekly budget guardrail. The weekly gate compares how much budget is still unused
 * (`100 − weeklyPct`) against the minimum required for the current hours-to-reset,
 * read from the selected utilization strategy's `HOURS_LEFT_TO_PERCENT_REMAINING`
 * curve. Counts toward the reset (end of the window), so it tightens/eases exactly
 * as fresh budget nears. Does NOT check the time-of-day window or the mode's
 * throughput. Conservative: blocks when 5-hour usage is unknown, and uses the
 * strictest bucket when the reset time is unknown.
 */
export async function evaluateAutoGenGates(usage: ClaudeSubscriptionUsage, now: Date): Promise<AutoGenGateResult> {
  const fiveHourPct = usage.fiveHour.utilizationPct;
  const weeklyPct = usage.weeklyAll.utilizationPct;
  const strategy = await getAutoGenBudgetUtilizationStrategy();
  const hoursToReset = hoursUntilReset(now, usage.weeklyAll.resetsAt);
  const requiredPct = requiredRemainingPct(HOURS_LEFT_TO_PERCENT_REMAINING[strategy], hoursToReset);
  const remainingPct = weeklyPct === null ? null : 100 - weeklyPct;
  const base = { fiveHourPct, weeklyPct, remainingPct, requiredRemainingPct: requiredPct, hoursToReset, strategy };

  if (fiveHourPct === null) {
    return { allowed: false, reason: 'five-hour-usage-unknown', ...base };
  }
  if (fiveHourPct >= AUTO_GEN_USAGE_CAPS.maxFiveHourUtilizationPct) {
    return { allowed: false, reason: `five-hour-over-${AUTO_GEN_USAGE_CAPS.maxFiveHourUtilizationPct}`, ...base };
  }
  if (remainingPct !== null && remainingPct < requiredPct) {
    return { allowed: false, reason: `weekly-remaining-${remainingPct}-below-required-${requiredPct}`, ...base };
  }
  return { allowed: true, reason: 'ok', ...base };
}
