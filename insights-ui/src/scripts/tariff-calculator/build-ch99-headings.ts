/**
 * Builds src/tariff-data/calculator/ch99-headings.json — every Chapter 99 heading (9903.xx.xx) of an
 * HTS revision, with its rate formula, countries, excepted headings and U.S. note references parsed
 * from the official USITC HTS JSON (issue #1785).
 *
 *   pnpm tariff:build-ch99                                   # newest revision on usitc.gov
 *   pnpm tariff:build-ch99 --edition "2026 Revision 21"      # a specific revision
 *   pnpm tariff:build-ch99 --file ~/Downloads/hts_2026_revision_21_json.json
 *   pnpm tariff:build-ch99 --file hts.json --edition "2026 Revision 21"
 *
 * Never touches a database. Review the diff of ch99-headings.json, then run `pnpm tariff:build-data-sql`.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Ch99HeadingRecord, Ch99HeadingsFile } from '@/types/tariff-calculator-measures';
import { parseCh99Countries, parseCh99Row } from './lib/ch99-parse';
import { INSIGHTS_UI_ROOT, loadHtsSource, parseCliArgs, stringArg } from './lib/hts-source';
import { compareCodes } from './lib/sql';

export const CH99_HEADINGS_PATH = path.join(INSIGHTS_UI_ROOT, 'src', 'tariff-data', 'calculator', 'ch99-headings.json');

/** The slice of the prettier v2 API used here (the repo has no @types/prettier). */
interface PrettierApi {
  resolveConfig(filePath: string): Promise<Record<string, unknown> | null>;
  format(source: string, options: Record<string, unknown>): string;
}

async function loadPrettier(): Promise<PrettierApi> {
  const moduleName = 'prettier'; // non-literal specifier: typed loosely, no declaration file needed
  const mod = (await import(moduleName)) as PrettierApi & { default?: PrettierApi };
  return mod.default ?? mod;
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const source = await loadHtsSource({ file: stringArg(args, 'file'), url: stringArg(args, 'url'), edition: stringArg(args, 'edition') });
  const out = stringArg(args, 'out') ? path.resolve(stringArg(args, 'out') as string) : CH99_HEADINGS_PATH;

  const seen = new Set<string>();
  const headings: Ch99HeadingRecord[] = [];
  // Descriptions of the enclosing rows by indent: an indented heading (e.g. 9903.92.10 under the
  // "…articles the product of China" text of 9903.92) inherits the countries its parents name.
  const parents: string[] = [];
  let inherited = 0;
  for (const row of source.rows) {
    const code = (row.htsno ?? '').trim();
    const indent = Number(row.indent) || 0;
    // Unnumbered rows are headers too ("Articles the product of France, of Germany, …:" above 9903.89.05).
    parents.length = indent;
    parents[indent] = row.description ?? '';
    if (!code.startsWith('9903.') || code.length !== 10) continue; // "9903.92" is a header row, not a heading
    if (seen.has(code)) {
      console.warn(`WARN duplicate heading ${code} — keeping the first row`);
      continue;
    }
    seen.add(code);
    const record = parseCh99Row(code, row.description ?? '', row.general);
    if (record.countries.length === 0 && indent > 0) {
      record.countries = parseCh99Countries(parents.slice(0, indent).join(' '));
      if (record.countries.length) inherited++;
    }
    headings.push(record);
  }
  headings.sort((a, b) => compareCodes(a.code, b.code));

  const file: Ch99HeadingsFile = { htsEdition: source.edition, sourceUrl: source.sourceUrl, generatedAt: new Date().toISOString(), headings };
  mkdirSync(path.dirname(out), { recursive: true });
  // Format with the repo's prettier config so the committed file passes `pnpm prettier-check` as generated.
  const prettier = await loadPrettier();
  const prettierOptions = (await prettier.resolveConfig(out)) ?? {};
  writeFileSync(out, prettier.format(JSON.stringify(file, null, 2), { ...prettierOptions, filepath: out }));

  // ---- report
  const byKind = new Map<string, number>();
  for (const h of headings) byKind.set(h.rateKind, (byKind.get(h.rateKind) ?? 0) + 1);
  console.log(`\n${source.edition} (${source.sourceUrl})`);
  console.log(`Wrote ${headings.length} Chapter 99 headings → ${path.relative(process.cwd(), out)}`);
  console.log(`rateKind: ${[...byKind.entries()].map(([k, n]) => `${k}=${n}`).join(', ')}`);
  console.log(
    `with countries=${headings.filter((h) => h.countries.length).length}, with exceptCodes=${
      headings.filter((h) => h.exceptCodes.length).length
    }, with noteRefs=${headings.filter((h) => h.noteRefs.length).length}, countries inherited from a parent row=${inherited}`
  );
  const unknown = headings.filter((h) => h.rateKind === 'unknown');
  if (unknown.length) {
    console.log(`\nUnparsed rates (rateKind=unknown, ${unknown.length}):`);
    for (const h of unknown) console.log(`  ${h.code}  general=${JSON.stringify(h.generalRate)}`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
