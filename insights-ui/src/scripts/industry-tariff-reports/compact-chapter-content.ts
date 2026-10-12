import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { StoredTariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import { compactChapterPrototype, storedDerivedFieldMismatches } from '@/utils/tariff-reports/chapter-prototype';

/**
 * Strip the derived per-line fields from Approach-2 chapter content files (one-off migration, also safe
 * to re-run on a file written in the old shape):
 *
 *   pnpm tariff:compact-chapters                                   # every src/tariff-data/chapters/*.json
 *   pnpm tariff:compact-chapters src/tariff-data/chapters/29-organic-chemicals.json
 *
 * Removes rate-table `searchText` and the `description` / `ancestorPath` / `searchText` (+ engineering
 * `heading` / `general`) copies on `tariffUpdates.lines` and `tariffEngineering.lines` — the loader
 * derives them from the rate table (`normalizeChapterPrototype`). Nothing else changes. A file whose
 * stored copies disagree with the rate table is left untouched and reported, because stripping would
 * change what the page renders.
 */

type PrettierApi = { format(source: string, options: Record<string, unknown>): string; resolveConfig(file: string): Promise<Record<string, unknown> | null> };

async function loadPrettier(): Promise<PrettierApi> {
  const moduleName = 'prettier'; // non-literal specifier: typed loosely, no declaration file needed
  const mod = (await import(moduleName)) as PrettierApi & { default?: PrettierApi };
  return mod.default ?? mod;
}

async function main(): Promise<void> {
  const dir = path.resolve(process.cwd(), 'src/tariff-data/chapters');
  const args = process.argv.slice(2);
  const files = args.length
    ? args.map((f) => path.resolve(f))
    : readdirSync(dir)
        .filter((name) => name.endsWith('.json'))
        .map((name) => path.join(dir, name));

  const prettier = await loadPrettier();
  let failed = 0;
  for (const file of files) {
    const before = readFileSync(file, 'utf8');
    const stored = JSON.parse(before) as StoredTariffChapterPrototype;
    const problems = storedDerivedFieldMismatches(stored);
    if (problems.length) {
      console.error(`SKIP ${path.relative(process.cwd(), file)}: stripping would change what the page renders — fix these first:`);
      for (const p of problems) console.error(`  ${p}`);
      failed++;
      continue;
    }
    const compact = compactChapterPrototype(stored);
    const options = (await prettier.resolveConfig(file)) ?? {};
    const after = prettier.format(JSON.stringify(compact, null, 2), { ...options, parser: 'json' });
    if (after === before) {
      console.log(`unchanged ${path.relative(process.cwd(), file)}`);
      continue;
    }
    writeFileSync(file, after);
    console.log(`compacted ${path.relative(process.cwd(), file)}: ${before.length} -> ${after.length} bytes`);
  }
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
