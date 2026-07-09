import { ClaudeModel } from '@/types/llmConstants';

/**
 * Tunable knobs for the Claude-usage-gated stock report auto-generation job.
 * Kept in one place so the numbers can be adjusted without touching logic.
 *
 * The off-hours window (e.g. 10 PM–3 AM ET) is enforced by the CRON SCHEDULE that
 * hits the `enqueue-auto-stock-generation` route — it is NOT checked in code. The
 * gates below (5-hour limit + weekly day-curve) ARE checked per request.
 */
export const CLAUDE_AUTO_GEN = {
  /**
   * Claude model used for the auto-generated reports (this job only). Change it
   * here to switch models without touching the logic; value comes from the shared
   * ClaudeModel enum. The provider is always Claude (subscription OAuth path).
   */
  LLM_MODEL: ClaudeModel.CLAUDE_SONNET_4_6,

  /** How many requests to create per batch. A new batch is created ONLY when zero
   *  auto requests are open (we never top up a partial batch), keeping the
   *  concurrent Claude fan-out small. */
  BATCH_SIZE: 5,

  /** Skip if the shared 5-hour session utilization is at/above this %. */
  MAX_5H_UTILIZATION_PCT: 90,

  /** Cumulative % of the weekly budget allowed by day-since-weekly-reset
   *  (index 0 = first day, the reset day). Spreads spend across the week. */
  WEEKLY_CAP_BY_DAY_PCT: [20, 30, 40, 50, 60, 70, 80] as const,
} as const;
