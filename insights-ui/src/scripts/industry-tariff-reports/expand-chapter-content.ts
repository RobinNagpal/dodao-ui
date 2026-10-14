import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { StoredTariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import { normalizeChapterPrototype } from '@/utils/tariff-reports/chapter-prototype';

/**
 * The reverse of `pnpm tariff:compact-chapters`: write the derived per-line fields back into a chapter content file
 * (rate-table `searchText`; `description` / `ancestorPath` / `searchText` on tariffUpdates lines; the same plus
 * `heading` / `general` on tariffEngineering lines), exactly as the loader derives them.
 *
 *   tsx src/scripts/industry-tariff-reports/expand-chapter-content.ts <file> [more files]
 *
 * Used by the older chapter fill scripts (chapter-fills/<NN>/run.sh, `expand_gen`), which were written when the
 * generator still stored those fields. `pnpm tariff:refresh-chapter` compacts the file again afterwards.
 */
function main(): void {
  const files = process.argv.slice(2);
  if (!files.length) throw new Error('usage: expand-chapter-content.ts <file> [more files]');
  for (const file of files) {
    const stored = JSON.parse(readFileSync(file, 'utf8')) as StoredTariffChapterPrototype;
    writeFileSync(file, JSON.stringify(normalizeChapterPrototype(stored), null, 2) + '\n');
    console.log(`expanded ${path.relative(process.cwd(), path.resolve(file))}`);
  }
}

main();
