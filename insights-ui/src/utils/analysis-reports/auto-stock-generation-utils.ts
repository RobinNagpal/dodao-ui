import { prisma } from '@/prisma';
import { ClaudeModel, LLMProvider } from '@/types/llmConstants';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { CLAUDE_AUTO_GEN } from '@/util/claude/claude-usage-constants';
import { ClaudeSubscriptionUsage, getClaudeSubscriptionUsage } from '@/util/claude/claude-usage';
import { ALL_SECTIONS_REGENERATE_FLAGS, upsertGenerationRequest } from '@/utils/analysis-reports/generation-request-utils';
import { getOldestStocksOverall } from '@/utils/oldest-reports-utils';

/**
 * Nightly Claude-usage-gated stock report auto-generation.
 *
 * This does NOT run its own cron. It hooks into the existing stock-generation
 * processor tick (`generate-ticker-v1-request`, already fired every ~3 min).
 * On each tick, if we're inside the off-hours window and under budget, it keeps
 * a single batch of `BATCH_SIZE` auto requests flowing: a fresh batch is created
 * ONLY when zero auto requests are open (we never top up a partial batch, to
 * keep the concurrent Claude fan-out bounded). The processor then drains them;
 * when a gate fails it simply skips auto requests until a later tick.
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

/** True when the ET hour is within the [START, END) overnight window (wraps midnight). */
export function isWithinGenerationWindow(now: Date): boolean {
  const h = etHourDecimal(now);
  return h >= CLAUDE_AUTO_GEN.WINDOW_START_HOUR_ET || h < CLAUDE_AUTO_GEN.WINDOW_END_HOUR_ET;
}

/**
 * Maps an ET hour onto a continuous "night" scale where the window start (22:00)
 * is the origin, so the overnight span 22:00 → next-day 07:00 is monotonic
 * (22..31). Avoids fragile absolute-instant / DST math.
 */
function nightScaleHour(hourDecimal: number): number {
  return hourDecimal >= CLAUDE_AUTO_GEN.WINDOW_START_HOUR_ET ? hourDecimal : hourDecimal + 24;
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

/** Evaluates the off-hours pacing gates against current usage. Conservative (blocks) on unknown usage. */
export function evaluateAutoGenGates(usage: ClaudeSubscriptionUsage, now: Date): AutoGenGateResult {
  const fiveHourPct = usage.fiveHour.utilizationPct;
  const weeklyPct = usage.weeklyAll.utilizationPct;
  const weeklyCapPct = CLAUDE_AUTO_GEN.WEEKLY_CAP_BY_DAY_PCT[weeklyDayIndex(now, usage.weeklyAll.resetsAt)];
  const base = { fiveHourPct, weeklyPct, weeklyCapPct };

  if (!isWithinGenerationWindow(now)) {
    return { allowed: false, reason: 'outside-window', ...base };
  }
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

export interface AutoTickResult {
  /** Whether the processor may process auto requests on this tick. */
  autoAllowed: boolean;
  /** How many new auto requests were created this tick (0 unless a fresh batch started). */
  created: number;
  reason: string;
  fiveHourPct: number | null;
  weeklyPct: number | null;
}

const BLOCKED = (reason: string, fiveHourPct: number | null = null, weeklyPct: number | null = null): AutoTickResult => ({
  autoAllowed: false,
  created: 0,
  reason,
  fiveHourPct,
  weeklyPct,
});

/**
 * One auto-generation tick, called at the top of the stock-generation processor.
 * Enqueues a fresh batch when none is open and the gates pass, and reports
 * whether auto requests may be processed this tick. Never throws — on any
 * failure it fails closed (auto not allowed) so admin generation is unaffected.
 */
export async function runAutoStockGenerationTick(spaceId: string): Promise<AutoTickResult> {
  const now = new Date();
  try {
    if (!isWithinGenerationWindow(now)) {
      return BLOCKED('outside-window');
    }

    const usage = await getClaudeSubscriptionUsage();
    const gate = evaluateAutoGenGates(usage, now);
    if (!gate.allowed) {
      return BLOCKED(gate.reason, gate.fiveHourPct, gate.weeklyPct);
    }

    // Gates pass → auto processing is allowed this tick. Create a fresh batch
    // ONLY when no auto requests are open (never top up a partial batch).
    const openAutoCount = await prisma.tickerV1GenerationRequest.count({
      where: {
        spaceId,
        autoGenerated: true,
        status: { in: [GenerationRequestStatus.NotStarted, GenerationRequestStatus.InProgress] },
      },
    });

    let created = 0;
    if (openAutoCount === 0) {
      const oldest = await getOldestStocksOverall(spaceId, CLAUDE_AUTO_GEN.BATCH_SIZE);
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
    }

    return {
      autoAllowed: true,
      created,
      reason: openAutoCount === 0 ? 'enqueued-batch' : 'batch-in-progress',
      fiveHourPct: gate.fiveHourPct,
      weeklyPct: gate.weeklyPct,
    };
  } catch (err) {
    console.warn('runAutoStockGenerationTick failed; skipping auto generation this tick.', err);
    return BLOCKED('error');
  }
}
