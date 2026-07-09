/**
 * Tunable thresholds for Claude subscription usage gating. Kept in one place so
 * the numbers can be adjusted without touching logic.
 *
 * The nightly stock auto-generation pacing job (window hours, batch size,
 * weekly cap curve, etc.) will add its constants here too.
 */

/**
 * Hard ceiling for the pre-flight gate: block Claude report generation when any
 * relevant usage window is at or above this percent utilization. Set below 100
 * so we stop before Anthropic starts rejecting (which would waste a partial
 * report run).
 */
export const CLAUDE_USAGE_HARD_STOP_PCT = 95;
