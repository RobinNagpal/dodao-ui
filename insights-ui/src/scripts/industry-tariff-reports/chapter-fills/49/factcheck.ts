// Re-price every "X if yes / Y if no" matrix cell of chapter 49 with informationalMaterials = true / false.
import { readFileSync } from 'node:fs';
import { calculateWithMeasures, normalizeUom } from '@/utils/tariff-calculator/measures-engine';
import { countryCodeForName, parseRateVariants, rateDollars, quantityUnits } from '@/utils/tariff-reports/shipment-duty';

const W = process.cwd(); // run from insights-ui/
const p = JSON.parse(readFileSync(`${W}/src/tariff-data/chapters/49-printing-industry-products.json`, 'utf8'));
const measures = JSON.parse(readFileSync(`${W}/src/tariff-data/calculator/measures.json`, 'utf8')).measures;
const rows = new Map<string, any>(p.overview.rateTable.rows.filter((r: any) => r.htsCode10).map((r: any) => [r.hts, r]));
let compared = 0,
  bad = 0;
for (const c of p.industryAreas.countries) {
  const iso = countryCodeForName(c.country);
  if (!iso) continue;
  const sides =
    c.rule.kind === 'usmca'
      ? [
          ['withoutUsmca', false],
          ['withUsmca', true],
        ]
      : [['withoutUsmca', false]];
  for (const [h, cell] of Object.entries<any>(c.cells)) {
    for (const [key, usmca] of sides as [string, boolean][]) {
      for (const b of cell[key].breakdown) {
        const vs = parseRateVariants(b.total);
        if (!vs) continue;
        for (const v of vs) {
          const fact = v.label === 'if yes' ? true : v.label === 'if no' ? false : vs.length === 1 ? null : undefined;
          if (fact === undefined || !v.range.exact) continue;
          const uq: Record<string, number> = {};
          for (const u of quantityUnits([v.range.low])) uq[u.key] = 1000;
          const expected = rateDollars(v.range.low, 10000, uq);
          for (const hts of b.lines) {
            const r = rows.get(hts);
            const q: Record<string, number> = {};
            for (const u of ['NO', 'KG', 'THS', ...r.units]) {
              const k = normalizeUom(u);
              if (k) q[k] = 1000;
            }
            const facts = fact === null ? undefined : { informationalMaterials: fact };
            const res = calculateWithMeasures(
              {
                hts10: r.htsCode10,
                countryOfOrigin: iso,
                customsValueUsd: 10000,
                quantities: q,
                ...(usmca ? { claimedSpi: 'S' } : {}),
                ...(facts ? { confirmations: { facts } } : {}),
                entryDate: p.industryAreas.lastCheckedAt,
              } as any,
              { hts10: r.htsCode10, general: r.effectiveGeneral, special: r.effectiveSpecial, column2: r.effectiveColumn2, units: r.units } as any,
              measures
            );
            compared++;
            if (res.error || expected === null || Math.abs(res.totalDutyUsd - expected) > 0.01) {
              bad++;
              if (bad < 10) console.log('MISMATCH', c.country, key, hts, b.total, v.label, res.error ?? res.totalDutyUsd, expected);
            }
          }
        }
      }
    }
  }
}
console.log(`compared ${compared}, mismatches ${bad}`);
