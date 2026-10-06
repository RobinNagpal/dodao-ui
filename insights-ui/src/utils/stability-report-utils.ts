/**
 * Formatting helpers shared by the stability report surfaces (the summary card
 * on the main stock page, the scenario cards, and the detail page header) so
 * every one of them prints a drop and a price date the same way.
 */

/** `-15.0%`, or `+2.0%` when the value is expected to rise instead of fall. */
export function formatDrop(dropPercent: number): string {
  return dropPercent >= 0 ? `-${dropPercent.toFixed(1)}%` : `+${Math.abs(dropPercent).toFixed(1)}%`;
}

/** `September 2, 2026` for the price the expected prices were computed from. */
export function formatPriceAsOf(priceAsOf: string | Date | null | undefined): string | null {
  if (!priceAsOf) return null;
  const date = new Date(priceAsOf);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
