import { CLAUDE_USAGE_HARD_STOP_PCT } from '@/util/claude/claude-usage-constants';
import { ClaudeSubscriptionUsage, ClaudeUsageWindow, getClaudeSubscriptionUsage } from '@/util/claude/claude-usage';

/**
 * Pre-flight check for the Claude **subscription** usage limit, so report
 * generation can fail fast with a clear message instead of erroring partway
 * through when the account's limit is nearly exhausted.
 *
 * Usage is read from Anthropic's OAuth usage endpoint (see
 * {@link getClaudeSubscriptionUsage}) — the same numeric data Claude Code's
 * `/usage` shows. We block when any relevant window (the shared 5-hour session,
 * the combined weekly, or the per-model weekly for the model we generate with)
 * is at/above {@link CLAUDE_USAGE_HARD_STOP_PCT}, or when Anthropic marks a
 * window's severity `rejected`. The read costs no message quota and its result
 * is cached briefly so the sequential section calls in one report run don't each
 * re-fetch.
 *
 * Fails **open**: if the usage endpoint can't be reached, generation proceeds
 * (the real generation call still surfaces a 429 as a last resort).
 */

/** How long a usage read is trusted before we fetch again. */
const USAGE_CACHE_TTL_MS = 30_000;

export interface ClaudeUsageLimitStatus {
  /** True when a relevant window is at/above the hard-stop threshold (or rejected). */
  exceeded: boolean;
  /** 5-hour session utilization (%), if known. */
  fiveHourPct: number | null;
  /** Combined weekly utilization (%), if known. */
  weeklyAllPct: number | null;
  /** Per-model weekly utilization (%) for the generation model, if the plan scopes it. */
  weeklyModelPct: number | null;
  /** Which window is the binding constraint (e.g. `five_hour` / `weekly_all` / `weekly_model`). */
  bindingWindow: string | null;
  /** Utilization (%) of the binding window. */
  bindingPct: number | null;
  /** When the binding window resets, if known. */
  resetsAt: string | null;
}

/** Thrown by {@link assertClaudeUsageLimitNotExceeded} when a limit window is exhausted. */
export class ClaudeUsageLimitExceededError extends Error {
  readonly bindingWindow: string | null;
  readonly bindingPct: number | null;
  readonly resetsAt: string | null;

  constructor(status: ClaudeUsageLimitStatus) {
    const where = status.bindingWindow ? ` (${status.bindingWindow} at ${status.bindingPct ?? '?'}%)` : '';
    const resetHint = status.resetsAt ? ` It resets at ${status.resetsAt}.` : '';
    super(`Claude subscription usage limit reached${where}; cannot generate reports right now.${resetHint}`);
    this.name = 'ClaudeUsageLimitExceededError';
    this.bindingWindow = status.bindingWindow;
    this.bindingPct = status.bindingPct;
    this.resetsAt = status.resetsAt;
  }
}

export interface CheckClaudeUsageLimitOptions {
  /** OAuth token override; defaults to `ANTHROPIC_OAUTH_TOKEN`. */
  oauthToken?: string;
  /**
   * Which per-model weekly window to also gate on. `opus` (default) matches the
   * model reports are generated with; pass `sonnet` when generating with Sonnet.
   */
  model?: 'opus' | 'sonnet';
  /** Skip the short-lived cache and always fetch fresh usage. */
  force?: boolean;
}

interface CandidateWindow {
  name: string;
  window: ClaudeUsageWindow | null;
}

let cached: { status: ClaudeUsageLimitStatus; expiresAt: number } | null = null;

/** Picks the per-model weekly window matching the model we generate with. */
function modelWeeklyWindow(usage: ClaudeSubscriptionUsage, model: 'opus' | 'sonnet'): ClaudeUsageWindow | null {
  return model === 'sonnet' ? usage.weeklySonnet : usage.weeklyOpus;
}

function evaluate(usage: ClaudeSubscriptionUsage, model: 'opus' | 'sonnet'): ClaudeUsageLimitStatus {
  const modelWeekly = modelWeeklyWindow(usage, model);
  const candidates: CandidateWindow[] = [
    { name: 'five_hour', window: usage.fiveHour },
    { name: 'weekly_all', window: usage.weeklyAll },
    { name: 'weekly_model', window: modelWeekly },
  ];

  // The binding constraint is the window with the highest utilization.
  let binding: { name: string; window: ClaudeUsageWindow } | null = null;
  for (const { name, window } of candidates) {
    if (!window || window.utilizationPct === null) continue;
    if (!binding || window.utilizationPct > (binding.window.utilizationPct ?? 0)) {
      binding = { name, window };
    }
  }

  const rejected = candidates.some(({ window }) => window?.severity === 'rejected');
  const overThreshold = binding !== null && (binding.window.utilizationPct ?? 0) >= CLAUDE_USAGE_HARD_STOP_PCT;

  return {
    exceeded: rejected || overThreshold,
    fiveHourPct: usage.fiveHour.utilizationPct,
    weeklyAllPct: usage.weeklyAll.utilizationPct,
    weeklyModelPct: modelWeekly?.utilizationPct ?? null,
    bindingWindow: binding?.name ?? null,
    bindingPct: binding?.window.utilizationPct ?? null,
    resetsAt: binding?.window.resetsAt ?? null,
  };
}

/**
 * Reports whether the Claude subscription usage limit is (near) exhausted.
 * Reads the OAuth usage endpoint; on any failure, logs and reports not-exceeded
 * (fail-open) so a usage-endpoint hiccup doesn't block generation.
 */
export async function checkClaudeUsageLimit(options: CheckClaudeUsageLimitOptions = {}): Promise<ClaudeUsageLimitStatus> {
  if (!options.force && cached && Date.now() < cached.expiresAt) {
    return cached.status;
  }

  try {
    const usage = await getClaudeSubscriptionUsage({ oauthToken: options.oauthToken });
    const status = evaluate(usage, options.model ?? 'opus');
    cached = { status, expiresAt: Date.now() + USAGE_CACHE_TTL_MS };
    return status;
  } catch (err) {
    console.warn('Could not read Claude subscription usage; proceeding without the limit check.', err);
    return {
      exceeded: false,
      fiveHourPct: null,
      weeklyAllPct: null,
      weeklyModelPct: null,
      bindingWindow: null,
      bindingPct: null,
      resetsAt: null,
    };
  }
}

/**
 * Throws {@link ClaudeUsageLimitExceededError} if the Claude subscription usage
 * limit is (near) exhausted. Call this before kicking off Claude report generation.
 */
export async function assertClaudeUsageLimitNotExceeded(options: CheckClaudeUsageLimitOptions = {}): Promise<void> {
  const status = await checkClaudeUsageLimit(options);
  if (status.exceeded) {
    throw new ClaudeUsageLimitExceededError(status);
  }
}
