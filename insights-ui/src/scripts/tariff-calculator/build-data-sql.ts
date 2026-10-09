/**
 * Generates prisma/data-sql/tariff-calculator/<YYYYMMDD>-<edition-slug>.sql — one reviewed transaction
 * that replaces the calculator's `tariff_chapter99_headings` + `tariff_measures` rows with the committed
 * src/tariff-data/calculator/{ch99-headings,measures}.json, then brings `hts_codes` base rates + units
 * up to the same HTS edition (issue #1785).
 *
 *   pnpm tariff:build-data-sql --hts-file ~/Downloads/hts_2026_revision_21_json.json
 *   pnpm tariff:build-data-sql                      # downloads the HTS JSON named in ch99-headings.json
 *   pnpm tariff:build-data-sql --no-base-rates      # headings + measures only
 *
 * Never connects to a database. Commit the SQL, review it in the PR, merge (Prisma migrations apply in
 * the deploy), then run the "insights-ui: apply data SQL" GitHub workflow — dry run first.
 * See docs/insights-ui/tariffs/calculator-data-refresh.md.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Ch99HeadingRecord, Ch99HeadingsFile, TariffMeasureRecord, TariffMeasuresFile } from '@/types/tariff-calculator-measures';
import { buildBaseRatesSql, extractBaseRateRows } from './lib/hts-base-rates';
import { DATA_SQL_DIR, editionSlug, INSIGHTS_UI_ROOT, loadHtsSource, parseCliArgs, stringArg, yyyymmdd } from './lib/hts-source';
import { chunk, compareCodes, sqlDate, sqlJsonb, sqlNumeric, sqlText, sqlTextArray } from './lib/sql';

const SPACE_ID = 'koala_gains';
const CALCULATOR_DATA_DIR = path.join(INSIGHTS_UI_ROOT, 'src', 'tariff-data', 'calculator');
const MEASURE_RATE_KINDS = new Set(['additive', 'inPlaceOfBase', 'floor', 'relief']);
const HEADING_RATE_KINDS = new Set(['additive', 'flat', 'relief', 'unknown']);

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf-8')) as T;
}

function validateHeadings(file: Ch99HeadingsFile): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const h of file.headings) {
    if (!/^9903\.\d{2}\.\d{2}$/.test(h.code)) errors.push(`heading ${h.code}: code is not 9903.xx.xx`);
    if (seen.has(h.code)) errors.push(`heading ${h.code}: duplicate`);
    seen.add(h.code);
    if (!HEADING_RATE_KINDS.has(h.rateKind)) errors.push(`heading ${h.code}: rateKind "${h.rateKind}"`);
  }
  return errors;
}

function validateMeasures(file: TariffMeasuresFile, headingCodes: Set<string>): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  for (const m of file.measures) {
    const where = `measure ${m.measureKey || '(no measureKey)'}`;
    if (!m.measureKey) errors.push(`${where}: missing measureKey`);
    if (seen.has(m.measureKey)) errors.push(`${where}: duplicate measureKey`);
    seen.add(m.measureKey);
    if (!m.program) errors.push(`${where}: missing program`);
    if (!MEASURE_RATE_KINDS.has(m.rateKind)) errors.push(`${where}: rateKind "${m.rateKind}"`);
    if (m.rateKind !== 'relief' && (m.ratePct === null || m.ratePct === undefined)) errors.push(`${where}: ratePct required for ${m.rateKind}`);
    if (!isoDate.test(m.effectiveFrom)) errors.push(`${where}: effectiveFrom "${m.effectiveFrom}" is not an ISO date`);
    if (m.effectiveTo !== null && m.effectiveTo !== undefined && !isoDate.test(m.effectiveTo))
      errors.push(`${where}: effectiveTo "${m.effectiveTo}" is not an ISO date`);
    if (!m.htsEdition) errors.push(`${where}: missing htsEdition`);
    if (m.reviewedAt !== undefined && !isoDate.test(m.reviewedAt)) errors.push(`${where}: reviewedAt "${m.reviewedAt}" is not an ISO date`);
    if (m.reviewedAt === undefined && !isoDate.test(file.reviewedAt ?? ''))
      errors.push(`${where}: no reviewedAt and the file-level reviewedAt "${file.reviewedAt}" is not an ISO date`);
    if (!headingCodes.has(m.ch99Code)) warnings.push(`${where}: ch99Code ${m.ch99Code} is not in ch99-headings.json`);
    for (const code of m.replacesCodes ?? []) if (!headingCodes.has(code)) warnings.push(`${where}: replacesCodes ${code} is not in ch99-headings.json`);
    if (!m.sources?.length) warnings.push(`${where}: no sources`);
  }
  return { errors, warnings };
}

function headingsSql(headings: readonly Ch99HeadingRecord[], edition: string): string {
  const out: string[] = [`DELETE FROM tariff_chapter99_headings WHERE space_id = ${sqlText(SPACE_ID)};`, ''];
  const sorted = [...headings].sort((a, b) => compareCodes(a.code, b.code));
  for (const part of chunk(sorted, 200)) {
    out.push(
      'INSERT INTO tariff_chapter99_headings (id, code, description, general_rate, rate_kind, rate_pct, countries, except_codes, note_refs, hts_edition, space_id, created_at, updated_at) VALUES'
    );
    out.push(
      part
        .map(
          (h) =>
            `  (gen_random_uuid()::text, ${sqlText(h.code)}, ${sqlText(h.description)}, ${sqlText(h.generalRate)}, ${sqlText(h.rateKind)}, ${sqlNumeric(
              h.ratePct
            )}, ${sqlTextArray(h.countries)}, ${sqlTextArray(h.exceptCodes)}, ${sqlTextArray(h.noteRefs)}, ${sqlText(edition)}, ${sqlText(
              SPACE_ID
            )}, now(), now())`
        )
        .join(',\n') + ';'
    );
  }
  return out.join('\n');
}

function measuresSql(measures: readonly TariffMeasureRecord[], fileReviewedAt: string): string {
  const out: string[] = [`DELETE FROM tariff_measures WHERE space_id = ${sqlText(SPACE_ID)};`, ''];
  const sorted = [...measures].sort((a, b) => compareCodes(a.measureKey, b.measureKey));
  for (const part of chunk(sorted, 200)) {
    out.push(
      'INSERT INTO tariff_measures (id, measure_key, program, ch99_code, rate_kind, rate_pct, countries_include, countries_exclude, coverage_include, coverage_exclude, conditions, replaces_codes, effective_from, effective_to, sources, hts_edition, reviewed_at, notes, space_id, created_at, updated_at) VALUES'
    );
    out.push(
      part
        .map((m) =>
          [
            'gen_random_uuid()::text',
            sqlText(m.measureKey),
            sqlText(m.program),
            sqlText(m.ch99Code),
            sqlText(m.rateKind),
            sqlNumeric(m.ratePct),
            sqlTextArray(m.countriesInclude ?? []),
            sqlTextArray(m.countriesExclude ?? []),
            sqlTextArray(m.coverageInclude ?? []),
            sqlTextArray(m.coverageExclude ?? []),
            sqlJsonb(m.conditions ?? {}),
            sqlTextArray(m.replacesCodes ?? []),
            sqlDate(m.effectiveFrom),
            sqlDate(m.effectiveTo),
            sqlJsonb(m.sources ?? []),
            sqlText(m.htsEdition),
            sqlDate(m.reviewedAt ?? fileReviewedAt),
            sqlText(m.notes ?? null),
            sqlText(SPACE_ID),
            'now()',
            'now()',
          ].join(', ')
        )
        .map((values) => `  (${values})`)
        .join(',\n') + ';'
    );
  }
  return out.join('\n');
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const headingsPath = path.resolve(stringArg(args, 'headings') ?? path.join(CALCULATOR_DATA_DIR, 'ch99-headings.json'));
  const measuresPath = path.resolve(stringArg(args, 'measures') ?? path.join(CALCULATOR_DATA_DIR, 'measures.json'));
  const withBaseRates = args['no-base-rates'] !== true;

  const headingsFile = readJson<Ch99HeadingsFile>(headingsPath);
  const headingErrors = validateHeadings(headingsFile);

  const notes: string[] = [];
  let measures: TariffMeasureRecord[] = [];
  let measuresEdition: string | null = null;
  let measuresReviewedAt: string | null = null;
  const warnings: string[] = [];
  const errors: string[] = [...headingErrors];
  if (existsSync(measuresPath)) {
    const measuresFile = readJson<TariffMeasuresFile>(measuresPath);
    measures = measuresFile.measures ?? [];
    measuresEdition = measuresFile.htsEdition;
    measuresReviewedAt = measuresFile.reviewedAt;
    const v = validateMeasures(measuresFile, new Set(headingsFile.headings.map((h) => h.code)));
    errors.push(...v.errors);
    warnings.push(...v.warnings);
    if (measuresFile.htsEdition !== headingsFile.htsEdition) {
      warnings.push(`measures.json is for HTS ${measuresFile.htsEdition}, ch99-headings.json for ${headingsFile.htsEdition}`);
    }
  } else {
    notes.push(`${path.relative(INSIGHTS_UI_ROOT, measuresPath)} not found — tariff_measures is emptied (no rows inserted).`);
  }
  if (errors.length) {
    for (const e of errors) console.error(`ERROR ${e}`);
    throw new Error(`${errors.length} validation error(s) — fix the JSON and re-run`);
  }

  let baseRates = '';
  let baseRowCount = 0;
  let baseSourceUrl: string | null = null;
  if (withBaseRates) {
    const source = await loadHtsSource({ file: stringArg(args, 'hts-file'), url: headingsFile.sourceUrl, edition: headingsFile.htsEdition });
    if (source.edition !== headingsFile.htsEdition) throw new Error(`HTS file is ${source.edition}, ch99-headings.json is ${headingsFile.htsEdition}`);
    const { rows, duplicates } = extractBaseRateRows(source.rows);
    if (duplicates.length) warnings.push(`${duplicates.length} duplicate HTS numbers in the HTS JSON (first row kept): ${duplicates.slice(0, 10).join(', ')}`);
    baseRates = buildBaseRatesSql(rows, source.edition, SPACE_ID);
    baseRowCount = rows.length;
    baseSourceUrl = source.sourceUrl;
  } else {
    notes.push('Base-rate updates skipped (--no-base-rates).');
  }

  const out = stringArg(args, 'out')
    ? path.resolve(stringArg(args, 'out') as string)
    : path.join(DATA_SQL_DIR, `${yyyymmdd()}-${editionSlug(headingsFile.htsEdition)}.sql`);
  const relOut = path.relative(INSIGHTS_UI_ROOT, out);

  const header = [
    `-- Tariff calculator data — HTS ${headingsFile.htsEdition}`,
    `--`,
    `-- Source:    ${headingsFile.sourceUrl}`,
    `-- Generated: ${new Date().toISOString()} by src/scripts/tariff-calculator/build-data-sql.ts`,
    `-- Inputs:    src/tariff-data/calculator/ch99-headings.json (${headingsFile.headings.length} headings, generated ${headingsFile.generatedAt})`,
    `--            src/tariff-data/calculator/measures.json (${
      measuresEdition ? `${measures.length} measures, HTS ${measuresEdition}, reviewed ${measuresReviewedAt}` : 'absent — measures table emptied'
    })`,
    withBaseRates ? `--            HTS JSON base rates (${baseRowCount} numbered rows) from ${baseSourceUrl}` : `--            (base rates not included)`,
    ...notes.map((n) => `-- NOTE:      ${n}`),
    `--`,
    `-- What it does (one transaction): replaces every koala_gains row of tariff_chapter99_headings and`,
    `-- tariff_measures, updates hts_codes rates/units that differ from the edition, then SELECTs counts.`,
    `-- Safe to re-run. Never run it by hand against production:`,
    `--   1. Review this file in the PR and merge (Prisma migrations apply during the deploy).`,
    `--   2. GitHub Actions → "insights-ui: apply data SQL" → sql_file=${relOut}, dry_run=true`,
    `--      (runs everything, prints the counts, then ROLLBACK).`,
    `--   3. Re-run with dry_run=false to COMMIT.`,
    `-- See docs/insights-ui/tariffs/calculator-data-refresh.md.`,
    '',
  ];

  const sql = [
    ...header,
    'BEGIN;',
    '',
    `-- ---------------------------------------------------------------------------`,
    `-- tariff_chapter99_headings (${headingsFile.headings.length} rows)`,
    `-- ---------------------------------------------------------------------------`,
    headingsSql(headingsFile.headings, headingsFile.htsEdition),
    '',
    `-- ---------------------------------------------------------------------------`,
    `-- tariff_measures (${measures.length} rows)`,
    `-- ---------------------------------------------------------------------------`,
    measuresSql(measures, measuresReviewedAt ?? ''),
    '',
    baseRates,
    `-- ---------------------------------------------------------------------------`,
    `-- Counts (expected: ${headingsFile.headings.length} headings, ${measures.length} measures)`,
    `-- ---------------------------------------------------------------------------`,
    `SELECT 'tariff_chapter99_headings' AS table_name, count(*) AS rows FROM tariff_chapter99_headings WHERE space_id = ${sqlText(SPACE_ID)}`,
    `UNION ALL SELECT 'tariff_measures', count(*) FROM tariff_measures WHERE space_id = ${sqlText(SPACE_ID)};`,
    '',
    'COMMIT;',
    '',
  ].join('\n');

  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, sql);

  for (const w of warnings) console.warn(`WARN ${w}`);
  for (const n of notes) console.log(`NOTE ${n}`);
  console.log(
    `Wrote ${relOut} (${(sql.length / 1024 / 1024).toFixed(1)} MB): ${headingsFile.headings.length} headings, ${measures.length} measures${
      withBaseRates ? `, ${baseRowCount} base-rate rows` : ''
    }`
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
