import { TariffIndustries } from '@/scripts/industry-tariff-reports/tariff-industries';
import { inputRejectedMessage, matchesInputPattern } from '@/utils/route-param-utils';
import { notFoundError } from '@dodao/web-core/api/errors/notFoundError';
import { notFound } from 'next/navigation';

// Format checks for the tariff route/query params that reach the DB, S3, a fetch or an LLM. Every
// pattern below was checked against the real values (see each comment). Anything that doesn't match
// (template-injection / XSS / command-injection probes from scanners) is rejected BEFORE any work:
//   - API routes call `validate*` / `parse*`, which throw `notFoundError(inputRejectedMessage(...))`;
//     the error wrapper logs that as ONE warn line (no Discord) and answers 404.
//   - Pages / layouts call `rejectTariffPageParam(...)` (one console.warn + `notFound()`). Only the
//     shared layouts log; pages and `generateMetadata` short-circuit silently with the `is*` checks
//     so a rejected request still logs a single line.
// A well-formed value that doesn't exist (e.g. an unknown chapter slug) is NOT an input rejection: it
// still 404s through the normal lookup with an unprefixed message.

const SCOPE = 'tariffs';

// Lowercase alphanumeric words joined by single hyphens (e.g. `03-fish-and-crustaceans`).
// Matches all 98 `tariff_chapter_reports.slug` values.
const CHAPTER_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Legacy industry URL (`tariff_chapter_reports.oldUrl` / `TariffIndustryId`): camelCase or kebab-case
// alphanumerics (e.g. `ironandsteel`, `consumerElectronics`, `tires-and-rubber`). Matches all 41
// TariffIndustries definitions and all 41 non-null `oldUrl` values in the DB.
const INDUSTRY_ID_PATTERN = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

// HTS chapter number in a URL: 1-2 digits, zero-padded (`01`, as the /hts-codes pages request) or not
// (`1`). Real chapters are 1..99 (99 `tariff_chapters` rows).
const HTS_CHAPTER_NUMBER_PATTERN = /^\d{1,2}$/;

// HTS 10-digit statistical code, plain (`0306170040`, the stored `hts_codes.hts_code_10` format, all
// 19,856 rows) or dotted (`0306.17.00.40`, the printed HTSUS format).
const HTS10_PATTERN = /^\d{4}(?:\.?\d{2}){3}$/;

// `<heading>-<subheading>` index of the legacy evaluate-industry-areas URLs (e.g. `0-1`); industries
// have at most a handful of headings / sub-headings.
const HEADING_AND_SUBHEADING_INDEX_PATTERN = /^\d{1,2}-\d{1,2}$/;

// `q` of the HTS search is free text a person types, run as a parameterised DB query: any printable
// characters are fine (rejecting `$` or `<` would show a real user "Search failed"). Only control
// characters (and empty / over-long input, via matchesInputPattern) are rejected.
const HTS_SEARCH_QUERY_PATTERN = /^[^\p{Cc}]+$/u;

// `limit` query param of the HTS search: a small positive integer (clamped by the route).
const HTS_SEARCH_LIMIT_PATTERN = /^\d{1,3}$/;

const KNOWN_INDUSTRY_IDS: ReadonlySet<string> = new Set(Object.values(TariffIndustries).map((industry) => industry.industryId));

export function isValidTariffChapterSlug(value: string | null | undefined): value is string {
  return matchesInputPattern(value, CHAPTER_SLUG_PATTERN);
}

/** Well-formed AND one of the `TariffIndustries` legacy URLs (the set of industries is fixed in code). */
export function isValidTariffIndustryId(value: string | null | undefined): value is string {
  return matchesInputPattern(value, INDUSTRY_ID_PATTERN) && KNOWN_INDUSTRY_IDS.has(value);
}

export function isValidHeadingAndSubheadingIndex(value: string | null | undefined): value is string {
  return matchesInputPattern(value, HEADING_AND_SUBHEADING_INDEX_PATTERN);
}

// ---------- API routes: throw a prefixed 404 (the error wrapper logs it once as a warn) ----------

export function validateTariffChapterSlug(value: string | null | undefined): string {
  if (!isValidTariffChapterSlug(value)) throw notFoundError(inputRejectedMessage(SCOPE, 'chapterSlug', value));
  return value;
}

export function validateTariffIndustryId(value: string | null | undefined): string {
  if (!isValidTariffIndustryId(value)) throw notFoundError(inputRejectedMessage(SCOPE, 'industryId', value));
  return value;
}

/** Parses a `[number]` HTS chapter param (`01` or `1`) into 1..99. */
export function parseHtsChapterNumberParam(value: string | null | undefined): number {
  const n = matchesInputPattern(value, HTS_CHAPTER_NUMBER_PATTERN) ? parseInt(value, 10) : NaN;
  if (!(n >= 1 && n <= 99)) throw notFoundError(inputRejectedMessage(SCOPE, 'chapterNumber', value));
  return n;
}

/** Parses an `[hts10]` param (plain or dotted) into the stored 10-digit form. */
export function parseHts10Param(value: string | null | undefined): string {
  if (!matchesInputPattern(value, HTS10_PATTERN)) throw notFoundError(inputRejectedMessage(SCOPE, 'hts10', value));
  return value.replace(/\./g, '');
}

export function validateHtsSearchQuery(value: string): string {
  if (!matchesInputPattern(value, HTS_SEARCH_QUERY_PATTERN)) throw notFoundError(inputRejectedMessage(SCOPE, 'q', value));
  return value;
}

/** Parses the optional HTS search `limit`; `null` (absent) means "use the default". */
export function parseHtsSearchLimitParam(value: string | null): number | null {
  if (value === null) return null;
  if (!matchesInputPattern(value, HTS_SEARCH_LIMIT_PATTERN)) throw notFoundError(inputRejectedMessage(SCOPE, 'limit', value));
  return parseInt(value, 10);
}

// ---------- Pages / layouts ----------

/** Logs the rejected param once (as a warn) and renders the 404 page. */
export function rejectTariffPageParam(name: string, value: string | null | undefined): never {
  console.warn(inputRejectedMessage(SCOPE, name, value));
  notFound();
}
