// usage: npx tsx ev.ts <gen.json> HTS10:ISO[:SPI] ...
import { readFileSync } from 'node:fs';
import { evaluateLine } from '@/scripts/industry-tariff-reports/chapter-generator/line-rates';
const m = JSON.parse(readFileSync('src/tariff-data/calculator/measures.json', 'utf8'));
const g = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const rows = g.overview.rateTable.rows.filter((r: any) => r.htsCode10);
for (const arg of process.argv.slice(3)) {
  const [h, iso, spi] = arg.split(':');
  const row = rows.find((r: any) => r.htsCode10 === h.replace(/\./g, ''));
  if (!row) {
    console.log(arg, 'no row');
    continue;
  }
  const r = evaluateLine(row, iso, m.measures, { entryDate: '2026-10-12', claimedSpi: spi });
  console.log(
    arg,
    '| base',
    r.base,
    '|',
    r.variants.map((v) => `${v.label ?? ''} total=${v.total} extra=${v.extra} pref=${v.preference} codes=${v.chargedCodes.join(',')}`).join(' || '),
    r.problems.join(';'),
    r.claimRejected ? 'CLAIM REJECTED' : ''
  );
}
