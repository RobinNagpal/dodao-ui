import { readFileSync } from 'node:fs';
import { measureReachesLine } from '@/scripts/industry-tariff-reports/chapter-generator/line-rates';
const mf = JSON.parse(readFileSync('src/tariff-data/calculator/measures.json', 'utf8'));
const lines = ['2401106530', '2401201460', '2402208000', '2402102020', '2403192050', '2404120510', '2404910000', '2403992140'];
for (const m of mf.measures) {
  const hit = lines.filter((l) => measureReachesLine(m, l));
  const excl = lines.filter((l) => !measureReachesLine(m, l));
  if (!hit.length) {
    continue;
  }
  console.log(
    [
      m.measureKey,
      m.ch99Code,
      m.program,
      m.ratePct,
      m.rateKind,
      m.effectiveFrom,
      m.effectiveTo,
      (m.countriesInclude || []).slice(0, 5).join('|'),
      hit.length + '/' + lines.length,
      excl.join(','),
    ].join(' ; ')
  );
}
