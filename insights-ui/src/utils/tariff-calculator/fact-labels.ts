import { loadConfirmationFacts } from './confirmation-facts';

// Readable phrases for confirmation-fact answers (issue #1812), shared by the chapter generator, which labels matrix-cell
// variants with them ("29% car or light-truck part or truck or bus part / 16.5% not a vehicle part"), and the chapter
// validator, which maps each label back to the fact answers and re-prices the cell with the engine.
//
// Each fact's own phrases are its `shortLabel` in src/tariff-data/calculator/confirmation-facts.json; the phrases below
// stand for answers to two facts together, where reading the two answers one by one would be clumsy.

/** Variant labels must read as lowercase words: the label pattern parseRateVariants (shipment-duty.ts) accepts. */
export const VARIANT_LABEL_PATTERN = /^[a-z][a-z ,-]*$/;

/** Answers to confirmation facts, by fact id. */
export type FactAnswers = Record<string, boolean>;

export interface FactPhrase {
  label: string;
  /** The answers the phrase stands for. */
  facts: FactAnswers;
}

/**
 * Phrases for two answers together. The truck question only matters for an article that isn't a passenger-vehicle part
 * (heading 9903.74.08 excludes those), and the quartz quota only for a quartz surface product (note 41).
 */
const COMBINED_FACT_PHRASES: FactPhrase[] = [
  { label: 'car or light-truck part', facts: { passengerVehiclePart: true, mediumHeavyVehiclePart: false } },
  { label: 'truck or bus part', facts: { passengerVehiclePart: false, mediumHeavyVehiclePart: true } },
  { label: 'not a vehicle part', facts: { passengerVehiclePart: false, mediumHeavyVehiclePart: false } },
  { label: 'quartz surface product within quota', facts: { quartzSurfaceProduct: true, quartzOverQuota: false } },
  { label: 'quartz surface product over quota', facts: { quartzSurfaceProduct: true, quartzOverQuota: true } },
  { label: 'other footwear with a leather upper', facts: { jpFootwearExcepted: false, jpFootwearUpperPartlyLeather: true } },
];

/** "noMetalContent" → "no metal content" (a fact without a `shortLabel`). */
function words(id: string): string {
  return id
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/[^a-z ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The phrase for one answer to one fact: its `shortLabel`, else its id in words ("no metal content" / "not no metal content"). */
export function factAnswerPhrase(id: string, answer: boolean): string {
  const fact = loadConfirmationFacts().find((f) => f.id === id);
  const own = fact?.shortLabel ? (answer ? fact.shortLabel.yes : fact.shortLabel.no) : null;
  if (own && VARIANT_LABEL_PATTERN.test(own)) return own;
  return answer ? words(id) : `not ${words(id)}`;
}

let phraseCache: FactPhrase[] | null = null;

/** Every phrase: the two-fact phrases first, then one per answer of each registered fact. */
export function factPhrases(): FactPhrase[] {
  if (!phraseCache) {
    const singles: FactPhrase[] = [];
    for (const f of loadConfirmationFacts()) {
      for (const answer of [true, false]) singles.push({ label: factAnswerPhrase(f.id, answer), facts: { [f.id]: answer } });
    }
    phraseCache = [...COMBINED_FACT_PHRASES, ...singles];
  }
  return phraseCache;
}

function matches(phrase: FactAnswers, cube: FactAnswers): boolean {
  return Object.entries(phrase).every(([f, v]) => f in cube && cube[f] === v);
}

/** One set of answers in words: "truck or bus part", "quartz surface product within quota", "informational materials". */
export function describeFactCube(cube: FactAnswers): string {
  const keys = Object.keys(cube);
  const phrases = [...factPhrases(), ...keys.flatMap((f) => [true, false].map((a) => ({ label: factAnswerPhrase(f, a), facts: { [f]: a } })))];
  const covered = new Set<string>();
  const used: FactPhrase[] = [];
  while (covered.size < keys.length) {
    let best: FactPhrase | null = null;
    let bestGain = 0;
    for (const p of phrases) {
      if (!matches(p.facts, cube)) continue;
      const gain = Object.keys(p.facts).filter((f) => !covered.has(f)).length;
      if (gain > bestGain) {
        best = p;
        bestGain = gain;
      }
    }
    if (!best) break;
    used.push(best);
    for (const f of Object.keys(best.facts)) covered.add(f);
  }
  const firstIndex = (p: FactPhrase): number => Math.min(...Object.keys(p.facts).map((f) => keys.indexOf(f)));
  return used
    .sort((a, b) => firstIndex(a) - firstIndex(b))
    .map((p) => p.label)
    .join(', ');
}

function popcount(n: number): number {
  let c = 0;
  for (let x = n; x; x &= x - 1) c++;
  return c;
}

/**
 * The answers in `group` in words, as the fewest "or"-joined phrases: the group's answer sets are merged into the
 * largest blocks of answers that all price the same (answer sets that were not priced count as either). Null when the
 * answers don't matter (the group holds every priced answer set).
 *
 *   facts [passengerVehiclePart, mediumHeavyVehiclePart], group {yes,no} {yes,yes} {no,yes} → "car or light-truck part or truck or bus part"
 */
export function describeFactAnswers(group: FactAnswers[], priced: FactAnswers[], facts: string[]): string | null {
  const n = facts.length;
  if (n === 0 || group.length === 0) return null;
  const mask = (a: FactAnswers): number => facts.reduce((m, f, i) => (a[f] ? m | (1 << i) : m), 0);
  const order = group.map(mask);
  const inGroup = new Set(order);
  const pricedSet = new Set(priced.map(mask));
  const allowed = (m: number): boolean => inGroup.has(m) || !pricedSet.has(m);
  interface Cube {
    care: number;
    value: number;
    minterms: number[];
  }
  const cubes: Cube[] = [];
  for (let care = 0; care < 1 << n; care++) {
    for (let value = 0; value < 1 << n; value++) {
      if ((value & ~care) !== 0) continue;
      const minterms: number[] = [];
      for (let m = 0; m < 1 << n; m++) if ((m & care) === value) minterms.push(m);
      if (minterms.every(allowed) && minterms.some((m) => inGroup.has(m))) cubes.push({ care, value, minterms });
    }
  }
  // Prime blocks: not inside a larger valid block.
  const primes = cubes.filter((c) => !cubes.some((o) => o.care !== c.care && (o.care & c.care) === o.care && (c.value & o.care) === o.value));
  const uncovered = new Set(inGroup);
  const chosen: Cube[] = [];
  while (uncovered.size > 0) {
    let best: Cube | null = null;
    let bestN = 0;
    for (const p of primes) {
      const k = p.minterms.filter((m) => uncovered.has(m)).length;
      if (k > bestN || (k === bestN && best && popcount(p.care) < popcount(best.care))) {
        best = p;
        bestN = k;
      }
    }
    if (!best) break;
    chosen.push(best);
    for (const m of best.minterms) uncovered.delete(m);
  }
  if (chosen.some((c) => c.care === 0)) return null;
  const firstInGroup = (c: Cube): number => Math.min(...c.minterms.map((m) => order.indexOf(m)).filter((i) => i >= 0));
  return chosen
    .sort((a, b) => firstInGroup(a) - firstInGroup(b))
    .map((c) => describeFactCube(Object.fromEntries(facts.flatMap((f, i) => (c.care & (1 << i) ? [[f, Boolean(c.value & (1 << i))]] : [])))))
    .join(' or ');
}

/** What a phrase can stand for, most specific first ("truck or bus part" → {passenger no, truck yes}, then {truck yes}). */
export function factPhraseMeanings(label: string): FactAnswers[] {
  return factPhrases()
    .filter((p) => p.label === label)
    .map((p) => p.facts)
    .sort((a, b) => Object.keys(b).length - Object.keys(a).length);
}

/**
 * The answers a list of phrases joined by ", " stands for (one block of a label), or null when they contradict each
 * other. Each phrase takes its most specific meaning that agrees with the others.
 */
export function resolveFactPhrases(labels: string[]): FactAnswers | null {
  const options = labels.map(factPhraseMeanings);
  if (options.some((o) => o.length === 0)) return null;
  const pick = (i: number, acc: FactAnswers): FactAnswers | null => {
    if (i === options.length) return acc;
    for (const meaning of options[i]) {
      if (Object.entries(meaning).some(([f, v]) => f in acc && acc[f] !== v)) continue;
      const done = pick(i + 1, { ...acc, ...meaning });
      if (done) return done;
    }
    return null;
  };
  return pick(0, {});
}

export const LABEL_SEPARATORS = [', ', ' or ', ' '] as const;

/**
 * Splits a variant label into known phrases (longest first) and the separators between them; null when it can't.
 * `sep` is the separator before the phrase ('' for the first).
 */
export function tokenizeLabel(label: string, vocabulary: readonly string[]): { text: string; sep: string }[] | null {
  const vocab = Array.from(new Set(vocabulary)).sort((a, b) => b.length - a.length);
  const go = (pos: number, sep: string): { text: string; sep: string }[] | null => {
    for (const v of vocab) {
      if (!label.startsWith(v, pos)) continue;
      const end = pos + v.length;
      if (end === label.length) return [{ text: v, sep }];
      for (const s of LABEL_SEPARATORS) {
        if (!label.startsWith(s, end)) continue;
        const rest = go(end + s.length, s);
        if (rest) return [{ text: v, sep }, ...rest];
      }
    }
    return null;
  };
  return label ? go(0, '') : null;
}
