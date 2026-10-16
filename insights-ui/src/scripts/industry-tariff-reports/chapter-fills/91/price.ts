import { readFileSync } from 'node:fs';
import { calculateWithMeasures } from '@/utils/tariff-calculator/measures-engine';
import { parseExtendedRate } from '@/utils/tariff-reports/shipment-duty';
const measures = JSON.parse(readFileSync('@/tariff-data/calculator/measures.json', 'utf8')).measures;
const ex = JSON.parse(readFileSync(process.argv[2], 'utf8'));
for (const e of ex) {
  const rate = parseExtendedRate(e.general);
  const r = calculateWithMeasures(
    {
      hts10: e.hts10,
      countryOfOrigin: e.cc,
      customsValueUsd: e.value,
      quantities: e.q ?? { NO: 1 },
      componentValuesUsd: e.comp,
      entryDate: '2026-10-13',
      ...(e.spi ? { claimedSpi: e.spi } : {}),
      ...(e.facts ? { confirmations: { facts: e.facts } } : {}),
      ...(e.refs ? { referencedLines: e.refs } : {}),
    } as any,
    { hts10: e.hts10, general: e.general, special: e.special ?? null, column2: e.column2 ?? null, units: ['No.'] },
    measures
  );
  if (process.env.FULL) console.log(JSON.stringify(r).slice(0, 3000));
  console.log(
    e.label,
    '|',
    e.cc,
    '| comps',
    JSON.stringify(rate?.components?.map((c: any) => c.component)),
    '| total',
    r.error ?? r.totalDutyUsd.toFixed(2),
    '|',
    (r as any).lines?.map((l: any) => `${l.label}: ${l.amountUsd?.toFixed?.(2)}`).join('; ')
  );
}
