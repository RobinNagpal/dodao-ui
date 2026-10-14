import { readFileSync } from 'node:fs';
import { measureReachesLine } from '@/scripts/industry-tariff-reports/chapter-generator/line-rates';
const m = JSON.parse(readFileSync('src/tariff-data/calculator/measures.json', 'utf8'));
const g = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const lines = g.overview.rateTable.rows.filter((r: any) => r.htsCode10).map((r: any) => r.htsCode10);
console.log(Object.keys(m.measures[0]));
for (const x of m.measures) {
  const ls = lines.filter((l: string) => measureReachesLine(x, l));
  if (!ls.length || ls.length > 60) continue;
  const { coverage, ...rest } = x;
  console.log('\n##', JSON.stringify(rest).slice(0, 700));
  console.log('  lines:', ls.join(' '));
}
