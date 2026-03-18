/**
 * Builds a Prisma where clause to filter by a specific date (YYYY-MM-DD).
 * Returns start-of-day to end-of-day range for the given date.
 * If no date is provided, returns empty object (no filter).
 */
export function buildDateWhereClause(date: string | null | undefined): { createdAt?: { gte: Date; lte: Date } } {
  if (!date) return {};

  const parsed = new Date(date + 'T00:00:00Z');
  if (isNaN(parsed.getTime())) return {};

  const startOfDay = new Date(parsed);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(parsed);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return {
    createdAt: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };
}
