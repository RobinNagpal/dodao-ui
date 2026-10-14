import { readFileSync } from 'node:fs';
import { measureReachesLine } from '@/scripts/industry-tariff-reports/chapter-generator/line-rates';
const m = JSON.parse(readFileSync('src/tariff-data/calculator/measures.json', 'utf8'));
const g = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const lines = g.overview.rateTable.rows.filter((r: any) => r.htsCode10).map((r: any) => r.htsCode10);
console.log('measures edition', m.htsEdition, 'total lines', lines.length);
for (const x of m.measures) {
  const n = lines.filter((l: string) => measureReachesLine(x, l)).length;
  if (!n) continue;
  console.log([x.ch99Code, x.program, x.rateKind, x.ratePct, (x.countries || []).slice(0, 5).join('/'), x.effectiveFrom, x.effectiveTo, n].join(' | '));
}
