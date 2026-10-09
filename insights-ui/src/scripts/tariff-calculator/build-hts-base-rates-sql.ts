/**
 * Generates a standalone, idempotent SQL file that updates `hts_codes` General / Special / Column 2
 * rates and units to an HTS revision (only rows whose values differ change). Use it for a base-rates-
 * only refresh; `pnpm tariff:build-data-sql` embeds the same statements in the full calculator data SQL.
 *
 *   pnpm tariff:build-base-rates-sql --file ~/Downloads/hts_2026_revision_21_json.json
 *   pnpm tariff:build-base-rates-sql --edition "2026 Revision 21" [--out prisma/data-sql/tariff-calculator/x.sql]
 *
 * Never connects to a database — review the SQL in a PR, then apply it with the
 * "insights-ui: apply data SQL" GitHub workflow (dry run first).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildBaseRatesSql, extractBaseRateRows } from './lib/hts-base-rates';
import { DATA_SQL_DIR, editionSlug, INSIGHTS_UI_ROOT, loadHtsSource, parseCliArgs, stringArg, yyyymmdd } from './lib/hts-source';

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const source = await loadHtsSource({ file: stringArg(args, 'file'), url: stringArg(args, 'url'), edition: stringArg(args, 'edition') });
  const { rows, duplicates } = extractBaseRateRows(source.rows);
  if (duplicates.length) console.warn(`WARN ${duplicates.length} duplicate HTS numbers (first row kept): ${duplicates.slice(0, 10).join(', ')}`);

  const out = stringArg(args, 'out')
    ? path.resolve(stringArg(args, 'out') as string)
    : path.join(DATA_SQL_DIR, `${yyyymmdd()}-${editionSlug(source.edition)}-hts-base-rates.sql`);

  const sql = [
    `-- hts_codes base rates + units → HTS ${source.edition}`,
    `-- Source: ${source.sourceUrl}`,
    `-- Generated: ${new Date().toISOString()} by src/scripts/tariff-calculator/build-hts-base-rates-sql.ts`,
    `-- Apply: GitHub Actions → "insights-ui: apply data SQL" → sql_file=${path.relative(INSIGHTS_UI_ROOT, out)} (dry_run first).`,
    `-- Idempotent: only rows whose values differ are updated; re-running changes nothing.`,
    '',
    'BEGIN;',
    '',
    buildBaseRatesSql(rows, source.edition),
    'COMMIT;',
    '',
  ].join('\n');

  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, sql);
  console.log(`${source.edition}: ${rows.length} numbered HTS rows → ${path.relative(process.cwd(), out)} (${(sql.length / 1024 / 1024).toFixed(1)} MB)`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
