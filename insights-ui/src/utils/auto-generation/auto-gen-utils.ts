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

/** Returns `value` if it's one of `allowed`, otherwise `fallback`. */
function coerce<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return value !== undefined && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export async function getAutoGenMode(): Promise<AutoGenMode> {
  return coerce(await getAppConfigValue(AUTO_GEN_MODE_KEY), Object.values(AutoGenMode), DEFAULT_AUTO_GEN_MODE);
}

export async function getAutoGenModePreset(): Promise<AutoGenModePreset> {
  return AUTO_GEN_MODE_PRESETS[await getAutoGenMode()];
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
 * Evaluates the Claude usage gates (5-hour limit + weekly day-curve cap) for the
 * given mode preset. Does NOT check the time-of-day window. Conservative: blocks
 * when usage is unknown.
 */
export function evaluateAutoGenGates(usage: ClaudeSubscriptionUsage, now: Date, preset: AutoGenModePreset): AutoGenGateResult {
  const fiveHourPct = usage.fiveHour.utilizationPct;
  const weeklyPct = usage.weeklyAll.utilizationPct;
  const dayKey = WEEKLY_CAP_DAY_KEYS[weeklyDayIndex(now, usage.weeklyAll.resetsAt, WEEKLY_CAP_DAY_KEYS.length)];
  const weeklyCapPct = preset.weeklyCapByDayPct[dayKey];
  const base = { fiveHourPct, weeklyPct, weeklyCapPct };

  if (fiveHourPct === null) {
    return { allowed: false, reason: 'five-hour-usage-unknown', ...base };
  }
  if (fiveHourPct >= preset.maxFiveHourUtilizationPct) {
    return { allowed: false, reason: `five-hour-over-${preset.maxFiveHourUtilizationPct}`, ...base };
  }
  if (weeklyPct !== null && weeklyPct >= weeklyCapPct) {
    return { allowed: false, reason: `weekly-over-day-cap-${weeklyCapPct}`, ...base };
  }
  return { allowed: true, reason: 'ok', ...base };
}
