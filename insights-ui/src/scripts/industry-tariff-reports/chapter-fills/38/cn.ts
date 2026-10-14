import { readFileSync } from 'node:fs';
import { evaluateLine } from '@/scripts/industry-tariff-reports/chapter-generator/line-rates';
const m = JSON.parse(readFileSync('src/tariff-data/calculator/measures.json', 'utf8'));
const g = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const iso = process.argv[3];
const rows = g.overview.rateTable.rows.filter((r: any) => r.htsCode10);
const byKey = new Map<string, string[]>();
for (const row of rows) {
  const r = evaluateLine(row, iso, m.measures, { entryDate: '2026-10-12' });
  const k = r.variants.map((v) => v.chargedCodes.join('+') || 'none').join(' | ');
  byKey.set(k, [...(byKey.get(k) ?? []), row.hts]);
}
for (const [k, v] of byKey) console.log(k, v.length, v.join(' '));
