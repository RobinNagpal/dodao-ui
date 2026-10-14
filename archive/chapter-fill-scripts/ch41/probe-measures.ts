import { readFileSync } from 'node:fs';
import { measureReachesLine, measureChargesLine, inEffectOn } from '@/scripts/industry-tariff-reports/chapter-generator/line-rates';
const W = '/Users/robin/projects/worktrees/chapter-migration-1812-b1/insights-ui';
const measures = JSON.parse(readFileSync(`${W}/src/tariff-data/calculator/measures.json`, 'utf8')).measures;
const gen = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const lines = gen.overview.rateTable.rows.filter((r: any) => r.htsCode10).map((r: any) => r.htsCode10 as string);
const day = '2026-10-12';
const fmt = (h: string) => `${h.slice(0,4)}.${h.slice(4,6)}.${h.slice(6,8)}${h.length>8?'.'+h.slice(8):''}`;
const ch = measures.filter((m: any) => lines.some((l: string) => measureReachesLine(m, l)));
for (const m of ch) {
  const reach = lines.filter((l: string) => measureReachesLine(m, l));
  const charge = lines.filter((l: string) => measureChargesLine(m, l, ch, day));
  const tag = `${m.measureKey} ${m.ch99Code} ${m.rateKind} ${m.ratePct ?? ''} [${m.countriesInclude.join(',')}] ${m.effectiveFrom}..${m.effectiveTo ?? ''} live=${inEffectOn(m, day)} cond=${JSON.stringify(m.conditions)} replaces=${m.replacesCodes.join(',')}`;
  const s = reach.length === lines.length ? 'ALL' : reach.length > 40 ? `${reach.length} lines; not: ${lines.filter((l: string)=>!reach.includes(l)).map(fmt).join(' ')}` : reach.map(fmt).join(' ');
  const c = charge.length === reach.length ? '' : ` | charges ${charge.length}; relieved: ${reach.filter((l: string)=>!charge.includes(l)).map(fmt).join(' ')}`;
  if (process.argv[3] && !tag.match(new RegExp(process.argv[3]))) continue;
  console.log(tag, '\n    ', s, c);
}
