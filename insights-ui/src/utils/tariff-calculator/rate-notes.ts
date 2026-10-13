import rateNotesJson from '@/tariff-data/calculator/rate-notes.json';
import type { TariffMeasureSource } from '@/types/tariff-calculator-measures';

// Rates the HTS states in a chapter's additional U.S. notes instead of the rate columns: chapter 58's embroidery lines
// (5810.91.00–5810.99.90) read "See additional U.S. note 3", and note 3 gives the general and column 2 rates
// ("7.4%, but in the case of embroidery in the piece not less than the rate which would apply to such product if not
// embroidered"). The reviewed note texts live in src/tariff-data/calculator/rate-notes.json; the engine prices the
// note's rate for the line's column. Pure (static import), like confirmation-facts.ts.

export interface RateNoteEntry {
  /** Two-digit chapter, e.g. "58". */
  chapter: string;
  note: number;
  /** The subheading the note gives rates for, e.g. "5810.92.90". */
  subheading: string;
  general: string;
  column2: string;
  sources: TariffMeasureSource[];
}

interface RateNotesFile {
  notes: RateNoteEntry[];
}

const NOTE_REF_RE = /^see additional u\.?\s?s\.? note (\d+)\.?$/i;

/** The note number of a "See additional U.S. note 3" rate; null for any other text. */
export function noteReferenceNumber(text: string | null | undefined): number | null {
  const m = (text ?? '').trim().match(NOTE_REF_RE);
  return m ? Number(m[1]) : null;
}

export function loadRateNotes(): RateNoteEntry[] {
  return (rateNotesJson as unknown as RateNotesFile).notes;
}

export type RateNoteColumn = 'general' | 'column2';

export type RateNoteResolution = { ok: true; rateText: string; entry: RateNoteEntry; note: string } | { ok: false; error: string };

/**
 * The rate a "See additional U.S. note n" cell stands for on one line (10 digits, or a chapter's "NN" when only the
 * chapter is known): the note's text for the column. Null when the text is not a note reference.
 */
export function resolveRateNote(lineOrChapter: string, column: RateNoteColumn, text: string | null | undefined): RateNoteResolution | null {
  const n = noteReferenceNumber(text);
  if (n === null) return null;
  const digits = lineOrChapter.replace(/\D/g, '');
  const chapter = digits.slice(0, 2);
  const entry = loadRateNotes().find((e) => e.chapter === chapter && e.note === n);
  if (!entry)
    return { ok: false, error: `"${text}": additional U.S. note ${n} to chapter ${chapter} is not in rate-notes.json, so the calculator can't price it.` };
  if (digits.length > 2 && !digits.startsWith(entry.subheading.replace(/\D/g, ''))) {
    return { ok: false, error: `"${text}": additional U.S. note ${n} to chapter ${chapter} gives rates for ${entry.subheading}, not ${lineOrChapter}.` };
  }
  const rateText = entry[column];
  return {
    ok: true,
    rateText,
    entry,
    note: `Rate from additional U.S. note ${n} to chapter ${chapter} (${column === 'general' ? 'column 1 general' : 'column 2'}): "${rateText}".`,
  };
}
