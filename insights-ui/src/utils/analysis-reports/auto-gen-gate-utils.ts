import { AutoGenModePreset } from '@/utils/analysis-reports/auto-gen-modes';
import { ClaudeSubscriptionUsage } from '@/util/claude/claude-usage';

/**
 * Claude-usage gates shared by the stock and ETF nightly auto-generation jobs.
 *
 * These are report-type-agnostic: they only look at Claude subscription usage
 * (5-hour limit + weekly day-curve cap), never at the time of day — the run
 * window is enforced separately (see `isWithinAutoGenWindow`). The concrete
 * thresholds come from the selected mode's preset.
 */

/** 0-based day index since the weekly window opened (weekly reset − 7 days), clamped to the cap curve. */
export function weeklyDayIndex(now: Date, weeklyResetsAt: string | null, capCurveLength: number): number {
  const lastIndex = capCurveLength - 1;
  if (!weeklyResetsAt) return 0; // unknown reset → strictest cap
  const dayMs = 24 * 60 * 60 * 1000;
  const weekStart = new Date(weeklyResetsAt).getTime() - 7 * dayMs;
  const idx = Math.floor((now.getTime() - weekStart) / dayMs);
  return Math.min(Math.max(idx, 0), lastIndex);
}

export interface AutoGenGateResult {
  allowed: boolean;
  reason: string;
  fiveHourPct: number | null;
  weeklyPct: number | null;
  weeklyCapPct: number | null;
}

/**
 * Evaluates the Claude usage gates (5-hour limit + weekly day-curve cap) for the
 * given mode preset. Does NOT check the time-of-day window. Conservative: blocks
 * when usage is unknown.
 */
export function evaluateAutoGenGates(usage: ClaudeSubscriptionUsage, now: Date, preset: AutoGenModePreset): AutoGenGateResult {
  const fiveHourPct = usage.fiveHour.utilizationPct;
  const weeklyPct = usage.weeklyAll.utilizationPct;
  const weeklyCapPct = preset.weeklyCapByDayPct[weeklyDayIndex(now, usage.weeklyAll.resetsAt, preset.weeklyCapByDayPct.length)];
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

export interface AutoEnqueueResult {
  /** How many new auto requests were created this run. */
  created: number;
  /** Short explanation of the outcome / which gate blocked. */
  reason: string;
  fiveHourPct: number | null;
  weeklyPct: number | null;
}
