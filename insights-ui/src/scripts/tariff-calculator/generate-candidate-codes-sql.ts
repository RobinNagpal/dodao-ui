// Chapter-driven SQL generator for the tariff calculator candidate-codes feed.
//
// Given an HTSUS chapter number (e.g. `--chapter 22`), this:
//   1. Reads every `hts_codes` row in that chapter that has a 10-digit code.
//   2. Calls the upstream candidate-codes API for each one (in parallel).
//   3. Deduplicates the candidates by (code, variant) — the upstream returns
//      the same SPECIAL_CODE blanket set for almost every HTS line in a
//      chapter, so emitting it once per HTS would inflate the SQL ~Nx.
//   4. Emits a self-contained SQL transcript with two parts:
//        a) one DO-block per UNIQUE candidate, which short-circuits if the
//           candidate already exists in the DB (skip-if-exists semantics);
//        b) one bulk INSERT ... SELECT for the entire HTS↔candidate fanout
//           (`hts_code_candidate_codes`), using IS NOT DISTINCT FROM so the
//           NULL-variant case joins correctly.
//
// Why "skip-if-exists" instead of upsert: this script is the bulk seeding
// path. Once a SPECIAL_CODE row is in the DB, the runtime admin POST in
// `/api/tariff-calculator/candidate-codes/[hts10]` is the path used to
// refresh a specific HTS line. The script avoids overwriting existing
// candidates so re-runs are near-instant and don't churn child rows for
// data that hasn't changed.
//
// Usage:
//   yarn tariffs:gen-candidate-codes-sql --chapter 22
//   yarn tariffs:gen-candidate-codes-sql --chapter 9 --limit 5      # quick test
//   yarn tariffs:gen-candidate-codes-sql --chapter 1 --concurrency 4
//   yarn tariffs:gen-candidate-codes-sql --chapter 22 --out custom.sql
//   yarn tariffs:gen-candidate-codes-sql --chapter 22 --stdout      # pipe instead
//   yarn tariffs:gen-candidate-codes-sql --chapter 4  --cache-dir ./cache/tariffs
//   yarn tariffs:gen-candidate-codes-sql --chapter 4  --no-cache    # force re-fetch
//   yarn tariffs:gen-candidate-codes-sql --chapter 4  --via-lambda  # route through AWS lambda
//
// By default the SQL is written to
// `generated-sql/tariff-candidate-codes-chapter-<N>.sql` (relative to cwd).
// Pass `--out <path>` to override, or `--stdout` to dump to stdout. Stats
// and progress always go to stderr.
//
// Per-HTS responses are cached to disk by default at
// `.cache/tariff-candidate-codes/<hts10>.json` (relative to cwd). The cache
// turns the upstream into a resumable feed: when the daily IP quota gets
// exhausted mid-chapter, you can re-run the same command after the quota
// resets and only the still-missing codes get fetched. Failures are NEVER
// cached — only successful payloads. To force a full re-fetch, pass
// `--no-cache` or just delete the cache directory.
//
// Lambda fan-out (--via-lambda): the upstream rate-limits per source IP, so a
// single workstation gets blocked after ~2 chapters. Pass --via-lambda to
// route every fetch through the `tariff-candidate-codes` Lambda
// (lambdas/tariff-candidate-codes/), whose URL is read from the env var
// `TARIFF_CANDIDATE_CODES_LAMBDA_URL`. Each concurrent invocation lands on a
// fresh Lambda execution environment with its own AWS egress IP, so the
// per-IP quota effectively scales with our concurrency. Default concurrency
// is bumped to 25 in this mode (override with --concurrency).

import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import {
  fetchCandidateCodes,
  isKnownApplicabilityCondition,
  mapApplicabilityKind,
  mapCodeType,
  mapCountryScope,
  RELATED_KIND_BY_FIELD,
  UpstreamCandidateCode,
} from '@/utils/tariff-calculator/upstream-feed';

interface CliArgs {
  chapter: number;
  out: string | null;
  stdout: boolean;
  limit: number | null;
  delayMs: number;
  concurrency: number;
  cacheDir: string | null;
  viaLambda: boolean;
  lambdaUrl: string | null;
}

function parseArgs(argv: string[]): CliArgs {
  const flags = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      flags.set(key, 'true');
    } else {
      flags.set(key, next);
      i++;
    }
  }

  const chapterRaw = flags.get('chapter');
  if (!chapterRaw) {
    throw new Error('Missing required flag: --chapter <number>');
  }
  const chapter = Number.parseInt(chapterRaw, 10);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 99) {
    throw new Error(`--chapter must be an integer in 1..99 (got "${chapterRaw}")`);
  }

  const out = flags.get('out') ?? null;
  const stdout = flags.get('stdout') === 'true';
  if (out && stdout) {
    throw new Error('Pass either --out <path> or --stdout, not both.');
  }
  const limitRaw = flags.get('limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : null;
  if (limitRaw && (!Number.isInteger(limit) || limit! < 1)) {
    throw new Error(`--limit must be a positive integer (got "${limitRaw}")`);
  }
  const delayRaw = flags.get('delay-ms');
  const delayMs = delayRaw ? Number.parseInt(delayRaw, 10) : 0;
  if (!Number.isInteger(delayMs) || delayMs < 0) {
    throw new Error(`--delay-ms must be a non-negative integer (got "${delayRaw}")`);
  }
  // Lambda fan-out: when enabled, every upstream fetch goes through the
  // `tariff-candidate-codes` Lambda for IP rotation. URL must come from env so
  // it isn't checked into shell history; the local .env.example ships with
  // an empty placeholder.
  const viaLambda = flags.get('via-lambda') === 'true';
  const lambdaUrlRaw = process.env.TARIFF_CANDIDATE_CODES_LAMBDA_URL?.trim() ?? '';
  const lambdaUrl = lambdaUrlRaw.length > 0 ? lambdaUrlRaw : null;
  if (viaLambda && !lambdaUrl) {
    throw new Error(
      '--via-lambda requires TARIFF_CANDIDATE_CODES_LAMBDA_URL to be set in the environment ' +
        '(see insights-ui/.env.example). Deploy lambdas/tariff-candidate-codes and paste the API GW URL.'
    );
  }

  // Default concurrency: 6 for direct fetch (be polite to upstream), 25 for
  // lambda fan-out (each concurrent invocation gets its own egress IP, which
  // is the whole point of routing through Lambda).
  const concurrencyRaw = flags.get('concurrency');
  const defaultConcurrency = viaLambda ? 25 : 6;
  const concurrency = concurrencyRaw ? Number.parseInt(concurrencyRaw, 10) : defaultConcurrency;
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 32) {
    throw new Error(`--concurrency must be an integer in 1..32 (got "${concurrencyRaw}")`);
  }

  // Cache: default-on at .cache/tariff-candidate-codes; --no-cache disables;
  // --cache-dir overrides path. We deliberately default-on because re-runs
  // after a quota-exhaustion 429 are the script's primary failure mode.
  const noCache = flags.get('no-cache') === 'true';
  const cacheDirRaw = flags.get('cache-dir');
  if (noCache && cacheDirRaw) {
    throw new Error('Pass either --cache-dir <path> or --no-cache, not both.');
  }
  const cacheDir = noCache ? null : cacheDirRaw ?? path.join('.cache', 'tariff-candidate-codes');

  return { chapter, out, stdout, limit, delayMs, concurrency, cacheDir, viaLambda, lambdaUrl };
}

// ---------------------------------------------------------------------------
// SQL literal helpers
// ---------------------------------------------------------------------------

function sqlString(value: string | null | undefined): string {
  if (value === null || value === undefined) return 'NULL';
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlBool(value: boolean): string {
  return value ? 'TRUE' : 'FALSE';
}

function sqlInt(value: number): string {
  if (!Number.isInteger(value)) {
    throw new Error(`Expected integer, got ${value}`);
  }
  return value.toString();
}

// Decimal as a numeric literal — values arrive from the upstream API as
// finite numbers; reject anything else so we never emit `NaN` into SQL.
function sqlDecimal(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error(`Expected finite number, got ${value}`);
  }
  return value.toString();
}

function sqlTimestamp(value: Date): string {
  return `'${value.toISOString()}'::timestamp(3)`;
}

function sqlEnum(value: string, typeName: string): string {
  return `'${value}'::"${typeName}"`;
}

function sqlTextArray(values: readonly string[]): string {
  if (values.length === 0) return `'{}'::TEXT[]`;
  return `ARRAY[${values.map((v) => sqlString(v)).join(', ')}]::TEXT[]`;
}

function sqlJsonb(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function sqlVariantPredicate(variant: string | null): string {
  if (variant === null) return 'variant IS NULL';
  return `variant = ${sqlString(variant)}`;
}

// ---------------------------------------------------------------------------
// SQL block builder for a single (deduplicated) candidate code
// ---------------------------------------------------------------------------

function emitCandidateBlock(c: UpstreamCandidateCode): string {
  const lines: string[] = [];
  const code = c.codeVariant.code;
  const variant = c.codeVariant.variant;
  const scope = mapCountryScope(c.countryScope);
  const space = sqlString(KoalaGainsSpaceId);

  lines.push(`-- Candidate ${code}${variant ? `:${variant}` : ''} (${c.type})`);
  lines.push(`DO $$`);
  lines.push(`DECLARE`);
  // Primary keys on these tables are TEXT (Prisma `String @id @default(uuid())`
  // maps to TEXT, not native UUID). Declaring TEXT keeps `id = v_*` comparisons
  // sane — a UUID-typed local would fail with `operator does not exist: text = uuid`.
  lines.push(`  v_id TEXT;`);
  lines.push(`BEGIN`);
  lines.push(`  SELECT id INTO v_id`);
  lines.push(`  FROM tariff_candidate_codes`);
  lines.push(`  WHERE space_id = ${space}`);
  lines.push(`    AND code = ${sqlString(code)}`);
  lines.push(`    AND ${sqlVariantPredicate(variant)};`);
  lines.push(``);
  // Skip-if-exists: bulk seeding is one-shot per chapter. Refreshing an
  // existing candidate is the runtime admin POST's job.
  lines.push(`  IF v_id IS NOT NULL THEN`);
  lines.push(`    RETURN;`);
  lines.push(`  END IF;`);
  lines.push(``);

  lines.push(`  INSERT INTO tariff_candidate_codes (`);
  lines.push(`    id, space_id, code, variant, type, line_description, full_description,`);
  lines.push(`    effective_from, effective_to, rate_description,`);
  lines.push(`    rate_primary, rate_secondary, rate_other, rate_penalty, rate_computation_code,`);
  lines.push(`    units_of_measure, flags_for_anti_dumping, flags_for_countervailing,`);
  lines.push(`    priority, requires_user_choice, country_scope_type, country_scope_countries,`);
  lines.push(`    label, category, tags, pga_flags, fee_flags, parent_codes,`);
  lines.push(`    line_split_field, line_split_conditions, relates_to_codes_digits,`);
  lines.push(`    created_at, updated_at`);
  lines.push(`  ) VALUES (`);
  lines.push(`    gen_random_uuid()::text, ${space}, ${sqlString(code)}, ${sqlString(variant)},`);
  lines.push(`    ${sqlEnum(mapCodeType(c.type), 'TariffCandidateCodeType')},`);
  lines.push(`    ${sqlString(c.lineDescription)}, ${sqlString(c.fullDescription)},`);
  lines.push(`    ${sqlTimestamp(new Date(c.effectiveFrom))}, ${sqlTimestamp(new Date(c.effectiveTo))},`);
  lines.push(`    ${sqlString(c.rateDescription)},`);
  lines.push(`    ${sqlString(c.rateInfo.primaryRate)}, ${sqlString(c.rateInfo.secondaryRate)},`);
  lines.push(`    ${sqlString(c.rateInfo.otherRate)}, ${sqlString(c.rateInfo.penaltyRate)},`);
  lines.push(`    ${sqlString(c.rateInfo.computationCode)},`);
  lines.push(`    ${sqlTextArray(c.unitsOfMeasure)}, ${sqlBool(c.flagsForAntiDumping)}, ${sqlBool(c.flagsForCountervailing)},`);
  lines.push(`    ${sqlInt(c.priority)}, ${sqlBool(c.requiresUserChoice)},`);
  lines.push(`    ${sqlEnum(scope.type, 'TariffCountryScopeType')}, ${sqlTextArray(scope.countries)},`);
  lines.push(`    ${sqlString(c.label)}, ${sqlString(c.category)},`);
  lines.push(`    ${sqlTextArray(c.tags)}, ${sqlTextArray(c.pgaFlags)}, ${sqlTextArray(c.feeFlags)}, ${sqlTextArray(c.parentCodes)},`);
  lines.push(`    ${sqlString(c.lineSplitField)}, ${sqlJsonb(c.lineSplitConditions)}, ${sqlJsonb(c.relatesToCodesDigits)},`);
  lines.push(`    NOW(), NOW()`);
  lines.push(`  ) RETURNING id INTO v_id;`);
  lines.push(``);

  // specialRates — multi-row INSERT
  if (c.specialRates.length > 0) {
    lines.push(`  INSERT INTO tariff_candidate_special_rates (`);
    lines.push(`    id, space_id, candidate_code_id, spi, rate_description,`);
    lines.push(`    rate_primary, rate_secondary, rate_other, rate_penalty, rate_computation_code,`);
    lines.push(`    sort_order, created_at, updated_at`);
    lines.push(`  ) VALUES`);
    const rows = c.specialRates.map(
      (sr, i) =>
        `    (gen_random_uuid()::text, ${space}, v_id, ${sqlString(sr.spi)}, ${sqlString(sr.rateDescription)},` +
        ` ${sqlString(sr.rateInfo.primaryRate)}, ${sqlString(sr.rateInfo.secondaryRate)},` +
        ` ${sqlString(sr.rateInfo.otherRate)}, ${sqlString(sr.rateInfo.penaltyRate)},` +
        ` ${sqlString(sr.rateInfo.computationCode)}, ${sqlInt(i)}, NOW(), NOW())`
    );
    lines.push(rows.join(',\n') + ';');
    lines.push(``);
  }

  // applicabilityConditions — multi-row INSERT.
  // Filter to known __typename values: the upstream sometimes returns kinds
  // (e.g. CustomsTariffHasExistingHtsCodes, observed when fetching with
  // browser-shaped headers) that aren't in our `TariffApplicabilityConditionKind`
  // enum. Skipping them here is safer than failing the whole chapter — the
  // skipped count goes into a SQL comment so we can spot a regression and
  // extend the enum if a new kind starts showing up routinely.
  const knownConditions = c.applicabilityConditions.filter(isKnownApplicabilityCondition);
  const skippedConditions = c.applicabilityConditions.length - knownConditions.length;
  if (skippedConditions > 0) {
    const unknownTypes = Array.from(
      new Set(c.applicabilityConditions.filter((cond) => !isKnownApplicabilityCondition(cond)).map((cond) => cond.__typename))
    ).join(', ');
    lines.push(`  -- Skipped ${skippedConditions} applicabilityCondition(s) with unknown __typename: ${unknownTypes}`);
  }
  if (knownConditions.length > 0) {
    lines.push(`  INSERT INTO tariff_candidate_applicability_conditions (`);
    lines.push(`    id, space_id, candidate_code_id, kind, field_key,`);
    lines.push(`    field_should_equal, threshold, including_threshold, program_codes,`);
    lines.push(`    sort_order, created_at, updated_at`);
    lines.push(`  ) VALUES`);
    const rows = knownConditions.map((cond, i) => {
      const fieldShouldEqual = cond.__typename === 'CustomsTariffEquals' ? cond.fieldShouldEqual : null;
      const threshold = cond.__typename === 'CustomsTariffGreater' || cond.__typename === 'CustomsTariffLess' ? cond.threshold : null;
      const includingThreshold = cond.__typename === 'CustomsTariffGreater' || cond.__typename === 'CustomsTariffLess' ? cond.includingThreshold : null;
      const programCodes = cond.__typename === 'CustomsTariffSomeSpiApplied' ? cond.programCodes : [];
      return (
        `    (gen_random_uuid()::text, ${space}, v_id,` +
        ` ${sqlEnum(mapApplicabilityKind(cond.__typename), 'TariffApplicabilityConditionKind')},` +
        ` ${sqlString(cond.fieldKey)}, ${sqlString(fieldShouldEqual)},` +
        ` ${sqlString(threshold)}, ${includingThreshold === null ? 'NULL' : sqlBool(includingThreshold)},` +
        ` ${sqlTextArray(programCodes)}, ${sqlInt(i)}, NOW(), NOW())`
      );
    });
    lines.push(rows.join(',\n') + ';');
    lines.push(``);
  }

  // relatedCodes — three upstream fields collapsed into one table via `kind`
  const relatedRows: string[] = [];
  for (const fieldName of ['excludedByCodes', 'replacesCodes', 'relatedCodes'] as const) {
    const arr = c[fieldName];
    arr.forEach((r, i) => {
      relatedRows.push(
        `    (gen_random_uuid()::text, ${space}, v_id,` +
          ` ${sqlEnum(RELATED_KIND_BY_FIELD[fieldName], 'TariffRelatedCodeKind')},` +
          ` ${sqlString(r.code)}, ${sqlString(r.variant)}, ${sqlInt(i)}, NOW(), NOW())`
      );
    });
  }
  if (relatedRows.length > 0) {
    lines.push(`  INSERT INTO tariff_candidate_related_codes (`);
    lines.push(`    id, space_id, candidate_code_id, kind, code, variant,`);
    lines.push(`    sort_order, created_at, updated_at`);
    lines.push(`  ) VALUES`);
    lines.push(relatedRows.join(',\n') + ';');
    lines.push(``);
  }

  // tradeAnalytics + nested importPrograms. Mint TS-side UUIDs so we can
  // emit one multi-row INSERT for analytics and one for the children rather
  // than per-row RETURNING dance.
  if (c.tradeAnalytics.length > 0) {
    const taIds = c.tradeAnalytics.map(() => randomUUID());
    lines.push(`  INSERT INTO tariff_trade_analytics (`);
    lines.push(`    id, space_id, candidate_code_id, analytics_level, hts_code_10, date,`);
    lines.push(`    country_name, us_customs_country_code,`);
    lines.push(`    total_customs_value, total_calculated_duty, total_duty_rate,`);
    lines.push(`    created_at, updated_at`);
    lines.push(`  ) VALUES`);
    const taRows = c.tradeAnalytics.map(
      (ta, i) =>
        `    (${sqlString(taIds[i])}, ${space}, v_id,` +
        ` ${sqlString(ta.analyticsLevel)}, ${sqlString(ta.htsCode)}, ${sqlString(ta.date)},` +
        ` ${sqlString(ta.countryOfOrigin.countryName)}, ${sqlString(ta.countryOfOrigin.usCustomsCountryCode)},` +
        ` ${sqlDecimal(ta.totalCustomsValue)}, ${sqlDecimal(ta.totalCalculatedDuty)}, ${sqlDecimal(ta.totalDutyRate)},` +
        ` NOW(), NOW())`
    );
    lines.push(taRows.join(',\n') + ';');
    lines.push(``);

    const ipRows: string[] = [];
    c.tradeAnalytics.forEach((ta, i) => {
      const taId = taIds[i];
      for (const p of ta.importPrograms) {
        ipRows.push(
          `    (gen_random_uuid()::text, ${space}, ${sqlString(taId)},` +
            ` ${sqlString(p.importProgram.programName)}, ${sqlString(p.importProgram.programIndicator)},` +
            ` ${sqlString(p.importProgram.generalNote)},` +
            ` ${sqlString(p.importProgram.customsTariffSpi.specialProgramIndicator)},` +
            ` ${sqlString(p.importProgram.customsTariffSpi.agreementName)},` +
            ` ${sqlString(p.importProgram.customsTariffSpi.generalNote)},` +
            ` ${sqlBool(p.importProgram.customsTariffSpi.excludeMpf)},` +
            ` ${sqlTextArray(p.importProgram.countriesOfOrigin)},` +
            ` ${sqlTextArray(p.importProgram.customsTariffSpi.countriesOfOrigin)},` +
            ` ${sqlDecimal(p.customsValue)}, ${sqlDecimal(p.calculatedDuty)},` +
            ` ${sqlDecimal(p.dutyRate)}, ${sqlDecimal(p.percentOfLineValue)},` +
            ` NOW(), NOW())`
        );
      }
    });
    if (ipRows.length > 0) {
      lines.push(`  INSERT INTO tariff_trade_analytic_import_programs (`);
      lines.push(`    id, space_id, trade_analytic_id, program_name, program_indicator, general_note,`);
      lines.push(`    spi_special_program_indicator, spi_agreement_name, spi_general_note, spi_exclude_mpf,`);
      lines.push(`    countries_of_origin, spi_countries_of_origin,`);
      lines.push(`    customs_value, calculated_duty, duty_rate, percent_of_line_value,`);
      lines.push(`    created_at, updated_at`);
      lines.push(`  ) VALUES`);
      lines.push(ipRows.join(',\n') + ';');
    }
  }

  lines.push(`END $$;`);
  lines.push(``);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Bulk HTS↔candidate fanout — one statement per chunk of `LINK_CHUNK` rows.
// ---------------------------------------------------------------------------

interface LinkRow {
  hts10: string;
  code: string;
  variant: string | null;
}

const LINK_CHUNK = 1000;

function emitBulkJoinInserts(links: readonly LinkRow[], fetchedAt: Date): string {
  if (links.length === 0) return '-- No HTS↔candidate links to insert.\n';
  const space = sqlString(KoalaGainsSpaceId);
  const ts = sqlTimestamp(fetchedAt);
  const out: string[] = [];
  out.push(`-- Link HTS lines to candidate codes. Resolves IDs by joining on the natural`);
  out.push(`-- keys (space_id + hts_code_10) and (space_id + code + variant). The`);
  out.push(`-- ON CONFLICT clause makes re-runs touch only last_fetched_at / updated_at.`);
  for (let i = 0; i < links.length; i += LINK_CHUNK) {
    const chunk = links.slice(i, i + LINK_CHUNK);
    out.push(`INSERT INTO hts_code_candidate_codes (`);
    out.push(`  id, space_id, hts_code_id, candidate_code_id, last_fetched_at, created_at, updated_at`);
    out.push(`)`);
    out.push(`SELECT gen_random_uuid()::text, ${space}, h.id, c.id, ${ts}, NOW(), NOW()`);
    out.push(`FROM (VALUES`);
    const valueRows = chunk.map((l, idx) => {
      // Force column types on the very first row; later rows inherit text.
      if (i === 0 && idx === 0) {
        return `  (${sqlString(l.hts10)}::text, ${sqlString(l.code)}::text, ${sqlString(l.variant)}::text)`;
      }
      return `  (${sqlString(l.hts10)}, ${sqlString(l.code)}, ${sqlString(l.variant)})`;
    });
    out.push(valueRows.join(',\n'));
    out.push(`) AS pairs(hts10, code, variant)`);
    out.push(`JOIN hts_codes h ON h.space_id = ${space} AND h.hts_code_10 = pairs.hts10`);
    out.push(`JOIN tariff_candidate_codes c ON c.space_id = ${space} AND c.code = pairs.code AND c.variant IS NOT DISTINCT FROM pairs.variant`);
    out.push(`ON CONFLICT (space_id, hts_code_id, candidate_code_id) DO UPDATE`);
    out.push(`  SET last_fetched_at = EXCLUDED.last_fetched_at, updated_at = NOW();`);
    out.push(``);
  }
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// Node's global fetch throws `TypeError: fetch failed` for any transport
// error and stashes the real reason (DNS, TLS, ECONNRESET, proxy refusal,
// etc.) on `err.cause`. Walk the chain so the operator can actually see what
// went wrong instead of staring at "fetch failed".
function describeFetchError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const parts: string[] = [`${err.name}: ${err.message}`];
  let cause: unknown = err.cause;
  while (cause) {
    if (cause instanceof Error) {
      const code = (cause as Error & { code?: string }).code;
      parts.push(`cause: ${cause.name}: ${cause.message}${code ? ` [${code}]` : ''}`);
      cause = cause.cause;
    } else {
      parts.push(`cause: ${String(cause)}`);
      cause = undefined;
    }
  }
  return parts.join(' | ');
}

async function fetchWithRetry(hts10: string, maxAttempts: number): Promise<UpstreamCandidateCode[]> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchCandidateCodes(hts10);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isRateLimited = message.startsWith('RATE_LIMITED:') || message.includes('HTTP 429');
      const isTransient =
        message === 'fetch failed' ||
        message.includes('ECONNRESET') ||
        message.includes('ETIMEDOUT') ||
        message.includes('HTTP 502') ||
        message.includes('HTTP 503');
      const retryable = isRateLimited || isTransient;
      if (!retryable || attempt === maxAttempts) {
        throw err;
      }
      lastErr = err;
      // Rate-limit responses get long backoff (15s, 60s, 180s) — the upstream
      // quota usually resets on a daily window, so short retries are useless.
      // Transient network errors get the original short backoff.
      const backoffMs = isRateLimited ? [15_000, 60_000, 180_000][attempt - 1] ?? 180_000 : 500 * attempt;
      console.error(`    retrying ${hts10} (attempt ${attempt + 1}/${maxAttempts}) in ${backoffMs}ms — ${describeFetchError(err)}`);
      await sleep(backoffMs);
    }
  }
  throw lastErr;
}

// Disk cache: one JSON file per HTS10. Successful upstream payloads are
// cached so re-runs after a rate-limit can pick up where the previous run
// gave up. Failures are NEVER cached — a 429/quota-exhausted error must be
// re-attempted on the next run, not memoized as "no candidates".
async function loadFromCache(cacheDir: string, hts10: string): Promise<UpstreamCandidateCode[] | null> {
  const cachePath = path.join(cacheDir, `${hts10}.json`);
  try {
    const raw = await readFile(cachePath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as UpstreamCandidateCode[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

async function saveToCache(cacheDir: string, hts10: string, data: UpstreamCandidateCode[]): Promise<void> {
  const cachePath = path.join(cacheDir, `${hts10}.json`);
  await writeFile(cachePath, JSON.stringify(data), 'utf-8');
}

interface FetchOutcome {
  data: UpstreamCandidateCode[];
  fromCache: boolean;
}

async function fetchHts(hts10: string, cacheDir: string | null, maxAttempts: number): Promise<FetchOutcome> {
  if (cacheDir) {
    const cached = await loadFromCache(cacheDir, hts10);
    if (cached) return { data: cached, fromCache: true };
  }
  const data = await fetchWithRetry(hts10, maxAttempts);
  if (cacheDir) await saveToCache(cacheDir, hts10, data);
  return { data, fromCache: false };
}

// Bounded-parallel runner — workers pull from a shared cursor.
async function runWithConcurrency<T>(items: readonly T[], limit: number, fn: (item: T, index: number) => Promise<void>): Promise<void> {
  let cursor = 0;
  const workerCount = Math.min(limit, items.length);
  const workers: Promise<void>[] = [];
  for (let w = 0; w < workerCount; w++) {
    workers.push(
      (async () => {
        while (true) {
          const i = cursor++;
          if (i >= items.length) return;
          await fn(items[i], i);
        }
      })()
    );
  }
  await Promise.all(workers);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // When --via-lambda is set, point fetchCandidateCodes() at the API Gateway
  // URL by overriding the env it reads. The Lambda mirrors the upstream path
  // (/api/public/v1/candidate-codes/{hts10}) so no other code changes are
  // needed; the response shape and error semantics are identical to a direct
  // upstream call.
  if (args.viaLambda && args.lambdaUrl) {
    process.env.TARIFF_CANDIDATE_CODES_BASE_URL = args.lambdaUrl;
    console.error(`Lambda fan-out enabled: routing fetches through ${args.lambdaUrl}`);
  }

  const chapter = await prisma.tariffChapter.findUnique({
    where: { spaceId_number: { spaceId: KoalaGainsSpaceId, number: args.chapter } },
    select: { id: true, number: true, title: true },
  });
  if (!chapter) {
    throw new Error(`Chapter ${args.chapter} not found in tariff_chapters (space ${KoalaGainsSpaceId}).`);
  }

  const htsRows = await prisma.htsCode.findMany({
    where: { spaceId: KoalaGainsSpaceId, chapterId: chapter.id, htsCode10: { not: null } },
    select: { htsCode10: true },
    orderBy: { sortOrder: 'asc' },
  });

  const all = htsRows.map((r) => r.htsCode10!).filter((c): c is string => /^\d{10}$/.test(c));
  const targets = args.limit ? all.slice(0, args.limit) : all;

  console.error(`Chapter ${chapter.number} ("${chapter.title}"): ${targets.length} HTS lines${args.limit ? ` (limited from ${all.length})` : ''}`);
  if (args.cacheDir) {
    const absCache = path.resolve(args.cacheDir);
    await mkdir(absCache, { recursive: true });
    console.error(`Cache: ${absCache} (re-runs skip already-cached HTS lines; pass --no-cache to force re-fetch)`);
  } else {
    console.error(`Cache: disabled (--no-cache)`);
  }
  console.error(`Phase A: fetching upstream (concurrency=${args.concurrency})…`);

  // -------- Phase A: fetch + accumulate (deduped by (code, variant)) --------
  const candidates = new Map<string, UpstreamCandidateCode>(); // key: `${code}|${variant ?? ''}`
  const links: LinkRow[] = [];
  const failures: Array<{ hts10: string; reason: string }> = [];
  let processedLines = 0;
  let cacheHits = 0;
  let rateLimitedCount = 0;
  const fetchedAt = new Date();

  await runWithConcurrency(targets, args.concurrency, async (hts10) => {
    try {
      const { data: upstream, fromCache } = await fetchHts(hts10, args.cacheDir, 3);
      if (fromCache) cacheHits += 1;
      // Lock around the shared maps isn't needed in single-threaded JS — the
      // awaits return synchronously into the same event loop turn here.
      for (const c of upstream) {
        const key = `${c.codeVariant.code}|${c.codeVariant.variant ?? ''}`;
        if (!candidates.has(key)) candidates.set(key, c);
        links.push({ hts10, code: c.codeVariant.code, variant: c.codeVariant.variant });
      }
      processedLines += 1;
      const tag = fromCache ? 'cached' : 'fetched';
      console.error(`  ✓ ${hts10} (${upstream.length} candidates, ${tag}) [${processedLines}/${targets.length}]`);
    } catch (err) {
      const reason = describeFetchError(err);
      if (reason.includes('RATE_LIMITED:') || reason.includes('HTTP 429')) rateLimitedCount += 1;
      failures.push({ hts10, reason });
      console.error(`  ✗ ${hts10}: ${reason}`);
    }
    if (args.delayMs > 0) await sleep(args.delayMs);
  });

  console.error(
    `Phase B: emitting SQL — ${candidates.size} unique candidates, ${links.length} HTS↔candidate links,` +
      ` ${failures.length} fetch failures (${rateLimitedCount} rate-limited, ${cacheHits} cache hits)`
  );
  if (rateLimitedCount > 0) {
    console.error(
      `WARNING: ${rateLimitedCount} HTS lines were rate-limited by the upstream. The successful` +
        ` ones are cached on disk — re-run the same command after the upstream quota resets and` +
        ` only the missing codes will be re-fetched.`
    );
  }

  // -------- Phase B: emit SQL --------
  const out: string[] = [];
  out.push(`-- Generated by src/scripts/tariff-calculator/generate-candidate-codes-sql.ts`);
  out.push(`-- Chapter ${chapter.number}: ${chapter.title}`);
  out.push(`-- HTS lines fetched: ${processedLines}/${targets.length} (failures: ${failures.length})`);
  out.push(`-- Unique candidates: ${candidates.size}, HTS↔candidate links: ${links.length}`);
  out.push(`-- Generated at: ${fetchedAt.toISOString()}`);
  out.push(`-- Safe to re-run: each candidate DO-block early-exits if the row exists,`);
  out.push(`-- and the link INSERT uses ON CONFLICT DO UPDATE.`);
  out.push(``);
  for (const f of failures) {
    out.push(`-- !! ${f.hts10}: ${f.reason}`);
  }
  if (failures.length > 0) out.push(``);

  out.push(`BEGIN;`);
  out.push(``);

  // Sort by (code, variant) for deterministic output.
  const sorted = Array.from(candidates.values()).sort((a, b) => {
    const c = a.codeVariant.code.localeCompare(b.codeVariant.code);
    if (c !== 0) return c;
    return (a.codeVariant.variant ?? '').localeCompare(b.codeVariant.variant ?? '');
  });
  for (const c of sorted) {
    out.push(emitCandidateBlock(c));
  }

  out.push(emitBulkJoinInserts(links, fetchedAt));

  out.push(`COMMIT;`);
  out.push(``);
  out.push(`-- Summary: ${processedLines} HTS lines, ${candidates.size} unique candidates, ${links.length} link rows, ${failures.length} failures.`);

  const sql = out.join('\n');
  if (args.stdout) {
    process.stdout.write(sql);
    if (!sql.endsWith('\n')) process.stdout.write('\n');
  } else {
    const outPath = args.out ?? path.join('generated-sql', `tariff-candidate-codes-chapter-${chapter.number}.sql`);
    const absPath = path.resolve(outPath);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, sql, 'utf-8');
    console.error(`Wrote SQL → ${absPath}`);
  }

  console.error(
    `Done: ${processedLines} HTS lines, ${candidates.size} unique candidates, ${links.length} links,` +
      ` ${failures.length} failures (${rateLimitedCount} rate-limited, ${cacheHits} from cache).`
  );
}

main()
  .catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
