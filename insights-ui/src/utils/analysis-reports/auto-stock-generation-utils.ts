import { prisma } from '@/prisma';
import { ClaudeModel, LLMProvider } from '@/types/llmConstants';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { CLAUDE_AUTO_GEN } from '@/util/claude/claude-usage-constants';
import { ClaudeSubscriptionUsage, getClaudeSubscriptionUsage } from '@/util/claude/claude-usage';
import { ALL_SECTIONS_REGENERATE_FLAGS, upsertGenerationRequest } from '@/utils/analysis-reports/generation-request-utils';
import { getOldestStocksOverall } from '@/utils/oldest-reports-utils';

/**
 * Claude-usage-gated stock report auto-generation (enqueue side).
 *
 * A dedicated cron hits the `enqueue-auto-stock-generation` route on a schedule
 * (e.g. every 15 min, 10 PM–6 AM ET). Each call checks the Claude usage gates and,
 * when they pass AND no auto requests are currently open, creates one small batch
 * of `BATCH_SIZE` requests for the oldest stocks. The existing ~3-min processor
 * then generates them normally — it needs no changes, because we only add a small
 * batch and only when the previous one is fully done.
 *
 * The off-hours window (10 PM–6 AM) is enforced by the CRON SCHEDULE, not here, so
 * these gates deliberately do NOT check the time-of-day window.
 */

/** Hour-of-day (0–23.99) in America/New_York, as a decimal for minute precision. */
function etHourDecimal(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0') % 24;
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return hour + minute / 60;
}

/**
 * Maps an ET hour onto a continuous "night" scale where the overnight origin
 * (NIGHT_ORIGIN_HOUR_ET, 22:00) is 22 and the following morning continues past 24
 * (so 07:00 next day is 31). Lets the session-end check compare across midnight
 * without fragile absolute-instant / DST math.
 */
function nightScaleHour(hourDecimal: number): number {
  return hourDecimal >= CLAUDE_AUTO_GEN.NIGHT_ORIGIN_HOUR_ET ? hourDecimal : hourDecimal + 24;
}

/**
 * True when the relevant 5-hour session finishes on/before the 7:00 AM ET cutoff.
 * Uses the active session's reset time if one is running, otherwise a fresh
 * session starting now (now + SESSION_LENGTH_HOURS). Effectively tapers auto-gen
 * off around 2:00 AM so a session never runs into the morning.
 */
export function sessionEndsBeforeCutoff(now: Date, fiveHourResetsAt: string | null): boolean {
  const cutoffNight = 24 + CLAUDE_AUTO_GEN.SESSION_MUST_END_BEFORE_HOUR_ET; // 07:00 next day
  const sessionActive = fiveHourResetsAt !== null && new Date(fiveHourResetsAt).getTime() > now.getTime();
  const endNight = sessionActive
    ? nightScaleHour(etHourDecimal(new Date(fiveHourResetsAt as string)))
    : nightScaleHour(etHourDecimal(now)) + CLAUDE_AUTO_GEN.SESSION_LENGTH_HOURS;
  return endNight <= cutoffNight;
}

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
 * Evaluates the Claude usage gates (5-hour limit, session-end cutoff, weekly
 * day-curve cap). Does NOT check the time-of-day window — the cron schedule owns
 * that. Conservative: blocks when usage is unknown.
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
  if (!sessionEndsBeforeCutoff(now, usage.fiveHour.resetsAt)) {
    return { allowed: false, reason: 'session-would-end-past-cutoff', ...base };
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

/**
 * Checks the Claude usage gates and, if they pass AND no auto requests are open,
 * creates one small batch (`BATCH_SIZE`) of generate-all Claude requests for the
 * oldest stocks. Called by the `enqueue-auto-stock-generation` route on a cron.
 * Never throws — on any failure it creates nothing (fails closed).
 */
export async function enqueueAutoStockGenerationBatch(spaceId: string): Promise<AutoEnqueueResult> {
  const now = new Date();
  try {
    const usage = await getClaudeSubscriptionUsage();
    const gate = evaluateAutoGenGates(usage, now);
    if (!gate.allowed) {
      return { created: 0, reason: gate.reason, fiveHourPct: gate.fiveHourPct, weeklyPct: gate.weeklyPct };
    }

    // Create a fresh batch ONLY when no auto requests are open (never top up a
    // partial batch) — this bounds the concurrent Claude fan-out.
    const openAutoCount = await prisma.tickerV1GenerationRequest.count({
      where: {
        spaceId,
        autoGenerated: true,
        status: { in: [GenerationRequestStatus.NotStarted, GenerationRequestStatus.InProgress] },
      },
    });

    if (openAutoCount > 0) {
      return { created: 0, reason: 'batch-in-progress', fiveHourPct: gate.fiveHourPct, weeklyPct: gate.weeklyPct };
    }

    const oldest = await getOldestStocksOverall(spaceId, CLAUDE_AUTO_GEN.BATCH_SIZE);
    let created = 0;
    for (const stock of oldest) {
      await upsertGenerationRequest({
        tickerId: stock.tickerId,
        flags: ALL_SECTIONS_REGENERATE_FLAGS,
        llmProvider: LLMProvider.CLAUDE,
        llmModel: ClaudeModel.CLAUDE_OPUS_4_7,
        autoGenerated: true,
      });
      created++;
    }

    return { created, reason: 'enqueued-batch', fiveHourPct: gate.fiveHourPct, weeklyPct: gate.weeklyPct };
  } catch (err) {
    console.warn('enqueueAutoStockGenerationBatch failed; created nothing this run.', err);
    return { created: 0, reason: 'error', fiveHourPct: null, weeklyPct: null };
  }
}
