import { badRequestError } from '@dodao/web-core/api/errors/badRequestError';

/** Highest `page` a listing route accepts. Far beyond any real listing; larger values are bot noise. */
export const MAX_PAGE_PARAM = 100_000;

/** Default upper bound for page-size style params (`pageSize`, `limit`). Larger values are clamped. */
export const DEFAULT_MAX_PAGE_SIZE = 200;

type ReadableSearchParams = { get(name: string): string | null };

/** A plain decimal number, optionally signed (`5`, `-1`, `1.5`, `.5`, `1.`). No exponents, no junk. */
const NUMERIC_PARAM_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;

/**
 * Reads a numeric query param and truncates it to an integer. Missing or blank → undefined.
 * Values that look like a number (`-1`, `1.5`, `0`, a 400-digit run) are returned as-is (possibly
 * negative or Infinity) so callers can clamp them. Anything else (e.g. `abc`, `JJJ2QQQ`, `1e3`) is not
 * a slip a real user makes, so it throws a BadRequestError (→ 400) and never reaches Prisma as NaN.
 */
function readNumericParam(raw: string | null | undefined, name: string): number | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  if (!NUMERIC_PARAM_RE.test(value)) {
    throw badRequestError(`Invalid '${name}' query param: expected a number`);
  }
  return Math.trunc(Number(value));
}

/**
 * 1-based `page` param. Missing, `0`, negative or fractional values clamp to an integer ≥ 1 (as
 * before). Non-numeric junk, or a page beyond {@link MAX_PAGE_PARAM}, → 400.
 */
export function parsePageParam(searchParams: ReadableSearchParams, name: string = 'page'): number {
  const value = readNumericParam(searchParams.get(name), name);
  if (value === undefined) return 1;
  if (value > MAX_PAGE_PARAM) {
    throw badRequestError(`Invalid '${name}' query param: must be at most ${MAX_PAGE_PARAM}`);
  }
  return Math.max(1, value);
}

/**
 * Limit-style param (`limit`, `pageSize`, …) from its raw string. Missing → `default`; numeric values
 * are clamped to [1, max]; non-numeric junk → 400.
 */
export function parseLimitParam(raw: string | null | undefined, options: { default: number; max?: number; name?: string }): number {
  const max = options.max ?? DEFAULT_MAX_PAGE_SIZE;
  const value = readNumericParam(raw, options.name ?? 'limit');
  if (value === undefined) return Math.min(max, Math.max(1, options.default));
  return Math.min(max, Math.max(1, value));
}

/**
 * Page-size param (`pageSize`, `limit`, …). Missing → `defaultValue`; numeric values are clamped to
 * [1, maxValue] (as before); non-numeric junk → 400.
 */
export function parsePageSizeParam(searchParams: ReadableSearchParams, name: string, defaultValue: number, maxValue: number = DEFAULT_MAX_PAGE_SIZE): number {
  return parseLimitParam(searchParams.get(name), { default: defaultValue, max: maxValue, name });
}

/**
 * Offset-style param (`skip`). Missing → `defaultValue`; numeric values are clamped to ≥ 0 (and to
 * `maxValue` when given); non-numeric junk → 400.
 */
export function parseSkipParam(searchParams: ReadableSearchParams, name: string, defaultValue: number = 0, maxValue: number = Number.MAX_SAFE_INTEGER): number {
  const value = readNumericParam(searchParams.get(name), name);
  if (value === undefined) return defaultValue;
  return Math.min(maxValue, Math.max(0, value));
}
