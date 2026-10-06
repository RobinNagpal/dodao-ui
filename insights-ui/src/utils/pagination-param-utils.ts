import { badRequestError } from '@dodao/web-core/api/errors/badRequestError';

/** Highest `page` a listing route accepts. Far beyond any real listing; larger values are bot noise. */
export const MAX_PAGE_PARAM = 100_000;

/** Default upper bound for page-size style params (`pageSize`, `limit`). Larger values are clamped. */
export const DEFAULT_MAX_PAGE_SIZE = 200;

type ReadableSearchParams = { get(name: string): string | null };

/**
 * Reads a non-negative integer query param. Missing or blank → `defaultValue`.
 * Anything that is not a plain run of digits (e.g. `abc`, `-1`, `1.5`, `1e3`) or that exceeds
 * `maxAllowed` throws a BadRequestError (→ 400), so the value never reaches Prisma as NaN.
 */
function parseNonNegativeIntParam(searchParams: ReadableSearchParams, name: string, defaultValue: number, maxAllowed: number): number {
  const raw = searchParams.get(name)?.trim();
  if (!raw) return defaultValue;
  if (!/^\d+$/.test(raw)) {
    throw badRequestError(`Invalid '${name}' query param: expected a non-negative integer`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value > maxAllowed) {
    throw badRequestError(`Invalid '${name}' query param: must be at most ${maxAllowed}`);
  }
  return value;
}

/** 1-based `page` param. Missing → 1, `0` → 1 (as before), invalid or absurd → 400. */
export function parsePageParam(searchParams: ReadableSearchParams, name: string = 'page'): number {
  return Math.max(1, parseNonNegativeIntParam(searchParams, name, 1, MAX_PAGE_PARAM));
}

/**
 * Page-size param (`pageSize`, `limit`, …). Missing → `defaultValue`; valid values are clamped to
 * [1, maxValue] (as before); non-numeric or negative → 400.
 */
export function parsePageSizeParam(searchParams: ReadableSearchParams, name: string, defaultValue: number, maxValue: number = DEFAULT_MAX_PAGE_SIZE): number {
  const value = parseNonNegativeIntParam(searchParams, name, defaultValue, Number.MAX_SAFE_INTEGER);
  return Math.min(maxValue, Math.max(1, value));
}
