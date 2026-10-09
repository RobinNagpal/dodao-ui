// How loud a rate-matrix cell's value is, shared by the import (rates by country) and export
// (markets) matrices: quiet when every rate is just "Free", loud when any rate holds a large
// percentage a reader should spot.

/** A rate at or above this percentage is drawn in amber; the matrices' legends quote it. */
export const HIGH_RATE_PCT = 25;

export function rateEmphasis(rates: string[]): 'quiet' | 'normal' | 'high' {
  if (rates.every((r) => r === 'Free' || r.startsWith('Free ('))) return 'quiet';
  const pcts = rates.flatMap((r) => Array.from(r.matchAll(/([\d.]+)%/g), (m) => parseFloat(m[1])));
  return pcts.some((p) => p >= HIGH_RATE_PCT) ? 'high' : 'normal';
}
