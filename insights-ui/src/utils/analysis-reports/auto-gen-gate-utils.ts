import { CLAUDE_AUTO_GEN } from '@/util/claude/claude-usage-constants';
import { ClaudeSubscriptionUsage } from '@/util/claude/claude-usage';

/**
 * Claude-usage gates shared by the stock and ETF nightly auto-generation jobs.
 *
 * These are report-type-agnostic: they only look at Claude subscription usage
 * (5-hour limit + weekly day-curve cap), never at the time of day — the off-hours
 * window is enforced entirely by each job's cron schedule.
 */

/** 0-based day index since the weekly window opened (weekly reset − 7 days), clamped to the cap curve. */
export function weeklyDayIndex(now: Date, weeklyResetsAt: string | null): number {
  const lastIndex = CLAUDE_AUTO_GEN.WEEKLY_CAP_BY_DAY_PCT.length - 1;
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
 * Evaluates the Claude usage gates (5-hour limit + weekly day-curve cap). Does
 * NOT check the time-of-day window — the cron schedule owns that. Conservative:
 * blocks when usage is unknown.
 */
export function evaluateAutoGenGates(usage: ClaudeSubscriptionUsage, now: Date): AutoGenGateResult {
  const fiveHourPct = usage.fiveHour.utilizationPct;
  const weeklyPct = usage.weeklyAll.utilizationPct;
  const weeklyCapPct = CLAUDE_AUTO_GEN.WEEKLY_CAP_BY_DAY_PCT[weeklyDayIndex(now, usage.weeklyAll.resetsAt)];
  const base = { fiveHourPct, weeklyPct, weeklyCapPct };

  if (fiveHourPct === null) {
    return { allowed: false, reason: 'five-hour-usage-unknown', ...base };
  }
  if (fiveHourPct >= CLAUDE_AUTO_GEN.MAX_5H_UTILIZATION_PCT) {
    return { allowed: false, reason: `five-hour-over-${CLAUDE_AUTO_GEN.MAX_5H_UTILIZATION_PCT}`, ...base };
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
