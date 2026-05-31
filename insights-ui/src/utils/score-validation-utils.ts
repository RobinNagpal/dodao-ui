/** Inclusive upper bound for an ETF score (four category scores of 0-5 each). */
export const ETF_MAX_SCORE = 20;

/** Inclusive upper bound for a stock score (five category scores of 0-5 each). */
export const STOCK_MAX_SCORE = 25;

/**
 * Validate a user-supplied score before persisting it.
 *
 * The UI constrains the input, but the API must not trust the client: a raw
 * POST/PUT can carry any number. Returns the score unchanged when it is a
 * finite value within [0, max], passes through `null`/`undefined` (meaning
 * "clear" / "leave unchanged"), and throws otherwise.
 */
export function validateScore(score: number | null | undefined, max: number): number | null | undefined {
  if (score === null || score === undefined) {
    return score;
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > max) {
    throw new Error(`Score must be a number between 0 and ${max}`);
  }
  return score;
}
