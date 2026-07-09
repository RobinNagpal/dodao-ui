/**
 * Tunable knobs for the Claude-usage-gated stock report auto-generation job.
 * Kept in one place so the numbers can be adjusted without touching logic.
 *
 * All hours are in America/New_York (ET). The off-hours window (10 PM–6 AM) is
 * enforced by the CRON SCHEDULE that hits the `enqueue-auto-stock-generation`
 * route — it is NOT re-checked in code. The remaining gates (5-hour limit,
 * 7 AM session cutoff, weekly day-curve) ARE checked per request in that route.
 */
export const CLAUDE_AUTO_GEN = {
  /**
   * Origin hour (ET) for the overnight "night scale" used by the session-end
   * check so it can compare times across midnight. Matches the intended cron
   * window start (10 PM). Not a runtime window check.
   */
  NIGHT_ORIGIN_HOUR_ET: 22,

  /** A 5-hour Claude session opened now must finish by this ET hour, else skip. */
  SESSION_MUST_END_BEFORE_HOUR_ET: 7, // 7 AM
  /** Length of a Claude usage session window, in hours. */
  SESSION_LENGTH_HOURS: 5,

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
