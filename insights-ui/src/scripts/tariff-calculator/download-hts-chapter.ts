/**
 * Download Harmonized Tariff Schedule (HTSUS) data per chapter from the
 * official USITC REST endpoint and emit a normalized, hierarchical JSON
 * file for each chapter.
 *
 * Upstream API
 * ------------
 *   https://hts.usitc.gov/reststop/exportList?from=<startCode>&to=<endCode>&format=JSON&styles=true
 *
 * The endpoint returns a *flat* array of rows. Hierarchy is implicit: each
 * row carries a string `indent` (0..6), and a row at indent N is a child of
 * the most recent row at indent N-1. Header rows (group/subgroup labels)
 * have an empty `htsno` and exist only to nest the rows below them.
 *
 * What "normalized" means here
 * ----------------------------
 * 1. Convert the flat list into a tree using the indent levels.
 * 2. Convert string fields like indent to numbers, normalize empty strings
 *    to `null`, drop the upstream typo field `addiitionalDuties`.
 * 3. Prune dead branches:
 *      - A node is "empty" when it carries no useful data of its own (no
 *        htsno, no rates, no units, no quotaQuantity, no additionalDuties)
 *        AND every descendant under it is also empty.
 *      - Empty nodes are dropped from their parent's children array.
 *      - If after pruning a parent ends up with zero children, its
 *        `children` is set to `null` rather than an empty array, so callers
 *        can tell "leaf" apart from "had children, all dead".
 *      - If the parent itself is empty *and* would now have null children,
 *        the parent is pruned too. This bubbles upward.
 *
 *    Rationale: the USITC export occasionally contains placeholder heading
 *    rows whose entire subtree carries no rates, no units, and no leaf HTS
 *    numbers. Those headings don't add any tariff information and just
 *    bloat the output, so we drop them.
 *
 * Usage
 * -----
 *   tsx src/scripts/tariff-calculator/download-hts-chapter.ts            # all chapters 1..99
 *   tsx src/scripts/tariff-calculator/download-hts-chapter.ts 1          # just chapter 1
 *   tsx src/scripts/tariff-calculator/download-hts-chapter.ts 1 2 3      # specific chapters
 *   tsx src/scripts/tariff-calculator/download-hts-chapter.ts 1-5        # a range
 *
 * Output goes to `insights-ui/data/hts-chapters/chapter-NN.json`.
 */

import { mkdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';

// Shape of a single row as the USITC API returns it. All values are
// optional/loose because the API is loose — empty strings, nulls, and
// missing fields all show up.
interface RawHtsRow {
  htsno?: string | null;
  indent?: string | null;
  description?: string | null;
  superior?: string | null;
  units?: string[] | null;
  general?: string | null;
  special?: string | null;
  other?: string | null;
  footnotes?: Array<{ columns?: string[]; value?: string; type?: string }> | null;
  quotaQuantity?: string | null;
  additionalDuties?: string | null;
  // The upstream API has both `additionalDuties` and a misspelled
  // `addiitionalDuties` field. Carry it on the input type so we can ignore
  // it explicitly during normalization.
  addiitionalDuties?: string | null;
}

interface Footnote {
  columns: string[];
  value: string;
  type: string;
}

// Normalized tree node we emit. Strings that came back as "" upstream are
// stored as null so consumers don't have to distinguish "absent" from
// "empty string".
export interface HtsNode {
  htsno: string | null;
  indent: number;
  description: string;
  superior: boolean;
  units: string[];
  general: string | null;
  special: string | null;
  other: string | null;
  footnotes: Footnote[];
  quotaQuantity: string | null;
  additionalDuties: string | null;
  // null when this node has no surviving children after pruning. An empty
  // array is never emitted — see file header for why.
  children: HtsNode[] | null;
}

const OUTPUT_DIR = resolve(process.cwd(), 'data/hts-chapters');

// Build the upstream URL for a given chapter. The API takes 4-digit
// boundaries, so chapter N corresponds to from=NN01..to=NN99.
function buildChapterUrl(chapter: number): string {
  const padded = chapter.toString().padStart(2, '0');
  const from = `${padded}01`;
  const to = `${padded}99`;
  return `https://hts.usitc.gov/reststop/exportList?from=${from}&to=${to}&format=JSON&styles=true`;
}

// Normalize a string field: trim it, and treat empty as null so
// downstream consumers can rely on `=== null` checks.
function nullIfEmpty(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

// Convert the upstream's loose footnote shape to a strict one. Footnotes
// without a value are useless and dropped.
function normalizeFootnotes(raw: RawHtsRow['footnotes']): Footnote[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f) => ({
      columns: Array.isArray(f.columns) ? f.columns.filter((c): c is string => typeof c === 'string') : [],
      value: typeof f.value === 'string' ? f.value.trim() : '',
      type: typeof f.type === 'string' ? f.type : '',
    }))
    .filter((f) => f.value.length > 0);
}

// Convert a single raw row into our normalized shape. Children get
// attached later when we build the tree.
function toNode(raw: RawHtsRow): HtsNode {
  const indent = Number.parseInt(raw.indent ?? '0', 10) || 0;
  return {
    htsno: nullIfEmpty(raw.htsno),
    indent,
    description: (raw.description ?? '').trim(),
    superior: raw.superior === 'true',
    units: Array.isArray(raw.units) ? raw.units.filter((u): u is string => typeof u === 'string' && u.trim().length > 0) : [],
    general: nullIfEmpty(raw.general),
    special: nullIfEmpty(raw.special),
    other: nullIfEmpty(raw.other),
    footnotes: normalizeFootnotes(raw.footnotes),
    quotaQuantity: nullIfEmpty(raw.quotaQuantity),
    additionalDuties: nullIfEmpty(raw.additionalDuties),
    children: null,
  };
}

// Build the tree from a flat list using the indent levels. We walk the
// rows in order, keeping a stack where the top of the stack is the
// current ancestor at indent N. When we see a row at indent M:
//   - pop entries until the top of the stack is the row at indent M-1
//     (or empty for top-level rows at indent 0)
//   - attach the new row as a child of that parent
//   - push the new row so its own children can attach in later iterations
function buildTree(rows: RawHtsRow[]): HtsNode[] {
  const roots: HtsNode[] = [];
  // Stack of `[indent, node]` pairs. Indent strictly increases up the stack.
  const stack: HtsNode[] = [];

  for (const raw of rows) {
    const node = toNode(raw);

    // Find the parent by popping anything at >= node.indent. After this
    // loop, stack top (if any) is the parent.
    while (stack.length > 0 && stack[stack.length - 1].indent >= node.indent) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      const parent = stack[stack.length - 1];
      if (parent.children === null) parent.children = [];
      parent.children.push(node);
    }

    stack.push(node);
  }

  return roots;
}

// A node is "self-empty" when it carries no tariff-relevant data of its
// own. Description alone doesn't count — heading-only rows (e.g.
// "Horses:") are pure structural labels and add no real value if the
// rows under them carry nothing either.
function isSelfEmpty(node: HtsNode): boolean {
  return (
    node.htsno === null &&
    node.units.length === 0 &&
    node.general === null &&
    node.special === null &&
    node.other === null &&
    node.quotaQuantity === null &&
    node.additionalDuties === null &&
    node.footnotes.length === 0
  );
}

// Recursively prune empty subtrees. Returns the pruned node, or null if
// the entire subtree (this node + all descendants) carries no useful
// data and should be dropped from the parent's children.
function prune(node: HtsNode): HtsNode | null {
  // Prune children first so we know whether anything survived below.
  if (node.children !== null) {
    const survivors = node.children.map(prune).filter((n): n is HtsNode => n !== null);
    node.children = survivors.length > 0 ? survivors : null;
  }

  // If this node has no useful data of its own AND no surviving
  // children, drop it entirely. This bubbles up so a chain of empty
  // wrappers collapses to nothing.
  if (isSelfEmpty(node) && node.children === null) {
    return null;
  }

  return node;
}

// Top-level normalize: build the tree, then prune dead branches.
function normalize(rows: RawHtsRow[]): HtsNode[] {
  const tree = buildTree(rows);
  return tree.map(prune).filter((n): n is HtsNode => n !== null);
}

// Count nodes in a forest, used for the after-pruning summary.
function countNodes(forest: HtsNode[]): number {
  let total = 0;
  const stack = [...forest];
  while (stack.length > 0) {
    const node = stack.pop()!;
    total += 1;
    if (node.children !== null) stack.push(...node.children);
  }
  return total;
}

async function fetchChapter(chapter: number): Promise<RawHtsRow[]> {
  const url = buildChapterUrl(chapter);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`HTS API returned HTTP ${res.status} for chapter ${chapter} (${url})`);
  }
  const json = (await res.json()) as RawHtsRow[];
  if (!Array.isArray(json)) {
    throw new Error(`HTS API returned a non-array response for chapter ${chapter}`);
  }
  return json;
}

async function downloadChapter(chapter: number): Promise<{ chapter: number; rawRows: number; nodes: number }> {
  const raw = await fetchChapter(chapter);
  const tree = normalize(raw);

  const padded = chapter.toString().padStart(2, '0');
  const outPath = resolve(OUTPUT_DIR, `chapter-${padded}.json`);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify({ chapter, fetchedAt: new Date().toISOString(), tree }, null, 2), 'utf8');

  return { chapter, rawRows: raw.length, nodes: countNodes(tree) };
}

// Parse "1", "1 2 3", or "1-5" into a list of chapter numbers. With no
// args, return all chapters 1..99.
function parseChapterArgs(args: string[]): number[] {
  if (args.length === 0) {
    return Array.from({ length: 99 }, (_, i) => i + 1);
  }
  const result = new Set<number>();
  for (const arg of args) {
    const rangeMatch = /^(\d{1,2})-(\d{1,2})$/.exec(arg);
    if (rangeMatch) {
      const start = Number.parseInt(rangeMatch[1], 10);
      const end = Number.parseInt(rangeMatch[2], 10);
      if (start < 1 || end > 99 || start > end) throw new Error(`Bad chapter range: ${arg}`);
      for (let n = start; n <= end; n++) result.add(n);
      continue;
    }
    const single = Number.parseInt(arg, 10);
    if (!Number.isFinite(single) || single < 1 || single > 99) {
      throw new Error(`Bad chapter argument: ${arg} (must be 1..99 or N-M)`);
    }
    result.add(single);
  }
  return [...result].sort((a, b) => a - b);
}

async function main(): Promise<void> {
  const chapters = parseChapterArgs(process.argv.slice(2));
  console.log(`Downloading ${chapters.length} chapter(s) → ${OUTPUT_DIR}`);

  for (const chapter of chapters) {
    try {
      const { rawRows, nodes } = await downloadChapter(chapter);
      const padded = chapter.toString().padStart(2, '0');
      console.log(`  chapter ${padded}: ${rawRows} raw rows → ${nodes} nodes after prune`);
    } catch (err) {
      console.error(`  chapter ${chapter}: FAILED — ${(err as Error).message}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
