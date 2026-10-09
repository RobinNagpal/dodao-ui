// SQL literal helpers for the generated, reviewed data SQL files (prisma/data-sql/**).
// Postgres runs with standard_conforming_strings=on, so only single quotes need escaping.

export function sqlText(value: string | null | undefined): string {
  if (value === null || value === undefined) return 'NULL';
  if (value.includes('\u0000')) throw new Error(`NUL byte in SQL value: ${JSON.stringify(value.slice(0, 80))}`);
  return `'${value.replace(/'/g, "''")}'`;
}

export function sqlTextArray(values: readonly string[]): string {
  return values.length === 0 ? 'ARRAY[]::text[]' : `ARRAY[${values.map((v) => sqlText(v)).join(', ')}]::text[]`;
}

export function sqlNumeric(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'NULL';
  if (!Number.isFinite(value)) throw new Error(`not a finite number: ${value}`);
  return String(value);
}

export function sqlJsonb(value: unknown): string {
  return `${sqlText(JSON.stringify(value))}::jsonb`;
}

/** ISO date ("2026-07-29") → DATE literal. */
export function sqlDate(value: string | null | undefined): string {
  if (value === null || value === undefined) return 'NULL';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`not an ISO date: ${value}`);
  return `DATE '${value}'`;
}

/** Splits rows into multi-row INSERT/VALUES statements of at most `size` rows. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Locale-independent ordering, so generated files are byte-identical on every machine. */
export function compareCodes(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
