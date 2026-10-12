import type {
  TariffCountryRule,
  TariffIndustryAreasContent,
  TariffMatrixCellRates,
  TariffMatrixCountry,
  TariffRateBreakdownRow,
  TariffRateTableRow,
} from '@/types/tariff-chapter-prototype';
import type { TariffMeasureRecord } from '@/types/tariff-calculator-measures';
import { COUNTRY_OPTIONS } from '@/utils/tariff-calculator/countries';
import { COLUMN2_COUNTRIES, USMCA_SPI_CODES } from '@/utils/tariff-calculator/measures-engine';
import { todo, TODO } from './placeholders';
import type { HeadingInfo } from './rate-table';
import {
  countryInScope,
  evaluateLine,
  exprString,
  fmtPct,
  ftaClaimsFor,
  inEffectOn,
  type LineRateResult,
  measureReachesLine,
  NOMINAL_QUANTITY,
  NOMINAL_VALUE_USD,
  programShort,
  type RateExpr,
  usmcaClaimFor,
} from './line-rates';
import type { SourceRegistry } from './sources';

// industryAreas: the country × heading matrix. Every cell is computed by running each of the heading's
// 10-digit lines through the official-measures engine (calculateWithMeasures — the live calculator's
// function) for that country, with and without a USMCA claim for Canada / Mexico, then grouping the
// lines by identical base / extra / preference / total into breakdown rows like the reference files.

export const ANY_OTHER_COUNTRY = 'Any other country';
const USMCA_COUNTRIES = ['CA', 'MX'];

export interface MatrixCountryInput {
  iso: string;
  name: string;
  importsUsd: number;
  /** Imports by four-digit heading. */
  byHeading: Record<string, number>;
}

export interface IndustryAreasInput {
  chapterPadded: string;
  title: string;
  headings: HeadingInfo[];
  measures: TariffMeasureRecord[];
  countries: MatrixCountryInput[];
  /** Imports of every country not listed (total and by heading); null without trade data. */
  others: { importsUsd: number; byHeading: Record<string, number> } | null;
  tradeYear: number | null;
  asOf: string;
  edition: string;
  sources: SourceRegistry;
  /** Extra SPI claims per ISO country beyond the country-tied FTAs (e.g. { MU: ['D'] } for AGOA). */
  extraClaims: Record<string, string[]>;
}

export interface IndustryAreasResult {
  content: TariffIndustryAreasContent;
  problems: string[];
  notes: string[];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function breakdownFields(r: LineRateResult): Omit<TariffRateBreakdownRow, 'lines' | 'lineCount'> {
  if (r.variants.length === 0) return { base: r.base, extra: TODO, preference: TODO, total: todo(`engine could not price ${r.hts}; see the generator log`) };
  if (r.variants.length === 1) {
    const v = r.variants[0];
    return { base: r.base, extra: v.extra, preference: v.preference, total: v.total };
  }
  return {
    base: r.base,
    extra: r.variants.map((v) => `${cap(v.label ?? '')}: ${v.extra}`).join('. '),
    preference: r.variants[0].preference,
    total: r.variants.map((v) => `${v.total} ${v.label}`).join(' / '),
  };
}

function variantTotals(r: LineRateResult): string[] {
  if (r.variants.length <= 1) return [breakdownFields(r).total];
  return r.variants.map((v, i) => (i === 0 ? v.total : `${v.total} ${v.label?.startsWith('if ') ? v.label : `if ${v.label}`}`));
}

/** Groups lines by identical base / extra / preference / total, most lines first. */
export function cellRates(results: LineRateResult[]): TariffMatrixCellRates {
  const rows: (TariffRateBreakdownRow & { totals: string[] })[] = [];
  for (const r of results) {
    const f = breakdownFields(r);
    let row = rows.find((x) => x.base === f.base && x.extra === f.extra && x.preference === f.preference && x.total === f.total);
    if (!row) {
      row = { ...f, lines: [], lineCount: 0, totals: variantTotals(r) };
      rows.push(row);
    }
    row.lines.push(r.hts);
    row.lineCount++;
  }
  const sorted = rows.map((r, i) => ({ r, i })).sort((a, b) => b.r.lineCount - a.r.lineCount || a.i - b.i);
  const totals: string[] = [];
  for (const { r } of sorted) for (const t of r.totals) if (!totals.includes(t)) totals.push(t);
  return {
    totals,
    breakdown: sorted.map(({ r }) => ({ base: r.base, lines: r.lines, lineCount: r.lineCount, extra: r.extra, preference: r.preference, total: r.total })),
  };
}

function cheapest(results: LineRateResult[]): LineRateResult {
  const score = (r: LineRateResult): number => (r.variants.length === 0 ? Number.POSITIVE_INFINITY : Math.min(...r.variants.map((v) => v.dollars)));
  return results.reduce((best, r) => (score(r) < score(best) - 0.005 ? r : best));
}

function measureByCode(measures: TariffMeasureRecord[], code: string): TariffMeasureRecord | undefined {
  return measures.find((m) => m.ch99Code === code && m.rateKind !== 'relief');
}

function codeRange(codes: string[]): string {
  const sorted = Array.from(new Set(codes)).sort();
  if (sorted.length <= 2) return sorted.join(', ');
  return `${sorted[0]}–${sorted[sorted.length - 1]}`;
}

function modeOf(values: number[]): number {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = 0;
  let bestN = -1;
  counts.forEach((n, v) => {
    if (n > bestN || (n === bestN && v > best)) {
      best = v;
      bestN = n;
    }
  });
  return best;
}

function sourceIdsFor(sources: SourceRegistry, measures: TariffMeasureRecord[]): string[] {
  const ids: string[] = [];
  for (const m of measures) for (const s of m.sources) ids.push(sources.add(s));
  return Array.from(new Set([...ids, 'hts-now']));
}

function ruleFor(
  iso: string,
  name: string,
  withoutResults: LineRateResult[],
  measures: TariffMeasureRecord[],
  sources: SourceRegistry,
  asOf: string,
  claimsUsed: Set<string>
): TariffCountryRule {
  const codeCount = new Map<string, number>();
  const perLinePct: number[] = [];
  for (const r of withoutResults) {
    const lineCodes = new Set<string>();
    let maxPct = 0;
    for (const v of r.variants) {
      let sum = 0;
      for (const c of v.chargedCodes) {
        lineCodes.add(c);
        sum += measureByCode(measures, c)?.ratePct ?? 0;
      }
      maxPct = Math.max(maxPct, sum);
    }
    lineCodes.forEach((c) => codeCount.set(c, (codeCount.get(c) ?? 0) + 1));
    perLinePct.push(maxPct);
  }
  const codes = Array.from(codeCount.keys()).sort(
    (a, b) => (codeCount.get(b) ?? 0) - (codeCount.get(a) ?? 0) || (measureByCode(measures, b)?.ratePct ?? 0) - (measureByCode(measures, a)?.ratePct ?? 0)
  );
  const charged = codes.map((c) => measureByCode(measures, c)).filter((m): m is TariffMeasureRecord => !!m);
  const main = charged[0];
  const total = withoutResults.length;
  const describe = (m: TariffMeasureRecord): string => {
    const n = codeCount.get(m.ch99Code) ?? 0;
    const scope = n < total ? ` on ${n} of ${total} lines` : '';
    const pct = fmtPct(m.ratePct ?? 0);
    if (m.rateKind === 'additive') return `+${pct} ${m.program} (${m.ch99Code})${scope}`;
    if (m.rateKind === 'inPlaceOfBase') return `${pct} in place of the base rate, ${m.program} (${m.ch99Code})${scope}`;
    return `${pct} in place of the base rate when the base rate is lower, ${m.program} (${m.ch99Code})${scope}`;
  };
  const isUsmca = USMCA_COUNTRIES.includes(iso);
  const relief = isUsmca
    ? measures.find(
        (m) =>
          m.rateKind === 'relief' &&
          m.conditions?.usmcaQualifying === true &&
          countryInScope(m, iso) &&
          inEffectOn(m, asOf) &&
          main &&
          m.replacesCodes.includes(main.ch99Code)
      )
    : undefined;
  const otherwise = charged.length > 0 ? `base rate ${charged.map(describe).join(' ')}` : 'base rate only; no extra duty applies to these lines';
  const claims = Array.from(claimsUsed).filter((c) => !USMCA_SPI_CODES.includes(c));
  const claimText = claims.length > 0 ? ` Preference applied where the line offers it: ${claims.join(', ')}.` : '';
  let label: string;
  if (isUsmca) label = `USMCA-qualifying: no extra duty${relief ? ` (${relief.ch99Code})` : ''}. Otherwise ${otherwise}.`;
  else label = `${cap(otherwise)}.${claimText}`;
  return {
    kind: isUsmca ? 'usmca' : main && main.rateKind !== 'additive' ? 'eu15' : 'additive',
    extraPct: modeOf(perLinePct),
    ch99Code: main ? main.ch99Code : 'None',
    ...(relief ? { usmcaCode: relief.ch99Code } : {}),
    label: `${label} ${todo(`review the rule label for ${name} (ended duties, exemption lists)`)}`,
    sourceIds: sourceIdsFor(sources, [...charged, ...(relief ? [relief] : [])]),
  };
}

/** Countries the "Any other country" row stands for, one representative per distinct set of country-specific measures. */
function otherCountryReps(listed: Set<string>, measures: TariffMeasureRecord[], asOf: string): { iso: string; members: string[] }[] {
  const bySig = new Map<string, { iso: string; members: string[] }>();
  for (const c of COUNTRY_OPTIONS) {
    if (listed.has(c.code) || c.code === 'US' || COLUMN2_COUNTRIES.includes(c.code)) continue;
    const sig = measures
      .filter((m) => m.countriesInclude.length > 0 && countryInScope(m, c.code) && inEffectOn(m, asOf))
      .map((m) => m.measureKey)
      .sort()
      .join('|');
    const excluded = measures
      .filter((m) => m.countriesInclude.length === 0 && m.countriesExclude.includes(c.code))
      .map((m) => m.measureKey)
      .join('|');
    const key = `${sig}#${excluded}`;
    const entry = bySig.get(key);
    if (entry) entry.members.push(c.code);
    else bySig.set(key, { iso: c.code, members: [c.code] });
  }
  return Array.from(bySig.values());
}

function countryNameOf(iso: string): string {
  return COUNTRY_OPTIONS.find((c) => c.code === iso)?.name ?? iso;
}

/** Code range of the program with the most headings among `codes` ("9903.05.20–9903.05.84"); "None" when empty. */
function mainProgramRange(codes: string[], measures: TariffMeasureRecord[]): string {
  const byProgram = new Map<string, string[]>();
  for (const c of Array.from(new Set(codes))) {
    const program = measureByCode(measures, c)?.program ?? c;
    byProgram.set(program, [...(byProgram.get(program) ?? []), c]);
  }
  const main = Array.from(byProgram.values()).sort((a, b) => b.length - a.length)[0];
  return main ? codeRange(main) : 'None';
}

function fmtNum(pct: number): string {
  return String(Number(pct.toFixed(4)));
}

/** "1¢/kg + 0–37.5%", "Free–37.5%", "6.8%–44.3%", or an exact rate when low = high. */
function rangeString(perUnit: string[], lo: number, hi: number): string {
  if (Math.abs(hi - lo) < 1e-9) return exprString({ perUnit, pct: lo });
  if (perUnit.length > 0) return `${perUnit.join(' + ')} + ${fmtNum(lo)}–${fmtPct(hi)}`;
  return lo < 1e-9 ? `Free–${fmtPct(hi)}` : `${fmtPct(lo)}–${fmtPct(hi)}`;
}

function anyOtherLine(row: TariffRateTableRow, reps: { iso: string }[], measures: TariffMeasureRecord[], asOf: string, problems: string[]): LineRateResult {
  const byLabel = new Map<string, { expr: RateExpr; dollars: number; codes: string[] }[]>();
  let base = '—';
  for (const rep of reps) {
    const r = evaluateLine(row, rep.iso, measures, { entryDate: asOf });
    base = r.base;
    for (const p of r.problems) problems.push(`[${ANY_OTHER_COUNTRY}] ${p}`);
    for (const v of r.variants) {
      if (!v.expr) continue;
      const key = v.label ?? '';
      const list = byLabel.get(key) ?? [];
      list.push({ expr: v.expr, dollars: v.dollars, codes: v.chargedCodes });
      byLabel.set(key, list);
    }
  }
  const hts = row.hts as string;
  const result: LineRateResult = { hts, base, variants: [], problems: [], notes: [], banned: null };
  byLabel.forEach((list, label) => {
    // Most countries keep the base rate's per-unit part; floor / in-place countries may drop it. Range over the majority shape.
    const shapes = new Map<string, number>();
    for (const x of list) shapes.set(x.expr.perUnit.join(' + '), (shapes.get(x.expr.perUnit.join(' + ')) ?? 0) + 1);
    const mainShape = Array.from(shapes.entries()).sort((a, b) => b[1] - a[1])[0][0];
    const main = list.filter((x) => x.expr.perUnit.join(' + ') === mainShape);
    const lo = Math.min(...main.map((x) => x.expr.pct));
    const hi = Math.max(...main.map((x) => x.expr.pct));
    const loD = Math.min(...main.map((x) => x.dollars));
    const hiD = Math.max(...main.map((x) => x.dollars));
    for (const x of list) {
      if (x.expr.perUnit.join(' + ') !== mainShape && (x.dollars < loD - 0.01 || x.dollars > hiD + 0.01)) {
        problems.push(`[${ANY_OTHER_COUNTRY}] ${hts}: "${exprString(x.expr)}" for some countries falls outside the range shown.`);
      }
    }
    // Extra: each program's span of rates and Chapter 99 codes across the countries.
    const programs = new Map<string, { pcts: Set<number>; codes: string[] }>();
    let someNone = false;
    for (const x of list) {
      if (x.codes.length === 0) someNone = true;
      for (const c of x.codes) {
        const m = measureByCode(measures, c);
        if (!m) continue;
        const p = programs.get(m.program) ?? { pcts: new Set<number>(), codes: [] };
        p.pcts.add(m.ratePct ?? 0);
        p.codes.push(c);
        programs.set(m.program, p);
      }
    }
    // A program charged by one country only reads "China a further +7.5% (9903.88.15)"; the others as a span by country.
    const spans: string[] = [];
    const singles: { iso: string; pct: number; codes: string[] }[] = [];
    for (const [program, p] of Array.from(programs.entries()).sort((a, b) => b[1].codes.length - a[1].codes.length)) {
      const pcts = Array.from(p.pcts).sort((a, b) => a - b);
      const ms = p.codes.map((c) => measureByCode(measures, c)).filter((m): m is TariffMeasureRecord => !!m);
      const isos = Array.from(new Set(ms.flatMap((m) => m.countriesInclude)));
      if (isos.length === 1) {
        singles.push({ iso: isos[0], pct: pcts[pcts.length - 1], codes: p.codes });
        continue;
      }
      const low = someNone && spans.length === 0 ? '0%' : `+${fmtPct(pcts[0])}`;
      const span = low === `+${fmtPct(pcts[pcts.length - 1])}` ? low : `${low} to +${fmtPct(pcts[pcts.length - 1])}`;
      spans.push(`${span} by country, ${programShort(program)} (${codeRange(p.codes)})`);
    }
    const further = singles.map(
      (x, i) =>
        `${spans.length === 0 && i === 0 && someNone ? 'None, except ' : ''}${countryNameOf(x.iso)} ${spans.length > 0 ? 'a further ' : ''}+${fmtPct(
          x.pct
        )} (${codeRange(x.codes)})`
    );
    const extraParts = [...spans, ...further];
    result.variants.push({
      label: label || null,
      total: rangeString(mainShape ? mainShape.split(' + ') : [], lo, hi),
      extra: extraParts.length > 0 ? extraParts.join('; ') : 'None',
      preference: 'None',
      dollars: loD,
      expr: null,
      chargedCodes: Array.from(new Set(list.flatMap((x) => x.codes))),
    });
  });
  result.variants.sort((a, b) => a.dollars - b.dollars);
  if (result.variants.length === 1) result.variants[0].label = null;
  return result;
}

export function buildIndustryAreas(input: IndustryAreasInput): IndustryAreasResult {
  const { headings, measures, asOf, sources } = input;
  const problems: string[] = [];
  const notes: string[] = [];
  const allLines = headings.flatMap((h) => h.lines);
  const countries: TariffMatrixCountry[] = [];
  const usedClaims = new Map<string, Set<string>>();

  for (const c of input.countries) {
    const isUsmca = USMCA_COUNTRIES.includes(c.iso);
    const withoutAll: LineRateResult[] = [];
    const claimsUsed = new Set<string>();
    const cells: TariffMatrixCountry['cells'] = {};
    for (const h of headings) {
      const without: LineRateResult[] = [];
      const withU: LineRateResult[] = [];
      for (const line of h.lines) {
        const plain = evaluateLine(line, c.iso, measures, { entryDate: asOf });
        let best = plain;
        if (!isUsmca) {
          const options = [plain];
          for (const spi of ftaClaimsFor(line, c.iso, input.extraClaims[c.iso] ?? [])) {
            const claimed = evaluateLine(line, c.iso, measures, { entryDate: asOf, claimedSpi: spi });
            if (!claimed.claimRejected && claimed.problems.length === 0) options.push(claimed);
            else if (claimed.problems.length > 0) notes.push(`${line.hts}: ${spi} claim for ${c.name} not priced (${claimed.problems[0]}); general rate used.`);
          }
          best = cheapest(options);
          for (const v of best.variants) {
            const spi = /\(([A-Z][A-Z0-9]?\+?)\)/.exec(v.preference)?.[1];
            if (spi) claimsUsed.add(spi);
          }
        }
        without.push(best);
        if (isUsmca) {
          const spi = usmcaClaimFor(line);
          const claimed = spi ? evaluateLine(line, c.iso, measures, { entryDate: asOf, claimedSpi: spi }) : null;
          if (!claimed || claimed.claimRejected) {
            withU.push({ ...plain, variants: plain.variants.map((v) => ({ ...v, preference: 'None (this line has no USMCA rate)' })) });
          } else withU.push(claimed);
        }
      }
      for (const r of [...without, ...withU]) {
        problems.push(...r.problems.map((p) => `[${c.name}] ${p}`));
        notes.push(...r.notes);
      }
      withoutAll.push(...without);
      const withoutRates = cellRates(without);
      cells[h.heading] = { importsUsd: c.byHeading[h.heading] ?? 0, withUsmca: isUsmca ? cellRates(withU) : withoutRates, withoutUsmca: withoutRates };
    }
    usedClaims.set(c.name, claimsUsed);
    countries.push({ country: c.name, rule: ruleFor(c.iso, c.name, withoutAll, measures, sources, asOf, claimsUsed), importsUsd: c.importsUsd, cells });
  }

  // "Any other country": every country not listed (column 2 countries aside), as a range.
  const listed = new Set(input.countries.map((c) => c.iso));
  const reps = otherCountryReps(listed, measures, asOf);
  const otherCells: TariffMatrixCountry['cells'] = {};
  const otherCodes: string[] = [];
  const otherMeasures = new Set<TariffMeasureRecord>();
  for (const h of headings) {
    const results = h.lines.map((line) => anyOtherLine(line, reps, measures, asOf, problems));
    for (const r of results)
      for (const v of r.variants)
        for (const code of v.chargedCodes) {
          otherCodes.push(code);
          const m = measureByCode(measures, code);
          if (m) otherMeasures.add(m);
        }
    const rates = cellRates(results);
    otherCells[h.heading] = { importsUsd: input.others?.byHeading[h.heading] ?? 0, withUsmca: rates, withoutUsmca: rates };
  }
  const maxOther = Math.max(0, ...Array.from(otherMeasures).map((m) => m.ratePct ?? 0));
  countries.push({
    country: ANY_OTHER_COUNTRY,
    rule: {
      kind: 'additive',
      extraPct: 0,
      ch99Code: mainProgramRange(otherCodes, measures),
      atLeast: true,
      label: `Countries outside the listed measures pay only the base rate; others pay up to +${fmtPct(maxOther)} per measure (${
        otherCodes.length > 0 ? mainProgramRange(otherCodes, measures) : 'none'
      }). ${todo('name the countries that pay the most and any country exception lists')}`,
      sourceIds: sourceIdsFor(sources, Array.from(otherMeasures)),
    },
    importsUsd: input.others?.importsUsd ?? 0,
    cells: otherCells,
  });

  // Biggest lanes: listed countries' heading cells by imports.
  const lanes = countries
    .filter((c) => c.country !== ANY_OTHER_COUNTRY)
    .flatMap((c) =>
      Object.entries(c.cells).map(([heading, cell]) => ({
        country: c.country,
        heading,
        importsUsd: cell.importsUsd,
        totals: c.rule.kind === 'usmca' ? cell.withUsmca.totals : cell.withoutUsmca.totals,
      }))
    )
    .filter((l) => l.importsUsd > 0)
    .sort((a, b) => b.importsUsd - a.importsUsd)
    .slice(0, 8);

  // Assumptions computed from the data; writers add the chapter-specific ones.
  const perUnitBase = allLines.some((l) => /[¢$]/.test(l.effectiveGeneral ?? ''));
  const conditional = measures.filter(
    (m) =>
      inEffectOn(m, asOf) &&
      (m.conditions?.endUse || m.conditions?.companyProgram || m.conditions?.usOriginIngredient || (m.conditions?.productDescriptionIds?.length ?? 0) > 0) &&
      allLines.some((l) => measureReachesLine(m, l.htsCode10 as string))
  );
  const claimsText = Array.from(usedClaims.entries())
    .filter(([, s]) => Array.from(s).some((c) => !USMCA_SPI_CODES.includes(c)))
    .map(([name, s]) => `${Array.from(s).join(', ')} for ${name}`);
  const assumptions = [
    `Each total was computed by the official-measures calculator engine (the same data as the tariff calculator: measures.json, HTSUS ${
      input.edition
    }) for goods entered on ${asOf}, priced on a $${NOMINAL_VALUE_USD.toLocaleString('en-US')} shipment and ${NOMINAL_QUANTITY.toLocaleString(
      'en-US'
    )} units for per-unit rates.`,
    'Ranges like "Free · 11.8%" mean the group has lines with different base rates; select a cell to see which lines carry which rate.',
    ...(perUnitBase
      ? ['A per-unit rate plus a percentage cannot be added into one number without the shipment’s weight, count or volume, so it is shown as written.']
      : []),
    `Preferences: USMCA (S) is applied for Canada and Mexico on the "USMCA-qualifying" side${
      claimsText.length > 0 ? `; ${claimsText.join('; ')}` : ''
    }. GSP (A, A+) has lapsed and is not applied. Other preferences are not applied.`,
    ...(conditional.length > 0
      ? [
          `Conditional relief is not applied (it needs the importer's confirmation): ${Array.from(
            new Set(conditional.map((m) => `${m.ch99Code} (${programShort(m.program)})`))
          ).join(', ')}.`,
        ]
      : []),
    `${ANY_OTHER_COUNTRY} shows the range across every country not listed (column 2 countries — Cuba, North Korea, Russia, Belarus — aside), without preferences.`,
    todo('add the chapter-specific assumptions: ended duties (IEEPA, Section 122), agency entry gates, exception lists checked'),
  ];

  const content: TariffIndustryAreasContent = {
    h1: `HTS Chapter ${input.chapterPadded}: ${input.title} — Tariff Rates by Country`,
    seo: { title: TODO, shortDescription: TODO, keywords: [TODO] },
    intro: TODO,
    scheduleEdition: input.edition,
    tradeYear: input.tradeYear ?? 0,
    lastCheckedAt: asOf,
    groups: headings.map((h) => ({ heading: h.heading, label: h.label, shortLabel: h.shortLabel, baseRates: h.baseRates })),
    countries,
    biggestLanes: lanes,
    assumptions,
    exemptionCheck: todo(
      `read the Chapter 99 notes for exemption / exception lists that name Chapter ${input.chapterPadded} codes, and say what was checked. ${exclusionSummary(
        measures,
        allLines,
        asOf
      )}`
    ),
    sources: [],
  };
  if (input.tradeYear === null) content.assumptions.push(todo('no trade data: set tradeYear and the importsUsd figures'));
  return { content, problems: Array.from(new Set(problems)), notes: Array.from(new Set(notes)) };
}

/** "9903.05.39 excludes 12 of 166 lines; …" — the coverage exclusions measures.json already models. */
function exclusionSummary(measures: TariffMeasureRecord[], lines: TariffRateTableRow[], asOf: string): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  for (const m of measures) {
    if (!inEffectOn(m, asOf) || m.coverageExclude.length === 0 || seen.has(m.ch99Code)) continue;
    const covered = lines.filter((l) => measureReachesLine({ ...m, coverageExclude: [] }, l.htsCode10 as string));
    const excluded = covered.filter((l) => !measureReachesLine(m, l.htsCode10 as string));
    if (excluded.length === 0) continue;
    seen.add(m.ch99Code);
    parts.push(`${m.ch99Code} (${programShort(m.program)}) excludes ${excluded.length} of ${covered.length} lines`);
  }
  return parts.length > 0 ? `Modelled exclusions: ${parts.join('; ')}.` : 'measures.json models no exclusion for this chapter.';
}
