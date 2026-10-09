// Parsers that turn one HTS Chapter 99 row (9903.xx.xx) into a Ch99HeadingRecord:
// rate kind + percent from the `general` column, and the countries / excepted headings / U.S. note
// references named in the description. Pure functions so they can be unit-tested.

import { COUNTRY_OPTIONS } from '@/utils/tariff-calculator/countries';
import type { Ch99HeadingRecord } from '@/types/tariff-calculator-measures';

// ---------------------------------------------------------------------------
// Rate
// ---------------------------------------------------------------------------

const BASE_PHRASE = 'the duty provided in the applicable subheading';

/**
 * "The duty provided in the applicable subheading + 25%" → additive 25
 * "10%"                                                → flat 10 (in place of the base rate)
 * "Free"                                               → flat 0
 * "The duty provided in the applicable subheading"     → relief (base rate only)
 * "No change"                                          → relief (no extra duty)
 * anything else (blank, specific rates such as "+ a duty of 2.4¢/kg", duties on the non-U.S. content only) → unknown
 */
export function parseCh99Rate(general: string | null): Pick<Ch99HeadingRecord, 'rateKind' | 'ratePct'> {
  const lower = (general ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '')
    .toLowerCase()
    .replace(/provided inthe/, 'provided in the') // typo in 9903.89.55
    .replace(/\s*\bplus\b\s*/, ' + ');
  if (lower.startsWith(BASE_PHRASE)) {
    const rest = lower.slice(BASE_PHRASE.length).trim();
    if (rest === '') return { rateKind: 'relief', ratePct: null };
    // "+ 25%", "+25%", "+ a duty of 25%" (not "+ a duty of 25% upon the value of the non-U.S. content": that is not on the full value)
    const add = /^\+\s*(?:a duty of\s+)?(\d+(?:\.\d+)?)\s*%$/.exec(rest);
    if (add) return { rateKind: 'additive', ratePct: Number(add[1]) };
    return { rateKind: 'unknown', ratePct: null };
  }
  const flat = /^(\d+(?:\.\d+)?)\s*%$/.exec(lower);
  if (flat) return { rateKind: 'flat', ratePct: Number(flat[1]) };
  if (lower === 'free') return { rateKind: 'flat', ratePct: 0 };
  if (lower === 'no change') return { rateKind: 'relief', ratePct: null };
  return { rateKind: 'unknown', ratePct: null };
}

// ---------------------------------------------------------------------------
// Countries
// ---------------------------------------------------------------------------

export const EU_MEMBER_CODES: readonly string[] = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
];

const EU_TOKEN = 'EU';

/** Names the HTS uses that differ from the calculator's country list. Value "EU" = the 27 member states. */
const NAME_ALIASES: Record<string, string> = {
  'European Union': EU_TOKEN,
  'Democratic Republic of the Congo': 'CD',
  'Republic of the Congo': 'CG',
  'Hong Kong, China': 'HK',
  Macau: 'MO',
  Burma: 'MM',
  Turkey: 'TR',
  Türkiye: 'TR',
  "Cote d'Ivoire": 'CI',
  'Côte d`Ivoire': 'CI',
  'Côte d’Ivoire': 'CI',
  'Republic of Korea': 'KR',
  Korea: 'KR',
  'Czech Republic': 'CZ',
  'Cape Verde': 'CV',
  Swaziland: 'SZ',
  'United Kingdom of Great Britain and Northern Ireland': 'GB',
  'Great Britain': 'GB',
  'Vatican City State': 'VA',
  'Holy See': 'VA',
  'Russian Federation': 'RU',
};

/** A parenthesised base name that is ambiguous on its own (two Congos) is only matched by its full alias. */
const AMBIGUOUS_BASE_NAMES = new Set(['Congo']);

interface CountryPattern {
  name: string;
  code: string;
  re: RegExp;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildCountryPatterns(): CountryPattern[] {
  const names = new Map<string, string>();
  for (const { code, name } of COUNTRY_OPTIONS) {
    // "Myanmar (Burma)" → "Myanmar" + "Burma"; "Congo (Kinshasa)" → (ambiguous, alias only)
    const m = /^(.*?)\s*\((.*)\)$/.exec(name);
    const base = m ? m[1] : name;
    if (!AMBIGUOUS_BASE_NAMES.has(base)) names.set(base, code);
    if (m && !/^(Kinshasa|Brazzaville)$/.test(m[2])) names.set(m[2], code);
  }
  for (const [name, code] of Object.entries(NAME_ALIASES)) names.set(name, code);
  // Longest first, so "Papua New Guinea" wins over "Guinea" and "Hong Kong, China" over "China".
  return [...names.entries()]
    .sort((a, b) => b[0].length - a[0].length || a[0].localeCompare(b[0]))
    .map(([name, code]) => ({ name, code, re: new RegExp(`(^|[^\\p{L}])${escapeRegExp(name)}(?![\\p{L}])`, 'gu') }));
}

let countryPatterns: CountryPattern[] | null = null;

/**
 * ISO2 codes of every country the description names ("the product of Brazil" → BR,
 * "a member state of the European Union" → the 27 members, "China and Hong Kong" → CN, HK).
 * The United States is never returned (COUNTRY_OPTIONS leaves it out): it shows up only as
 * "the jurisdiction of the United States" / "a product of the United States", not as an origin a duty targets.
 */
export function parseCh99Countries(description: string): string[] {
  countryPatterns ??= buildCountryPatterns();
  let text = description.replace(/\s+/g, ' ');
  const found = new Set<string>();
  for (const p of countryPatterns) {
    text = text.replace(p.re, (_match, lead: string) => {
      if (p.code === EU_TOKEN) EU_MEMBER_CODES.forEach((c) => found.add(c));
      else found.add(p.code);
      // Blank the match so a shorter name inside it ("China" in "Hong Kong, China") is not counted again.
      return lead + ' '.repeat(p.name.length);
    });
  }
  return [...found].sort();
}

// ---------------------------------------------------------------------------
// Excepted headings
// ---------------------------------------------------------------------------

const CODE = '9903\\.\\d{2}\\.\\d{2}';
const RANGE_SEP = '\\s*(?:-|–|—|through)\\s*';

/** "9903.05.85" … "9903.05.92" → every code in between (same 9903.xx); across groups → each group's codes up to .99. */
export function expandCh99Range(from: string, to: string): string[] {
  const [fa, fb, fc] = from.split('.').map(Number);
  const [, tb, tc] = to.split('.').map(Number);
  if (fa !== 9903 || tb < fb || (tb === fb && tc < fc)) return [from, to];
  const out: string[] = [];
  for (let group = fb; group <= tb; group++) {
    const start = group === fb ? fc : 1;
    const end = group === tb ? tc : 99;
    for (let n = start; n <= end; n++) out.push(`9903.${String(group).padStart(2, '0')}.${String(n).padStart(2, '0')}`);
  }
  return out;
}

/**
 * Headings named after "Except for products described in headings …", "except as provided for in headings …",
 * "Except as provided in heading …" (several clauses per description are common), ranges expanded.
 */
export function parseCh99ExceptCodes(description: string): string[] {
  const text = description.replace(/\s+/g, ' ').replace(/,/g, ' , ');
  const out = new Set<string>();
  // After each "except", read only the run of connector words + codes; the first other word ends the clause.
  const clause = new RegExp(
    `\\bexcept(?:\\s+(?:for|as|products|goods|described|provided|in|inheadings|headings?|subheadings?|and|or|,|${CODE}(?:${RANGE_SEP}${CODE})?))+`,
    'gi'
  );
  for (const m of text.matchAll(clause)) {
    const items = new RegExp(`(${CODE})(?:${RANGE_SEP}(${CODE}))?`, 'g');
    for (const it of m[0].matchAll(items)) {
      if (it[2]) expandCh99Range(it[1], it[2]).forEach((c) => out.add(c));
      else out.add(it[1]);
    }
  }
  return [...out].sort();
}

// ---------------------------------------------------------------------------
// U.S. note references
// ---------------------------------------------------------------------------

const PARENS = '(?:\\s?\\([A-Za-z0-9]+\\))*';

function cleanSubdivision(s: string): string {
  return s.replace(/\s+/g, '');
}

/** True when the note just matched belongs to another chapter ("note 1(a) to chapter 4") or is a general/statistical note. */
function isForeignNote(text: string, start: number, end: number): boolean {
  const before = text.slice(Math.max(0, start - 14), start).toLowerCase();
  if (/(general|statistical|compiler['’]s)\s+$/.test(before)) return true;
  return /^\s*(?:to|of)\s+chapter\s+\d/i.test(text.slice(end, end + 20));
}

/**
 * U.S. notes to this subchapter the description points to:
 *   "U.S. note 2(a)"                                 → "2(a)"
 *   "subdivision (v)(iv) of U.S. note 2"             → "2(v)(iv)"
 *   "subdivisions (c) and (d) of U.S. note 40"       → "40(c)", "40(d)"
 *   "subdivisions (v)(vi) through (v)(xvi) of …2"    → "2(v)(vi)–(v)(xvi)"
 *   "U.S. note 52" (with "subdivision (a)" nearby)   → "52" / "52(a)"
 *   "notes 20(f) or 20(g)"                           → "20(f)", "20(g)"
 */
export function parseCh99NoteRefs(description: string): string[] {
  let text = description.replace(/\s+/g, ' ');
  const out: string[] = [];
  const add = (ref: string) => {
    if (!out.includes(ref)) out.push(ref);
  };

  // 1) "subdivision(s) <list> of/to/in [U.S.] note N"
  const subdiv = new RegExp(
    `\\bsubdivisions?\\s+((?:\\([A-Za-z0-9]+\\)|\\s|,|and|or|through|-|–|—)+?)\\s*(?:of|to|in)\\s+(?:the\\s+)?(?:U\\.S\\.\\s+)?note\\s+(\\d+)`,
    'gi'
  );
  text = text.replace(subdiv, (match: string, list: string, note: string, offset: number) => {
    if (isForeignNote(text, offset + match.length - note.length - 'note '.length, offset + match.length)) return match;
    for (const part of list.split(/\s*(?:,|\band\b|\bor\b)\s*/)) {
      const p = part.trim();
      if (!p) continue;
      const range = /^((?:\([A-Za-z0-9]+\))+)\s*(?:through|-|–|—)\s*((?:\([A-Za-z0-9]+\))+)$/.exec(p);
      if (range) add(`${note}${cleanSubdivision(range[1])}–${cleanSubdivision(range[2])}`);
      else if (/^(\([A-Za-z0-9]+\)\s*)+$/.test(p)) add(`${note}${cleanSubdivision(p)}`);
    }
    return ' '.repeat(match.length);
  });

  // 2) "notes 20(f) or 20(g)" / "note 2(a)" / "U.S. note 52"
  const notes = new RegExp(`\\bnotes?\\s+(\\d+${PARENS}(?:\\s*(?:,|and|or)\\s*\\d+${PARENS})*)`, 'gi');
  for (const m of text.matchAll(notes)) {
    const start = m.index ?? 0;
    if (isForeignNote(text, start, start + m[0].length)) continue;
    for (const ref of m[1].split(/\s*(?:,|\band\b|\bor\b)\s*/)) {
      if (ref.trim()) add(cleanSubdivision(ref));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------

export function parseCh99Row(code: string, description: string, general: string | null): Ch99HeadingRecord {
  const desc = description.trim();
  const generalRate = general && general.trim() ? general.trim() : null;
  return {
    code,
    description: desc,
    generalRate,
    ...parseCh99Rate(generalRate),
    countries: parseCh99Countries(desc),
    exceptCodes: parseCh99ExceptCodes(desc).filter((c) => c !== code),
    noteRefs: parseCh99NoteRefs(desc),
  };
}
