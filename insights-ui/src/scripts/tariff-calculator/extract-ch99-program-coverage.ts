import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadHtsSource, parseCliArgs, stringArg } from './lib/hts-source';
import { editionByChapter } from './lib/hts-lines-sync';
import { extractListCodes, PROGRAM_COVERAGE_FILE, type ProgramCoverageFile } from './lib/calc-readiness';

/**
 * Program coverage for the calculator readiness check (issue #1794): what the readiness check needs from the official
 * schedule beyond `ch99-headings.json` and `note-coverage.json`, extracted once and committed so CI runs offline.
 *
 *   1. `notes` — the HTS codes listed in the Chapter 99 U.S. notes that the Section 232 / Section 338 / safeguard /
 *      Russia headings cite (notes 16, 19, 29, 30, 33, 37, 38, 39, 41, 43, 51; plus 20, 31 and 40, unioned with
 *      note-coverage.json at check time). Unlike note-coverage.json it also reads 4-digit headings printed run together
 *      in the lists ("7606760576047601" = 7606, 7605, 7604, 7601 in note 16(c)(i)).
 *   2. `expiredHeadings` — headings the Chapter 99 PDF shades as expired ("The shaded areas indicate the provision has
 *      expired"). The text has no trace of the shading, so it is read from the PDF drawing (yellow filled rectangles
 *      behind the heading number) with Python + pdfplumber.
 *   3. `chapterLines` — every 10-digit HTS line per chapter (01–97) of the HTS JSON edition, so the check can count the
 *      lines a program reaches without a database.
 *
 *   pnpm tsx src/scripts/tariff-calculator/extract-ch99-program-coverage.ts \
 *     --pdf /tmp/ch99.pdf --hts-file ~/Downloads/hts_2026_revision_21_json.json --python /path/to/venv/bin/python
 *   (no --pdf: downloads the Chapter 99 PDF of --release; no --hts-file: downloads the --edition JSON from usitc.gov)
 *
 * Needs a Python with `pypdf` (text) and `pdfplumber` (shading): `python3 -m venv v && v/bin/pip install pypdf pdfplumber`.
 * `--text <file>` reuses an already extracted text; `--keep-shading` keeps the committed `expiredHeadings` instead of
 * reading the PDF drawing (then pdfplumber isn't needed).
 */

const DEFAULT_RELEASE = '2026HTSRev21';
const DEFAULT_EDITION = '2026 Revision 21';
const NOTES = ['16', '19', '20', '29', '30', '31', '33', '37', '38', '39', '40', '41', '43', '51'];
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

function chapter99PdfUrl(release: string): string {
  return `https://hts.usitc.gov/reststop/file?release=${encodeURIComponent(release)}&filename=${encodeURIComponent('Chapter 99')}`;
}

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
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error(`Could not download ${url}: ${String(lastError)}`);
}

const PYPDF_SNIPPET = [
  'import sys',
  'from pypdf import PdfReader',
  'r = PdfReader(sys.argv[1])',
  "sys.stdout.write('\\n'.join((p.extract_text() or '') for p in r.pages))",
].join('\n');

/** Heading numbers in the heading column with a yellow (expired) fill behind them. */
const SHADING_SNIPPET = [
  'import sys, re, json',
  'import pdfplumber',
  'out = set()',
  'with pdfplumber.open(sys.argv[1]) as pdf:',
  '    for p in pdf.pages:',
  "        words = [w for w in p.extract_words() if re.fullmatch(r'(?:\\d/)?9903\\.\\d\\d\\.\\d\\d', w['text']) and w['x0'] < 100]",
  '        if not words: continue',
  "        rects = [r for r in p.rects if r.get('fill') and r.get('non_stroking_color') == (1.0, 1.0, 0.0) and r['bottom'] - r['top'] > 2]",
  '        for w in words:',
  "            if any(r['top'] - 2 <= w['top'] <= r['bottom'] + 2 and r['x0'] - 2 <= w['x0'] <= r['x1'] + 2 for r in rects):",
  "                out.add(w['text'].split('/')[-1])",
  'sys.stdout.write(json.dumps(sorted(out)))',
].join('\n');

function runPython(python: string, snippet: string, pdfPath: string, what: string): string {
  const res = spawnSync(python, ['-c', snippet, pdfPath], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
  if (res.error || res.status !== 0) {
    throw new Error(`${what} failed with ${python}: ${res.error ? String(res.error) : res.stderr.slice(0, 800)}`);
  }
  return res.stdout;
}

// ---------- text → note subdivisions ----------

const NOISE_LINE =
  /^(Harmonized Tariff Schedule of the United States|Annotated for Statistical Reporting Purposes|XXII$|99 ?- ?[IVX]+ ?- ?\d+|=====PAGE|U\.S\. Notes \(con\.\))/;

function subchapterIIINotes(text: string): Map<string, string[]> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '' && !NOISE_LINE.test(l));
  const start = lines.findIndex((l) => /^SUBCHAPTER III$/.test(l));
  const end = lines.findIndex((l, i) => i > start && /^SUBCHAPTER IV$/.test(l));
  if (start < 0 || end < 0) throw new Error('Could not find SUBCHAPTER III / SUBCHAPTER IV in the Chapter 99 text');
  const notes = new Map<string, string[]>();
  let current: string | null = null;
  let currentNum = 0;
  for (const line of lines.slice(start + 1, end)) {
    if (/^(Rates of Duty|Heading\/)/.test(line)) {
      if (currentNum >= 52) break; // headings table after the last note
      continue;
    }
    const m = /^(\d{1,2})\.(?:\s|$)/.exec(line);
    if (m && Number(m[1]) > currentNum && Number(m[1]) <= currentNum + 10) {
      currentNum = Number(m[1]);
      current = m[1];
      notes.set(current, [line.slice(m[0].length)]);
      continue;
    }
    if (current) notes.get(current)!.push(line);
  }
  return notes;
}

type LevelType = 'alpha' | 'roman' | 'num';
const ROMAN = ['', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx'];
const MAX_GAP: Record<LevelType, number> = { alpha: 8, roman: 2, num: 12 };
const LABEL_AT_START = /^\(([a-z]{1,4}|\d{1,3}|[A-Z])\)\s*/;
const CROSS_REFERENCE_REST = /^(and|or|of|through|to|in|is|are|that)\b|^[,;.:–-]/;

function ordinal(type: LevelType, label: string): number {
  if (type === 'num') return /^\d+$/.test(label) ? Number(label) : -1;
  if (type === 'roman') return ROMAN.indexOf(label);
  if (!/^([a-z])\1*$/.test(label)) return -1;
  return (label.length - 1) * 26 + (label.charCodeAt(0) - 96);
}

/** Subdivision key ("16(c)(iv)") → its own text lines, by walking the (a)/(i)/(1) labels like the note-coverage extractor. */
function noteSubdivisionText(noteNum: string, lines: string[]): Map<string, string[]> {
  const stack: { type: LevelType; label: string }[] = [];
  const own = new Map<string, string[]>();
  const keyOf = (): string => noteNum + stack.map((l) => `(${l.label})`).join('');
  const labelsPerLine = lines.map((line) => {
    const labels: string[] = [];
    let rest = line;
    let m: RegExpExecArray | null;
    while ((m = LABEL_AT_START.exec(rest)) !== null && /^[a-z0-9]/.test(m[1])) {
      labels.push(m[1]);
      rest = rest.slice(m[0].length);
    }
    return labels.length > 0 && CROSS_REFERENCE_REST.test(rest) ? { labels: [], rest: line } : { labels, rest };
  });
  const flat: string[] = labelsPerLine.flatMap((t) => t.labels);
  let seen = 0;
  labelsPerLine.forEach((t, lineNo) => {
    let consumed = 0;
    for (const label of t.labels) {
      const next = flat[seen + 1] ?? null;
      seen++;
      const findLevel = (gap: (type: LevelType) => number): number => {
        for (let d = stack.length - 1; d >= 0; d--) {
          const cur = ordinal(stack[d].type, stack[d].label);
          const n = ordinal(stack[d].type, label);
          if (n > cur && n - cur <= gap(stack[d].type)) return d;
        }
        return -1;
      };
      const isFirst = label === 'a' || label === 'i' || label === '1';
      const opensRoman = label === 'i' && next === 'ii';
      let depth = opensRoman ? -1 : findLevel(() => 1);
      if (depth < 0 && !isFirst) depth = findLevel((type) => MAX_GAP[type]);
      if (depth >= 0) {
        stack.length = depth + 1;
        stack[depth] = { type: stack[depth].type, label };
      } else if (isFirst) {
        stack.push({ type: label === 'a' ? 'alpha' : label === 'i' ? 'roman' : 'num', label });
      } else {
        break;
      }
      consumed++;
    }
    const key = keyOf();
    if (!own.has(key)) own.set(key, []);
    own.get(key)!.push(consumed === t.labels.length ? t.rest : lines[lineNo]);
  });
  return own;
}

function formatFile(file: ProgramCoverageFile): string {
  const lines: string[] = ['{'];
  lines.push(`  "htsEdition": ${JSON.stringify(file.htsEdition)},`);
  lines.push(`  "sourceUrl": ${JSON.stringify(file.sourceUrl)},`);
  lines.push(`  "htsJsonUrl": ${JSON.stringify(file.htsJsonUrl)},`);
  lines.push(`  "generatedAt": ${JSON.stringify(file.generatedAt)},`);
  const arr = (indent: string, key: string, values: string[], comma: string): void => {
    const one = `${indent}${JSON.stringify(key)}: [${values.map((v) => JSON.stringify(v)).join(', ')}]${comma}`;
    if (one.length <= 160) {
      lines.push(one);
      return;
    }
    lines.push(`${indent}${JSON.stringify(key)}: [`);
    values.forEach((v, i) => lines.push(`${indent}  ${JSON.stringify(v)}${i < values.length - 1 ? ',' : ''}`));
    lines.push(`${indent}]${comma}`);
  };
  arr('  ', 'expiredHeadings', file.expiredHeadings, ',');
  lines.push('  "notes": {');
  const notes = Object.entries(file.notes);
  notes.forEach(([k, v], i) => arr('    ', k, v, i < notes.length - 1 ? ',' : ''));
  lines.push('  },');
  lines.push('  "chapterLines": {');
  const chapters = Object.entries(file.chapterLines);
  chapters.forEach(([k, v], i) => lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)}${i < chapters.length - 1 ? ',' : ''}`));
  lines.push('  }', '}');
  return lines.join('\n') + '\n';
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const release = stringArg(args, 'release') ?? DEFAULT_RELEASE;
  const edition = stringArg(args, 'edition') ?? DEFAULT_EDITION;
  const python = stringArg(args, 'python') ?? 'python3';
  const out = path.resolve(stringArg(args, 'out') ?? PROGRAM_COVERAGE_FILE);
  const keepShading = args['keep-shading'] === true;
  const sourceUrl = chapter99PdfUrl(release);

  let pdfPath = stringArg(args, 'pdf');
  const textPath = stringArg(args, 'text');
  if (!pdfPath && (!textPath || !keepShading)) {
    const dir = path.join(os.tmpdir(), 'koala-tariff-ch99');
    mkdirSync(dir, { recursive: true });
    pdfPath = path.join(dir, `${release}-chapter-99.pdf`);
    if (!existsSync(pdfPath)) {
      console.log(`Downloading ${sourceUrl}`);
      await downloadPdf(sourceUrl, pdfPath);
    }
  }

  const text = textPath ? readFileSync(textPath, 'utf8') : runPython(python, PYPDF_SNIPPET, pdfPath!, 'PDF text extraction (pypdf)');
  if (!text.includes(edition.replace(/^(\d{4}) Revision (\d+)$/, 'Revision $2 ($1)'))) {
    console.warn(`WARNING: the text does not mention "${edition}" in its page footers; check --release / --edition.`);
  }

  // 1. Note code lists.
  const notesText = subchapterIIINotes(text);
  const notes: Record<string, string[]> = {};
  const problems: string[] = [];
  for (const num of NOTES) {
    const lines = notesText.get(num);
    if (!lines) {
      problems.push(`note ${num}: not found in subchapter III`);
      continue;
    }
    for (const [key, texts] of noteSubdivisionText(num, lines)) {
      const { codes, problems: p } = extractListCodes(texts.join('\n'));
      problems.push(...p.map((x) => `${key}: ${x}`));
      if (codes.length > 0) notes[key] = Array.from(new Set(codes)).sort();
    }
  }
  const sortedNotes = Object.fromEntries(Object.entries(notes).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })));

  // 2. Expired (shaded) headings.
  let expiredHeadings: string[];
  if (keepShading) {
    if (!existsSync(out)) throw new Error(`--keep-shading needs an existing ${out}`);
    expiredHeadings = (JSON.parse(readFileSync(out, 'utf8')) as ProgramCoverageFile).expiredHeadings;
  } else {
    console.log('Reading the expired-provision shading from the PDF (pdfplumber, ~1 min)');
    expiredHeadings = JSON.parse(runPython(python, SHADING_SNIPPET, pdfPath!, 'PDF shading (pdfplumber)')) as string[];
  }

  // 3. HTS lines per chapter.
  const hts = await loadHtsSource({ file: stringArg(args, 'hts-file'), edition });
  if (hts.edition !== edition) console.warn(`WARNING: HTS JSON edition ${hts.edition} differs from --edition ${edition}`);
  const chapterLines: Record<string, string> = {};
  for (const [chapter, lines] of Array.from(editionByChapter(hts.rows)).sort((a, b) => a[0] - b[0])) {
    if (chapter > 97) continue;
    const codes = Array.from(new Set(lines.map((l) => l.htsCode10).filter((c): c is string => c !== null))).sort();
    if (codes.length > 0) chapterLines[String(chapter).padStart(2, '0')] = codes.join(' ');
  }

  const file: ProgramCoverageFile = {
    htsEdition: edition,
    sourceUrl,
    htsJsonUrl: hts.sourceUrl,
    generatedAt: new Date().toISOString(),
    expiredHeadings,
    notes: sortedNotes,
    chapterLines,
  };
  writeFileSync(out, formatFile(file));

  for (const [key, codes] of Object.entries(sortedNotes)) if (!/\(\d+\)$/.test(key)) console.log(`  ${key.padEnd(16)} ${codes.length} code(s)`);
  console.log(`${expiredHeadings.length} expired (shaded) heading(s); ${Object.keys(chapterLines).length} chapters of HTS lines`);
  if (problems.length > 0) {
    console.warn(`\n${problems.length} item(s) to review:`);
    for (const p of problems) console.warn(`  - ${p}`);
  }
  console.log(`Wrote ${path.relative(process.cwd(), out)}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
