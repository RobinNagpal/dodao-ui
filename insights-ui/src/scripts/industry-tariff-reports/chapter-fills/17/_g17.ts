import { readFileSync } from 'node:fs';
import { calculateWithMeasures } from '@/utils/tariff-calculator/measures-engine';
const m = JSON.parse(readFileSync('src/tariff-data/calculator/measures.json', 'utf8')).measures;
const hts = JSON.parse(readFileSync((process.env.CHAPTER_FILL_CACHE ?? require('node:os').tmpdir() + '/koala-chapter-fills') + '/17/hts-ch17.json', 'utf8'));
function lineFor(code: string) {
  let row: any = null,
    rate: any = null;
  for (const r of hts) {
    const n = (r.htsno || '').replace(/\./g, '');
    if (r.general) rate = r;
    if (n === code) {
      row = r;
      break;
    }
  }
  return { hts10: code, general: rate.general, special: rate.special, column2: rate.other, units: row.units };
}
const cases: any[] = JSON.parse(process.argv[2]);
for (const c of cases) {
  const line = lineFor(c.hts10);
  const r = calculateWithMeasures({ customsValueUsd: 10000, quantities: { KG: 20000 }, entryDate: '2026-10-12', ...c }, line, m);
  console.log(JSON.stringify(c), '=>', r.error ?? r.totalDutyUsd, JSON.stringify(r.lines.map((l) => [l.code, l.amountUsd, l.notes])));
  console.log('LINE', JSON.stringify(line));
}
