// Parseability of the HTS base rates the official-measures engine prices (readiness gate, see calc-readiness.ts).
//
// The engine reads a line's general rate (column 2 for Cuba / North Korea / Russia / Belarus, or the special rate of a
// claimed trade program) with the shared parser in src/utils/tariff-reports/shipment-duty.ts. A rate the parser can't
// read — or reads into a unit the calculator can't ask a quantity for — is an error for every shipment of that line,
// so a chapter with one is NOT READY (unless a reviewed "rates" waiver in accepted-gaps.json accepts it).
//
// CI runs offline, so the distinct rate strings of every chapter are extracted once from the HTS JSON edition and
// committed as src/tariff-data/calculator/rate-strings.json (`pnpm tariff:rate-parse --hts-file <json>` rebuilds it).

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expandQuotaReference, isQuotaReference } from '@/utils/tariff-calculator/fta-quota';
import { parseSpecialRates, SPECIAL_PROGRAMS } from '@/utils/tariff-calculator/measures-engine';
import { resolveRateNote } from '@/utils/tariff-calculator/rate-notes';
import { isKnownUnitKey, parseExtendedRate } from '@/utils/tariff-reports/shipment-duty';
import { stackParents, editionByChapter } from './hts-lines-sync';
import type { HtsJsonRow } from './hts-source';
import { INSIGHTS_UI_ROOT } from './hts-source';

export const RATE_STRINGS_FILE = path.join(INSIGHTS_UI_ROOT, 'src', 'tariff-data', 'calculator', 'rate-strings.json');

export type RateColumn = 'general' | 'column2' | 'special';
export const RATE_COLUMNS: readonly RateColumn[] = ['general', 'column2', 'special'];

/** Rate text → [number of 10-digit lines it applies to, first such line]. */
export type RateStringCounts = Record<string, [number, string]>;

export interface RateStringsFile {
  htsEdition: string;
  htsJsonUrl: string;
  generatedAt: string;
  /** Chapter ("01") → column → distinct rate strings. `special` holds the whole special column as published. */
  chapters: Record<string, Record<RateColumn, RateStringCounts>>;
}

/**
 * Distinct general / column 2 / special rate strings per chapter (01–97), each 10-digit line taking its rates from the
 * nearest row up its indent hierarchy that states a general rate — the way loadMeasureEngineLine walks `parentId`.
 * Where the edition skips an indent level the hierarchy has no parent; then the nearest preceding row whose HTS number
 * is a prefix of the line's (its 8-digit subheading) is used, and the line is listed in `prefixFallbackLines`.
 */
export function buildRateStrings(
  rows: readonly HtsJsonRow[],
  edition: string,
  htsJsonUrl: string
): { file: RateStringsFile; prefixFallbackLines: string[]; noRateLines: string[] } {
  const chapters: RateStringsFile['chapters'] = {};
  const prefixFallbackLines: string[] = [];
  const noRateLines: string[] = [];
  for (const [chapter, lines] of Array.from(editionByChapter(rows)).sort((a, b) => a[0] - b[0])) {
    if (chapter > 97) continue;
    const key = String(chapter).padStart(2, '0');
    const out: Record<RateColumn, RateStringCounts> = { general: {}, column2: {}, special: {} };
    const parents = stackParents(lines.map((l) => l.indent));
    const add = (column: RateColumn, text: string | null, line: string): void => {
      if (!text) return;
      const prev = out[column][text];
      out[column][text] = prev ? [prev[0] + 1, prev[1]] : [1, line];
    };
    lines.forEach((l, i) => {
      if (!l.htsCode10) return;
      let j: number | null = i;
      while (j !== null && !lines[j].general) j = parents[j];
      if (j === null) {
        for (let k = i - 1; k >= 0; k--) {
          const n = (lines[k].htsNumber ?? '').replace(/\./g, '');
          if (n && lines[k].general && l.htsCode10.startsWith(n)) {
            j = k;
            break;
          }
        }
        if (j !== null) prefixFallbackLines.push(l.htsCode10);
      }
      if (j === null) {
        noRateLines.push(l.htsCode10);
        add('general', '(no general rate)', l.htsCode10);
        return;
      }
      const r = lines[j];
      add('general', r.general, l.htsCode10);
      add('column2', r.column2, l.htsCode10);
      add('special', r.special, l.htsCode10);
    });
    if (Object.keys(out.general).length > 0) chapters[key] = out;
  }
  return { file: { htsEdition: edition, htsJsonUrl, generatedAt: new Date().toISOString(), chapters }, prefixFallbackLines, noRateLines };
}

/**
 * Why the engine can't price a rate text: null when it parses into units the calculator can ask a quantity for. Rates
 * the calculator prices from importer answers count as priceable (issue #1812): value-of-component parts ("2.5% on the
 * value of the lead content" — asks for the value), references to another line's rate ("The rate applicable to each
 * garment in the ensemble if separately entered" — asks for the line(s)), embroidery / movement-plate bounds (asks the
 * condition, then the line) and "Free, under bond". With `note` (the chapter and column), "See additional U.S. note n"
 * is read through rate-notes.json.
 */
export function rateTextProblem(text: string, note?: { chapter: string; column: 'general' | 'column2' }): string | null {
  if (note) {
    const resolved = resolveRateNote(note.chapter, note.column, text);
    if (resolved && !resolved.ok) return resolved.error;
    if (resolved && resolved.ok) return rateTextProblem(resolved.rateText);
  }
  const parsed = parseExtendedRate(text);
  if (!parsed) return 'unreadable';
  const unknown = parsed.perUnit.map((c) => c.unit.key).filter((k) => !isKnownUnitKey(k));
  return unknown.length > 0 ? `unknown unit ${unknown.map((k) => `"${k}"`).join(', ')}` : null;
}

/**
 * Why the engine can't price a special entry that points to Chapter 98/99 FTA quota headings ("See 9822.04.01-9822.04.03"
 * for AU): null when every heading it names for the programs is in fta-quota-headings.json, is modelled and has a rate
 * the parser reads. (Above the quota without an over-quota heading the line's general rate applies; that is checked as
 * a general rate.)
 */
export function quotaReferenceProblem(rateText: string, programs: string[]): string | null {
  const { headings, missing } = expandQuotaReference(rateText);
  if (missing.length > 0) return `quota heading(s) ${missing.join(', ')} not in fta-quota-headings.json`;
  const own = headings.filter((h) => programs.some((p) => p.replace(/\*$/, '') === h.spi.replace(/\*$/, '')));
  if (own.length === 0) return `no heading in ${rateText} is listed for ${programs.join(', ')}`;
  const notModelled = own.find((h) => h.kind === 'notModelled');
  if (notModelled) return `quota heading ${notModelled.code} not modelled: ${notModelled.reason ?? 'no reason given'}`;
  for (const h of own) {
    const problem = rateTextProblem(h.rateText);
    if (problem) return `quota heading ${h.code} rate "${h.rateText}": ${problem}`;
  }
  return null;
}

/** One rate string of a chapter the engine can't price. */
export interface RateParseGap {
  column: RateColumn;
  rateText: string;
  /** Special column: the (not lapsed) programs the rate is listed for. */
  programs?: string[];
  problem: string;
  lines: number;
  exampleLine: string;
  /** Id of the accepted-gaps.json "rates" waiver that accepts it, if any. */
  acceptedBy?: string;
}

/** Every rate string of a chapter the engine can't price (special: only programs that aren't lapsed, i.e. claimable). */
export function chapterRateGaps(columns: Record<RateColumn, RateStringCounts> | undefined, chapter?: string): RateParseGap[] {
  if (!columns) return [];
  const gaps = new Map<string, RateParseGap>();
  const add = (gap: Omit<RateParseGap, 'lines' | 'exampleLine'>, lines: number, exampleLine: string): void => {
    const k = `${gap.column}\t${gap.rateText}\t${(gap.programs ?? []).join(',')}`;
    const prev = gaps.get(k);
    if (prev) prev.lines += lines;
    else gaps.set(k, { ...gap, lines, exampleLine });
  };
  for (const column of ['general', 'column2'] as const) {
    for (const [text, [lines, example]] of Object.entries(columns[column] ?? {})) {
      const problem = text === '(no general rate)' ? 'no general rate up the HTS hierarchy' : rateTextProblem(text, chapter ? { chapter, column } : undefined);
      if (problem) add({ column, rateText: text, problem }, lines, example);
    }
  }
  for (const [text, [lines, example]] of Object.entries(columns.special ?? {})) {
    for (const entry of parseSpecialRates(text)) {
      const programs = entry.programs.filter((p) => !SPECIAL_PROGRAMS[p]?.lapsed);
      if (programs.length === 0) continue;
      const problem = isQuotaReference(entry.rateText) ? quotaReferenceProblem(entry.rateText, programs) : rateTextProblem(entry.rateText);
      if (problem) add({ column: 'special', rateText: entry.rateText, programs, problem }, lines, example);
    }
  }
  return Array.from(gaps.values()).sort((a, b) => RATE_COLUMNS.indexOf(a.column) - RATE_COLUMNS.indexOf(b.column) || b.lines - a.lines);
}

export function describeRateGap(g: RateParseGap): string {
  const col = g.column === 'special' ? `special (${(g.programs ?? []).join(',')})` : g.column;
  const waived = g.acceptedBy ? ` — accepted (${g.acceptedBy})` : '';
  return `${col} "${g.rateText}": ${g.problem}; ${g.lines} line(s), e.g. ${g.exampleLine}${waived}`;
}

export function loadRateStrings(file = RATE_STRINGS_FILE): RateStringsFile {
  if (!existsSync(file)) throw new Error(`${path.relative(INSIGHTS_UI_ROOT, file)} not found — run pnpm tariff:rate-parse --hts-file <HTS JSON>`);
  return JSON.parse(readFileSync(file, 'utf8')) as RateStringsFile;
}
