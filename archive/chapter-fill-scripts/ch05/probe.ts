import { readFileSync } from 'node:fs';
import { calculateWithMeasures } from '@/utils/tariff-calculator/measures-engine';
const W = '/Users/robin/projects/worktrees/chapter-migration-1810-batch1/insights-ui';
const measures = JSON.parse(readFileSync(`${W}/src/tariff-data/calculator/measures.json`, 'utf8')).measures;
const gen = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const rows = gen.overview.rateTable.rows;
const cases: [string, string, number, string | undefined, string][] = JSON.parse(process.argv[3]);
for (const [hts, cc, value, spi, date] of cases) {
  const r = rows.find((x: any) => x.hts === hts);
  const line = { hts10: r.htsCode10, general: r.effectiveGeneral, special: r.effectiveSpecial, column2: r.effectiveColumn2, units: r.units };
  const res = calculateWithMeasures({ hts10: r.htsCode10, countryOfOrigin: cc, customsValueUsd: value, quantities: { KG: 1000, NO: 1000, DOSES: 1000 }, claimedSpi: spi, entryDate: date }, line, measures);
  console.log(`${hts} ${cc} ${spi ?? '-'} ${date} $${value}: total $${res.totalDutyUsd} ${res.error ?? ''}`);
  for (const l of res.lines) console.log(`    ${l.code} ${l.rateText} $${l.amountUsd}`);
  for (const s of res.skipped) console.log(`    skipped ${s.ch99Code}: ${s.reason}`);
}
