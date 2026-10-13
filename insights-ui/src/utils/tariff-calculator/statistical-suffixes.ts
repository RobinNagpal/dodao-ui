import statisticalSuffixesJson from '@/tariff-data/calculator/statistical-suffixes.json';
import type { TariffMeasureSource } from '@/types/tariff-calculator-measures';

// Statistical reporting numbers the USITC HTS JSON does not print (issue #1812). About 95 Chapter 91 subheadings
// (watches, clocks, watch and clock movements with compound rates such as "44¢ each + 6% on the case + 14% on the strap,
// band or bracelet + 5.3% on the battery") appear in the JSON as 8-digit lines with a rate, no units and no 10-digit
// rows. Chapter 91 statistical note 1 defines their 10-digit numbers: the importer combines the 8-digit subheading with
// a component suffix ("9102.11.10" + "10" movement, "20" case, "30" strap, band or bracelet, "40" battery), reports
// every component (zero when absent) and values each one; the values add up to the article's value. CBP applies the
// subheading's rate across those components (ruling N362026: 9102.21.7010 movement $1.53 each, .7020 case 4.2%, .7030
// strap 9.8%), i.e. the 8-digit rate priced once on the whole article.
//
// So these numbers are real HTS statistical reporting numbers, not invented ones: hts_codes holds them as rows under
// their 8-digit subheading (rates blank, inherited from it like any statistical row), the calculator accepts any of them
// and prices the subheading's rate once with the component values, and the chapter generator lists one line per
// subheading keyed by its first number. Pure (static import), like rate-notes.ts.

export interface StatisticalSuffixRow {
  /** Two-digit statistical suffix; absent on a grouping row ("Travel clocks:"). */
  suffix?: string;
  description: string;
  /** Unit of quantity as the note prints it ("No.", "No. of movements", "Jwls."). */
  units?: string[];
  /** Levels below the 8-digit subheading (default 1). */
  depth?: number;
}

export interface StatisticalSuffixScheme {
  /** Paragraph of the statistical note, e.g. "1(a)". */
  note: string;
  /** Dotted 8-digit subheadings, e.g. "9102.11.10". */
  subheadings: string[];
  rows: StatisticalSuffixRow[];
}

export interface StatisticalSuffixesFile {
  description: string;
  htsEdition: string;
  reviewedAt: string;
  sources: TariffMeasureSource[];
  schemes: StatisticalSuffixScheme[];
}

export const STATISTICAL_SUFFIXES: StatisticalSuffixesFile = statisticalSuffixesJson as unknown as StatisticalSuffixesFile;

let bySubheading: Map<string, StatisticalSuffixScheme> | null = null;

function schemeIndex(): Map<string, StatisticalSuffixScheme> {
  if (bySubheading) return bySubheading;
  const index = new Map<string, StatisticalSuffixScheme>();
  for (const scheme of STATISTICAL_SUFFIXES.schemes) {
    for (const sub of scheme.subheadings) {
      if (index.has(sub)) throw new Error(`statistical-suffixes.json lists ${sub} in two schemes`);
      index.set(sub, scheme);
    }
  }
  bySubheading = index;
  return index;
}

/** "9102111010" / "91021110" / "9102.11.10" → "9102.11.10". */
function subheadingOf(code: string): string {
  const digits = code.replace(/\D/g, '').slice(0, 8);
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
}

/** The statistical-note scheme of an 8-digit subheading (any form of the code), or null. */
export function statisticalSuffixScheme(code: string): StatisticalSuffixScheme | null {
  if (code.replace(/\D/g, '').length < 8) return null;
  return schemeIndex().get(subheadingOf(code)) ?? null;
}

/** Every dotted subheading the statistical notes cover, e.g. "9102.11.10". */
export function statisticalSuffixSubheadings(): string[] {
  return Array.from(schemeIndex().keys());
}

/** The subheading's statistical reporting numbers (10 digits, no dots), in note order. */
export function statisticalReportingNumbers(code: string): string[] {
  const scheme = statisticalSuffixScheme(code);
  if (!scheme) return [];
  const base = code.replace(/\D/g, '').slice(0, 8);
  return scheme.rows.filter((r) => r.suffix).map((r) => `${base}${r.suffix}`);
}

/** The subheading's first statistical reporting number: the line key the chapter generator uses for it. */
export function primaryStatisticalNumber(code: string): string | null {
  return statisticalReportingNumbers(code)[0] ?? null;
}

/** "9102111020" → "9102.11.10.20". */
function dotted(hts10: string): string {
  return hts10.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
}

/** "Travel clocks: .10 movement, .20 case; other clocks: .30 movement, .40 case" (group labels when the note has them). */
function suffixSummary(scheme: StatisticalSuffixScheme): string {
  const parts: string[] = [];
  let group: string | null = null;
  let current: string[] = [];
  const flush = (): void => {
    if (current.length > 0) parts.push(group ? `${group}: ${current.join(', ')}` : current.join(', '));
    current = [];
  };
  for (const row of scheme.rows) {
    if (!row.suffix) {
      // Nested groups ("Other:" → "Travel clocks:") are named by their innermost label.
      flush();
      group = row.description.replace(/:\s*$/, '');
      continue;
    }
    if ((row.depth ?? 1) === 1 && group) {
      flush();
      group = null;
    }
    current.push(`.${row.suffix} ${row.description.charAt(0).toLowerCase()}${row.description.slice(1)}`);
  }
  flush();
  return parts.join('; ');
}

/**
 * The calculator note for a line entered under statistical note 1, or null for any other line: which numbers the
 * article is reported under and that the subheading's rate is priced once on the whole article.
 */
export function statisticalSuffixNote(hts10: string): string | null {
  const scheme = statisticalSuffixScheme(hts10);
  if (!scheme || !statisticalReportingNumbers(hts10).includes(hts10)) return null;
  const sub = subheadingOf(hts10);
  return (
    `Chapter 91 statistical note ${scheme.note}: an article of subheading ${sub} is entered under one statistical number per component ` +
    `(${suffixSummary(scheme)}), each valued separately so that the values add up to the article's value; components not in the shipment ` +
    `are reported at zero. The duty is the ${sub} rate, priced once on the whole article (the same for any of these numbers, here ${dotted(hts10)}): ` +
    `enter the whole article's customs value and the value of each part the rate names.`
  );
}
