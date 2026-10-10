import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from '../tickers/lib';

/**
 * Extract the HTS subheadings listed in the Chapter 99 U.S. notes (subchapter III), per note subdivision,
 * from the official USITC Chapter 99 PDF (issue #1785, step 2).
 *
 * The HTS JSON has no product coverage for Chapter 99 headings: which lines a heading covers lives in the
 * U.S. notes as subheading lists (note 52(b)–(e), (j) for the 2026 Section 301 action, note 50 for Brazil,
 * note 40(c) for Section 232 pharmaceuticals, note 20 for the China Section 301 lists, note 31 for the 2024
 * China increases, note 33 for Section 232 autos, notes 16 and 19 for Section 232 steel and aluminum). This
 * script writes them to `src/tariff-data/calculator/note-coverage.json` as digit prefixes ("0101", "30069360")
 * keyed by subdivision ("52(b)", "52(j)(4)(i)", "20(s)(i)") so that `measures.json` can be curated (and re-checked) against them.
 *
 *   pnpm tsx src/scripts/tariff-calculator/extract-ch99-note-coverage.ts
 *   pnpm tsx src/scripts/tariff-calculator/extract-ch99-note-coverage.ts --release 2026HTSRev22 --edition "2026 Revision 22"
 *   pnpm tsx src/scripts/tariff-calculator/extract-ch99-note-coverage.ts --pdf /tmp/ch99.pdf     # skip the download
 *   pnpm tsx src/scripts/tariff-calculator/extract-ch99-note-coverage.ts --text /tmp/ch99.txt    # pre-extracted text
 *
 * PDF → text: uses `pdftotext` (poppler) when it is on the PATH, else Python with `pypdf`
 * (`--python /path/to/python3` to pick an interpreter that has it). Only codes are taken from the text,
 * so either extractor works (pypdf runs the codes of a row together; the code pattern splits them).
 *
 * The output is a review aid, not the source of truth: measures.json is curated by hand from it.
 *
 * It also writes `src/tariff-data/calculator/note-product-descriptions.json` (issue #1790): the named-product exemptions
 * of notes 50 and 52 — the passages listing "the following particular articles" as "(1) Etrogs (classifiable in
 * subheading 0805.90.01)" — as { id, codePrefix, description, note } plus, per passage, the relief heading, the duty
 * headings it lifts and the country (`--descriptions-out <file>` to write elsewhere). build-measures.py turns them into
 * relief measures through measures_named_products.py. Items it can't read are printed under "item(s) to review".
 *
 * Issue #1795 adds to the same file: the China product exclusions still in effect (note 20(a)'s compiler's note names
 * the subdivisions, (vvv) and (www) in Revision 21) as passages "20(vvv)(i)" … "20(www)" — described items become
 * descriptions (one per current statistical number), items that name only statistical numbers go to "wholeLines"
 * (whole line excluded, no confirmation) — and the note 31 described products (31(k)(i) intermodal chassis, 31(l)(i)
 * ship-to-shore cranes) whose duty build-measures.py conditions on the description.
 */

const DEFAULT_RELEASE = '2026HTSRev21';
const DEFAULT_EDITION = '2026 Revision 21';
const DEFAULT_NOTES = ['16', '19', '20', '31', '33', '40', '50', '52'];
const OUT_FILE = path.join(__dirname, '..', '..', 'tariff-data', 'calculator', 'note-coverage.json');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

export interface NoteCoverageFile {
  htsEdition: string;
  /** hts.usitc.gov URL of the Chapter 99 PDF the lists were read from. */
  sourceUrl: string;
  generatedAt: string;
  /** Subdivision ("52(b)", "52(j)(4)(i)") → sorted HTS digit prefixes listed directly in it (Chapter 98/99 references excluded). */
  notes: Record<string, string[]>;
}

function chapter99PdfUrl(release: string): string {
  return `https://hts.usitc.gov/reststop/file?release=${encodeURIComponent(release)}&filename=${encodeURIComponent('Chapter 99')}`;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/** usitc.gov rejects bot user agents and sometimes drops requests: browser UA + retries with backoff. */
async function downloadPdf(url: string, dest: string): Promise<void> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/pdf,*/*' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') throw new Error('response is not a PDF');
      writeFileSync(dest, buf);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`Download attempt ${attempt} failed: ${String(err)}`);
      await sleep(2000 * attempt);
    }
  }
  throw new Error(`Could not download ${url}: ${String(lastError)}`);
}

const PYPDF_SNIPPET = [
  'import sys',
  'from pypdf import PdfReader',
  'r = PdfReader(sys.argv[1])',
  'out = []',
  'for i, p in enumerate(r.pages):',
  "    out.append('=====PAGE %d=====' % (i + 1))",
  "    out.append(p.extract_text() or '')",
  "sys.stdout.write('\\n'.join(out))",
].join('\n');

function pdfToText(pdfPath: string, python: string): string {
  const pdftotext = spawnSync('pdftotext', ['-enc', 'UTF-8', pdfPath, '-'], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
  if (!pdftotext.error && pdftotext.status === 0 && pdftotext.stdout) return pdftotext.stdout;

  const py = spawnSync(python, ['-c', PYPDF_SNIPPET, pdfPath], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
  if (!py.error && py.status === 0 && py.stdout) return py.stdout;

  throw new Error(
    'No PDF text extractor found. Install poppler (`brew install poppler`, for pdftotext) or pass ' +
      '`--python <python3 with pypdf installed>`, or pass `--text <file>` with the extracted text.\n' +
      (py.stderr ? `python said: ${py.stderr.slice(0, 500)}` : '')
  );
}

// ---------- text → note subdivisions ----------

const NOISE_LINE =
  /^(Harmonized Tariff Schedule of the United States|Annotated for Statistical Reporting Purposes|XXII$|99 ?- ?[IVX]+ ?- ?\d+|=====PAGE|U\.S\. Notes \(con\.\))/;

/** Lines of the subchapter III U.S. notes, page furniture removed. */
function subchapterIIINoteLines(text: string): string[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const start = lines.findIndex((l) => /^SUBCHAPTER III$/.test(l));
  const end = lines.findIndex((l, i) => i > start && /^SUBCHAPTER IV$/.test(l));
  if (start < 0 || end < 0) throw new Error('Could not find SUBCHAPTER III / SUBCHAPTER IV in the Chapter 99 text');
  return lines.slice(start + 1, end).filter((l) => l !== '' && !NOISE_LINE.test(l));
}

/**
 * Split the subchapter III notes by note number. Note numbers only increase (with gaps for deleted notes), which
 * keeps numbered list items inside a note ("1. Other non-aromatic …") from being read as note starts. The last
 * note ends where the headings table starts.
 */
function splitNotes(lines: string[]): Map<string, string[]> {
  const notes = new Map<string, string[]>();
  let current: string | null = null;
  let currentNum = 0;
  for (const line of lines) {
    if (/^(Rates of Duty|Heading\/)/.test(line)) {
      if (currentNum >= 50) break; // headings table after the last note
      continue;
    }
    // The EU large-civil-aircraft note is printed as "(21)(a) …" between notes 20 and 21; keep it apart as "(21)".
    const misnumbered = /^\((\d{1,2})\)(?=\(a\))/.exec(line);
    if (misnumbered && Number(misnumbered[1]) === currentNum + 1) {
      current = `(${misnumbered[1]})`;
      notes.set(current, [line.slice(misnumbered[0].length)]);
      continue;
    }
    const m = /^(\d{1,2})\.(?:\s|$)/.exec(line);
    if (m) {
      const n = Number(m[1]);
      if (n > currentNum && n <= currentNum + 10) {
        currentNum = n;
        current = String(n);
        notes.set(current, [line.slice(m[0].length)]);
        continue;
      }
    }
    if (current) notes.get(current)!.push(line);
  }
  return notes;
}

type LevelType = 'alpha' | 'roman' | 'num';
interface Level {
  type: LevelType;
  label: string;
}

const ROMAN: string[] = [
  '',
  'i',
  'ii',
  'iii',
  'iv',
  'v',
  'vi',
  'vii',
  'viii',
  'ix',
  'x',
  'xi',
  'xii',
  'xiii',
  'xiv',
  'xv',
  'xvi',
  'xvii',
  'xviii',
  'xix',
  'xx',
];

/** Position of a label within its kind of list, or -1 when the label cannot be of that kind. */
function ordinal(type: LevelType, label: string): number {
  if (type === 'num') return /^\d+$/.test(label) ? Number(label) : -1;
  if (type === 'roman') return ROMAN.indexOf(label);
  // alpha: a … z, aa … zz, aaa … zzz
  if (!/^([a-z])\1*$/.test(label)) return -1;
  return (label.length - 1) * 26 + (label.charCodeAt(0) - 96);
}

/** Largest jump between consecutive siblings that is still read as a sibling (deleted subdivisions, items run into a line). */
const MAX_GAP: Record<LevelType, number> = { alpha: 8, roman: 2, num: 12 };

const LABEL_AT_START = /^\(([a-z]{1,4}|\d{1,3})\)\s*/;
// A wrapped cross-reference ("(c) and (f) of U.S. note 40", "(l)(v) of this note") is not a subdivision start.
const CROSS_REFERENCE_REST = /^(and|or|of|through|to|in|is|are|that)\b|^[,;.:–-]/;

/** Codes like 0201.20.04, 0106.20, 3004.90.9276, 3004.90.92.76 — also when pypdf runs a row's codes together. */
const CODE_PATTERN = /(\d{4})\.(\d{2})(?:\.(\d{2})(?:\.(\d{2})|(\d{2})(?=\d{4}\.|\D|$))?)?/g;

function extractCodes(text: string): string[] {
  const codes: string[] = [];
  for (const line of text.split('\n')) {
    CODE_PATTERN.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = CODE_PATTERN.exec(line)) !== null) {
      const digits = [m[1], m[2], m[3] ?? '', m[4] ?? m[5] ?? ''].join('');
      if (digits.startsWith('98') || digits.startsWith('99')) continue; // Chapter 98/99 references, not coverage
      codes.push(digits);
    }
    // 4-digit headings in a list row ("7606760576047601", "84718431.10.00908426.91.00" — pypdf runs a row's codes
    // together): only on rows made of codes alone, so years and amounts in the note text are never read as headings.
    if (/^[\d.\s;,]+$/.test(line.trim())) {
      CODE_PATTERN.lastIndex = 0;
      const rest = line.replace(CODE_PATTERN, ' ');
      for (const run of rest.match(/\d+/g) ?? []) {
        if (run.length % 4 !== 0) continue;
        for (let i = 0; i < run.length; i += 4) {
          const heading = run.slice(i, i + 4);
          if (!heading.startsWith('98') && !heading.startsWith('99')) codes.push(heading);
        }
      }
    }
  }
  return codes;
}

interface ParsedNote {
  subdivisions: Map<string, string[]>;
  /** Every line of the note in document order, raw (labels kept), with the subdivision it ended in. */
  lines: { key: string; raw: string }[];
  unmatchedLabels: string[];
}

interface TokenizedLine {
  labels: string[];
  rest: string;
  raw: string;
}

function tokenize(line: string): TokenizedLine {
  const labels: string[] = [];
  let rest = line;
  let m: RegExpExecArray | null;
  while ((m = LABEL_AT_START.exec(rest)) !== null) {
    labels.push(m[1]);
    rest = rest.slice(m[0].length);
  }
  if (labels.length > 0 && CROSS_REFERENCE_REST.test(rest)) return { labels: [], rest: line, raw: line };
  return { labels, rest, raw: line };
}

/**
 * Walk the note line by line, tracking the subdivision path ("(j)(4)(i)"). A label continues the deepest level it
 * can follow (exact successor first, then a small forward gap), or opens a new level when it is a first label
 * ((a), (i), (1)). "(i)" after "(h)" is ambiguous (alpha vs. roman): it opens a roman level when the next label in
 * the note is "(ii)".
 */
function parseNoteSubdivisions(noteNum: string, lines: string[]): ParsedNote {
  const tokens = lines.map(tokenize);
  const labelSeq: { line: number; idx: number; label: string }[] = [];
  tokens.forEach((t, line) => t.labels.forEach((label, idx) => labelSeq.push({ line, idx, label })));
  const nextLabelAfter = (line: number, idx: number): string | null => {
    const pos = labelSeq.findIndex((l) => l.line === line && l.idx === idx);
    return pos >= 0 && pos + 1 < labelSeq.length ? labelSeq[pos + 1].label : null;
  };

  const stack: Level[] = [];
  const own = new Map<string, string[]>();
  const ordered: { key: string; raw: string }[] = [];
  const unmatchedLabels: string[] = [];
  const keyOf = (): string => noteNum + stack.map((l) => `(${l.label})`).join('');
  const append = (text: string): void => {
    const key = keyOf();
    if (!own.has(key)) own.set(key, []);
    own.get(key)!.push(text);
  };

  tokens.forEach((t, lineNo) => {
    let consumed = 0;
    for (let i = 0; i < t.labels.length; i++) {
      const label = t.labels[i];
      const findLevel = (maxGap: (type: LevelType) => number): number => {
        for (let d = stack.length - 1; d >= 0; d--) {
          const cur = ordinal(stack[d].type, stack[d].label);
          const next = ordinal(stack[d].type, label);
          if (next > cur && next - cur <= maxGap(stack[d].type)) return d;
        }
        return -1;
      };
      const isFirstLabel = label === 'a' || label === 'i' || label === '1';
      const opensRoman = label === 'i' && nextLabelAfter(lineNo, i) === 'ii';
      // Exact successor, else a first label opens a level, else a small forward gap.
      let depth = opensRoman ? -1 : findLevel(() => 1);
      if (depth < 0 && !isFirstLabel) depth = findLevel((type) => MAX_GAP[type]);
      if (depth >= 0) {
        stack.length = depth + 1;
        stack[depth] = { type: stack[depth].type, label };
      } else if (isFirstLabel) {
        stack.push({ type: label === 'a' ? 'alpha' : label === 'i' ? 'roman' : 'num', label });
      } else {
        if (!/^\d+$/.test(label)) unmatchedLabels.push(`${keyOf()} → (${label}): ${t.raw.slice(0, 80)}`);
        break;
      }
      consumed++;
      if (!own.has(keyOf())) own.set(keyOf(), []);
    }
    if (consumed === t.labels.length) append(t.rest);
    else append(t.raw);
    ordered.push({ key: keyOf(), raw: t.raw });
  });

  const subdivisions = new Map<string, string[]>();
  for (const [key, texts] of own) {
    const codes = Array.from(new Set(extractCodes(texts.join('\n')))).sort();
    if (codes.length > 0) subdivisions.set(key, codes);
  }
  return { subdivisions, lines: ordered, unmatchedLabels };
}

/** JSON laid out the way `pnpm prettier-fix` (printWidth 160) leaves it, so a re-run only shows real changes in the diff. */
function formatLikePrettier(file: NoteCoverageFile): string {
  const lines: string[] = ['{'];
  lines.push(`  "htsEdition": ${JSON.stringify(file.htsEdition)},`);
  lines.push(`  "sourceUrl": ${JSON.stringify(file.sourceUrl)},`);
  lines.push(`  "generatedAt": ${JSON.stringify(file.generatedAt)},`);
  lines.push('  "notes": {');
  const entries = Object.entries(file.notes);
  entries.forEach(([key, codes], i) => {
    const comma = i < entries.length - 1 ? ',' : '';
    const oneLine = `    ${JSON.stringify(key)}: [${codes.map((c) => JSON.stringify(c)).join(', ')}]${comma}`;
    if (oneLine.length <= 160) {
      lines.push(oneLine);
    } else {
      lines.push(`    ${JSON.stringify(key)}: [`);
      codes.forEach((c, j) => lines.push(`      ${JSON.stringify(c)}${j < codes.length - 1 ? ',' : ''}`));
      lines.push(`    ]${comma}`);
    }
  });
  lines.push('  }', '}');
  return lines.join('\n') + '\n';
}

// ---------- named-product descriptions (issue #1790, item 2) ----------

/**
 * Some exemptions name a product, not just a subheading: "(1) Etrogs (classifiable in subheading 0805.90.01);".
 * The code alone can't tell whether a shipment is that product, so the calculator asks the importer to confirm the
 * description. These passages are the subdivisions whose text says "the following particular articles" (notes 52(c),
 * 52(j)(4)–(13)(ii) and 50(a)(iii) in Revision 21).
 */
export interface NoteProductDescription {
  /** Stable id: note subdivision without parentheses, the code as printed, and an ordinal for repeated codes ("52c-0805.90.01-1"). */
  id: string;
  /** HTS digit prefix without dots. */
  codePrefix: string;
  /** Description text exactly as the note states it (line breaks joined with a space). */
  description: string;
  /** Note subdivision, e.g. "52(c)". */
  note: string;
}

/** What one "particular articles" passage says: the relief heading it is entered under and the duty headings it lifts. */
export interface NoteProductPassage {
  reliefHeading: string;
  /** Duty headings the passage exempts from (a printed range like 9903.05.20–9903.05.84 is expanded). */
  dutyHeadings: string[];
  /** "the product of …" country as printed, or null when the passage applies to every country. */
  productOf: string | null;
}

export interface NoteProductDescriptionsFile {
  htsEdition: string;
  sourceUrl: string;
  generatedAt: string;
  /** Note subdivision → number of descriptions. */
  counts: Record<string, number>;
  passages: Record<string, NoteProductPassage>;
  /**
   * Exclusion items that name only statistical reporting numbers (note 20 in-effect exclusions, issue #1795): passage →
   * 10-digit lines (no dots) excluded whole, without a confirmation.
   */
  wholeLines: Record<string, string[]>;
  descriptions: NoteProductDescription[];
}

const DEFAULT_DESCRIPTION_NOTES = ['50', '52'];
const DESCRIPTIONS_OUT_FILE = path.join(__dirname, '..', '..', 'tariff-data', 'calculator', 'note-product-descriptions.json');

const PARTICULAR_ARTICLES = /the following\s+particular articles/;
const PASSAGE_HEADER =
  /^As provided in heading (9903\.\d{2}\.\d{2}), the (?:additional )?dut(?:y|ies) imposed by headings? (9903\.\d{2}\.\d{2})(?:\s*[–-]\s*(9903\.\d{2}\.\d{2}))? shall not apply to the following particular articles(?: the product of ([^:]+?))?:\s*/;
const ITEM = /\((\d{1,2}|[A-Z])\)\s+(.+?)\s*\(classifiable in\s+subheading\s+(\d{4}\.\d{2}\.\d{2}(?:\.\d{2})?)\)/g;

function expandHeadingRange(from: string, to: string | undefined): string[] {
  if (!to) return [from];
  const prefix = from.slice(0, 8);
  if (to.slice(0, 8) !== prefix) return [from, to];
  const out: string[] = [];
  for (let n = Number(from.slice(8)); n <= Number(to.slice(8)); n++) out.push(`${prefix}${String(n).padStart(2, '0')}`);
  return out;
}

function expectedLabel(index: number, first: string): string {
  return /^\d+$/.test(first) ? String(index + 1) : String.fromCharCode(65 + index);
}

interface ParsedPassage {
  passage: NoteProductPassage;
  descriptions: NoteProductDescription[];
}

/** Parse one "particular articles" passage (the subdivision's own lines plus its descendants, in order). */
function parseProductPassage(note: string, rawLines: string[], problems: string[]): ParsedPassage | null {
  // Drop the leading subdivision labels of the first line ("(ii) As provided …", "(c) As provided …").
  const first = rawLines[0].replace(/^(\((?:[a-z]{1,4}|\d{1,3})\)\s*)+/, '');
  const text = [first, ...rawLines.slice(1)].join(' ').replace(/\s+/g, ' ').trim();
  const header = PASSAGE_HEADER.exec(text);
  if (!header) {
    problems.push(`${note}: could not read the passage header: ${text.slice(0, 160)}`);
    return null;
  }
  const passage: NoteProductPassage = {
    reliefHeading: header[1],
    dutyHeadings: expandHeadingRange(header[2], header[3]),
    productOf: header[4] ? header[4].trim() : null,
  };
  const body = text.slice(header[0].length);
  const descriptions: NoteProductDescription[] = [];
  const perCode = new Map<string, number>();
  let leftover = '';
  let last = 0;
  let index = 0;
  let firstLabel = '';
  ITEM.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ITEM.exec(body)) !== null) {
    leftover += body.slice(last, m.index);
    last = ITEM.lastIndex;
    const [, label, description, code] = m;
    if (index === 0) firstLabel = label;
    if (label !== expectedLabel(index, firstLabel)) problems.push(`${note}: item (${label}) found where (${expectedLabel(index, firstLabel)}) was expected`);
    if (/\((\d{1,2}|[A-Z])\)\s/.test(description) || /classifiable/.test(description)) {
      problems.push(`${note} (${label}): description looks like it swallowed another item: ${description.slice(0, 120)}`);
    }
    const n = (perCode.get(code) ?? 0) + 1;
    perCode.set(code, n);
    descriptions.push({ id: `${note.replace(/[()]/g, '')}-${code}-${n}`, codePrefix: code.replace(/\./g, ''), description, note });
    index++;
  }
  leftover += body.slice(last);
  // Between items only list punctuation may remain ("; and", ".").
  const rest = leftover.replace(/\b(and|or)\b/g, '').replace(/[;,.\s]/g, '');
  if (rest !== '') problems.push(`${note}: text not read as an item: "${leftover.replace(/\s+/g, ' ').trim().slice(0, 200)}"`);
  if (descriptions.length === 0) problems.push(`${note}: no "(classifiable in subheading …)" items found`);
  return { passage, descriptions };
}

/** Every "particular articles" passage in a parsed note → its descriptions. */
function extractProductDescriptions(parsed: ParsedNote, problems: string[]): Map<string, ParsedPassage> {
  const out = new Map<string, ParsedPassage>();
  const headerKeys = Array.from(new Set(parsed.lines.filter((l) => PARTICULAR_ARTICLES.test(l.raw)).map((l) => l.key)));
  // The header phrase can wrap ("… to the following" / "particular articles …"), so also look at line pairs.
  parsed.lines.forEach((l, i) => {
    const next = parsed.lines[i + 1];
    if (next && next.key === l.key && PARTICULAR_ARTICLES.test(`${l.raw} ${next.raw}`) && !headerKeys.includes(l.key)) headerKeys.push(l.key);
  });
  for (const key of headerKeys) {
    const own = parsed.lines.filter((l) => l.key === key || l.key.startsWith(`${key}(`)).map((l) => l.raw);
    const result = parseProductPassage(key, own, problems);
    if (result) out.set(key, result);
  }
  return out;
}

// ---------- China Section 301 product exclusions in effect (note 20, issue #1795) ----------

/**
 * Note 20 lists every USTR product exclusion ever granted (20(h)–20(www)), but most have expired. Note 20(a) carries a
 * compiler's note naming the subdivisions still in effect ("only subdivisions (vvv) and (www) of this note indicating
 * exclusions are now in effect", Revision 21). Only those are extracted; the expiry date is in the relief heading's
 * description (9903.88.69 / 9903.88.70: "through November 9, 2026"), which build-measures.py reads from ch99-headings.json.
 */
const IN_EFFECT_COMPILER_NOTE = /only subdivisions\s*((?:\([a-z]+\)\s*(?:,|and|or)?\s*)+)\s*of this note indicating exclusions are now in effect/;
const STAT_NUMBER = /\d{4}\.\d{2}\.\d{4}/g;

function inEffectExclusionSubdivisions(note: string, parsed: ParsedNote, problems: string[]): string[] {
  const text = parsed.lines
    .map((l) => l.raw)
    .join(' ')
    .replace(/\s+/g, ' ');
  const m = IN_EFFECT_COMPILER_NOTE.exec(text);
  if (!m) {
    problems.push(`note ${note}: compiler's note naming the exclusion subdivisions in effect not found — re-read note ${note}(a)`);
    return [];
  }
  return Array.from(m[1].matchAll(/\(([a-z]+)\)/g)).map((x) => `${note}(${x[1]})`);
}

/**
 * Statistical reporting numbers an exclusion item covers today. The parenthetical (or a stat-number-only item) can list
 * the history: "8413.91.9080 prior to January 1, 2019; described in … 8413.91.9085 or 8413.91.9096 effective January 1,
 * 2020 through June 30, 2026; described in … 8413.91.9039, …, 8413.91.9099 effective July 1, 2026". The current
 * segment is the one with neither "prior to" nor "through"; exactly one must exist.
 */
function currentStatNumbers(where: string, body: string, problems: string[]): string[] {
  const segments = body.split(/;|,\s*(?=described in)/).filter((s) => /\d{4}\.\d{2}\.\d{4}/.test(s));
  let current = segments.filter((s) => !/prior to|through/.test(s));
  // "… 3926.90.9985 effective July 1, 2020; described in … 3926.90.9989 effective July 1, 2024": the latest start wins.
  if (current.length > 1 && current.every((s) => /effective [A-Z][a-z]+ \d{1,2}, \d{4}/.test(s))) {
    const start = (s: string): number => Date.parse(/effective ([A-Z][a-z]+ \d{1,2}, \d{4})/.exec(s)![1]);
    current = [current.reduce((a, b) => (start(b) > start(a) ? b : a))];
  }
  if (current.length !== 1) {
    problems.push(`${where}: expected one current statistical-number segment, found ${current.length}: "${body.slice(0, 200)}"`);
    return [];
  }
  return Array.from(current[0].matchAll(STAT_NUMBER)).map((x) => x[0]);
}

interface ExclusionPassageResult {
  passage: NoteProductPassage;
  /** Items that describe a product: one description per current statistical number. */
  descriptions: NoteProductDescription[];
  /** Items that name only statistical numbers: the whole 10-digit line is excluded (digits, no dots). */
  wholeLines: string[];
}

/**
 * Parse the in-effect exclusion subdivisions of note 20 into passages: "20(vvv)(i)" … "20(vvv)(iv)" and "20(www)". Each
 * passage header names the relief heading ("as provided in heading 9903.88.69", "a claim for the tariff treatment
 * provided in heading 9903.88.70") and the duty headings it lifts (every other 9903.xx.xx code in the header). Items are
 * "(4) Pump casings and bodies (described in statistical reporting number …)" or "(1) 8483.50.9040".
 */
function extractExclusionPassages(note: string, parsed: ParsedNote, problems: string[]): Map<string, ExclusionPassageResult> {
  const out = new Map<string, ExclusionPassageResult>();
  for (const sub of inEffectExclusionSubdivisions(note, parsed, problems)) {
    const lines = parsed.lines.filter((l) => l.key === sub || l.key.startsWith(`${sub}(`));
    if (lines.length === 0) {
      problems.push(`${sub}: named in the compiler's note but not found in note ${note}`);
      continue;
    }
    // Group: item keys end in a number ("20(vvv)(i)(4)", "20(www)(3)"); the rest is the passage header.
    const headers = new Map<string, string[]>();
    const items = new Map<string, Map<number, string[]>>();
    for (const l of lines) {
      const item = /^(.*)\((\d+)\)$/.exec(l.key);
      const passageKey = item ? item[1] : l.key;
      if (!item) {
        if (!headers.has(passageKey)) headers.set(passageKey, []);
        headers.get(passageKey)!.push(l.raw);
        continue;
      }
      if (!items.has(passageKey)) items.set(passageKey, new Map());
      const byNum = items.get(passageKey)!;
      const n = Number(item[2]);
      if (!byNum.has(n)) byNum.set(n, []);
      byNum.get(n)!.push(l.raw);
    }
    for (const [passageKey, headerLines] of headers) {
      const header = headerLines.join(' ').replace(/\s+/g, ' ');
      const relief = /(?:as provided\s+in heading|tariff treatment provided in heading) (9903\.\d{2}\.\d{2})/.exec(header);
      if (!relief) {
        problems.push(`${passageKey}: could not find the relief heading in "${header.slice(0, 200)}"`);
        continue;
      }
      const dutyHeadings = Array.from(new Set(Array.from(header.matchAll(/9903\.\d{2}\.\d{2}/g)).map((x) => x[0]))).filter((c) => c !== relief[1]);
      const byNum = items.get(passageKey) ?? new Map<number, string[]>();
      const nums = Array.from(byNum.keys()).sort((a, b) => a - b);
      if (nums.length === 0 || nums.some((n, i) => n !== i + 1)) problems.push(`${passageKey}: items are not numbered 1…n (${nums.join(', ')})`);
      const result: ExclusionPassageResult = {
        passage: { reliefHeading: relief[1], dutyHeadings: dutyHeadings.sort(), productOf: 'China' },
        descriptions: [],
        wholeLines: [],
      };
      const perCode = new Map<string, number>();
      for (const n of nums) {
        const where = `${passageKey}(${n})`;
        const text = byNum
          .get(n)!
          .join(' ')
          .replace(/^\(\d+\)\s*/, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (/^\d{4}\.\d{2}\.\d{4}/.test(text)) {
          for (const code of currentStatNumbers(where, text, problems)) result.wholeLines.push(code.replace(/\./g, ''));
          continue;
        }
        const at = text.lastIndexOf('(described in');
        if (at < 0 || !text.endsWith(')')) {
          problems.push(`${where}: no "(described in statistical reporting number …)" found: "${text.slice(0, 160)}"`);
          continue;
        }
        const description = text.slice(0, at).trim();
        for (const code of currentStatNumbers(where, text.slice(at + 1, -1), problems)) {
          const k = (perCode.get(code) ?? 0) + 1;
          perCode.set(code, k);
          result.descriptions.push({
            id: `${passageKey.replace(/[()]/g, '')}-${code}-${k}`,
            codePrefix: code.replace(/\./g, ''),
            description,
            note: passageKey,
          });
        }
      }
      result.wholeLines = Array.from(new Set(result.wholeLines)).sort();
      out.set(passageKey, result);
    }
  }
  return out;
}

/**
 * Note 31 products that the HTS line alone does not identify (issue #1795): the duty applies only to the product the note
 * describes, so build-measures.py conditions the duty on the importer confirming the description.
 *   31(k)(i) — intermodal chassis, subassemblies and parts (9903.91.12, from November 10, 2026), in 8716.39.0090,
 *              8716.90.30 and 8716.90.50 (other goods of those lines: 9903.91.13, no duty);
 *   31(l)(i) — ship-to-shore gantry cranes of 8426.19.00 (9903.91.14, from November 10, 2026; the same description as
 *              subheading 9903.92.10, 25% since September 27, 2024 — other cranes of 8426.19.00: 9903.92.80, no duty).
 */
function extractNote31Descriptions(parsed: ParsedNote, problems: string[]): NoteProductDescription[] {
  const textOf = (key: string): string =>
    parsed.lines
      .filter((l) => l.key === key)
      .map((l) => l.raw)
      .join(' ')
      .replace(/\s+/g, ' ');
  const out: NoteProductDescription[] = [];
  const add = (note: string, codes: string[], description: string): void => {
    for (const code of codes) out.push({ id: `${note.replace(/[()]/g, '')}-${code}-1`, codePrefix: code.replace(/\./g, ''), description, note });
  };

  const k = textOf('31(k)(i)');
  const chassis =
    /applies to (intermodal chassis, subassemblies thereof, and parts thereof), of China, provided\s+for in statistical reporting number (\d{4}\.\d{2}\.\d{4}) or in subheadings (\d{4}\.\d{2}\.\d{2}) or (\d{4}\.\d{2}\.\d{2})\./.exec(
      k
    );
  const definition = /(The articles consist of chassis .*? for road, marine and\/or rail transport\.)/.exec(k);
  if (chassis && definition) {
    const what = chassis[1].charAt(0).toUpperCase() + chassis[1].slice(1);
    add('31(k)(i)', [chassis[2], chassis[3], chassis[4]], `${what} (${definition[1]})`);
  } else {
    problems.push(`31(k)(i): could not read the intermodal chassis description: "${k.slice(0, 200)}"`);
  }

  const l = textOf('31(l)(i)');
  const crane =
    /applies to (ship-to-shore gantry cranes, configured as .*?, including spreaders or twist-locks), provided for in subheading (\d{4}\.\d{2}\.\d{2})/.exec(l);
  if (crane) add('31(l)(i)', [crane[2]], crane[1].charAt(0).toUpperCase() + crane[1].slice(1));
  else problems.push(`31(l)(i): could not read the ship-to-shore gantry crane description: "${l.slice(0, 200)}"`);
  return out;
}

function compareNoteKeys(a: string, b: string): number {
  return a.localeCompare(b, 'en', { numeric: true });
}

/** JSON laid out the way prettier (printWidth 160) leaves it. */
function formatDescriptionsLikePrettier(file: NoteProductDescriptionsFile): string {
  const lines: string[] = ['{'];
  lines.push(`  "htsEdition": ${JSON.stringify(file.htsEdition)},`);
  lines.push(`  "sourceUrl": ${JSON.stringify(file.sourceUrl)},`);
  lines.push(`  "generatedAt": ${JSON.stringify(file.generatedAt)},`);
  const counts = Object.entries(file.counts);
  lines.push('  "counts": {');
  counts.forEach(([k, v], i) => lines.push(`    ${JSON.stringify(k)}: ${v}${i < counts.length - 1 ? ',' : ''}`));
  lines.push('  },');
  const passages = Object.entries(file.passages);
  lines.push('  "passages": {');
  passages.forEach(([k, p], i) => {
    const comma = i < passages.length - 1 ? ',' : '';
    lines.push(`    ${JSON.stringify(k)}: {`);
    lines.push(`      "reliefHeading": ${JSON.stringify(p.reliefHeading)},`);
    const heads = `      "dutyHeadings": [${p.dutyHeadings.map((h) => JSON.stringify(h)).join(', ')}],`;
    if (heads.length <= 160) {
      lines.push(heads);
    } else {
      lines.push('      "dutyHeadings": [');
      p.dutyHeadings.forEach((h, j) => lines.push(`        ${JSON.stringify(h)}${j < p.dutyHeadings.length - 1 ? ',' : ''}`));
      lines.push('      ],');
    }
    lines.push(`      "productOf": ${JSON.stringify(p.productOf)}`);
    lines.push(`    }${comma}`);
  });
  lines.push('  },');
  const wholeLines = Object.entries(file.wholeLines);
  lines.push(wholeLines.length === 0 ? '  "wholeLines": {},' : '  "wholeLines": {');
  wholeLines.forEach(([k, codes], i) => {
    const comma = i < wholeLines.length - 1 ? ',' : '';
    const oneLine = `    ${JSON.stringify(k)}: [${codes.map((c) => JSON.stringify(c)).join(', ')}]${comma}`;
    if (oneLine.length <= 160) {
      lines.push(oneLine);
    } else {
      lines.push(`    ${JSON.stringify(k)}: [`);
      codes.forEach((c, j) => lines.push(`      ${JSON.stringify(c)}${j < codes.length - 1 ? ',' : ''}`));
      lines.push(`    ]${comma}`);
    }
  });
  if (wholeLines.length > 0) lines.push('  },');
  lines.push('  "descriptions": [');
  file.descriptions.forEach((d, i) => {
    const comma = i < file.descriptions.length - 1 ? ',' : '';
    const fields = (['id', 'codePrefix', 'description', 'note'] as const).map((k) => `${JSON.stringify(k)}: ${JSON.stringify(d[k])}`);
    const oneLine = `    { ${fields.join(', ')} }${comma}`;
    if (oneLine.length <= 160) {
      lines.push(oneLine);
    } else {
      lines.push('    {');
      fields.forEach((f, j) => lines.push(`      ${f}${j < fields.length - 1 ? ',' : ''}`));
      lines.push(`    }${comma}`);
    }
  });
  lines.push('  ]', '}');
  return lines.join('\n') + '\n';
}

// ---------- main ----------

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const release = typeof args.release === 'string' ? args.release : DEFAULT_RELEASE;
  const edition = typeof args.edition === 'string' ? args.edition : DEFAULT_EDITION;
  const python = typeof args.python === 'string' ? args.python : 'python3';
  const out = typeof args.out === 'string' ? path.resolve(args.out) : OUT_FILE;
  const wanted = typeof args.notes === 'string' ? args.notes.split(',').map((s) => s.trim()) : DEFAULT_NOTES;
  const descriptionsOut = typeof args['descriptions-out'] === 'string' ? path.resolve(args['descriptions-out']) : DESCRIPTIONS_OUT_FILE;
  const descriptionNotes = DEFAULT_DESCRIPTION_NOTES.filter((n) => wanted.includes(n));
  const sourceUrl = chapter99PdfUrl(release);

  let text: string;
  if (typeof args.text === 'string') {
    text = readFileSync(args.text, 'utf8');
  } else {
    let pdfPath: string;
    if (typeof args.pdf === 'string') {
      pdfPath = args.pdf;
    } else {
      const dir = path.join(os.tmpdir(), 'koala-tariff-ch99');
      mkdirSync(dir, { recursive: true });
      pdfPath = path.join(dir, `${release}-chapter-99.pdf`);
      if (!existsSync(pdfPath)) {
        console.log(`Downloading ${sourceUrl}`);
        await downloadPdf(sourceUrl, pdfPath);
      }
    }
    console.log(`Extracting text from ${pdfPath}`);
    text = pdfToText(pdfPath, python);
  }
  if (!text.includes(edition.replace(/^(\d{4}) Revision (\d+)$/, 'Revision $2 ($1)'))) {
    console.warn(`WARNING: the text does not mention "${edition}" in its page footers; check --release / --edition.`);
  }

  const notes = splitNotes(subchapterIIINoteLines(text));
  const result: Record<string, string[]> = {};
  const problems: string[] = [];
  const passages = new Map<string, ParsedPassage>();
  const wholeLines = new Map<string, string[]>();
  const note31Descriptions: NoteProductDescription[] = [];
  for (const num of wanted) {
    const lines = notes.get(num);
    if (!lines) {
      problems.push(`note ${num}: not found in subchapter III`);
      continue;
    }
    const parsed = parseNoteSubdivisions(num, lines);
    for (const [key, codes] of parsed.subdivisions) result[key] = codes;
    for (const u of parsed.unmatchedLabels) problems.push(`unrecognized subdivision label ${u}`);
    if (descriptionNotes.includes(num)) for (const [key, p] of extractProductDescriptions(parsed, problems)) passages.set(key, p);
    if (num === '20') {
      for (const [key, p] of extractExclusionPassages(num, parsed, problems)) {
        passages.set(key, { passage: p.passage, descriptions: p.descriptions });
        if (p.wholeLines.length > 0) wholeLines.set(key, p.wholeLines);
      }
    }
    if (num === '31') note31Descriptions.push(...extractNote31Descriptions(parsed, problems));
    console.log(`note ${num}: ${parsed.subdivisions.size} subdivisions with codes`);
  }

  const file: NoteCoverageFile = { htsEdition: edition, sourceUrl, generatedAt: new Date().toISOString(), notes: result };
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, formatLikePrettier(file));

  for (const [key, codes] of Object.entries(result)) {
    const ch01 = codes.filter((c) => c.startsWith('01')).length;
    const ch30 = codes.filter((c) => c.startsWith('30')).length;
    console.log(`  ${key.padEnd(18)} ${String(codes.length).padStart(5)} codes${ch01 ? `, Ch01 ${ch01}` : ''}${ch30 ? `, Ch30 ${ch30}` : ''}`);
  }
  const noteKeys = Array.from(passages.keys()).sort(compareNoteKeys);
  const descriptionsFile: NoteProductDescriptionsFile = {
    htsEdition: edition,
    sourceUrl,
    generatedAt: file.generatedAt,
    counts: Object.fromEntries([
      ...noteKeys.map((k): [string, number] => [k, passages.get(k)!.descriptions.length]),
      ...Array.from(new Set(note31Descriptions.map((d) => d.note))).map((k): [string, number] => [k, note31Descriptions.filter((d) => d.note === k).length]),
    ]),
    passages: Object.fromEntries(noteKeys.map((k) => [k, passages.get(k)!.passage])),
    wholeLines: Object.fromEntries(
      Array.from(wholeLines.keys())
        .sort(compareNoteKeys)
        .map((k) => [k, wholeLines.get(k)!])
    ),
    descriptions: [
      ...noteKeys.flatMap((k) =>
        [...passages.get(k)!.descriptions].sort((a, b) => a.codePrefix.localeCompare(b.codePrefix) || a.id.localeCompare(b.id, 'en', { numeric: true }))
      ),
      ...note31Descriptions,
    ],
  };
  writeFileSync(descriptionsOut, formatDescriptionsLikePrettier(descriptionsFile));
  console.log('\nNamed-product descriptions ("the following particular articles"):');
  for (const k of noteKeys) {
    const p = passages.get(k)!;
    console.log(
      `  ${k.padEnd(14)} ${String(p.descriptions.length).padStart(3)}  ${p.passage.reliefHeading} lifts ${
        p.passage.dutyHeadings.length > 2
          ? `${p.passage.dutyHeadings[0]}–${p.passage.dutyHeadings[p.passage.dutyHeadings.length - 1]}`
          : p.passage.dutyHeadings.join(', ')
      }${p.passage.productOf ? ` (product of ${p.passage.productOf})` : ''}`
    );
  }
  for (const [k, codes] of Object.entries(descriptionsFile.wholeLines))
    console.log(`  ${k.padEnd(14)} ${String(codes.length).padStart(3)}  whole 10-digit lines (no description)`);
  for (const d of note31Descriptions) console.log(`  ${d.note.padEnd(14)}   1  ${d.codePrefix}: duty conditioned on the description`);
  console.log(`  total ${descriptionsFile.descriptions.length}; wrote ${path.relative(process.cwd(), descriptionsOut)}`);

  if (problems.length > 0) {
    console.warn(`\n${problems.length} item(s) to review:`);
    for (const p of problems) console.warn(`  - ${p}`);
  }
  console.log(`\nWrote ${path.relative(process.cwd(), out)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
