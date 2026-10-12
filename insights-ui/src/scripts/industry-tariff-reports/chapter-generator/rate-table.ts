import type { TariffProductGroup, TariffRateTableRow, TariffSpiLegendEntry } from '@/types/tariff-chapter-prototype';
import type { MeasureEngineLine } from '@/types/tariff-calculator-measures';
import { parseSpecialRates, SPECIAL_PROGRAMS } from '@/utils/tariff-calculator/measures-engine';
import { rateRowSearchText } from '@/utils/tariff-reports/chapter-prototype';
import { shortenDescription } from '@/utils/tariff-reports/line-labels';
import type { HtsJsonRow } from '../../tariff-calculator/lib/hts-source';
import { TODO } from './placeholders';

// overview.rateTable from the USITC HTS JSON, exactly like the Chapter 01 / 30 reference files:
// HTSUS states a duty once (usually on the 8-digit line) and leaves the 10-digit statistical lines
// blank, so each row's effective* rates come from the nearest row at or above it (by indent) that
// states a general rate, and *InheritedFrom names that row.

export const RATE_TABLE_NOTE =
  'Rates shown in grey are inherited from the parent heading. HTSUS states a duty once on the 8-digit line and leaves the 10-digit statistical lines blank; this table resolves each line to the rate that actually applies to it.';

/** Rows of one chapter, in schedule order (grouping rows without an HTS number belong to the chapter above them). */
export function chapterJsonRows(rows: readonly HtsJsonRow[], chapter: number): HtsJsonRow[] {
  const prefix = String(chapter).padStart(2, '0');
  const out: HtsJsonRow[] = [];
  // Unnumbered rows are held until the next numbered row shows whose they are: a grouping row inside
  // the chapter is kept, a heading of the next chapter ("I. CHEMICAL ELEMENTS" before 2801) is not.
  let pending: HtsJsonRow[] = [];
  let inChapter = false;
  for (const r of rows) {
    const no = (r.htsno ?? '').trim();
    if (!no) {
      if (inChapter) pending.push(r);
      continue;
    }
    if (no.slice(0, 2) === prefix) {
      inChapter = true;
      out.push(...pending, r);
      pending = [];
    } else if (inChapter) break;
  }
  if (out.length === 0) throw new Error(`chapter ${prefix} not found in the HTS JSON`);
  return out;
}

function text(v: string | null | undefined): string | null {
  const t = (v ?? '').trim();
  return t ? t : null;
}

function stripColon(description: string): string {
  return description.trim().replace(/:\s*$/, '');
}

export function htsDigits(hts: string): string {
  return hts.replace(/\D/g, '');
}

export function buildRateTableRows(jsonRows: readonly HtsJsonRow[]): TariffRateTableRow[] {
  const stack: { indent: number; row: TariffRateTableRow }[] = [];
  const out: TariffRateTableRow[] = [];
  let heading: string | null = null;
  jsonRows.forEach((r, i) => {
    const indent = Number(r.indent) || 0;
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop();
    const hts = text(r.htsno);
    const digits = hts ? htsDigits(hts) : '';
    if (hts) heading = digits.slice(0, 4);
    const description = (r.description ?? '').trim();
    const units = (r.units ?? []).filter((u) => typeof u === 'string' && u.trim() !== '');
    const general = text(r.general);
    const special = text(r.special);
    const column2 = text(r.other);
    // The row that states the rate: this one, or the nearest ancestor with a general rate.
    let source: TariffRateTableRow | null = null;
    if (!general) {
      for (let k = stack.length - 1; k >= 0; k--) {
        if (stack[k].row.general) {
          source = stack[k].row;
          break;
        }
      }
    }
    const effectiveGeneral = general ?? source?.general ?? null;
    const effectiveSpecial = general ? special : source?.special ?? null;
    const effectiveColumn2 = general ? column2 : source?.column2 ?? null;
    const ancestorPath = stack.map((s) => stripColon(s.row.description));
    const row: TariffRateTableRow = {
      id: `r${i}`,
      hts,
      htsCode10: digits.length === 10 ? digits : null,
      indent,
      description,
      isHeaderRow: !hts || (!general && units.length === 0),
      units,
      general,
      special,
      column2,
      additionalDuties: text(r.additionalDuties),
      quotaQuantity: text(r.quotaQuantity),
      effectiveGeneral,
      effectiveSpecial,
      effectiveColumn2,
      generalInheritedFrom: !general && source?.general ? source.hts : null,
      specialInheritedFrom: !general && source?.special ? source.hts : null,
      column2InheritedFrom: !general && source?.column2 ? source.hts : null,
      dutiable: isDutiable(effectiveGeneral),
      heading,
      ancestorPath,
      searchText: rateRowSearchText({ ancestorPath, description, hts }),
    };
    out.push(row);
    stack.push({ indent, row });
  });
  return out;
}

export function isDutiable(general: string | null): boolean {
  return !!general && !/^\s*free\s*$/i.test(general);
}

/** The 10-digit lines (the rows a shipment is entered under). */
export function leafLines(rows: TariffRateTableRow[]): TariffRateTableRow[] {
  return rows.filter((r) => r.htsCode10);
}

export function engineLine(row: TariffRateTableRow): MeasureEngineLine {
  return { hts10: row.htsCode10 as string, general: row.effectiveGeneral, special: row.effectiveSpecial, column2: row.effectiveColumn2, units: row.units };
}

/** Distinct values in first-seen order. */
export function distinct<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export interface HeadingInfo {
  heading: string;
  /** The heading row's description, e.g. "Live horses, asses, mules and hinnies:". */
  description: string;
  label: string;
  shortLabel: string;
  lines: TariffRateTableRow[];
  baseRates: string[];
}

/** First clause of a heading description, ≤ 60 characters at a word boundary. A draft label: writers shorten it. */
export function headingLabel(description: string): string {
  let t = stripColon(description).split(/;\s/)[0].trim();
  if (t.length > 60) {
    const cut = t.slice(0, 59);
    t = `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 30)).replace(/[\s,;:-]+$/, '')}…`;
  }
  return t;
}

export function headingsOf(rows: TariffRateTableRow[]): HeadingInfo[] {
  const out: HeadingInfo[] = [];
  for (const r of rows) {
    if (!r.heading) continue;
    let h = out.find((x) => x.heading === r.heading);
    if (!h) {
      // Normally the four-digit row; a heading with a single subheading (e.g. 0205.00.00) has none, so use its first row.
      const description = r.description || r.heading;
      h = { heading: r.heading, description, label: headingLabel(description), shortLabel: shortenDescription(description), lines: [], baseRates: [] };
      out.push(h);
    }
    if (r.htsCode10) h.lines.push(r);
  }
  for (const h of out) h.baseRates = distinct(h.lines.map((l) => l.effectiveGeneral ?? '—'));
  return out.filter((h) => h.lines.length > 0);
}

export function productGroups(headings: HeadingInfo[]): TariffProductGroup[] {
  return headings.map((h) => ({
    heading: h.heading,
    label: h.label,
    blurb: TODO,
    rateSummary: h.baseRates.join(' · '),
    lineCount: h.lines.length,
    dutiableLineCount: h.lines.filter((l) => l.dutiable).length,
    searchExamples: [TODO],
  }));
}

/** Names per HTSUS General Note 3(c)(i), as the reference chapters print them. */
const SPI_NAMES: Record<string, string> = {
  A: 'Generalized System of Preferences (GSP)',
  'A*': 'GSP — some beneficiary countries excluded',
  'A+': 'GSP — least-developed beneficiary countries',
  AU: 'United States–Australia FTA',
  B: 'Automotive Products Trade Act',
  BH: 'United States–Bahrain FTA',
  C: 'Agreement on Trade in Civil Aircraft',
  CA: 'NAFTA (Canada) — superseded by USMCA',
  CL: 'United States–Chile FTA',
  CO: 'United States–Colombia TPA',
  D: 'African Growth and Opportunity Act (AGOA)',
  E: 'Caribbean Basin Economic Recovery Act (CBERA)',
  'E*': 'CBERA — some beneficiary countries excluded',
  IL: 'United States–Israel FTA',
  J: 'Andean Trade Preference Act (ATPA)',
  'J*': 'ATPA — some beneficiary countries excluded',
  'J+': 'Andean Trade Promotion and Drug Eradication Act (ATPDEA)',
  JO: 'United States–Jordan FTA',
  JP: 'United States–Japan Trade Agreement',
  K: 'Agreement on Trade in Pharmaceutical Products',
  KR: 'United States–Korea FTA',
  L: 'Uruguay Round Concessions on Intermediate Chemicals for Dyes',
  MA: 'United States–Morocco FTA',
  MX: 'NAFTA (Mexico) — superseded by USMCA',
  N: 'Nepal Preference Program',
  OM: 'United States–Oman FTA',
  P: 'Dominican Republic–Central America FTA (CAFTA-DR)',
  'P+': 'CAFTA-DR — additional originating goods',
  PA: 'United States–Panama TPA',
  PE: 'United States–Peru TPA',
  R: 'United States–Caribbean Basin Trade Partnership Act (CBTPA)',
  S: 'United States–Mexico–Canada Agreement (USMCA)',
  'S+': 'USMCA — additional originating goods',
  SG: 'United States–Singapore FTA',
  W: 'Haiti Hope / Help programs',
};

export function spiLegend(rows: TariffRateTableRow[]): TariffSpiLegendEntry[] {
  const codes = new Set<string>();
  for (const r of rows) for (const e of parseSpecialRates(r.special)) for (const p of e.programs) codes.add(p);
  return Array.from(codes)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((code) => ({ code, name: SPI_NAMES[code] ?? SPECIAL_PROGRAMS[code]?.name ?? `Program ${code}` }));
}
