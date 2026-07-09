/**
 * Tunable knobs for the nightly Claude-usage-gated stock report auto-generation
 * job. Kept in one place so the numbers can be adjusted without touching logic.
 *
 * All hours are in America/New_York (ET). The pacing job runs off the existing
 * 3-minute stock-generation processor tick — see `auto-stock-generation-utils.ts`.
 */
export const CLAUDE_AUTO_GEN = {
  /** Auto-generation only runs when the ET hour is within [START, END). */
  WINDOW_START_HOUR_ET: 22, // 10 PM
  WINDOW_END_HOUR_ET: 6, // 6 AM

  /** A 5-hour Claude session opened now must finish by this ET hour, else skip. */
  SESSION_MUST_END_BEFORE_HOUR_ET: 7, // 7 AM
  /** Length of a Claude usage session window, in hours. */
  SESSION_LENGTH_HOURS: 5,

  /** How many auto requests to create per batch. A new batch is created ONLY when
   *  zero auto requests are open — we never top up a partial batch (keeps the
   *  concurrent Claude fan-out bounded to one draining batch). */
  BATCH_SIZE: 10,

  /** Skip a tick if the shared 5-hour session utilization is at/above this %. */
  MAX_5H_UTILIZATION_PCT: 90,

  /** Cumulative % of the weekly budget allowed by day-since-weekly-reset
   *  (index 0 = first day). Spreads spend across the week (+10%/day). */
  WEEKLY_CAP_BY_DAY_PCT: [15, 25, 35, 45, 55, 65, 75] as const,
} as const;
