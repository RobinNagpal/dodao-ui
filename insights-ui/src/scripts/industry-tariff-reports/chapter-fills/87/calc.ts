import { readFileSync } from 'node:fs';
import { calculateWithMeasures } from '@/utils/tariff-calculator/measures-engine';
const m = JSON.parse(readFileSync('src/tariff-data/calculator/measures.json', 'utf8')).measures;
const hts = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const cases: [string, string, Record<string, boolean>, string?][] = JSON.parse(process.argv[3]);
for (const [h, iso, facts, spi] of cases) {
  const d = h.replace(/\./g, '');
  const row = hts.find((r: any) => r.general && [d, d.slice(0, 8)].includes((r.htsno || '').replace(/\./g, '')));
  const line = { hts10: d, general: row.general, special: row.special, column2: row.other, units: row.units } as any;
  const r = calculateWithMeasures(
    {
      hts10: d,
      countryOfOrigin: iso,
      customsValueUsd: 10000,
      quantities: {},
      entryDate: '2026-10-13',
      confirmations: { facts },
      ...(spi ? { claimedSpi: spi } : {}),
    } as any,
    line,
    m
  );
  console.log(
    h,
    iso,
    JSON.stringify(facts),
    spi ?? '',
    '=>',
    r.error ??
      `${r.totalDutyUsd} ${((r as any).lines ?? (r as any).breakdown ?? [])
        .map((x: any) => `${x.code ?? x.ch99Code ?? ''}:${x.amountUsd ?? x.dutyUsd ?? ''}`)
        .join(' ')}`
  );
}
