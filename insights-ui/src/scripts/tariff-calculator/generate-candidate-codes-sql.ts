// Chapter-driven SQL generator for the tariff calculator candidate-codes feed.
//
// Given an HTSUS chapter number (e.g. `--chapter 22`), this:
//   1. Reads every `hts_codes` row in that chapter that has a 10-digit code.
//   2. Calls the upstream candidate-codes API for each one.
//   3. Emits a self-contained SQL transcript that, when executed in pgAdmin
//      (against dev or prod), upserts the same rows the runtime ingest path
//      writes via Prisma — `tariff_candidate_codes`, its child tables, and
//      the `hts_code_candidate_codes` link.
//
// The SQL is idempotent: re-running it for the same HTS line replaces that
// candidate code's child rows in place. We do not touch data for HTS lines
// outside the chapter we were asked to emit.
//
// Usage:
//   yarn tariffs:gen-candidate-codes-sql --chapter 22
//   yarn tariffs:gen-candidate-codes-sql --chapter 9 --limit 5      # quick test
//   yarn tariffs:gen-candidate-codes-sql --chapter 1 --delay-ms 500
//   yarn tariffs:gen-candidate-codes-sql --chapter 22 --out custom.sql
//   yarn tariffs:gen-candidate-codes-sql --chapter 22 --stdout      # pipe instead
//
// By default the SQL is written to
// `generated-sql/tariff-candidate-codes-chapter-<N>.sql` (relative to cwd).
// Pass `--out <path>` to override, or `--stdout` to dump to stdout. Stats
// and progress always go to stderr.

import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import {
  fetchCandidateCodes,
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
  const delayMs = delayRaw ? Number.parseInt(delayRaw, 10) : 200;
  if (!Number.isInteger(delayMs) || delayMs < 0) {
    throw new Error(`--delay-ms must be a non-negative integer (got "${delayRaw}")`);
  }

  return { chapter, out, stdout, limit, delayMs };
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

// PL/pgSQL identifier escape — the variant subselect uses the value inline,
// which is the only place we'd ever interpolate an identifier-like string.
function sqlVariantPredicate(variant: string | null): string {
  if (variant === null) return 'variant IS NULL';
  return `variant = ${sqlString(variant)}`;
}

// ---------------------------------------------------------------------------
// SQL block builder for a single candidate code
// ---------------------------------------------------------------------------

interface BlockContext {
  hts10: string;
  fetchedAtIso: string;
}

function emitCandidateBlock(ctx: BlockContext, c: UpstreamCandidateCode): string {
  const lines: string[] = [];
  const code = c.codeVariant.code;
  const variant = c.codeVariant.variant;
  const scope = mapCountryScope(c.countryScope);

  lines.push(`-- Candidate ${code}${variant ? `:${variant}` : ''} (${c.type})`);
  lines.push(`DO $$`);
  lines.push(`DECLARE`);
  // Primary keys on these tables are TEXT (Prisma `String @id @default(uuid())`
  // maps to TEXT, not native UUID). Declaring TEXT keeps `id = v_*` comparisons
  // sane — a UUID-typed local would fail with `operator does not exist: text = uuid`.
  lines.push(`  v_hts_code_id    TEXT;`);
  lines.push(`  v_candidate_id   TEXT;`);
  if (c.tradeAnalytics.length > 0) {
    lines.push(`  v_trade_analytic_id TEXT;`);
  }
  lines.push(`BEGIN`);
  lines.push(`  SELECT id INTO v_hts_code_id`);
  lines.push(`  FROM hts_codes`);
  lines.push(`  WHERE space_id = ${sqlString(KoalaGainsSpaceId)} AND hts_code_10 = ${sqlString(ctx.hts10)};`);
  lines.push(``);
  lines.push(`  IF v_hts_code_id IS NULL THEN`);
  lines.push(`    RAISE NOTICE 'hts_code_10 % not found — skipping candidate %', ${sqlString(ctx.hts10)}, ${sqlString(code)};`);
  lines.push(`    RETURN;`);
  lines.push(`  END IF;`);
  lines.push(``);

  // Find an existing candidate code row by (space_id, code, variant).
  // We use an explicit IS NULL check because the unique index treats NULL
  // variants as distinct, and we want to land on the exact row Prisma would.
  lines.push(`  SELECT id INTO v_candidate_id`);
  lines.push(`  FROM tariff_candidate_codes`);
  lines.push(`  WHERE space_id = ${sqlString(KoalaGainsSpaceId)}`);
  lines.push(`    AND code = ${sqlString(code)}`);
  lines.push(`    AND ${sqlVariantPredicate(variant)};`);
  lines.push(``);

  const scalarAssignments = [
    `type = ${sqlEnum(mapCodeType(c.type), 'TariffCandidateCodeType')}`,
    `line_description = ${sqlString(c.lineDescription)}`,
    `full_description = ${sqlString(c.fullDescription)}`,
    `effective_from = ${sqlTimestamp(new Date(c.effectiveFrom))}`,
    `effective_to = ${sqlTimestamp(new Date(c.effectiveTo))}`,
    `rate_description = ${sqlString(c.rateDescription)}`,
    `rate_primary = ${sqlString(c.rateInfo.primaryRate)}`,
    `rate_secondary = ${sqlString(c.rateInfo.secondaryRate)}`,
    `rate_other = ${sqlString(c.rateInfo.otherRate)}`,
    `rate_penalty = ${sqlString(c.rateInfo.penaltyRate)}`,
    `rate_computation_code = ${sqlString(c.rateInfo.computationCode)}`,
    `units_of_measure = ${sqlTextArray(c.unitsOfMeasure)}`,
    `flags_for_anti_dumping = ${sqlBool(c.flagsForAntiDumping)}`,
    `flags_for_countervailing = ${sqlBool(c.flagsForCountervailing)}`,
    `priority = ${sqlInt(c.priority)}`,
    `requires_user_choice = ${sqlBool(c.requiresUserChoice)}`,
    `country_scope_type = ${sqlEnum(scope.type, 'TariffCountryScopeType')}`,
    `country_scope_countries = ${sqlTextArray(scope.countries)}`,
    `label = ${sqlString(c.label)}`,
    `category = ${sqlString(c.category)}`,
    `tags = ${sqlTextArray(c.tags)}`,
    `pga_flags = ${sqlTextArray(c.pgaFlags)}`,
    `fee_flags = ${sqlTextArray(c.feeFlags)}`,
    `parent_codes = ${sqlTextArray(c.parentCodes)}`,
    `line_split_field = ${sqlString(c.lineSplitField)}`,
    `line_split_conditions = ${sqlJsonb(c.lineSplitConditions)}`,
    `relates_to_codes_digits = ${sqlJsonb(c.relatesToCodesDigits)}`,
    `updated_at = NOW()`,
  ];

  lines.push(`  IF v_candidate_id IS NULL THEN`);
  lines.push(`    INSERT INTO tariff_candidate_codes (`);
  lines.push(`      id, space_id, code, variant, type, line_description, full_description,`);
  lines.push(`      effective_from, effective_to, rate_description,`);
  lines.push(`      rate_primary, rate_secondary, rate_other, rate_penalty, rate_computation_code,`);
  lines.push(`      units_of_measure, flags_for_anti_dumping, flags_for_countervailing,`);
  lines.push(`      priority, requires_user_choice, country_scope_type, country_scope_countries,`);
  lines.push(`      label, category, tags, pga_flags, fee_flags, parent_codes,`);
  lines.push(`      line_split_field, line_split_conditions, relates_to_codes_digits,`);
  lines.push(`      created_at, updated_at`);
  lines.push(`    ) VALUES (`);
  lines.push(`      gen_random_uuid(), ${sqlString(KoalaGainsSpaceId)}, ${sqlString(code)}, ${sqlString(variant)},`);
  lines.push(`      ${sqlEnum(mapCodeType(c.type), 'TariffCandidateCodeType')},`);
  lines.push(`      ${sqlString(c.lineDescription)}, ${sqlString(c.fullDescription)},`);
  lines.push(`      ${sqlTimestamp(new Date(c.effectiveFrom))}, ${sqlTimestamp(new Date(c.effectiveTo))},`);
  lines.push(`      ${sqlString(c.rateDescription)},`);
  lines.push(`      ${sqlString(c.rateInfo.primaryRate)}, ${sqlString(c.rateInfo.secondaryRate)},`);
  lines.push(`      ${sqlString(c.rateInfo.otherRate)}, ${sqlString(c.rateInfo.penaltyRate)},`);
  lines.push(`      ${sqlString(c.rateInfo.computationCode)},`);
  lines.push(`      ${sqlTextArray(c.unitsOfMeasure)}, ${sqlBool(c.flagsForAntiDumping)}, ${sqlBool(c.flagsForCountervailing)},`);
  lines.push(`      ${sqlInt(c.priority)}, ${sqlBool(c.requiresUserChoice)},`);
  lines.push(`      ${sqlEnum(scope.type, 'TariffCountryScopeType')}, ${sqlTextArray(scope.countries)},`);
  lines.push(`      ${sqlString(c.label)}, ${sqlString(c.category)},`);
  lines.push(`      ${sqlTextArray(c.tags)}, ${sqlTextArray(c.pgaFlags)}, ${sqlTextArray(c.feeFlags)}, ${sqlTextArray(c.parentCodes)},`);
  lines.push(`      ${sqlString(c.lineSplitField)}, ${sqlJsonb(c.lineSplitConditions)}, ${sqlJsonb(c.relatesToCodesDigits)},`);
  lines.push(`      NOW(), NOW()`);
  lines.push(`    ) RETURNING id INTO v_candidate_id;`);
  lines.push(`  ELSE`);
  lines.push(`    UPDATE tariff_candidate_codes SET`);
  scalarAssignments.forEach((assignment, i) => {
    const sep = i === scalarAssignments.length - 1 ? '' : ',';
    lines.push(`      ${assignment}${sep}`);
  });
  lines.push(`    WHERE id = v_candidate_id;`);
  lines.push(`  END IF;`);
  lines.push(``);

  // Replace child rows. The Prisma ingest does the same delete-then-insert,
  // so we mirror its semantics exactly.
  lines.push(`  DELETE FROM tariff_candidate_special_rates WHERE candidate_code_id = v_candidate_id;`);
  lines.push(`  DELETE FROM tariff_candidate_applicability_conditions WHERE candidate_code_id = v_candidate_id;`);
  lines.push(`  DELETE FROM tariff_candidate_related_codes WHERE candidate_code_id = v_candidate_id;`);
  lines.push(`  DELETE FROM tariff_trade_analytics WHERE candidate_code_id = v_candidate_id;`);
  lines.push(``);

  // specialRates
  c.specialRates.forEach((sr, i) => {
    lines.push(`  INSERT INTO tariff_candidate_special_rates (`);
    lines.push(`    id, space_id, candidate_code_id, spi, rate_description,`);
    lines.push(`    rate_primary, rate_secondary, rate_other, rate_penalty, rate_computation_code,`);
    lines.push(`    sort_order, created_at, updated_at`);
    lines.push(`  ) VALUES (`);
    lines.push(`    gen_random_uuid(), ${sqlString(KoalaGainsSpaceId)}, v_candidate_id,`);
    lines.push(`    ${sqlString(sr.spi)}, ${sqlString(sr.rateDescription)},`);
    lines.push(`    ${sqlString(sr.rateInfo.primaryRate)}, ${sqlString(sr.rateInfo.secondaryRate)},`);
    lines.push(`    ${sqlString(sr.rateInfo.otherRate)}, ${sqlString(sr.rateInfo.penaltyRate)},`);
    lines.push(`    ${sqlString(sr.rateInfo.computationCode)}, ${sqlInt(i)}, NOW(), NOW()`);
    lines.push(`  );`);
  });

  // applicabilityConditions
  c.applicabilityConditions.forEach((cond, i) => {
    const fieldShouldEqual = cond.__typename === 'CustomsTariffEquals' ? cond.fieldShouldEqual : null;
    const threshold = cond.__typename === 'CustomsTariffGreater' || cond.__typename === 'CustomsTariffLess' ? cond.threshold : null;
    const includingThreshold = cond.__typename === 'CustomsTariffGreater' || cond.__typename === 'CustomsTariffLess' ? cond.includingThreshold : null;
    const programCodes = cond.__typename === 'CustomsTariffSomeSpiApplied' ? cond.programCodes : [];
    lines.push(`  INSERT INTO tariff_candidate_applicability_conditions (`);
    lines.push(`    id, space_id, candidate_code_id, kind, field_key,`);
    lines.push(`    field_should_equal, threshold, including_threshold, program_codes,`);
    lines.push(`    sort_order, created_at, updated_at`);
    lines.push(`  ) VALUES (`);
    lines.push(`    gen_random_uuid(), ${sqlString(KoalaGainsSpaceId)}, v_candidate_id,`);
    lines.push(`    ${sqlEnum(mapApplicabilityKind(cond.__typename), 'TariffApplicabilityConditionKind')},`);
    lines.push(`    ${sqlString(cond.fieldKey)},`);
    lines.push(`    ${sqlString(fieldShouldEqual)}, ${sqlString(threshold)}, ${includingThreshold === null ? 'NULL' : sqlBool(includingThreshold)},`);
    lines.push(`    ${sqlTextArray(programCodes)}, ${sqlInt(i)}, NOW(), NOW()`);
    lines.push(`  );`);
  });

  // relatedCodes (3 kinds in one table)
  for (const fieldName of ['excludedByCodes', 'replacesCodes', 'relatedCodes'] as const) {
    const arr = c[fieldName];
    arr.forEach((r, i) => {
      lines.push(`  INSERT INTO tariff_candidate_related_codes (`);
      lines.push(`    id, space_id, candidate_code_id, kind, code, variant,`);
      lines.push(`    sort_order, created_at, updated_at`);
      lines.push(`  ) VALUES (`);
      lines.push(`    gen_random_uuid(), ${sqlString(KoalaGainsSpaceId)}, v_candidate_id,`);
      lines.push(`    ${sqlEnum(RELATED_KIND_BY_FIELD[fieldName], 'TariffRelatedCodeKind')},`);
      lines.push(`    ${sqlString(r.code)}, ${sqlString(r.variant)}, ${sqlInt(i)}, NOW(), NOW()`);
      lines.push(`  );`);
    });
  }

  // tradeAnalytics + nested importPrograms
  for (const ta of c.tradeAnalytics) {
    lines.push(`  INSERT INTO tariff_trade_analytics (`);
    lines.push(`    id, space_id, candidate_code_id, analytics_level, hts_code_10, date,`);
    lines.push(`    country_name, us_customs_country_code,`);
    lines.push(`    total_customs_value, total_calculated_duty, total_duty_rate,`);
    lines.push(`    created_at, updated_at`);
    lines.push(`  ) VALUES (`);
    lines.push(`    gen_random_uuid(), ${sqlString(KoalaGainsSpaceId)}, v_candidate_id,`);
    lines.push(`    ${sqlString(ta.analyticsLevel)}, ${sqlString(ta.htsCode)}, ${sqlString(ta.date)},`);
    lines.push(`    ${sqlString(ta.countryOfOrigin.countryName)}, ${sqlString(ta.countryOfOrigin.usCustomsCountryCode)},`);
    lines.push(`    ${sqlDecimal(ta.totalCustomsValue)}, ${sqlDecimal(ta.totalCalculatedDuty)}, ${sqlDecimal(ta.totalDutyRate)},`);
    lines.push(`    NOW(), NOW()`);
    lines.push(`  ) RETURNING id INTO v_trade_analytic_id;`);
    for (const p of ta.importPrograms) {
      lines.push(`  INSERT INTO tariff_trade_analytic_import_programs (`);
      lines.push(`    id, space_id, trade_analytic_id, program_name, program_indicator, general_note,`);
      lines.push(`    spi_special_program_indicator, spi_agreement_name, spi_general_note, spi_exclude_mpf,`);
      lines.push(`    countries_of_origin, spi_countries_of_origin,`);
      lines.push(`    customs_value, calculated_duty, duty_rate, percent_of_line_value,`);
      lines.push(`    created_at, updated_at`);
      lines.push(`  ) VALUES (`);
      lines.push(`    gen_random_uuid(), ${sqlString(KoalaGainsSpaceId)}, v_trade_analytic_id,`);
      lines.push(`    ${sqlString(p.importProgram.programName)}, ${sqlString(p.importProgram.programIndicator)},`);
      lines.push(`    ${sqlString(p.importProgram.generalNote)},`);
      lines.push(`    ${sqlString(p.importProgram.customsTariffSpi.specialProgramIndicator)},`);
      lines.push(`    ${sqlString(p.importProgram.customsTariffSpi.agreementName)},`);
      lines.push(`    ${sqlString(p.importProgram.customsTariffSpi.generalNote)},`);
      lines.push(`    ${sqlBool(p.importProgram.customsTariffSpi.excludeMpf)},`);
      lines.push(`    ${sqlTextArray(p.importProgram.countriesOfOrigin)},`);
      lines.push(`    ${sqlTextArray(p.importProgram.customsTariffSpi.countriesOfOrigin)},`);
      lines.push(`    ${sqlDecimal(p.customsValue)}, ${sqlDecimal(p.calculatedDuty)},`);
      lines.push(`    ${sqlDecimal(p.dutyRate)}, ${sqlDecimal(p.percentOfLineValue)},`);
      lines.push(`    NOW(), NOW()`);
      lines.push(`  );`);
    }
  }

  // Link upsert. `(space_id, hts_code_id, candidate_code_id)` is the unique
  // we hang ON CONFLICT off — both columns are NOT NULL so the index works.
  lines.push(``);
  lines.push(`  INSERT INTO hts_code_candidate_codes (`);
  lines.push(`    id, space_id, hts_code_id, candidate_code_id, last_fetched_at, created_at, updated_at`);
  lines.push(`  ) VALUES (`);
  lines.push(`    gen_random_uuid(), ${sqlString(KoalaGainsSpaceId)}, v_hts_code_id, v_candidate_id,`);
  lines.push(`    ${sqlTimestamp(new Date(ctx.fetchedAtIso))}, NOW(), NOW()`);
  lines.push(`  )`);
  lines.push(`  ON CONFLICT (space_id, hts_code_id, candidate_code_id) DO UPDATE`);
  lines.push(`  SET last_fetched_at = EXCLUDED.last_fetched_at, updated_at = NOW();`);
  lines.push(`END $$;`);
  lines.push(``);

  return lines.join('\n');
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

// Retry the upstream fetch a few times with backoff to ride out transient
// network blips (TLS handshake glitch, brief DNS hiccup). We do not retry
// `Invalid HTS 10-digit code` or HTTP errors — those are deterministic.
async function fetchWithRetry(hts10: string, maxAttempts: number): Promise<UpstreamCandidateCode[]> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchCandidateCodes(hts10);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const retryable = message === 'fetch failed' || message.includes('ECONNRESET') || message.includes('ETIMEDOUT');
      if (!retryable || attempt === maxAttempts) {
        throw err;
      }
      lastErr = err;
      const backoffMs = 500 * attempt;
      console.error(`    retrying ${hts10} (attempt ${attempt + 1}/${maxAttempts}) in ${backoffMs}ms — ${describeFetchError(err)}`);
      await sleep(backoffMs);
    }
  }
  throw lastErr;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const chapter = await prisma.tariffChapter.findUnique({
    where: { spaceId_number: { spaceId: KoalaGainsSpaceId, number: args.chapter } },
    select: { id: true, number: true, title: true },
  });
  if (!chapter) {
    throw new Error(`Chapter ${args.chapter} not found in tariff_chapters (space ${KoalaGainsSpaceId}).`);
  }

  const htsRows = await prisma.htsCode.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      chapterId: chapter.id,
      htsCode10: { not: null },
    },
    select: { htsCode10: true },
    orderBy: { sortOrder: 'asc' },
  });

  const all = htsRows.map((r) => r.htsCode10!).filter((c): c is string => /^\d{10}$/.test(c));
  const targets = args.limit ? all.slice(0, args.limit) : all;

  console.error(`Chapter ${chapter.number} ("${chapter.title}"): ${targets.length} HTS lines${args.limit ? ` (limited from ${all.length})` : ''}`);

  const fetchedAtIso = new Date().toISOString();
  const out: string[] = [];
  out.push(`-- Generated by src/scripts/tariff-calculator/generate-candidate-codes-sql.ts`);
  out.push(`-- Chapter ${chapter.number}: ${chapter.title}`);
  out.push(`-- HTS lines: ${targets.length}`);
  out.push(`-- Generated at: ${fetchedAtIso}`);
  out.push(`-- Run inside a transaction; safe to re-run (replaces child rows in place).`);
  out.push(``);
  out.push(`BEGIN;`);
  out.push(``);

  let processedLines = 0;
  let totalCandidates = 0;
  let failures = 0;

  for (const hts10 of targets) {
    let upstream: UpstreamCandidateCode[];
    try {
      upstream = await fetchWithRetry(hts10, 3);
    } catch (err) {
      failures += 1;
      const message = describeFetchError(err);
      out.push(`-- !! ${hts10}: upstream fetch failed — ${message}`);
      console.error(`  ✗ ${hts10}: fetch failed — ${message}`);
      await sleep(args.delayMs);
      continue;
    }
    try {
      out.push(`-- ============================================================`);
      out.push(`-- HTS ${hts10} — ${upstream.length} candidate codes`);
      out.push(`-- ============================================================`);
      for (const candidate of upstream) {
        out.push(emitCandidateBlock({ hts10, fetchedAtIso }, candidate));
      }
      processedLines += 1;
      totalCandidates += upstream.length;
      console.error(`  ✓ ${hts10} (${upstream.length} candidates) [${processedLines}/${targets.length}]`);
    } catch (err) {
      failures += 1;
      const message = describeFetchError(err);
      out.push(`-- !! ${hts10}: SQL render failed — ${message}`);
      console.error(`  ✗ ${hts10}: SQL render failed — ${message}`);
    }
    await sleep(args.delayMs);
  }

  out.push(`COMMIT;`);
  out.push(``);
  out.push(`-- Summary: ${processedLines} HTS lines, ${totalCandidates} candidate codes, ${failures} failures.`);

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

  console.error(`Done: ${processedLines} HTS lines, ${totalCandidates} candidate codes, ${failures} failures.`);
}

main()
  .catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
