/**
 * Runtime helpers for the nightly auto-generation: resolvers that read the
 * admin-selected mode / window / entity from App Settings, the ET run-window
 * check, and the Claude usage gate. Kept separate from `auto-gen-config.ts` (which
 * `appConfigDefinitions.ts` imports) so the App-Settings dependency here never
 * forms an import cycle.
 */
import { getAppConfigValue } from '@/lib/appConfig/appConfig';
import { ClaudeSubscriptionUsage } from '@/util/claude/claude-usage';
import {
  AUTO_GEN_MODE_PRESETS,
  AUTO_GEN_USAGE_CAPS,
  AUTO_GEN_WINDOWS,
  DEFAULT_AUTO_GEN_ENTITY,
  DEFAULT_AUTO_GEN_MODE,
  DEFAULT_AUTO_GEN_WINDOW,
  WEEKLY_CAP_DAY_KEYS,
} from '@/utils/auto-generation/auto-gen-config';
import { AutoGenEntity, AutoGenGateResult, AutoGenMode, AutoGenModePreset, AutoGenWindow } from '@/utils/auto-generation/auto-gen-models';

export const AUTO_GEN_MODE_KEY = 'AUTOMATED_GENERATION_MODE';
export const AUTO_GEN_WINDOW_KEY = 'AUTOMATED_GENERATION_WINDOW';
export const AUTO_GEN_ENTITY_KEY = 'AUTOMATED_GENERATION_ENTITY';
export const AUTO_GEN_BATCH_SIZE_KEY = 'AUTOMATED_GENERATION_BATCH_SIZE';
export const AUTO_GEN_FREQUENCY_KEY = 'AUTOMATED_GENERATION_FREQUENCY_MINUTES';

/** Returns `value` if it's one of `allowed`, otherwise `fallback`. */
function coerce<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return value !== undefined && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/**
 * Parses an optional numeric App Settings override: a positive whole number wins;
 * anything else (unset, blank, 0, negative, non-numeric) means "use the mode's
 * value" and returns `fallback`. There is intentionally no default for these keys
 * in `appConfigDefaults.json` — the mode preset in `auto-gen-config.ts` is the
 * source of the default, and the override only applies when explicitly set.
 */
export function resolvePositiveIntOverride(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function getAutoGenMode(): Promise<AutoGenMode> {
  return coerce(await getAppConfigValue(AUTO_GEN_MODE_KEY), Object.values(AutoGenMode), DEFAULT_AUTO_GEN_MODE);
}

async function getAutoGenModePreset(): Promise<AutoGenModePreset> {
  return AUTO_GEN_MODE_PRESETS[await getAutoGenMode()];
}

/**
 * Effective throughput = the selected mode's preset, with each value optionally
 * overridden by its own App Setting (`AUTOMATED_GENERATION_BATCH_SIZE` /
 * `..._FREQUENCY_MINUTES`). When an override is unset (the normal case) the mode's
 * value is used, so admins can tune the exact numbers at runtime or just pick a
 * mode. Shared by the stock and ETF jobs.
 */
export async function getAutoGenThroughput(): Promise<AutoGenModePreset> {
  const [preset, batchRaw, freqRaw] = await Promise.all([
    getAutoGenModePreset(),
    getAppConfigValue(AUTO_GEN_BATCH_SIZE_KEY),
    getAppConfigValue(AUTO_GEN_FREQUENCY_KEY),
  ]);
  return {
    batchSize: resolvePositiveIntOverride(batchRaw, preset.batchSize),
    minMinutesBetweenBatches: resolvePositiveIntOverride(freqRaw, preset.minMinutesBetweenBatches),
  };
}

export async function getAutoGenWindow(): Promise<AutoGenWindow> {
  return coerce(await getAppConfigValue(AUTO_GEN_WINDOW_KEY), Object.values(AutoGenWindow), DEFAULT_AUTO_GEN_WINDOW);
}

export async function getAutoGenEntity(): Promise<AutoGenEntity> {
  return coerce(await getAppConfigValue(AUTO_GEN_ENTITY_KEY), Object.values(AutoGenEntity), DEFAULT_AUTO_GEN_ENTITY);
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

/** 0-based day index since the weekly window opened (weekly reset − 7 days), clamped to the cap curve. */
export function weeklyDayIndex(now: Date, weeklyResetsAt: string | null, capCurveLength: number): number {
  const lastIndex = capCurveLength - 1;
  if (!weeklyResetsAt) return 0; // unknown reset → strictest cap
  const dayMs = 24 * 60 * 60 * 1000;
  const weekStart = new Date(weeklyResetsAt).getTime() - 7 * dayMs;
  const idx = Math.floor((now.getTime() - weekStart) / dayMs);
  return Math.min(Math.max(idx, 0), lastIndex);
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
 * Evaluates the shared Claude usage gates (5-hour limit + weekly day-curve cap).
 * These caps are the same for every mode — see `AUTO_GEN_USAGE_CAPS`. Does NOT
 * check the time-of-day window or the mode's throughput. Conservative: blocks when
 * usage is unknown.
 */
export function evaluateAutoGenGates(usage: ClaudeSubscriptionUsage, now: Date): AutoGenGateResult {
  const fiveHourPct = usage.fiveHour.utilizationPct;
  const weeklyPct = usage.weeklyAll.utilizationPct;
  const dayKey = WEEKLY_CAP_DAY_KEYS[weeklyDayIndex(now, usage.weeklyAll.resetsAt, WEEKLY_CAP_DAY_KEYS.length)];
  const weeklyCapPct = AUTO_GEN_USAGE_CAPS.weeklyCapByDayPct[dayKey];
  const base = { fiveHourPct, weeklyPct, weeklyCapPct };

  if (fiveHourPct === null) {
    return { allowed: false, reason: 'five-hour-usage-unknown', ...base };
  }
  if (fiveHourPct >= AUTO_GEN_USAGE_CAPS.maxFiveHourUtilizationPct) {
    return { allowed: false, reason: `five-hour-over-${AUTO_GEN_USAGE_CAPS.maxFiveHourUtilizationPct}`, ...base };
  }
  if (weeklyPct !== null && weeklyPct >= weeklyCapPct) {
    return { allowed: false, reason: `weekly-over-day-cap-${weeklyCapPct}`, ...base };
  }
  return { allowed: true, reason: 'ok', ...base };
}
