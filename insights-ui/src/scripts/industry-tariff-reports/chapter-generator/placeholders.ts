// Placeholders the generator leaves for the writer agents. `pnpm tariff:validate-chapters` fails on any string that
// still contains "TODO", so a half-written chapter can't ship.

export const TODO = 'TODO';

/** "TODO: <what the writer must do>" — for fields where a hint helps. */
export function todo(hint: string): string {
  return `${TODO}: ${hint}`;
}

/** Counts strings containing "TODO" anywhere in a JSON value. */
export function countTodos(value: unknown): number {
  if (typeof value === 'string') return /\bTODO\b/.test(value) ? 1 : 0;
  if (Array.isArray(value)) return value.reduce((n: number, v) => n + countTodos(v), 0);
  if (value && typeof value === 'object') return Object.values(value).reduce((n: number, v) => n + countTodos(v), 0);
  return 0;
}
